import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Home, AlertTriangle, Receipt, Wrench, Camera, ChevronRight, Bell, Users, LogOut } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const store = useStore();
  const currentBuilding = store.getBuildings()[0]; // Default to first building for demo
  const stats = store.getLandlordStats(currentBuilding.id);
  const notifications = store.getNotifications();
  
  const RECENT_ACTIVITY = notifications.map(n => ({
    icon: n.type === 'payment' ? '💰' : (n.type === 'new_tenant' ? '🆕' : (n.type === 'move_out' ? '📤' : '📋')),
    text: n.message,
    time: new Date(n.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    type: n.type
  }));

  const MONTHLY_INCOME = [
    { month: 'ต.ค.', value: 210000 },
    { month: 'พ.ย.', value: 225000 },
    { month: 'ธ.ค.', value: 218000 },
    { month: 'ม.ค.', value: 232000 },
    { month: 'ก.พ.', value: 240000 },
    { month: 'มี.ค.', value: stats.totalIncome || 245000 },
  ];
  const maxIncome = Math.max(...MONTHLY_INCOME.map(m => m.value));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>สวัสดีตอนเย็น 🌙</p>
          <h1 style={styles.name}>คุณสมชาย</h1>
          <p style={styles.propertyName}>LIV Residence</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.notifBtn} onClick={() => { store.logout(); navigate('/login'); }} id="landlord-logout-btn">
            <LogOut size={20} color="#FF5252" />
          </button>
          <button style={styles.notifBtn} id="landlord-notif-btn">
            <Bell size={20} color="var(--text-primary)" />
            <span style={styles.notifDot} />
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Income Card */}
        <div style={styles.incomeCard} className="animate-fade-in">
          <div style={styles.incomeHeader}>
            <div>
              <p style={styles.incomeLabel}>รายได้เดือนนี้</p>
              <h2 style={styles.incomeValue}>฿{stats.totalIncome.toLocaleString()}</h2>
            </div>
            <div style={styles.incomeBadge}>
              <TrendingUp size={14} color="#00E676" />
              <span style={styles.incomeChange}>+12%</span>
            </div>
          </div>
          {/* Mini chart */}
          <div style={styles.chartContainer}>
            {MONTHLY_INCOME.map((m, i) => (
              <div key={m.month} style={styles.chartCol}>
                <div style={styles.chartBarBg}>
                  <div style={{
                    ...styles.chartBar,
                    height: `${(m.value / maxIncome) * 100}%`,
                    background: i === MONTHLY_INCOME.length - 1
                      ? 'linear-gradient(to top, #6C5CE7, #A29BFE)'
                      : 'rgba(108,92,231,0.3)',
                    animation: `slideUp 0.5s ease ${i * 0.1}s both`,
                  }} />
                </div>
                <span style={{
                  ...styles.chartLabel,
                  color: i === MONTHLY_INCOME.length - 1 ? '#A29BFE' : 'var(--text-muted)',
                  fontWeight: i === MONTHLY_INCOME.length - 1 ? 600 : 400,
                }}>{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderColor: 'rgba(0,230,118,0.2)'}}>
            <Home size={20} color="#00E676" />
            <span style={styles.statValue}>{stats.available}</span>
            <span style={styles.statLabel}>ห้องว่าง</span>
            <div style={{...styles.statGlow, background: 'radial-gradient(circle, rgba(0,230,118,0.1) 0%, transparent 70%)'}} />
          </div>
          <div style={{...styles.statCard, borderColor: 'rgba(108,92,231,0.2)'}}>
            <Users size={20} color="#A29BFE" />
            <span style={styles.statValue}>{stats.occupied}</span>
            <span style={styles.statLabel}>มีผู้เช่า</span>
          </div>
          <div style={{...styles.statCard, borderColor: 'rgba(255,82,82,0.2)'}}>
            <Receipt size={20} color="#FF5252" />
            <span style={styles.statValue}>{stats.pendingBills}</span>
            <span style={styles.statLabel}>บิลค้าง</span>
          </div>
          <div style={{...styles.statCard, borderColor: 'rgba(255,214,0,0.2)'}}>
            <Wrench size={20} color="#FFD600" />
            <span style={styles.statValue}>{stats.repairQueue}</span>
            <span style={styles.statLabel}>แจ้งซ่อม</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <button style={styles.actionBtn} onClick={() => navigate('/meter-scanner')} id="scan-meter-btn">
            <div style={{...styles.actionIcon, background: 'rgba(0,230,118,0.12)'}}>
              <Camera size={22} color="#00E676" />
            </div>
            <div>
              <span style={styles.actionTitle}>📸 สแกนมิเตอร์</span>
              <span style={styles.actionDesc}>สแกน AI ออกบิลอัตโนมัติ</span>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </button>

          <button style={styles.actionBtn} onClick={() => navigate('/room-manager')} id="manage-rooms-btn">
            <div style={{...styles.actionIcon, background: 'rgba(108,92,231,0.12)'}}>
              <Home size={22} color="#A29BFE" />
            </div>
            <div>
              <span style={styles.actionTitle}>🏠 จัดการห้อง</span>
              <span style={styles.actionDesc}>ดูสถานะและข้อมูลลูกบ้าน</span>
            </div>
            <ChevronRight size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Recent Activity */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>กิจกรรมล่าสุด</h3>
          {RECENT_ACTIVITY.map((activity, i) => (
            <div key={i} style={{
              ...styles.activityItem,
              animation: `fadeIn 0.4s ease ${i * 0.1}s both`,
            }}>
              <span style={styles.activityIcon}>{activity.icon}</span>
              <div style={styles.activityInfo}>
                <span style={styles.activityText}>{activity.text}</span>
                <span style={styles.activityTime}>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Bills Alert */}
        <div style={styles.alertCard}>
          <AlertTriangle size={18} color="#FFD600" />
          <div>
            <span style={styles.alertTitle}>บิลรอชำระ {stats.pendingBills} รายการ</span>
            <span style={styles.alertAmount}>รวม ฿{stats.pendingAmount.toLocaleString()}</span>
          </div>
          <button style={styles.alertAction} id="view-pending-bills-btn">ดูรายละเอียด</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 100 },
  header: {
    padding: '52px 20px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  headerActions: { display: 'flex', gap: 10 },
  greeting: { fontSize: 13, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  name: { fontFamily: "'Prompt', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  propertyName: { fontSize: 13, color: '#A29BFE', fontFamily: "'Prompt', sans-serif", fontWeight: 500 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 14,
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: '50%',
    background: '#FF5252', border: '2px solid var(--bg-card)',
  },
  content: { padding: '0 16px' },
  incomeCard: {
    background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(26,26,46,0.9))',
    border: '1px solid rgba(108,92,231,0.2)',
    borderRadius: 20, padding: 20, marginBottom: 16,
  },
  incomeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  incomeLabel: { fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif", marginBottom: 4 },
  incomeValue: {
    fontSize: 32, fontWeight: 800,
    background: 'linear-gradient(135deg, #A29BFE, #FF6B9D)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    fontFamily: "'Inter', sans-serif",
  },
  incomeBadge: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '6px 10px', borderRadius: 8,
    background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)',
  },
  incomeChange: { fontSize: 13, fontWeight: 600, color: '#00E676' },
  chartContainer: { display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 },
  chartCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  chartBarBg: { width: '100%', height: 60, borderRadius: 6, background: 'rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' },
  chartBar: { width: '100%', borderRadius: 6, transition: 'height 0.8s ease' },
  chartLabel: { fontSize: 10, fontFamily: "'Prompt', sans-serif" },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
  statCard: {
    background: 'var(--bg-card)', border: '1px solid',
    borderRadius: 16, padding: 16, textAlign: 'center',
    position: 'relative', overflow: 'hidden',
  },
  statValue: { display: 'block', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", margin: '8px 0 2px' },
  statLabel: { fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  statGlow: { position: 'absolute', inset: -20, pointerEvents: 'none' },
  quickActions: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '16px', borderRadius: 16,
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left',
  },
  actionIcon: { width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionTitle: { display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Prompt', sans-serif" },
  actionDesc: { display: 'block', fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif", marginTop: 2 },
  section: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  sectionTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 },
  activityItem: {
    display: 'flex', gap: 12, padding: '10px 0',
    borderBottom: '1px solid var(--border-subtle)',
  },
  activityIcon: { fontSize: 20, flexShrink: 0 },
  activityInfo: { flex: 1 },
  activityText: { display: 'block', fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif" },
  activityTime: { display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  alertCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 14,
    background: 'rgba(255,214,0,0.06)', border: '1px solid rgba(255,214,0,0.15)',
    marginBottom: 16,
  },
  alertTitle: { display: 'block', fontSize: 13, fontWeight: 600, color: '#FFD600', fontFamily: "'Prompt', sans-serif" },
  alertAmount: { display: 'block', fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  alertAction: {
    marginLeft: 'auto', padding: '6px 12px', borderRadius: 8,
    background: 'rgba(255,214,0,0.15)', border: 'none',
    color: '#FFD600', fontSize: 12, fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
};
