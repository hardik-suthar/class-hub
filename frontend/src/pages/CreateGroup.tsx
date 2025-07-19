import React, { useEffect, useState } from 'react';
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
  Create as CreateIcon
} from '@mui/icons-material';

const CreateGroup = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await (window as any).authFetch('/api/users/profile');
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
        } else {
          setError('Failed to verify permissions');
        }
      } catch (err: any) {
        setError('Network error while verifying permissions');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (role && role !== 'TEACHER') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Only teachers can create classes. Please contact your administrator if you believe this is an error.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await (window as any).authFetch('/group/teacher/create?name=' + encodeURIComponent(name) + '&description=' + encodeURIComponent(description), { method: 'POST' });
      if (res.ok) {
        setSuccess('Class created successfully! Redirecting to dashboard...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        const errorText = await res.text();
        setError(errorText || 'Failed to create class');
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
          Create New Class
        </Typography>
      </Box>

      <Box maxWidth={600} mx="auto">
        <Paper elevation={2} sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
            <CreateIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Create Your Class
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Class Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
              disabled={submitting}
              helperText="Choose a clear, descriptive name for your class"
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
              required
              multiline
              minRows={4}
              disabled={submitting}
              helperText="Describe what this class is about and what students can expect"
              sx={{ mb: 3 }}
            />
            <Box display="flex" gap={2}>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={submitting || !name.trim() || !description.trim()}
                startIcon={submitting ? <CircularProgress size={20} /> : <CreateIcon />}
                sx={{ minWidth: 120 }}
              >
                {submitting ? 'Creating...' : 'Create Class'}
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
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateGroup; 