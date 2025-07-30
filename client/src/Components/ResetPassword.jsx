import React, { useState } from 'react';
import axios from 'axios';

const getTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('token') || '';
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = getTokenFromUrl();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/reset-password', { token, password });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 24, border: '1px solid #eee', borderRadius: 10 }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="password">New Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 8, margin: '10px 0', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <label htmlFor="confirm">Confirm Password:</label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          style={{ width: '100%', padding: 8, margin: '10px 0 20px 0', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ width: '100%', padding: 10, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }} disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {message && <div style={{ color: 'green', marginTop: 16 }}>{message}</div>}
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </div>
  );
};

export default ResetPassword;
