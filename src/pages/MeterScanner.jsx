import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check, RotateCcw, Zap, Droplets, ChevronDown } from 'lucide-react';
import { useStore } from '../hooks/useStore';

const SCAN_STAGES = ['ready', 'scanning', 'processing', 'result'];

export default function MeterScanner() {
  const navigate = useNavigate();
  const store = useStore();
  const currentBuilding = store.getBuildings()[0];
  const rooms = store.getRooms(currentBuilding.id).filter(r => r.status === 'occupied');
  
  const canvasRef = useRef(null);
  const [stage, setStage] = useState('ready');
  const [meterType, setMeterType] = useState('electric'); // electric | water
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [animProgress, setAnimProgress] = useState(0);

  // Camera simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || stage !== 'ready' && stage !== 'scanning') return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;

    const draw = () => {
      // Dark camera view simulation
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, w, h);

      // Noise pattern
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
        ctx.fillRect(x, y, 2, 2);
      }

      // Simulated meter face
      const cx = w / 2;
      const cy = h / 2;

      // Meter box
      ctx.fillStyle = 'rgba(245, 245, 240, 0.08)';
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 140, cy - 80, 280, 160, 8);
      ctx.fill();
      ctx.stroke();

      // Meter digits
      const digits = meterType === 'electric' ? '01450' : '00287';
      ctx.font = 'bold 48px Inter, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(digits, cx, cy + 15);

      // Meter label
      ctx.font = '14px Prompt, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillText(meterType === 'electric' ? 'kWh' : 'cu.m.', cx, cy + 45);

      // Scanning frame
      if (stage === 'scanning') {
        const t = Date.now() / 1000;
        const scanLine = (Math.sin(t * 3) + 1) / 2;

        // Green scanning frame
        ctx.strokeStyle = '#00E676';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.roundRect(cx - 155, cy - 95, 310, 190, 12);
        ctx.stroke();
        ctx.setLineDash([]);

        // Scan line
        const lineY = cy - 90 + scanLine * 180;
        ctx.strokeStyle = 'rgba(0,230,118,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 150, lineY);
        ctx.lineTo(cx + 150, lineY);
        ctx.stroke();

        // Glow
        const gradient = ctx.createLinearGradient(cx - 150, lineY - 20, cx + 150, lineY + 20);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, 'rgba(0,230,118,0.1)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(cx - 150, lineY - 20, 300, 40);

        // Corner markers
        const corners = [
          [cx - 155, cy - 95, 1, 1],
          [cx + 155, cy - 95, -1, 1],
          [cx - 155, cy + 95, 1, -1],
          [cx + 155, cy + 95, -1, -1],
        ];
        ctx.strokeStyle = '#00E676';
        ctx.lineWidth = 4;
        corners.forEach(([x, y, dx, dy]) => {
          ctx.beginPath();
          ctx.moveTo(x, y + dy * 25);
          ctx.lineTo(x, y);
          ctx.lineTo(x + dx * 25, y);
          ctx.stroke();
        });
      } else {
        // Ready state - target frame
        ctx.strokeStyle = 'rgba(108,92,231,0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.roundRect(cx - 155, cy - 95, 310, 190, 12);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    draw();
    const interval = stage === 'scanning' ? setInterval(draw, 50) : null;
    return () => interval && clearInterval(interval);
  }, [stage, meterType]);

  const handleScan = () => {
    setStage('scanning');
    setTimeout(async () => {
      setStage('processing');
      let progress = 0;
      const interval = setInterval(async () => {
        progress += 5;
        setAnimProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          const room = store.getRoom(selectedRoomId);
          
          // Generate a fake but realistic reading based on previous
          const prev = meterType === 'electric' ? (room.meterElectricPrev || 1000) : (room.meterWaterPrev || 100);
          const currentReading = prev + (meterType === 'electric' ? 50 : 12);
          
          const result = await store.scanMeter(selectedRoomId, meterType, currentReading);
          setScanResult(result);
          setStage('result');
        }
      }, 60);
    }, 2500);
  };

  const handleConfirm = async () => {
    const billData = {
      rent: store.getRoom(selectedRoomId)?.price || 0,
      electricAmount: meterType === 'electric' ? scanResult.amount : 0,
      waterAmount: meterType === 'water' ? scanResult.amount : 0,
      total: (store.getRoom(selectedRoomId)?.price || 0) + scanResult.amount,
      month: 'เมษายน 2569',
      dueDate: '2026-04-05',
      electricReading: meterType === 'electric' ? scanResult.reading : null,
      waterReading: meterType === 'water' ? scanResult.reading : null
    };
    
    await store.sendBill(selectedRoomId, billData);
    navigate('/landlord');
  };

  const selectedRoomNum = store.getRoom(selectedRoomId)?.number || '---';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)} id="meter-back-btn">
          <ArrowLeft size={20} />
        </button>
        <h1 style={styles.title}>สแกนมิเตอร์ AI</h1>
      </div>

      {/* Room & Type Selection */}
      <div style={styles.selectionRow}>
        <button style={styles.roomSelect} onClick={() => setShowRoomPicker(!showRoomPicker)} id="room-select-btn">
          <span>ห้อง {selectedRoomNum}</span>
          <ChevronDown size={16} />
        </button>
        <div style={styles.typeToggle}>
          <button
            style={{
              ...styles.typeBtn,
              background: meterType === 'electric' ? 'rgba(255,214,0,0.15)' : 'transparent',
              color: meterType === 'electric' ? '#FFD600' : 'var(--text-muted)',
              borderColor: meterType === 'electric' ? 'rgba(255,214,0,0.3)' : 'transparent',
            }}
            onClick={() => setMeterType('electric')}
            id="type-electric-btn"
          >
            <Zap size={14} /> ไฟฟ้า
          </button>
          <button
            style={{
              ...styles.typeBtn,
              background: meterType === 'water' ? 'rgba(0,150,255,0.15)' : 'transparent',
              color: meterType === 'water' ? '#4FC3F7' : 'var(--text-muted)',
              borderColor: meterType === 'water' ? 'rgba(0,150,255,0.3)' : 'transparent',
            }}
            onClick={() => setMeterType('water')}
            id="type-water-btn"
          >
            <Droplets size={14} /> น้ำ
          </button>
        </div>
      </div>

      {/* Room picker dropdown */}
      {showRoomPicker && (
        <div style={styles.roomDropdown} className="animate-fade-in">
          {rooms.map(r => (
            <button
              key={r.id}
              style={{
                ...styles.roomOption,
                background: selectedRoomId === r.id ? 'rgba(108,92,231,0.15)' : 'transparent',
              }}
              onClick={() => { setSelectedRoomId(r.id); setShowRoomPicker(false); }}
              id={`pick-room-${r.id}`}
            >
              ห้อง {r.number}
            </button>
          ))}
        </div>
      )}

      {/* Camera / Result Area */}
      <div style={styles.cameraContainer}>
        {(stage === 'ready' || stage === 'scanning') && (
          <canvas ref={canvasRef} style={styles.cameraCanvas} id="meter-camera-canvas" />
        )}

        {stage === 'processing' && (
          <div style={styles.processingContainer} className="animate-fade-in">
            <div style={styles.processingRing}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke="url(#processGrad)" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${animProgress * 3.39} 339`}
                  transform="rotate(-90 60 60)"
                  style={{transition: 'stroke-dasharray 0.1s ease'}}
                />
                <defs>
                  <linearGradient id="processGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6C5CE7"/>
                    <stop offset="100%" stopColor="#00E676"/>
                  </linearGradient>
                </defs>
              </svg>
              <span style={styles.processPercent}>{animProgress}%</span>
            </div>
            <p style={styles.processText}>AI กำลังอ่านค่ามิเตอร์...</p>
            <p style={styles.processSubtext}>ตรวจจับตัวเลข • วิเคราะห์ข้อมูล • คำนวณค่าใช้จ่าย</p>
          </div>
        )}

        {stage === 'result' && scanResult && (
          <div style={styles.resultContainer} className="animate-fade-in">
            <div style={styles.resultSuccess}>
              <Check size={32} color="#00E676" />
            </div>
            <h2 style={styles.resultTitle}>สแกนสำเร็จ!</h2>

            <div style={styles.resultCard}>
              <div style={styles.resultRow}>
                <span>ค่าที่อ่านได้</span>
                <span style={styles.resultValue}>{scanResult.reading.toLocaleString()} {scanResult.unit}</span>
              </div>
              <div style={styles.resultRow}>
                <span>เดือนก่อน</span>
                <span>{scanResult.previous.toLocaleString()} {scanResult.unit}</span>
              </div>
              <div style={styles.resultRow}>
                <span>ใช้ไป</span>
                <span style={{color: '#FFD600', fontWeight: 600}}>{scanResult.usage} {scanResult.unit}</span>
              </div>
              <div style={styles.resultRow}>
                <span>อัตรา</span>
                <span>฿{scanResult.rate}/{scanResult.unit}</span>
              </div>
              <div style={styles.resultTotal}>
                <span>รวมเป็นเงิน</span>
                <span style={styles.resultAmount}>฿{scanResult.amount.toLocaleString()}</span>
              </div>
            </div>

            <div style={styles.resultActions}>
              <button style={styles.confirmBtn} onClick={handleConfirm} id="confirm-bill-btn">
                <Check size={18} />
                <span>ยืนยันและส่งบิล</span>
              </button>
              <button style={styles.rescanBtn} onClick={() => { setStage('ready'); setScanResult(null); setAnimProgress(0); }} id="rescan-btn">
                <RotateCcw size={16} />
                <span>สแกนใหม่</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scan Button */}
      {stage === 'ready' && (
        <div style={styles.scanBtnContainer}>
          <button style={styles.scanBtn} onClick={handleScan} id="start-scan-btn">
            <Camera size={24} />
            <span>แตะเพื่อสแกน</span>
          </button>
          <p style={styles.scanHint}>เล็งกล้องไปที่หน้าปัดมิเตอร์</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--bg-primary)' },
  header: {
    padding: '52px 20px 16px',
    display: 'flex', gap: 14, alignItems: 'center',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  },
  title: { fontFamily: "'Prompt', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
  selectionRow: {
    display: 'flex', gap: 10, padding: '0 16px 16px', alignItems: 'center',
  },
  roomSelect: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '10px 14px', borderRadius: 10,
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)', fontSize: 14, fontWeight: 600,
    fontFamily: "'Prompt', sans-serif", cursor: 'pointer',
  },
  typeToggle: { display: 'flex', gap: 6, marginLeft: 'auto' },
  typeBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '8px 12px', borderRadius: 8,
    border: '1px solid', fontSize: 13, fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
  roomDropdown: {
    margin: '0 16px 12px', padding: 8,
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
    maxHeight: 200, overflowY: 'auto',
  },
  roomOption: {
    padding: '8px', borderRadius: 8, fontSize: 12,
    fontFamily: "'Prompt', sans-serif", color: 'var(--text-secondary)',
    cursor: 'pointer', border: 'none', textAlign: 'center',
  },
  cameraContainer: {
    margin: '0 16px',
    borderRadius: 20, overflow: 'hidden',
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    minHeight: 360,
  },
  cameraCanvas: {
    width: '100%', height: 360, display: 'block',
  },
  processingContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: 40, minHeight: 360,
  },
  processingRing: { position: 'relative', marginBottom: 20 },
  processPercent: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif",
  },
  processText: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Prompt', sans-serif", marginBottom: 4 },
  processSubtext: { fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  resultContainer: {
    padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  resultSuccess: {
    width: 64, height: 64, borderRadius: '50%',
    background: 'rgba(0,230,118,0.15)', border: '2px solid rgba(0,230,118,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  resultTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 20, fontWeight: 700, color: '#00E676', marginBottom: 16 },
  resultCard: {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    borderRadius: 14, padding: 16, marginBottom: 16,
  },
  resultRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
    fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif",
  },
  resultValue: { fontWeight: 600, color: 'var(--text-primary)' },
  resultTotal: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0 0',
    fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Prompt', sans-serif",
  },
  resultAmount: {
    fontSize: 24, fontWeight: 800,
    background: 'linear-gradient(135deg, #A29BFE, #FF6B9D)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  resultActions: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10 },
  confirmBtn: {
    width: '100%', padding: '16px', borderRadius: 14,
    background: 'linear-gradient(135deg, #00E676, #00C853)',
    color: '#0a0a0f', fontSize: 16, fontWeight: 700, fontFamily: "'Prompt', sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer', border: 'none',
    boxShadow: '0 4px 20px rgba(0,230,118,0.3)',
  },
  rescanBtn: {
    width: '100%', padding: '12px', borderRadius: 12,
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-medium)',
    color: 'var(--text-secondary)', fontSize: 14, fontFamily: "'Prompt', sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    cursor: 'pointer',
  },
  scanBtnContainer: {
    padding: '24px 16px', textAlign: 'center',
  },
  scanBtn: {
    width: 200, height: 64, borderRadius: 32,
    background: 'linear-gradient(135deg, #6C5CE7, #8B7CF7)',
    color: 'white', fontSize: 16, fontWeight: 600, fontFamily: "'Prompt', sans-serif",
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    cursor: 'pointer', border: 'none',
    boxShadow: '0 4px 24px rgba(108,92,231,0.4)',
    transition: 'all 0.3s ease',
  },
  scanHint: {
    fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif",
    marginTop: 10,
  },
};
