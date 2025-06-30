# Audio Assessment API

A Node.js Express server that provides AI-powered audio assessment using OpenAI's Whisper and GPT-4 models.

**🌐 Live API Endpoint**: `https://audioaccessment.onrender.com/api/assessment`

## Features

- 🎤 Audio transcription using OpenAI Whisper
- 🤖 AI-powered assessment and feedback
- 📊 Structured scoring system
- 🔄 Automatic retry mechanism with exponential backoff
- 🧹 Automatic file cleanup
- 🛡️ Comprehensive error handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

3. Start the server:
```bash
node server.js
```

## API Documentation

### POST /api/assessment

Assesses an audio response to a given question using AI.

**Production URL**: `https://audioaccessment.onrender.com/api/assessment`

#### Request Body

The request must be sent as `multipart/form-data` with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audio` | File | ✅ Yes | Audio file (mp3, wav, m4a, etc.) |
| `question` | String | ✅ Yes | The question that the audio response is answering |

#### Request Body Example

```javascript
// Using FormData
const formData = new FormData();
formData.append('audio', audioFile); // audioFile is a File object
formData.append('question', 'Explain the concept of photosynthesis');

// Using fetch
fetch('https://audioaccessment.onrender.com/api/assessment', {
  method: 'POST',
  body: formData
});
```

#### cURL Example

```bash
curl -X POST https://audioaccessment.onrender.com/api/assessment \
  -F "audio=@/path/to/your/audio.mp3" \
  -F "question=Explain the concept of photosynthesis"
```

#### Response Format

```json
{
  "success": true,
  "question": "Explain the concept of photosynthesis",
  "transcription": "Photosynthesis is the process by which plants convert sunlight into energy...",
  "assessment": {
    "strengths": [
      "Good understanding of the basic concept",
      "Clear explanation of the process",
      "Mentioned key components like chlorophyll"
    ],
    "areasToImprove": [
      "Could provide more specific examples",
      "Missing details about the chemical equation",
      "Could explain the role of carbon dioxide"
    ],
    "perfectDefinition": "Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy, usually from the sun, into chemical energy stored in glucose and other organic compounds. This process involves the conversion of carbon dioxide and water into glucose and oxygen, using chlorophyll to capture light energy.",
    "encouragement": "Great effort! You have a solid foundation. Keep building on this knowledge with more specific details.",
    "score": {
      "content": 4,
      "clarity": 3,
      "completeness": 5,
      "total": 12
    }
  },
  "metadata": {
    "audioFile": "audio-1703123456789-123456789.mp3",
    "originalName": "student_response.mp3",
    "fileSize": 2048576,
    "model": "gpt-4o-mini",
    "transcriptionModel": "whisper-1",
    "evaluatedAt": "2023-12-21T10:30:45.123Z"
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Indicates if the assessment was successful |
| `question` | String | The original question that was asked |
| `transcription` | String | The transcribed text from the audio |
| `assessment` | Object | The AI-generated assessment |
| `assessment.strengths` | Array | 2-4 positive points about the response |
| `assessment.areasToImprove` | Array | 2-4 points that need improvement |
| `assessment.perfectDefinition` | String | A model answer showing what a perfect response would look like |
| `assessment.encouragement` | String | A motivating message (1-2 sentences) |
| `assessment.score` | Object | Scoring breakdown |
| `assessment.score.content` | Number | Content score out of 5 |
| `assessment.score.clarity` | Number | Clarity score out of 5 |
| `assessment.score.completeness` | Number | Completeness score out of 5 |
| `assessment.score.total` | Number | Total score out of 15 |
| `metadata` | Object | Additional information about the request |

#### Error Responses

##### 400 Bad Request - Missing Audio File
```json
{
  "error": "No audio file provided",
  "message": "Please provide an audio file in the request"
}
```

##### 400 Bad Request - Missing Question
```json
{
  "error": "No question provided",
  "message": "Please provide a question in the request body"
}
```

##### 413 Payload Too Large - File Too Big
```json
{
  "error": "File too large",
  "message": "The uploaded file exceeds the maximum allowed size",
  "maxSize": 10485760
}
```

##### 500 Internal Server Error
```json
{
  "error": "Failed to assess audio",
  "details": "Specific error message"
}
```

## Quick Start

### Test the API

You can test the API using the hosted endpoint:

```bash
# Test with cURL
curl -X POST https://audioaccessment.onrender.com/api/assessment \
  -F "audio=@/path/to/your/audio.mp3" \
  -F "question=What is the capital of France?"
```

### JavaScript Example

```javascript
const formData = new FormData();
formData.append('audio', audioFile);
formData.append('question', 'What is the capital of France?');

fetch('https://audioaccessment.onrender.com/api/assessment', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | Required | Your OpenAI API key |
| `PORT` | 3000 | Server port |
| `UPLOAD_PATH` | ./uploads | Directory for temporary file uploads |
| `MAX_FILE_SIZE` | 10485760 | Maximum file size in bytes (10MB) |

### File Requirements

- **Supported formats**: Any audio format supported by OpenAI Whisper
- **Maximum size**: 10MB (configurable via `MAX_FILE_SIZE`)
- **File naming**: Automatically generated unique names

## Error Handling

The API includes comprehensive error handling for:

- Network connectivity issues
- OpenAI API rate limits
- Invalid file types
- File size limits
- Missing required fields
- JSON parsing errors

## Security Features

- Automatic file cleanup after processing
- File type validation
- File size limits
- CORS enabled
- Input validation

## Rate Limiting

The API includes automatic retry logic with exponential backoff for:
- Transcription requests (3 retries)
- Assessment requests (3 retries)

## Development

### Running Locally

```bash
npm install
node server.js
```

The server will start on `http://localhost:3000`

### Running in Production

```bash
NODE_ENV=production node server.js
```

## Dependencies

- `express`: Web framework
- `cors`: Cross-origin resource sharing
- `multer`: File upload handling
- `openai`: OpenAI API client
- `dotenv`: Environment variable management

## License

MIT License
