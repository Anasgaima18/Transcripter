import mongoose from 'mongoose';

const transcriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transcription: {
    type: String,
    required: [true, 'Transcription text is required'],
    trim: true
  },
  detectedLanguage: {
    type: String,
    required: true,
    default: 'en'
  },
  languageConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate word count before saving
transcriptionSchema.pre('save', function(next) {
  if (this.transcription) {
    this.wordCount = this.transcription.split(/\s+/).filter(word => word.length > 0).length;
  }
  next();
});

const Transcription = mongoose.model('Transcription', transcriptionSchema);

export default Transcription;
