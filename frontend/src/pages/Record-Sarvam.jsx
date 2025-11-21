import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import Waveform from '../components/Waveform';
import api from '../utils/api';
import PremiumCard from '../components/ui/PremiumCard';
import PremiumButton from '../components/ui/PremiumButton';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

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
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();
  const { success: showSuccess, error: showError, info } = useToast();

  const {
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
  } = useAudioRecorder();

  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);

  useEffect(() => {
    if (detectedLanguageName) {
      info(`Language detected: ${detectedLanguageName}`);
    }
  }, [detectedLanguageName, info]);

  const handleStartRecording = () => {
    setSuccessMsg('');
    startRecording(selectedLanguage);
    info(`Recording started in ${SARVAM_LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage}`);
  };

  const handleStopRecording = () => {
    stopRecording();
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

      setSuccessMsg('Transcription saved successfully!');
      showSuccess('Transcription saved successfully!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save transcription';
      showError(errorMsg);
    }
  };

  const handleClear = () => {
    clearTranscript();
    setSuccessMsg('');
    info('Transcription cleared');
  };

  const handleLanguageChange = (e) => {
    if (!isRecording) {
      setSelectedLanguage(e.target.value);
    }
  };

  const selectedLangInfo = SARVAM_LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.5)] inline-flex items-center gap-3">
          <span>🎙️</span> Transcripter
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Real-time speech-to-text for 11+ Indian languages
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-center">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[#00F0FF] px-4 py-3 rounded-xl text-center">
          {successMsg}
        </div>
      )}

      <PremiumCard className="p-8 space-y-8 border-white/5 bg-[#0A0A23]/50 backdrop-blur-3xl">
        {/* Language Selection */}
        {!isRecording && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300 ml-1">
              🌐 Select Language
            </label>
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="w-full px-4 py-3 rounded-xl bg-[#050511] border border-white/10 text-white focus:outline-none focus:border-[#00F0FF] focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all appearance-none cursor-pointer hover:border-white/20"
            >
              {SARVAM_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-[#050511] text-white">
                  {lang.emoji} {lang.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 text-center">
              Tip: Use Auto-Detect to let Transcripter pick the language automatically.
            </p>
          </div>
        )}

        {/* Status Indicator */}
        {(selectedLangInfo || detectedLanguage || (isRecording && selectedLanguage === 'auto')) && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#00F0FF]/5 border border-[#00F0FF]/10">
            <span className="text-2xl">
              {selectedLanguage === 'auto' && !detectedLanguage && isRecording
                ? '🔍'
                : detectedLanguage && selectedLanguage === 'auto'
                  ? '✅'
                  : selectedLangInfo?.emoji}
            </span>
            <div className="flex-1">
              <div className="font-semibold text-white">
                {selectedLanguage === 'auto' && !detectedLanguage && isRecording
                  ? 'Analyzing language...'
                  : detectedLanguage && selectedLanguage === 'auto'
                    ? (detectedLanguageName || 'Detected!')
                    : selectedLangInfo?.name}
              </div>
              <div className="text-sm text-gray-400">
                {selectedLanguage === 'auto' && !detectedLanguage && isRecording
                  ? 'Listening to detect your language'
                  : detectedLanguage && selectedLanguage === 'auto'
                    ? 'Auto-detected with 90% confidence'
                    : 'Manual selection - Transcripter'}
              </div>
            </div>
          </div>
        )}

        {/* Waveform */}
        <div className={`
          relative rounded-3xl p-6 transition-all duration-500
          ${isRecording
            ? 'bg-[#050511] border border-[#00F0FF]/30 shadow-[0_0_30px_rgba(0,240,255,0.1)]'
            : 'bg-[#050511]/50 border border-white/5'
          }
        `}>
          <Waveform isRecording={isRecording} audioLevel={audioLevel} />

          {isRecording && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="px-4 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-mono font-medium border border-red-500/20 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          {!isRecording ? (
            <PremiumButton
              onClick={handleStartRecording}
              disabled={isConnecting}
              variant="primary"
              className="px-12 py-4 text-lg rounded-full shadow-[0_0_30px_rgba(0,240,255,0.3)]"
            >
              <span className="flex items-center gap-3">
                {isConnecting ? '⏳ Connecting...' : '🎙️ Start Recording'}
              </span>
            </PremiumButton>
          ) : (
            <PremiumButton
              onClick={handleStopRecording}
              variant="ghost"
              className="px-12 py-4 text-lg rounded-full bg-red-500 text-white hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
            >
              <span className="flex items-center gap-3">
                ⏹️ Stop Recording
              </span>
            </PremiumButton>
          )}
          <p className="text-sm text-gray-500">
            {isRecording ? 'Click to stop when you are done speaking.' : 'Ensure your mic has permission and speak clearly.'}
          </p>
        </div>
      </PremiumCard>

      {/* Transcription Result */}
      {(transcript || interimTranscript) && (
        <PremiumCard className="p-6 space-y-4 animate-slide-in border-white/5 bg-[#0A0A23]/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              📝 Transcription
            </h3>
            <div className="flex items-center gap-2">
              {!isRecording && transcript && (
                <>
                  <PremiumButton variant="secondary" onClick={saveTranscription} className="text-sm py-2">
                    💾 Save
                  </PremiumButton>
                  <PremiumButton variant="ghost" onClick={handleClear} className="text-sm py-2 text-red-500 hover:bg-red-500/10 hover:text-red-400">
                    🗑️ Clear
                  </PremiumButton>
                </>
              )}
            </div>
          </div>

          <div className="bg-[#050511]/50 rounded-xl p-6 border border-white/5 min-h-[150px] shadow-inner">
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-lg font-light">
              {transcript}
              {interimTranscript && (
                <span className="text-gray-500 italic ml-1">{interimTranscript}</span>
              )}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 px-2">
            <span>📊 Words: {transcript.split(/\s+/).filter(w => w).length}</span>
            <span>⏱️ Duration: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</span>
          </div>
        </PremiumCard>
      )}
    </div>
  );
};

export default RecordSarvam;
