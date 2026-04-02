import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, X, Star, ChevronRight } from 'lucide-react';
import { useStore } from '../hooks/useStore';

// Map bubble positions (simulated lat/lng to screen %)
const MAP_POSITIONS = {
  b1: { top: 32, left: 28 },
  b2: { top: 55, left: 65 },
  b3: { top: 25, left: 72 },
  b4: { top: 68, left: 38 },
  b5: { top: 78, left: 18 },
  b6: { top: 42, left: 85 },
};

export default function MapSearch() {
  const navigate = useNavigate();
  const store = useStore();
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState(null);
  const [priceMax, setPriceMax] = useState(10000);
  const [selectedTags, setSelectedTags] = useState([]);
  const [animatedBubbles, setAnimatedBubbles] = useState([]);

  const mapData = useMemo(() => store.getMapData(), [store]);

  useEffect(() => {
    mapData.forEach((d, i) => {
      setTimeout(() => setAnimatedBubbles(prev => [...prev, d.id]), 200 + i * 120);
    });
  }, []);

  const filtered = useMemo(() => {
    return mapData.filter(d => {
      if (d.startingPrice > priceMax) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = d.name.toLowerCase().includes(q);
        const matchUni = d.nearUniversity?.toLowerCase().includes(q);
        const matchAmenity = d.amenities?.some(a => a.toLowerCase().includes(q));
        const matchTag = selectedTags.length === 0 || selectedTags.some(t => d.amenities?.some(a => a.includes(t)));
        return (matchName || matchUni || matchAmenity) && matchTag;
      }
      return true;
    });
  }, [mapData, search, priceMax, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div style={styles.container}>
      {/* Dark Map Background */}
      <div style={styles.mapBg}>
        <svg style={styles.mapGrid} viewBox="0 0 100 100" preserveAspectRatio="none">
          {Array.from({length: 20}).map((_, i) => (
            <React.Fragment key={i}>
              <line x1={i*5} y1="0" x2={i*5} y2="100" stroke="rgba(108,92,231,0.04)" strokeWidth="0.2"/>
              <line x1="0" y1={i*5} x2="100" y2={i*5} stroke="rgba(108,92,231,0.04)" strokeWidth="0.2"/>
            </React.Fragment>
          ))}
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>
          <line x1="30" y1="0" x2="30" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <line x1="70" y1="0" x2="70" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6"/>
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.04)" strokeWidth="0.4"/>
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.04)" strokeWidth="0.4"/>
          <rect x="5" y="5" width="20" height="15" fill="rgba(255,255,255,0.015)" rx="1"/>
          <rect x="35" y="55" width="15" height="20" fill="rgba(255,255,255,0.015)" rx="1"/>
          <rect x="60" y="10" width="25" height="12" fill="rgba(255,255,255,0.015)" rx="1"/>
          <rect x="75" y="60" width="18" height="25" fill="rgba(255,255,255,0.015)" rx="1"/>
        </svg>

        {/* Price Bubbles */}
        {filtered.map(dorm => {
          const pos = MAP_POSITIONS[dorm.id] || { top: 50, left: 50 };
          const isAvailable = dorm.available > 0;
          const show = animatedBubbles.includes(dorm.id);
          const isSelected = selectedDorm?.id === dorm.id;
          return (
            <button
              key={dorm.id}
              style={{
                ...styles.bubble,
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                background: isAvailable ? 'linear-gradient(135deg, #00E676, #00C853)' : 'linear-gradient(135deg, #616161, #424242)',
                opacity: show ? 1 : 0,
                transform: show
                  ? `translate(-50%,-50%) scale(${isSelected ? 1.2 : 1})`
                  : 'translate(-50%,-50%) scale(0.3)',
                boxShadow: isAvailable
                  ? (isSelected ? '0 0 30px rgba(0,230,118,0.5), 0 4px 16px rgba(0,0,0,0.3)' : '0 0 15px rgba(0,230,118,0.25), 0 4px 12px rgba(0,0,0,0.3)')
                  : '0 4px 12px rgba(0,0,0,0.3)',
                cursor: isAvailable ? 'pointer' : 'default',
                zIndex: isSelected ? 15 : 5,
              }}
              onClick={() => isAvailable && setSelectedDorm(dorm)}
              id={`dorm-bubble-${dorm.id}`}
            >
              {isAvailable ? `฿${dorm.startingPrice.toLocaleString()}` : 'เต็ม'}
              {isAvailable && <div style={styles.bubbleGlow} />}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <div style={styles.searchBar}>
          <Search size={18} color="var(--text-muted)" />
          <input
            style={styles.searchInput}
            placeholder='"หาหอใกล้ ม.กรุงเทพ เลี้ยงแมวได้"'
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="map-search-input"
          />
          <button style={styles.filterBtn} onClick={() => setShowFilter(!showFilter)} id="filter-btn">
            <SlidersHorizontal size={18} />
          </button>
        </div>
        {search && (
          <div style={styles.aiHint} className="animate-fade-in">
            <span>✨</span>
            <span>AI กรอง: พบ {filtered.length} หอพัก</span>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div style={styles.filterPanel} className="animate-slide-up">
          <div style={styles.filterHeader}>
            <h3 style={styles.filterTitle}>กรองผลลัพธ์</h3>
            <button onClick={() => setShowFilter(false)}><X size={20} color="var(--text-muted)" /></button>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>ราคาไม่เกิน: ฿{priceMax.toLocaleString()}/เดือน</label>
            <input type="range" min={1000} max={10000} step={500} value={priceMax}
              onChange={e => setPriceMax(Number(e.target.value))} style={styles.slider} id="price-slider" />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>สิ่งอำนวยความสะดวก</label>
            <div style={styles.filterTags}>
              {['เลี้ยง', 'WiFi', 'สระว่ายน้ำ', 'ที่จอดรถ', 'ฟิตเนส', 'คีย์การ์ด'].map(tag => (
                <button key={tag} style={{
                  ...styles.filterTag,
                  background: selectedTags.includes(tag) ? 'rgba(108,92,231,0.2)' : 'rgba(255,255,255,0.04)',
                  borderColor: selectedTags.includes(tag) ? '#6C5CE7' : 'var(--border-medium)',
                  color: selectedTags.includes(tag) ? '#A29BFE' : 'var(--text-secondary)',
                }} onClick={() => toggleTag(tag)}>{tag}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Dorm Bottom Sheet */}
      {selectedDorm && (
        <div style={styles.bottomSheet} className="animate-slide-up">
          <div style={styles.sheetHandle} />
          <div style={styles.dormInfo}>
            <div style={styles.dormImg}><span style={{fontSize: 36}}>🏢</span></div>
            <div style={styles.dormDetails}>
              <h2 style={styles.dormName}>{selectedDorm.name}</h2>
              <div style={styles.dormMeta}>
                <span style={styles.dormRating}><Star size={12} fill="#FFD600" color="#FFD600" /> {selectedDorm.rating}</span>
                <span style={styles.dormReviews}>({selectedDorm.reviews} รีวิว)</span>
              </div>
              <div style={styles.dormAvail}>
                <span style={styles.greenDot} /> ว่าง {selectedDorm.available}/{selectedDorm.totalRooms} ห้อง
              </div>
              <div style={styles.dormPriceRow}>
                <span style={styles.priceValue}>฿{selectedDorm.startingPrice.toLocaleString()}</span>
                <span style={styles.priceUnit}>/เดือน ~</span>
              </div>
              <p style={styles.dormAddress}><MapPin size={11} /> {selectedDorm.nearUniversity}</p>
            </div>
          </div>
          <div style={styles.dormAmenities}>
            {selectedDorm.amenities?.slice(0, 4).map(a => (
              <span key={a} style={styles.amenityTag}>{a}</span>
            ))}
          </div>
          <div style={styles.sheetActions}>
            <button style={styles.viewBuildingBtn} onClick={() => navigate(`/building/${selectedDorm.id}`)} id="view-building-btn">
              🏗️ ดูตึกและเลือกชั้น <ChevronRight size={16} />
            </button>
            <button style={styles.closeSheetBtn} onClick={() => setSelectedDorm(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}><span style={{...styles.legendDot, background: '#00E676'}} /><span>ว่าง</span></div>
        <div style={styles.legendItem}><span style={{...styles.legendDot, background: '#616161'}} /><span>เต็ม</span></div>
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', position: 'relative', overflow: 'hidden', background: '#0a0a0f' },
  mapBg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 40% 40%, rgba(108,92,231,0.06) 0%, transparent 50%), #0a0a0f' },
  mapGrid: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  bubble: {
    position: 'absolute', padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
    color: '#0a0a0f', border: 'none', fontFamily: "'Inter', sans-serif", zIndex: 5,
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', whiteSpace: 'nowrap',
  },
  bubbleGlow: {
    position: 'absolute', inset: -4, borderRadius: 24, border: '2px solid rgba(0,230,118,0.3)',
    animation: 'breathe 2.5s ease-in-out infinite', pointerEvents: 'none',
  },
  searchContainer: { position: 'absolute', top: 0, left: 0, right: 0, padding: '52px 16px 0', zIndex: 10 },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(26,26,46,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '14px 16px',
  },
  searchInput: { flex: 1, fontSize: 14, color: 'var(--text-primary)', fontFamily: "'Prompt', sans-serif", background: 'none' },
  filterBtn: {
    width: 36, height: 36, borderRadius: 10, background: 'rgba(108,92,231,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6C5CE7', cursor: 'pointer', border: 'none',
  },
  aiHint: {
    marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)',
    borderRadius: 10, fontSize: 12, color: '#A29BFE', fontFamily: "'Prompt', sans-serif",
  },
  filterPanel: {
    position: 'absolute', top: 120, left: 16, right: 16,
    background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 20, zIndex: 20,
  },
  filterHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  filterTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' },
  filterGroup: { marginBottom: 16 },
  filterLabel: { fontFamily: "'Prompt', sans-serif", fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 },
  slider: { width: '100%', accentColor: '#6C5CE7' },
  filterTags: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  filterTag: {
    padding: '6px 12px', borderRadius: 16, border: '1px solid', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
    fontFamily: "'Prompt', sans-serif",
  },
  bottomSheet: {
    position: 'absolute', bottom: 80, left: 12, right: 12,
    background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-subtle)', borderRadius: 20, padding: 20, zIndex: 15,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 14px' },
  dormInfo: { display: 'flex', gap: 14, marginBottom: 12 },
  dormImg: {
    width: 80, height: 80, borderRadius: 14, flexShrink: 0,
    background: 'linear-gradient(135deg, #1a1a2e, #252545)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  dormDetails: { flex: 1, minWidth: 0 },
  dormName: { fontFamily: "'Prompt', sans-serif", fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 },
  dormMeta: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  dormRating: { fontSize: 12, color: '#FFD600', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 },
  dormReviews: { fontSize: 11, color: 'var(--text-muted)' },
  dormAvail: { fontSize: 12, color: '#00E676', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 },
  greenDot: { width: 6, height: 6, borderRadius: '50%', background: '#00E676', display: 'inline-block' },
  dormPriceRow: { display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 2 },
  priceValue: {
    fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #A29BFE, #FF6B9D)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  priceUnit: { fontSize: 11, color: 'var(--text-muted)' },
  dormAddress: { fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, fontFamily: "'Prompt', sans-serif" },
  dormAmenities: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 },
  amenityTag: {
    fontSize: 10, padding: '3px 8px', borderRadius: 6,
    background: 'rgba(108,92,231,0.1)', color: '#A29BFE', fontFamily: "'Prompt', sans-serif",
  },
  sheetActions: { display: 'flex', gap: 10 },
  viewBuildingBtn: {
    flex: 1, padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #6C5CE7, #8B7CF7)',
    color: 'white', fontSize: 14, fontWeight: 600, fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(108,92,231,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  closeSheetBtn: {
    width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: 18,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  legend: {
    position: 'absolute', bottom: 24, right: 16, display: 'flex', gap: 14,
    background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(10px)',
    padding: '8px 14px', borderRadius: 10, zIndex: 8,
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' },
  legendDot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
};
