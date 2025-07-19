import React from 'react';
import Layout from './components/Layout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Group from './pages/Group';
import CreateAnnouncement from './pages/CreateAnnouncement';
import AnnouncementDetail from './pages/AnnouncementDetail';
import Profile from './pages/Profile';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import ProtectedRoute from './ProtectedRoute';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>Please refresh the page or clear your browser data.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
          <details style={{ marginTop: 20, textAlign: 'left' }}>
            <summary>Error Details</summary>
            <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/group/:groupId" element={<ProtectedRoute><Group /></ProtectedRoute>} />
            <Route path="/group/:groupId/create-announcement" element={<ProtectedRoute><CreateAnnouncement /></ProtectedRoute>} />
            <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
            <Route path="/join-group" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/announcement/:announcementId" element={<ProtectedRoute><AnnouncementDetail /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<div style={{padding: 40, textAlign: 'center'}}>404 Not Found</div>} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
