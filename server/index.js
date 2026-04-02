import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { initDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize DB
initDB();

// Serve static frontend in production
app.use(express.static(path.join(__dirname, '../dist')));

// ─── API Endpoints ───

// GET all buildings
app.get('/api/buildings', (req, res) => {
  const buildings = db.prepare('SELECT * FROM buildings').all().map(b => ({
    ...b,
    priceRange: JSON.parse(b.priceRange),
    amenities: JSON.parse(b.amenities),
    rules: JSON.parse(b.rules),
    owner: { name: b.owner_name, phone: b.owner_phone }
  }));
  res.json(buildings);
});

// GET rooms for a building (with tenant info)
app.get('/api/rooms/:buildingId', (req, res) => {
  const rooms = db.prepare(`
    SELECT r.*, t.name as tenantName, t.phone as tenantPhone, t.university as tenantUni
    FROM rooms r
    LEFT JOIN tenants t ON r.tenantId = t.id
    WHERE r.buildingId = ?
  `).all(req.params.buildingId);
  res.json(rooms.map(r => ({
    ...r,
    sunSide: !!r.sunSide,
    nearLift: !!r.nearLift,
    tenant: r.tenantId ? { name: r.tenantName, phone: r.tenantPhone, university: r.tenantUni } : null
  })));
});

// POST lock a room
app.post('/api/rooms/lock/:roomId', (req, res) => {
  const result = db.prepare('UPDATE rooms SET status = "locked" WHERE id = ? AND status = "available"').run(req.params.roomId);
  if (result.changes > 0) {
    // Automatically unlock after 15 mins (for real, but for demo we can mock or just keep it locked)
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Room already locked or occupied' });
  }
});

// POST confirm booking
app.post('/api/bookings/confirm', (req, res) => {
  const { roomId, tenantData } = req.body;
  
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  
  const tenantId = `t-${Date.now()}`;
  db.prepare(`
    INSERT INTO tenants (id, name, phone, university, contractStart, contractEnd, depositAmount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    tenantId, tenantData.name, tenantData.phone, tenantData.university,
    new Date().toISOString().slice(0, 10),
    new Date(Date.now() + 365*86400000).toISOString().slice(0, 10),
    room.price * 2
  );

  db.prepare('UPDATE rooms SET status = "occupied", tenantId = ? WHERE id = ?').run(tenantId, roomId);
  
  const bookingId = `b-${Date.now()}`;
  db.prepare(`
    INSERT INTO bookings (id, roomId, buildingId, tenantId, totalPaid, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(bookingId, roomId, room.buildingId, tenantId, room.price * 3, Date.now());

  db.prepare(`
    INSERT INTO notifications (id, type, message, timestamp)
    VALUES (?, "new_tenant", ?, ?)
  `).run(`notif-${Date.now()}`, `ห้อง ${room.number} มีผู้เช่าใหม่: ${tenantData.name}`, Date.now());

  res.json({ success: true, bookingId });
});

// GET bills for a room
app.get('/api/bills/room/:roomId', (req, res) => {
  const bills = db.prepare('SELECT * FROM bills WHERE roomId = ? ORDER BY createdAt DESC').all(req.params.roomId);
  res.json(bills);
});

// GET stats for a building (Landlord)
app.get('/api/stats/landlord/:buildingId', (req, res) => {
  const rooms = db.prepare('SELECT status, price FROM rooms WHERE buildingId = ?').all(req.params.buildingId);
  const paidBills = db.prepare('SELECT total FROM bills WHERE buildingId = ? AND status = "paid"').all(req.params.buildingId);
  const pendingRepairs = db.prepare('SELECT COUNT(*) as count FROM repairs WHERE buildingId = ? AND status = "pending"').get(req.params.buildingId).count;

  res.json({
    totalRooms: rooms.length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    available: rooms.filter(r => r.status === 'available').length,
    locked: rooms.filter(r => r.status === 'locked').length,
    totalIncome: paidBills.reduce((sum, b) => sum + b.total, 0),
    pendingBills: 2, // Mocked for demo
    pendingAmount: 8500, // Mocked for demo
    repairQueue: pendingRepairs
  });
});

// GET notifications
app.get('/api/notifications', (req, res) => {
  const notifications = db.prepare('SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 20').all();
  res.json(notifications);
});

// Submit repair
app.post('/api/repairs/submit', (req, res) => {
  const { roomId, type, description, tenantName } = req.body;
  const room = db.prepare('SELECT buildingId FROM rooms WHERE id = ?').get(roomId);
  if (!room) return res.status(404).json({ message: 'Room not found' });

  db.prepare(`
    INSERT INTO repairs (id, roomId, buildingId, tenantName, type, description, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(`rep-${Date.now()}`, roomId, room.buildingId, tenantName, type, description, Date.now());
  
  res.json({ success: true });
});

// POST move out
app.post('/api/rooms/move-out/:roomId', (req, res) => {
  const room = db.prepare('SELECT number, tenantId FROM rooms WHERE id = ?').get(req.params.roomId);
  if (!room) return res.status(404).json({ success: false });

  db.prepare('UPDATE rooms SET status = "available", tenantId = NULL WHERE id = ?').run(req.params.roomId);
  if (room.tenantId) db.prepare('DELETE FROM tenants WHERE id = ?').run(room.tenantId);
  
  db.prepare(`
    INSERT INTO notifications (id, type, message, timestamp)
    VALUES (?, "move_out", ?, ?)
  `).run(`notif-${Date.now()}`, `ห้อง ${room.number}: ผู้เช่าย้ายออกแล้ว`, Date.now());

  res.json({ success: true });
});

// POST send bill
app.post('/api/bills/send', (req, res) => {
  const { roomId, rent, electricAmount, waterAmount, total, month, dueDate, electricReading, waterReading } = req.body;
  const room = db.prepare('SELECT buildingId, tenantId, number FROM rooms WHERE id = ?').get(roomId);
  
  const billId = `bill-${Date.now()}`;
  db.prepare(`
    INSERT INTO bills (id, roomId, buildingId, tenantId, month, rent, electricAmount, waterAmount, total, status, dueDate, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?, ?)
  `).run(billId, roomId, room.buildingId, room.tenantId, month, rent, electricAmount, waterAmount, total, dueDate, Date.now());

  // Update room's previous meter readings
  if (electricReading) {
    db.prepare('UPDATE rooms SET meterElectricPrev = ? WHERE id = ?').run(electricReading, roomId);
  }
  if (waterReading) {
    db.prepare('UPDATE rooms SET meterWaterPrev = ? WHERE id = ?').run(waterReading, roomId);
  }

  db.prepare(`
    INSERT INTO notifications (id, type, message, timestamp)
    VALUES (?, "bill_sent", ?, ?)
  `).run(`notif-${Date.now()}`, `ส่งบิลห้อง ${room.number} ยอด ฿${total} แล้ว`, Date.now());

  res.json({ success: true, billId });
});

// POST pay bill
app.post('/api/bills/pay/:billId', (req, res) => {
  db.prepare('UPDATE bills SET status = "paid" WHERE id = ?').run(req.params.billId);
  res.json({ success: true });
});

// GET Admin Stats
app.get('/api/stats/admin', (req, res) => {
  const buildings = db.prepare('SELECT COUNT(*) as count FROM buildings').get().count;
  const rooms = db.prepare('SELECT status, price FROM rooms').all();
  const tenants = db.prepare('SELECT COUNT(*) as count FROM tenants').get().count;
  const paidBills = db.prepare('SELECT total FROM bills WHERE status = "paid"').all();

  res.json({
    totalProperties: buildings,
    totalRooms: rooms.length,
    totalTenants: tenants,
    monthlyRevenue: paidBills.reduce((sum, b) => sum + b.total, 0),
    commission: Math.round(paidBills.reduce((sum, b) => sum + b.total, 0) * 0.03),
    pendingKYC: 3,
    activeDisputes: 2
  });
});

// ─── Auth API ───

// Google Login Simulation
app.post('/api/auth/google', (req, res) => {
  const { credential } = req.body;
  // In real app, verify credential with Google lib
  const user = {
    id: `u-g-${Date.now()}`,
    email: 'user@gmail.com',
    name: 'Google User',
    avatar: 'https://lh3.googleusercontent.com/a/default-user',
    role: 'guest'
  };
  res.json({ success: true, user });
});

// Phone OTP Simulation
const otpCache = new Map();

app.post('/api/auth/otp/send', (req, res) => {
  const { phone } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpCache.set(phone, code);
  console.log(`[SMS] Sending OTP ${code} to ${phone}`);
  res.json({ success: true, message: 'OTP Sent' });
});

app.post('/api/auth/otp/verify', (req, res) => {
  const { phone, code } = req.body;
  if (otpCache.get(phone) === code) {
    const user = {
      id: `u-p-${Date.now()}`,
      phone,
      name: `User ${phone.slice(-4)}`,
      role: 'guest'
    };
    res.json({ success: true, user });
  } else {
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

import fs from 'fs';

// Fallback for React Router
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(503).send('Frontend not built. Please run "npm run build" first.');
  }
});

app.listen(port, () => {
  console.log(`LIV Backend running at http://localhost:${port}`);
});
