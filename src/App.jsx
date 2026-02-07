import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuctionProvider } from './context/AuctionContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import TeamManager from './components/TeamManager';
import PlayerManager from './components/PlayerManager';
import AuctionRoom from './components/AuctionRoom';
import SummaryDashboard from './components/SummaryDashboard';
import ProjectorView from './components/ProjectorView';
import LandingPage from './components/LandingPage';
import PlayerRegistration from './components/PlayerRegistration';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <AuctionProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/projector" element={<ProjectorView />} />
            <Route path="/register" element={<PlayerRegistration />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute><Layout><AuctionRoom /></Layout></ProtectedRoute>} />
            <Route path="/admin/teams" element={<ProtectedRoute><Layout><TeamManager /></Layout></ProtectedRoute>} />
            <Route path="/admin/players" element={<ProtectedRoute><Layout><PlayerManager /></Layout></ProtectedRoute>} />
            <Route path="/admin/summary" element={<ProtectedRoute><Layout><SummaryDashboard /></Layout></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuctionProvider>
    </AuthProvider>
  );
}

export default App;
