import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar'; // Assuming path is correct
import Spinner from './components/common/Spinner'; // Assuming path is correct
import ProtectedRoute from './components/common/ProtectedRoute'; // Assuming path is correct
import { useAuth } from './hooks/useAuth'; // Assuming path is correct

// Lazy load page components
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const SocietyPage = lazy(() => import('./pages/SocietyPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const { currentUser, loading } = useAuth();

  return (
    <Router>
      <Navbar />
      <Suspense 
        fallback={
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background-light dark:bg-background-dark">
            <Spinner size="lg" />
          </div>
        }
      >
        <main className="min-h-[calc(100vh-4rem)] bg-background-light dark:bg-background-dark"> {/* Adjust 4rem if Navbar height changes */}
          <Routes>
            <Route 
              path="/" 
              element={ 
                loading ? (
                  <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <Spinner size="lg" />
                  </div>
                ) : 
                currentUser ? <Navigate to="/society" replace /> : <Navigate to="/login" replace />
              } 
            />
            
            {/* Public Routes */}
            <Route path="/login" element={
              loading ? <Spinner size="lg" /> : 
              currentUser ? <Navigate to="/society" replace /> : <LoginPage />
            } />
            <Route path="/signup" element={
              loading ? <Spinner size="lg" /> : 
              currentUser ? <Navigate to="/society" replace /> : <SignupPage />
            } />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/society" element={<SocietyPage />} />
              <Route path="/profile" element={<ProfilePage />} />
          
            </Route>
            
            {/* Fallback for unknown routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </Suspense>
    </Router>
  );
}

export default App;