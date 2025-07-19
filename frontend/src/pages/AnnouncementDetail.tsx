import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, TextField, Button, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Announcement as AnnouncementIcon, Person as PersonIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface Announcement {
  id: number;
  content: string;
  createdAt?: string;
  user?: { id: number; firstName: string; lastName: string; role: string };
}

interface Comment {
  id: number;
  content: string;
  createdAt?: string;
  user: { firstName: string; lastName: string; id: number };
}

const AnnouncementDetail = () => {
  const { announcementId } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchData();
  }, [announcementId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Get user profile
      const profileRes = await (window as any).authFetch('/api/users/profile');
      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      const profile = await profileRes.json();
      setCurrentUserId(profile.id || null);

      // Get announcement details
      const annRes = await (window as any).authFetch(`/announcement/${announcementId}`);
      if (annRes.ok) {
        const announcementData = await annRes.json();
        setAnnouncement(announcementData);
        
        // Determine user's role in this specific announcement's group
        // If user is the teacher of this announcement, they have TEACHER role
        // Otherwise, they are a STUDENT (even if they are a teacher globally)
        if (announcementData.user && announcementData.user.id === profile.id) {
          setCurrentUserRole('TEACHER');
        } else {
          setCurrentUserRole('STUDENT');
        }
      } else {
        throw new Error('Announcement not found');
      }

      // Get first page of comments
      await fetchComments(0, true);
    } catch (err: any) {
      console.error('Error in fetchData:', err);
      setError(err.message || 'Error loading announcement');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (pageNum: number, reset: boolean = false) => {
    try {
      const res = await (window as any).authFetch(`/comment/announcement/${announcementId}?page=${pageNum}&size=20`);
      if (res.ok) {
        const data = await res.json();
        const newComments = data.content || [];
        
        if (reset) {
          setComments(newComments);
        } else {
          setComments(prev => [...prev, ...newComments]);
        }
        
        setHasMore(!data.last);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await (window as any).authFetch(`/comment/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `announcementId=${encodeURIComponent(announcementId!)}&content=${encodeURIComponent(newComment)}`
      });
      if (res.ok) {
        setNewComment('');
        // Refresh comments from first page
        await fetchComments(0, true);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
    setSubmitting(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchComments(page + 1);
    setLoadingMore(false);
  };

  // Comment edit/delete handlers
  const handleOpenEditComment = (comment: Comment) => {
    setEditCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleEditComment = async () => {
    if (!editCommentContent.trim() || editCommentId == null) return;
    setSubmitting(true);
    try {
      const res = await (window as any).authFetch(`/comment/${editCommentId}?content=${encodeURIComponent(editCommentContent)}`, { method: 'PUT' });
      if (res.ok) {
        // Refresh comments from first page
        await fetchComments(0, true);
        setEditCommentId(null);
        setEditCommentContent('');
      }
    } catch (err) {
      console.error('Error editing comment:', err);
    }
    setSubmitting(false);
  };

  const handleOpenDeleteComment = (id: number) => setDeleteCommentId(id);

  const handleDeleteComment = async () => {
    if (deleteCommentId == null) return;
    setSubmitting(true);
    try {
      const res = await (window as any).authFetch(`/comment/${deleteCommentId}`, { method: 'DELETE' });
      if (res.ok) {
        // Refresh comments from first page
        await fetchComments(0, true);
        setDeleteCommentId(null);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
    setSubmitting(false);
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress size={60} /></Box>;
  if (error) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><Typography color="error">{error}</Typography></Box>;
  if (!announcement) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><Typography color="error">Announcement not found</Typography></Box>;

  return (
    <Box maxWidth="800px" mx="auto" p={3}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {/* Announcement */}
      <Paper sx={{ mb: 3, p: 3 }} elevation={2}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AnnouncementIcon color="primary" />
          <Typography variant="h5" component="h1">
            Announcement
          </Typography>
        </Box>
        
        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {announcement.content}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {announcement.user ? `${announcement.user.firstName} ${announcement.user.lastName}` : 'Unknown User'} • {announcement.createdAt && new Date(announcement.createdAt).toLocaleString()}
        </Typography>
      </Paper>

      {/* Comments Section */}
      <Paper sx={{ p: 3 }} elevation={2}>
        <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>
        
        {/* Add Comment */}
        <Box display="flex" gap={1} alignItems="flex-start" mb={3}>
          <TextField
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            fullWidth
            multiline
            minRows={2}
            disabled={submitting}
          />
          <Button
            variant="contained"
            onClick={handleAddComment}
            disabled={submitting || !newComment.trim()}
          >
            Post
          </Button>
        </Box>

        {/* Comments List */}
        <List>
          {comments.map((com) => (
            <ListItem key={com.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar><PersonIcon /></Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>{com.user ? `${com.user.firstName} ${com.user.lastName}` : 'Unknown User'}</span>
                    {/* Show edit/delete buttons for comment author OR for announcement teacher */}
                    {(currentUserId && com.user && com.user.id === currentUserId) || currentUserRole === 'TEACHER' ? (
                      <>
                        {/* Only show edit button for comment author */}
                        {currentUserId && com.user && com.user.id === currentUserId && (
                          <IconButton size="small" onClick={() => handleOpenEditComment(com)}><EditIcon fontSize="small" /></IconButton>
                        )}
                        {/* Show delete button for comment author OR for announcement teacher */}
                        {(currentUserId && com.user && com.user.id === currentUserId) || currentUserRole === 'TEACHER' ? (
                          <IconButton size="small" onClick={() => handleOpenDeleteComment(com.id)}><DeleteIcon fontSize="small" /></IconButton>
                        ) : null}
                      </>
                    ) : null}
                  </Box>
                }
                secondary={
                  editCommentId === com.id ? (
                    <Box>
                      <TextField
                        value={editCommentContent}
                        onChange={e => setEditCommentContent(e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        minRows={1}
                        disabled={submitting}
                      />
                      <Box mt={1}>
                        <Button onClick={handleEditComment} variant="contained" size="small" disabled={submitting || !editCommentContent.trim()}>Save</Button>
                        <Button onClick={() => { setEditCommentId(null); setEditCommentContent(''); }} size="small">Cancel</Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      {com.content}
                      <br />
                      <Typography variant="caption" color="text.secondary">{com.createdAt && new Date(com.createdAt).toLocaleString()}</Typography>
                    </>
                  )
                }
              />
            </ListItem>
          ))}
        </List>

        {/* Load More Button */}
        {hasMore && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outlined"
            >
              {loadingMore ? <CircularProgress size={20} /> : 'Load More Comments'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Delete Comment Dialog */}
      <Dialog open={deleteCommentId !== null} onClose={() => setDeleteCommentId(null)}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>Are you sure you want to delete this comment?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCommentId(null)}>Cancel</Button>
          <Button onClick={handleDeleteComment} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementDetail; 