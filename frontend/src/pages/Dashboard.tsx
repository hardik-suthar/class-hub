import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,

  Chip,
  Alert,
  CircularProgress,
  Paper,
  Fab,
  Tooltip,

  Avatar,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  JoinFull as JoinIcon,
  Create as CreateIcon
} from '@mui/icons-material';

interface Group {
  id: number;
  name: string;
  description: string;
  joinCode?: string;
  memberCount?: number;
  teacher?: { id: number; firstName: string; lastName: string; role: string };
  user?: { firstName: string; lastName: string; role: string };
  isOwner?: boolean;
}

const Dashboard = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [createdGroups, setCreatedGroups] = useState<Group[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileAndGroups();
  }, []);

  const fetchProfileAndGroups = async () => {
    setLoading(true);
    setError('');
    try {
      // Get user profile to determine role
      const profileRes = await (window as any).authFetch('/api/users/profile');
      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      const profile = await profileRes.json();
      setRole(profile.role);
      
      if (profile.role === 'TEACHER') {
        // For teachers, fetch both created and joined groups
        const [createdRes, joinedRes] = await Promise.all([
          (window as any).authFetch('/group/teacher/list?page=0&size=100'),
          (window as any).authFetch('/group/student/list?page=0&size=100')
        ]);
        
        if (!createdRes.ok) throw new Error('Failed to fetch created groups');
        if (!joinedRes.ok) throw new Error('Failed to fetch joined groups');
        
        const createdData = await createdRes.json();
        const joinedData = await joinedRes.json();
        
        const createdGroups = createdData.content || createdData;
        const joinedGroups = joinedData.content || joinedData;
        
        // Combine all groups for the main groups state
        const allGroups = [...createdGroups, ...joinedGroups];
        setGroups(allGroups);
        setCreatedGroups(createdGroups);
        setJoinedGroups(joinedGroups);
      } else {
        // For students, fetch only joined groups
        const groupsRes = await (window as any).authFetch('/group/student/list?page=0&size=100');
        if (!groupsRes.ok) throw new Error('Failed to fetch groups');
        const groupsData = await groupsRes.json();
        
        const groups = groupsData.content || groupsData;
        setGroups(groups);
        setJoinedGroups(groups);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => navigate('/create-group');
  const handleJoinGroup = () => navigate('/join-group');

  const renderGroupCard = (group: Group) => (
    <Card 
      key={group.id}
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      onClick={() => navigate(`/group/${group.id}`)}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
              <GroupIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {group.name}
            </Typography>
          </Box>
          {group.joinCode && (
            <Chip 
              label={group.joinCode} 
              size="small" 
              variant="outlined" 
              color="primary"
            />
          )}
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {group.description}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            {(group.teacher || group.user) && (
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  mr: 1,
                  bgcolor: (group.teacher?.role || group.user?.role) === 'TEACHER' ? 'secondary.main' : 'primary.main'
                }}
              >
                {(group.teacher?.role || group.user?.role) === 'TEACHER' ? <SchoolIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
              </Avatar>
            )}
            <Typography variant="caption" color="text.secondary">
              {group.teacher ? `${group.teacher.firstName} ${group.teacher.lastName}` : 
               group.user ? `${group.user.firstName} ${group.user.lastName}` : 'Unknown User'}
            </Typography>
          </Box>
          {group.memberCount !== undefined && (
            <Chip 
              label={`${group.memberCount} members`} 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (title: string, description: string, actionText?: string, actionHandler?: () => void) => (
    <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
      <GroupIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h5" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      {actionText && actionHandler && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={actionHandler}
        >
          {actionText}
        </Button>
      )}
    </Paper>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <DashboardIcon sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                My Classes
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {role === 'TEACHER' ? 'Manage your classes and announcements' : 'View your enrolled classes'}
              </Typography>
            </Box>
          </Box>
          <Box>
            {/* Only teachers see create class button */}
            {role === 'TEACHER' && (
              <Tooltip title="Create New Class">
                <Fab
                  color="primary"
                  aria-label="create class"
                  onClick={handleCreateGroup}
                  sx={{ mr: 2 }}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
            )}
            <Tooltip title="Join Class">
              <Fab
                color="secondary"
                aria-label="join class"
                onClick={handleJoinGroup}
              >
                <JoinIcon />
              </Fab>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Tabs for Teachers */}
      {role === 'TEACHER' ? (
        <Box>
          {/* Teacher: Tabs for created/joined classes */}
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab 
              label={`Classes Created by You (${createdGroups.length})`} 
              icon={<CreateIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={`Classes Joined by You (${joinedGroups.length})`} 
              icon={<JoinIcon />} 
              iconPosition="start"
            />
          </Tabs>
          {activeTab === 0 ? (
            createdGroups.length === 0 ? (
              renderEmptyState(
                'No classes created yet',
                'Create your first class to start managing announcements and students.',
                'Create Your First Class',
                handleCreateGroup
              )
            ) : (
              <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
                {createdGroups.map(renderGroupCard)}
              </Box>
            )
          ) : (
            joinedGroups.length === 0 ? (
              renderEmptyState(
                'No joined classes yet',
                'Join classes using join codes to participate in discussions.',
                'Join a Class',
                handleJoinGroup
              )
            ) : (
              <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
                {joinedGroups.map(renderGroupCard)}
              </Box>
            )
          )}
        </Box>
      ) : (
        /* Student: Only joined classes */
        joinedGroups.length === 0 ? (
          renderEmptyState(
            'No classes joined yet',
            'Join classes using join codes to start participating.',
            'Join a Class',
            handleJoinGroup
          )
        ) : (
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
            {joinedGroups.map(renderGroupCard)}
          </Box>
        )
      )}

      {/* Quick Actions */}
      {groups.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            {role === 'TEACHER' && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleCreateGroup}
              >
                Create Another Class
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<JoinIcon />}
              onClick={handleJoinGroup}
            >
              Join Another Class
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard; 