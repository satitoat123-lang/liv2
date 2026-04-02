import Database from 'better-sqlite3';

const db = new Database('liv.db');

export function initDB() {
  // Create Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS buildings (
      id TEXT PRIMARY KEY,
      name TEXT,
      nameEn TEXT,
      address TEXT,
      lat REAL,
      lng REAL,
      nearUniversity TEXT,
      floors INTEGER,
      roomsPerFloor INTEGER,
      priceRange TEXT,
      rating REAL,
      reviews INTEGER,
      amenities TEXT,
      rules TEXT,
      owner_name TEXT,
      owner_phone TEXT,
      electricRate INTEGER,
      waterRate INTEGER
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      buildingId TEXT,
      number INTEGER,
      floor INTEGER,
      position INTEGER,
      type TEXT,
      price INTEGER,
      status TEXT,
      sunSide INTEGER,
      nearLift INTEGER,
      tenantId TEXT,
      meterElectricPrev INTEGER DEFAULT 1000,
      meterWaterPrev INTEGER DEFAULT 100,
      FOREIGN KEY (buildingId) REFERENCES buildings(id)
    );

    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      university TEXT,
      contractStart TEXT,
      contractEnd TEXT,
      depositAmount INTEGER
    );

    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      roomId TEXT,
      buildingId TEXT,
      tenantId TEXT,
      month TEXT,
      rent INTEGER,
      electricAmount INTEGER,
      waterAmount INTEGER,
      total INTEGER,
      status TEXT,
      dueDate TEXT,
      createdAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS repairs (
      id TEXT PRIMARY KEY,
      roomId TEXT,
      buildingId TEXT,
      tenantName TEXT,
      type TEXT,
      description TEXT,
      status TEXT,
      createdAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT,
      message TEXT,
      timestamp INTEGER,
      read INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      name TEXT,
      role TEXT DEFAULT 'guest',
      avatar TEXT
    );
  `);

  seedDB();
}

const REAL_BUILDINGS = [
  {
    id: 'b1', name: 'กอล์ฟ วิว (Golf View)', nameEn: 'Golf View',
    address: 'ซอยรังสิตภิรมย์ ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี',
    lat: 14.0380, lng: 100.6130, nearUniversity: 'ม.กรุงเทพ (รังสิต)',
    floors: 8, roomsPerFloor: 12, priceRange: [4500, 6500], rating: 4.6, reviews: 1420,
    amenities: ['📶 WiFi', '🔒 Keycard', '📷 CCTV', '🅿️ Parking', '🧺 Laundry', '🏪 7-Eleven'],
    rules: ['🐾 เลี้ยงสัตว์ไม่ได้', '⏰ เข้า-ออก 24 ชม.'],
    owner_name: 'คุณวิชัย', owner_phone: '081-444-5555',
    electricRate: 8, waterRate: 18,
  },
  {
    id: 'b2', name: 'สกายวิว (Sky View)', nameEn: 'Sky View',
    address: 'ซอยรังสิตภิรมย์ อ.คลองหลวง จ.ปทุมธานี',
    lat: 14.0400, lng: 100.6150, nearUniversity: 'ม.กรุงเทพ (รังสิต)',
    floors: 12, roomsPerFloor: 10, priceRange: [5000, 7500], rating: 4.8, reviews: 856,
    amenities: ['🏊 สระว่ายน้ำ', '💪 ฟิตเนส', '📶 WiFi', '🔒 คีย์การ์ด', '🅿️ ที่จอดรถ'],
    rules: ['🐾 เลี้ยงแมวได้', '🚭 ห้ามสูบบุหรี่'],
    owner_name: 'คุณพรทิพย์', owner_phone: '089-111-2222',
    electricRate: 7, waterRate: 17,
  },
  {
    id: 'b3', name: 'พลัม คอนโด (Plum Condo)', nameEn: 'Plum Condo',
    address: 'ถ.พหลโยธิน ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี',
    lat: 14.0310, lng: 100.6180, nearUniversity: 'ม.กรุงเทพ (รังสิต)',
    floors: 8, roomsPerFloor: 20, priceRange: [7500, 12000], rating: 4.7, reviews: 310,
    amenities: ['🏊 สระว่ายน้ำ', '💪 ฟิตเนส', '🎮 ห้องเกม', '📶 WiFi'],
    rules: ['🚫 ห้ามเลี้ยงสัตว์', '🚭 ห้ามสูบบุหรี่'],
    owner_name: 'พฤกษา เรียลเอสเตท', owner_phone: '1739',
    electricRate: 5, waterRate: 18,
  }
];

function seedDB() {
  const buildingCount = db.prepare('SELECT COUNT(*) as count FROM buildings').get().count;
  if (buildingCount > 0) return;

  console.log('Seeding Real-ish Rangsit Data...');

  const insertBuilding = db.prepare(`
    INSERT INTO buildings (id, name, nameEn, address, lat, lng, nearUniversity, floors, roomsPerFloor, priceRange, rating, reviews, amenities, rules, owner_name, owner_phone, electricRate, waterRate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRoom = db.prepare(`
    INSERT INTO rooms (id, buildingId, number, floor, position, type, price, status, sunSide, nearLift)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  REAL_BUILDINGS.forEach(b => {
    insertBuilding.run(
      b.id, b.name, b.nameEn, b.address, b.lat, b.lng, b.nearUniversity,
      b.floors, b.roomsPerFloor, JSON.stringify(b.priceRange),
      b.rating, b.reviews, JSON.stringify(b.amenities), JSON.stringify(b.rules),
      b.owner_name, b.owner_phone, b.electricRate, b.waterRate
    );

    for (let f = 1; f <= b.floors; f++) {
      for (let r = 1; r <= b.roomsPerFloor; r++) {
        const roomNum = f * 100 + r;
        const status = Math.random() > 0.3 ? 'occupied' : 'available';
        insertRoom.run(
          `${b.id}-${roomNum}`, b.id, roomNum, f, r,
          f > 4 ? 'deluxe' : 'standard',
          b.priceRange[0] + (f > 4 ? 1000 : 0),
          status,
          r > b.roomsPerFloor / 2 ? 1 : 0,
          (r === 1 || r === b.roomsPerFloor) ? 1 : 0
        );
      }
    }
  });

  console.log('Seeding Complete.');
}

export default db;
