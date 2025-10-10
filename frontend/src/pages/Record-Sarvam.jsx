import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import { useToast } from '../components/ToastProvider';
import Waveform from '../components/Waveform';
import api from '../utils/api';
import { Button, Card, Select, RecordButton, LanguageBadge, Timer } from '../components/ui';

// Transcripter Supported Languages
const SARVAM_LANGUAGES = [
  { code: 'auto', name: '🌐 Auto-Detect Language', emoji: '🌍' },
  { code: 'en-IN', name: 'English (India)', emoji: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi (हिंदी)', emoji: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)', emoji: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)', emoji: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)', emoji: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi (मराठी)', emoji: '🇮🇳' },
  { code: 'od-IN', name: 'Odia (ଓଡ଼ିଆ)', emoji: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)', emoji: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)', emoji: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)', emoji: '🇮🇳' },
  { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)', emoji: '🇮🇳' },
];

const RecordSarvam = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [duration, setDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto'); // Default to auto-detect
  const [detectedLanguage, setDetectedLanguage] = useState(null); // Store detected language
  const [detectedLanguageName, setDetectedLanguageName] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const processorRef = useRef(null);
  const analyserRef = useRef(null);
  const timerRef = useRef(null);
  const audioLevelRef = useRef(null);
  const isRecordingRef = useRef(false);
  const streamingReadyRef = useRef(false);
  // Simple client-side VAD gate
  const vadLastVoiceRef = useRef(0);
  const VAD_THRESHOLD = 0.03; // normalized RMS threshold (0..1) - stricter for better quality
  const VAD_HANGOVER_MS = 500; // allow brief continuation after speech - longer to avoid cutoffs
  const navigate = useNavigate();
  const { success: showSuccess, error: showError, info } = useToast();

  useEffect(() => {
    // Initialize Socket.IO connection
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
      info(`Language detected: ${data.languageName}`);
    });

    socketRef.current.on('sarvam-interim-transcript', (data) => {
      console.log('📝 Sarvam Interim:', data.text);
      setInterimTranscript(data.text);
    });

    socketRef.current.on('sarvam-final-transcript', (data) => {
      console.log('✅ Sarvam Final:', data.text);
      setTranscript(prev => prev + data.text + ' ');
      setInterimTranscript('');
    });

    socketRef.current.on('sarvam-transcription-error', (data) => {
      const errorMsg = data.message || 'Transcription error occurred';
      setError(errorMsg);
      showError(errorMsg);
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsConnecting(false);
    });

    socketRef.current.on('sarvam-transcription-stopped', () => {
      console.log('⏹️ Sarvam transcription stopped');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    setError('');
    setSuccess('');
    setTranscript('');
    setInterimTranscript('');
    setDuration(0);
    setIsConnecting(true);
    streamingReadyRef.current = false;

    try {
      // Request microphone access
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

      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Create analyser for audio level visualization
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      source.connect(analyser);
      
      // Start audio level monitoring
      monitorAudioLevel();

      // Try AudioWorklet first, fallback to ScriptProcessor
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
            // VAD gate: compute RMS from Int16 PCM and only send when speaking
            try {
              const int16 = new Int16Array(event.data.buffer);
              let sumSquares = 0;
              for (let i = 0; i < int16.length; i++) {
                const s = int16[i] / 32768; // normalize -1..1
                sumSquares += s * s;
              }
              const rms = Math.sqrt(sumSquares / Math.max(1, int16.length));
              const now = Date.now();
              const speaking = rms >= VAD_THRESHOLD;
              if (speaking) vadLastVoiceRef.current = now;
              const withinHangover = (now - vadLastVoiceRef.current) <= VAD_HANGOVER_MS;

              if (speaking || withinHangover) {
                if (socketRef.current && socketRef.current.connected) {
                  socketRef.current.emit('sarvam-audio-data', event.data.buffer);
                }
              }
            } catch (e) {
              // Fallback: if VAD calc fails, still send to avoid losing audio
              if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('sarvam-audio-data', event.data.buffer);
              }
            }
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
          // VAD gate for ScriptProcessor path using float32 directly
          let sumSquares = 0;
          for (let i = 0; i < inputData.length; i++) {
            sumSquares += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sumSquares / Math.max(1, inputData.length));
          const now = Date.now();
          const speaking = rms >= VAD_THRESHOLD;
          if (speaking) vadLastVoiceRef.current = now;
          const withinHangover = (now - vadLastVoiceRef.current) <= VAD_HANGOVER_MS;

          if (speaking || withinHangover) {
            if (socketRef.current && socketRef.current.connected) {
              socketRef.current.emit('sarvam-audio-data', pcmData.buffer);
            }
          }
        };

        analyser.connect(scriptProcessor);
        scriptProcessor.connect(audioContextRef.current.destination);
      }

  // Start Transcripter streaming with selected language
      socketRef.current.emit('start-sarvam-streaming', { language: selectedLanguage });
      
      // Start timer
      startTimer();
      
      info(`Recording started in ${SARVAM_LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage}`);

    } catch (err) {
      console.error('Microphone error:', err);
      setError('Could not access microphone. Please grant permission.');
      showError('Could not access microphone. Please grant permission.');
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsConnecting(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    streamingReadyRef.current = false;

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop audio level monitoring
    if (audioLevelRef.current) {
      cancelAnimationFrame(audioLevelRef.current);
      audioLevelRef.current = null;
    }

    // Stop microphone
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Disconnect audio processor
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop Socket.IO streaming
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('stop-sarvam-streaming');
    }

    setAudioLevel(0);
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current || !isRecordingRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current || !isRecordingRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate RMS (Root Mean Square) for accurate volume
      const sum = dataArray.reduce((acc, val) => acc + val * val, 0);
      const rms = Math.sqrt(sum / dataArray.length);
      const normalized = Math.min(1, rms / 128); // Normalize to 0-1
      
      setAudioLevel(normalized);
      audioLevelRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const saveTranscription = async () => {
    if (!transcript.trim()) {
      showError('No transcription to save');
      return;
    }

    try {
      await api.post('/api/transcriptions', {
        transcription: transcript,
        detectedLanguage: detectedLanguage || selectedLanguage,
        languageConfidence: detectedLanguage ? 0.95 : 1.0,
        duration
      });

      setSuccess('Transcription saved successfully!');
      showSuccess('Transcription saved successfully!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save transcription';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const clearTranscription = () => {
    setTranscript('');
    setInterimTranscript('');
    setError('');
    setSuccess('');
    setDuration(0);
    setDetectedLanguage(null);
    setDetectedLanguageName('');
    info('Transcription cleared');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLanguageChange = (e) => {
    if (!isRecording) {
      setSelectedLanguage(e.target.value);
      // Reset detected language when changing selection
      if (e.target.value !== 'auto') {
        setDetectedLanguage(null);
        setDetectedLanguageName('');
      }
    }
  };

  const selectedLangInfo = SARVAM_LANGUAGES.find(l => l.code === selectedLanguage);

  // Styled components (ElevenLabs-inspired)
  const PageWrap = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e);
    position: relative;
    overflow-x: hidden;

    body.light & {
      background: linear-gradient(135deg, #f8fafc, #f1f5f9, #ffffff);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%);
      pointer-events: none;
    }
  `;

  const Main = styled.div`
    max-width: 48rem;
    margin: 0 auto;
    padding: 2.5rem 1rem;
    position: relative;
    z-index: 1;

    @media (max-width: 640px) {
      padding: 1.5rem 0.75rem;
    }
  `;

  const Stack = styled.div`
    display: grid;
    gap: 2rem;

    @media (max-width: 640px) {
      gap: 1.5rem;
    }
  `;

  const Header = styled.div`
    text-align: center;
  `;

  const Title = styled.h1`
    font-size: clamp(1.75rem, 4.5vw, 2.5rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, #8b5cf6, #6366f1, #ec4899);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin: 0;
    filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));

    @media (max-width: 640px) {
      flex-direction: column;
      gap: 0.25rem;
    }
  `;

  const Sub = styled.p`
    color: #cbd5e1;
    max-width: 42rem;
    margin: 0.5rem auto 0;
    font-size: 1rem;
    opacity: 0.9;

    body.light & {
      color: #475569;
    }

    @media (max-width: 640px) {
      font-size: 0.875rem;
    }
  `;

  const Small = styled.p`
    font-size: 0.875rem;
    color: #64748b;
    text-align: center;
    margin: 0;

    @media (max-width: 640px) {
      font-size: 0.75rem;
    }
  `;

  const Indicator = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid #c7d2fe;
    background: rgba(238, 242, 255, 0.7);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(238, 242, 255, 0.9);
      border-color: #a5b4fc;
    }

    @media (max-width: 640px) {
      padding: 0.75rem;
      gap: 0.5rem;
    }
  `;

  const WaveCard = styled(Card)`
    padding: 1.25rem;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    background: rgba(15, 15, 35, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(139, 92, 246, 0.2);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 
                0 0 0 1px rgba(139, 92, 246, 0.1);
    position: relative;
    overflow: hidden;

    body.light & {
      background: rgba(255, 255, 255, 0.8);
      border-color: rgba(139, 92, 246, 0.15);
      box-shadow: 0 10px 25px rgba(2, 6, 23, 0.08);
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 25px 70px rgba(0, 0, 0, 0.5),
                  0 0 0 1px rgba(139, 92, 246, 0.2);
    }

    @media (max-width: 640px) {
      padding: 0.75rem;
    }
  `;

  const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  `;

  const WaveInner = styled.div`
    transition: transform 300ms ease;
    position: relative;
    
    ${(p) => p.$active && `
      transform: scale(1.02);
      
      &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.1), transparent);
        background-size: 200% 200%;
        animation: ${shimmer} 2s ease-in-out infinite;
        border-radius: 50%;
        pointer-events: none;
      }
    `}
  `;

  const Row = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: stretch;
    }
  `;

  const TextBox = styled.div`
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    min-height: 120px;
    padding: 1rem;
    color: #0f172a;
    transition: all 0.3s ease;

    &:hover {
      border-color: #cbd5e1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    @media (max-width: 640px) {
      min-height: 100px;
      padding: 0.75rem;
      font-size: 0.875rem;
    }
  `;

  const MetaRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.875rem;
    color: #64748b;
    gap: 0.5rem;

    @media (max-width: 640px) {
      font-size: 0.75rem;
      flex-wrap: wrap;
    }
  `;

  return (
    <PageWrap>
      <Navbar />
      <Main>
        <Stack>
          <Header>
            <Title>🎙️ Transcripter</Title>
            <Sub>Real-time speech-to-text for 11+ Indian languages</Sub>
          </Header>

          {/* Alerts */}
          {error && (
            <Card style={{ padding: '1rem', border: '1px solid #fecaca', background: '#fee2e2' }}>
              <p style={{ color: '#991b1b', margin: 0 }}>{error}</p>
            </Card>
          )}
          {success && (
            <Card style={{ padding: '1rem', border: '1px solid #bbf7d0', background: '#ecfdf5' }}>
              <p style={{ color: '#065f46', margin: 0 }}>{success}</p>
            </Card>
          )}

          <Card style={{ padding: '2rem' }}>
            {/* Language Selection */}
            {!isRecording && (
              <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Select
                  label="🌐 Select Language"
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  options={SARVAM_LANGUAGES.map(lang => ({
                    value: lang.code,
                    label: `${lang.emoji} ${lang.name}`
                  }))}
                  placeholder="Choose language for transcription"
                />
                <Small>Tip: Use Auto-Detect to let Transcripter pick the language automatically.</Small>
              </div>
            )}

            {(selectedLangInfo || detectedLanguage || (isRecording && selectedLanguage === 'auto')) && (
              <Indicator>
                <span style={{ fontSize: '1.25rem' }}>
                  {selectedLanguage === 'auto' && !detectedLanguage && isRecording
                    ? '🔍'
                    : detectedLanguage && selectedLanguage === 'auto'
                      ? '✅'
                      : selectedLangInfo?.emoji}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {selectedLanguage === 'auto' && !detectedLanguage && isRecording
                      ? 'Analyzing language...'
                      : detectedLanguage && selectedLanguage === 'auto'
                        ? (detectedLanguageName || 'Detected!')
                        : selectedLangInfo?.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#475569' }}>
                    {selectedLanguage === 'auto' && !detectedLanguage && isRecording
                      ? 'Listening to detect your language'
                      : detectedLanguage && selectedLanguage === 'auto'
                        ? 'Auto-detected with 90% confidence'
                        : 'Manual selection - Transcripter'}
                  </div>
                </div>
              </Indicator>
            )}

            <WaveCard>
              <WaveInner $active={isRecording}>
                <Waveform isRecording={isRecording} audioLevel={audioLevel} />
              </WaveInner>
            </WaveCard>

            {isRecording && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Timer seconds={duration} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              {!isRecording ? (
                <RecordButton isRecording={false} onClick={startRecording} disabled={isConnecting}>
                  {isConnecting ? (<><span style={{ marginRight: 8 }}>⏳</span>Connecting...</>) : (<><span style={{ marginRight: 8 }}>🎙️</span>Start Recording</>)}
                </RecordButton>
              ) : (
                <RecordButton isRecording={true} onClick={stopRecording}>
                  <span style={{ marginRight: 8 }}>⏹️</span>Stop Recording
                </RecordButton>
              )}
              <Small>{isRecording ? 'Click to stop when you are done speaking.' : 'Ensure your mic has permission and speak clearly.'}</Small>
            </div>
          </Card>

          {(transcript || interimTranscript) && (
            <Card style={{ padding: '1.5rem' }}>
              <Row>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>📝 Transcription</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!isRecording && transcript && (
                    <>
                      <Button variant="secondary" size="sm" onClick={saveTranscription}>💾 Save</Button>
                      <Button variant="secondary" size="sm" onClick={clearTranscription}>🗑️ Clear</Button>
                    </>
                  )}
                </div>
              </Row>
              <TextBox>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{transcript}</p>
                {interimTranscript && (
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7, fontStyle: 'italic', color: '#64748b' }}>{interimTranscript}</p>
                )}
              </TextBox>
              <MetaRow>
                <span>📊 Words: {transcript.split(/\s+/).filter(w => w).length}</span>
                <span>⏱️ Duration: {formatDuration(duration)}</span>
              </MetaRow>
            </Card>
          )}
        </Stack>
      </Main>
    </PageWrap>
  );
};

export default RecordSarvam;
