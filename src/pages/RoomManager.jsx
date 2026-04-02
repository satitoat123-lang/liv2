import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Phone, Calendar, AlertCircle } from 'lucide-react';
import { useStore } from '../hooks/useStore';

const STATUS_MAP = {
  available: { color: '#00E676', label: 'ว่าง', bg: 'rgba(0,230,118,0.12)' },
  occupied: { color: '#A29BFE', label: 'มีผู้เช่า', bg: 'rgba(108,92,231,0.12)' },
  locked: { color: '#FFD600', label: 'ล็อก', bg: 'rgba(255,214,0,0.12)' },
};

const BILL_MAP = {
  paid: { color: '#00E676', label: 'ชำระแล้ว' },
  unpaid: { color: '#FFD600', label: 'รอชำระ' },
  overdue: { color: '#FF5252', label: 'ค้างชำระ' },
};

export default function RoomManager() {
  const navigate = useNavigate();
  const store = useStore();
  const currentBuilding = store.getBuildings()[0];
  const rooms = store.getRooms(currentBuilding.id);
  const stats = store.getLandlordStats(currentBuilding.id);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setShowDetail(true);
  };

  const counts = {
    available: stats.available,
    occupied: stats.occupied,
    locked: stats.locked,
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)} id="room-mgr-back-btn">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={styles.title}>จัดการสถานะห้อง</h1>
          <p style={styles.subtitle}>LIV Residence • ชั้น 3</p>
        </div>
      </div>

      {/* Summary */}
      <div style={styles.summaryRow}>
        {Object.entries(STATUS_MAP).map(([key, val]) => (
          <div key={key} style={{...styles.summaryItem, borderColor: val.color + '33'}}>
            <span style={{...styles.summaryCount, color: val.color}}>{counts[key]}</span>
            <span style={styles.summaryLabel}>{val.label}</span>
          </div>
        ))}
      </div>

      {/* Room Grid */}
      <div style={styles.gridContainer}>
        <div style={styles.corridor}>
          <span style={styles.corridorText}>👆 ทางเดิน</span>
        </div>
        <div style={styles.grid}>
          {rooms.map(room => {
            const st = STATUS_MAP[room.status];
            return (
              <button
                key={room.id}
                style={{
                  ...styles.roomCell,
                  background: st.bg,
                  borderColor: st.color + '44',
                  cursor: 'pointer',
                }}
                onClick={() => handleRoomClick(room)}
                id={`mgr-room-${room.id}`}
              >
                <span style={{...styles.roomNum, color: st.color}}>{room.number}</span>
                <span style={styles.roomStatus}>{st.label}</span>
                {room.billStatus && (
                  <span style={{
                    fontSize: 8, padding: '2px 4px', borderRadius: 4,
                    background: BILL_MAP[room.billStatus].color + '22',
                    color: BILL_MAP[room.billStatus].color,
                    position: 'absolute', top: 4, right: 4,
                  }}>
                    {room.billStatus === 'overdue' && '⚠️'}
                    {room.billStatus === 'paid' && '✓'}
                    {room.billStatus === 'unpaid' && '⏳'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Detail Modal */}
      {showDetail && selectedRoom && (
        <div style={styles.overlay} onClick={() => setShowDetail(false)}>
          <div style={styles.detailCard} onClick={e => e.stopPropagation()} className="animate-slide-up">
            <div style={styles.detailHeader}>
              <div>
                <h2 style={styles.detailTitle}>ห้อง {selectedRoom.number}</h2>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 6,
                  background: STATUS_MAP[selectedRoom.status].bg,
                  fontSize: 12, color: STATUS_MAP[selectedRoom.status].color,
                  fontFamily: "'Prompt', sans-serif",
                }}>
                  <span style={{width: 6, height: 6, borderRadius: '50%', background: STATUS_MAP[selectedRoom.status].color}} />
                  {STATUS_MAP[selectedRoom.status].label}
                </div>
              </div>
              <button style={styles.closeBtn} onClick={() => setShowDetail(false)} id="close-detail-btn">
                <X size={20} />
              </button>
            </div>

            {selectedRoom.status === 'occupied' && (
              <>
                <div style={styles.tenantInfo}>
                  <div style={styles.tenantAvatar}>
                    <span style={{fontSize: 28}}>👤</span>
                  </div>
                  <div>
                    <h3 style={styles.tenantName}>{selectedRoom.tenant?.name || 'Unknown'}</h3>
                    <div style={styles.tenantMeta}>
                      <Phone size={12} color="var(--text-muted)" />
                      <span>{selectedRoom.tenant?.phone || '-'}</span>
                    </div>
                    <div style={styles.tenantMeta}>
                      <Calendar size={12} color="var(--text-muted)" />
                      <span>หมดสัญญา: {selectedRoom.expires || '2570-02-28'}</span>
                    </div>
                  </div>
                </div>

                {selectedRoom.billStatus && (
                  <div style={{
                    ...styles.billBadge,
                    background: BILL_MAP[selectedRoom.billStatus].color + '11',
                    borderColor: BILL_MAP[selectedRoom.billStatus].color + '33',
                  }}>
                    {selectedRoom.billStatus === 'overdue' && <AlertCircle size={16} color="#FF5252" />}
                    <span style={{color: BILL_MAP[selectedRoom.billStatus].color}}>
                      สถานะบิล: {BILL_MAP[selectedRoom.billStatus].label}
                    </span>
                  </div>
                )}

                <div style={styles.detailActions}>
                  <button style={styles.actionBtn2}>📱 โทรหา</button>
                  <button style={styles.actionBtn2}>💬 แชท</button>
                  <button 
                    style={{...styles.actionBtn2, background: 'rgba(255,82,82,0.1)', color: '#FF5252', borderColor: 'rgba(255,82,82,0.2)'}}
                    onClick={async () => {
                      if (window.confirm(`ยืนยันการแจ้งย้ายออกห้อง ${selectedRoom.number}?`)) {
                        await store.moveOut(selectedRoom.id);
                        setShowDetail(false);
                      }
                    }}
                    id="move-out-btn"
                  >
                    🚪 ปิดสัญญา
                  </button>
                </div>
              </>
            )}

            {selectedRoom.status === 'available' && (
              <div style={styles.availableContent}>
                <div style={styles.emptyRoom}>
                  <span style={{fontSize: 48}}>🏠</span>
                  <p style={{fontSize: 14, color: '#00E676', fontFamily: "'Prompt', sans-serif", fontWeight: 600}}>
                    ห้องว่าง — พร้อมรับผู้เช่าใหม่
                  </p>
                  <p style={{fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif"}}>
                    ห้องนี้แสดงบนแอป LIV แล้ว
                  </p>
                </div>
                <button style={{...styles.manualBtn}}>
                  📝 เพิ่มผู้เช่า (Walk-in)
                </button>
              </div>
            )}

            {selectedRoom.status === 'locked' && (
              <div style={styles.availableContent}>
                <div style={styles.emptyRoom}>
                  <span style={{fontSize: 48}}>⏳</span>
                  <p style={{fontSize: 14, color: '#FFD600', fontFamily: "'Prompt', sans-serif", fontWeight: 600}}>
                    กำลังมีคนทำรายการจอง
                  </p>
                  <p style={{fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif"}}>
                    ระบบล็อกอัตโนมัติ 15 นาที
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 100 },
  header: { padding: '52px 20px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  },
  title: { fontFamily: "'Prompt', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { fontFamily: "'Prompt', sans-serif", fontSize: 13, color: 'var(--text-secondary)' },
  summaryRow: { display: 'flex', gap: 8, padding: '0 16px 16px' },
  summaryItem: {
    flex: 1, textAlign: 'center', padding: '12px 8px',
    background: 'var(--bg-card)', border: '1px solid',
    borderRadius: 12,
  },
  summaryCount: { display: 'block', fontSize: 24, fontWeight: 800, fontFamily: "'Inter', sans-serif" },
  summaryLabel: { fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  gridContainer: {
    margin: '0 16px',
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 20, padding: 16,
  },
  corridor: {
    textAlign: 'center', padding: 6,
    borderBottom: '2px dashed rgba(255,255,255,0.06)', marginBottom: 12,
  },
  corridorText: { fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  roomCell: {
    aspectRatio: '1', borderRadius: 12, border: '1px solid',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 2, transition: 'all 0.2s ease', position: 'relative',
  },
  roomNum: { fontSize: 16, fontWeight: 700, fontFamily: "'Inter', sans-serif" },
  roomStatus: { fontSize: 9, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end',
    justifyContent: 'center', zIndex: 50, padding: 16,
  },
  detailCard: {
    width: '100%', maxWidth: 400,
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 24, padding: 24,
  },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  detailTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    background: 'rgba(255,255,255,0.05)', border: 'none',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  tenantInfo: { display: 'flex', gap: 14, marginBottom: 16 },
  tenantAvatar: {
    width: 56, height: 56, borderRadius: 16,
    background: 'rgba(108,92,231,0.1)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  tenantName: { fontFamily: "'Prompt', sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 },
  tenantMeta: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif", marginBottom: 2,
  },
  billBadge: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', borderRadius: 10, border: '1px solid',
    fontSize: 13, fontFamily: "'Prompt', sans-serif", marginBottom: 16,
  },
  detailActions: { display: 'flex', gap: 8 },
  actionBtn2: {
    flex: 1, padding: '10px', borderRadius: 10,
    background: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.15)',
    color: '#A29BFE', fontSize: 12, fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer', textAlign: 'center',
  },
  availableContent: { textAlign: 'center', padding: '16px 0' },
  emptyRoom: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  manualBtn: {
    width: '100%', padding: '12px', borderRadius: 12,
    background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)',
    color: '#00E676', fontSize: 14, fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer',
  },
};
