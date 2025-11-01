import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import ClinicianDashboard from './pages/ClinicianDashboard';
import PatientDashboard from './pages/PatientDashboard';
import UploadSession from './pages/UploadSession';
import ViewSession from './pages/ViewSession';
import { auth } from './auth';

function PrivateRoute({ children, allowedRoles = [] }) {
  const isAuthenticated = auth.isAuthenticated();
  const user = auth.getUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
              path="/clinician" 
              element={
                <PrivateRoute allowedRoles={['clinician']}>
                  <ClinicianDashboard />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/patient" 
              element={
                <PrivateRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/upload" 
              element={
                <PrivateRoute allowedRoles={['patient']}>
                  <UploadSession />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/session/:id" 
              element={
                <PrivateRoute>
                  <ViewSession />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/" 
              element={
                auth.isAuthenticated() ? (
                  auth.isClinicianRole() ? (
                    <Navigate to="/clinician" replace />
                  ) : (
                    <Navigate to="/patient" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;