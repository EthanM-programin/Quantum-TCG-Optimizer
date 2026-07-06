import { useEffect, useRef } from 'react';

export default function Playmat({ aiCommand }) {
  const canvasRef = useRef(null);
  // Using a ref to hold game state that needs to persist without re-renders
  const gameState = useRef({
    cards: Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 845, y: 760,
      targetX: 230 + (i * 110),
      targetY: 1060,
      width: 70, height: 100
    })),
    playedCount: 0
  });

  useEffect(() => {
    // We check if the command is "play_card"
    if (aiCommand === "play_card") {
      // Find the card that matches the backend's target_slot
      // For now, we'll just take the next card in order
      let card = gameState.current.cards[gameState.current.playedCount];
      if (card) {
        card.targetX = 220 + (gameState.current.playedCount * 110);
        card.targetY = 615;
        gameState.current.playedCount++;
      }
    }
  }, [aiCommand]);

  // Main Render Loop (Independent of React state updates)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cardImg = new Image();
    cardImg.src = '/card.jpg';
    let animationFrameId;

    const drawZone = (x, y, width, height, label, isOpponent = false) => {
      ctx.strokeStyle = isOpponent ? 'rgba(255, 100, 100, 0.4)' : 'rgba(100, 150, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(30, 30, 35, 0.8)';
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = isOpponent ? 'rgba(255, 100, 100, 0.8)' : 'rgba(100, 150, 255, 0.8)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (isOpponent) {
        ctx.save();
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate(Math.PI);
        ctx.fillText(label, 0, 0);
        ctx.restore();
      } else {
        ctx.fillText(label, x + width / 2, y + height / 2);
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw zones (omitted for brevity, keep your existing drawZone calls here)
      drawZone(830, 120, 120, 130, "DON!!", true);
      drawZone(200, 120, 550, 130, "COST AREA", true);
      drawZone(50, 120, 110, 130, "TRASH", true);
      drawZone(830, 270, 120, 150, "LIFE", true);
      drawZone(330, 270, 110, 140, "LEADER", true);
      drawZone(200, 270, 110, 140, "STAGE", true);
      drawZone(50, 270, 110, 140, "DECK", true);
      drawZone(50, 430, 750, 130, "CHARACTER AREA", true);
      drawZone(200, 10, 600, 90, "OPPONENT HAND", true);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath(); ctx.moveTo(0, 580); ctx.lineTo(1000, 580); ctx.stroke();
      
      drawZone(200, 600, 750, 130, "CHARACTER AREA");
      drawZone(50, 600, 120, 150, "LIFE");
      drawZone(560, 750, 110, 140, "LEADER");
      drawZone(690, 750, 110, 140, "STAGE");
      drawZone(840, 750, 110, 140, "DECK");
      drawZone(50, 910, 120, 130, "DON!!");
      drawZone(250, 910, 550, 130, "COST AREA");
      drawZone(840, 910, 110, 130, "TRASH");
      drawZone(200, 1060, 600, 100, "PLAYER HAND");

      // Animate cards
      gameState.current.cards.forEach(card => {
        card.x += (card.targetX - card.x) * 0.12;
        card.y += (card.targetY - card.y) * 0.12;
        if (cardImg.complete) ctx.drawImage(cardImg, card.x, card.y, card.width, card.height);
        else { ctx.fillStyle = '#1e1e2f'; ctx.fillRect(card.x, card.y, card.width, card.height); }
        ctx.strokeStyle = '#00ffcc';
        ctx.strokeRect(card.x, card.y, card.width, card.height);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} width={1000} height={1180} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />;
}