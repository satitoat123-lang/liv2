import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, ArrowRight, Shield } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export default function LoginScreen() {
  const navigate = useNavigate();
  const store = useStore();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone'); // phone | otp | profile
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [profile, setProfile] = useState({ name: '', university: '' });

  const handleSendOtp = async () => {
    if (phone.length < 9) return alert('กรุณาใส่เบอร์โทรศัพท์ให้ถูกต้อง');
    setLoading(true);
    const ok = await store.sendOtp(phone);
    setLoading(false);
    if (ok) setStep('otp');
    else alert('เกิดข้อผิดพลาดในการส่ง OTP');
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) return alert('กรุณาใส่รหัส OTP 6 หลัก');
    setLoading(true);
    const ok = await store.verifyOtp(phone, code);
    setLoading(false);
    if (ok) setStep('profile');
    else alert('รหัส OTP ไม่ถูกต้อง');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const ok = await store.loginWithGoogle();
    setLoading(false);
    if (ok) navigate('/search');
  };

  const handleComplete = () => {
    navigate('/search');
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgGlow} />
      
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logoSmall}>
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" fill="url(#g1)" opacity="0.9"/>
            <path d="M24 12L34 18V30L24 36L14 30V18L24 12Z" fill="url(#g2)"/>
            <circle cx="24" cy="24" r="4" fill="white" opacity="0.9"/>
            <defs>
              <linearGradient id="g1" x1="6" y1="4" x2="42" y2="44"><stop stopColor="#6C5CE7"/><stop offset="1" stopColor="#FF6B9D"/></linearGradient>
              <linearGradient id="g2" x1="14" y1="12" x2="34" y2="36"><stop stopColor="#A29BFE"/><stop offset="1" stopColor="#6C5CE7"/></linearGradient>
            </defs>
          </svg>
          <span style={styles.logoLabel}>LIV</span>
        </div>
      </div>

      {/* Content Area */}
      <div style={styles.content}>
        {step === 'phone' && (
          <div style={styles.formCard} className="animate-fade-in">
            <h1 style={styles.title}>ยินดีต้อนรับ</h1>
            <p style={styles.subtitle}>เข้าสู่ระบบด้วยเบอร์โทรศัพท์ของคุณ</p>

            <div style={styles.inputGroup}>
              <div style={styles.inputWrapper}>
                <Phone size={18} color="#6C5CE7" />
                <span style={styles.prefix}>+66</span>
                <input
                  style={styles.input}
                  type="tel"
                  placeholder="xxx-xxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  id="phone-input"
                />
              </div>
            </div>

            <button style={styles.primaryBtn} onClick={handleSendOtp} id="send-otp-btn">
              <span>ส่งรหัส OTP</span>
              <ArrowRight size={18} />
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>หรือเข้าสู่ระบบด้วย</span>
              <span style={styles.dividerLine} />
            </div>

            <div style={styles.socialRow}>
              <button 
                style={styles.socialBtn} 
                onClick={handleGoogleLogin}
                disabled={loading}
                id="google-login-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span>Google</span>
              </button>
              <button style={styles.socialBtn} id="apple-login-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Quick access buttons */}
            <div style={styles.quickAccess}>
              <button style={styles.quickBtn} onClick={() => { store.login('tenant'); navigate('/search'); }} id="tenant-demo-btn">
                🏠 ดูแอปผู้เช่า
              </button>
              <button style={styles.quickBtn} onClick={() => { store.login('landlord'); navigate('/landlord'); }} id="landlord-demo-btn">
                💼 ดูแอปเจ้าของหอ
              </button>
              <button style={styles.quickBtn} onClick={() => { store.login('admin'); navigate('/admin'); }} id="admin-demo-btn">
                ⚙️ Admin Dashboard
              </button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div style={styles.formCard} className="animate-fade-in">
            <div style={styles.otpIcon}>
              <Shield size={40} color="#6C5CE7" />
            </div>
            <h1 style={styles.title}>ยืนยันตัวตน</h1>
            <p style={styles.subtitle}>กรอกรหัส 6 หลักที่ส่งไปที่ +66{phone}</p>

            <div style={styles.otpRow}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  style={{...styles.otpInput, borderColor: digit ? '#6C5CE7' : 'rgba(255,255,255,0.1)'}}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const newOtp = [...otp];
                    newOtp[i] = val;
                    setOtp(newOtp);
                    if (val && i < 5) {
                      const next = e.target.parentElement.children[i + 1];
                      if (next) next.focus();
                    }
                  }}
                  id={`otp-input-${i}`}
                />
              ))}
            </div>

            <button style={styles.primaryBtn} onClick={handleVerifyOtp} id="verify-otp-btn">
              <span>ยืนยัน</span>
              <ArrowRight size={18} />
            </button>

            <button style={styles.linkBtn} onClick={() => setStep('phone')}>
              ← กลับ
            </button>
          </div>
        )}

        {step === 'profile' && (
          <div style={styles.formCard} className="animate-fade-in">
            <h1 style={styles.title}>สร้างโปรไฟล์</h1>
            <p style={styles.subtitle}>บอกเราเกี่ยวกับตัวคุณหน่อย</p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>ชื่อ-นามสกุล</label>
              <div style={styles.inputWrapper}>
                <input
                  style={styles.input}
                  placeholder="กรอกชื่อ-นามสกุล"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  id="name-input"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>มหาวิทยาลัย</label>
              <div style={styles.inputWrapper}>
                <input
                  style={styles.input}
                  placeholder="เช่น ม.กรุงเทพ"
                  value={profile.university}
                  onChange={(e) => setProfile({...profile, university: e.target.value})}
                  id="university-input"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>สิ่งที่ให้ความสำคัญ</label>
              <div style={styles.tagRow}>
                {['🐱 เลี้ยงแมว', '📶 เน็ตแรง', '🏊 สระว่ายน้ำ', '🅿️ ที่จอดรถ', '🧺 เครื่องซัก', '🔒 คีย์การ์ด'].map(tag => (
                  <button key={tag} style={styles.tag} id={`tag-${tag}`}>{tag}</button>
                ))}
              </div>
            </div>

            <button style={styles.primaryBtn} onClick={handleComplete} id="complete-profile-btn">
              <span>เริ่มใช้งาน LIV</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    top: '-20%',
    right: '-20%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108,92,231,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  header: {
    padding: '24px 24px 0',
    position: 'relative',
    zIndex: 2,
  },
  logoSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: 4,
    background: 'linear-gradient(135deg, #A29BFE, #FF6B9D)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  content: {
    padding: '40px 24px',
    maxWidth: 420,
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  formCard: {
    background: 'var(--bg-card)',
    borderRadius: 20,
    padding: '32px 24px',
    border: '1px solid var(--border-subtle)',
  },
  title: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 14,
    color: 'var(--text-secondary)',
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 13,
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: 8,
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-medium)',
    borderRadius: 12,
    padding: '14px 16px',
    transition: 'border-color 0.2s',
  },
  prefix: {
    color: 'var(--text-secondary)',
    fontSize: 15,
    fontWeight: 500,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: 'var(--text-primary)',
    background: 'none',
  },
  primaryBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: 14,
    background: 'linear-gradient(135deg, #6C5CE7, #8B7CF7)',
    color: 'white',
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "'Prompt', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(108,92,231,0.3)',
    transition: 'all 0.2s ease',
    marginBottom: 20,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'var(--border-subtle)',
  },
  dividerText: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 12,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
  },
  socialRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    padding: '14px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-medium)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  quickAccess: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    paddingTop: 8,
    borderTop: '1px solid var(--border-subtle)',
  },
  quickBtn: {
    padding: '12px 16px',
    borderRadius: 10,
    background: 'rgba(108,92,231,0.08)',
    border: '1px solid rgba(108,92,231,0.15)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  otpIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: 'rgba(108,92,231,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  otpRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    justifyContent: 'center',
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.04)',
    border: '2px solid',
    color: 'var(--text-primary)',
    fontSize: 22,
    fontWeight: 700,
    textAlign: 'center',
    transition: 'border-color 0.2s',
  },
  linkBtn: {
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    color: 'var(--text-muted)',
    fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer',
    padding: 8,
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    padding: '8px 14px',
    borderRadius: 20,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-medium)',
    color: 'var(--text-secondary)',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};
