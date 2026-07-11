import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FileText, Sparkles, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout, upgradeSubscription } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpgrade = async () => {
    if (user.subscription === 'FREE') {
      await upgradeSubscription('PREMIUM');
    } else {
      await upgradeSubscription('FREE');
    }
  };

  if (!user) return null;

  return (
    <nav className="glass-panel" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      margin: '1.5rem',
      borderRadius: 'var(--radius-md)',
      position: 'sticky',
      top: '1rem',
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{
          textDecoration: 'none',
          fontFamily: 'Outfit',
          fontSize: '1.5rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Sparkles size={24} style={{ stroke: 'var(--color-primary)' }} />
          Resume.AI
        </Link>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/" style={navLinkStyle}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link to="/cover-letters" style={navLinkStyle}>
            <FileText size={18} />
            Cover Letters
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <UserIcon size={18} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.name}</span>
          <span 
            onClick={handleUpgrade}
            className={`badge ${user.subscription === 'PREMIUM' ? 'badge-premium' : 'badge-free'}`}
            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
            title="Click to toggle Premium Subscription"
          >
            {user.subscription}
          </span>
        </div>

        <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

const navLinkStyle = {
  textDecoration: 'none',
  color: 'var(--text-muted)',
  fontSize: '0.95rem',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'color var(--transition-fast)',
  cursor: 'pointer'
};

// Add interactive active styling
document.addEventListener('DOMContentLoaded', () => {
  const styles = document.createElement('style');
  styles.innerHTML = `
    nav a:hover {
      color: var(--text-main) !important;
    }
  `;
  document.head.appendChild(styles);
});

export default Navbar;
