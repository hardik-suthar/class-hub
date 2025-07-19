import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await ((window as any).authFetch
          ? (window as any).authFetch('/api/users/profile')
          : fetch('/api/users/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }));
        if (res.ok) setProfile(await res.json());
      } catch {}
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', alignItems: 'center', padding: 12, background: '#f5f5f5', marginBottom: 24 }}>
      <Link to="/" style={{ marginRight: 16, fontWeight: 'bold', fontSize: 20 }}>ClassHub</Link>
      <Link to="/" style={{ marginRight: 16 }}>Dashboard</Link>
      <Link to="/profile" style={{ marginRight: 16 }}>Profile</Link>
      <div style={{ flex: 1 }} />
      {profile && (
        <span style={{ marginRight: 16 }}>{profile.name} ({profile.role})</span>
      )}
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default NavBar; 