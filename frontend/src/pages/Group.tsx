import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, TextField, Button, Chip, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Announcement as AnnouncementIcon, Person as PersonIcon, School as SchoolIcon, Group as GroupIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import UserProfile from '../components/UserProfile';

interface Announcement {
  id: number;
  content: string;
  createdAt?: string;
  user?: { id: number; firstName: string; lastName: string; role: string };
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [editAnnouncementId, setEditAnnouncementId] = useState<number | null>(null);
  const [editAnnouncementContent, setEditAnnouncementContent] = useState('');
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removeStudentId, setRemoveStudentId] = useState<number | null>(null);
  const [leaveClassDialog, setLeaveClassDialog] = useState(false);
  const [editClassDialog, setEditClassDialog] = useState(false);
  const [deleteClassDialog, setDeleteClassDialog] = useState(false);
  const [editClassName, setEditClassName] = useState('');
  const [editClassDescription, setEditClassDescription] = useState('');
  const [userProfileDialog, setUserProfileDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [groupId]);

    const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Get user profile
      const profileRes = await (window as any).authFetch('/api/users/profile');
      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      const profile = await profileRes.json();
      setCurrentUserId(profile.id || null);
      
      // Get group details
      const groupRes = await (window as any).authFetch(`/group/${groupId}`);
      let groupData: any = null;
      if (groupRes.ok) {
        groupData = await groupRes.json();
        setGroup(groupData);
        
        // Determine user's role in this specific group
        // If user is the teacher of this group, they have TEACHER role
        // Otherwise, they are a STUDENT (even if they are a teacher globally)
        if (groupData.teacher && groupData.teacher.id === profile.id) {
          setRole('TEACHER');
        } else {
          setRole('STUDENT');
        }
      } else {
        console.warn('Failed to fetch group details');
        setGroup(null);
        setRole('STUDENT'); // Default to student if group not found
      }
      
      // Get first page of announcements
      await fetchAnnouncements(0, true);
      
      // Get members
      const memRes = await (window as any).authFetch(`/group/${groupId}/members`);
      if (memRes.ok) {
        const membersData = await memRes.json();
        const enrolledMembers = Array.isArray(membersData.content) ? membersData.content : [];
        
        // Add the teacher to the members list for display purposes
        if (groupData && groupData.teacher) {
          setMembers([groupData.teacher, ...enrolledMembers]);
        } else {
          setMembers(enrolledMembers);
        }
      } else {
        setMembers(groupData && groupData.teacher ? [groupData.teacher] : []);
      }
    } catch (err: any) {
      console.error('Error in fetchData:', err);
      setError(err.message || 'Error loading group');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async (pageNum: number, reset: boolean = false) => {
    try {
      const res = await (window as any).authFetch(`/announcement/group/${groupId}?page=${pageNum}&size=20`);
      if (res.ok) {
        const data = await res.json();
        const newAnnouncements = data.content || [];
        
        if (reset) {
          setAnnouncements(newAnnouncements);
        } else {
          setAnnouncements(prev => [...prev, ...newAnnouncements]);
        }
        
        setHasMore(!data.last);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchAnnouncements(page + 1);
    setLoadingMore(false);
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.trim()) return;
    setCreatingAnnouncement(true);
    try {
      const res = await (window as any).authFetch(`/announcement/teacher/create?groupId=${groupId}&content=${encodeURIComponent(newAnnouncement)}`, { method: 'POST' });
      if (res.ok) {
        setNewAnnouncement('');
        // Refresh announcements from first page
        await fetchAnnouncements(0, true);
      }
    } catch {}
    setCreatingAnnouncement(false);
  };

  // Announcement edit/delete handlers
  const handleOpenEditAnnouncement = (ann: Announcement) => {
    setEditAnnouncementId(ann.id);
    setEditAnnouncementContent(ann.content);
  };
  const handleEditAnnouncement = async () => {
    if (!editAnnouncementContent.trim() || editAnnouncementId == null) return;
    setSubmitting(true);
    try {
      const res = await (window as any).authFetch(`/announcement/teacher/${editAnnouncementId}?content=${encodeURIComponent(editAnnouncementContent)}`, { method: 'PUT' });
      if (res.ok) {
        // Refresh announcements from first page
        await fetchAnnouncements(0, true);
        setEditAnnouncementId(null);
        setEditAnnouncementContent('');
      }
    } catch {}
    setSubmitting(false);
  };
  const handleOpenDeleteAnnouncement = (id: number) => setDeleteAnnouncementId(id);
  const handleDeleteAnnouncement = async () => {
    if (deleteAnnouncementId == null) return;
    setSubmitting(true);
    try {
      const res = await (window as any).authFetch(`/announcement/teacher/${deleteAnnouncementId}`, { method: 'DELETE' });
      if (res.ok) {
        // Refresh announcements from first page
        await fetchAnnouncements(0, true);
        setDeleteAnnouncementId(null);
      }
    } catch {}
    setSubmitting(false);
  };

  // Member management handlers
  const handleRemoveStudent = async () => {
    if (removeStudentId == null) return;
    setSubmitting(true);
    try {
      const res = await (window as any).authFetch(`/group/teacher/${groupId}/students/${removeStudentId}`, { method: 'DELETE' });
      if (res.ok) {
        // Refresh members
        const memRes = await (window as any).authFetch(`/group/${groupId}/members`);
        if (memRes.ok) {
          const membersData = await memRes.json();
          const enrolledMembers = Array.isArray(membersData.content) ? membersData.content : [];
          
          // Add the teacher to the members list for display purposes
          if (group && group.teacher) {
            setMembers([group.teacher, ...enrolledMembers]);
          } else {
            setMembers(enrolledMembers);
          }
        }
        setRemoveStudentId(null);
      }
    } catch {}
    setSubmitting(false);
  };

  const handleLeaveClass = async () => {
    setSubmitting(true);
    try {
      const res = await (window as any).authFetch(`/group/student/${groupId}/leave`, { method: 'DELETE' });
      if (res.ok) {
        // Redirect to dashboard
        navigate('/');
      }
    } catch {}
    setSubmitting(false);
  };

  const handleOpenEditClass = () => {
    if (group) {
      setEditClassName(group.name || '');
      setEditClassDescription(group.description || '');
      setEditClassDialog(true);
    }
  };

  const handleEditClass = async () => {
    if (!editClassName.trim() || !editClassDescription.trim()) return;
    setSubmitting(true);
    try {
      const res = await (window as any).authFetch(`/group/teacher/${groupId}?name=${encodeURIComponent(editClassName.trim())}&description=${encodeURIComponent(editClassDescription.trim())}`, { method: 'PUT' });
      if (res.ok) {
        // Refresh group data
        const groupRes = await (window as any).authFetch(`/group/${groupId}`);
        if (groupRes.ok) {
          const groupData = await groupRes.json();
          setGroup(groupData);
        }
        setEditClassDialog(false);
      }
    } catch {}
    setSubmitting(false);
  };

  const handleDeleteClass = async () => {
    setSubmitting(true);
    try {
      console.log('Attempting to delete group:', groupId);
      const res = await (window as any).authFetch(`/group/teacher/${groupId}`, { method: 'DELETE' });
      console.log('Delete response status:', res.status);
      if (res.ok) {
        console.log('Group deleted successfully, redirecting...');
        // Redirect to dashboard
        navigate('/');
      } else {
        console.error('Failed to delete group:', res.status, res.statusText);
        const errorText = await res.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Exception during delete:', error);
    }
    setSubmitting(false);
  };

  const handleUserProfileClick = (userId: number) => {
    setSelectedUserId(userId);
    setUserProfileDialog(true);
  };

  const handleAnnouncementClick = (announcementId: number) => {
    navigate(`/announcement/${announcementId}`);
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress size={60} /></Box>;
  if (error) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><Typography color="error">{error}</Typography></Box>;

  return (
    <Box>
      {/* Class Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {group?.name || 'Loading...'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {group?.description || 'Loading...'}
            </Typography>
            {group?.joinCode && (
              <Chip 
                label={`Join Code: ${group.joinCode}`} 
                size="small" 
                variant="outlined" 
                color="primary"
              />
            )}
          </Box>
          {role === 'TEACHER' && (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleOpenEditClass}
                disabled={submitting}
              >
                Edit Class
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteClassDialog(true)}
                disabled={submitting}
              >
                Delete Class
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
        {/* Announcements Feed */}
        <Box flex={2}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>Announcements</Typography>
        {role === 'TEACHER' && (
          <Paper sx={{ mb: 3, p: 2 }} elevation={1}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Create Announcement</Typography>
            <Box display="flex" gap={1} alignItems="center">
              <TextField
                value={newAnnouncement}
                onChange={e => setNewAnnouncement(e.target.value)}
                placeholder="Write a new announcement..."
                fullWidth
                multiline
                minRows={2}
                disabled={creatingAnnouncement}
              />
              <Button
                variant="contained"
                onClick={handleCreateAnnouncement}
                disabled={creatingAnnouncement || !newAnnouncement.trim()}
              >
                Post
              </Button>
            </Box>
          </Paper>
        )}
        {announcements.length === 0 ? (
          <Typography color="text.secondary">No announcements yet.</Typography>
        ) : (
          <>
            {announcements.map((ann) => (
              <Paper key={ann.id} sx={{ mb: 2, p: 2, cursor: 'pointer' }} elevation={2} onClick={() => handleAnnouncementClick(ann.id)}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AnnouncementIcon color="primary" />
                  {editAnnouncementId === ann.id ? (
                    <TextField
                      value={editAnnouncementContent}
                      onChange={e => setEditAnnouncementContent(e.target.value)}
                      size="small"
                      fullWidth
                      multiline
                      minRows={1}
                      disabled={submitting}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {ann.content.length > 100 ? `${ann.content.substring(0, 100)}...` : ann.content}
                    </Typography>
                  )}
                  {role === 'TEACHER' && currentUserId && ann.user && ann.user.id === currentUserId && (
                    <Box onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={() => handleOpenEditAnnouncement(ann)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleOpenDeleteAnnouncement(ann.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  )}
                </Box>
                {editAnnouncementId === ann.id && (
                  <Box mb={1} onClick={(e) => e.stopPropagation()}>
                    <Button onClick={handleEditAnnouncement} variant="contained" size="small" disabled={submitting || !editAnnouncementContent.trim()}>Save</Button>
                    <Button onClick={() => { setEditAnnouncementId(null); setEditAnnouncementContent(''); }} size="small">Cancel</Button>
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary">
                  <span 
                    style={{ 
                      cursor: 'pointer', 
                      color: '#1976d2',
                      textDecoration: 'underline',
                      '&:hover': { color: '#1565c0' }
                    } as React.CSSProperties}
                    onClick={() => ann.user && handleUserProfileClick(ann.user.id)}
                  >
                    {ann.user ? `${ann.user.firstName} ${ann.user.lastName}` : 'Unknown User'}
                  </span>
                  {' • '}{ann.createdAt && new Date(ann.createdAt).toLocaleString()}
                </Typography>
              </Paper>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outlined"
                >
                  {loadingMore ? <CircularProgress size={20} /> : 'Load More Announcements'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
      {/* Students List Sidebar */}
      <Box flex={1}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}><GroupIcon sx={{ mr: 1 }} />Class Members</Typography>
        {members.length === 0 ? (
          <Typography color="text.secondary">No members yet.</Typography>
        ) : (
          <List>
            {members
              .sort((a, b) => {
                // Sort group creator (teacher) to the top
                const aIsCreator = group && group.teacher && group.teacher.id === a.id;
                const bIsCreator = group && group.teacher && group.teacher.id === b.id;
                if (aIsCreator && !bIsCreator) return -1;
                if (!aIsCreator && bIsCreator) return 1;
                return 0;
              })
              .map((member) => {
              // In the class context, all members appear as students except the group owner
              // The group owner is determined by checking if they are the teacher of this group
              const isGroupOwner = group && group.teacher && group.teacher.id === member.id;
              const displayAsStudent = !isGroupOwner;
              
              return (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: displayAsStudent ? 'primary.main' : 'secondary.main',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8,
                          transform: 'scale(1.05)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                      onClick={() => handleUserProfileClick(member.id)}
                    >
                      {displayAsStudent ? <PersonIcon /> : <SchoolIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1">
                          {member.firstName} {member.lastName}
                        </Typography>
                        {isGroupOwner && (
                          <Chip 
                            label="Class Creator" 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={<Chip label={displayAsStudent ? 'Student' : 'Teacher'} size="small" color={displayAsStudent ? 'primary' : 'secondary'} />}
                  />
                  {/* Show remove button for group teacher (can't remove themselves) */}
                  {role === 'TEACHER' && member.id !== currentUserId && (
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => setRemoveStudentId(member.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItem>
              );
            })}
          </List>
        )}
        
        {/* Leave Class Button for Students */}
        {role === 'STUDENT' && (
          <Box mt={3}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() => setLeaveClassDialog(true)}
              disabled={submitting}
            >
              Leave Class
            </Button>
          </Box>
        )}
      </Box>
    </Box>
      {/* Dialogs for delete confirmation */}
      <Dialog open={deleteAnnouncementId !== null} onClose={() => setDeleteAnnouncementId(null)}>
        <DialogTitle>Delete Announcement</DialogTitle>
        <DialogContent>Are you sure you want to delete this announcement?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAnnouncementId(null)}>Cancel</Button>
          <Button onClick={handleDeleteAnnouncement} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Remove Student Dialog */}
      <Dialog open={removeStudentId !== null} onClose={() => setRemoveStudentId(null)}>
        <DialogTitle>Remove Student</DialogTitle>
        <DialogContent>Are you sure you want to remove this student from the class?</DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveStudentId(null)}>Cancel</Button>
          <Button onClick={handleRemoveStudent} color="error" variant="contained" disabled={submitting}>Remove</Button>
        </DialogActions>
      </Dialog>

      {/* Leave Class Dialog */}
      <Dialog open={leaveClassDialog} onClose={() => setLeaveClassDialog(false)}>
        <DialogTitle>Leave Class</DialogTitle>
        <DialogContent>Are you sure you want to leave this class? You will no longer have access to announcements and discussions.</DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveClassDialog(false)}>Cancel</Button>
          <Button onClick={handleLeaveClass} color="error" variant="contained" disabled={submitting}>Leave Class</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={editClassDialog} onClose={() => setEditClassDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editClassName}
            onChange={(e) => setEditClassName(e.target.value)}
            error={!editClassName.trim()}
            helperText={!editClassName.trim() ? 'Class name cannot be empty' : ''}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Class Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            minRows={3}
            value={editClassDescription}
            onChange={(e) => setEditClassDescription(e.target.value)}
            error={!editClassDescription.trim()}
            helperText={!editClassDescription.trim() ? 'Class description cannot be empty' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditClassDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleEditClass} 
            variant="contained" 
            disabled={submitting || !editClassName.trim() || !editClassDescription.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Class Dialog */}
      <Dialog open={deleteClassDialog} onClose={() => setDeleteClassDialog(false)}>
        <DialogTitle>Delete Class</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this class? This action cannot be undone and will:
          </Typography>
          <ul style={{ marginTop: '8px', marginBottom: '8px' }}>
            <li>Remove all announcements and comments</li>
            <li>Remove all enrolled students</li>
            <li>Permanently delete the class</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteClassDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteClass} color="error" variant="contained" disabled={submitting}>Delete Class</Button>
        </DialogActions>
      </Dialog>

      {/* User Profile Dialog */}
      <UserProfile 
        open={userProfileDialog} 
        onClose={() => setUserProfileDialog(false)} 
        userId={selectedUserId || 0}
        groupTeacherId={group?.teacher?.id}
      />
    </Box>
  );
};

export default GroupPage; 