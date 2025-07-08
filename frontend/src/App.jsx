import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import HomePage from './components/Home';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import LoadingSpinner from './components/LoadingSpinner';
import ShareDownloadPage from './components/Share';
import FilesManager from './components/FilesManager';
import Profile from './components/Profile';
import AdminPage from './components/Admin';
import UserFilesPage from './components/UserFiles';
import './App.css';


function App() {
  const dispatch = useDispatch();
  const { user, isAdmin, status } = useSelector(state => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const initializeAuth = async () => {
      if (localStorage.getItem('access_token')) {
        dispatch(fetchCurrentUser());
      }
      setIsInitialized(true);
    };
    
    initializeAuth();
  }, [dispatch]);

  if (!isInitialized || status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Navbar user={user} isAdmin={isAdmin} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/files" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/files" replace /> : <RegisterPage />} 
        />
        <Route 
          path="/files" 
          element={user ? <FilesManager /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile" 
          element={user ? <Profile /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/admin/*" 
          element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/user-files/:userId" 
          element={isAdmin ? <UserFilesPage /> : <Navigate to="/" replace />} 
        />
        <Route path="/share/:shareLink" element={<ShareDownloadPage />} />
      </Routes>
    </>
  );
};

export default App;