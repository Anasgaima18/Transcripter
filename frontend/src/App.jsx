import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Record from './pages/Record-Sarvam'; // Transcripter recording page (Sarvam-powered)
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import PrivateRoute from './components/PrivateRoute';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/record" 
          element={
            <PrivateRoute>
              <Record />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ThemeToggle />
    </AuthProvider>
  );
}

export default App;
