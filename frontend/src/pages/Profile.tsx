import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await (window as any).authFetch('/api/users/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setRole(data.role);
        setBio(data.bio || '');
      } catch (err: any) {
        setError(err.message || 'Error loading profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await (window as any).authFetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, bio })
      });
      if (res.ok) {
        setSuccess('Profile updated successfully!');
      } else {
        const errorText = await res.text();
        setError(errorText || 'Failed to update profile');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setSubmitting(true);
    setError('');
    try {
      console.log('Attempting to delete account...');
      const res = await (window as any).authFetch('/api/users/profile', { method: 'DELETE' });
      console.log('Delete account response status:', res.status);
      if (res.ok) {
        console.log('Account deleted successfully, redirecting...');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        console.error('Failed to delete account:', res.status, res.statusText);
        const errorText = await res.text();
        console.error('Error response:', errorText);
        setError(errorText || 'Failed to delete account');
      }
    } catch (err: any) {
      console.error('Exception during account deletion:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto">
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>Profile</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          {loading && <Typography>Loading...</Typography>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {profile && (
            <form onSubmit={handleSave}>
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
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                value={role}
                fullWidth
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                disabled={submitting}
                fullWidth
                sx={{ mt: 2 }}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                fullWidth 
                sx={{ mt: 2 }} 
                onClick={() => setDeleteDialogOpen(true)}
                disabled={submitting}
              >
                Delete Account
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete your account? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" disabled={submitting}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 