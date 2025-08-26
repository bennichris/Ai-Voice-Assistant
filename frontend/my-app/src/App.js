import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [serverReply, setServerReply] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US"; // You can change this
      recognition.interimResults = true;
      recognition.continuous = true;

      // ✅ Hybrid onresult (best approach)
      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + " ";
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        // Show interim (live feedback) + append final only once
        setTranscript((prev) => (finalTranscript ? prev + finalTranscript : prev + interimTranscript));
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setServerReply("");
    recognitionRef.current.start();
    setListening(true);
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  };

  const sendToBackend = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });
      const data = await res.json();
      setServerReply(JSON.stringify(data));
    } catch (err) {
      setServerReply("❌ Could not reach backend. Is it running?");
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>AI Voice-to-Task Assistant (MVP)</h1>

      {!supported && (
        <p>
          ⚠️ Your browser doesn’t support the Web Speech API. Try Chrome/Edge on desktop for this demo.
        </p>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button onClick={startListening} disabled={!supported || listening}>
          🎙️ Start
        </button>
        <button onClick={stopListening} disabled={!supported || !listening}>
          ⏹️ Stop
        </button>
        <button onClick={sendToBackend} disabled={!transcript}>
          📤 Send to Backend
        </button>
      </div>

      <h3 style={{ marginTop: 24 }}>Transcript</h3>
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        rows={6}
        style={{ width: "100%" }}
        placeholder="Your speech will appear here..."
      />

      <h3 style={{ marginTop: 24 }}>Backend Response</h3>
      <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 8 }}>
        {serverReply || "(none yet)"}
      </pre>
    </div>
  );
}
