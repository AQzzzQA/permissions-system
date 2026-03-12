import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workspaces from './pages/Workspaces';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Permissions from './pages/Permissions';
import Skills from './pages/Skills';
import TestPage from './test-page';
import ErrorBoundary from './ErrorBoundary';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  console.log('🔒 ProtectedRoute - isAuthenticated:', isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  useEffect(() => {
    console.log('🚀 App mounted');
    console.log('📍 Current URL:', window.location.href);
    console.log('🔑 Token exists:', !!localStorage.getItem('token'));
  }, []);

  return (
    <ErrorBoundary>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter basename="/admin">
          <AuthProvider>
            <Routes>
              <Route path="/test" element={<TestPage />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="workspaces" element={<Workspaces />} />
                <Route path="users" element={<Users />} />
                <Route path="roles" element={<Roles />} />
                <Route path="permissions" element={<Permissions />} />
                <Route path="skills" element={<Skills />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
