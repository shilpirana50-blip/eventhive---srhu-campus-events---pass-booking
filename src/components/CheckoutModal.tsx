import React, { useState } from 'react';
import { ShieldCheck, User as UserIcon, Mail, Phone, Ticket, CheckCircle2, ArrowRight, ArrowLeft, Tag, Sparkles, CreditCard, Lock, Building2 } from 'lucide-react';
import { Event, SelectedSeatInfo, AddOnPerk, SelectedAddOn, Booking, SRHU_DEPARTMENTS, User } from '../types';
import { createBooking } from '../lib/api';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  event: Event;
  selectedSeats: SelectedSeatInfo[];
  userDepartment?: string;
  currentUser?: User | null;
  onSuccess: (booking: Booking) => void;
  onClose: () => void;
}

const AVAILABLE_PERKS: AddOnPerk[] = [
  { id: 'ao-parking', title: 'Reserved SRHU Campus Parking', price: 0, description: 'Guaranteed parking spot near Jolly Grant venue entry gate.', iconName: 'Car' },
  { id: 'ao-swag', title: 'SRHU Department Souvenir Combo', price: 15, description: 'Official department event t-shirt & ID lanyard combo.', iconName: 'ShoppingBag' },
  { id: 'ao-drink', title: 'Campus Refresher Voucher', price: 5, description: 'Snack and drink token redeemable at campus food court.', iconName: 'Coffee' },
  { id: 'ao-kit', title: 'Academic Workshop Materials & Deck', price: 10, description: 'Printed lab manual, reference deck, and digital certificate.', iconName: 'BookOpen' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ event, selectedSeats, userDepartment, currentUser, onSuccess, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State initialized with logged in user or default
  const [fullName, setFullName] = useState(currentUser?.fullName || 'Ananya Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'ananya.sharma@srhu.edu.in');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [attendeeDepartment, setAttendeeDepartment] = useState<string>(currentUser?.department || userDepartment || 'School of Science & Technology');
  const [specialNotes, setSpecialNotes] = useState('');

  // Selected Perks
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const seatsTotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const addOnsTotal = selectedAddOns.reduce((acc, a) => acc + a.price, 0);
  const subtotal = seatsTotal + addOnsTotal;
  const discountAmount = Math.round(subtotal * appliedDiscount);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const toggleAddOn = (perk: AddOnPerk) => {
    if (selectedAddOns.some((a) => a.id === perk.id)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== perk.id));
    } else {
      setSelectedAddOns([...selectedAddOns, { id: perk.id, title: perk.title, price: perk.price }]);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'SRHU2026') {
      setAppliedDiscount(0.1);
      setPromoMessage('10% SRHU Student Partner Discount Applied!');
    } else if (promoCode.trim().toUpperCase() === 'COMMUNITY20') {
      setAppliedDiscount(0.2);
      setPromoMessage('20% SRHU Faculty Partner Discount Applied!');
    } else {
      setPromoMessage('Invalid promo code. Try "SRHU2026"');
    }
  };

  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Full Name must be at least 2 characters';
    }
    if (!email.trim() || !email.includes('@')) {
      errs.email = 'Please provide a valid SRHU or personal email address';
    }
    if (!phone.trim() || phone.trim().length < 7) {
      errs.phone = 'Valid phone number is required for SMS check-in tickets';
    }

    // Check SRHU Department Eligibility
    const allowed = event.allowedDepartments || ['ALL'];
    if (!allowed.includes('ALL') && !allowed.includes(attendeeDepartment)) {
      errs.attendeeDepartment = `Registration restricted! The organizer (${event.organizingDepartment}) has restricted registration strictly to: [${allowed.join(', ')}].`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async () => {
    setServerError('');
    setIsSubmitting(true);

    try {
      const res = await createBooking({
        eventId: event.id,
        seats: selectedSeats,
        addOns: selectedAddOns,
        attendee: {
          fullName,
          email,
          phone,
          attendeeDepartment,
          specialNotes,
        },
        expectedEventVersion: event.version,
      });

      // Fire confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onSuccess(res.booking);
    } catch (err: any) {
      setServerError(err.message || 'Double-booking conflict or department restriction occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-2xl border border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header with Steps */}
        <div className="p-6 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">
                CHECKOUT PROCESS
              </span>
              <h2 className="text-xl font-bold text-white">{event.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Stepper Bar */}
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-500 border-t border-slate-800 pt-3">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-indigo-400 font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
              <span>Seats & Perks</span>
            </div>
            <div className="w-8 h-[2px] bg-slate-800" />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-indigo-400 font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
              <span>Attendee Details</span>
            </div>
            <div className="w-8 h-[2px] bg-slate-800" />
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-indigo-400 font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
              <span>Payment & Confirm</span>
            </div>
          </div>
        </div>

        {/* Step 1: Add-On Perks */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Selected Seats</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-indigo-400" />
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">
                      {selectedSeats.length > 0
                        ? `${selectedSeats.length} Reserved Venue Seat(s)`
                        : 'General Admission Ticket'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {selectedSeats.map((s) => `Row ${s.row}-${s.number}`).join(', ')}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-mono font-bold text-indigo-400">${seatsTotal}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Experience Perks</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABLE_PERKS.map((perk) => {
                  const isSelected = selectedAddOns.some((a) => a.id === perk.id);
                  return (
                    <div
                      key={perk.id}
                      onClick={() => toggleAddOn(perk)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-sm'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-mono font-bold text-white">{perk.title}</span>
                        <span className="text-xs font-mono font-bold text-indigo-400">+${perk.price}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{perk.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Subtotal</span>
                <span className="text-xl font-mono font-bold text-white">${subtotal}</span>
              </div>
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl font-mono font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Attendee Form Validation */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-400">Attendee Contact Info</h3>

            <div className="space-y-3 font-mono">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 text-white border rounded-xl border-slate-800 focus:border-indigo-500 outline-none"
                  />
                </div>
                {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Email Address (For Pass) *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.doe@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 text-white border rounded-xl border-slate-800 focus:border-indigo-500 outline-none"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Your SRHU Department / School *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-indigo-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={attendeeDepartment}
                    onChange={(e) => setAttendeeDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 text-white border rounded-xl border-slate-800 focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    {SRHU_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-slate-900 text-white">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.attendeeDepartment && <p className="text-[11px] text-amber-400 mt-1 font-semibold">{errors.attendeeDepartment}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 text-white border rounded-xl border-slate-800 focus:border-indigo-500 outline-none"
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl font-mono text-xs border border-slate-800 text-slate-400 hover:bg-slate-800 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="px-6 py-3 rounded-xl font-mono font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <span>PROCEED</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment & Order Finalization */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-400">Order Summary & Confirmation</h3>

            {/* Promo Code Input */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Promo Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="EARLYBIRD10"
                    className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-900 border rounded-lg border-slate-800 text-white outline-none"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-indigo-400 hover:bg-slate-700"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className={`text-[11px] mt-1 font-semibold ${appliedDiscount > 0 ? 'text-indigo-400' : 'text-amber-400'}`}>
                  {promoMessage}
                </p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
              <div className="flex justify-between">
                <span>Seats Subtotal</span>
                <span className="font-bold text-white">${seatsTotal}</span>
              </div>
              {selectedAddOns.length > 0 && (
                <div className="flex justify-between">
                  <span>Add-Ons ({selectedAddOns.length})</span>
                  <span className="font-bold text-white">${addOnsTotal}</span>
                </div>
              )}
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-indigo-400 font-bold">
                  <span>Discount ({appliedDiscount * 100}%)</span>
                  <span>-${discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Due</span>
                <span className="text-lg text-indigo-400">${finalTotal}</span>
              </div>
            </div>

            {serverError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl font-mono">
                ⚠️ {serverError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl font-mono text-xs border border-slate-800 text-slate-400 hover:bg-slate-800 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                id="btn-confirm-pay"
                disabled={isSubmitting}
                onClick={handleSubmitOrder}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono font-bold text-xs transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2 active:scale-95"
              >
                {isSubmitting ? (
                  <span>Locking Seats & Generating Ticket...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>CONFIRM BOOKING (${finalTotal})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
