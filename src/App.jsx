import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import MapSearch from './pages/MapSearch';
import BuildingSelect from './pages/BuildingSelect';
import FloorPlan from './pages/FloorPlan';
import VirtualTour from './pages/VirtualTour';
import BookingCheckout from './pages/BookingCheckout';
import MyRoom from './pages/MyRoom';
import LandlordDashboard from './pages/LandlordDashboard';
import MeterScanner from './pages/MeterScanner';
import RoomManager from './pages/RoomManager';
import AdminDashboard from './pages/AdminDashboard';
import BottomNav from './components/BottomNav';
import { useStore } from './hooks/useStore';

function AppContent() {
  const location = useLocation();
  const store = useStore();
  const session = store.getSession();

  const hideNav = ['/', '/login', '/tour', '/booking', '/meter-scanner'].some(p =>
    location.pathname === p || location.pathname.startsWith('/tour/') || location.pathname.startsWith('/booking/')
  );
  
  const isLandlord = session?.role === 'landlord';
  const isAdmin = session?.role === 'admin' || location.pathname.startsWith('/admin');

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/search" element={<MapSearch />} />
        <Route path="/building/:id" element={<BuildingSelect />} />
        <Route path="/floor/:buildingId/:floor" element={<FloorPlan />} />
        <Route path="/tour/:buildingId/:roomId" element={<VirtualTour />} />
        <Route path="/booking/:buildingId/:roomId" element={<BookingCheckout />} />
        <Route path="/my-room" element={<MyRoom />} />
        <Route path="/landlord" element={<LandlordDashboard />} />
        <Route path="/meter-scanner" element={<MeterScanner />} />
        <Route path="/room-manager" element={<RoomManager />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      {!hideNav && !isAdmin && (
        <BottomNav isLandlord={isLandlord} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
