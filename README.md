# AI Audio Assessment System

A backend API that allows you to upload an audio answer and a question, and receive a detailed AI-powered evaluation using OpenAI's GPT-4o-mini. The system provides comprehensive feedback including analysis, scoring, and improvement suggestions in structured JSON format.

## Features

- 🤖 **AI Evaluation**: Powered by OpenAI GPT-4o-mini for intelligent assessment
- 📊 **Detailed Analysis**: Comprehensive feedback with scoring and suggestions
- ⚡ **Simple API**: Upload audio and question, get JSON feedback

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

## Installation

1. **Clone or download the project files**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key and any other settings:
     ```env
     OPENAI_API_KEY=your_openai_api_key_here
     PORT=3000
     NODE_ENV=development
     MAX_FILE_SIZE=10485760
     UPLOAD_PATH=./uploads
     ```
4. **Start the server**:
   ```bash
   npm start
   ```
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoint

- `POST /api/assess` — Submit audio and question for AI evaluation (returns structured JSON)

## API Usage Example

**Request:**
- Method: POST
- URL: http://localhost:3000/api/assess
- Body: form-data
  - `audio` (file): The audio file to upload
  - `question` (text): The question for the assessment

**Sample JSON Response:**
```json
{
  "success": true,
  "question": "What is photosynthesis?",
  "transcription": "Photosynthesis is the process by which green plants...",
  "assessment": {
    "strengths": [
      "Clear explanation of the process",
      "Good use of scientific terms"
    ],
    "areasToImprove": [
      "Could mention the role of sunlight more explicitly",
      "Add more detail about the chemical equation"
    ],
    "perfectDefinition": "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. The process converts carbon dioxide and water into glucose and oxygen.",
    "encouragement": "Great job! Keep practicing to add more scientific details.",
    "score": {
      "content": 4,
      "clarity": 4,
      "completeness": 3,
      "total": 11
    }
  },
  "metadata": {
    "audioFile": "audio-1705312200000-123456789.mp3",
    "originalName": "your-audio.mp3",
    "fileSize": 1024000,
    "model": "gpt-4o-mini",
    "transcriptionModel": "whisper-1",
    "evaluatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Scoring System
- **content**: out of 5
- **clarity**: out of 5
- **completeness**: out of 5
- **total**: out of 15 (sum of the three above)

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `MAX_FILE_SIZE`: Maximum audio file size in bytes (default: 10MB)
- `UPLOAD_PATH`: Directory for temporary audio files (default: ./uploads)

### OpenAI API Requirements

- Requires a valid OpenAI API key
- Uses GPT-4o-mini model for evaluation
- Audio files are automatically cleaned up after processing

## Troubleshooting

1. **OpenAI API Error**
   - Verify your API key is correct in `.env`
   - Check your OpenAI account has sufficient credits
   - Ensure the API key has access to GPT-4o-mini

2. **Audio Upload Issues**
   - Ensure you are uploading a valid audio file (mp3, wav, etc.)
   - Check file size is under the configured limit

3. **Server Won't Start**
   - Check if port 3000 is already in use
   - Verify all dependencies are installed
   - Check the `.env` file is properly configured

## File Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── README.md              # This file
├── uploads/               # Temporary audio file storage (auto-created)
```

## License

MIT License - feel free to use this project for educational purposes.

## Support

If you encounter any issues or have questions, please check the troubleshooting section above or create an issue in the project repository.

---

**Note**: This application requires an active internet connection and a valid OpenAI API key to function properly. 