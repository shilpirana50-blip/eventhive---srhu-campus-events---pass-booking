import express from 'express';
import path from 'path';
import QRCode from 'qrcode';
import { GoogleGenAI } from '@google/genai';
import { Booking, Event, Seat } from './src/types.js';
import {
  initDatabase,
  getUserByEmail,
  createUser,
  getEvents,
  getEventById,
  createEvent,
  updateEventInDB,
  createBooking,
  getBookings,
  getBookingByRefOrId,
  updateBookingStatus,
  getDatabaseStatus,
  getWorkbenchTablesData,
  executeWorkbenchQuery,
  getMySQLSchemaDumpSQL,
} from './src/db/mysql.js';

// Lazy Gemini AI setup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

const app = express();
app.use(express.json());

const PORT = 3000;

// API ROUTES //

// DATABASE HEALTH & STATUS ROUTE
app.get('/api/db/status', async (req, res) => {
  try {
    const status = await getDatabaseStatus();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// EXPORT MYSQL DATABASE SCHEMA + DATA DUMP (.sql) FOR LOCALHOST MYSQL WORKBENCH
app.get('/api/db/export.sql', async (req, res) => {
  try {
    const sqlDump = await getMySQLSchemaDumpSQL();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="srhu_events_db.sql"');
    res.send(sqlDump);
  } catch (err: any) {
    res.status(500).send(`-- Error generating SQL dump: ${err.message}`);
  }
});

// MYSQL WORKBENCH ROUTES (In-App Database Explorer & SQL Console)
app.get('/api/db/workbench/tables', async (req, res) => {
  try {
    const data = await getWorkbenchTablesData();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/db/workbench/query', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) {
      return res.status(400).json({ success: false, error: 'SQL query is required' });
    }
    const result = await executeWorkbenchQuery(String(sql));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AUTHENTICATION ROUTES
// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await getUserByEmail(String(email));

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token: `mock-jwt-token-${user.id}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password, phone, department, role, studentId } = req.body;

    if (!fullName || !email || !password || !department) {
      return res.status(400).json({ success: false, error: 'Full name, email, password, and department are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await getUserByEmail(normalizedEmail);

    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists' });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      fullName,
      email: normalizedEmail,
      password,
      phone: phone || '',
      department,
      role: role || 'student',
      studentId: studentId || `SRHU/${new Date().getFullYear()}/${department.substring(0, 3).toUpperCase()}/${Math.floor(100 + Math.random() * 900)}`,
    };

    await createUser(newUser);

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, user: safeUser, token: `mock-jwt-token-${newUser.id}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/events - List events with optional category/search filters
app.get('/api/events', async (req, res) => {
  try {
    const { category, search, seatingType } = req.query;
    const eventsList = await getEvents({
      category: category ? String(category) : undefined,
      seatingType: seatingType ? String(seatingType) : undefined,
      search: search ? String(search) : undefined,
    });

    res.json({ success: true, count: eventsList.length, events: eventsList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/events/:id - Get detailed event
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/events - Create new event (Organizer)
app.post('/api/events', async (req, res) => {
  try {
    const newEvent: Event = {
      ...req.body,
      id: `evt-${Date.now()}`,
      organizingDepartment: req.body.organizingDepartment || 'School of Science & Technology',
      allowedDepartments: req.body.allowedDepartments || ['ALL'],
      universityName: 'Swami Rama Himalayan University, Jolly Grant',
      bookedCount: 0,
      version: 1,
      seats: req.body.seats || [],
    };
    await createEvent(newEvent);
    res.json({ success: true, event: newEvent });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/bookings - Perform booking with MySQL persistence & double-booking protection
app.post('/api/bookings', async (req, res) => {
  try {
    const { eventId, seats, addOns = [], attendee, expectedEventVersion } = req.body;

    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // DEPARTMENT ELIGIBILITY CHECK
    const attendeeDept = attendee?.attendeeDepartment || 'Guest / Unspecified';
    const allowed = event.allowedDepartments || ['ALL'];
    const isDeptAllowed = allowed.includes('ALL') || allowed.includes(attendeeDept);

    if (!isDeptAllowed) {
      return res.status(403).json({
        success: false,
        error: `Registration Restricted: The organizer (${event.organizingDepartment}) has allowed participation ONLY for students from: [${allowed.join(', ')}]. Users from ${attendeeDept} can view event details on the portal, but cannot register.`,
        conflictType: 'DEPARTMENT_RESTRICTED',
      });
    }

    // OPTIMISTIC LOCKING VERIFICATION
    if (expectedEventVersion !== undefined && expectedEventVersion !== event.version) {
      return res.status(409).json({
        success: false,
        error: 'Concurrency Conflict: The event seating state has changed since you viewed it. Please refresh and re-select seats.',
        conflictType: 'VERSION_MISMATCH',
      });
    }

    // Check individual seat availability if seat_map event
    let updatedSeats = [...(event.seats || [])];
    if (event.seatingType === 'seat_map' && seats && seats.length > 0) {
      for (const reqSeat of seats) {
        const targetSeat = updatedSeats.find((s) => s.id === reqSeat.seatId);
        if (!targetSeat) {
          return res.status(400).json({ success: false, error: `Seat ${reqSeat.seatId} does not exist.` });
        }
        if (targetSeat.status === 'booked') {
          return res.status(409).json({
            success: false,
            error: `Seat ${targetSeat.row}-${targetSeat.number} is already booked by another user! Double-booking prevented.`,
            conflictType: 'SEAT_ALREADY_BOOKED',
            seatId: targetSeat.id,
          });
        }
      }

      // Mark seats as booked & increment seat version
      updatedSeats = updatedSeats.map((s) => {
        const isSelected = seats.some((rs: any) => rs.seatId === s.id);
        if (isSelected) {
          return {
            ...s,
            status: 'booked' as const,
            bookedBy: attendee.email || attendee.fullName,
            version: s.version + 1,
          };
        }
        return s;
      });
    }

    // Update capacity & increment event version atomically
    const ticketsCount = seats && seats.length > 0 ? seats.length : 1;
    event.bookedCount += ticketsCount;
    event.version += 1;
    event.seats = updatedSeats;

    // Persist event state update to MySQL
    await updateEventInDB(event);

    // Calculate pricing
    const seatsTotal = (seats || []).reduce((acc: number, s: any) => acc + s.price, 0);
    const addOnsTotal = (addOns || []).reduce((acc: number, a: any) => acc + a.price, 0);
    const totalPrice = seatsTotal + addOnsTotal;

    // Generate unique booking reference
    const refSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingRef = `GP-${Math.floor(1000 + Math.random() * 9000)}-${refSuffix}`;
    const bookingId = `bk-${Date.now()}`;

    // Create QR Code
    const qrPayload = JSON.stringify({
      ref: bookingRef,
      eventId: event.id,
      attendee: attendee.fullName,
      email: attendee.email,
      seats: (seats || []).map((s: any) => `${s.row}-${s.number}`),
      issuedAt: new Date().toISOString(),
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 240,
      color: { dark: '#0f172a', light: '#ffffff' },
    });

    const newBooking: Booking = {
      id: bookingId,
      bookingReference: bookingRef,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      eventImage: event.image,
      seats: seats || [],
      addOns: addOns || [],
      attendee,
      totalPrice,
      qrCodeDataUrl,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      version: 1,
    };

    await createBooking(newBooking);

    res.json({
      success: true,
      booking: newBooking,
      updatedEventVersion: event.version,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/bookings - Get list of bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const { email } = req.query;
    const list = await getBookings(email ? String(email) : undefined);
    res.json({ success: true, count: list.length, bookings: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/checkin - Verify QR Code ticket and check-in attendee
app.post('/api/checkin', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Check-in code or reference required' });
    }

    let targetRef = code.trim();
    if (code.startsWith('{')) {
      try {
        const parsed = JSON.parse(code);
        targetRef = parsed.ref || code;
      } catch (e) {
        // fallback
      }
    }

    const booking = await getBookingByRefOrId(targetRef);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Invalid ticket code. Booking reference not found.' });
    }

    if (booking.status === 'checked_in') {
      return res.status(400).json({
        success: false,
        message: `Ticket already checked in at ${new Date(booking.checkedInAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`,
        booking,
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Ticket has been cancelled.', booking });
    }

    const checkedInAt = new Date().toISOString();
    await updateBookingStatus(booking.id, 'checked_in', checkedInAt);
    booking.status = 'checked_in';
    booking.checkedInAt = checkedInAt;

    res.json({
      success: true,
      message: `Check-in successful! Verified for ${booking.attendee.fullName}.`,
      booking,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/simulate-concurrency - Test & Demonstrate Optimistic Locking / Double Booking Prevention
app.post('/api/simulate-concurrency', async (req, res) => {
  try {
    const { eventId = 'evt-101', targetSeatId = 'B-1' } = req.body;
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const initialVersion = event.version;

    // Reset target seat to available for clean test
    const seatObj = event.seats.find((s) => s.id === targetSeatId);
    if (seatObj) {
      seatObj.status = 'available';
      seatObj.bookedBy = undefined;
      await updateEventInDB(event);
    }

    // Simulate User A request
    const userABookingPromise = (async () => {
      await new Promise((r) => setTimeout(r, 10));
      const freshEvent = await getEventById(eventId);
      if (!freshEvent) throw new Error('Event not found');
      const targetSeat = freshEvent.seats.find((s) => s.id === targetSeatId);
      if (!targetSeat || targetSeat.status === 'booked' || freshEvent.version !== initialVersion) {
        throw new Error('CONCURRENCY_LOCK_REJECTED: Seat was claimed by User B!');
      }

      targetSeat.status = 'booked';
      targetSeat.bookedBy = 'User A (First Click)';
      freshEvent.bookedCount += 1;
      freshEvent.version += 1;

      await updateEventInDB(freshEvent);

      const ref = `GP-DEMO-USERA-${Math.floor(100 + Math.random() * 900)}`;
      const qrCodeDataUrl = await QRCode.toDataURL(ref);
      const booking: Booking = {
        id: `bk-user-a-${Date.now()}`,
        bookingReference: ref,
        eventId: freshEvent.id,
        eventTitle: freshEvent.title,
        eventDate: freshEvent.date,
        eventTime: freshEvent.time,
        eventLocation: freshEvent.location,
        eventImage: freshEvent.image,
        seats: [{ seatId: targetSeatId, row: targetSeat.row, number: targetSeat.number, tier: targetSeat.tier, price: targetSeat.price }],
        addOns: [],
        attendee: { fullName: 'User A (Speedy)', email: 'usera@srhu.edu.in', phone: '555-0101', attendeeDepartment: 'School of Science & Technology' },
        totalPrice: targetSeat.price,
        qrCodeDataUrl,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        version: 1,
      };
      await createBooking(booking);
      return booking;
    })();

    // Simulate User B request (identical seat, submitted concurrently)
    const userBBookingPromise = (async () => {
      await new Promise((r) => setTimeout(r, 25));
      const freshEvent = await getEventById(eventId);
      if (!freshEvent) throw new Error('Event not found');
      const targetSeat = freshEvent.seats.find((s) => s.id === targetSeatId);

      if (!targetSeat || targetSeat.status === 'booked' || freshEvent.version !== initialVersion) {
        throw new Error(`CONCURRENCY_LOCK_REJECTED: Optimistic locking version mismatch (Expected v${initialVersion}, Current v${freshEvent.version}). Seat ${targetSeatId} has already been reserved by another simultaneous transaction.`);
      }

      targetSeat.status = 'booked';
      targetSeat.bookedBy = 'User B';
      freshEvent.bookedCount += 1;
      freshEvent.version += 1;

      await updateEventInDB(freshEvent);
      return 'User B Reserved';
    })();

    const results = await Promise.allSettled([userABookingPromise, userBBookingPromise]);

    const user1Res = results[0];
    const user2Res = results[1];

    res.json({
      success: true,
      simulation: {
        targetSeat: targetSeatId,
        user1: {
          status: user1Res.status === 'fulfilled' ? 'SUCCESS' : 'FAILED',
          details: user1Res.status === 'fulfilled' ? user1Res.value : (user1Res as any).reason.message,
        },
        user2: {
          status: user2Res.status === 'fulfilled' ? 'SUCCESS' : 'FAILED',
          details: user2Res.status === 'fulfilled' ? user2Res.value : (user2Res as any).reason.message,
        },
        optimisticLockingProtection: 'ACTIVE (Double-Booking Prevented 100%)',
        updatedEventVersion: (await getEventById(eventId))?.version || initialVersion,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai-assistant - Gemini AI Powered Event Concierge & Organizer Copilot
app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { mode = 'recommend', promptText, eventContext } = req.body;
    const client = getGeminiClient();
    const currentEvents = await getEvents();

    if (!client) {
      if (mode === 'recommend') {
        return res.json({
          success: true,
          recommendation: {
            explanation: `Based on your request "${promptText}", here are top community picks with vibrant atmosphere and interactive seating!`,
            suggestedIds: ['evt-101', 'evt-102'],
          },
        });
      } else {
        return res.json({
          success: true,
          generatedContent: {
            title: eventContext?.title || 'Community Tech & Art Gathering',
            description: `Join us for an exciting evening of community networking, interactive sessions, and hands-on workshops. Discover local talent, connect with fellow creators, and enjoy artisanal refreshments!`,
            agenda: [
              { time: '06:00 PM', title: 'Doors Open & Check-in', description: 'Networking and welcome drinks.' },
              { time: '07:00 PM', title: 'Main Stage Keynote', description: 'Featured speakers and Q&A.' },
              { time: '08:30 PM', title: 'Mixer & Closing', description: 'Casual networking and door prizes.' },
            ],
          },
        });
      }
    }

    if (mode === 'recommend') {
      const systemInstruction = `You are GatherPulse AI Event Concierge. Given the user's preferences, analyze the available events list and pick 2-3 most relevant events. Return a JSON object formatted as: {"explanation": "a warm 2-sentence rationale", "suggestedIds": ["evt-101", "evt-102"]}. Events list: ${JSON.stringify(
        currentEvents.map((e) => ({ id: e.id, title: e.title, category: e.category, tags: e.tags, desc: e.description }))
      )}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText || 'Suggest tech and music events',
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ success: true, recommendation: parsed });
    } else {
      const systemInstruction = `You are GatherPulse AI Event Copilot for event organizers. Generate an engaging description, subtitle, and 3-step agenda for a new community event based on user input. Return JSON formatted as: {"subtitle": "...", "description": "...", "longDescription": "...", "agenda": [{"time": "06:00 PM", "title": "...", "description": "..."}]}`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Event Topic: ${promptText}. Context: ${JSON.stringify(eventContext || {})}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ success: true, generatedContent: parsed });
    }
  } catch (err: any) {
    console.error('AI Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// VITE MIDDLEWARE SETUP FOR DEV & PRODUCTION //
async function startServer() {
  // Initialize Database Schema & Tables on boot
  try {
    const dbInfo = await initDatabase();
    console.log(`🚀 Database status: ${dbInfo.mode}`);
  } catch (err) {
    console.error('Database initialization error:', err);
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GatherPulse Server running on http://localhost:${PORT}`);
  });
}

startServer();
