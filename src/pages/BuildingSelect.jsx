import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, ChevronRight, Star, MapPin } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export default function BuildingSelect() {
  const navigate = useNavigate();
  const { id } = useParams();
  const store = useStore();
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [hoveredFloor, setHoveredFloor] = useState(null);

  const building = useMemo(() => store.getBuilding(id), [id, store]);
  const floorSummary = useMemo(() => store.getFloorSummary(id), [id, store]);
  const totalAvailable = useMemo(() => store.getAvailableCount(id), [id, store]);

  React.useEffect(() => {
    if (id) store.setLastBuildingId(id);
  }, [id, store]);

  if (!building) return <div style={{padding: 40, color: 'white'}}>ไม่พบข้อมูลตึก</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/search')} id="back-btn"><ArrowLeft size={20} /></button>
        <div style={{flex: 1}}>
          <h1 style={styles.buildingName}>{building.name}</h1>
          <p style={styles.buildingDesc}>
            <MapPin size={12} style={{verticalAlign: 'text-bottom'}} /> {building.nearUniversity}
          </p>
          <div style={styles.ratingRow}>
            <Star size={13} fill="#FFD600" color="#FFD600" />
            <span style={{color: '#FFD600', fontWeight: 600, fontSize: 13}}>{building.rating}</span>
            <span style={{color: 'var(--text-muted)', fontSize: 12}}>({building.reviews} รีวิว)</span>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{building.floors}</span>
            <span style={styles.statLabel}>ชั้น</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{building.floors * building.roomsPerFloor}</span>
            <span style={styles.statLabel}>ห้องทั้งหมด</span>
          </div>
          <div style={styles.statCard}>
            <span style={{...styles.statValue, color: '#00E676'}}>{totalAvailable}</span>
            <span style={styles.statLabel}>ว่าง</span>
          </div>
        </div>

        {/* Floor Selector */}
        <div style={styles.buildingVisual}>
          <h3 style={styles.sectionTitle}>เลือกชั้น</h3>
          <div style={styles.floorsWrapper}>
            {floorSummary.slice().reverse().map((floor, idx) => {
              const isSelected = selectedFloor === floor.floor;
              const isHovered = hoveredFloor === floor.floor;
              const hasRooms = floor.available > 0;
              return (
                <button
                  key={floor.floor}
                  style={{
                    ...styles.floorBlock,
                    background: isSelected ? 'linear-gradient(135deg, rgba(108,92,231,0.35), rgba(108,92,231,0.15))' :
                      isHovered ? 'rgba(108,92,231,0.12)' : 'rgba(255,255,255,0.02)',
                    borderColor: isSelected ? '#6C5CE7' : isHovered ? 'rgba(108,92,231,0.3)' : 'rgba(255,255,255,0.06)',
                    transform: isSelected ? 'scaleX(1.02)' : 'scaleX(1)',
                    animationDelay: `${idx * 0.06}s`,
                  }}
                  onMouseEnter={() => setHoveredFloor(floor.floor)}
                  onMouseLeave={() => setHoveredFloor(null)}
                  onClick={() => setSelectedFloor(floor.floor)}
                  id={`floor-btn-${floor.floor}`}
                >
                  <span style={styles.floorLabel}>{floor.floor}F</span>
                  <div style={styles.floorRooms}>
                    {Array.from({length: Math.min(floor.total, 8)}).map((_, i) => (
                      <div key={i} style={{
                        ...styles.miniRoom,
                        background: i < floor.available ? '#00E676' : i < floor.available + floor.locked ? '#FFD600' : 'rgba(255,255,255,0.08)',
                        boxShadow: i < floor.available ? '0 0 6px rgba(0,230,118,0.4)' : 'none',
                      }} />
                    ))}
                  </div>
                  <span style={{ ...styles.floorAvail, color: hasRooms ? '#00E676' : 'var(--text-muted)' }}>
                    {hasRooms ? `${floor.available} ว่าง` : 'เต็ม'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amenities */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>สิ่งอำนวยความสะดวก</h3>
          <div style={styles.amenityGrid}>
            {building.amenities.map(a => <div key={a} style={styles.amenityItem}>{a}</div>)}
          </div>
        </div>

        {/* Rules */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>กฎระเบียบ</h3>
          <div style={styles.rulesList}>
            {building.rules.map(r => <span key={r} style={styles.ruleItem}>{r}</span>)}
          </div>
        </div>

        {/* Action */}
        {selectedFloor && (
          <button
            style={{
              ...styles.goFloorBtn,
              opacity: floorSummary[selectedFloor - 1]?.available > 0 ? 1 : 0.5,
            }}
            onClick={() => {
              if (floorSummary[selectedFloor - 1]?.available > 0) navigate(`/floor/${id}/${selectedFloor}`);
            }}
            id="go-floor-btn"
            className="animate-slide-up"
          >
            <span>ดูผังห้อง ชั้น {selectedFloor}</span>
            <ChevronRight size={20} />
          </button>
        )}
      </div>
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
  buildingName: { fontFamily: "'Prompt', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 },
  buildingDesc: { fontFamily: "'Prompt', sans-serif", fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 4 },
  mainContent: { padding: '0 16px' },
  statsRow: { display: 'flex', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 16, textAlign: 'center' },
  statValue: { display: 'block', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", marginBottom: 2 },
  statLabel: { fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  buildingVisual: { background: 'var(--bg-card)', borderRadius: 20, padding: '20px 16px', border: '1px solid var(--border-subtle)', marginBottom: 16 },
  sectionTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 },
  floorsWrapper: { display: 'flex', flexDirection: 'column', gap: 4 },
  floorBlock: {
    display: 'flex', alignItems: 'center', padding: '10px 14px', borderRadius: 10,
    border: '1px solid', cursor: 'pointer', transition: 'all 0.25s ease', gap: 12,
    animation: 'fadeIn 0.4s ease both',
  },
  floorLabel: { fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', width: 32 },
  floorRooms: { flex: 1, display: 'flex', gap: 4 },
  miniRoom: { width: 18, height: 12, borderRadius: 3, transition: 'all 0.3s ease' },
  floorAvail: { fontFamily: "'Prompt', sans-serif", fontSize: 12, fontWeight: 500, minWidth: 50, textAlign: 'right' },
  section: { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 16, marginBottom: 16 },
  amenityGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  amenityItem: { fontSize: 13, padding: '8px 10px', borderRadius: 8, background: 'rgba(108,92,231,0.08)', fontFamily: "'Prompt', sans-serif", color: 'var(--text-secondary)' },
  rulesList: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  ruleItem: { fontSize: 13, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', fontFamily: "'Prompt', sans-serif", color: 'var(--text-secondary)' },
  goFloorBtn: {
    width: '100%', padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, #6C5CE7, #8B7CF7)',
    color: 'white', fontSize: 16, fontWeight: 600, fontFamily: "'Prompt', sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(108,92,231,0.3)', transition: 'all 0.2s ease',
  },
};
