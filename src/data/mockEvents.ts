import { Event, Seat, SeatTierType } from '../types';
const sstImage = '/src/assets/images/srhu_sst_campus_1785346046507.jpg';
const himsImage = '/src/assets/images/srhu_hims_campus_1785346070569.jpg';
const nursingImage = '/src/assets/images/srhu_nursing_campus_1785346086039.jpg';
const yogaImage = '/src/assets/images/srhu_yoga_campus_1785346099686.jpg';
const pharmaImage = '/src/assets/images/srhu_pharma_campus_1785346112837.jpg';
const bioImage = '/src/assets/images/srhu_bio_campus_1785346128423.jpg';
const mgmtImage = '/src/assets/images/srhu_mgmt_campus_1785346155539.jpg';

export const SRHU_DEPARTMENT_IMAGES: Record<string, string> = {
  'School of Science & Technology': sstImage,
  'School of Nursing': nursingImage,
  'Himalayan Institute of Medical Sciences': himsImage,
  'School of Yoga Science': yogaImage,
  'School of Pharmaceutical Sciences': pharmaImage,
  'School of Bio Sciences': bioImage,
  'School of Management Studies': mgmtImage,
};

export function generateSeatsForEvent(vipPrice = 85, premiumPrice = 50, standardPrice = 30, accessiblePrice = 25): Seat[] {
  const seats: Seat[] = [];

  // Row A: VIP (8 seats)
  for (let i = 1; i <= 8; i++) {
    seats.push({
      id: `A-${i}`,
      row: 'A',
      number: i,
      tier: 'VIP',
      price: vipPrice,
      status: i === 3 || i === 4 ? 'booked' : 'available',
      bookedBy: i === 3 || i === 4 ? 'Jane Doe' : undefined,
      version: 1,
    });
  }

  // Row B: Premium (10 seats)
  for (let i = 1; i <= 10; i++) {
    seats.push({
      id: `B-${i}`,
      row: 'B',
      number: i,
      tier: 'Premium',
      price: premiumPrice,
      status: i === 5 ? 'booked' : 'available',
      bookedBy: i === 5 ? 'Alex Smith' : undefined,
      version: 1,
    });
  }

  // Row C: Premium (10 seats)
  for (let i = 1; i <= 10; i++) {
    seats.push({
      id: `C-${i}`,
      row: 'C',
      number: i,
      tier: 'Premium',
      price: premiumPrice,
      status: 'available',
      version: 1,
    });
  }

  // Row D: Standard (12 seats)
  for (let i = 1; i <= 12; i++) {
    seats.push({
      id: `D-${i}`,
      row: 'D',
      number: i,
      tier: 'Standard',
      price: standardPrice,
      status: i === 1 || i === 2 || i === 11 ? 'booked' : 'available',
      version: 1,
    });
  }

  // Row E: Standard (12 seats)
  for (let i = 1; i <= 12; i++) {
    seats.push({
      id: `E-${i}`,
      row: 'E',
      number: i,
      tier: 'Standard',
      price: standardPrice,
      status: 'available',
      version: 1,
    });
  }

  // Row F: Accessible (6 seats)
  for (let i = 1; i <= 6; i++) {
    seats.push({
      id: `F-${i}`,
      row: 'F',
      number: i,
      tier: 'Accessible',
      price: accessiblePrice,
      status: 'available',
      version: 1,
    });
  }

  return seats;
}

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-101',
    title: 'SRHU TechHack 2026: AI & Digital Health Hackathon',
    subtitle: 'Building smart medical AI, health-tech tools & IoT diagnostics',
    category: 'Tech & Innovation',
    organizingDepartment: 'School of Science & Technology',
    allowedDepartments: ['ALL'],
    universityName: 'Swami Rama Himalayan University, Jolly Grant',
    date: '2026-08-05',
    time: '09:00 AM',
    duration: '8 hours',
    location: 'SST Central Auditorium & Innovation Lab, SRHU',
    address: 'Swami Rama Himalayan University, Jolly Grant, Dehradun, Uttarakhand',
    coordinates: { lat: 30.1906, lng: 78.1633 },
    description: 'Join coders, biomedical researchers, and student innovators for a 24-hour coding sprint building AI diagnostic prototypes and hospital automation systems.',
    longDescription: `Organized by the School of Science & Technology (SST) at Swami Rama Himalayan University, Jolly Grant, Dehradun!

This event brings together student developers, data scientists, and healthcare engineers across all SRHU departments.

Highlights include:
- Interactive live coding stage with real-time cloud feedback
- Panel discussion: AI deployment in Himalayan rural health centers
- Prototype showcase with cash prizes & incubation grants from SRHU Innovation Cell
- All SRHU departments are welcome to register and participate!`,
    organizerName: 'School of Science & Technology (SST)',
    organizerEmail: 'sst.events@srhu.edu.in',
    image: sstImage,
    priceRange: 'Free Entry',
    isFeatured: true,
    seatingType: 'seat_map',
    totalCapacity: 58,
    bookedCount: 6,
    version: 1,
    tags: ['SST', 'Hackathon', 'AI Health', 'SRHU Dehradun'],
    seatingTiers: [
      { name: 'VIP', price: 0, description: 'Front Row Hacker Tables + Mentor Desk', totalSeats: 8, availableSeats: 6, colorClass: 'bg-amber-500' },
      { name: 'Premium', price: 0, description: 'Middle Row Developer Stations', totalSeats: 20, availableSeats: 19, colorClass: 'bg-indigo-600' },
      { name: 'Standard', price: 0, description: 'General Student Participant Seating', totalSeats: 24, availableSeats: 21, colorClass: 'bg-emerald-600' },
      { name: 'Accessible', price: 0, description: 'Wheelchair Accessible Front Seating', totalSeats: 6, availableSeats: 6, colorClass: 'bg-sky-500' },
    ],
    seats: generateSeatsForEvent(0, 0, 0, 0),
    agenda: [
      { time: '09:00 AM', title: 'Registration & Morning Coffee', description: 'Badge verification & team check-in at SST Auditorium.' },
      { time: '10:00 AM', title: 'Keynote: AI in Himalayan Telemedicine', description: 'Address by Dean SST & Chief Medical Tech Officer.' },
      { time: '12:30 PM', title: 'Hackathon Sprint Begins', description: 'Interactive project building across hardware & software labs.' },
      { time: '04:30 PM', title: 'Project Demo & Jury Pitching', description: 'Final project evaluation and trophy distribution.' },
    ],
  },
  {
    id: 'evt-102',
    title: 'Himalayan Clinical Nursing & Emergency Care Workshop',
    subtitle: 'Advanced patient triage, trauma care & ICU protocol training',
    category: 'Community & Workshops',
    organizingDepartment: 'School of Nursing',
    allowedDepartments: ['School of Nursing', 'School of Bio Sciences'],
    universityName: 'Swami Rama Himalayan University, Jolly Grant',
    date: '2026-08-08',
    time: '10:00 AM',
    duration: '5 hours',
    location: 'Himalayan College of Nursing Auditorium, SRHU',
    address: 'Swami Rama Himalayan University, Jolly Grant, Dehradun, Uttarakhand',
    coordinates: { lat: 30.1906, lng: 78.1633 },
    description: 'Specialized clinical hands-on simulation covering modern ICU care, patient monitoring, and critical care protocols.',
    longDescription: `Organized by the School of Nursing at SRHU Dehradun. 

⚠️ ELIGIBILITY NOTICE: The organizer has restricted registration for this workshop specifically to students and faculty from the School of Nursing and School of Bio Sciences. Other SRHU department students can view the schedule and agenda on this portal, but registration is closed to outside departments.

Key Workshop Modules:
- Practical simulation with high-fidelity medical mannequins
- Emergency airway management & ventilator setup
- Vital signs monitoring and patient safety checklists`,
    organizerName: 'School of Nursing (SRHU)',
    organizerEmail: 'nursing.events@srhu.edu.in',
    image: nursingImage,
    priceRange: 'Free Pass',
    isFeatured: true,
    seatingType: 'seat_map',
    totalCapacity: 58,
    bookedCount: 4,
    version: 1,
    tags: ['Nursing', 'Clinical Simulation', 'Emergency Care', 'SRHU'],
    seatingTiers: [
      { name: 'VIP', price: 0, description: 'Front Practical Station + Lab Coat Included', totalSeats: 8, availableSeats: 8, colorClass: 'bg-amber-500' },
      { name: 'Premium', price: 0, description: 'Mid-Tier Practical Demonstration Seating', totalSeats: 20, availableSeats: 19, colorClass: 'bg-indigo-600' },
      { name: 'Standard', price: 0, description: 'General Student Seating', totalSeats: 24, availableSeats: 22, colorClass: 'bg-emerald-600' },
      { name: 'Accessible', price: 0, description: 'Ground Level Access Seating', totalSeats: 6, availableSeats: 5, colorClass: 'bg-sky-500' },
    ],
    seats: generateSeatsForEvent(0, 0, 0, 0),
    agenda: [
      { time: '10:00 AM', title: 'Opening Remarks & Triage Basics', description: 'Introduction by Principal, Himalayan College of Nursing.' },
      { time: '11:15 AM', title: 'Hands-on ICU Simulation Session', description: 'Practical training on emergency patient stabilization.' },
      { time: '02:00 PM', title: 'Interactive Q&A & Certificate Distribution', description: 'Valedictory session for registered participants.' },
    ],
  },
  {
    id: 'evt-103',
    title: 'SRHU Yoga & Mind Sciences International Conclave',
    subtitle: 'Exploring Yogic Philosophy, Bio-Mechanics & Stress Resilience',
    category: 'Wellness & Sports',
    organizingDepartment: 'School of Yoga Science',
    allowedDepartments: ['ALL'],
    universityName: 'Swami Rama Himalayan University, Jolly Grant',
    date: '2026-08-12',
    time: '07:30 AM',
    duration: '4 hours',
    location: 'Swami Rama Meditation & Yogic Science Complex, SRHU',
    address: 'Swami Rama Himalayan University, Jolly Grant, Dehradun, Uttarakhand',
    coordinates: { lat: 30.1906, lng: 78.1633 },
    description: 'Immersive morning yogic practice, pranayama sessions, and scientific lectures on the neurological benefits of meditation.',
    longDescription: `Hosted by the School of Yoga Science at SRHU Dehradun in honor of Paramahansa Swami Rama's teachings.

Open to ALL SRHU departments (School of Yoga Science, Nursing, Management Studies, Science & Tech, Bio Sciences, and Pharmaceutical Sciences).

Highlights:
- Sunrise Asana & Pranayama guided session on the lush green campus lawn
- Research presentation: EEG brainwave analysis during deep meditation
- Herbal tea tasting & organic breakfast box for all registered participants`,
    organizerName: 'School of Yoga Science',
    organizerEmail: 'yoga.events@srhu.edu.in',
    image: yogaImage,
    priceRange: 'Free Pass',
    isFeatured: false,
    seatingType: 'general',
    totalCapacity: 100,
    bookedCount: 38,
    version: 1,
    tags: ['Yoga Science', 'Meditation', 'Stress Free', 'SRHU Campus'],
    seatingTiers: [
      { name: 'Standard', price: 0, description: 'General Yoga Mat Spot + Herbal Breakfast', totalSeats: 100, availableSeats: 62, colorClass: 'bg-emerald-600' },
    ],
    seats: [],
    agenda: [
      { time: '07:30 AM', title: 'Sunrise Asana & Pranayama Flow', description: 'Guided physical posture & breath regulation session.' },
      { time: '08:45 AM', title: 'Keynote: Neuroscience & Mindful Living', description: 'Scientific insights into stress reduction and mental clarity.' },
      { time: '10:30 AM', title: 'Herbal Refreshments & Group Photo', description: 'Interactive networking with Yoga faculty.' },
    ],
  },
  {
    id: 'evt-104',
    title: 'Pharma Innovation Expo & Novel Drug Delivery Summit',
    subtitle: 'Pharmaceutical formulations, clinical trials & herbal drug standardization',
    category: 'Tech & Innovation',
    organizingDepartment: 'School of Pharmaceutical Sciences',
    allowedDepartments: ['School of Pharmaceutical Sciences', 'School of Bio Sciences', 'School of Science & Technology'],
    universityName: 'Swami Rama Himalayan University, Jolly Grant',
    date: '2026-08-15',
    time: '11:00 AM',
    duration: '4 hours',
    location: 'Pharma Block Seminar Hall, SRHU Campus',
    address: 'Swami Rama Himalayan University, Jolly Grant, Dehradun, Uttarakhand',
    coordinates: { lat: 30.1906, lng: 78.1633 },
    description: 'Technical expo featuring student research posters, modern HPLC instrumentation demos, and herbal formulation displays.',
    longDescription: `Organized by the School of Pharmaceutical Sciences at SRHU Dehradun.

⚠️ ELIGIBILITY: Participation is open to students and researchers from the School of Pharmaceutical Sciences, School of Bio Sciences, and School of Science & Technology. Other departments can view the event and schedule on the portal.

Program Highlights:
- Poster competition on Herbal Formulations of Uttarakhand
- Industrial pharmacy tech exhibition
- Guest lecture by leading pharmaceutical research scientists`,
    organizerName: 'School of Pharmaceutical Sciences',
    organizerEmail: 'pharma.events@srhu.edu.in',
    image: pharmaImage,
    priceRange: 'Free Pass',
    isFeatured: false,
    seatingType: 'general',
    totalCapacity: 60,
    bookedCount: 22,
    version: 1,
    tags: ['Pharma', 'Drug Discovery', 'BioTech', 'SRHU'],
    seatingTiers: [
      { name: 'Standard', price: 0, description: 'Poster Presenter / Auditor Seat', totalSeats: 60, availableSeats: 38, colorClass: 'bg-emerald-600' },
    ],
    seats: [],
    agenda: [
      { time: '11:00 AM', title: 'Exhibition Inauguration & Keynote', description: 'Opening by Dean, School of Pharmaceutical Sciences.' },
      { time: '12:15 PM', title: 'Student Poster Presentation Session', description: 'Evaluated by industry jury members.' },
      { time: '02:00 PM', title: 'Awards for Best Innovative Formulation', description: 'Certificates and prize announcement.' },
    ],
  },
  {
    id: 'evt-105',
    title: 'Himalayan Bio-Sciences & Gene Editing Research Forum',
    subtitle: 'CRISPR applications, biodiversity research & molecular biology',
    category: 'Community & Workshops',
    organizingDepartment: 'School of Bio Sciences',
    allowedDepartments: ['School of Bio Sciences', 'School of Pharmaceutical Sciences'],
    universityName: 'Swami Rama Himalayan University, Jolly Grant',
    date: '2026-08-20',
    time: '02:00 PM',
    duration: '4 hours',
    location: 'Bioscience Research Complex Auditorium, SRHU',
    address: 'Swami Rama Himalayan University, Jolly Grant, Dehradun, Uttarakhand',
    coordinates: { lat: 30.1906, lng: 78.1633 },
    description: 'An academic symposium showcasing DNA sequencing advances, flora taxonomy of Uttarakhand, and recombinant technology.',
    longDescription: `Organized by the School of Bio Sciences at Swami Rama Himalayan University, Jolly Grant.

⚠️ ELIGIBILITY: Registration is restricted to students from the School of Bio Sciences and School of Pharmaceutical Sciences. Students from other SRHU schools are welcome to view the event profile and research topics online.`,
    organizerName: 'School of Bio Sciences (SRHU)',
    organizerEmail: 'biosciences.events@srhu.edu.in',
    image: bioImage,
    priceRange: 'Free Pass',
    isFeatured: true,
    seatingType: 'general',
    totalCapacity: 80,
    bookedCount: 34,
    version: 1,
    tags: ['Bio Sciences', 'Genomics', 'Biotechnology', 'SRHU Dehradun'],
    seatingTiers: [
      { name: 'Standard', price: 0, description: 'Auditor & Research Scholar Seat', totalSeats: 80, availableSeats: 46, colorClass: 'bg-emerald-600' },
    ],
    seats: [],
    agenda: [
      { time: '02:00 PM', title: 'Symposium Opening & DNA Lab Demo', description: 'Practical demonstration of gene extraction tools.' },
      { time: '03:30 PM', title: 'Research Paper Presentations', description: 'Presentations on Himalayan medicinal flora.' },
      { time: '05:30 PM', title: 'Networking & Valedictory Session', description: 'Interactive session with guest bio-scientists.' },
    ],
  },
  {
    id: 'evt-106',
    title: 'SRHU National Management Conclave & Healthcare Entrepreneurship',
    subtitle: 'Hospital administration, startup funding & leadership strategies',
    category: 'Networking & Business',
    organizingDepartment: 'School of Management Studies',
    allowedDepartments: ['ALL'],
    universityName: 'Swami Rama Himalayan University, Jolly Grant',
    date: '2026-08-25',
    time: '10:00 AM',
    duration: '6 hours',
    location: 'Management Studies Block Auditorium, SRHU',
    address: 'Swami Rama Himalayan University, Jolly Grant, Dehradun, Uttarakhand',
    coordinates: { lat: 30.1906, lng: 78.1633 },
    description: 'Learn healthcare management, hospital operations, and venture building from prominent hospital directors and industry leaders.',
    longDescription: `Organized by the School of Management Studies (SMS) at Swami Rama Himalayan University, Jolly Grant, Dehradun.

Open to students across ALL SRHU departments!

Highlights:
- Panel discussion on modern hospital supply chain & healthcare leadership
- Business Plan competition with mentorship prizes
- Interactive speed-networking session with SRHU alumni and corporate mentors`,
    organizerName: 'School of Management Studies',
    organizerEmail: 'sms.events@srhu.edu.in',
    image: mgmtImage,
    priceRange: 'Free Pass',
    isFeatured: false,
    seatingType: 'seat_map',
    totalCapacity: 58,
    bookedCount: 10,
    version: 1,
    tags: ['Management', 'Leadership', 'Healthcare Admin', 'SMS SRHU'],
    seatingTiers: [
      { name: 'VIP', price: 0, description: 'Delegates Front Row + Executive Lunch Access', totalSeats: 8, availableSeats: 5, colorClass: 'bg-amber-500' },
      { name: 'Premium', price: 0, description: 'Mid-Hall Student Delegate Seating', totalSeats: 20, availableSeats: 16, colorClass: 'bg-indigo-600' },
      { name: 'Standard', price: 0, description: 'General Student Seating', totalSeats: 30, availableSeats: 27, colorClass: 'bg-emerald-600' },
    ],
    seats: generateSeatsForEvent(0, 0, 0, 0),
    agenda: [
      { time: '10:00 AM', title: 'Welcome Address & Lamp Lighting', description: 'Inauguration by Dean SMS & Management Faculty.' },
      { time: '11:15 AM', title: 'Keynote: Healthcare Admin in Modern Hospitals', description: 'Insights on operational efficiency in large tertiary hospitals.' },
      { time: '02:00 PM', title: 'Business Plan Pitching Competition', description: 'Student teams present healthcare startup concepts.' },
      { time: '03:30 PM', title: 'Networking Reception & Awards', description: 'Distribution of certificates and trophies.' },
    ],
  },
];
