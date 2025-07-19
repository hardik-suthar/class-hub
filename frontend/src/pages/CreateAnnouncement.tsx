import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Announcement as AnnouncementIcon
} from '@mui/icons-material';

const CreateAnnouncement = () => {
  const { groupId } = useParams();
  const [content, setContent] = useState('');
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
            Only teachers can create announcements. Please contact your administrator if you believe this is an error.
          </Typography>
          <Button variant="outlined" onClick={() => navigate(`/group/${groupId}`)}>
            Back to Class
          </Button>
        </Paper>
      </Box>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter announcement content');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await (window as any).authFetch(`/announcement/teacher/create?groupId=${groupId}&content=${encodeURIComponent(content)}`, { method: 'POST' });
      if (res.ok) {
        setSuccess('Announcement created successfully! Redirecting to class...');
        setTimeout(() => navigate(`/group/${groupId}`), 1500);
      } else {
        const errorText = await res.text();
        setError(errorText || 'Failed to create announcement');
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
        <IconButton onClick={() => navigate(`/group/${groupId}`)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Create Announcement
        </Typography>
      </Box>

      <Box maxWidth={700} mx="auto">
        <Paper elevation={2} sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
            <AnnouncementIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              New Announcement
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Announcement Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              minRows={6}
              maxRows={12}
              required
              disabled={submitting}
              helperText="Share important information, updates, or instructions with your class"
              sx={{ mb: 3 }}
              placeholder="Enter your announcement here..."
            />
            <Box display="flex" gap={2}>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={submitting || !content.trim()}
                startIcon={submitting ? <CircularProgress size={20} /> : <AnnouncementIcon />}
                sx={{ minWidth: 140 }}
              >
                {submitting ? 'Creating...' : 'Create Announcement'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate(`/group/${groupId}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </Box>
          </form>
          
          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
              Tips for effective announcements:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Be clear and concise
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Include important dates and deadlines
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Use bullet points for multiple items
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Students can comment on announcements to ask questions
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateAnnouncement; 