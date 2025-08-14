Gemini Live Voice Chat Application
This is a real-time voice chat application that allows a user to speak into a microphone, have their speech transcribed by the Gemini API, and receive a spoken response from the AI using the Web Speech API.

🌟 Features
Real-time Voice-to-Text: Converts spoken input into text using the Gemini API.

AI Text-to-Speech: Responds to the user in a natural-sounding voice.

Live Interruption: Allows the user to interrupt the AI's response at any time to provide new input.

WebSockets: Enables a persistent, low-latency connection between the client and server for real-time communication.

FFmpeg Integration: Handles audio conversion on the backend to a format compatible with the Gemini API.

💻 Technologies Used
Backend
Node.js & Express: The runtime environment and web framework.

WebSockets (ws): For real-time communication with the frontend.

@ffmpeg-installer/ffmpeg: Provides FFmpeg for audio processing.

@google/generative-ai: The official library for interacting with the Gemini API.

dotenv: For managing environment variables.

Frontend
React: The JavaScript library for building the user interface.

Web Audio API & Web Speech API: Used for microphone access, audio recording, and text-to-speech.

WebSockets: For communicating with the backend.

🛠 Prerequisites
Before you begin, ensure you have the following installed:

Node.js and npm: You can download them from nodejs.org.

A Gemini API Key: You'll need to create a key at the Google AI Studio to use the model.

🚀 Setup and Installation
This project is divided into a backend and a frontend folder. Follow the steps for each to get the application running.

1. Backend Setup
Navigate into the backend directory:

cd backend

Install the necessary Node.js dependencies:

npm install

Create a .env file in the backend folder and add your Gemini API key:

GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

Start the backend server:

npm start

The server will start on http://localhost:3000.

2. Frontend Setup
Navigate into the frontend directory:

cd frontend

Install the React application's dependencies:

npm install

Start the frontend development server:

npm start

The application will open in your browser, typically at http://localhost:3001.

🎙 How to Use
Ensure both the backend and frontend servers are running.

Open your browser to the frontend URL (http://localhost:3001).

Click the "🎤 Start" button and begin speaking.

The application will automatically stop recording when you pause and send the audio to the server.

You will see the AI's response in the text box and hear it spoken aloud.

If you want to interrupt the AI while it's speaking, click the "Interrupt" button to immediately stop the response.

📁 Project Structure
.
├── backend/
│   ├── node_modules/
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── node_modules/
    ├── src/
    │   ├── App.js
    │   └── ...
    ├── public/
    └── package.json
