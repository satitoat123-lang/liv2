import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Maximize2, Wifi, RotateCcw, ChevronRight } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export default function VirtualTour() {
  const navigate = useNavigate();
  const store = useStore();
  const { roomId } = useParams();
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [showAR, setShowAR] = useState(false);
  const [arPoints, setArPoints] = useState([]);
  const [arDistance, setArDistance] = useState(null);

  const room = store.getRoom(roomId);

  // Simulate 360 view with gradient rotation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Room gradient background
      const hueShift = (rotation % 360) / 360;
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, `hsl(${240 + hueShift * 60}, 30%, 12%)`);
      gradient.addColorStop(0.5, `hsl(${250 + hueShift * 40}, 25%, 18%)`);
      gradient.addColorStop(1, `hsl(${230 + hueShift * 50}, 28%, 14%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Floor
      ctx.fillStyle = 'rgba(108, 92, 231, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.7);
      ctx.lineTo(w, h * 0.7);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Grid on floor
      ctx.strokeStyle = 'rgba(108, 92, 231, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 20; i++) {
        const x = (i / 20) * w + ((rotation * 2) % (w / 20));
        ctx.beginPath();
        ctx.moveTo(x, h * 0.7);
        ctx.lineTo(x + (w * 0.1), h);
        ctx.stroke();
      }

      // Wall elements that shift with rotation
      const wallOffset = (rotation * 0.5) % w;

      // Window
      const windowX = (w * 0.3 - wallOffset + w * 2) % (w * 1.5);
      if (windowX > -200 && windowX < w + 200) {
        ctx.fillStyle = 'rgba(162, 155, 254, 0.08)';
        ctx.strokeStyle = 'rgba(162, 155, 254, 0.2)';
        ctx.lineWidth = 2;
        ctx.fillRect(windowX, h * 0.15, 200, 250);
        ctx.strokeRect(windowX, h * 0.15, 200, 250);
        // Window cross
        ctx.beginPath();
        ctx.moveTo(windowX + 100, h * 0.15);
        ctx.lineTo(windowX + 100, h * 0.15 + 250);
        ctx.moveTo(windowX, h * 0.15 + 125);
        ctx.lineTo(windowX + 200, h * 0.15 + 125);
        ctx.stroke();
      }

      // Bed
      const bedX = (w * 0.6 - wallOffset + w * 2) % (w * 1.5);
      if (bedX > -250 && bedX < w + 250) {
        ctx.fillStyle = 'rgba(108, 92, 231, 0.12)';
        ctx.strokeStyle = 'rgba(108, 92, 231, 0.25)';
        ctx.lineWidth = 2;
        // Bed frame
        const bedY = h * 0.55;
        ctx.fillRect(bedX, bedY, 220, 120);
        ctx.strokeRect(bedX, bedY, 220, 120);
        // Pillow
        ctx.fillStyle = 'rgba(162, 155, 254, 0.15)';
        ctx.fillRect(bedX + 10, bedY + 10, 80, 50);
      }

      // Desk
      const deskX = (w * 1.0 - wallOffset + w * 2) % (w * 1.5);
      if (deskX > -200 && deskX < w + 200) {
        ctx.fillStyle = 'rgba(255, 107, 157, 0.08)';
        ctx.strokeStyle = 'rgba(255, 107, 157, 0.2)';
        ctx.lineWidth = 2;
        ctx.fillRect(deskX, h * 0.45, 160, 80);
        ctx.strokeRect(deskX, h * 0.45, 160, 80);
        // Monitor on desk
        ctx.fillStyle = 'rgba(255, 107, 157, 0.12)';
        ctx.fillRect(deskX + 50, h * 0.32, 60, 80);
        ctx.strokeRect(deskX + 50, h * 0.32, 60, 80);
      }

      // Compass indicator
      const cx = w - 80;
      const cy = 80;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillStyle = '#FF6B9D';
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(8, 12);
      ctx.lineTo(-8, 12);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(8, -12);
      ctx.lineTo(-8, -12);
      ctx.fill();
      ctx.restore();

      // AR measurement points
      if (showAR && arPoints.length > 0) {
        arPoints.forEach((p, i) => {
          ctx.fillStyle = '#00E676';
          ctx.beginPath();
          ctx.arc(p.x * 2, p.y * 2, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#00E676';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x * 2, p.y * 2, 16, 0, Math.PI * 2);
          ctx.stroke();
        });
        if (arPoints.length === 2) {
          ctx.strokeStyle = '#00E676';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.moveTo(arPoints[0].x * 2, arPoints[0].y * 2);
          ctx.lineTo(arPoints[1].x * 2, arPoints[1].y * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    };

    draw();
  }, [rotation, showAR, arPoints]);

  const handlePointerDown = (e) => {
    if (showAR) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
      if (arPoints.length < 2) {
        const newPoints = [...arPoints, { x, y }];
        setArPoints(newPoints);
        if (newPoints.length === 2) {
          const dx = newPoints[1].x - newPoints[0].x;
          const dy = newPoints[1].y - newPoints[0].y;
          const pixels = Math.sqrt(dx * dx + dy * dy);
          setArDistance((pixels * 0.015).toFixed(2)); // Simulated meters
        }
      }
      return;
    }
    setIsDragging(true);
    setLastX(e.clientX || e.touches?.[0]?.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX || e.touches?.[0]?.clientX;
    const diff = x - lastX;
    setRotation(prev => prev + diff * 0.5);
    setLastX(x);
  };

  const handlePointerUp = () => setIsDragging(false);

  return (
    <div style={styles.container}>
      {/* Tour canvas */}
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        id="tour-canvas"
      />

      {/* Top bar */}
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)} id="tour-back-btn">
          <ArrowLeft size={20} color="white" />
        </button>
        <div style={styles.roomBadge}>
          <span style={styles.roomBadgeText}>ห้อง {room?.number}</span>
        </div>
      </div>

      {/* AR Mode toggle */}
      <div style={styles.toolBar}>
        <button
          style={{...styles.toolBtn, background: showAR ? 'rgba(0,230,118,0.2)' : 'rgba(26,26,46,0.8)'}}
          onClick={() => { setShowAR(!showAR); setArPoints([]); setArDistance(null); }}
          id="ar-measure-btn"
        >
          <Maximize2 size={18} color={showAR ? '#00E676' : 'white'} />
          <span style={{fontSize: 10, color: showAR ? '#00E676' : 'white'}}>AR วัด</span>
        </button>
        <button
          style={styles.toolBtn}
          onClick={() => { setRotation(0); }}
          id="reset-view-btn"
        >
          <RotateCcw size={18} color="white" />
          <span style={{fontSize: 10, color: 'white'}}>รีเซ็ต</span>
        </button>
      </div>

      {/* AR Distance result */}
      {arDistance && (
        <div style={styles.arResult} className="animate-fade-in">
          <Maximize2 size={16} color="#00E676" />
          <span style={styles.arResultText}>ระยะ: {arDistance} เมตร</span>
          <button style={styles.arResetBtn} onClick={() => { setArPoints([]); setArDistance(null); }}>
            วัดใหม่
          </button>
        </div>
      )}

      {/* AR instruction */}
      {showAR && arPoints.length < 2 && (
        <div style={styles.arInstruction} className="animate-fade-in">
          <span>👆 กดจุด {arPoints.length === 0 ? 'แรก' : 'ที่สอง'} บนจอเพื่อวัดระยะ</span>
        </div>
      )}

      {/* Bottom info */}
      <div style={styles.bottomInfo}>
        {/* Speed test data */}
        <div style={styles.speedCard}>
          <Wifi size={16} color="#00E676" />
          <div>
            <span style={styles.speedLabel}>ความเร็วเน็ตเฉลี่ย</span>
            <span style={styles.speedValue}>{room?.internetSpeed || 85} Mbps</span>
          </div>
        </div>

        <div style={styles.actionRow}>
          <button style={styles.bookBtn} onClick={() => navigate(`/booking/${roomId}`)} id="tour-book-btn">
            จองห้องนี้
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Drag hint */}
      <div style={styles.dragHint}>
        <span>↔️ ลากเพื่อหมุนดูรอบห้อง</span>
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', position: 'relative', overflow: 'hidden', background: '#0a0a0f' },
  canvas: { width: '100%', height: '100%', cursor: 'grab', touchAction: 'none' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, padding: '52px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 14, background: 'rgba(26,26,46,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  roomBadge: { padding: '8px 16px', borderRadius: 12, background: 'rgba(108,92,231,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(108,92,231,0.3)' },
  roomBadgeText: { fontSize: 14, fontWeight: 600, color: '#A29BFE', fontFamily: "'Prompt', sans-serif" },
  toolBar: { position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10 },
  toolBtn: { width: 56, height: 56, borderRadius: 16, background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer' },
  arResult: { position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 14, background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.3)', backdropFilter: 'blur(10px)', zIndex: 10 },
  arResultText: { fontSize: 16, fontWeight: 700, color: '#00E676', fontFamily: "'Inter', sans-serif" },
  arResetBtn: { padding: '4px 12px', borderRadius: 8, background: 'rgba(0,230,118,0.2)', color: '#00E676', fontSize: 12, fontFamily: "'Prompt', sans-serif", cursor: 'pointer', border: 'none' },
  arInstruction: { position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)', padding: '10px 20px', borderRadius: 12, background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(0,230,118,0.2)', fontSize: 14, color: '#00E676', fontFamily: "'Prompt', sans-serif", whiteSpace: 'nowrap', zIndex: 10 },
  bottomInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(to top, rgba(10,10,15,0.95) 60%, transparent)', zIndex: 10 },
  speedCard: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.15)', marginBottom: 12 },
  speedLabel: { display: 'block', fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  speedValue: { fontSize: 18, fontWeight: 700, color: '#00E676', fontFamily: "'Inter', sans-serif" },
  actionRow: { display: 'flex', gap: 10 },
  bookBtn: { flex: 1, padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg, #6C5CE7, #8B7CF7)', color: 'white', fontSize: 16, fontWeight: 600, fontFamily: "'Prompt', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(108,92,231,0.4)' },
  dragHint: { position: 'absolute', bottom: 140, left: '50%', transform: 'translateX(-50%)', padding: '6px 14px', borderRadius: 20, background: 'rgba(26,26,46,0.7)', fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif", zIndex: 10, animation: 'pulse 3s ease-in-out infinite' },
};
