import { Booking, Event, Seat, User, AuthResponse } from '../types';

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data;
}

export async function signupUser(payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  department: string;
  role?: string;
  studentId?: string;
}): Promise<AuthResponse> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data;
}

export async function fetchEvents(filters?: { category?: string; search?: string; seatingType?: string }): Promise<Event[]> {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters?.seatingType && filters.seatingType !== 'All') params.append('seatingType', filters.seatingType);
  if (filters?.search) params.append('search', filters.search);

  const res = await fetch(`/api/events?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  return data.events || [];
}

export async function fetchEventById(id: string): Promise<Event> {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) throw new Error('Event not found');
  const data = await res.json();
  return data.event;
}

export async function createBooking(payload: {
  eventId: string;
  seats?: { seatId: string; row: string; number: number; tier: string; price: number }[];
  addOns?: { id: string; title: string; price: number }[];
  attendee: { fullName: string; email: string; phone: string; attendeeDepartment?: string; specialNotes?: string };
  expectedEventVersion?: number;
}): Promise<{ booking: Booking; updatedEventVersion: number }> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to complete booking');
  }

  return { booking: data.booking, updatedEventVersion: data.updatedEventVersion };
}

export async function fetchBookings(email?: string): Promise<Booking[]> {
  const url = email ? `/api/bookings?email=${encodeURIComponent(email)}` : '/api/bookings';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  const data = await res.json();
  return data.bookings || [];
}

export async function checkInTicket(code: string): Promise<{ success: boolean; message: string; booking?: Booking }> {
  const res = await fetch('/api/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();
  return data;
}

export async function simulateConcurrencyTest(eventId: string, targetSeatId: string) {
  const res = await fetch('/api/simulate-concurrency', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, targetSeatId }),
  });

  if (!res.ok) throw new Error('Concurrency simulation failed');
  const data = await res.json();
  return data.simulation;
}

export async function createNewEvent(eventData: Partial<Event>): Promise<Event> {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });

  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create event');
  return data.event;
}

export async function callAiAssistant(mode: 'recommend' | 'organizer_copilot', promptText: string, eventContext?: any) {
  const res = await fetch('/api/ai-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, promptText, eventContext }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'AI Assistant request failed');
  return mode === 'recommend' ? data.recommendation : data.generatedContent;
}
