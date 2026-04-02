import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Shield, CheckCircle, FileText, CreditCard } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export default function BookingCheckout() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const store = useStore();
  const [step, setStep] = useState('summary'); // summary | payment | contract | success
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [isPaid, setIsPaid] = useState(false);
  const [tenantName, setTenantName] = useState('คุณผู้เช่า');

  useEffect(() => {
    store.lockRoom(roomId);
    if (step === 'summary' || step === 'payment') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const room = store.getRoom(roomId);
  const building = store.getBuilding(room?.buildingId);

  const booking = {
    room: room?.number,
    building: building?.name,
    floor: room?.floor,
    type: room?.typeInfo?.label,
    size: room?.typeInfo?.size,
    monthlyRent: room?.price || 3500,
    deposit: (room?.price || 3500) * 2,
    advance: room?.price || 3500,
    appFee: 350,
  };

  const total = booking.deposit + booking.advance + booking.appFee;

  const handleBook = () => {
    store.confirmBooking(roomId, { name: tenantName });
    setStep('success');
  };

  return (
    <div style={styles.container}>
      {/* Timer bar */}
      <div style={styles.timerBar}>
        <Clock size={14} color="#FFD600" />
        <span style={styles.timerText}>
          ล็อกห้องชั่วคราว: <strong style={{color: timeLeft < 300 ? '#FF5252' : '#FFD600'}}>{formatTime(timeLeft)}</strong>
        </span>
        <div style={styles.timerProgress}>
          <div style={{...styles.timerFill, width: `${(timeLeft / 900) * 100}%`}} />
        </div>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)} id="booking-back-btn">
          <ArrowLeft size={20} />
        </button>
        <h1 style={styles.title}>
          {step === 'summary' && 'สรุปการจอง'}
          {step === 'payment' && 'ชำระเงิน'}
          {step === 'contract' && 'เซ็นสัญญา e-Contract'}
          {step === 'success' && 'จองสำเร็จ! 🎉'}
        </h1>
      </div>

      {/* Steps indicator */}
      <div style={styles.stepsRow}>
        {['สรุป', 'ชำระเงิน', 'สัญญา', 'สำเร็จ'].map((s, i) => {
          const stepNames = ['summary', 'payment', 'contract', 'success'];
          const currentIdx = stepNames.indexOf(step);
          const isDone = i < currentIdx;
          const isActive = i === currentIdx;
          return (
            <React.Fragment key={s}>
              {i > 0 && <div style={{...styles.stepLine, background: isDone ? '#6C5CE7' : 'var(--border-subtle)'}} />}
              <div style={{
                ...styles.stepDot,
                background: isDone ? '#6C5CE7' : isActive ? 'linear-gradient(135deg, #6C5CE7, #FF6B9D)' : 'var(--bg-card)',
                borderColor: isDone || isActive ? '#6C5CE7' : 'var(--border-medium)',
              }}>
                {isDone ? <CheckCircle size={14} color="white" /> : <span style={{fontSize: 10, color: isActive ? 'white' : 'var(--text-muted)'}}>{i + 1}</span>}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div style={styles.content}>
        {/* Summary Step */}
        {step === 'summary' && (
          <div className="animate-fade-in">
            <div style={styles.card}>
              <div style={styles.roomSummary}>
                <div style={styles.roomIcon}>🏢</div>
                <div>
                  <h2 style={styles.roomTitle}>ห้อง {booking.room}</h2>
                  <p style={styles.roomMeta}>{booking.building} • ชั้น {booking.floor} • {booking.type}</p>
                  <p style={styles.roomSize}>{booking.size}</p>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>รายละเอียดค่าใช้จ่าย</h3>
              <div style={styles.priceRow}>
                <span>ค่ามัดจำ (2 เดือน)</span>
                <span>฿{booking.deposit.toLocaleString()}</span>
              </div>
              <div style={styles.priceRow}>
                <span>ค่าเช่าล่วงหน้า (1 เดือน)</span>
                <span>฿{booking.advance.toLocaleString()}</span>
              </div>
              <div style={styles.priceRow}>
                <span>ค่าธรรมเนียมแอป LIV</span>
                <span>฿{booking.appFee.toLocaleString()}</span>
              </div>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>ยอดรวม</span>
                <span style={styles.totalValue}>฿{total.toLocaleString()}</span>
              </div>
            </div>

            <button style={styles.primaryBtn} onClick={() => setStep('payment')} id="proceed-payment-btn">
              <CreditCard size={18} />
              <span>ดำเนินการชำระเงิน</span>
            </button>
          </div>
        )}

        {/* Payment Step */}
        {step === 'payment' && (
          <div className="animate-fade-in">
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>สแกนจ่ายผ่าน PromptPay</h3>
              <div style={styles.qrContainer}>
                <div style={styles.qrCode}>
                  {/* Simulated QR Code */}
                  <svg width="180" height="180" viewBox="0 0 180 180">
                    <rect width="180" height="180" rx="12" fill="#fff"/>
                    {Array.from({length: 15}).map((_, r) =>
                      Array.from({length: 15}).map((_, c) => (
                        Math.random() > 0.4 && (r < 5 && c < 5 || r < 5 && c > 9 || r > 9 && c < 5 || (r > 3 && c > 3)) ? (
                          <rect key={`${r}-${c}`} x={8 + c * 11} y={8 + r * 11} width={9} height={9} rx={2} fill="#1a1a2e"/>
                        ) : null
                      ))
                    )}
                    {/* QR corners */}
                    <rect x="8" y="8" width="44" height="44" rx="4" fill="none" stroke="#6C5CE7" strokeWidth="3"/>
                    <rect x="128" y="8" width="44" height="44" rx="4" fill="none" stroke="#6C5CE7" strokeWidth="3"/>
                    <rect x="8" y="128" width="44" height="44" rx="4" fill="none" stroke="#6C5CE7" strokeWidth="3"/>
                  </svg>
                </div>
                <p style={styles.qrAmount}>ยอดชำระ: <strong style={{color: '#00E676'}}>฿{total.toLocaleString()}</strong></p>
                <p style={styles.qrNote}>สแกน QR Code ด้วยแอปธนาคารของคุณ</p>
              </div>
            </div>

            <button
              style={{...styles.primaryBtn, background: 'linear-gradient(135deg, #00E676, #00C853)'}}
              onClick={() => { setIsPaid(true); setStep('contract'); }}
              id="confirm-payment-btn"
            >
              <CheckCircle size={18} />
              <span style={{color: '#0a0a0f'}}>ยืนยันการชำระเงิน (Demo)</span>
            </button>
          </div>
        )}

        {/* Contract Step */}
        {step === 'contract' && (
          <div className="animate-fade-in">
            <div style={styles.card}>
              <div style={styles.contractIcon}>
                <FileText size={40} color="#6C5CE7" />
              </div>
              <h3 style={{...styles.cardTitle, textAlign: 'center'}}>สัญญาเช่า e-Contract</h3>
              
              <div style={styles.contractBody}>
                <p style={styles.contractText}>
                  สัญญาเช่าห้องพักฉบับนี้ทำขึ้นระหว่าง <strong>LIV Residence</strong> (ผู้ให้เช่า)
                  และ <strong>ผู้เช่า</strong> ตกลงเช่าห้อง {booking.room} ชั้น {booking.floor}
                </p>
                <div style={styles.contractTerms}>
                  <div style={styles.termRow}><span>📅 ระยะเวลาเช่า:</span><span>12 เดือน</span></div>
                  <div style={styles.termRow}><span>💰 ค่าเช่ารายเดือน:</span><span>฿{booking.monthlyRent.toLocaleString()}</span></div>
                  <div style={styles.termRow}><span>🔒 ค่ามัดจำ:</span><span>฿{booking.deposit.toLocaleString()}</span></div>
                  <div style={styles.termRow}><span>📆 ชำระค่าเช่า:</span><span>ทุกวันที่ 1 ของเดือน</span></div>
                </div>
              </div>
            </div>

            <button
              style={styles.primaryBtn}
              onClick={handleBook}
              id="sign-contract-btn"
            >
              <Shield size={18} />
              <span>ยอมรับและเซ็นสัญญา</span>
            </button>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div style={styles.successContainer} className="animate-fade-in">
            <div style={styles.successIcon}>
              <CheckCircle size={64} color="#00E676" />
            </div>
            <h2 style={styles.successTitle}>จองสำเร็จแล้ว! 🎉</h2>
            <p style={styles.successText}>
              ห้อง {booking.room} ถูกจองเรียบร้อยแล้ว<br />
              เจ้าของหอพักได้รับการแจ้งเตือนแล้ว
            </p>

            <div style={styles.card}>
              <div style={styles.successDetail}>
                <span>🏢 ห้อง:</span><span>{booking.room} ({booking.building})</span>
              </div>
              <div style={styles.successDetail}>
                <span>📅 เริ่มสัญญา:</span><span>1 พ.ค. 2569</span>
              </div>
              <div style={styles.successDetail}>
                <span>💳 ชำระแล้ว:</span><span style={{color: '#00E676'}}>฿{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              style={{...styles.primaryBtn, background: 'linear-gradient(135deg, #00E676, #00C853)', color: '#0a0a0f'}}
              onClick={() => navigate('/my-room')}
              id="go-my-room-btn"
            >
              <span style={{color: '#0a0a0f'}}>ไปหน้าห้องของฉัน</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 40 },
  timerBar: {
    position: 'fixed', top: 0, left: 0, right: 0,
    padding: '10px 16px',
    background: 'rgba(255,214,0,0.08)',
    borderBottom: '1px solid rgba(255,214,0,0.15)',
    display: 'flex', alignItems: 'center', gap: 8,
    zIndex: 20, flexWrap: 'wrap',
  },
  timerText: { fontSize: 12, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif" },
  timerProgress: { flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', minWidth: 60 },
  timerFill: { height: '100%', borderRadius: 2, background: '#FFD600', transition: 'width 1s linear' },
  header: { padding: '56px 20px 12px', display: 'flex', gap: 14, alignItems: 'center' },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  },
  title: { fontFamily: "'Prompt', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
  stepsRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px 32px 16px', gap: 0,
  },
  stepDot: {
    width: 28, height: 28, borderRadius: '50%',
    border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  stepLine: { flex: 1, height: 2, borderRadius: 1, maxWidth: 60 },
  content: { padding: '0 16px' },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 16, padding: 20, marginBottom: 16,
  },
  roomSummary: { display: 'flex', gap: 14, alignItems: 'center' },
  roomIcon: { fontSize: 40 },
  roomTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' },
  roomMeta: { fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif" },
  roomSize: { fontSize: 12, color: 'var(--text-muted)' },
  cardTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 },
  priceRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
    fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif",
  },
  totalRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '14px 0 0', marginTop: 4,
  },
  totalLabel: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Prompt', sans-serif" },
  totalValue: {
    fontSize: 22, fontWeight: 800,
    background: 'linear-gradient(135deg, #A29BFE, #FF6B9D)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  primaryBtn: {
    width: '100%', padding: '16px', borderRadius: 14,
    background: 'linear-gradient(135deg, #6C5CE7, #8B7CF7)',
    color: 'white', fontSize: 16, fontWeight: 600,
    fontFamily: "'Prompt', sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer', border: 'none',
    boxShadow: '0 4px 20px rgba(108,92,231,0.3)',
  },
  qrContainer: { textAlign: 'center', padding: '16px 0' },
  qrCode: {
    display: 'inline-block', padding: 12, borderRadius: 16,
    background: 'white', marginBottom: 16,
  },
  qrAmount: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Prompt', sans-serif", marginBottom: 4 },
  qrNote: { fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  contractIcon: { textAlign: 'center', marginBottom: 12 },
  contractBody: { marginTop: 12 },
  contractText: { fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif", lineHeight: 1.7, marginBottom: 14 },
  contractTerms: { display: 'flex', flexDirection: 'column', gap: 8 },
  termRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif",
    padding: '6px 0', borderBottom: '1px solid var(--border-subtle)',
  },
  successContainer: { textAlign: 'center', padding: '20px 0' },
  successIcon: { marginBottom: 16 },
  successTitle: {
    fontFamily: "'Prompt', sans-serif", fontSize: 26, fontWeight: 700,
    color: '#00E676', marginBottom: 8,
  },
  successText: { fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif", lineHeight: 1.7, marginBottom: 20 },
  successDetail: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif",
    padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
  },
};
