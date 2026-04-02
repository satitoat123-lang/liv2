import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2000);
    const t4 = setTimeout(() => navigate('/login'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [navigate]);

  return (
    <div style={styles.container}>
      {/* Animated background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={{
        ...styles.logoContainer,
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'scale(1)' : 'scale(0.5)',
        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        {/* Logo mark */}
        <div style={styles.logoMark}>
          <div style={styles.logoIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" fill="url(#grad1)" opacity="0.9"/>
              <path d="M24 12L34 18V30L24 36L14 30V18L24 12Z" fill="url(#grad2)"/>
              <circle cx="24" cy="24" r="4" fill="white" opacity="0.9"/>
              <defs>
                <linearGradient id="grad1" x1="6" y1="4" x2="42" y2="44">
                  <stop stopColor="#6C5CE7"/>
                  <stop offset="1" stopColor="#FF6B9D"/>
                </linearGradient>
                <linearGradient id="grad2" x1="14" y1="12" x2="34" y2="36">
                  <stop stopColor="#A29BFE"/>
                  <stop offset="1" stopColor="#6C5CE7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h1 style={{
          ...styles.logoText,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease 0.3s',
        }}>LIV</h1>

        <p style={{
          ...styles.tagline,
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 0.6s ease',
        }}>เห็นจริง... จองชัวร์</p>

        <p style={{
          ...styles.taglineEn,
          opacity: phase >= 2 ? 1 : 0,
          transition: 'opacity 0.6s ease 0.2s',
        }}>See Real, Book Sure</p>
      </div>

      {/* Loading dots */}
      <div style={{
        ...styles.loadingContainer,
        opacity: phase >= 3 ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            ...styles.dot,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #1a1a2e 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(108, 92, 231, 0.15) 0%, transparent 70%)',
    top: '10%',
    left: '-10%',
    animation: 'float 6s ease-in-out infinite',
  },
  orb2: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 107, 157, 0.1) 0%, transparent 70%)',
    bottom: '5%',
    right: '-15%',
    animation: 'float 8s ease-in-out infinite reverse',
  },
  orb3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 230, 118, 0.08) 0%, transparent 70%)',
    top: '50%',
    right: '20%',
    animation: 'float 5s ease-in-out infinite',
  },
  logoContainer: {
    textAlign: 'center',
    zIndex: 1,
  },
  logoMark: {
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 80,
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    background: 'rgba(108, 92, 231, 0.1)',
    border: '1px solid rgba(108, 92, 231, 0.2)',
  },
  logoText: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 56,
    fontWeight: 900,
    letterSpacing: '12px',
    background: 'linear-gradient(135deg, #A29BFE, #FF6B9D)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: 8,
  },
  tagline: {
    fontFamily: "'Prompt', sans-serif",
    fontSize: 18,
    fontWeight: 500,
    color: '#f0f0f5',
    letterSpacing: '3px',
    marginBottom: 4,
  },
  taglineEn: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    color: '#6a6a84',
    letterSpacing: '4px',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    display: 'flex',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6C5CE7, #FF6B9D)',
    animation: 'pulse 1.2s ease-in-out infinite',
  },
};
