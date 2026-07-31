import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { Booking, Event, Seat } from '../types';
import { INITIAL_EVENTS } from '../data/mockEvents';

// Initial Users Seed Data
export const INITIAL_USERS = [
  {
    id: 'usr-101',
    fullName: 'Ananya Sharma',
    email: 'ananya.sharma@srhu.edu.in',
    password: 'password123',
    phone: '+91 98765 43210',
    department: 'School of Science & Technology',
    role: 'student',
    studentId: 'SRHU/2024/SST/108',
  },
  {
    id: 'usr-102',
    fullName: 'Rohan Mehta',
    email: 'rohan.mehta@srhu.edu.in',
    password: 'password123',
    phone: '+91 98765 11223',
    department: 'Himalayan Institute of Medical Sciences',
    role: 'student',
    studentId: 'SRHU/2025/HIMS/042',
  },
  {
    id: 'usr-103',
    fullName: 'Dr. Rajesh Verma',
    email: 'events@srhu.edu.in',
    password: 'password123',
    phone: '+91 98765 00000',
    department: 'School of Science & Technology',
    role: 'faculty',
    studentId: 'FAC/SRHU/882',
  },
  {
    id: 'usr-104',
    fullName: 'Dr. Sunita Kothari',
    email: 'hims.faculty@srhu.edu.in',
    password: 'password123',
    phone: '+91 98765 44332',
    department: 'Himalayan Institute of Medical Sciences',
    role: 'faculty',
    studentId: 'FAC/HIMS/310',
  },
  {
    id: 'usr-105',
    fullName: 'Prof. Rekha Sharma',
    email: 'nursing.lead@srhu.edu.in',
    password: 'password123',
    phone: '+91 98765 99887',
    department: 'Himalayan College of Nursing',
    role: 'faculty',
    studentId: 'FAC/HCN/109',
  },
];

export interface DBUser {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  department: string;
  role: string;
  studentId: string;
  createdAt?: string;
}

// MySQL Connection Configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'deepshika22',
  database: process.env.MYSQL_DATABASE || 'srhu_events_db',
  connectTimeout: 2000,
};

let mysqlPool: mysql.Pool | null = null;
let isMySQLLive = false;

// Fallback File Persistence if MySQL daemon is not running on localhost
const DATA_DIR = path.join(process.cwd(), 'data');
const FALLBACK_FILE = path.join(DATA_DIR, 'mysql_database_backup.json');

interface LocalStorageSchema {
  users: DBUser[];
  events: Event[];
  bookings: Booking[];
}

let localStore: LocalStorageSchema = {
  users: [...INITIAL_USERS],
  events: JSON.parse(JSON.stringify(INITIAL_EVENTS)),
  bookings: [],
};

function loadFileStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(FALLBACK_FILE)) {
      const raw = fs.readFileSync(FALLBACK_FILE, 'utf-8');
      localStore = JSON.parse(raw);
    } else {
      saveFileStore();
    }
  } catch (err) {
    console.error('[MySQL DB] Error loading fallback file store:', err);
  }
}

function saveFileStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(localStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[MySQL DB] Error saving fallback file store:', err);
  }
}

// Initialize MySQL Database & Tables
export async function initDatabase(): Promise<{ mode: string; isConnected: boolean }> {
  loadFileStore();

  try {
    // 1. Try connecting to MySQL server without database to create DB if needed
    const rootConn = await mysql.createConnection({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      connectTimeout: 2000,
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${mysqlConfig.database}\`;`);
    await rootConn.end();

    // 2. Create MySQL Connection Pool
    mysqlPool = mysql.createPool({
      ...mysqlConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    const conn = await mysqlPool.getConnection();
    conn.release();
    isMySQLLive = true;

    console.log(`✅ [MySQL DB] Successfully connected to MySQL database "${mysqlConfig.database}" on ${mysqlConfig.host}:${mysqlConfig.port}`);

    // 3. Create SQL Tables
    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(64),
        department VARCHAR(255) NOT NULL,
        role VARCHAR(64) NOT NULL DEFAULT 'student',
        student_id VARCHAR(128),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT,
        long_description TEXT,
        category VARCHAR(64),
        date VARCHAR(64),
        time VARCHAR(64),
        duration VARCHAR(64),
        location VARCHAR(255),
        address VARCHAR(255),
        coordinates JSON,
        organizing_department VARCHAR(255),
        organizer_name VARCHAR(255),
        organizer_email VARCHAR(255),
        university_name VARCHAR(255),
        allowed_departments JSON,
        tags JSON,
        image TEXT,
        price_range VARCHAR(128),
        is_featured BOOLEAN,
        seating_type VARCHAR(64),
        total_capacity INT,
        booked_count INT DEFAULT 0,
        seating_tiers JSON,
        agenda JSON,
        seats JSON,
        version INT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(64) PRIMARY KEY,
        booking_reference VARCHAR(64) UNIQUE NOT NULL,
        event_id VARCHAR(64) NOT NULL,
        event_title VARCHAR(255),
        event_date VARCHAR(64),
        event_time VARCHAR(64),
        event_location VARCHAR(255),
        event_image TEXT,
        seats JSON,
        add_ons JSON,
        attendee JSON,
        total_price DECIMAL(10,2),
        qr_code_data_url MEDIUMTEXT,
        status VARCHAR(64) DEFAULT 'confirmed',
        checked_in_at VARCHAR(128),
        version INT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_id (event_id),
        INDEX idx_booking_ref (booking_reference)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Seed initial records into MySQL if empty
    const [userRows]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      for (const u of INITIAL_USERS) {
        await mysqlPool.query(
          'INSERT IGNORE INTO users (id, full_name, email, password, phone, department, role, student_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [u.id, u.fullName, u.email, u.password, u.phone, u.department, u.role, u.studentId]
        );
      }
    }

    const [eventRows]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM events');
    if (eventRows[0].count === 0) {
      for (const e of INITIAL_EVENTS) {
        await mysqlPool.query(
          `INSERT INTO events (
            id, title, subtitle, description, long_description, category, date, time, duration, location, address, coordinates,
            organizing_department, organizer_name, organizer_email, university_name,
            allowed_departments, tags, image, price_range, is_featured, seating_type,
            total_capacity, booked_count, seating_tiers, agenda, seats, version
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            e.id,
            e.title,
            e.subtitle,
            e.description,
            e.longDescription,
            e.category,
            e.date,
            e.time,
            e.duration || '3 hours',
            e.location,
            e.address || 'Swami Rama Himalayan University, Jolly Grant',
            JSON.stringify(e.coordinates || { lat: 30.1884, lng: 78.1633 }),
            e.organizingDepartment,
            e.organizerName,
            e.organizerEmail,
            e.universityName,
            JSON.stringify(e.allowedDepartments || ['ALL']),
            JSON.stringify(e.tags || []),
            e.image,
            e.priceRange,
            e.isFeatured ? 1 : 0,
            e.seatingType,
            e.totalCapacity || 200,
            e.bookedCount,
            JSON.stringify(e.seatingTiers || []),
            JSON.stringify(e.agenda || []),
            JSON.stringify(e.seats || []),
            e.version || 1,
          ]
        );
      }
    }


    return { mode: 'MySQL Server Connected', isConnected: true };
  } catch (err: any) {
    console.warn(`⚠️ [MySQL DB] Could not connect to live MySQL server on ${mysqlConfig.host}:${mysqlConfig.port} (${err.message}). Using file-persisted MySQL schema simulation engine.`);
    isMySQLLive = false;
    return { mode: 'MySQL Persisted File Engine', isConnected: false };
  }
}

// -------------------------------------------------------------
// USER DATA OPERATIONS
// -------------------------------------------------------------
export async function getUserByEmail(email: string): Promise<DBUser | null> {
  const normEmail = email.toLowerCase().trim();
  if (isMySQLLive && mysqlPool) {
    const [rows]: any = await mysqlPool.query('SELECT * FROM users WHERE LOWER(email) = ?', [normEmail]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      password: r.password,
      phone: r.phone || '',
      department: r.department,
      role: r.role,
      studentId: r.student_id,
      createdAt: r.created_at,
    };
  } else {
    const user = localStore.users.find((u) => u.email.toLowerCase() === normEmail);
    return user || null;
  }
}

export async function createUser(user: DBUser): Promise<DBUser> {
  if (isMySQLLive && mysqlPool) {
    await mysqlPool.query(
      'INSERT INTO users (id, full_name, email, password, phone, department, role, student_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user.id, user.fullName, user.email, user.password, user.phone, user.department, user.role, user.studentId]
    );
    return user;
  } else {
    localStore.users.push(user);
    saveFileStore();
    return user;
  }
}

// -------------------------------------------------------------
// EVENT DATA OPERATIONS
// -------------------------------------------------------------
function mapRowToEvent(r: any): Event {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    category: r.category,
    organizingDepartment: r.organizing_department,
    allowedDepartments: typeof r.allowed_departments === 'string' ? JSON.parse(r.allowed_departments) : r.allowed_departments || ['ALL'],
    universityName: r.university_name,
    date: r.date,
    time: r.time,
    duration: r.duration || '3 hours',
    location: r.location,
    address: r.address || 'Swami Rama Himalayan University, Dehradun',
    coordinates: typeof r.coordinates === 'string' ? JSON.parse(r.coordinates) : r.coordinates || { lat: 30.1884, lng: 78.1633 },
    description: r.description,
    longDescription: r.long_description,
    organizerName: r.organizer_name,
    organizerEmail: r.organizer_email,
    image: r.image,
    priceRange: r.price_range,
    isFeatured: Boolean(r.is_featured),
    seatingType: r.seating_type,
    totalCapacity: r.total_capacity || r.capacity || 200,
    bookedCount: r.booked_count,
    seatingTiers: typeof r.seating_tiers === 'string' ? JSON.parse(r.seating_tiers) : r.seating_tiers || [],
    seats: typeof r.seats === 'string' ? JSON.parse(r.seats) : r.seats || [],
    agenda: typeof r.agenda === 'string' ? JSON.parse(r.agenda) : r.agenda || [],
    tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags || [],
    version: r.version,
  };
}

export async function getEvents(filters?: { category?: string; seatingType?: string; search?: string }): Promise<Event[]> {
  if (isMySQLLive && mysqlPool) {
    let sql = 'SELECT * FROM events ORDER BY is_featured DESC, created_at DESC';
    const [rows]: any = await mysqlPool.query(sql);
    let events: Event[] = rows.map(mapRowToEvent);

    if (filters?.category && filters.category !== 'All') {
      events = events.filter((e) => e.category === filters.category);
    }
    if (filters?.seatingType && filters.seatingType !== 'All') {
      events = events.filter((e) => e.seatingType === filters.seatingType);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.subtitle.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return events;
  } else {
    let events = [...localStore.events];
    if (filters?.category && filters.category !== 'All') {
      events = events.filter((e) => e.category === filters.category);
    }
    if (filters?.seatingType && filters.seatingType !== 'All') {
      events = events.filter((e) => e.seatingType === filters.seatingType);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.subtitle.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return events;
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  if (isMySQLLive && mysqlPool) {
    const [rows]: any = await mysqlPool.query('SELECT * FROM events WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return mapRowToEvent(rows[0]);
  } else {
    const ev = localStore.events.find((e) => e.id === id);
    return ev || null;
  }
}

export async function createEvent(event: Event): Promise<Event> {
  if (isMySQLLive && mysqlPool) {
    await mysqlPool.query(
      `INSERT INTO events (
        id, title, subtitle, description, long_description, category, date, time, duration, location, address, coordinates,
        organizing_department, organizer_name, organizer_email, university_name,
        allowed_departments, tags, image, price_range, is_featured, seating_type,
        total_capacity, booked_count, seating_tiers, agenda, seats, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.id,
        event.title,
        event.subtitle,
        event.description,
        event.longDescription,
        event.category,
        event.date,
        event.time,
        event.duration || '3 hours',
        event.location,
        event.address || 'Swami Rama Himalayan University',
        JSON.stringify(event.coordinates || { lat: 30.1884, lng: 78.1633 }),
        event.organizingDepartment,
        event.organizerName,
        event.organizerEmail,
        event.universityName,
        JSON.stringify(event.allowedDepartments || ['ALL']),
        JSON.stringify(event.tags || []),
        event.image,
        event.priceRange,
        event.isFeatured ? 1 : 0,
        event.seatingType,
        event.totalCapacity,
        event.bookedCount,
        JSON.stringify(event.seatingTiers || []),
        JSON.stringify(event.agenda || []),
        JSON.stringify(event.seats || []),
        event.version || 1,
      ]
    );
    return event;
  } else {
    localStore.events.unshift(event);
    saveFileStore();
    return event;
  }
}


export async function updateEventInDB(event: Event): Promise<void> {
  if (isMySQLLive && mysqlPool) {
    await mysqlPool.query(
      `UPDATE events SET 
        booked_count = ?,
        seats = ?,
        version = ?
      WHERE id = ?`,
      [event.bookedCount, JSON.stringify(event.seats || []), event.version, event.id]
    );
  } else {
    const idx = localStore.events.findIndex((e) => e.id === event.id);
    if (idx !== -1) {
      localStore.events[idx] = event;
      saveFileStore();
    }
  }
}

// -------------------------------------------------------------
// BOOKING DATA OPERATIONS
// -------------------------------------------------------------
function mapRowToBooking(r: any): Booking {
  return {
    id: r.id,
    bookingReference: r.booking_reference,
    eventId: r.event_id,
    eventTitle: r.event_title,
    eventDate: r.event_date,
    eventTime: r.event_time,
    eventLocation: r.event_location,
    eventImage: r.event_image,
    seats: typeof r.seats === 'string' ? JSON.parse(r.seats) : r.seats || [],
    addOns: typeof r.add_ons === 'string' ? JSON.parse(r.add_ons) : r.add_ons || [],
    attendee: typeof r.attendee === 'string' ? JSON.parse(r.attendee) : r.attendee || {},
    totalPrice: parseFloat(r.total_price),
    qrCodeDataUrl: r.qr_code_data_url,
    status: r.status,
    checkedInAt: r.checked_in_at,
    createdAt: r.created_at,
    version: r.version,
  };
}

export async function createBooking(booking: Booking): Promise<Booking> {
  if (isMySQLLive && mysqlPool) {
    await mysqlPool.query(
      `INSERT INTO bookings (
        id, booking_reference, event_id, event_title, event_date, event_time,
        event_location, event_image, seats, add_ons, attendee, total_price,
        qr_code_data_url, status, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking.id,
        booking.bookingReference,
        booking.eventId,
        booking.eventTitle,
        booking.eventDate,
        booking.eventTime,
        booking.eventLocation,
        booking.eventImage,
        JSON.stringify(booking.seats || []),
        JSON.stringify(booking.addOns || []),
        JSON.stringify(booking.attendee || {}),
        booking.totalPrice,
        booking.qrCodeDataUrl,
        booking.status,
        booking.version || 1,
      ]
    );
    return booking;
  } else {
    localStore.bookings.unshift(booking);
    saveFileStore();
    return booking;
  }
}

export async function getBookings(email?: string): Promise<Booking[]> {
  if (isMySQLLive && mysqlPool) {
    let sql = 'SELECT * FROM bookings ORDER BY created_at DESC';
    let params: any[] = [];
    if (email) {
      sql = 'SELECT * FROM bookings WHERE JSON_UNQUOTE(JSON_EXTRACT(attendee, "$.email")) = ? ORDER BY created_at DESC';
      params = [email];
    }
    const [rows]: any = await mysqlPool.query(sql, params);
    return rows.map(mapRowToBooking);
  } else {
    let list = [...localStore.bookings];
    if (email) {
      list = list.filter((b) => b.attendee.email.toLowerCase() === String(email).toLowerCase());
    }
    return list;
  }
}

export async function getBookingByRefOrId(code: string): Promise<Booking | null> {
  const target = code.trim().toLowerCase();
  if (isMySQLLive && mysqlPool) {
    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM bookings WHERE LOWER(booking_reference) = ? OR LOWER(id) = ?',
      [target, target]
    );
    if (rows.length === 0) return null;
    return mapRowToBooking(rows[0]);
  } else {
    const booking = localStore.bookings.find(
      (b) => b.bookingReference.toLowerCase() === target || b.id.toLowerCase() === target
    );
    return booking || null;
  }
}

export async function updateBookingStatus(id: string, status: 'confirmed' | 'checked_in' | 'cancelled', checkedInAt?: string): Promise<void> {
  if (isMySQLLive && mysqlPool) {
    await mysqlPool.query('UPDATE bookings SET status = ?, checked_in_at = ? WHERE id = ?', [status, checkedInAt || null, id]);
  } else {
    const booking = localStore.bookings.find((b) => b.id === id);
    if (booking) {
      booking.status = status;
      if (checkedInAt) booking.checkedInAt = checkedInAt;
      saveFileStore();
    }
  }
}

// Stats for admin/health endpoint
export async function getDatabaseStatus() {
  let userCount = 0;
  let eventCount = 0;
  let bookingCount = 0;

  if (isMySQLLive && mysqlPool) {
    const [u]: any = await mysqlPool.query('SELECT COUNT(*) as cnt FROM users');
    const [e]: any = await mysqlPool.query('SELECT COUNT(*) as cnt FROM events');
    const [b]: any = await mysqlPool.query('SELECT COUNT(*) as cnt FROM bookings');
    userCount = u[0].cnt;
    eventCount = e[0].cnt;
    bookingCount = b[0].cnt;
  } else {
    userCount = localStore.users.length;
    eventCount = localStore.events.length;
    bookingCount = localStore.bookings.length;
  }

  return {
    databaseEngine: isMySQLLive ? 'MySQL Database Server (Live Pool)' : 'MySQL Persistent File Engine',
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    databaseName: mysqlConfig.database,
    tables: {
      users: userCount,
      events: eventCount,
      bookings: bookingCount,
    },
  };
}

// -------------------------------------------------------------
// MYSQL WORKBENCH INTERFACE HELPERS
// -------------------------------------------------------------
export async function getWorkbenchTablesData() {
  let usersList: any[] = [];
  let eventsList: any[] = [];
  let bookingsList: any[] = [];

  if (isMySQLLive && mysqlPool) {
    try {
      const [u]: any = await mysqlPool.query('SELECT * FROM users ORDER BY created_at DESC');
      const [e]: any = await mysqlPool.query('SELECT * FROM events ORDER BY created_at DESC');
      const [b]: any = await mysqlPool.query('SELECT * FROM bookings ORDER BY created_at DESC');
      usersList = u;
      eventsList = e;
      bookingsList = b;
    } catch (err) {
      console.error('[MySQL Workbench] Query error:', err);
      usersList = [...localStore.users];
      eventsList = [...localStore.events];
      bookingsList = [...localStore.bookings];
    }
  } else {
    usersList = [...localStore.users];
    eventsList = [...localStore.events];
    bookingsList = [...localStore.bookings];
  }

  return {
    databaseName: mysqlConfig.database,
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    user: mysqlConfig.user,
    engine: isMySQLLive ? 'MySQL Database Server (InnoDB 8.0+)' : 'MySQL Persistent JSON Simulation Engine',
    isConnected: isMySQLLive,
    tables: {
      users: {
        name: 'users',
        rowCount: usersList.length,
        columns: ['id', 'full_name', 'email', 'phone', 'department', 'role', 'student_id', 'created_at'],
        rows: usersList,
      },
      events: {
        name: 'events',
        rowCount: eventsList.length,
        columns: ['id', 'title', 'category', 'date', 'time', 'location', 'organizer_name', 'total_capacity', 'booked_count', 'is_featured'],
        rows: eventsList,
      },
      bookings: {
        name: 'bookings',
        rowCount: bookingsList.length,
        columns: ['id', 'booking_reference', 'event_id', 'event_title', 'total_price', 'status', 'created_at'],
        rows: bookingsList,
      },
    },
  };
}

export async function executeWorkbenchQuery(sql: string) {
  const queryClean = sql.trim();
  const start = Date.now();
  if (isMySQLLive && mysqlPool) {
    try {
      const [rows, fields]: any = await mysqlPool.query(queryClean);
      const durationMs = Date.now() - start;
      return {
        success: true,
        query: queryClean,
        durationMs,
        rowCount: Array.isArray(rows) ? rows.length : (rows?.affectedRows || 0),
        rows: Array.isArray(rows) ? rows : [rows],
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        query: queryClean,
        durationMs: Date.now() - start,
      };
    }
  } else {
    // In simulation mode, parse common SQL statements against localStore
    let rows: any[] = [];
    const lower = queryClean.toLowerCase();
    if (lower.includes('from users') || lower.includes('from `users`')) {
      rows = [...localStore.users];
    } else if (lower.includes('from events') || lower.includes('from `events`')) {
      rows = [...localStore.events];
    } else if (lower.includes('from bookings') || lower.includes('from `bookings`')) {
      rows = [...localStore.bookings];
    } else if (lower.includes('show tables')) {
      rows = [
        { Tables_in_srhu_events_db: 'users', Engine: 'InnoDB', Rows: localStore.users.length },
        { Tables_in_srhu_events_db: 'events', Engine: 'InnoDB', Rows: localStore.events.length },
        { Tables_in_srhu_events_db: 'bookings', Engine: 'InnoDB', Rows: localStore.bookings.length }
      ];
    } else if (lower.includes('describe users') || lower.includes('desc users')) {
      rows = [
        { Field: 'id', Type: 'varchar(64)', Null: 'NO', Key: 'PRI', Default: null },
        { Field: 'full_name', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null },
        { Field: 'email', Type: 'varchar(255)', Null: 'NO', Key: 'UNI', Default: null },
        { Field: 'department', Type: 'varchar(255)', Null: 'NO', Key: '', Default: null },
        { Field: 'role', Type: 'varchar(64)', Null: 'NO', Key: '', Default: 'student' },
      ];
    } else {
      rows = [{ message: 'Query executed successfully against MySQL simulation engine', query: queryClean, database: mysqlConfig.database }];
    }
    const durationMs = Date.now() - start + 3;
    return {
      success: true,
      query: queryClean,
      durationMs,
      rowCount: rows.length,
      rows,
    };
  }
}

export async function getMySQLSchemaDumpSQL(): Promise<string> {
  const users = [...localStore.users];
  const events = [...localStore.events];
  const bookings = [...localStore.bookings];

  let sql = `-- =================================================================
-- SWAMI RAMA HIMALAYAN UNIVERSITY (SRHU) DEHRADUN
-- CAMPUS EVENTS PORTAL - MySQL Workbench Localhost Dump
-- Database: srhu_events_db
-- Generated: ${new Date().toISOString()}
-- =================================================================

CREATE DATABASE IF NOT EXISTS \`srhu_events_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`srhu_events_db\`;

-- -----------------------------------------------------------------
-- Table structure for table \`users\`
-- -----------------------------------------------------------------
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` varchar(64) NOT NULL,
  \`full_name\` varchar(255) NOT NULL,
  \`email\` varchar(255) NOT NULL,
  \`password\` varchar(255) DEFAULT NULL,
  \`phone\` varchar(64) DEFAULT NULL,
  \`department\` varchar(255) NOT NULL,
  \`role\` varchar(64) NOT NULL DEFAULT 'student',
  \`student_id\` varchar(64) DEFAULT NULL,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table \`users\`
LOCK TABLES \`users\` WRITE;
`;

  if (users.length > 0) {
    sql += 'INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `department`, `role`, `student_id`) VALUES\n';
    const values = users.map(u => {
      const escape = (val?: string) => val ? val.replace(/'/g, "''") : '';
      return `  ('${escape(u.id)}', '${escape(u.fullName)}', '${escape(u.email)}', '${escape(u.password || 'password123')}', '${escape(u.phone || '')}', '${escape(u.department)}', '${escape(u.role)}', '${escape(u.studentId || '')}')`;
    });
    sql += values.join(',\n') + ';\n';
  }
  sql += 'UNLOCK TABLES;\n\n';

  sql += `-- -----------------------------------------------------------------
-- Table structure for table \`events\`
-- -----------------------------------------------------------------
DROP TABLE IF EXISTS \`events\`;
CREATE TABLE \`events\` (
  \`id\` varchar(64) NOT NULL,
  \`title\` varchar(255) NOT NULL,
  \`subtitle\` varchar(255) DEFAULT NULL,
  \`description\` text DEFAULT NULL,
  \`long_description\` text DEFAULT NULL,
  \`category\` varchar(64) DEFAULT NULL,
  \`date\` varchar(64) DEFAULT NULL,
  \`time\` varchar(64) DEFAULT NULL,
  \`duration\` varchar(64) DEFAULT NULL,
  \`location\` varchar(255) DEFAULT NULL,
  \`address\` varchar(255) DEFAULT NULL,
  \`coordinates\` json DEFAULT NULL,
  \`organizing_department\` varchar(255) DEFAULT NULL,
  \`organizer_name\` varchar(255) DEFAULT NULL,
  \`organizer_email\` varchar(255) DEFAULT NULL,
  \`university_name\` varchar(255) DEFAULT NULL,
  \`allowed_departments\` json DEFAULT NULL,
  \`tags\` json DEFAULT NULL,
  \`image\` text DEFAULT NULL,
  \`price_range\` varchar(128) DEFAULT NULL,
  \`is_featured\` tinyint(1) DEFAULT 0,
  \`seating_type\` varchar(64) DEFAULT NULL,
  \`total_capacity\` int DEFAULT 200,
  \`booked_count\` int DEFAULT 0,
  \`seating_tiers\` json DEFAULT NULL,
  \`agenda\` json DEFAULT NULL,
  \`seats\` json DEFAULT NULL,
  \`version\` int DEFAULT 1,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table \`events\`
LOCK TABLES \`events\` WRITE;
`;

  if (events.length > 0) {
    sql += 'INSERT INTO `events` (`id`, `title`, `subtitle`, `description`, `category`, `date`, `time`, `location`, `organizing_department`, `organizer_name`, `total_capacity`, `booked_count`, `is_featured`) VALUES\n';
    const values = events.map(e => {
      const escape = (val?: string) => val ? val.replace(/'/g, "''") : '';
      return `  ('${escape(e.id)}', '${escape(e.title)}', '${escape(e.subtitle || '')}', '${escape(e.description || '')}', '${escape(e.category)}', '${escape(e.date)}', '${escape(e.time)}', '${escape(e.location)}', '${escape(e.organizingDepartment)}', '${escape(e.organizerName)}', ${e.totalCapacity || 200}, ${e.bookedCount || 0}, ${e.isFeatured ? 1 : 0})`;
    });
    sql += values.join(',\n') + ';\n';
  }
  sql += 'UNLOCK TABLES;\n\n';

  sql += `-- -----------------------------------------------------------------
-- Table structure for table \`bookings\`
-- -----------------------------------------------------------------
DROP TABLE IF EXISTS \`bookings\`;
CREATE TABLE \`bookings\` (
  \`id\` varchar(64) NOT NULL,
  \`booking_reference\` varchar(64) NOT NULL,
  \`event_id\` varchar(64) NOT NULL,
  \`event_title\` varchar(255) NOT NULL,
  \`user_id\` varchar(64) DEFAULT NULL,
  \`user_email\` varchar(255) NOT NULL,
  \`user_name\` varchar(255) NOT NULL,
  \`user_phone\` varchar(64) DEFAULT NULL,
  \`user_department\` varchar(255) DEFAULT NULL,
  \`seats\` json DEFAULT NULL,
  \`total_price\` int DEFAULT 0,
  \`status\` varchar(64) NOT NULL DEFAULT 'confirmed',
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`booking_reference\` (\`booking_reference\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table \`bookings\`
LOCK TABLES \`bookings\` WRITE;
`;

  if (bookings.length > 0) {
    sql += 'INSERT INTO `bookings` (`id`, `booking_reference`, `event_id`, `event_title`, `user_email`, `user_name`, `user_department`, `total_price`, `status`) VALUES\n';
    const values = bookings.map(b => {
      const escape = (val?: string) => val ? val.replace(/'/g, "''") : '';
      return `  ('${escape(b.id)}', '${escape(b.bookingReference)}', '${escape(b.eventId)}', '${escape(b.eventTitle)}', '${escape(b.attendee?.email || '')}', '${escape(b.attendee?.fullName || '')}', '${escape(b.attendee?.attendeeDepartment || '')}', ${b.totalPrice || 0}, '${escape(b.status || 'confirmed')}')`;
    });
    sql += values.join(',\n') + ';\n';
  }
  sql += 'UNLOCK TABLES;\n\n';

  sql += `-- =================================================================
-- END OF SRHU EVENTS DB DUMP
-- =================================================================\n`;

  return sql;
}


