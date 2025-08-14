import React, { useState, useEffect, useRef } from "react";

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiText, setAiText] = useState("");
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:3000");

    wsRef.current.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.text) {
          setAiText(msg.text);
          // Speak the AI response
          const utterance = new SpeechSynthesisUtterance(msg.text);
          utterance.lang = "en-US"; // set language

          // Set a callback for when the speech ends
          utterance.onend = () => {
            setIsSpeaking(false);
          };

          // Start speaking and update state
          setIsSpeaking(true);
          window.speechSynthesis.speak(utterance);
        }
        if (msg.error) console.error("❌ Server error:", msg.error);
      } catch (err) {
        console.error("❌ WebSocket message parsing error:", err);
      }
    };

    wsRef.current.onclose = () => {
      console.log("❌ WebSocket closed");
    };

    wsRef.current.onerror = (err) => {
      console.error("🔥 WebSocket error:", err);
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const stopRecordingAndSend = () => {
    setIsRecording(false);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("END_OF_TURN");
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setAiText(""); // Clear previous text
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

      try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        recorderRef.current = new MediaRecorder(mediaStreamRef.current, {
          mimeType: "audio/webm;codecs=opus",
          audioBitsPerSecond: 16000
        });

        recorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0 && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(event.data);
          }
        };

        recorderRef.current.start(250);
      } catch (err) {
        console.error("❌ Mic error:", err);
        setIsRecording(false);
      }
    } else {
      stopRecordingAndSend();
    }
  };
  
  const handleInterruption = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (isRecording) {
      stopRecordingAndSend();
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>🎙 Rev Live Voice Chat</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          onClick={toggleRecording}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          {isRecording ? "🛑 Stop" : "🎤 Start"}
        </button>
        {isSpeaking && (
          <button
            onClick={handleInterruption}
            style={{ padding: "10px 20px", fontSize: "16px" }}
          >
            Interrupt
          </button>
        )}
      </div>
      <div style={{ marginTop: "20px", fontSize: "18px", color: "#333" }}>
        <strong>AI Response:</strong>
        <p>{aiText}</p>
      </div>
    </div>
  );
};

export default App;
