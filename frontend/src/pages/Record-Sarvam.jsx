import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import Waveform from '../components/Waveform';
import api from '../utils/api';
import RecordButton from '../components/ui/RecordButton';
import Timer from '../components/ui/Timer';
import GlassCard from '../components/ui/GlassCard';
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
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-flex items-center gap-2">
          <span>🎙️</span> Transcripter
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
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
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-center">
          {successMsg}
        </div>
      )}

      <GlassCard className="p-8 space-y-8">
        {/* Language Selection */}
        {!isRecording && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-muted-foreground ml-1">
              🌐 Select Language
            </label>
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer hover:bg-white/10"
            >
              {SARVAM_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-background text-foreground">
                  {lang.emoji} {lang.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground text-center">
              Tip: Use Auto-Detect to let Transcripter pick the language automatically.
            </p>
          </div>
        )}

        {/* Status Indicator */}
        {(selectedLangInfo || detectedLanguage || (isRecording && selectedLanguage === 'auto')) && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <span className="text-2xl">
              {selectedLanguage === 'auto' && !detectedLanguage && isRecording
                ? '🔍'
                : detectedLanguage && selectedLanguage === 'auto'
                  ? '✅'
                  : selectedLangInfo?.emoji}
            </span>
            <div className="flex-1">
              <div className="font-semibold text-foreground">
                {selectedLanguage === 'auto' && !detectedLanguage && isRecording
                  ? 'Analyzing language...'
                  : detectedLanguage && selectedLanguage === 'auto'
                    ? (detectedLanguageName || 'Detected!')
                    : selectedLangInfo?.name}
              </div>
              <div className="text-sm text-muted-foreground">
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
            ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/10'
            : 'bg-white/5 border border-white/10'
          }
        `}>
          <Waveform isRecording={isRecording} audioLevel={audioLevel} />

          {isRecording && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="px-4 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-mono font-medium border border-red-500/20 animate-pulse">
                {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              disabled={isConnecting}
              className="
                group relative px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg
                shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <span className="flex items-center gap-3">
                {isConnecting ? '⏳ Connecting...' : '🎙️ Start Recording'}
              </span>
              <div className="absolute inset-0 rounded-full bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="
                group relative px-8 py-4 rounded-full bg-red-500 text-white font-bold text-lg
                shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 active:scale-95
                transition-all duration-300
              "
            >
              <span className="flex items-center gap-3">
                ⏹️ Stop Recording
              </span>
            </button>
          )}
          <p className="text-sm text-muted-foreground">
            {isRecording ? 'Click to stop when you are done speaking.' : 'Ensure your mic has permission and speak clearly.'}
          </p>
        </div>
      </GlassCard>

      {/* Transcription Result */}
      {(transcript || interimTranscript) && (
        <GlassCard className="p-6 space-y-4 animate-slide-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              📝 Transcription
            </h3>
            <div className="flex items-center gap-2">
              {!isRecording && transcript && (
                <>
                  <PremiumButton variant="secondary" onClick={saveTranscription} className="text-sm py-2">
                    💾 Save
                  </PremiumButton>
                  <PremiumButton variant="ghost" onClick={handleClear} className="text-sm py-2 text-red-500 hover:bg-red-500/10">
                    🗑️ Clear
                  </PremiumButton>
                </>
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 min-h-[150px]">
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-lg">
              {transcript}
              {interimTranscript && (
                <span className="text-muted-foreground italic ml-1">{interimTranscript}</span>
              )}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
            <span>📊 Words: {transcript.split(/\s+/).filter(w => w).length}</span>
            <span>⏱️ Duration: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</span>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

export default RecordSarvam;
