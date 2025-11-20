import { useState, useRef, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const VAD_THRESHOLD = 0.03;
const VAD_HANGOVER_MS = 500;

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState('');
    const [duration, setDuration] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [detectedLanguage, setDetectedLanguage] = useState(null);
    const [detectedLanguageName, setDetectedLanguageName] = useState('');

    const socketRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const processorRef = useRef(null);
    const analyserRef = useRef(null);
    const timerRef = useRef(null);
    const audioLevelRef = useRef(null);
    const isRecordingRef = useRef(false);
    const streamingReadyRef = useRef(false);
    const vadLastVoiceRef = useRef(0);

    const processAudioData = useCallback((buffer, floatData = null) => {
        let speaking = false;

        if (floatData) {
            let sumSquares = 0;
            for (let i = 0; i < floatData.length; i++) {
                sumSquares += floatData[i] * floatData[i];
            }
            const rms = Math.sqrt(sumSquares / Math.max(1, floatData.length));
            speaking = rms >= VAD_THRESHOLD;
        } else {
            const int16 = new Int16Array(buffer);
            let sumSquares = 0;
            for (let i = 0; i < int16.length; i++) {
                const s = int16[i] / 32768;
                sumSquares += s * s;
            }
            const rms = Math.sqrt(sumSquares / Math.max(1, int16.length));
            speaking = rms >= VAD_THRESHOLD;
        }

        const now = Date.now();
        if (speaking) vadLastVoiceRef.current = now;
        const withinHangover = (now - vadLastVoiceRef.current) <= VAD_HANGOVER_MS;

        if (speaking || withinHangover) {
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('sarvam-audio-data', buffer);
            }
        }
    }, []);

    const stopRecording = useCallback(() => {
        setIsRecording(false);
        isRecordingRef.current = false;
        streamingReadyRef.current = false;

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (audioLevelRef.current) {
            cancelAnimationFrame(audioLevelRef.current);
            audioLevelRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (processorRef.current) {
            try {
                processorRef.current.disconnect();
            } catch (e) {
                // Ignore disconnect errors
            }
            processorRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('stop-sarvam-streaming');
        }

        setAudioLevel(0);
    }, []);

    const monitorAudioLevel = useCallback(() => {
        if (!analyserRef.current || !isRecordingRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        const updateLevel = () => {
            if (!analyserRef.current || !isRecordingRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((acc, val) => acc + val * val, 0);
            const rms = Math.sqrt(sum / dataArray.length);
            const normalized = Math.min(1, rms / 128);

            setAudioLevel(normalized);
            audioLevelRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
    }, []);

    const startRecording = useCallback(async (selectedLanguage) => {
        setError('');
        setTranscript('');
        setInterimTranscript('');
        setDuration(0);
        setIsConnecting(true);
        streamingReadyRef.current = false;
        setDetectedLanguage(null);
        setDetectedLanguageName('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000
                }
            });

            mediaStreamRef.current = stream;
            setIsRecording(true);
            isRecordingRef.current = true;

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            });

            const source = audioContextRef.current.createMediaStreamSource(stream);
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;
            source.connect(analyser);

            monitorAudioLevel();

            const targetFrames = 800; // 50ms at 16kHz

            try {
                await audioContextRef.current.audioWorklet.addModule('/worklets/pcm-processor.js');
                const workletNode = new AudioWorkletNode(
                    audioContextRef.current,
                    'pcm-processor',
                    { processorOptions: { targetFrames } }
                );
                processorRef.current = workletNode;

                workletNode.port.onmessage = (event) => {
                    if (!isRecordingRef.current || !streamingReadyRef.current) return;
                    if (event.data?.type === 'pcm' && event.data?.buffer) {
                        processAudioData(event.data.buffer);
                    }
                };

                analyser.connect(workletNode);
                workletNode.connect(audioContextRef.current.destination);
            } catch (e) {
                console.warn('AudioWorklet not available, using ScriptProcessor');
                const scriptProcessor = audioContextRef.current.createScriptProcessor(2048, 1, 1);
                processorRef.current = scriptProcessor;

                scriptProcessor.onaudioprocess = (e) => {
                    if (!isRecordingRef.current || !streamingReadyRef.current) return;
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmData = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        const s = Math.max(-1, Math.min(1, inputData[i]));
                        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }
                    processAudioData(pcmData.buffer, inputData);
                };

                analyser.connect(scriptProcessor);
                scriptProcessor.connect(audioContextRef.current.destination);
            }

            socketRef.current.emit('start-sarvam-streaming', { language: selectedLanguage });

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Microphone error:', err);
            setError('Could not access microphone. Please grant permission.');
            setIsRecording(false);
            isRecordingRef.current = false;
            setIsConnecting(false);
        }
    }, [monitorAudioLevel, processAudioData]);

    const clearTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setError('');
        setDuration(0);
        setDetectedLanguage(null);
        setDetectedLanguageName('');
    }, []);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        socketRef.current = io(apiUrl, {
            transports: ['websocket'],
            upgrade: false,
            timeout: 5000,
            perMessageDeflate: false,
            forceNew: false,
            pingTimeout: 10000,
            pingInterval: 25000,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 500,
            reconnectionDelayMax: 2000
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Connected to server');
        });

        socketRef.current.on('sarvam-streaming-ready', () => {
            console.log('✅ Sarvam AI streaming ready');
            streamingReadyRef.current = true;
            setIsConnecting(false);
        });

        socketRef.current.on('sarvam-language-detected', (data) => {
            console.log('🌐 Language detected:', data.language, data.languageName);
            setDetectedLanguage(data.language);
            setDetectedLanguageName(data.languageName);
        });

        socketRef.current.on('sarvam-interim-transcript', (data) => {
            setInterimTranscript(data.text);
        });

        socketRef.current.on('sarvam-final-transcript', (data) => {
            setTranscript(prev => prev + data.text + ' ');
            setInterimTranscript('');
        });

        socketRef.current.on('sarvam-transcription-error', (data) => {
            const errorMsg = data.message || 'Transcription error occurred';
            setError(errorMsg);
            setIsRecording(false);
            isRecordingRef.current = false;
            setIsConnecting(false);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
            stopRecording();
        };
    }, [stopRecording]);

    return {
        isRecording,
        isConnecting,
        transcript,
        interimTranscript,
        error,
        duration,
        audioLevel,
        detectedLanguage,
        detectedLanguageName,
        startRecording,
        stopRecording,
        clearTranscript
    };
};
