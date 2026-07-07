import React, { useState } from 'react';
import Playmat from './Playmat';
import './App.css';

export default function App() {
  const [isBattling, setIsBattling] = useState(false);
  const [round, setRound] = useState(0);
  const [aiCommand, setAiCommand] = useState(null);
  const [boardState, setBoardState] = useState(null);
  const [announcement, setAnnouncement] = useState("");

  const startArenaBattle = () => {
    setIsBattling(true);
    const ws = new WebSocket("ws://localhost:8000/arena-stream");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setRound(data.epoch);
      setBoardState(data.board_state);
      setAnnouncement(data.announcement);
      if (data.ai_command) {
        setAiCommand(data.ai_command);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket Error:", e);
      setIsBattling(false);
    };

    ws.onclose = () => setIsBattling(false);
  };

  return (
    <div className="app-container" style={{ background: '#0b0f19', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Vegapunk's Training Matrix</h1>
          <p style={{ color: '#888' }}>Persistent Brain Status: <span style={{ color: '#00ffcc' }}>ONLINE</span></p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Round: {round}</div>
          <button
            onClick={startArenaBattle}
            disabled={isBattling}
            style={{ 
              padding: '10px 20px', 
              background: isBattling ? '#333' : '#00ffcc', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: isBattling ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              color: '#000'
            }}
          >
            {isBattling ? 'Battling...' : 'Start Battle'}
          </button>
        </div>
      </div>

      <Playmat 
        aiCommand={aiCommand} 
        boardState={boardState} 
        announcement={announcement} 
      />
    </div>
  );
}