import React, { useState } from 'react';
import { Building2, Users, DollarSign, AlertTriangle, CheckCircle, Clock, X, ChevronRight, Shield, Eye, Search, BarChart3, LogOut, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const store = useStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = store.getAdminStats();
  const buildings = store.getBuildings();
  const properties = buildings.map(b => {
    const bStats = store.getLandlordStats(b.id);
    return {
      id: b.id,
      name: b.name,
      rooms: bStats.totalRooms,
      occupancy: bStats.occupied,
      revenue: bStats.totalIncome,
      status: 'active'
    };
  });

  const PENDING_KYC = [
    { id: 1, name: 'Happy Dorm ลาดกระบัง', owner: 'นายวิชิต สุขใจ', rooms: 48, submitted: '28 มี.ค. 2569', status: 'pending' },
    { id: 2, name: 'Smart Living รังสิต', owner: 'บจก. สมาร์ทลิฟวิ่ง', rooms: 120, submitted: '1 เม.ย. 2569', status: 'pending' },
    { id: 3, name: 'The Nest บางนา', owner: 'นางสาวปิยะ ธรรมดี', rooms: 36, submitted: '2 เม.ย. 2569', status: 'pending' },
  ];

  const DISPUTES = [
    { id: 1, tenant: 'สมศรี จ.', landlord: 'LIV Residence', issue: 'ค่ามัดจำไม่ได้คืน', date: '30 มี.ค.', status: 'open' },
    { id: 2, tenant: 'วิชัย ก.', landlord: 'The Cube', issue: 'ค่าซ่อมเกินจริง', date: '1 เม.ย.', status: 'open' },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoContainer}>
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" fill="url(#ag1)" opacity="0.9"/>
              <path d="M24 12L34 18V30L24 36L14 30V18L24 12Z" fill="url(#ag2)"/>
              <circle cx="24" cy="24" r="4" fill="white" opacity="0.9"/>
              <defs>
                <linearGradient id="ag1" x1="6" y1="4" x2="42" y2="44"><stop stopColor="#6C5CE7"/><stop offset="1" stopColor="#FF6B9D"/></linearGradient>
                <linearGradient id="ag2" x1="14" y1="12" x2="34" y2="36"><stop stopColor="#A29BFE"/><stop offset="1" stopColor="#6C5CE7"/></linearGradient>
              </defs>
            </svg>
            <span style={styles.logoText}>LIV Admin</span>
          </div>
        </div>

        <nav style={styles.nav}>
          {[
            { key: 'overview', icon: <BarChart3 size={18} />, label: 'ภาพรวม' },
            { key: 'kyc', icon: <Shield size={18} />, label: 'อนุมัติ KYC', badge: stats.pendingKYC },
            { key: 'properties', icon: <Building2 size={18} />, label: 'หอพักทั้งหมด' },
            { key: 'revenue', icon: <DollarSign size={18} />, label: 'รายได้ & คอมมิชชัน' },
            { key: 'disputes', icon: <AlertTriangle size={18} />, label: 'ข้อพิพาท', badge: stats.activeDisputes },
          ].map(item => (
            <button
              key={item.key}
              style={{
                ...styles.navItem,
                background: activeTab === item.key ? 'rgba(108,92,231,0.15)' : 'transparent',
                color: activeTab === item.key ? '#A29BFE' : 'var(--text-secondary)',
                borderColor: activeTab === item.key ? '#6C5CE7' : 'transparent',
              }}
              onClick={() => setActiveTab(item.key)}
              id={`admin-tab-${item.key}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span style={styles.navBadge}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button style={styles.resetBtn} onClick={() => { if(confirm('Reset all demo data?')) store.reset(); }} id="admin-reset-btn">
            <RefreshCcw size={16} />
            <span>Reset Demo Data</span>
          </button>
          <button style={styles.logoutBtn} onClick={() => { store.logout(); navigate('/login'); }} id="admin-logout-btn">
            <LogOut size={16} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div style={styles.searchBar}>
            <Search size={16} color="var(--text-muted)" />
            <input
              style={styles.searchInput}
              placeholder="ค้นหาหอพัก, ผู้เช่า..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              id="admin-search"
            />
          </div>
          <div style={styles.adminProfile}>
            <span style={styles.adminName}>Admin</span>
            <div style={styles.adminAvatar}>👨‍💼</div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={styles.contentArea} className="animate-fade-in">
            <h2 style={styles.pageTitle}>ภาพรวมระบบ LIV</h2>

            <div style={styles.statsGrid}>
              {[
                { label: 'หอพักทั้งหมด', value: stats.totalProperties, icon: <Building2 size={20} />, color: '#6C5CE7' },
                { label: 'ห้องทั้งหมด', value: stats.totalRooms.toLocaleString(), icon: <Building2 size={20} />, color: '#A29BFE' },
                { label: 'ผู้เช่าทั้งหมด', value: stats.totalTenants.toLocaleString(), icon: <Users size={20} />, color: '#00E676' },
                { label: 'รายได้รวม/เดือน', value: `฿${(stats.monthlyRevenue / 1000000).toFixed(2)}M`, icon: <DollarSign size={20} />, color: '#FF6B9D' },
                { label: 'คอมมิชชัน/เดือน', value: `฿${stats.commission.toLocaleString()}`, icon: <DollarSign size={20} />, color: '#FFD600' },
                { label: 'รออนุมัติ KYC', value: stats.pendingKYC, icon: <Clock size={20} />, color: '#FF5252' },
              ].map(stat => (
                <div key={stat.label} style={{...styles.statCard, borderColor: stat.color + '33'}}>
                  <div style={{...styles.statIcon, background: stat.color + '15', color: stat.color}}>
                    {stat.icon}
                  </div>
                  <div>
                    <span style={styles.statValue}>{stat.value}</span>
                    <span style={styles.statLabel}>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>กิจกรรมล่าสุด</h3>
              {[
                { text: 'Happy Dorm ลาดกระบัง ส่งเอกสาร KYC', time: '2 ชม.', type: 'kyc' },
                { text: 'LIV Residence: ห้อง 305 มีผู้เช่าใหม่', time: '3 ชม.', type: 'booking' },
                { text: 'ข้อพิพาท #002: ค่าซ่อมเกินจริง', time: '5 ชม.', type: 'dispute' },
                { text: 'โอนค่าคอมมิชชัน ฿12,500 สำเร็จ', time: '8 ชม.', type: 'commission' },
              ].map((a, i) => (
                <div key={i} style={styles.activityRow}>
                  <span style={styles.activityDot} />
                  <span style={styles.activityText}>{a.text}</span>
                  <span style={styles.activityTime}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div style={styles.contentArea} className="animate-fade-in">
            <h2 style={styles.pageTitle}>อนุมัติหอพักใหม่ (Verify KYC)</h2>
            <div style={styles.kycList}>
              {PENDING_KYC.map(kyc => (
                <div key={kyc.id} style={styles.kycCard}>
                  <div style={styles.kycInfo}>
                    <h3 style={styles.kycName}>{kyc.name}</h3>
                    <p style={styles.kycMeta}>เจ้าของ: {kyc.owner}</p>
                    <p style={styles.kycMeta}>จำนวนห้อง: {kyc.rooms} | ส่งเมื่อ: {kyc.submitted}</p>
                  </div>
                  <div style={styles.kycActions}>
                    <button style={styles.kycViewBtn} id={`kyc-view-${kyc.id}`}>
                      <Eye size={14} /> ดูเอกสาร
                    </button>
                    <button style={styles.kycApproveBtn} id={`kyc-approve-${kyc.id}`}>
                      <CheckCircle size={14} /> อนุมัติ
                    </button>
                    <button style={styles.kycRejectBtn} id={`kyc-reject-${kyc.id}`}>
                      <X size={14} /> ปฏิเสธ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div style={styles.contentArea} className="animate-fade-in">
            <h2 style={styles.pageTitle}>หอพักทั้งหมดในระบบ</h2>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span style={{flex: 2}}>ชื่อหอพัก</span>
                <span style={{flex: 1, textAlign: 'center'}}>ห้อง</span>
                <span style={{flex: 1, textAlign: 'center'}}>ผู้เช่า</span>
                <span style={{flex: 1, textAlign: 'center'}}>อัตราเข้าอยู่</span>
                <span style={{flex: 1, textAlign: 'right'}}>รายได้/เดือน</span>
              </div>
              {properties.map(p => (
                <div key={p.id} style={styles.tableRow}>
                  <span style={{flex: 2, fontWeight: 600, color: 'var(--text-primary)'}}>
                    <Building2 size={14} style={{marginRight: 6, verticalAlign: 'text-bottom', color: '#6C5CE7'}} />
                    {p.name}
                  </span>
                  <span style={{flex: 1, textAlign: 'center'}}>{p.rooms}</span>
                  <span style={{flex: 1, textAlign: 'center'}}>{p.occupancy}</span>
                  <span style={{flex: 1, textAlign: 'center'}}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 6, fontSize: 12,
                      background: p.occupancy / p.rooms > 0.85 ? 'rgba(0,230,118,0.1)' : 'rgba(255,214,0,0.1)',
                      color: p.occupancy / p.rooms > 0.85 ? '#00E676' : '#FFD600',
                    }}>
                      {Math.round((p.occupancy / p.rooms) * 100)}%
                    </span>
                  </span>
                  <span style={{flex: 1, textAlign: 'right', fontWeight: 600, color: '#00E676'}}>
                    ฿{p.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div style={styles.contentArea} className="animate-fade-in">
            <h2 style={styles.pageTitle}>รายได้ & คอมมิชชัน</h2>

            <div style={styles.revenueCards}>
              <div style={styles.revenueCard}>
                <span style={styles.revLabel}>รายได้รวมทั้งระบบ</span>
                <span style={styles.revValue}>฿{stats.monthlyRevenue.toLocaleString()}</span>
                <span style={styles.revSub}>เดือน เม.ย. 2569</span>
              </div>
              <div style={{...styles.revenueCard, borderColor: 'rgba(255,214,0,0.2)'}}>
                <span style={styles.revLabel}>คอมมิชชัน LIV (3%)</span>
                <span style={{...styles.revValue, background: 'linear-gradient(135deg, #FFD600, #FF6B9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  ฿{stats.commission.toLocaleString()}
                </span>
                <span style={styles.revSub}>ค่าบริการแพลตฟอร์ม</span>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>รายได้ตามหอพัก</h3>
              {properties.map(p => (
                <div key={p.id} style={styles.revRow}>
                  <span style={{flex: 2, fontWeight: 500}}>{p.name}</span>
                  <span style={{flex: 1, textAlign: 'right', color: '#00E676'}}>฿{p.revenue.toLocaleString()}</span>
                  <span style={{flex: 1, textAlign: 'right', color: '#FFD600'}}>฿{Math.round(p.revenue * 0.03).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <div style={styles.contentArea} className="animate-fade-in">
            <h2 style={styles.pageTitle}>จัดการข้อพิพาท</h2>
            {DISPUTES.map(d => (
              <div key={d.id} style={styles.disputeCard}>
                <div style={styles.disputeHeader}>
                  <AlertTriangle size={18} color="#FF5252" />
                  <div style={{flex: 1}}>
                    <h3 style={styles.disputeTitle}>#{String(d.id).padStart(3, '0')} — {d.issue}</h3>
                    <p style={styles.disputeMeta}>
                      ผู้เช่า: {d.tenant} | หอพัก: {d.landlord} | วันที่: {d.date}
                    </p>
                  </div>
                  <span style={styles.disputeStatus}>เปิดอยู่</span>
                </div>
                <div style={styles.disputeActions}>
                  <button style={styles.disputeBtn}>📋 ดูรายละเอียด</button>
                  <button style={styles.disputeBtn}>💬 ส่งข้อความ</button>
                  <button style={{...styles.disputeBtn, background: 'rgba(0,230,118,0.1)', color: '#00E676', borderColor: 'rgba(0,230,118,0.2)'}}>
                    ✅ ปิดข้อพิพาท
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' },
  sidebar: {
    width: 260, background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-subtle)',
    flexShrink: 0, padding: '20px 12px',
    position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
  },
  sidebarHeader: { marginBottom: 24 },
  logoContainer: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' },
  logoText: {
    fontSize: 18, fontWeight: 800, letterSpacing: 2,
    background: 'linear-gradient(135deg, #A29BFE, #FF6B9D)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 14px', borderRadius: 10,
    fontSize: 14, fontFamily: "'Prompt', sans-serif", fontWeight: 500,
    cursor: 'pointer', border: '1px solid transparent',
    transition: 'all 0.2s ease', textAlign: 'left', position: 'relative',
  },
  navBadge: {
    marginLeft: 'auto', padding: '2px 8px', borderRadius: 10,
    background: '#FF5252', color: 'white', fontSize: 11, fontWeight: 700,
  },
  sidebarFooter: {
    marginTop: 'auto', padding: '16px 8px 0', borderTop: '1px solid var(--border-subtle)',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  resetBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 14px', borderRadius: 10,
    fontSize: 13, fontFamily: "'Prompt', sans-serif",
    color: 'var(--text-muted)', cursor: 'pointer', border: '1px solid var(--border-subtle)',
    background: 'transparent', transition: 'all 0.2s ease',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 14px', borderRadius: 10,
    fontSize: 13, fontFamily: "'Prompt', sans-serif",
    color: '#FF5252', cursor: 'pointer', border: '1px solid rgba(255,82,82,0.15)',
    background: 'rgba(255,82,82,0.05)', transition: 'all 0.2s ease',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)',
  },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', borderRadius: 10,
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    width: 300,
  },
  searchInput: {
    flex: 1, fontSize: 13, fontFamily: "'Prompt', sans-serif",
    color: 'var(--text-primary)', background: 'none',
  },
  adminProfile: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  adminName: { fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif" },
  adminAvatar: {
    width: 36, height: 36, borderRadius: 10,
    background: 'rgba(108,92,231,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
  },
  contentArea: { padding: 24, overflowY: 'auto', flex: 1 },
  pageTitle: {
    fontFamily: "'Prompt', sans-serif", fontSize: 22, fontWeight: 700,
    color: 'var(--text-primary)', marginBottom: 20,
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 },
  statCard: {
    background: 'var(--bg-card)', border: '1px solid',
    borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14,
  },
  statIcon: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statValue: { display: 'block', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" },
  statLabel: { display: 'block', fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 16, padding: 20, marginBottom: 16,
  },
  cardTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 },
  activityRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
    fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif",
  },
  activityDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#6C5CE7', flexShrink: 0,
  },
  activityText: { flex: 1 },
  activityTime: { fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  kycList: { display: 'flex', flexDirection: 'column', gap: 12 },
  kycCard: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 16, padding: 20,
  },
  kycInfo: { marginBottom: 12 },
  kycName: { fontFamily: "'Prompt', sans-serif", fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 },
  kycMeta: { fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif" },
  kycActions: { display: 'flex', gap: 8 },
  kycViewBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '8px 14px', borderRadius: 8, fontSize: 13,
    background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.2)',
    color: '#A29BFE', fontFamily: "'Prompt', sans-serif", cursor: 'pointer',
  },
  kycApproveBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '8px 14px', borderRadius: 8, fontSize: 13,
    background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)',
    color: '#00E676', fontFamily: "'Prompt', sans-serif", cursor: 'pointer',
  },
  kycRejectBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '8px 14px', borderRadius: 8, fontSize: 13,
    background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.2)',
    color: '#FF5252', fontFamily: "'Prompt', sans-serif", cursor: 'pointer',
  },
  table: { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden' },
  tableHeader: {
    display: 'flex', padding: '12px 20px',
    background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)',
    fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif",
  },
  tableRow: {
    display: 'flex', alignItems: 'center', padding: '14px 20px',
    borderBottom: '1px solid var(--border-subtle)',
    fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif",
    transition: 'background 0.2s ease',
  },
  revenueCards: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 },
  revenueCard: {
    background: 'var(--bg-card)', border: '1px solid rgba(108,92,231,0.2)',
    borderRadius: 16, padding: 24, textAlign: 'center',
  },
  revLabel: { display: 'block', fontSize: 13, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif", marginBottom: 6 },
  revValue: {
    display: 'block', fontSize: 28, fontWeight: 800,
    background: 'linear-gradient(135deg, #A29BFE, #FF6B9D)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    fontFamily: "'Inter', sans-serif", marginBottom: 4,
  },
  revSub: { fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  revRow: {
    display: 'flex', alignItems: 'center', padding: '10px 0',
    borderBottom: '1px solid var(--border-subtle)',
    fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif",
  },
  disputeCard: {
    background: 'var(--bg-card)', border: '1px solid rgba(255,82,82,0.15)',
    borderRadius: 16, padding: 20, marginBottom: 12,
  },
  disputeHeader: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  disputeTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' },
  disputeMeta: { fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif', marginTop: 2" },
  disputeStatus: {
    padding: '4px 10px', borderRadius: 6, fontSize: 12,
    background: 'rgba(255,82,82,0.1)', color: '#FF5252',
    fontFamily: "'Prompt', sans-serif", whiteSpace: 'nowrap',
  },
  disputeActions: { display: 'flex', gap: 8 },
  disputeBtn: {
    padding: '8px 14px', borderRadius: 8, fontSize: 12,
    background: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.15)',
    color: '#A29BFE', fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer',
  },
};
