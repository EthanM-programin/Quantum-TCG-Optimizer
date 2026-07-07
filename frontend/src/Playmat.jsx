import { useEffect, useRef, useState } from 'react';

export default function Playmat({ aiCommand, boardState, announcement }) {
  const canvasRef = useRef(null);
  const [zoomedCard, setZoomedCard] = useState(null);
  const cardRegistry = useRef([]);
  
  const latestBoard = useRef(boardState);
  const latestAnnouncement = useRef(announcement);

  useEffect(() => { latestBoard.current = boardState; }, [boardState]);
  useEffect(() => { latestAnnouncement.current = announcement; }, [announcement]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const imageCache = {};
    const getCardImage = (imgName) => {
      if (!imgName) return null;
      const srcPath = imgName.includes('.jpg') ? `/${imgName}` : `/cards/${imgName}.jpg`;
      if (!imageCache[srcPath]) {
        const img = new Image();
        img.src = srcPath;
        imageCache[srcPath] = img;
      }
      return imageCache[srcPath];
    };

    const drawZone = (x, y, w, h, label, isOpponent = false) => {
      ctx.strokeStyle = isOpponent ? 'rgba(255, 100, 100, 0.4)' : 'rgba(100, 150, 255, 0.4)';
      ctx.fillStyle = isOpponent ? 'rgba(255, 100, 100, 0.1)' : 'rgba(100, 150, 255, 0.1)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = isOpponent ? '#ff6666' : '#66aaff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      if (isOpponent) ctx.rotate(Math.PI);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    };

    const drawDonCard = (x, y, isRested, isOpponent = false) => {
      ctx.save();
      ctx.translate(x + 35, y + 50);
      let rotation = 0;
      if (isOpponent) rotation += Math.PI; 
      if (isRested) rotation += Math.PI / 2; 
      ctx.rotate(rotation);
      const donFrontImg = getCardImage('don_front.jpg');
      if (donFrontImg && donFrontImg.complete) ctx.drawImage(donFrontImg, -35, -50, 70, 100);
      else { ctx.fillStyle = '#111'; ctx.fillRect(-35, -50, 70, 100); }
      ctx.strokeStyle = 'white'; ctx.strokeRect(-35, -50, 70, 100);
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cardRegistry.current = [];
      const board = latestBoard.current;

      // Draw Zones
      drawZone(50, 590, 120, 300, "LIFE");
      drawZone(560, 750, 110, 140, "LEADER");
      drawZone(840, 750, 110, 140, "DECK");
      drawZone(50, 910, 120, 130, "DON!!");
      drawZone(250, 910, 550, 130, "COST AREA");
      drawZone(840, 910, 110, 130, "TRASH");
      drawZone(220, 590, 580, 150, "CHARACTER AREA");

      drawZone(830, 310, 120, 300, "LIFE", true);
      drawZone(330, 310, 110, 140, "LEADER", true);
      drawZone(50, 310, 110, 140, "DECK", true);
      drawZone(830, 160, 120, 130, "DON!!", true);
      drawZone(220, 460, 580, 150, "CHARACTER AREA", true);

      if (board) {
        const { player_a, player_b } = board;
        const mainBackImg = getCardImage('card.jpg');
        const donBackImg = getCardImage('don_back.jpg');

        // Draw Player A
        const leaderA = getCardImage(player_a.leader);
        if (leaderA && leaderA.complete) { ctx.drawImage(leaderA, 580, 770, 70, 100); cardRegistry.current.push({ id: player_a.leader, x: 580, y: 770, w: 70, h: 100 }); }
        
        player_a.field_cards.forEach((id, i) => {
          const x = 240 + (i * 110); const y = 615;
          const img = getCardImage(id);
          if (img && img.complete) ctx.drawImage(img, x, y, 70, 100);
          cardRegistry.current.push({ id, x, y, w: 70, h: 100 });
        });

        // Counters
        ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 16px Arial';
        ctx.fillText(`Life: ${player_a.life}`, 110, 580);
        ctx.fillText(`Deck: ${player_a.deck_size}`, 895, 760);
        ctx.fillText(player_a.trash.length, 895, 960);
        ctx.fillText(player_a.don_deck, 110, 960);
        
        for (let i = 0; i < player_a.life; i++) if (mainBackImg && mainBackImg.complete) ctx.drawImage(mainBackImg, 75, 605 + (i * 45), 70, 100);
        for (let i = 0; i < Math.min(5, player_a.deck_size); i++) if (mainBackImg && mainBackImg.complete) ctx.drawImage(mainBackImg, 860, 770 - (i * 3), 70, 100);
        for (let i = 0; i < Math.min(5, player_a.don_deck); i++) if (donBackImg && donBackImg.complete) ctx.drawImage(donBackImg, 75, 925 - (i * 3), 70, 100);
        
        if (player_a.trash.length > 0) {
          const img = getCardImage(player_a.trash[player_a.trash.length - 1]);
          if (img && img.complete) ctx.drawImage(img, 860, 925, 70, 100);
        }

        let donXA = 260;
        for (let i = 0; i < player_a.active_don; i++) { drawDonCard(donXA, 925, false); donXA += 40; }
        for (let i = 0; i < player_a.rested_don; i++) { drawDonCard(donXA, 925, true); donXA += 60; }

        ctx.save(); ctx.translate(385, 380); ctx.rotate(Math.PI);
        const leaderB = getCardImage(player_b.leader);
        if (leaderB && leaderB.complete) ctx.drawImage(leaderB, -35, -50, 70, 100);
        ctx.restore();
      }

      ctx.fillStyle = '#FFD700'; ctx.font = 'bold 24px Arial'; ctx.textAlign = 'center';
      if (latestAnnouncement.current) ctx.fillText(latestAnnouncement.current, 500, 590);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div style={{ position: 'relative', background: '#0b0f19', padding: '10px' }}>
      <canvas 
        ref={canvasRef} 
        width={1000} 
        height={1200} 
        onClick={(e) => {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 1000;
            const y = ((e.clientY - rect.top) / rect.height) * 1200;
            const hit = cardRegistry.current.find(c => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h);
            if (hit) setZoomedCard(hit.id);
        }}
        style={{ maxWidth: '100%', height: 'auto', display: 'block', cursor: 'pointer' }} 
      />
      {zoomedCard && (
        <div onClick={() => setZoomedCard(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <img src={`/cards/${zoomedCard}.jpg`} style={{ height: '80vh', border: '5px solid white' }} alt="Zoomed" />
        </div>
      )}
    </div>
  );
}