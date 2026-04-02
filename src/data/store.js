/**
 * LIV Central Data Store
 * Connected to Node.js Backend API
 */

const API_URL = '/api';

// ─── Initial State ───
let _buildings = [];
let _rooms = {};
let _tenants = {};
let _repairs = [];
let _notifications = [];
let _landlordStats = {};
let _adminStats = {};
let _listeners = [];
let _session = JSON.parse(localStorage.getItem('liv_session')) || null;
let _lastBuildingId = localStorage.getItem('liv_last_building') || 'b1';

// ─── Sync with Backend ───
async function sync() {
  try {
    const bRes = await fetch(`${API_URL}/buildings`);
    _buildings = await bRes.json();

    const rRes = await fetch(`${API_URL}/rooms/${_lastBuildingId}`);
    const rooms = await rRes.json();
    rooms.forEach(r => {
      _rooms[r.id] = r;
      if (r.tenant) _tenants[r.tenantId] = r.tenant;
    });

    const nRes = await fetch(`${API_URL}/notifications`);
    _notifications = await nRes.json();

    const lsRes = await fetch(`${API_URL}/stats/landlord/${_lastBuildingId}`);
    _landlordStats = await lsRes.json();

    const asRes = await fetch(`${API_URL}/stats/admin`);
    _adminStats = await asRes.json();

    notify();
  } catch (e) { console.error('Failed sync', e); }
}
sync();

function notify() { _listeners.forEach(fn => fn()); }

// ─── Public API ───
export const Store = {
  subscribe(fn) {
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  },

  async sync() { await sync(); },
  getBuildings() { return _buildings; },
  getBuilding(id) { return _buildings.find(b => b.id === id); },
  getRooms(buildingId) { return Object.values(_rooms).filter(r => r.buildingId === buildingId); },
  getRoomsByFloor(buildingId, floor) { return Object.values(_rooms).filter(r => r.buildingId === buildingId && r.floor === floor); },
  getRoom(roomId) { return _rooms[roomId]; },
  getAvailableCount(buildingId) { return Object.values(_rooms).filter(r => r.buildingId === buildingId && r.status === 'available').length; },
  
  getFloorSummary(buildingId) {
    const building = _buildings.find(b => b.id === buildingId);
    if (!building) return [];
    const summary = [];
    for (let f = 1; f <= building.floors; f++) {
      const floorRooms = Object.values(_rooms).filter(r => r.buildingId === buildingId && r.floor === f);
      summary.push({
        floor: f, total: floorRooms.length,
        available: floorRooms.filter(r => r.status === 'available').length,
        occupied: floorRooms.filter(r => r.status === 'occupied').length,
        locked: floorRooms.filter(r => r.status === 'locked').length,
      });
    }
    return summary;
  },

  async lockRoom(roomId) {
    const res = await fetch(`${API_URL}/rooms/lock/${roomId}`, { method: 'POST' });
    const data = await res.json();
    if (data.success) { sync(); return true; }
    return false;
  },

  async confirmBooking(roomId, tenantData) {
    const res = await fetch(`${API_URL}/bookings/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, tenantData })
    });
    const data = await res.json();
    if (data.success) { await sync(); return { id: data.bookingId }; }
    return null;
  },

  async moveOut(roomId) {
    const res = await fetch(`${API_URL}/rooms/move-out/${roomId}`, { method: 'POST' });
    const data = await res.json();
    if (data.success) { await sync(); return true; }
    return false;
  },

  getLandlordStats(buildingId) { return _landlordStats; },
  getAdminStats() { return _adminStats; },
  getNotifications() { return _notifications; },

  getMapData() {
    return _buildings.map(b => ({
      ...b,
      available: Object.values(_rooms).filter(r => r.buildingId === b.id && r.status === 'available').length,
      totalRooms: b.floors * b.roomsPerFloor,
      startingPrice: b.priceRange[0],
    }));
  },

  getCurrentTenantRoom() {
    return Object.values(_rooms).find(r => r.status === 'occupied' && r.buildingId === 'b1');
  },

  getBillsForRoom(roomId) { return []; }, 

  async submitRepair(roomId, type, description) {
    const room = _rooms[roomId];
    await fetch(`${API_URL}/repairs/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, type, description, tenantName: room?.tenant?.name || 'Guest' })
    });
    await sync();
    return true;
  },

  async scanMeter(roomId, type, reading) {
    const room = _rooms[roomId];
    if (!room) return null;
    const building = _buildings.find(b => b.id === room.buildingId);
    const rate = type === 'electric' ? building.electricRate : building.waterRate;
    const prev = type === 'electric' ? room.meterElectricPrev : room.meterWaterPrev;
    const usage = reading - prev;
    const amount = usage * rate;
    return { reading, previous: prev, usage, rate, amount, unit: 'หน่วย' };
  },

  async sendBill(roomId, billData) {
    await fetch(`${API_URL}/bills/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, ...billData })
    });
    await sync();
    return true;
  },

  // Session
  async login(role) {
    _session = { role };
    localStorage.setItem('liv_session', JSON.stringify(_session));
    notify();
  },

  async loginWithGoogle() {
    try {
      const res = await fetch(`${API_URL}/auth/google`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        _session = { ...data.user, role: 'tenant' };
        localStorage.setItem('liv_session', JSON.stringify(_session));
        notify();
        return true;
      }
    } catch (e) { console.error('Google login failed', e); }
    return false;
  },

  async sendOtp(phone) {
    try {
      const res = await fetch(`${API_URL}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      return (await res.json()).success;
    } catch (e) { console.error('OTP send failed', e); }
    return false;
  },

  async verifyOtp(phone, code) {
    try {
      const res = await fetch(`${API_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      });
      const data = await res.json();
      if (data.success) {
        _session = { ...data.user, role: 'tenant' };
        localStorage.setItem('liv_session', JSON.stringify(_session));
        notify();
        return true;
      }
    } catch (e) { console.error('OTP verify failed', e); }
    return false;
  },

  logout() {
    _session = null;
    localStorage.removeItem('liv_session');
    notify();
  },
  getSession() { return _session; },

  // Tracking
  setLastBuildingId(id) {
    _lastBuildingId = id;
    localStorage.setItem('liv_last_building', id);
    sync(); // Refresh rooms for new building
  },
  getLastBuildingId() { return _lastBuildingId; },

  reset() {
    localStorage.clear();
    window.location.reload();
  },
};

export default Store;
