import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, bio, role })
      });
      if (res.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        const msg = await res.text();
        setError(msg || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center', color: '#1a73e8' }}>Sign Up</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
            />
            <TextField
              label="Role"
              select
              value={role}
              onChange={e => setRole(e.target.value)}
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="STUDENT">Student</MenuItem>
              <MenuItem value="TEACHER">Teacher</MenuItem>
            </TextField>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitting}
              fullWidth
              sx={{ mt: 2 }}
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Button variant="text" onClick={() => navigate('/login')} sx={{ color: '#1a73e8', textTransform: 'none' }}>
                Login
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register; 