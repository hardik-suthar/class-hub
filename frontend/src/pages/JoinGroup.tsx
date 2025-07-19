import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Paper,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  JoinFull as JoinIcon
} from '@mui/icons-material';

const JoinGroup = () => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Please enter a join code');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await (window as any).authFetch('/group/student/join?joinCode=' + encodeURIComponent(joinCode), { method: 'POST' });
      if (res.ok) {
        setSuccess('Successfully joined the class! Redirecting to dashboard...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        const errorText = await res.text();
        setError(errorText || 'Failed to join class. Please check the join code.');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Header with back button */}
      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Join a Class
        </Typography>
      </Box>

      <Box maxWidth={500} mx="auto">
        <Paper elevation={2} sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
            <JoinIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Enter Join Code
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Join Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              fullWidth
              margin="normal"
              required
              disabled={submitting}
              helperText="Enter the join code provided by your teacher (case-insensitive)"
              sx={{ mb: 3 }}
              inputProps={{
                style: { fontSize: '1.2rem', fontWeight: 'bold' }
              }}
            />
            <Box display="flex" gap={2}>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={submitting || !joinCode.trim()}
                startIcon={submitting ? <CircularProgress size={20} /> : <JoinIcon />}
                sx={{ minWidth: 120 }}
              >
                {submitting ? 'Joining...' : 'Join Class'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/')}
                disabled={submitting}
              >
                Cancel
              </Button>
            </Box>
          </form>
          
          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
              How to get a join code?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Ask your teacher for the class join code
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • The join code is usually displayed at the top of the class page
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Join codes are case-insensitive and typically 6-8 characters long
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default JoinGroup; 