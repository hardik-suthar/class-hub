import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Divider, 
  TextField, 
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Comment as CommentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

interface Comment {
  id: number;
  content: string;
  user: { firstName: string; lastName: string; id: number };
  createdAt?: string;
}

interface Announcement {
  id: number;
  content: string;
  createdAt?: string;
  user?: { firstName: string; lastName: string; role: string; id: number };
}

const AnnouncementPage = () => {
  const { announcementId } = useParams();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Dialog states
  const [editAnnouncementDialog, setEditAnnouncementDialog] = useState(false);
  const [deleteAnnouncementDialog, setDeleteAnnouncementDialog] = useState(false);
  const [deleteCommentDialog, setDeleteCommentDialog] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [editAnnouncementContent, setEditAnnouncementContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [announcementId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Get user profile
      const profileRes = await (window as any).authFetch('/api/users/profile');
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setRole(profile.role);
        setCurrentUserId(profile.id);
      }
      
      // Get announcement details
      const annRes = await (window as any).authFetch(`/announcement/${announcementId}`);
      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncement(annData);
        setEditAnnouncementContent(annData.content);
      }
      
      // Get comments
      const comRes = await (window as any).authFetch(`/comment/announcement/${announcementId}`);
      if (comRes.ok) {
        setComments(await comRes.json());
      }
    } catch (err: any) {
      setError(err.message || 'Error loading announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const res = await (window as any).authFetch(`/comment/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId, content: newComment })
      });
      if (res.ok) {
        setNewComment('');
        setSuccess('Comment added successfully!');
        // Refresh comments
        const comRes = await (window as any).authFetch(`/comment/announcement/${announcementId}`);
        if (comRes.ok) {
          setComments(await comRes.json());
        }
      } else {
        setError('Failed to add comment');
      }
    } catch (err: any) {
      setError('Network error');
    }
  };

  const handleEditAnnouncement = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await (window as any).authFetch(`/announcement/teacher/${announcementId}?content=${encodeURIComponent(editAnnouncementContent)}`, { method: 'PUT' });
      if (res.ok) {
        setAnnouncement({ ...announcement, content: editAnnouncementContent } as Announcement);
        setSuccess('Announcement updated successfully!');
        setEditAnnouncementDialog(false);
      } else {
        setError('Failed to update announcement');
      }
    } catch (err: any) {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await (window as any).authFetch(`/announcement/teacher/${announcementId}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Announcement deleted successfully!');
        setTimeout(() => navigate(-1), 1000);
      } else {
        setError('Failed to delete announcement');
      }
    } catch (err: any) {
      setError('Network error.');
    } finally {
      setSubmitting(false);
      setDeleteAnnouncementDialog(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;
    try {
      const res = await (window as any).authFetch(`/comment/${selectedComment.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSuccess('Comment deleted successfully!');
        setDeleteCommentDialog(false);
        setSelectedComment(null);
        // Refresh comments
        const comRes = await (window as any).authFetch(`/comment/announcement/${announcementId}`);
        if (comRes.ok) {
          setComments(await comRes.json());
        }
      } else {
        setError('Failed to delete comment');
      }
    } catch (err: any) {
      setError('Network error');
    }
  };

  const openDeleteCommentDialog = (comment: Comment) => {
    setSelectedComment(comment);
    setDeleteCommentDialog(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !announcement) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {announcement && (
        <>
          {/* Header with back button */}
          <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
            <Tooltip title="Go Back">
              <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Announcement
            </Typography>
          </Box>

          {/* Announcement Card */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center">
                {announcement.user && (
                  <Avatar sx={{ 
                    bgcolor: announcement.user.role === 'TEACHER' ? 'secondary.main' : 'primary.main',
                    mr: 2
                  }}>
                    {announcement.user.role === 'TEACHER' ? <SchoolIcon /> : <PersonIcon />}
                  </Avatar>
                )}
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {announcement.user && `${announcement.user.firstName} ${announcement.user.lastName}`}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {announcement.user && (
                      <Chip 
                        label={announcement.user.role === 'TEACHER' ? 'Teacher' : 'Student'} 
                        size="small" 
                        color={announcement.user.role === 'TEACHER' ? 'secondary' : 'primary'}
                        variant="outlined"
                      />
                    )}
                    {announcement.createdAt && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
              {role === 'TEACHER' && (
                <Box>
                  <Tooltip title="Edit Announcement">
                    <IconButton 
                      onClick={() => setEditAnnouncementDialog(true)}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Announcement">
                    <IconButton 
                      onClick={() => setDeleteAnnouncementDialog(true)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {announcement.content}
            </Typography>
          </Paper>

          {/* Comments Section */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
              <CommentIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6">Comments ({comments.length})</Typography>
            </Box>
            
            {comments.length === 0 ? (
              <Box textAlign="center" py={4}>
                <CommentIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No comments yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Be the first to add a comment!
                </Typography>
              </Box>
            ) : (
              <List>
                {comments.map((comment, index) => (
                  <React.Fragment key={comment.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {comment.user.firstName?.[0]}{comment.user.lastName?.[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {comment.user.firstName} {comment.user.lastName}
                            </Typography>
                            {currentUserId === comment.user.id && (
                              <Tooltip title="Delete Comment">
                                <IconButton 
                                  size="small"
                                  onClick={() => openDeleteCommentDialog(comment)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {comment.content}
                            </Typography>
                            {comment.createdAt && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
            
            {/* Add Comment Form */}
            <Box component="form" onSubmit={handleAddComment} sx={{ mt: 3 }}>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  multiline
                  minRows={2}
                  maxRows={4}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={!newComment.trim()}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  Comment
                </Button>
              </Box>
            </Box>
          </Paper>
        </>
      )}

      {/* Edit Announcement Dialog */}
      <Dialog open={editAnnouncementDialog} onClose={() => setEditAnnouncementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Announcement</DialogTitle>
        <DialogContent>
          <TextField
            label="Content"
            value={editAnnouncementContent}
            onChange={(e) => setEditAnnouncementContent(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            minRows={4}
            required
            disabled={submitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditAnnouncementDialog(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleEditAnnouncement} variant="contained" disabled={submitting}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Announcement Dialog */}
      <Dialog open={deleteAnnouncementDialog} onClose={() => setDeleteAnnouncementDialog(false)}>
        <DialogTitle>Delete Announcement</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this announcement? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAnnouncementDialog(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleDeleteAnnouncement} variant="contained" color="error" disabled={submitting}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Comment Dialog */}
      <Dialog open={deleteCommentDialog} onClose={() => setDeleteCommentDialog(false)}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCommentDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteComment} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementPage; 