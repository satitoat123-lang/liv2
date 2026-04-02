import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sun, Volume2, Eye, Maximize2 } from 'lucide-react';
import { useStore } from '../hooks/useStore';

const STATUS_COLORS = {
  available: { bg: 'rgba(0,230,118,0.15)', border: '#00E676', text: '#00E676', label: 'ว่าง' },
  occupied: { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', text: 'var(--text-muted)', label: 'ไม่ว่าง' },
  locked: { bg: 'rgba(255,214,0,0.12)', border: '#FFD600', text: '#FFD600', label: 'กำลังทำรายการ' },
};

export default function FloorPlan() {
  const navigate = useNavigate();
  const store = useStore();
  const { buildingId, floor } = useParams();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const rooms = store.getRoomsByFloor(buildingId, parseInt(floor));
  const availableRoomsCount = rooms.filter(r => r.status === 'available').length;

  const handleRoomClick = (room) => {
    if (room.status === 'available') {
      setSelectedRoom(room);
      setShowPopup(true);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)} id="floor-plan-back-btn">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={styles.title}>ผังห้อง ชั้น {floor}</h1>
          <p style={styles.subtitle}>{store.getBuilding(buildingId)?.name} • {availableRoomsCount} ห้องว่าง</p>
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legendRow}>
        {Object.entries(STATUS_COLORS).map(([key, val]) => (
          <div key={key} style={styles.legendItem}>
            <div style={{
              width: 12, height: 12, borderRadius: 4,
              background: val.bg, border: `1.5px solid ${val.border}`,
            }} />
            <span style={{fontSize: 11, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif"}}>{val.label}</span>
          </div>
        ))}
        <div style={styles.legendItem}>
          <Sun size={12} color="#FFD600" />
          <span style={{fontSize: 11, color: 'var(--text-secondary)'}}>แดดบ่าย</span>
        </div>
        <div style={styles.legendItem}>
          <Volume2 size={12} color="#FF6B9D" />
          <span style={{fontSize: 11, color: 'var(--text-secondary)'}}>ใกล้ลิฟต์</span>
        </div>
      </div>

      {/* Floor Plan Grid */}
      <div style={styles.planContainer}>
        <div style={styles.corridor}>
          <span style={styles.corridorText}>ทางเดิน</span>
        </div>

        <div style={styles.grid}>
          {rooms.map((room) => {
            const status = STATUS_COLORS[room.status];
            const isSelected = selectedRoom?.id === room.id;
            return (
              <button
                key={room.id}
                style={{
                  ...styles.roomCell,
                  background: isSelected ? 'rgba(108,92,231,0.25)' : status.bg,
                  borderColor: isSelected ? '#6C5CE7' : status.border,
                  cursor: room.status === 'available' ? 'pointer' : 'default',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: room.status === 'available'
                    ? '0 0 12px rgba(0,230,118,0.15)'
                    : 'none',
                  animation: room.status === 'available' ? 'breathe 3s ease-in-out infinite' : 'none',
                }}
                onClick={() => handleRoomClick(room)}
                id={`room-cell-${room.id}`}
              >
                <span style={{...styles.roomNumber, color: status.text}}>{room.number}</span>
                {room.status === 'available' && (
                  <span style={styles.roomPrice}>฿{room.price.toLocaleString()}</span>
                )}
                {room.status === 'locked' && (
                  <span style={styles.roomLocked}>⏱ ล็อก</span>
                )}
                <div style={styles.roomIcons}>
                  {room.sunSide && <Sun size={10} color="#FFD600" />}
                  {room.nearLift && <Volume2 size={10} color="#FF6B9D" />}
                </div>
              </button>
            );
          })}
        </div>

        <div style={styles.liftBox}>
          <span style={styles.liftLabel}>🛗 ลิฟต์</span>
        </div>
      </div>

      {/* Room Popup */}
      {showPopup && selectedRoom && (
        <div style={styles.popupOverlay} onClick={() => setShowPopup(false)}>
          <div style={styles.popup} onClick={e => e.stopPropagation()} className="animate-fade-in">
            <div style={styles.popupHeader}>
              <div>
                <h2 style={styles.popupTitle}>ห้อง {selectedRoom.number}</h2>
                <p style={styles.popupType}>{selectedRoom.typeInfo?.label} • {selectedRoom.typeInfo?.size}</p>
              </div>
              <div style={styles.popupPrice}>
                <span style={styles.popupPriceValue}>฿{selectedRoom.price.toLocaleString()}</span>
                <span style={styles.popupPriceUnit}>/เดือน</span>
              </div>
            </div>

            <div style={styles.popupFeatures}>
              {selectedRoom.sunSide && (
                <div style={styles.popupFeature}>
                  <Sun size={14} color="#FFD600" />
                  <span>แดดบ่าย</span>
                </div>
              )}
              {selectedRoom.nearLift && (
                <div style={styles.popupFeature}>
                  <Volume2 size={14} color="#FF6B9D" />
                  <span>ใกล้ลิฟต์ (อาจมีเสียง)</span>
                </div>
              )}
              <div style={styles.popupFeature}>
                <Maximize2 size={14} color="#A29BFE" />
                <span>ขนาด {selectedRoom.typeInfo?.size}</span>
              </div>
            </div>

            <div style={styles.popupActions}>
              <button
                style={styles.tourBtn}
                onClick={() => navigate(`/tour/${selectedRoom.id}`)}
                id="view-tour-btn"
              >
                <Eye size={18} />
                <span>ดูห้อง 360°</span>
              </button>
              <button
                style={styles.bookNowBtn}
                onClick={() => navigate(`/booking/${selectedRoom.id}`)}
                id="book-now-btn"
              >
                จองทันที
              </button>
            </div>
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
    width: 40, height: 40, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  title: { fontFamily: "'Prompt', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { fontFamily: "'Prompt', sans-serif", fontSize: 13, color: 'var(--text-secondary)' },
  legendRow: { display: 'flex', gap: 12, padding: '0 20px 16px', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4 },
  planContainer: { margin: '0 16px', background: 'var(--bg-card)', borderRadius: 20, padding: 20, border: '1px solid var(--border-subtle)', position: 'relative' },
  corridor: { textAlign: 'center', padding: '8px', marginBottom: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', borderBottom: '2px dashed rgba(255,255,255,0.08)' },
  corridorText: { fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif", letterSpacing: 2 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  roomCell: {
    aspectRatio: '1', borderRadius: 12, border: '1.5px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 2, transition: 'all 0.3s ease', position: 'relative', padding: 4,
  },
  roomNumber: { fontSize: 15, fontWeight: 700, fontFamily: "'Inter', sans-serif" },
  roomPrice: { fontSize: 10, color: '#00E676', fontWeight: 600 },
  roomLocked: { fontSize: 9, color: '#FFD600', fontWeight: 500 },
  roomIcons: { display: 'flex', gap: 3, position: 'absolute', top: 4, right: 4 },
  liftBox: { marginTop: 12, textAlign: 'right', padding: '6px 12px', borderRadius: 8, background: 'rgba(255,107,157,0.08)', border: '1px solid rgba(255,107,157,0.15)', display: 'inline-block', float: 'right' },
  liftLabel: { fontSize: 11, color: '#FF6B9D', fontFamily: "'Prompt', sans-serif" },
  popupOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50, padding: 16 },
  popup: { width: '100%', maxWidth: 400, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 24, padding: 24 },
  popupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  popupTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' },
  popupType: { fontFamily: "'Prompt', sans-serif", fontSize: 13, color: 'var(--text-secondary)' },
  popupPrice: { textAlign: 'right' },
  popupPriceValue: { fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg, #A29BFE, #FF6B9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'block' },
  popupPriceUnit: { fontSize: 12, color: 'var(--text-muted)' },
  popupFeatures: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 },
  popupFeature: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif" },
  popupActions: { display: 'flex', gap: 10 },
  tourBtn: {
    flex: 1, padding: '14px', borderRadius: 14, background: 'rgba(108,92,231,0.12)', border: '1px solid rgba(108,92,231,0.3)', color: '#A29BFE',
    fontSize: 14, fontWeight: 600, fontFamily: "'Prompt', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
  },
  bookNowBtn: {
    flex: 1, padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #00E676, #00C853)', color: '#0a0a0f',
    fontSize: 14, fontWeight: 700, fontFamily: "'Prompt', sans-serif", cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,230,118,0.3)', border: 'none',
  },
};
