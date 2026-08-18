import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Market from './pages/Market';
import Lessons from './pages/Lessons';
import Leaderboard from './pages/Leaderboard';
import Coach from './pages/Coach';

function Home() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

/* Offsets page content past the fixed desktop rail once signed in. */
function Shell({ children }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className={`min-h-screen ${isAuthenticated ? 'lg:pl-[248px]' : ''}`}>{children}</div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Navbar />
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
            <Route path="/lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute><Coach /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          </Routes>
        </Shell>
      </HashRouter>
    </AuthProvider>
  );
}
