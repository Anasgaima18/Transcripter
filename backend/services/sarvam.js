import axios from 'axios';

// Store active transcription sessions per socket
const sessions = new Map();

/**
 * Transcripter Speech-to-Text Service (powered by Sarvam AI)
 * Real-time streaming for 13+ Indian languages
 * Languages: Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi,
 *            Gujarati, Punjabi, Odia, Assamese, English
 */
export const setupSarvamAI = (io) => {
  const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
  const SARVAM_API_URL = 'https://api.sarvam.ai/speech-to-text-translate';
  // Accuracy-related configurable knobs (optimized for maximum accuracy)
  const CHUNK_SIZE_BYTES = Number(process.env.SARVAM_CHUNK_SIZE_BYTES) || 192000; // ~6s @16kHz 16-bit mono (longer = better context)
  const CHUNK_OVERLAP_MS = Number(process.env.SARVAM_CHUNK_OVERLAP_MS) || 1000;   // 1s overlap to prevent boundary word loss
  const BYTES_PER_SECOND = 32000; // 16kHz * 2 bytes

  // Preprocessing / validation thresholds (stricter for better quality)
  const MIN_RMS_CFG = Number(process.env.SARVAM_MIN_RMS) || 400;          // was 300
  const MIN_PERCENTAGE_CFG = Number(process.env.SARVAM_MIN_PERCENTAGE) || 1.5;   // was 1.0
  const TRIM_THRESHOLD_CFG = Number(process.env.SARVAM_TRIM_THRESHOLD) || 600;   // was 500
  const TRIM_FRAME_SIZE_CFG = Number(process.env.SARVAM_TRIM_FRAME_SIZE) || 160; // 10ms @16kHz
  const NORMALIZE_TARGET_CFG = Number(process.env.SARVAM_NORMALIZE_TARGET) || 0.95; // was 0.9 - stronger normalization
  const NOISE_GATE_THRESHOLD = Number(process.env.SARVAM_NOISE_GATE) || 0.02; // spectral gate for noise reduction

  if (!SARVAM_API_KEY) {
    console.error('⚠️ SARVAM_API_KEY not found in environment variables');
    return;
  }

  io.on('connection', (socket) => {
    console.log('🔵 Sarvam AI: Client connected:', socket.id);

    // Handle start streaming with automatic language detection
    socket.on('start-sarvam-streaming', async ({ language = 'auto' }) => {
      try {
        console.log('🚀 Starting Sarvam AI streaming for:', socket.id);
        console.log('   Language mode:', language === 'auto' ? '🌐 Auto-detect' : language);

        // Initialize session
        const session = {
          language: language === 'auto' ? null : language, // null = auto-detect
          detectedLanguage: null,
          languageDetected: false,
          audioChunks: [],
          isActive: true,
          lastProcessTime: Date.now()
        };

        sessions.set(socket.id, session);

        // Emit ready signal
        socket.emit('sarvam-streaming-ready', { 
          sessionId: socket.id,
          language: language === 'auto' ? 'Detecting...' : language,
          autoDetect: language === 'auto',
          message: 'Sarvam AI ready for audio input'
        });

        console.log('✅ Sarvam AI session initialized');
        console.log('   Waiting for audio data...');

      } catch (error) {
        console.error('❌ Sarvam AI Error:', error.message);
        socket.emit('sarvam-transcription-error', { 
          message: error.message || 'Failed to initialize Sarvam AI streaming' 
        });
      }
    });

    // Handle audio data - accumulate and process in batches
    socket.on('sarvam-audio-data', async (audioData) => {
      const session = sessions.get(socket.id);
      
      if (!session || !session.isActive) {
        return;
      }

      try {
        // Convert base64 to buffer if needed
        const audioBuffer = Buffer.isBuffer(audioData) 
          ? audioData 
          : Buffer.from(audioData, 'base64');

        // Accumulate audio chunks
        session.audioChunks.push(audioBuffer);

        // Process ~4 seconds of audio for better accuracy
        const totalSize = session.audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const CHUNK_SIZE = CHUNK_SIZE_BYTES;

        if (totalSize >= CHUNK_SIZE) {
          // Concatenate all chunks
          const combinedAudio = Buffer.concat(session.audioChunks);
          // Preprocess: trim leading/trailing silence and normalize volume
          const processedAudio = preprocessAudio(combinedAudio, {
            trimThreshold: TRIM_THRESHOLD_CFG,
            frameSize: TRIM_FRAME_SIZE_CFG,
            normalizeTarget: NORMALIZE_TARGET_CFG,
            noiseGate: NOISE_GATE_THRESHOLD
          });
          
          // Validate audio quality before processing
          if (validateAudioQuality(processedAudio, { minRms: MIN_RMS_CFG, minPercent: MIN_PERCENTAGE_CFG })) {
            // Reset chunks with overlap to reduce boundary word loss
            const overlapBytes = Math.max(0, Math.floor((CHUNK_OVERLAP_MS / 1000) * BYTES_PER_SECOND));
            const keepFrom = Math.max(0, combinedAudio.length - overlapBytes);
            const overlapChunk = combinedAudio.slice(keepFrom);
            session.audioChunks = overlapChunk.length > 0 ? [overlapChunk] : [];
            
            // Process with Sarvam AI
            await processSarvamTranscription(socket, processedAudio, session.language);
          } else {
            console.warn('⚠️  Audio quality too low, accumulating more data...');
            // Keep accumulating if audio is too quiet
          }
        }

      } catch (error) {
        console.error('❌ Error processing audio chunk:', error.message);
      }
    });

    // Process transcription with Sarvam AI API with auto-detection
    async function processSarvamTranscription(socket, audioBuffer, language) {
      try {
        const now = Date.now();
        const session = sessions.get(socket.id);
        
        // Throttle requests to avoid rate limits (max 1 request per second)
        if (session && (now - session.lastProcessTime) < 1000) {
          return;
        }

        if (session) {
          session.lastProcessTime = now;
        }

        // If language is null, we need to detect it
        const isAutoDetect = !language;
        // Default to English for better accuracy in auto-detection
        // English works well for detecting Indian-accented English and provides better base for detection
        const languageToUse = language || session?.detectedLanguage || 'en-IN';

  console.log('\n📤 Sending audio to Sarvam AI...');
  console.log('   Audio size:', audioBuffer.length, 'bytes', '(' + (audioBuffer.length / 32000).toFixed(1) + 's)');
        console.log('   Language:', isAutoDetect ? '🌐 Auto-detecting...' : languageToUse);
        console.log('   Session detected:', session?.languageDetected ? 'Yes (' + session.detectedLanguage + ')' : 'No');

        // Create form data
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        
        // Convert PCM to WAV format (Sarvam expects WAV)
        const wavBuffer = createWavBuffer(audioBuffer);
        formData.append('file', wavBuffer, {
          filename: 'audio.wav',
          contentType: 'audio/wav'
        });
        
  formData.append('language_code', languageToUse);
  appendSarvamParams(formData);

        // Make API request
        const response = await axios.post(SARVAM_API_URL, formData, {
          headers: {
            ...formData.getHeaders(),
            'API-Subscription-Key': SARVAM_API_KEY
          },
          timeout: 10000
        });

        const { transcript } = response.data;

        // Post-filter: skip empty/low-value junk like short fillers on silence
        if (!transcript || !transcript.trim()) {
          return;
        }

        const cleaned = transcript.trim().toLowerCase().replace(/[\.,!?;:"'’“”\-–—()\[\]{}]/g, '').trim();
        const wordCountForFilter = cleaned.split(/\s+/).filter(Boolean).length;
        const fillerWords = new Set(['yes', 'no', 'hmm', 'uh', 'um', 'ok', 'okay', 'ah', 'ha']);

        if (wordCountForFilter <= 2 && fillerWords.has(cleaned)) {
          console.log('\u26a0\ufe0f  Skipping filler/junk transcript:', cleaned);
          return;
        }

        if (transcript && transcript.trim()) {
          console.log('✅ Sarvam transcription:', transcript);
          console.log('   Length:', transcript.length, 'chars | Words:', transcript.split(/\s+/).length);
          
          // Enhanced auto-detection: accumulate evidence before locking
          if (isAutoDetect && session && !session.languageDetected) {
            // Analyze transcript to determine language
            const detectedLang = await detectLanguageFromTranscript(transcript, languageToUse, audioBuffer, socket);
            
            // Require more evidence before locking (5+ words, consistent detection)
            const wordCount = transcript.split(/\s+/).filter(Boolean).length;
            
            // Track detection history for consistency
            if (!session.detectionHistory) session.detectionHistory = [];
            session.detectionHistory.push(detectedLang);
            
            if (wordCount >= 5 && session.detectionHistory.length >= 2) {
              // Check consistency: at least 2 consecutive same language detections
              const lastTwo = session.detectionHistory.slice(-2);
              if (lastTwo[0] === lastTwo[1]) {
                session.detectedLanguage = detectedLang;
                session.languageDetected = true;
                console.log('🌐 Language detected and locked:', detectedLang, '(after', session.detectionHistory.length, 'samples)');
                
                // Notify client of detected language
                socket.emit('sarvam-language-detected', {
                  language: detectedLang,
                  languageName: getLanguageName(detectedLang),
                  confidence: 0.95 // higher confidence after consistency check
                });
              } else {
                console.log('⏳ Waiting for consistent detection... (got:', lastTwo.join(' → '), ')');
              }
            } else {
              console.log('⏳ Accumulating evidence... (', wordCount, 'words,', session.detectionHistory.length, 'samples)');
            }
          }
          
          // Emit interim transcript
          socket.emit('sarvam-interim-transcript', {
            text: transcript,
            language: session?.detectedLanguage || languageToUse,
            timestamp: Date.now()
          });

          // Also emit as final after a short delay if no more audio
          setTimeout(() => {
            socket.emit('sarvam-final-transcript', {
              text: transcript,
              language: session?.detectedLanguage || languageToUse,
              timestamp: Date.now()
            });
          }, 500);
        }

      } catch (error) {
        if (error.response) {
          console.error('❌ Sarvam API Error:', error.response.status, error.response.data);
        } else {
          console.error('❌ Sarvam Error:', error.message);
        }
      }
    }

    // Handle stop streaming
    socket.on('stop-sarvam-streaming', async () => {
      const session = sessions.get(socket.id);
      
      if (session) {
        console.log('⏹️ Stopping Sarvam AI streaming for:', socket.id);
        
        // Process any remaining audio chunks
        if (session.audioChunks.length > 0) {
          const combinedAudio = Buffer.concat(session.audioChunks);
          await processSarvamTranscription(socket, combinedAudio, session.language);
        }

        session.isActive = false;
        sessions.delete(socket.id);
        
        socket.emit('sarvam-transcription-stopped');
        console.log('✅ Sarvam AI session ended');
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔴 Sarvam AI: Client disconnected:', socket.id);
      const session = sessions.get(socket.id);
      
      if (session) {
        session.isActive = false;
        sessions.delete(socket.id);
      }
    });
  });
};

/**
 * Validate audio quality before sending to API
 * Checks if audio has sufficient volume and isn't just silence
 */
function validateAudioQuality(pcmBuffer, { minRms = 300, minPercent = 1.0 } = {}) {
  try {
    // Convert buffer to Int16Array for analysis
    const samples = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.length / 2);
    
    // Calculate RMS (Root Mean Square) for volume
    let sumSquares = 0;
    let maxAmplitude = 0;
    
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.abs(samples[i]);
      sumSquares += sample * sample;
      if (sample > maxAmplitude) {
        maxAmplitude = sample;
      }
    }
    
    const rms = Math.sqrt(sumSquares / samples.length);
    const rmsPercentage = (rms / 32768) * 100; // Convert to percentage of max
    
  // Thresholds (configurable) to avoid false positives during silence
  const isValid = rms > minRms && rmsPercentage > minPercent;
    
    if (!isValid) {
      console.log('   \u26a0\ufe0f  Audio too quiet - RMS:', rms.toFixed(0), '(' + rmsPercentage.toFixed(2) + '%)');
    } else {
  console.log('   \u2705 Audio quality good - RMS:', rms.toFixed(0), '(' + rmsPercentage.toFixed(2) + '%)');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error validating audio:', error.message);
    return false; // Be conservative on validation failure
  }
}

/**
 * Audio preprocessing: trim silence and normalize volume
 */
function preprocessAudio(pcmBuffer, { trimThreshold = 500, frameSize = 160, normalizeTarget = 0.9, noiseGate = 0.02 } = {}) {
  try {
    const int16 = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.length / 2);
    
    // Step 1: Noise gate (reduce low-level background hum)
    const gated = applyNoiseGate(int16, noiseGate);
    
    // Step 2: Trim leading/trailing silence
    const trimmed = trimSilence(gated, trimThreshold, frameSize);
    
    // Step 3: Normalize volume with DC offset removal
    const normalized = normalizeVolume(trimmed, normalizeTarget);
    
    return Buffer.from(normalized.buffer, normalized.byteOffset, normalized.byteLength);
  } catch (e) {
    console.warn('Preprocess failed, using original buffer:', e.message);
    return pcmBuffer;
  }
}

/**
 * Trim leading and trailing silence using a simple threshold per small frame
 */
function trimSilence(int16Array, threshold = 500, frameSize = 160) {
  const n = int16Array.length;
  if (n === 0) return int16Array;

  let start = 0;
  // find first frame exceeding threshold
  while (start < n) {
    let maxAmp = 0;
    const end = Math.min(start + frameSize, n);
    for (let i = start; i < end; i++) {
      const a = Math.abs(int16Array[i]);
      if (a > maxAmp) maxAmp = a;
    }
    if (maxAmp > threshold) break;
    start += frameSize;
  }

  let stop = n;
  // find last frame exceeding threshold
  while (stop > start) {
    let maxAmp = 0;
    const begin = Math.max(start, stop - frameSize);
    for (let i = begin; i < stop; i++) {
      const a = Math.abs(int16Array[i]);
      if (a > maxAmp) maxAmp = a;
    }
    if (maxAmp > threshold) break;
    stop -= frameSize;
  }

  return int16Array.subarray(start, stop);
}

/**
 * Normalize volume to a target peak and remove DC offset
 */
function normalizeVolume(int16Array, targetPeak = 0.9) {
  const n = int16Array.length;
  if (n === 0) return int16Array;

  // DC offset removal
  let sum = 0;
  for (let i = 0; i < n; i++) sum += int16Array[i];
  const mean = sum / n;

  let peak = 0;
  for (let i = 0; i < n; i++) {
    const v = int16Array[i] - mean;
    if (Math.abs(v) > peak) peak = Math.abs(v);
  }
  if (peak === 0) return int16Array;

  const target = targetPeak * 32767;
  const gain = target / peak;

  const out = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const v = (int16Array[i] - mean) * gain;
    // clamp
    const c = Math.max(-32768, Math.min(32767, Math.round(v)));
    out[i] = c;
  }
  return out;
}

/**
 * Simple noise gate: suppress samples below threshold
 */
function applyNoiseGate(int16Array, threshold = 0.02) {
  const n = int16Array.length;
  if (n === 0) return int16Array;
  
  const out = new Int16Array(n);
  const thresholdAbs = threshold * 32768;
  
  for (let i = 0; i < n; i++) {
    if (Math.abs(int16Array[i]) < thresholdAbs) {
      out[i] = 0; // gate out noise
    } else {
      out[i] = int16Array[i];
    }
  }
  return out;
}

/**
 * Append optional Sarvam API parameters from environment to form-data
 * Safely no-ops if not provided or API ignores unknowns
 */
function appendSarvamParams(formData) {
  try {
    const mapBool = (v) => {
      if (v === undefined || v === null || v === '') return undefined;
      return String(v).toLowerCase() === 'true' ? 'true' : 'false';
    };
    const maybe = (key, val) => { if (val !== undefined && val !== '') formData.append(key, String(val)); };

    // Enable accuracy features by default if not explicitly set
    maybe('enable_punctuation', mapBool(process.env.SARVAM_ENABLE_PUNCTUATION ?? 'true'));
    maybe('enable_casing', mapBool(process.env.SARVAM_ENABLE_CASING ?? 'true'));
    maybe('enable_itn', mapBool(process.env.SARVAM_ENABLE_ITN ?? 'true'));
    maybe('diarization', mapBool(process.env.SARVAM_ENABLE_DIARIZATION));
    maybe('translate', mapBool(process.env.SARVAM_ENABLE_TRANSLATE));
    maybe('target_language_code', process.env.SARVAM_TARGET_LANGUAGE_CODE);
    // Custom vocabulary/hints (comma-separated)
    if (process.env.SARVAM_CUSTOM_VOCAB) {
      maybe('custom_vocabulary', process.env.SARVAM_CUSTOM_VOCAB);
    }
    // Generic JSON passthrough for new params
    if (process.env.SARVAM_PARAMS_JSON) {
      try {
        const extras = JSON.parse(process.env.SARVAM_PARAMS_JSON);
        if (extras && typeof extras === 'object') {
          for (const [k, v] of Object.entries(extras)) {
            if (v !== undefined && v !== null) formData.append(k, String(v));
          }
        }
      } catch (e) {
        console.warn('SARVAM_PARAMS_JSON parse error:', e.message);
      }
    }
  } catch (e) {
    console.warn('appendSarvamParams failed:', e.message);
  }
}

/**
 * Convert raw PCM audio to WAV format
 * Sarvam AI expects WAV files with proper headers
 */
function createWavBuffer(pcmBuffer) {
  const sampleRate = 16000;
  const numChannels = 1;
  const bitsPerSample = 16;
  
  const blockAlign = numChannels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;
  
  const wavBuffer = Buffer.alloc(headerSize + dataSize);
  
  // RIFF header
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(fileSize - 8, 4);
  wavBuffer.write('WAVE', 8);
  
  // fmt chunk
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16); // fmt chunk size
  wavBuffer.writeUInt16LE(1, 20); // audio format (PCM)
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);
  
  // Copy PCM data
  pcmBuffer.copy(wavBuffer, headerSize);
  
  return wavBuffer;
}

/**
 * Intelligent language detection based on transcript analysis
 * Analyzes Unicode ranges and common patterns
 */
async function detectLanguageFromTranscript(transcript, initialLang, audioBuffer, socket) {
  try {
    // Enhanced Unicode script detection
    const hasDevanagari = /[\u0900-\u097F]/.test(transcript); // Hindi, Marathi
    const hasBengali = /[\u0980-\u09FF]/.test(transcript);
    const hasTamil = /[\u0B80-\u0BFF]/.test(transcript);
    const hasTelugu = /[\u0C00-\u0C7F]/.test(transcript);
    const hasKannada = /[\u0C80-\u0CFF]/.test(transcript);
    const hasMalayalam = /[\u0D00-\u0D7F]/.test(transcript);
    const hasGujarati = /[\u0A80-\u0AFF]/.test(transcript);
    const hasGurmukhi = /[\u0A00-\u0A7F]/.test(transcript); // Punjabi
    const hasOdia = /[\u0B00-\u0B7F]/.test(transcript);
    
    // Count script characters for confidence
    const devanagariCount = (transcript.match(/[\u0900-\u097F]/g) || []).length;
    const bengaliCount = (transcript.match(/[\u0980-\u09FF]/g) || []).length;
    const tamilCount = (transcript.match(/[\u0B80-\u0BFF]/g) || []).length;
    const teluguCount = (transcript.match(/[\u0C00-\u0C7F]/g) || []).length;
    const kannadaCount = (transcript.match(/[\u0C80-\u0CFF]/g) || []).length;
    const malayalamCount = (transcript.match(/[\u0D00-\u0D7F]/g) || []).length;
    const gujaratiCount = (transcript.match(/[\u0A80-\u0AFF]/g) || []).length;
    const gurmukhiCount = (transcript.match(/[\u0A00-\u0A7F]/g) || []).length;
    const odiaCount = (transcript.match(/[\u0B00-\u0B7F]/g) || []).length;
    const englishChars = (transcript.match(/[a-zA-Z]/g) || []).length;
    
    const totalChars = transcript.replace(/\s/g, '').length; // Exclude spaces
    
    // Find dominant script (must be >70% for confidence)
    const scripts = [
      { lang: 'en-IN', count: englishChars, name: 'English' },
      { lang: 'hi-IN', count: devanagariCount, name: 'Devanagari (Hindi)' },
      { lang: 'bn-IN', count: bengaliCount, name: 'Bengali' },
      { lang: 'ta-IN', count: tamilCount, name: 'Tamil' },
      { lang: 'te-IN', count: teluguCount, name: 'Telugu' },
      { lang: 'kn-IN', count: kannadaCount, name: 'Kannada' },
      { lang: 'ml-IN', count: malayalamCount, name: 'Malayalam' },
      { lang: 'gu-IN', count: gujaratiCount, name: 'Gujarati' },
      { lang: 'pa-IN', count: gurmukhiCount, name: 'Punjabi' },
      { lang: 'od-IN', count: odiaCount, name: 'Odia' }
    ];
    
    scripts.sort((a, b) => b.count - a.count);
    const dominant = scripts[0];
    const ratio = totalChars > 0 ? dominant.count / totalChars : 0;
    
    if (ratio > 0.70) {
      console.log('   ✅ Detected:', dominant.name, '(', (ratio * 100).toFixed(0), '% confidence)');
      return dominant.lang;
    }
    
    // Fallback: if we have some script evidence (>40%), use it with caveat
    if (ratio > 0.40) {
      console.log('   ⚠️  Likely:', dominant.name, '(', (ratio * 100).toFixed(0), '% - low confidence)');
      return dominant.lang;
    }
    
    // If no clear winner, stick with initial
    console.log('   ⚠️  Mixed/unclear script, using:', initialLang);
    return initialLang;
    
  } catch (error) {
    console.error('Error in language detection:', error.message);
    return initialLang;
  }
}

/**
 * Get language name from code
 */
function getLanguageName(code) {
  const languageNames = {
    'en-IN': 'English (India)',
    'hi-IN': 'Hindi (हिंदी)',
    'bn-IN': 'Bengali (বাংলা)',
    'kn-IN': 'Kannada (ಕನ್ನಡ)',
    'ml-IN': 'Malayalam (മലയാളം)',
    'mr-IN': 'Marathi (मराठी)',
    'od-IN': 'Odia (ଓଡ଼ିଆ)',
    'pa-IN': 'Punjabi (ਪੰਜਾਬੀ)',
    'ta-IN': 'Tamil (தமிழ்)',
    'te-IN': 'Telugu (తెలుగు)',
    'gu-IN': 'Gujarati (ગુજરાતી)'
  };
  return languageNames[code] || code;
}

export default setupSarvamAI;
