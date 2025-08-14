require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const fs = require('fs');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

const wss = new WebSocket.Server({ server });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // ms

wss.on("connection", (ws) => {
  console.log("✅ Client connected");

  let audioChunks = [];

  ws.on("message", async (message) => {
    if (message.toString() === "END_OF_TURN") {
      console.log("🎤 Received complete audio, converting...");

      try {
        const webmPath = "temp.webm";
        const wavPath = "temp.wav";

        // Save incoming audio
        fs.writeFileSync(webmPath, Buffer.concat(audioChunks));

        // Convert to WAV
        execSync(`${ffmpegPath} -y -i "${webmPath}" -ar 16000 -ac 1 "${wavPath}"`);
        const wavData = fs.readFileSync(wavPath);

        // Retry logic for Gemini API
        let result;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            result = await model.generateContent({
              contents: [{
                role: "user",
                parts: [{ inlineData: { mimeType: "audio/wav", data: wavData.toString("base64") } }]
              }]
            });
            break; // success
          } catch (err) {
            if (err.status === 503 && attempt < MAX_RETRIES) {
              console.warn(`Gemini busy. Retry #${attempt} in ${RETRY_DELAY / 1000}s...`);
              await new Promise(res => setTimeout(res, RETRY_DELAY * attempt));
            } else {
              throw err;
            }
          }
        }

        const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "(no response)";
        ws.send(JSON.stringify({ text }));

        // Clean up temporary files
        fs.unlinkSync(webmPath);
        fs.unlinkSync(wavPath);
        audioChunks = [];

      } catch (err) {
        console.error("🔥 Gemini API error:", err);
        ws.send(JSON.stringify({ error: "Gemini request failed" }));
      }

      return;
    }

    // Collect audio chunks
    if (message instanceof Buffer) {
      audioChunks.push(message);
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
  });

  ws.on("error", (err) => {
    console.error("🔥 WebSocket error:", err);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});