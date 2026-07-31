export const SRHU_DEPARTMENTS = [
  'School of Yoga Science',
  'School of Nursing',
  'School of Management Studies',
  'School of Science & Technology',
  'School of Bio Sciences',
  'School of Pharmaceutical Sciences',
] as const;

export type SRHUDepartment = (typeof SRHU_DEPARTMENTS)[number];

export type EventCategory =
  | 'Tech & Innovation'
  | 'Music & Arts'
  | 'Community & Workshops'
  | 'Food & Culinary'
  | 'Wellness & Sports'
  | 'Networking & Business';

export type SeatTierType = 'VIP' | 'Premium' | 'Standard' | 'Accessible';

export interface Seat {
  id: string; // e.g., "A-1"
  row: string; // e.g., "A"
  number: number; // e.g., 1
  tier: SeatTierType;
  price: number;
  status: 'available' | 'held' | 'booked';
  heldBy?: string; // session/user ID
  heldUntil?: number; // timestamp ms
  bookedBy?: string; // user email or name
  version: number; // optimistic locking version
}

export interface SeatingTier {
  name: SeatTierType;
  price: number;
  description: string;
  totalSeats: number;
  availableSeats: number;
  colorClass: string;
}

export interface EventAgendaItem {
  time: string;
  title: string;
  description: string;
}

export interface Event {
  id: string;
  title: string;
  subtitle: string;
  category: EventCategory;
  organizingDepartment: string; // e.g., "School of Science & Technology"
  allowedDepartments: string[]; // e.g., ["ALL"] or ["School of Nursing", "School of Bio Sciences"]
  universityName?: string; // Swami Rama Himalayan University, Jolly Grant
  date: string; // YYYY-MM-DD
  time: string; // e.g. "18:00"
  duration: string; // e.g. "3 hours"
  location: string; // venue name inside SRHU
  address: string;
  coordinates: { lat: number; lng: number };
  description: string;
  longDescription: string;
  organizerName: string;
  organizerEmail: string;
  image: string;
  priceRange: string;
  isFeatured?: boolean;
  seatingType: 'seat_map' | 'general';
  totalCapacity: number;
  bookedCount: number;
  seatingTiers: SeatingTier[];
  seats: Seat[];
  agenda: EventAgendaItem[];
  tags: string[];
  version: number; // version for optimistic locking double-booking prevention
}

export interface Attendee {
  fullName: string;
  email: string;
  phone: string;
  attendeeDepartment: string; // Department selected during checkout
  specialNotes?: string;
}

export interface AddOnPerk {
  id: string;
  title: string;
  price: number;
  description: string;
  iconName: string;
}

export interface SelectedSeatInfo {
  seatId: string;
  row: string;
  number: number;
  tier: SeatTierType;
  price: number;
}

export interface SelectedAddOn {
  id: string;
  title: string;
  price: number;
}

export interface Booking {
  id: string;
  bookingReference: string; // e.g., "GP-8942-X7"
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventImage: string;
  seats: SelectedSeatInfo[];
  addOns: SelectedAddOn[];
  attendee: Attendee;
  totalPrice: number;
  qrCodeDataUrl: string;
  status: 'confirmed' | 'checked_in' | 'cancelled';
  checkedInAt?: string;
  createdAt: string;
  version: number;
}

export interface ConcurrencyTestLog {
  user1Status: 'success' | 'failed';
  user2Status: 'success' | 'failed';
  seatId: string;
  winnerRef?: string;
  loserError?: string;
  durationMs: number;
  timestamp: string;
}

export interface OrganizerStats {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalCheckIns: number;
  checkInRate: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  department: SRHUDepartment | string;
  role: 'student' | 'faculty' | 'organizer';
  studentId?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface ToastAlert {
  id: string;
  type: 'new_event' | 'slots_open' | 'dept_alert' | 'info';
  title: string;
  message: string;
  department?: string;
  eventId?: string;
  timestamp: string;
}
