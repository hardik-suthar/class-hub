import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Person as PersonIcon, School as SchoolIcon, Email as EmailIcon } from '@mui/icons-material';

interface UserProfileProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  groupTeacherId?: number; // ID of the teacher who created this group
}

interface UserProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  bio?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ open, onClose, userId, groupTeacherId }) => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && userId) {
      fetchUserProfile();
    }
  }, [open, userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await (window as any).authFetch(`/api/users/${userId}`);
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setError('Failed to load user profile');
      }
    } catch (err: any) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUser(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ 
            bgcolor: groupTeacherId && user?.id === groupTeacherId ? 'secondary.main' : 
                     groupTeacherId && user?.role === 'TEACHER' ? 'primary.main' : 
                     user?.role === 'TEACHER' ? 'secondary.main' : 'primary.main' 
          }}>
            {groupTeacherId && user?.id === groupTeacherId ? <SchoolIcon /> : 
             groupTeacherId && user?.role === 'TEACHER' ? <PersonIcon /> : 
             user?.role === 'TEACHER' ? <SchoolIcon /> : <PersonIcon />}
          </Avatar>
          <Typography variant="h6">
            {user ? `${user.firstName} ${user.lastName}` : 'User Profile'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {user && !loading && (
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <EmailIcon color="action" fontSize="small" />
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {/* Show role based on class context */}
              {groupTeacherId && user.id === groupTeacherId ? (
                <Chip 
                  label="Teacher (Class Creator)" 
                  color="secondary"
                  size="small"
                />
              ) : groupTeacherId && user.role === 'TEACHER' ? (
                <Chip 
                  label="Student" 
                  color="primary"
                  size="small"
                />
              ) : (
                <Chip 
                  label={user.role} 
                  color={user.role === 'TEACHER' ? 'secondary' : 'primary'}
                  size="small"
                />
              )}
            </Box>
            
            {user.bio && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Bio
                </Typography>
                <Typography variant="body2" sx={{ 
                  backgroundColor: 'grey.50', 
                  p: 2, 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  {user.bio}
                </Typography>
              </Box>
            )}
            
            {!user.bio && (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No bio available
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfile; 