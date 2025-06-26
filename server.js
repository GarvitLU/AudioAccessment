const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000,
  maxRetries: 3,
});

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// Utility functions
const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
};

const retryOperation = async (operation, maxRetries = 3, operationName = 'Operation') => {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retryCount++;
      console.log(`${operationName} attempt ${retryCount} failed:`, error.message);
      
      if (retryCount >= maxRetries) {
        throw new Error(`Failed to complete ${operationName.toLowerCase()} after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
};

// Single API endpoint for audio assessment
app.post('/api/assessment', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No audio file provided',
        message: 'Please provide an audio file in the request'
      });
    }

    if (!req.body.question) {
      return res.status(400).json({ 
        error: 'No question provided',
        message: 'Please provide a question in the request body'
      });
    }

    const question = req.body.question;
    const audioFilePath = req.file.path;

    // Step 1: Transcribe the audio
    const transcription = await retryOperation(
      async () => {
        return await openai.audio.transcriptions.create({
          file: fs.createReadStream(audioFilePath),
          model: "whisper-1",
          response_format: "text"
        });
      },
      3,
      'Transcription'
    );

    // Step 2: Evaluate the transcribed text and return structured JSON
    const evaluationResponse = await retryOperation(
      async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert educational assessor. Analyze the student's transcribed audio response and provide a structured JSON response with the following format:

{
  "strengths": ["point1", "point2", "point3"],
  "areasToImprove": ["point1", "point2", "point3"],
  "perfectDefinition": "A clear, comprehensive model answer for the question/topic",
  "encouragement": "A short, positive message to motivate the student",
  "score": {
    "content": 4,
    "clarity": 3,
    "completeness": 5,
    "total": 12
  }
}

Rules:
- strengths: Array of 2-4 positive points about the response
- areasToImprove: Array of 2-4 points that need improvement
- perfectDefinition: A model answer that shows what a perfect response would look like
- encouragement: A motivating message (1-2 sentences)
- score: Each of content, clarity, and completeness is scored out of 5, and total is out of 15 (sum of the three)
- Return ONLY valid JSON, no additional text or formatting.`
            },
            {
              role: "user",
              content: `Question: ${question}\n\nStudent's Audio Response (Transcribed): "${transcription}"\n\nPlease evaluate this response and provide feedback in the required JSON format.`
            }
          ],
          max_tokens: 800,
          temperature: 0.7,
          response_format: { type: "json_object" }
        });
      },
      3,
      'Evaluation'
    );

    // Clean up the uploaded file
    cleanupFile(audioFilePath);

    // Parse the JSON response
    let evaluation;
    try {
      evaluation = JSON.parse(evaluationResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing evaluation JSON:', parseError);
      evaluation = {
        strengths: ["Good effort"],
        areasToImprove: ["Could improve structure"],
        perfectDefinition: "A comprehensive answer with clear examples",
        encouragement: "Keep practicing!",
        score: {
          content: 3,
          clarity: 2,
          completeness: 1,
          total: 6
        }
      };
    }

    res.json({
      success: true,
      question: question,
      transcription: transcription,
      assessment: evaluation,
      metadata: {
        audioFile: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        model: 'gpt-4o-mini',
        transcriptionModel: 'whisper-1',
        evaluatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error assessing audio:', error);
    cleanupFile(req.file?.path);

    let errorMessage = 'Failed to assess audio';
    if (error.message.includes('ECONNRESET')) {
      errorMessage = 'Network connection issue. Please check your internet connection and try again.';
    } else if (error.message.includes('API key')) {
      errorMessage = 'OpenAI API key issue. Please check your configuration.';
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'OpenAI rate limit exceeded. Please wait a moment and try again.';
    }

    res.status(500).json({
      error: errorMessage,
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: 'The uploaded file exceeds the maximum allowed size',
        maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
      });
    }
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoint: 'POST /api/assess'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Audio Assessment API running on port ${PORT}`);
  console.log(`📝 Single endpoint: POST http://localhost:${PORT}/api/assessment`);
  console.log(`🔑 OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? '✅ Yes' : '❌ No'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
  console.log(`📏 Max file size: ${parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024} bytes`);
}); 