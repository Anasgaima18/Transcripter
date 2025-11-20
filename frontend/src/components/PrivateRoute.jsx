import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-100 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin" />
        <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 tracking-tight">
          Loading...
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
