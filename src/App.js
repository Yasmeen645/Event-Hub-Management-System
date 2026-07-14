import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import BookEvent from './pages/BookEvent';
import MyTickets from './pages/MyTickets';
import MyEvents from './pages/MyEvents';
import CreateEvent from './pages/CreateEvent';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';
import Notifications from './pages/Notifications';
// Protected Route wrapper
function Protected({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/events" />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />

        <Route path="/events/:id/book" element={
          <Protected><BookEvent /></Protected>
        } />

        <Route path="/my-tickets" element={
          <Protected><MyTickets /></Protected>
        } />

        <Route path="/my-events" element={
          <Protected roles={['ORGANIZER', 'ADMIN']}><MyEvents /></Protected>
        } />
          <Route path="/notifications" element={<Notifications />} />
        <Route path="/create-event" element={
          <Protected roles={['ORGANIZER', 'ADMIN']}><CreateEvent /></Protected>
        } />

        <Route path="/admin" element={
          <Protected roles={['ADMIN']}><AdminDashboard /></Protected>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
