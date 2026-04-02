import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Building2, Home, User, Camera, BarChart3, Wrench } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export default function BottomNav({ isLandlord = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useStore();
  const lastBuildingId = store.getLastBuildingId();

  const tenantTabs = [
    { path: '/search', icon: <MapPin size={20} />, label: 'ค้นหา' },
    { path: `/building/${lastBuildingId}`, icon: <Building2 size={20} />, label: 'ตึก' },
    { path: '/my-room', icon: <Home size={20} />, label: 'ห้องของฉัน' },
  ];

  const landlordTabs = [
    { path: '/landlord', icon: <BarChart3 size={20} />, label: 'แดชบอร์ด' },
    { path: '/meter-scanner', icon: <Camera size={20} />, label: 'สแกน' },
    { path: '/room-manager', icon: <Home size={20} />, label: 'ห้อง' },
  ];

  const tabs = isLandlord ? landlordTabs : tenantTabs;

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path ||
            (tab.path === '/search' && location.pathname === '/search') ||
            (tab.path === '/landlord' && location.pathname === '/landlord');

          return (
            <button
              key={tab.path}
              style={{
                ...styles.tab,
                color: isActive ? '#A29BFE' : 'var(--text-muted)',
              }}
              onClick={() => navigate(tab.path)}
              id={`nav-${tab.label}`}
            >
              <div style={{
                ...styles.iconWrap,
                background: isActive ? 'rgba(108,92,231,0.15)' : 'transparent',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              }}>
                {tab.icon}
              </div>
              <span style={{
                ...styles.label,
                fontWeight: isActive ? 600 : 400,
                opacity: isActive ? 1 : 0.6,
              }}>{tab.label}</span>
              {isActive && <div style={styles.activeDot} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    padding: '0 12px 8px',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    background: 'rgba(18, 18, 26, 0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: '8px 8px',
    maxWidth: 400,
    margin: '0 auto',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '4px 16px',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  label: {
    fontSize: 10,
    fontFamily: "'Prompt', sans-serif",
    transition: 'all 0.2s ease',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#6C5CE7',
  },
};
