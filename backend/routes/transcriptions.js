import express from 'express';
import Transcription from '../models/Transcription.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/transcriptions
// @desc    Save a new transcription
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { transcription, detectedLanguage, languageConfidence, duration } = req.body || {};

    // Validation
    if (!transcription || typeof transcription !== 'string' || !transcription.trim()) {
      return res.status(400).json({ message: 'Transcription text is required' });
    }

    // Validate optional fields
    let lang = 'en';
    if (typeof detectedLanguage === 'string' && detectedLanguage.trim()) {
      lang = detectedLanguage.trim();
    }

    let langConf = 0;
    if (typeof languageConfidence === 'number' && Number.isFinite(languageConfidence)) {
      langConf = Math.max(0, Math.min(1, languageConfidence)); // Clamp between 0-1
    }

    let seconds = 0;
    if (typeof duration === 'number' && Number.isFinite(duration) && duration >= 0) {
      seconds = Math.floor(duration);
    }

    // Create transcription
    const newTranscription = await Transcription.create({
      user: req.user._id,
      transcription: transcription.trim(),
      detectedLanguage: lang,
      languageConfidence: langConf,
      duration: seconds
    });

    res.status(201).json(newTranscription);
  } catch (error) {
    console.error('Error saving transcription:', error);
    res.status(500).json({ message: 'Server error while saving transcription' });
  }
});

// @route   GET /api/transcriptions
// @desc    Get all transcriptions for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const transcriptions = await Transcription.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(transcriptions);
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    res.status(500).json({ message: 'Server error while fetching transcriptions' });
  }
});

// @route   GET /api/transcriptions/:id
// @desc    Get a single transcription by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid transcription id' });
    }

    const transcription = await Transcription.findById(id);

    if (!transcription) {
      return res.status(404).json({ message: 'Transcription not found' });
    }

    // Check if transcription belongs to user
    if (transcription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this transcription' });
    }

    res.json(transcription);
  } catch (error) {
    console.error('Error fetching transcription:', error);
    res.status(500).json({ message: 'Server error while fetching transcription' });
  }
});

// @route   DELETE /api/transcriptions/:id
// @desc    Delete a transcription
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid transcription id' });
    }

    const transcription = await Transcription.findById(id);

    if (!transcription) {
      return res.status(404).json({ message: 'Transcription not found' });
    }

    // Check if transcription belongs to user
    if (transcription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this transcription' });
    }

    await Transcription.findByIdAndDelete(req.params.id);

    res.json({ message: 'Transcription deleted successfully' });
  } catch (error) {
    console.error('Error deleting transcription:', error);
    res.status(500).json({ message: 'Server error while deleting transcription' });
  }
});

// @route   GET /api/transcriptions/:id/download
// @desc    Download a transcription as .txt file
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid transcription id' });
    }

    const transcription = await Transcription.findById(id);

    if (!transcription) {
      return res.status(404).json({ message: 'Transcription not found' });
    }

    // Check if transcription belongs to user
    if (transcription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this transcription' });
    }

    // Format the text file content
    const date = new Date(transcription.createdAt).toLocaleString();
    const languageName = transcription.detectedLanguage || 'Unknown';
    const durationMin = Math.floor(transcription.duration / 60);
    const durationSec = transcription.duration % 60;
    const durationFormatted = `${durationMin}:${durationSec.toString().padStart(2, '0')}`;

    const content = `
=====================================
    TRANSCRIPTER - TRANSCRIPTION
=====================================

Date: ${date}
Language: ${languageName}
Duration: ${durationFormatted}
Word Count: ${transcription.wordCount || 0}

-------------------------------------
TRANSCRIPTION:
-------------------------------------

${transcription.transcription}

-------------------------------------
Generated by Transcripter
Real-Time Speech-to-Text Application
=====================================
`.trim();

    // Set headers for file download
    const filename = `transcription_${transcription._id}_${Date.now()}.txt`;
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (error) {
    console.error('Error downloading transcription:', error);
    res.status(500).json({ message: 'Server error while downloading transcription' });
  }
});

export default router;
