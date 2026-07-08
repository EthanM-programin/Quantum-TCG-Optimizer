import React, { useState, useRef } from 'react';
import Playmat from './Playmat';
import './App.css';

export default function App() {
  const [isBattling, setIsBattling] = useState(false);
  const [round, setRound] = useState(0);
  const [aiCommand, setAiCommand] = useState(null);
  const [boardState, setBoardState] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [zoomedCard, setZoomedCard] = useState(null); 
  const [viewingTrash, setViewingTrash] = useState(null); // Controls the Trash Modal
  
  const wsRef = useRef(null);

  const startArenaBattle = () => {
    if (wsRef.current) wsRef.current.close();
    
    setIsBattling(true);
    const ws = new WebSocket("ws://localhost:8000/arena-stream");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.epoch !== undefined) setRound(data.epoch);
      if (data.board_state) setBoardState(data.board_state);
      if (data.announcement) setAnnouncement(data.announcement);
      if (data.ai_command) setAiCommand(data.ai_command.action);
    };

    ws.onerror = (e) => {
      console.error("WebSocket Error:", e);
      setIsBattling(false);
    };

    ws.onclose = () => setIsBattling(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', position: 'fixed', top: 0, left: 0, backgroundColor: '#0b0f19', color: '#fff', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* LEFT SIDEBAR: Controls & Inspector */}
      <aside style={{ width: '450px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1f2833', backgroundColor: '#111827', padding: '20px', flexShrink: 0 }}>
        
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', margin: '0 0 5px 0', color: '#00ffcc' }}>Vegapunk's Matrix</h1>
          <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>Status: ONLINE</p>
        </div>
        
        <div style={{ background: '#1f2937', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '15px' }}>Round: {round}</div>
          <button
            onClick={startArenaBattle}
            disabled={isBattling}
            style={{ 
              width: '100%',
              padding: '12px', 
              background: isBattling ? '#374151' : '#00ffcc', 
              color: isBattling ? '#9ca3af' : '#000',
              border: 'none', 
              borderRadius: '6px', 
              cursor: isBattling ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'background 0.2s'
            }}
          >
            {isBattling ? 'Simulation Active...' : 'Start Battle'}
          </button>
        </div>

        {}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: '0px', overflow: 'hidden' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0 }}>Card Inspector</h3>
          {zoomedCard ? (
            <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              <img 
                src={`/cards/${zoomedCard}.jpg`} 
                alt="Inspected Card" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px', filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))' }} 
              />
            </div>
          ) : (
            <div style={{ flex: 1, width: '100%', border: '2px dashed #374151', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#4b5563', fontSize: '16px', textAlign: 'center', padding: '20px' }}>Click any card on the board to view its details here.</p>
            </div>
          )}
        </div>
      </aside>

      {}
      <main style={{ flex: 1, padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        <Playmat 
          aiCommand={aiCommand} 
          boardState={boardState} 
          announcement={announcement} 
          onCardClick={setZoomedCard} 
          onTrashClick={(cards, player) => setViewingTrash({ cards, player })}
        />

        {/* TRASH MODAL OVERLAY */}
        {viewingTrash && (
          <div 
            onClick={() => setViewingTrash(null)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          >
            <div 
              onClick={e => e.stopPropagation()} 
              style={{ backgroundColor: '#111827', border: '2px solid #00ffcc', borderRadius: '12px', padding: '20px', width: '80%', maxWidth: '900px', height: '80%', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,255,204,0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '15px', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>Player {viewingTrash.player}'s Trash <span style={{color: '#00ffcc'}}>({viewingTrash.cards.length})</span></h2>
                <button onClick={() => setViewingTrash(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '28px', cursor: 'pointer' }}>&times;</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px', overflowY: 'auto', padding: '10px', flex: 1, alignContent: 'start' }}>
                {viewingTrash.cards.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '18px', gridColumn: '1 / -1', textAlign: 'center', marginTop: '50px' }}>Trash is empty.</p>
                ) : (
                  [...viewingTrash.cards].reverse().map((cardId, idx) => (
                    <img 
                      key={idx} 
                      src={`/cards/${cardId}.jpg`} 
                      alt={cardId} 
                      onClick={() => setZoomedCard(cardId)}
                      style={{ width: '100%', borderRadius: '6px', cursor: 'pointer', border: zoomedCard === cardId ? '3px solid #00ffcc' : '1px solid #374151' }} 
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}