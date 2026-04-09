import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';
import MainLayout from './components/layout/MainLayout';
import LauncherPage from './pages/LauncherPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <>
              <SignedIn><LauncherPage /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          } 
        />
        <Route 
          path="/studio" 
          element={
            <>
              <SignedIn><MainLayout /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          } 
        />

        {/* Auth Routes */}
        <Route path="/login/*" element={<div className="flex items-center justify-center min-h-screen bg-black"><SignIn routing="path" path="/login" /></div>} />
        <Route path="/signup/*" element={<div className="flex items-center justify-center min-h-screen bg-black"><SignUp routing="path" path="/signup" /></div>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
