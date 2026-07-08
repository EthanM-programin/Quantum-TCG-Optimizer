import { useEffect, useRef } from 'react';

export default function Playmat({ aiCommand, boardState, announcement, onCardClick, onTrashClick }) {
  const canvasRef = useRef(null);
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
      const isStatic = imgName.includes('.jpg');
      const srcPath = isStatic ? `/${imgName}` : `/cards/${imgName}.jpg`;
      if (!imageCache[srcPath]) {
        const img = new Image();
        img.src = srcPath;
        imageCache[srcPath] = img;
      }
      return imageCache[srcPath];
    };

    const drawZone = (x, y, w, h, label, isOpponent = false) => {
      ctx.strokeStyle = isOpponent ? 'rgba(255, 100, 100, 0.3)' : 'rgba(100, 150, 255, 0.3)';
      ctx.fillStyle = 'rgba(20, 25, 35, 0.5)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      
      ctx.fillStyle = isOpponent ? 'rgba(255, 100, 100, 0.5)' : 'rgba(100, 150, 255, 0.5)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      if (isOpponent) ctx.rotate(Math.PI);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    };

    const drawDonCard = (cx, cy, isRested, isOpponent = false) => {
      ctx.save();
      ctx.translate(cx, cy);
      let rotation = 0;
      if (isOpponent) rotation += Math.PI; 
      if (isRested) rotation += Math.PI / 2; 
      ctx.rotate(rotation);
      
      const donFrontImg = getCardImage('don_front.jpg');
      if (donFrontImg && donFrontImg.complete) {
        ctx.drawImage(donFrontImg, -50, -70, 100, 140);
      } else { 
        ctx.fillStyle = '#111'; 
        ctx.fillRect(-50, -70, 100, 140); 
        ctx.fillStyle = 'white'; 
        ctx.font = '16px Arial';
        ctx.fillText("DON!!", 0, 5); 
      }
      ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.strokeRect(-50, -70, 100, 140);
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cardRegistry.current = [];
      const board = latestBoard.current;

      // ==========================================
      //         DRAW STATIC ZONES (1600x1300 Grid)
      // ==========================================
      // Player B (Top) - Mirrored Coordinates
      drawZone(400, 10, 800, 120, "OPPONENT HAND", true);
      drawZone(150, 140, 150, 150, "TRASH", true);
      drawZone(400, 140, 800, 150, "COST AREA", true);
      drawZone(1300, 140, 150, 150, "DON!! DECK", true);
      drawZone(150, 310, 150, 150, "DECK", true);
      drawZone(600, 310, 150, 150, "STAGE", true);
      drawZone(850, 310, 150, 150, "LEADER", true);
      drawZone(1300, 310, 150, 320, "LIFE", true); // Tall box bridging rows
      drawZone(400, 480, 800, 150, "CHARACTER AREA", true);

      // Player A (Bottom)
      drawZone(400, 670, 800, 150, "CHARACTER AREA");
      drawZone(150, 670, 150, 320, "LIFE"); // Tall box bridging rows
      drawZone(600, 840, 150, 150, "LEADER");
      drawZone(850, 840, 150, 150, "STAGE");
      drawZone(1300, 840, 150, 150, "DECK");
      drawZone(150, 1010, 150, 150, "DON!! DECK");
      drawZone(400, 1010, 800, 150, "COST AREA");
      drawZone(1300, 1010, 150, 150, "TRASH");
      drawZone(400, 1180, 800, 110, "PLAYER HAND");

      // Mid-board line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath(); ctx.moveTo(0, 650); ctx.lineTo(1600, 650); ctx.stroke();

      if (board) {
        const { player_a, player_b } = board;
        const mainBackImg = getCardImage('card.jpg');
        const donBackImg = getCardImage('don_back.jpg');

        // ==========================================
        //         DRAW PLAYER A (BOTTOM)
        // ==========================================
        
        const leaderA = getCardImage(player_a.leader);
        if (leaderA && leaderA.complete) { 
          ctx.drawImage(leaderA, 625, 845, 100, 140); 
          cardRegistry.current.push({ id: player_a.leader, x: 625, y: 845, w: 100, h: 140 }); 
        }
        
        player_a.field_cards.forEach((id, i) => {
          const x = 425 + (i * 150); const y = 675;
          const img = getCardImage(id);
          if (img && img.complete) ctx.drawImage(img, x, y, 100, 140);
          cardRegistry.current.push({ id, x, y, w: 100, h: 140 });
        });

        // Life Cards & Floating Text
        ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center';
        ctx.fillText(`Life: ${player_a.life}`, 225, 660); // Placed above the zone
        for (let i = 0; i < player_a.life; i++) {
          if (mainBackImg && mainBackImg.complete) ctx.drawImage(mainBackImg, 175, 690 + (i * 30), 100, 140);
        }
        
        // Deck & Text
        ctx.fillText(`Deck: ${player_a.deck_size}`, 1375, 830);
        for (let i = 0; i < Math.min(5, player_a.deck_size); i++) {
          if (mainBackImg && mainBackImg.complete) ctx.drawImage(mainBackImg, 1325, 845 - (i * 4), 100, 140);
        }
        
        // DON Deck & Text
        ctx.fillText(`DON!!: ${player_a.don_deck}`, 225, 1000);
        for (let i = 0; i < Math.min(5, player_a.don_deck); i++) {
          if (donBackImg && donBackImg.complete) ctx.drawImage(donBackImg, 175, 1015 - (i * 4), 100, 140);
        }
        
        // Trash & Text
        ctx.fillText(`Trash: ${player_a.trash.length}`, 1375, 1000);
        // ALWAYS register the entire trash zone as clickable to open the modal!
        cardRegistry.current.push({ type: 'TRASH', items: player_a.trash, player: 'A', x: 1300, y: 1010, w: 150, h: 150 });
        
        if (player_a.trash.length > 0) {
          const topTrashA = player_a.trash[player_a.trash.length - 1];
          const trashImgA = getCardImage(topTrashA);
          if (trashImgA && trashImgA.complete) {
            ctx.drawImage(trashImgA, 1325, 1015, 100, 140);
          }
        }

        // Hand
        const handSpacingA = Math.min(80, 750 / Math.max(1, player_a.hand.length));
        player_a.hand.forEach((id, i) => {
          const x = 425 + (i * handSpacingA); const y = 1150;
          const img = getCardImage(id);
          if (img && img.complete) ctx.drawImage(img, x, y, 100, 140);
          cardRegistry.current.push({ id, x, y, w: 100, h: 140 });
        });

        // Active/Rested DON!! (Centers calculated)
        let donCxA = 475;
        for (let i = 0; i < player_a.active_don; i++) { drawDonCard(donCxA, 1085, false); donCxA += 50; }
        for (let i = 0; i < player_a.rested_don; i++) { drawDonCard(donCxA, 1085, true); donCxA += 80; }


        // ==========================================
        //         DRAW PLAYER B (TOP - MIRRORED)
        // ==========================================
        
        const leaderImgB = getCardImage(player_b.leader);
        ctx.save(); ctx.translate(925, 385); ctx.rotate(Math.PI);
        if (leaderImgB && leaderImgB.complete) { 
          ctx.drawImage(leaderImgB, -50, -70, 100, 140); 
          cardRegistry.current.push({ id: player_b.leader, x: 875, y: 315, w: 100, h: 140 }); 
        }
        ctx.restore();

        player_b.field_cards.forEach((id, i) => {
          const cx = 1150 - (i * 150); const cy = 555; 
          const img = getCardImage(id);
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI); 
          if (img && img.complete) ctx.drawImage(img, -50, -70, 100, 140);
          ctx.restore(); 
          cardRegistry.current.push({ id, x: cx - 50, y: cy - 70, w: 100, h: 140 });
        });

        // Counters (Drawn upright for the user to read easily)
        ctx.fillStyle = '#ff6666'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center';
        ctx.fillText(`Life: ${player_b.life}`, 1375, 300);
        ctx.fillText(`Deck: ${player_b.deck_size}`, 225, 300);
        ctx.fillText(`Trash: ${player_b.trash.length}`, 225, 130);
        ctx.fillText(`DON!!: ${player_b.don_deck}`, 1375, 130);

        // Life Cards (Upside down, stacking bottom-up in the opponent's view)
        ctx.save(); ctx.translate(1375, 470); ctx.rotate(Math.PI);
        for (let i = 0; i < player_b.life; i++) {
          if (mainBackImg && mainBackImg.complete) ctx.drawImage(mainBackImg, -50, -140 + (i * 30), 100, 140);
        }
        ctx.restore();

        // Deck (Upside down)
        ctx.save(); ctx.translate(225, 385); ctx.rotate(Math.PI);
        for (let i = 0; i < Math.min(5, player_b.deck_size); i++) {
          if (mainBackImg && mainBackImg.complete) ctx.drawImage(mainBackImg, -50, -70 + (i * 4), 100, 140);
        }
        ctx.restore();

        // DON Deck (Upside down)
        ctx.save(); ctx.translate(1375, 215); ctx.rotate(Math.PI);
        for (let i = 0; i < Math.min(5, player_b.don_deck); i++) {
          if (donBackImg && donBackImg.complete) ctx.drawImage(donBackImg, -50, -70 + (i * 4), 100, 140);
        }
        ctx.restore();

        // Trash Top Card (Upside down)
        // ALWAYS register the entire trash zone as clickable to open the modal!
        cardRegistry.current.push({ type: 'TRASH', items: player_b.trash, player: 'B', x: 150, y: 140, w: 150, h: 150 });
        
        if (player_b.trash.length > 0) {
          const topTrashB = player_b.trash[player_b.trash.length - 1];
          const trashImgB = getCardImage(topTrashB);
          ctx.save(); ctx.translate(225, 215); ctx.rotate(Math.PI);
          if (trashImgB && trashImgB.complete) {
            ctx.drawImage(trashImgB, -50, -70, 100, 140);
          }
          ctx.restore();
        }

        // Hand (Upside down)
        const handSpacingB = Math.min(80, 750 / Math.max(1, player_b.hand.length));
        player_b.hand.forEach((id, i) => {
          const cx = 1150 - (i * handSpacingB); const cy = 80;
          const img = getCardImage(id);
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI); 
          if (img && img.complete) ctx.drawImage(img, -50, -70, 100, 140);
          ctx.restore(); 
          cardRegistry.current.push({ id, x: cx - 50, y: cy - 70, w: 100, h: 140 });
        });

        // DON Area
        let donCxB = 1150;
        for (let i = 0; i < player_b.active_don; i++) { drawDonCard(donCxB, 215, false, true); donCxB -= 50; }
        for (let i = 0; i < player_b.rested_don; i++) { drawDonCard(donCxB, 215, true, true); donCxB -= 80; }
      }

      // --- DRAW CENTER ANNOUNCEMENTS ---
      if (latestAnnouncement.current) {
        ctx.fillStyle = 'rgba(11, 15, 25, 0.9)'; 
        ctx.fillRect(450, 620, 700, 60); 
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        ctx.strokeRect(450, 620, 700, 60);
        ctx.fillStyle = '#FFD700'; 
        ctx.font = 'bold 24px Arial'; 
        ctx.textAlign = 'center';
        ctx.fillText(latestAnnouncement.current, 800, 658);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;   
      const scaleY = canvas.height / rect.height; 
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      const hit = [...cardRegistry.current].reverse().find(c => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h);
      if (hit) {
        if (hit.type === 'TRASH') {
          if (onTrashClick) onTrashClick(hit.items, hit.player);
        } else {
          if (onCardClick) onCardClick(hit.id); 
        }
      }
    };

    canvas.addEventListener('click', handleCanvasClick);
    render();
    return () => { canvas.removeEventListener('click', handleCanvasClick); cancelAnimationFrame(animationFrameId); };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width={1600} 
      height={1300} 
      style={{ 
        maxWidth: '100%', 
        maxHeight: '100%',
        width: 'auto',
        height: 'auto',
        display: 'block', 
        margin: '0 auto',
        cursor: 'pointer',
        boxShadow: '0 0 30px rgba(0,0,0,0.7)',
        borderRadius: '12px'
      }} 
    />
  );
}