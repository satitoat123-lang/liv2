import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, MessageCircle, Receipt, ChevronRight, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export default function MyRoom() {
  const navigate = useNavigate();
  const store = useStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { from: 'landlord', text: 'สวัสดีครับ ยินดีต้อนรับเข้าอยู่ LIV Residence 🎉', time: '09:00' },
    { from: 'me', text: 'ขอบคุณครับ! หอพักสวยมากเลย', time: '09:15' },
  ]);
  const [repairType, setRepairType] = useState('💡 ไฟฟ้า');
  const [repairDesc, setRepairDesc] = useState('');
  const [repairSubmitted, setRepairSubmitted] = useState(false);

  const room = store.getCurrentTenantRoom();
  
  if (!room) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏠</div>
          <h2 style={styles.emptyTitle}>ยังไม่มีห้องพัก</h2>
          <p style={styles.emptyDesc}>คุณยังไม่ได้ทำการจองห้องพักในตอนนี้ ลองค้นหาหอพักที่คุณถูกใจดูสิ!</p>
          <button style={styles.findRoomBtn} onClick={() => navigate('/search')} id="find-room-btn">
            ค้นหาหอพักเลย
          </button>
        </div>
      </div>
    );
  }

  const bills = store.getBillsForRoom(room.id);
  const activeBill = bills.find(b => b.status !== 'paid') || bills[0];

  const handleRepairSubmit = () => {
    if (!repairDesc.trim()) return;
    store.submitRepair(room.id, repairType, repairDesc);
    setRepairSubmitted(true);
    setRepairDesc('');
    setTimeout(() => setRepairSubmitted(false), 3000);
  };

  const sendChat = () => {
    if (!chatMessage.trim()) return;
    setChatMessages(prev => [...prev, { from: 'me', text: chatMessage, time: 'ตอนนี้' }]);
    setChatMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { from: 'landlord', text: 'ได้ครับ รับทราบแล้ว 👍', time: 'ตอนนี้' }]);
    }, 1500);
  };

  return (
    <div style={styles.container}>
      {/* Room Header */}
      <div style={styles.roomHeader}>
        <div style={styles.roomImageContainer}>
          <div style={styles.roomImage}>
            <span style={{fontSize: 48}}>🏠</span>
          </div>
          <div style={styles.roomOverlay}>
            <h1 style={styles.roomTitle}>ห้อง {room.number}</h1>
            <p style={styles.roomSubtitle}>{store.getBuilding(room.buildingId)?.name} • ชั้น {room.floor}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabRow}>
        {[
          { key: 'overview', label: '📋 ภาพรวม' },
          { key: 'bills', label: '💰 บิล' },
          { key: 'repair', label: '🔧 แจ้งซ่อม' },
          { key: 'chat', label: '💬 แชท' },
        ].map(tab => (
          <button
            key={tab.key}
            style={{
              ...styles.tab,
              background: activeTab === tab.key ? 'rgba(108,92,231,0.15)' : 'transparent',
              color: activeTab === tab.key ? '#A29BFE' : 'var(--text-muted)',
              borderColor: activeTab === tab.key ? '#6C5CE7' : 'transparent',
            }}
            onClick={() => setActiveTab(tab.key)}
            id={`tab-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>ข้อมูลสัญญา</h3>
              {[
                ['📅 เข้าอยู่', '1 มี.ค. 2569'],
                ['📅 หมดสัญญา', '28 ก.พ. 2570'],
                ['💰 ค่าเช่า', `฿${room.price.toLocaleString()}/เดือน`],
                ['🔒 มัดจำ', `฿${(room.price * 2).toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label} style={styles.infoRow}>
                  <span style={styles.infoLabel}>{label}</span>
                  <span style={styles.infoValue}>{value}</span>
                </div>
              ))}
            </div>

            {/* Quick Bill Card */}
            {activeBill && activeBill.status !== 'paid' && (
              <div style={{...styles.card, borderColor: 'rgba(255,82,82,0.2)', background: 'rgba(255,82,82,0.05)'}}>
                <div style={styles.billQuick}>
                  <div>
                    <h3 style={{...styles.cardTitle, color: '#FF5252', marginBottom: 4}}>
                      <AlertCircle size={16} style={{verticalAlign: 'text-bottom', marginRight: 6}} />
                      บิลค้างชำระ
                    </h3>
                    <p style={styles.billMonth}>{activeBill.month}</p>
                  </div>
                  <div style={styles.billAmount}>
                    <span style={styles.billTotal}>฿{activeBill.total.toLocaleString()}</span>
                  </div>
                </div>
                <button style={styles.payBillBtn} onClick={() => setActiveTab('bills')} id="pay-bill-quick-btn">
                  ชำระบิลตอนนี้
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div className="animate-fade-in">
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>บิลประจำเดือน {activeBill?.month}</h3>
              <div style={styles.billBreakdown}>
                <div style={styles.billRow}><span>🏠 ค่าเช่า</span><span>฿{activeBill?.rent.toLocaleString()}</span></div>
                <div style={styles.billRow}><span>💧 ค่าน้ำ</span><span>฿{activeBill?.waterAmount.toLocaleString()}</span></div>
                <div style={styles.billRow}><span>⚡ ค่าไฟ</span><span>฿{activeBill?.electricAmount.toLocaleString()}</span></div>
                <div style={styles.billTotal2}>
                  <span>รวมทั้งหมด</span>
                  <span style={{fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #A29BFE, #FF6B9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                    ฿{activeBill?.total.toLocaleString()}
                  </span>
                </div>
              </div>
              <div style={styles.dueDate}>
                <span>📅 กำหนดชำระ: {activeBill?.dueDate}</span>
              </div>

              {activeBill?.status !== 'paid' ? (
                <button style={styles.scanPayBtn} onClick={() => store.payBill(activeBill.id)} id="scan-pay-btn">
                  <Receipt size={18} />
                  <span>สแกนจ่ายผ่านแอป</span>
                </button>
              ) : (
                <div style={{textAlign: 'center', padding: '10px', color: '#00E676', fontWeight: 600}}>
                  <CheckCircle size={20} style={{verticalAlign: 'text-bottom', marginRight: 6}} />
                  ชำระค่าเช่าเรียบร้อยแล้ว
                </div>
              )}
            </div>
          </div>
        )}

        {/* Repair Tab */}
        {activeTab === 'repair' && (
          <div className="animate-fade-in">
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>แจ้งซ่อม</h3>
              <div style={styles.repairTypes}>
                {['💡 ไฟฟ้า', '🚿 ประปา', '🚪 ประตู/หน้าต่าง', '📶 อินเทอร์เน็ต', '❄️ แอร์', '🔧 อื่นๆ'].map(type => (
                  <button
                    key={type}
                    style={{
                      ...styles.repairTypeBtn,
                      background: repairType === type ? 'rgba(108,92,231,0.2)' : 'rgba(255,255,255,0.04)',
                      borderColor: repairType === type ? '#6C5CE7' : 'var(--border-medium)',
                    }}
                    onClick={() => setRepairType(type)}
                    id={`repair-type-${type}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <textarea
                style={styles.repairTextarea}
                placeholder="อธิบายปัญหาที่พบ..."
                value={repairDesc}
                onChange={e => setRepairDesc(e.target.value)}
                rows={3}
                id="repair-description"
              />
              {repairSubmitted ? (
                <div style={{textAlign: 'center', color: '#00E676', fontWeight: 600, padding: 10}}>
                   <CheckCircle size={18} style={{verticalAlign: 'middle', marginRight: 6}} />
                   ส่งคำร้องแจ้งซ่อมเรียบร้อย!
                </div>
              ) : (
                <button style={styles.submitRepairBtn} onClick={handleRepairSubmit} id="submit-repair-btn">
                  <Wrench size={16} />
                  <span>ส่งคำร้องแจ้งซ่อม</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="animate-fade-in" style={styles.chatContainer}>
            <div style={styles.chatMessages}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{
                  ...styles.chatBubble,
                  alignSelf: msg.from === 'me' ? 'flex-end' : 'flex-start',
                  background: msg.from === 'me' 
                    ? 'linear-gradient(135deg, #6C5CE7, #8B7CF7)' 
                    : 'var(--bg-card)',
                  border: msg.from === 'me' ? 'none' : '1px solid var(--border-subtle)',
                }}>
                  <span style={styles.chatText}>{msg.text}</span>
                  <span style={styles.chatTime}>{msg.time}</span>
                </div>
              ))}
            </div>
            <div style={styles.chatInput}>
              <input
                style={styles.chatField}
                placeholder="พิมพ์ข้อความ..."
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                id="chat-input"
              />
              <button style={styles.chatSendBtn} onClick={sendChat} id="chat-send-btn">
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 100 },
  emptyState: { padding: '80px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  emptyIcon: { fontSize: 80, marginBottom: 24, animation: 'float 4s ease-in-out infinite' },
  emptyTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 12 },
  emptyDesc: { fontFamily: "'Prompt', sans-serif", fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 },
  findRoomBtn: { 
    padding: '16px 32px', borderRadius: 14, background: 'linear-gradient(135deg, #6C5CE7, #8B7CF7)',
    color: 'white', fontSize: 16, fontWeight: 600, fontFamily: "'Prompt', sans-serif",
    border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(108,92,231,0.3)'
  },
  roomHeader: { position: 'relative', height: 180 },
  roomImageContainer: { position: 'relative', width: '100%', height: '100%' },
  roomImage: {
    width: '100%', height: '100%',
    background: 'linear-gradient(135deg, #1a1a2e, #252545)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  roomOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: '24px 20px 16px',
    background: 'linear-gradient(to top, rgba(10,10,15,0.95), transparent)',
  },
  roomTitle: { fontFamily: "'Prompt', sans-serif", fontSize: 24, fontWeight: 700, color: 'white' },
  roomSubtitle: { fontFamily: "'Prompt', sans-serif", fontSize: 13, color: 'var(--text-secondary)' },
  tabRow: {
    display: 'flex', gap: 6, padding: '12px 16px', overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  tab: {
    padding: '8px 14px', borderRadius: 10,
    fontSize: 13, fontFamily: "'Prompt', sans-serif", fontWeight: 500,
    whiteSpace: 'nowrap', cursor: 'pointer',
    borderBottom: '2px solid', transition: 'all 0.2s ease',
    border: '1px solid',
  },
  content: { padding: '0 16px' },
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    borderRadius: 16, padding: 20, marginBottom: 16,
  },
  cardTitle: {
    fontFamily: "'Prompt', sans-serif", fontSize: 15, fontWeight: 600,
    color: 'var(--text-primary)', marginBottom: 14,
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
    fontFamily: "'Prompt', sans-serif",
  },
  infoLabel: { fontSize: 13, color: 'var(--text-secondary)' },
  infoValue: { fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 },
  billQuick: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  billMonth: { fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Prompt', sans-serif" },
  billAmount: { textAlign: 'right' },
  billTotal: {
    fontSize: 28, fontWeight: 800,
    background: 'linear-gradient(135deg, #FF5252, #FF6B9D)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  payBillBtn: {
    width: '100%', padding: '12px', borderRadius: 10,
    background: 'rgba(255,82,82,0.15)', border: '1px solid rgba(255,82,82,0.3)',
    color: '#FF5252', fontSize: 14, fontWeight: 600, fontFamily: "'Prompt', sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    cursor: 'pointer',
  },
  billBreakdown: { marginBottom: 16 },
  billRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
    fontSize: 14, color: 'var(--text-secondary)', fontFamily: "'Prompt', sans-serif",
  },
  billTotal2: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0 0',
    fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Prompt', sans-serif",
  },
  dueDate: {
    padding: '10px 14px', borderRadius: 10,
    background: 'rgba(255,214,0,0.08)', border: '1px solid rgba(255,214,0,0.15)',
    fontSize: 13, color: '#FFD600', fontFamily: "'Prompt', sans-serif",
    marginBottom: 14,
  },
  scanPayBtn: {
    width: '100%', padding: '14px', borderRadius: 14,
    background: 'linear-gradient(135deg, #6C5CE7, #8B7CF7)',
    color: 'white', fontSize: 15, fontWeight: 600, fontFamily: "'Prompt', sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer', border: 'none',
    boxShadow: '0 4px 20px rgba(108,92,231,0.3)',
  },
  repairTypes: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  repairTypeBtn: {
    padding: '8px 14px', borderRadius: 10,
    border: '1px solid', fontSize: 13, fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer', transition: 'all 0.2s ease', color: 'var(--text-secondary)',
  },
  repairTextarea: {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-medium)',
    color: 'var(--text-primary)', fontSize: 14, fontFamily: "'Prompt', sans-serif",
    resize: 'vertical', marginBottom: 14,
  },
  submitRepairBtn: {
    width: '100%', padding: '14px', borderRadius: 14,
    background: 'rgba(255,107,157,0.15)', border: '1px solid rgba(255,107,157,0.3)',
    color: '#FF6B9D', fontSize: 14, fontWeight: 600, fontFamily: "'Prompt', sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer',
  },
  chatContainer: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 320px)' },
  chatMessages: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: 8,
    padding: '8px 0', overflowY: 'auto',
  },
  chatBubble: {
    maxWidth: '80%', padding: '10px 14px', borderRadius: 14,
  },
  chatText: { fontSize: 14, color: 'var(--text-primary)', fontFamily: "'Prompt', sans-serif", display: 'block' },
  chatTime: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, display: 'block', textAlign: 'right' },
  chatInput: { display: 'flex', gap: 8, paddingTop: 12 },
  chatField: {
    flex: 1, padding: '12px 16px', borderRadius: 14,
    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)', fontSize: 14, fontFamily: "'Prompt', sans-serif",
  },
  chatSendBtn: {
    width: 48, height: 48, borderRadius: 14,
    background: 'linear-gradient(135deg, #6C5CE7, #8B7CF7)',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', border: 'none',
  },
};
