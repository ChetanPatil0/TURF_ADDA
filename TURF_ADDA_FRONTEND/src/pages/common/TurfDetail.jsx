

// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getTurfById, getAvailableSlots } from '../../api/turfApi';
// import Loader from '../../components/common/Loader';
// import {
//   RiMapPinLine,
//   RiStarFill,
//   RiStarHalfFill,
//   RiStarLine,
//   RiTimeLine,
//   RiShieldCheckLine,
//   RiParkingBoxLine,
//   RiWaterFlashLine,
//   RiLightbulbLine,
//   RiWifiLine,
//   RiChatCheckLine,
//   RiArrowLeftLine,
//   RiArrowLeftSLine,
//   RiArrowRightSLine,
//   RiErrorWarningLine,
//   RiGroupLine,
//   RiCheckLine,
//   RiCalendarLine,
//   RiNavigationLine,
//   RiCloseLine,
//   RiCheckboxCircleLine,
//   RiWallet3Line,
// } from 'react-icons/ri';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { formatRupee, formatTime, capitalize } from '../../utils';
// import { BASE_URL_MEDIA } from '../../const';

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// });

// /* ─── Global CSS ─────────────────────────────────────────────────────────── */
// const CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

//   .td-root { font-family: 'Plus Jakarta Sans', sans-serif; }

//   @keyframes td-up     { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
//   @keyframes td-shimmer{ 0%{background-position:-400px 0} 100%{background-position:400px 0} }
//   @keyframes td-pop    { 0%{transform:scale(.88);opacity:0} 100%{transform:scale(1);opacity:1} }

//   .td-up { animation: td-up .42s cubic-bezier(.22,1,.36,1) both; }
//   .td-s1 { animation-delay:.06s } .td-s2 { animation-delay:.12s }
//   .td-s3 { animation-delay:.18s } .td-s4 { animation-delay:.24s }

//   .td-shimmer {
//     background: linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%);
//     background-size: 400px 100%;
//     animation: td-shimmer 1.4s infinite;
//     border-radius: 8px;
//   }

//   /* slot button */
//   .td-slot {
//     transition: all .13s ease;
//     user-select: none;
//     animation: td-pop .2s cubic-bezier(.34,1.56,.64,1) both;
//   }
//   .td-slot:active { transform: scale(.93); }

//   /* Book CTA */
//   .td-cta { transition: all .18s ease; }
//   .td-cta:not(:disabled):hover  { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,.3); }
//   .td-cta:not(:disabled):active { transform: translateY(0); }

//   /* Directions */
//   .td-dir { transition: all .18s ease; }
//   .td-dir:hover  { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(22,163,74,.28); }
//   .td-dir:active { transform: translateY(0); }

//   /* date nav */
//   .td-dnav { transition: background .13s ease; border-radius: 8px; }
//   .td-dnav:not(:disabled):hover { background: #f1f5f9; }
//   .td-dnav:disabled { opacity: .35; cursor: not-allowed; }

//   /* Hide native calendar icon, keep clickable */
//   input[type="date"]::-webkit-calendar-picker-indicator {
//     opacity: 0; position: absolute; inset: 0; width: 100%; cursor: pointer;
//   }
//   input[type="date"] { color-scheme: light; }

//   /* selected slot chip */
//   .td-chip {
//     display: inline-flex; align-items: center; gap: 4px;
//     background: #dcfce7; color: #166534;
//     font-size: 11px; font-weight: 600;
//     padding: 3px 8px 3px 10px; border-radius: 999px;
//     border: 1px solid #bbf7d0;
//     animation: td-pop .18s ease both;
//   }
//   .td-chip-x {
//     display: flex; align-items: center; justify-content: center;
//     width: 14px; height: 14px; border-radius: 50%;
//     background: #16a34a22; cursor: pointer; transition: background .13s;
//   }
//   .td-chip-x:hover { background: #16a34a44; }
// `;

// /* ─── Date helpers ───────────────────────────────────────────────────────── */
// const toDateStr = (d) => d.toISOString().split('T')[0];
// const todayStr  = ()  => toDateStr(new Date());

// function shiftDate(s, n) {
//   const d = new Date(s);
//   d.setDate(d.getDate() + n);
//   return toDateStr(d);
// }

// function prettyDate(s) {
//   const t = todayStr();
//   if (s === t)              return 'Today';
//   if (s === shiftDate(t,1)) return 'Tomorrow';
//   return new Date(s).toLocaleDateString('en-IN', {
//     weekday: 'short', day: 'numeric', month: 'short',
//   });
// }

// function longDate(s) {
//   return new Date(s).toLocaleDateString('en-IN', {
//     day: 'numeric', month: 'short', year: 'numeric',
//   });
// }

// /* ─── Slot helpers ───────────────────────────────────────────────────────── */
// function normaliseSlots(r) {
//   if (r?.data?.slots && Array.isArray(r.data.slots)) return r.data.slots;
//   if (Array.isArray(r))                 return r;
//   if (Array.isArray(r?.slots))          return r.slots;
//   if (Array.isArray(r?.availableSlots)) return r.availableSlots;
//   if (Array.isArray(r?.data))           return r.data;
//   return [];
// }
// const slotStart = (s) => (typeof s === 'string' ? s : s?.startTime ?? '');
// const slotEnd   = (s) => (typeof s === 'string' ? '' : s?.endTime  ?? '');
// const slotId    = (s) => (typeof s === 'string' ? s : s?._id ?? s?.id ?? s?.startTime ?? '');
// const slotPrice = (s) => (typeof s === 'object' && s?.price != null ? s.price : null);
// const isValid   = (s) => (typeof s === 'string' ? /^\d{1,2}:\d{2}/.test(s) : !!s?.startTime);

// /* ─── StarRating ─────────────────────────────────────────────────────────── */
// const StarRating = ({ rating = 0 }) => {
//   const full = Math.floor(rating), half = rating % 1 >= .5 ? 1 : 0, empty = 5 - full - half;
//   return (
//     <div className="flex items-center gap-0.5">
//       {[...Array(full)].map((_,i)  => <RiStarFill     key={`f${i}`} className="text-amber-400 text-sm" />)}
//       {half === 1                   && <RiStarHalfFill              className="text-amber-400 text-sm" />}
//       {[...Array(empty)].map((_,i) => <RiStarLine      key={`e${i}`} className="text-gray-300 text-sm" />)}
//       <span className="ml-1 text-xs font-semibold text-gray-500">{rating.toFixed(1)}</span>
//     </div>
//   );
// };

// /* ─── AmenityItem ────────────────────────────────────────────────────────── */
// const AMEN_ICONS = {
//   parking:        <RiParkingBoxLine />,
//   seating:        <RiGroupLine />,
//   drinking_water: <RiWaterFlashLine />,
//   lighting:       <RiLightbulbLine />,
//   wifi:           <RiWifiLine />,
//   scoreboard:     <RiChatCheckLine />,
// };
// const AmenityItem = ({ name }) => (
//   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100 hover:bg-green-100 transition-colors cursor-default">
//     <span className="text-sm">{AMEN_ICONS[name] ?? <RiCheckLine />}</span>
//     <span className="capitalize">{name.replace(/_/g, ' ')}</span>
//   </div>
// );

// /* ─── ImageSlider ────────────────────────────────────────────────────────── */
// const ImageSlider = ({ images = [] }) => {
//   const [idx, setIdx] = useState(0);
//   const timer = useRef(null);

//   const go = useCallback((d) =>
//     setIdx(p => { const n = p + d; if (n < 0) return images.length - 1; if (n >= images.length) return 0; return n; }),
//     [images.length]);

//   useEffect(() => {
//     if (images.length <= 1) return;
//     timer.current = setInterval(() => go(1), 5000);
//     return () => clearInterval(timer.current);
//   }, [images.length, go]);

//   if (!images.length) return (
//     <div className="w-full h-64 sm:h-80 md:h-[420px] bg-gray-100 flex items-center justify-center">
//       <span className="text-gray-400 text-sm">No images available</span>
//     </div>
//   );

//   return (
//     <div className="relative w-full h-64 sm:h-80 md:h-[420px] overflow-hidden">
//       {images.map((img, i) => (
//         <img key={i} src={`${BASE_URL_MEDIA}${img}`} alt={`Photo ${i+1}`}
//           className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
//         />
//       ))}
//       <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

//       {images.length > 1 && (
//         <>
//           <button onClick={() => go(-1)} aria-label="Prev"
//             className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition hover:scale-105">
//             <RiArrowLeftSLine size={20} />
//           </button>
//           <button onClick={() => go(1)} aria-label="Next"
//             className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition hover:scale-105">
//             <RiArrowRightSLine size={20} />
//           </button>
//           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 items-center">
//             {images.map((_, i) => (
//               <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i+1}`}
//                 className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-5 bg-green-400' : 'w-1.5 bg-white/60 hover:bg-white/90'}`}
//               />
//             ))}
//           </div>
//           <span className="absolute bottom-4 right-4 z-10 text-white/70 text-[11px] font-medium tabular-nums">
//             {idx + 1}/{images.length}
//           </span>
//         </>
//       )}
//     </div>
//   );
// };

// /* ─── SlotSkeleton ───────────────────────────────────────────────────────── */
// const SlotSkeleton = () => (
//   <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
//     {[...Array(16)].map((_, i) => (
//       <div key={i} className="td-shimmer h-[52px]" style={{ animationDelay: `${i * 0.04}s` }} />
//     ))}
//   </div>
// );

// /* ═══════════════════════════════════════════════════════════════════════════
//    TurfDetail
// ═══════════════════════════════════════════════════════════════════════════ */
// export default function TurfDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [turf,         setTurf]         = useState(null);
//   const [slots,        setSlots]        = useState([]);
//   const [selectedSlots,setSelectedSlots]= useState([]);   // multi-select
//   const [loading,      setLoading]      = useState(true);
//   const [slotsLoading, setSlotsLoading] = useState(false);
//   const [slotsError,   setSlotsError]   = useState(false);
//   const [pageError,    setPageError]    = useState(null);
//   const [selectedDate, setSelectedDate] = useState(todayStr());

//   const MIN_DATE = todayStr();
//   const MAX_DATE = shiftDate(MIN_DATE, 30);

//   /* ── Fetch turf ── */
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true); setPageError(null);
//         const res  = await getTurfById(id);
//         const data = res?.data?.turf ?? res?.turf ?? null;
//         if (alive) setTurf(data);
//       } catch (e) {
//         if (alive) setPageError(e?.message ?? 'Failed to load turf');
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [id]);

//   /* ── Fetch slots when date changes ── */
//   useEffect(() => {
//     if (!turf) return;
//     let alive = true;
//     (async () => {
//       setSlotsLoading(true); setSlotsError(false);
//       setSlots([]); setSelectedSlots([]);
//       try {
//         const sr = await getAvailableSlots(id, selectedDate);
//         if (alive) setSlots(normaliseSlots(sr).filter(isValid));
//       } catch {
//         if (alive) setSlotsError(true);
//       } finally {
//         if (alive) setSlotsLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [id, turf, selectedDate]);

//   /* ── Multi-slot toggle ── */
//   const toggleSlot = useCallback((slot) => {
//     const sid = slotId(slot);
//     setSelectedSlots(prev => {
//       const exists = prev.some(s => slotId(s) === sid);
//       return exists ? prev.filter(s => slotId(s) !== sid) : [...prev, slot];
//     });
//   }, []);

//   const isSelected = useCallback((slot) =>
//     selectedSlots.some(s => slotId(s) === slotId(slot)),
//     [selectedSlots]);

//   /* ── Date nav ── */
//   const prevDate = () => { const p = shiftDate(selectedDate, -1); if (p >= MIN_DATE) setSelectedDate(p); };
//   const nextDate = () => { const n = shiftDate(selectedDate,  1); if (n <= MAX_DATE) setSelectedDate(n); };

//   /* ── Book ── */
//   const handleBook = () => {
//     if (!selectedSlots.length) return;
//     const sorted = [...selectedSlots].sort((a, b) => slotStart(a).localeCompare(slotStart(b)));
//     const starts = sorted.map(s => encodeURIComponent(slotStart(s))).join(',');
//     navigate(`/book/${id}?slots=${starts}&date=${selectedDate}`);
//   };

//   /* ── Total price ── */
//   const totalPrice = selectedSlots.reduce((sum, s) => sum + (slotPrice(s) ?? 0), 0);

//   /* ── Sorted selected for display ── */
//   const sortedSel = [...selectedSlots].sort((a, b) => slotStart(a).localeCompare(slotStart(b)));

//   /* ── Book button label ── */
//   const bookLabel = selectedSlots.length === 0
//     ? 'Select slots to book'
//     : selectedSlots.length === 1
//       ? `Book ${formatTime(slotStart(selectedSlots[0]))}–${formatTime(slotEnd(selectedSlots[0]))}`
//       : `Book ${selectedSlots.length} slots`;

//   /* ── States ── */
//   if (loading) return (
//     <div className="min-h-screen grid place-items-center bg-gray-50"><Loader /></div>
//   );

//   if (pageError || !turf) return (
//     <div className="min-h-screen grid place-items-center px-5 text-center bg-gray-50">
//       <div className="td-up">
//         <RiErrorWarningLine className="text-red-400 text-6xl mb-4 mx-auto" />
//         <h2 className="text-xl font-bold mb-2 text-gray-900">Something went wrong</h2>
//         <p className="text-gray-500 text-sm mb-7 max-w-sm mx-auto">{pageError ?? "We couldn't load this turf."}</p>
//         <button onClick={() => navigate(-1)}
//           className="td-cta inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition">
//           <RiArrowLeftLine size={15} /> Go Back
//         </button>
//       </div>
//     </div>
//   );

//   /* ── Destructure ── */
//   const {
//     name, images = [], coverImage, location = {},
//     openingTime, closingTime, pricePerSlot,
//     sports = [], amenities = [],
//     surfaceType, size, isVerified, description,
//     slotDurationMinutes = 60, averageRating = 0, reviewCount = 0,
//   } = turf;

//   const sliderImages = coverImage
//     ? [coverImage, ...images.filter(i => i !== coverImage)]
//     : images;

//   const pos = location.latitude && location.longitude
//     ? [parseFloat(location.latitude), parseFloat(location.longitude)]
//     : null;

//   const fullAddress = [location.address, location.area, location.city, location.state, location.pincode]
//     .filter(Boolean).join(', ');

//   const cityState   = [location.city, location.state].filter(Boolean).join(', ');

//   const googleMapsUrl = pos
//     ? `https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`
//     : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || name)}`;

//   /* ── Render ── */
//   return (
//     <>
//       <style>{CSS}</style>
//       <div className="td-root bg-gray-50 min-h-screen pb-16">

//         {/* ══ Hero ══ */}
//         <div className="relative">
//           <button onClick={() => navigate(-1)} aria-label="Go back"
//             className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105">
//             <RiArrowLeftLine size={19} />
//           </button>
//           <ImageSlider images={sliderImages} />
//         </div>

//         {/* ══ Content — full width ══ */}
//         <main className="w-full px-4 sm:px-6 lg:px-10 -mt-6 relative z-10 space-y-4">

//           {/* ── Identity card ── */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 td-up">
//             <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

//               <div className="flex-1 min-w-0">
//                 {/* Name + badge */}
//                 <div className="flex items-start gap-2.5 flex-wrap">
//                   <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{name}</h1>
//                   {isVerified && (
//                     <span className="mt-1 inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap">
//                       <RiShieldCheckLine className="text-green-500" /> VERIFIED
//                     </span>
//                   )}
//                 </div>

//                 {/* City, State */}
//                 {cityState && (
//                   <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-600">
//                     <RiMapPinLine className="text-green-500 text-base flex-shrink-0" />
//                     {cityState}
//                   </div>
//                 )}

//                 {/* Stars + reviews + area */}
//                 <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
//                   <StarRating rating={averageRating} />
//                   {reviewCount > 0 && (
//                     <span className="text-xs text-gray-400">{reviewCount} review{reviewCount !== 1 && 's'}</span>
//                   )}
//                   {location.area && location.area !== location.city && (
//                     <>
//                       <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
//                       <span className="text-xs text-gray-400">{location.area}</span>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Price pill */}
//               <div className="flex-shrink-0 bg-green-50 border border-green-100 rounded-2xl px-5 py-3.5 text-center sm:text-right">
//                 <div className="text-3xl font-extrabold text-green-600 leading-none tabular-nums">
//                   {formatRupee(pricePerSlot)}
//                 </div>
//                 <div className="text-xs text-green-500 mt-1 font-medium">per {slotDurationMinutes} min</div>
//               </div>
//             </div>
//           </div>

//           {/* ── Slot Booking card ── */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 td-up td-s1">

//             {/* ── Row 1: Title + compact date picker ── */}
//             <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">

//               {/* Title */}
//               <div className="flex items-center gap-2">
//                 <span className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
//                   <RiCalendarLine className="text-green-600 text-base" />
//                 </span>
//                 <h2 className="text-base font-bold text-gray-900">Book Slots</h2>
//                 {/* Hint: multi-select */}
//                 <span className="hidden sm:inline text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
//                   Select one or more
//                 </span>
//               </div>

//               {/* Compact date picker — prev | date chip | next */}
//               <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5">
//                 {/* Prev */}
//                 <button onClick={prevDate} disabled={selectedDate <= MIN_DATE}
//                   aria-label="Previous day"
//                   className="td-dnav w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800">
//                   <RiArrowLeftSLine size={17} />
//                 </button>

//                 {/* Date display — clickable, opens native picker */}
//                 <div className="relative flex items-center gap-1.5 px-1 cursor-pointer">
//                   <RiCalendarLine className="text-green-500 text-xs flex-shrink-0" />
//                   <span className="text-xs font-bold text-gray-800 whitespace-nowrap">
//                     {prettyDate(selectedDate)}
//                   </span>
//                   <span className="text-[10px] text-gray-400 whitespace-nowrap hidden sm:inline">
//                     · {longDate(selectedDate)}
//                   </span>
//                   {/* Invisible native input on top */}
//                   <input
//                     type="date"
//                     value={selectedDate}
//                     min={MIN_DATE}
//                     max={MAX_DATE}
//                     onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
//                     className="absolute inset-0 opacity-0 w-full cursor-pointer"
//                     aria-label="Pick date"
//                   />
//                 </div>

//                 {/* Next */}
//                 <button onClick={nextDate} disabled={selectedDate >= MAX_DATE}
//                   aria-label="Next day"
//                   className="td-dnav w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800">
//                   <RiArrowRightSLine size={17} />
//                 </button>
//               </div>
//             </div>

//             {/* Open hours line */}
//             <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3">
//               <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
//               Open {formatTime(openingTime)} – {formatTime(closingTime)}
//               <span className="mx-1 text-gray-200">|</span>
//               <span>{slotDurationMinutes} min per slot</span>
//             </div>

//             {/* ── Slot grid ── */}
//             {slotsLoading ? (
//               <SlotSkeleton />
//             ) : slotsError ? (
//               <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
//                 <RiErrorWarningLine className="text-red-400 text-2xl mx-auto mb-1.5" />
//                 <p className="text-red-700 text-sm font-semibold">Couldn't load slots</p>
//                 <p className="text-red-400 text-xs mt-0.5">Please refresh and try again.</p>
//               </div>
//             ) : slots.length === 0 ? (
//               <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
//                 <RiTimeLine className="text-amber-400 text-2xl mx-auto mb-1.5" />
//                 <p className="text-amber-800 text-sm font-semibold">No slots available</p>
//                 <p className="text-amber-600 text-xs mt-0.5">Try a different date.</p>
//               </div>
//             ) : (
//               <div className="space-y-3.5">

//                 {/* Grid of compact slot buttons */}
//                 <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
//                   {slots.map((slot, i) => {
//                     const sid   = slotId(slot);
//                     const start = slotStart(slot);
//                     const end   = slotEnd(slot);
//                     const price = slotPrice(slot);
//                     const active = isSelected(slot);

//                     return (
//                       <button key={sid} onClick={() => toggleSlot(slot)}
//                         style={{ animationDelay: `${i * 0.025}s` }}
//                         className={`td-slot relative flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center gap-0.5
//                           ${active
//                             ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-200'
//                             : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700'
//                           }`}
//                       >
//                         {/* Checkmark badge when active */}
//                         {active && (
//                           <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
//                             <RiCheckboxCircleLine className="text-green-600 text-xs" />
//                           </span>
//                         )}

//                         <span className="text-[11px] font-bold leading-none tabular-nums">
//                           {formatTime(start)}
//                         </span>
//                         {end && (
//                           <span className={`text-[9px] leading-none mt-0.5 tabular-nums ${active ? 'text-green-200' : 'text-gray-400'}`}>
//                             {formatTime(end)}
//                           </span>
//                         )}
//                         {price != null && (
//                           <span className={`text-[9px] font-bold mt-0.5 ${active ? 'text-green-100' : 'text-green-600'}`}>
//                             ₹{price}
//                           </span>
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {/* ── Selected slot chips + summary ── */}
//                 {selectedSlots.length > 0 && (
//                   <div className="bg-green-50 border border-green-100 rounded-xl p-3 space-y-2.5">

//                     {/* Chips row */}
//                     <div className="flex flex-wrap gap-1.5 items-center">
//                       <span className="text-[11px] font-semibold text-green-700 mr-1">Selected:</span>
//                       {sortedSel.map(slot => (
//                         <span key={slotId(slot)} className="td-chip">
//                           {formatTime(slotStart(slot))}–{formatTime(slotEnd(slot))}
//                           <button onClick={() => toggleSlot(slot)} aria-label="Remove slot" className="td-chip-x">
//                             <RiCloseLine size={10} />
//                           </button>
//                         </span>
//                       ))}
//                       <button onClick={() => setSelectedSlots([])}
//                         className="text-[10px] text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 hover:border-gray-300 transition ml-auto">
//                         Clear all
//                       </button>
//                     </div>

//                     {/* Summary row: count + total */}
//                     <div className="flex items-center justify-between text-xs pt-1 border-t border-green-200">
//                       <span className="text-green-700 font-medium flex items-center gap-1">
//                         <RiCheckboxCircleLine />
//                         {selectedSlots.length} slot{selectedSlots.length > 1 && 's'} · {selectedSlots.length * slotDurationMinutes} min
//                       </span>
//                       {totalPrice > 0 && (
//                         <span className="font-extrabold text-green-700 flex items-center gap-1">
//                           <RiWallet3Line />
//                           Total: {formatRupee(totalPrice)}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* ── Book CTA ── */}
//                 <button disabled={!selectedSlots.length} onClick={handleBook}
//                   className={`td-cta w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
//                     selectedSlots.length
//                       ? 'bg-green-600 text-white hover:bg-green-700'
//                       : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                   }`}>
//                   {selectedSlots.length > 0 && <RiCalendarLine className="text-base" />}
//                   {bookLabel}
//                   {selectedSlots.length > 0 && <span>→</span>}
//                 </button>

//               </div>
//             )}
//           </div>

//           {/* ── About ── */}
//           {description && (
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 td-up td-s2">
//               <h2 className="text-base font-bold text-gray-900 mb-3">About</h2>
//               <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{description}</p>
//             </div>
//           )}

//           {/* ── Details + Amenities ── */}
//           <div className="grid md:grid-cols-2 gap-4 td-up td-s3">

//             {/* Details */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
//               <h2 className="text-base font-bold text-gray-900 mb-4">Details</h2>
//               <dl className="divide-y divide-gray-50">
//                 {[
//                   ['Surface',  capitalize(surfaceType?.replace(/_/g, ' ') ?? '—')],
//                   ['Size',     size ?? '—'],
//                   ['Duration', `${slotDurationMinutes} min / slot`],
//                   ['Hours',    `${formatTime(openingTime)} – ${formatTime(closingTime)}`],
//                 ].map(([l, v]) => (
//                   <div key={l} className="flex justify-between items-center py-2.5 gap-4">
//                     <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400 flex-shrink-0">{l}</dt>
//                     <dd className="text-sm text-gray-700 text-right font-medium">{v}</dd>
//                   </div>
//                 ))}
//                 {fullAddress && (
//                   <div className="flex justify-between items-start py-2.5 gap-4">
//                     <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400 flex-shrink-0">Address</dt>
//                     <dd className="text-xs text-gray-600 text-right">{fullAddress}</dd>
//                   </div>
//                 )}
//               </dl>

//               {sports.length > 0 && (
//                 <div className="mt-4 pt-4 border-t border-gray-50">
//                   <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2.5">Sports</p>
//                   <div className="flex flex-wrap gap-1.5">
//                     {sports.map(s => (
//                       <span key={s} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
//                         {capitalize(s)}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Amenities */}
//             {amenities.length > 0 && (
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
//                 <h2 className="text-base font-bold text-gray-900 mb-4">Amenities</h2>
//                 <div className="flex flex-wrap gap-2">
//                   {amenities.map(a => <AmenityItem key={a} name={a} />)}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ── Map + Directions ── */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden td-up td-s4">

//             <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
//               <div className="flex items-center gap-2">
//                 <RiMapPinLine className="text-green-500 text-lg flex-shrink-0" />
//                 <h2 className="text-base font-bold text-gray-900">Location</h2>
//               </div>
//               <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
//                 className="td-dir inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
//                 <RiNavigationLine className="text-sm" />
//                 Get Directions
//               </a>
//             </div>

//             <div style={{ height: 280 }} className="border-t border-gray-100">
//               {pos ? (
//                 <MapContainer center={pos} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} tabIndex={-1}>
//                   <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//                   />
//                   <Marker position={pos}>
//                     <Popup>{name}<br /><small>{fullAddress}</small></Popup>
//                   </Marker>
//                 </MapContainer>
//               ) : (
//                 <div className="h-full flex items-center justify-center text-gray-400 text-sm">Map unavailable</div>
//               )}
//             </div>

//             {fullAddress && (
//               <div className="px-5 py-3 border-t border-gray-50">
//                 <p className="text-xs text-gray-500 flex items-start gap-1.5">
//                   <RiMapPinLine className="text-green-400 flex-shrink-0 mt-0.5" />
//                   {fullAddress}
//                 </p>
//               </div>
//             )}
//           </div>

//         </main>
//       </div>
//     </>
//   );
// }

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTurfById, getAvailableSlots } from '../../api/turfApi';
import Loader from '../../components/common/Loader';
import {
  RiMapPinLine,
  RiStarFill,
  RiStarHalfFill,
  RiStarLine,
  RiTimeLine,
  RiShieldCheckLine,
  RiParkingBoxLine,
  RiWaterFlashLine,
  RiLightbulbLine,
  RiWifiLine,
  RiChatCheckLine,
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiErrorWarningLine,
  RiGroupLine,
  RiCheckLine,
  RiCalendarLine,
  RiNavigationLine,
  RiCloseLine,
  RiCheckboxCircleLine,
  RiWallet3Line,
} from 'react-icons/ri';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatRupee, formatTime, capitalize } from '../../utils';
import { BASE_URL_MEDIA } from '../../const';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .td-root { font-family: 'Plus Jakarta Sans', sans-serif; }

  @keyframes td-up     { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes td-shimmer{ 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes td-pop    { 0%{transform:scale(.88);opacity:0} 100%{transform:scale(1);opacity:1} }

  .td-up { animation: td-up .42s cubic-bezier(.22,1,.36,1) both; }
  .td-s1 { animation-delay:.06s } .td-s2 { animation-delay:.12s }
  .td-s3 { animation-delay:.18s } .td-s4 { animation-delay:.24s }

  .td-shimmer {
    background: linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%);
    background-size: 400px 100%;
    animation: td-shimmer 1.4s infinite;
    border-radius: 8px;
  }

  /* slot button */
  .td-slot {
    transition: all .13s ease;
    user-select: none;
    animation: td-pop .2s cubic-bezier(.34,1.56,.64,1) both;
  }
  .td-slot:active { transform: scale(.93); }

  /* Book CTA */
  .td-cta { transition: all .18s ease; }
  .td-cta:not(:disabled):hover  { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,.3); }
  .td-cta:not(:disabled):active { transform: translateY(0); }

  /* Directions */
  .td-dir { transition: all .18s ease; }
  .td-dir:hover  { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(22,163,74,.28); }
  .td-dir:active { transform: translateY(0); }

  /* date nav */
  .td-dnav { transition: background .13s ease; border-radius: 8px; }
  .td-dnav:not(:disabled):hover { background: #f1f5f9; }
  .td-dnav:disabled { opacity: .35; cursor: not-allowed; }

  /* Hide native calendar icon, keep clickable */
  input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 0; position: absolute; inset: 0; width: 100%; cursor: pointer;
  }
  input[type="date"] { color-scheme: light; }

  /* selected slot chip */
  .td-chip {
    display: inline-flex; align-items: center; gap: 4px;
    background: #dcfce7; color: #166534;
    font-size: 11px; font-weight: 600;
    padding: 3px 8px 3px 10px; border-radius: 999px;
    border: 1px solid #bbf7d0;
    animation: td-pop .18s ease both;
  }
  .td-chip-x {
    display: flex; align-items: center; justify-content: center;
    width: 14px; height: 14px; border-radius: 50%;
    background: #16a34a22; cursor: pointer; transition: background .13s;
  }
  .td-chip-x:hover { background: #16a34a44; }
`;

/* ─── Date helpers ───────────────────────────────────────────────────────── */
const toDateStr = (d) => d.toISOString().split('T')[0];
const todayStr  = ()  => toDateStr(new Date());

function shiftDate(s, n) {
  const d = new Date(s);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

function prettyDate(s) {
  const t = todayStr();
  if (s === t)              return 'Today';
  if (s === shiftDate(t,1)) return 'Tomorrow';
  return new Date(s).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function longDate(s) {
  return new Date(s).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/* ─── Slot helpers ───────────────────────────────────────────────────────── */
function normaliseSlots(r) {
  if (r?.data?.slots && Array.isArray(r.data.slots)) return r.data.slots;
  if (Array.isArray(r))                 return r;
  if (Array.isArray(r?.slots))          return r.slots;
  if (Array.isArray(r?.availableSlots)) return r.availableSlots;
  if (Array.isArray(r?.data))           return r.data;
  return [];
}
const slotStart = (s) => (typeof s === 'string' ? s : s?.startTime ?? '');
const slotEnd   = (s) => (typeof s === 'string' ? '' : s?.endTime  ?? '');
const slotId    = (s) => (typeof s === 'string' ? s : s?._id ?? s?.id ?? s?.startTime ?? '');
const slotPrice = (s) => (typeof s === 'object' && s?.price != null ? s.price : null);
const isValid   = (s) => (typeof s === 'string' ? /^\d{1,2}:\d{2}/.test(s) : !!s?.startTime);

/* ─── StarRating ─────────────────────────────────────────────────────────── */
const StarRating = ({ rating = 0 }) => {
  const full = Math.floor(rating), half = rating % 1 >= .5 ? 1 : 0, empty = 5 - full - half;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(full)].map((_,i)  => <RiStarFill     key={`f${i}`} className="text-amber-400 text-sm" />)}
      {half === 1                   && <RiStarHalfFill              className="text-amber-400 text-sm" />}
      {[...Array(empty)].map((_,i) => <RiStarLine      key={`e${i}`} className="text-gray-300 text-sm" />)}
      <span className="ml-1 text-xs font-semibold text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
};

/* ─── AmenityItem ────────────────────────────────────────────────────────── */
const AMEN_ICONS = {
  parking:        <RiParkingBoxLine />,
  seating:        <RiGroupLine />,
  drinking_water: <RiWaterFlashLine />,
  lighting:       <RiLightbulbLine />,
  wifi:           <RiWifiLine />,
  scoreboard:     <RiChatCheckLine />,
};
const AmenityItem = ({ name }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100 hover:bg-green-100 transition-colors cursor-default">
    <span className="text-sm">{AMEN_ICONS[name] ?? <RiCheckLine />}</span>
    <span className="capitalize">{name.replace(/_/g, ' ')}</span>
  </div>
);

/* ─── ImageSlider ────────────────────────────────────────────────────────── */
const ImageSlider = ({ images = [] }) => {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  const go = useCallback((d) =>
    setIdx(p => { const n = p + d; if (n < 0) return images.length - 1; if (n >= images.length) return 0; return n; }),
    [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = setInterval(() => go(1), 5000);
    return () => clearInterval(timer.current);
  }, [images.length, go]);

  if (!images.length) return (
    <div className="w-full h-64 sm:h-80 md:h-[420px] bg-gray-100 flex items-center justify-center">
      <span className="text-gray-400 text-sm">No images available</span>
    </div>
  );

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-[420px] overflow-hidden">
      {images.map((img, i) => (
        <img key={i} src={`${BASE_URL_MEDIA}${img}`} alt={`Photo ${i+1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

      {images.length > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Prev"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition hover:scale-105">
            <RiArrowLeftSLine size={20} />
          </button>
          <button onClick={() => go(1)} aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition hover:scale-105">
            <RiArrowRightSLine size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 items-center">
            {images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i+1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-5 bg-green-400' : 'w-1.5 bg-white/60 hover:bg-white/90'}`}
              />
            ))}
          </div>
          <span className="absolute bottom-4 right-4 z-10 text-white/70 text-[11px] font-medium tabular-nums">
            {idx + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
};

/* ─── SlotSkeleton ───────────────────────────────────────────────────────── */
const SlotSkeleton = () => (
  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
    {[...Array(16)].map((_, i) => (
      <div key={i} className="td-shimmer h-[52px]" style={{ animationDelay: `${i * 0.04}s` }} />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   TurfDetail
═══════════════════════════════════════════════════════════════════════════ */
export default function TurfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [turf,         setTurf]         = useState(null);
  const [slots,        setSlots]        = useState([]);
  const [selectedSlots,setSelectedSlots]= useState([]);   // multi-select
  const [loading,      setLoading]      = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError,   setSlotsError]   = useState(false);
  const [pageError,    setPageError]    = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const MIN_DATE = todayStr();
  const MAX_DATE = shiftDate(MIN_DATE, 30);

  /* ── Fetch turf ── */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setPageError(null);
        const res  = await getTurfById(id);
        const data = res?.data?.turf ?? res?.turf ?? null;
        if (alive) setTurf(data);
      } catch (e) {
        if (alive) setPageError(e?.message ?? 'Failed to load turf');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  /* ── Fetch slots when date changes ── */
  useEffect(() => {
    if (!turf) return;
    let alive = true;
    (async () => {
      setSlotsLoading(true); setSlotsError(false);
      setSlots([]); setSelectedSlots([]);
      try {
        const sr = await getAvailableSlots(id, selectedDate);
        if (alive) setSlots(normaliseSlots(sr).filter(isValid));
      } catch {
        if (alive) setSlotsError(true);
      } finally {
        if (alive) setSlotsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, turf, selectedDate]);

  /* ── Multi-slot toggle ── */
  const toggleSlot = useCallback((slot) => {
    const sid = slotId(slot);
    setSelectedSlots(prev => {
      const exists = prev.some(s => slotId(s) === sid);
      return exists ? prev.filter(s => slotId(s) !== sid) : [...prev, slot];
    });
  }, []);

  const isSelected = useCallback((slot) =>
    selectedSlots.some(s => slotId(s) === slotId(slot)),
    [selectedSlots]);

  /* ── Date nav ── */
  const prevDate = () => { const p = shiftDate(selectedDate, -1); if (p >= MIN_DATE) setSelectedDate(p); };
  const nextDate = () => { const n = shiftDate(selectedDate,  1); if (n <= MAX_DATE) setSelectedDate(n); };

  /* ── Book ── */
  const handleBook = () => {
    if (!selectedSlots.length) return;
    const sorted = [...selectedSlots].sort((a, b) => slotStart(a).localeCompare(slotStart(b)));
    const starts = sorted.map(s => encodeURIComponent(slotStart(s))).join(',');
    navigate(`/book/${id}?slots=${starts}&date=${selectedDate}`);
  };

  /* ── Total price ── */
  const totalPrice = selectedSlots.reduce((sum, s) => sum + (slotPrice(s) ?? 0), 0);

  /* ── Sorted selected for display ── */
  const sortedSel = [...selectedSlots].sort((a, b) => slotStart(a).localeCompare(slotStart(b)));

  /* ── Book button label ── */
  const bookLabel = selectedSlots.length === 0
    ? 'Select slots to book'
    : selectedSlots.length === 1
      ? `Book ${formatTime(slotStart(selectedSlots[0]))}–${formatTime(slotEnd(selectedSlots[0]))}`
      : `Book ${selectedSlots.length} slots`;

  /* ── States ── */
  if (loading) return (
    <div className="min-h-screen grid place-items-center bg-gray-50"><Loader /></div>
  );

  if (pageError || !turf) return (
    <div className="min-h-screen grid place-items-center px-5 text-center bg-gray-50">
      <div className="td-up">
        <RiErrorWarningLine className="text-red-400 text-6xl mb-4 mx-auto" />
        <h2 className="text-xl font-bold mb-2 text-gray-900">Something went wrong</h2>
        <p className="text-gray-500 text-sm mb-7 max-w-sm mx-auto">{pageError ?? "We couldn't load this turf."}</p>
        <button onClick={() => navigate(-1)}
          className="td-cta inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition">
          <RiArrowLeftLine size={15} /> Go Back
        </button>
      </div>
    </div>
  );

  /* ── Destructure ── */
  const {
    name, images = [], coverImage, location = {},
    openingTime, closingTime, pricePerSlot,
    sports = [], amenities = [],
    surfaceType, size, isVerified, description,
    slotDurationMinutes = 60, averageRating = 0, reviewCount = 0,
  } = turf;

  const sliderImages = coverImage
    ? [coverImage, ...images.filter(i => i !== coverImage)]
    : images;

  const pos = location.latitude && location.longitude
    ? [parseFloat(location.latitude), parseFloat(location.longitude)]
    : null;

  const fullAddress = [location.address, location.area, location.city, location.state, location.pincode]
    .filter(Boolean).join(', ');

  const cityState   = [location.city, location.state].filter(Boolean).join(', ');

  const googleMapsUrl = pos
    ? `https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || name)}`;

  /* ── Render ── */
  return (
    <>
      <style>{CSS}</style>
      <div className="td-root bg-gray-50 min-h-screen pb-16">

        {/* ══ Hero ══ */}
        <div className="relative">
          <button onClick={() => navigate(-1)} aria-label="Go back"
            className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105">
            <RiArrowLeftLine size={19} />
          </button>
          <ImageSlider images={sliderImages} />
        </div>

        {/* ══ Content — full width ══ */}
        <main className="w-full px-4 sm:px-6 lg:px-10 -mt-6 relative z-10 space-y-4">

          {/* ── Identity card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 td-up">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

              <div className="flex-1 min-w-0">
                {/* Name + badge */}
                <div className="flex items-start gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{name}</h1>
                  {isVerified && (
                    <span className="mt-1 inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap">
                      <RiShieldCheckLine className="text-green-500" /> VERIFIED
                    </span>
                  )}
                </div>

                {/* City, State */}
                {cityState && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                    <RiMapPinLine className="text-green-500 text-base flex-shrink-0" />
                    {cityState}
                  </div>
                )}

                {/* Stars + reviews + area */}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <StarRating rating={averageRating} />
                  {reviewCount > 0 && (
                    <span className="text-xs text-gray-400">{reviewCount} review{reviewCount !== 1 && 's'}</span>
                  )}
                  {location.area && location.area !== location.city && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
                      <span className="text-xs text-gray-400">{location.area}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Price pill */}
              <div className="flex-shrink-0 bg-green-50 border border-green-100 rounded-2xl px-5 py-3.5 text-center sm:text-right">
                <div className="text-3xl font-extrabold text-green-600 leading-none tabular-nums">
                  {formatRupee(pricePerSlot)}
                </div>
                <div className="text-xs text-green-500 mt-1 font-medium">per {slotDurationMinutes} min</div>
              </div>
            </div>
          </div>

          {/* ── Slot Booking card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 td-up td-s1">

            {/* ── Row 1: Title + compact date picker ── */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">

              {/* Title */}
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <RiCalendarLine className="text-green-600 text-base" />
                </span>
                <h2 className="text-base font-bold text-gray-900">Book Slots</h2>
                {/* Hint: multi-select */}
                <span className="hidden sm:inline text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                  Select one or more
                </span>
              </div>

              {/* Compact date picker — prev | date chip | next */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5">
                {/* Prev */}
                <button onClick={prevDate} disabled={selectedDate <= MIN_DATE}
                  aria-label="Previous day"
                  className="td-dnav w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800">
                  <RiArrowLeftSLine size={17} />
                </button>

                {/* Date display — clickable, opens native picker */}
                <div className="relative flex items-center gap-1.5 px-1 cursor-pointer">
                  <RiCalendarLine className="text-green-500 text-xs flex-shrink-0" />
                  <span className="text-xs font-bold text-gray-800 whitespace-nowrap">
                    {prettyDate(selectedDate)}
                  </span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap hidden sm:inline">
                    · {longDate(selectedDate)}
                  </span>
                  {/* Invisible native input on top */}
                  <input
                    type="date"
                    value={selectedDate}
                    min={MIN_DATE}
                    max={MAX_DATE}
                    onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full cursor-pointer"
                    aria-label="Pick date"
                  />
                </div>

                {/* Next */}
                <button onClick={nextDate} disabled={selectedDate >= MAX_DATE}
                  aria-label="Next day"
                  className="td-dnav w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800">
                  <RiArrowRightSLine size={17} />
                </button>
              </div>
            </div>

            {/* Open hours line */}
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
              Open {formatTime(openingTime)} – {formatTime(closingTime)}
              <span className="mx-1 text-gray-200">|</span>
              <span>{slotDurationMinutes} min per slot</span>
            </div>

            {/* ── Slot grid ── */}
            {slotsLoading ? (
              <SlotSkeleton />
            ) : slotsError ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <RiErrorWarningLine className="text-red-400 text-2xl mx-auto mb-1.5" />
                <p className="text-red-700 text-sm font-semibold">Couldn't load slots</p>
                <p className="text-red-400 text-xs mt-0.5">Please refresh and try again.</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                <RiTimeLine className="text-amber-400 text-2xl mx-auto mb-1.5" />
                <p className="text-amber-800 text-sm font-semibold">No slots available</p>
                <p className="text-amber-600 text-xs mt-0.5">Try a different date.</p>
              </div>
            ) : (
              <div className="space-y-3.5">

                {/* Grid of compact slot buttons */}
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
                  {slots.map((slot, i) => {
                    const sid   = slotId(slot);
                    const start = slotStart(slot);
                    const end   = slotEnd(slot);
                    const price = slotPrice(slot);
                    const active = isSelected(slot);

                    return (
                      <button key={sid} onClick={() => toggleSlot(slot)}
                        style={{ animationDelay: `${i * 0.025}s` }}
                        className={`td-slot relative flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center gap-0.5
                          ${active
                            ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-200'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700'
                          }`}
                      >
                        {/* Checkmark badge when active */}
                        {active && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <RiCheckboxCircleLine className="text-green-600 text-xs" />
                          </span>
                        )}

                        <span className="text-[11px] font-bold leading-none tabular-nums">
                          {formatTime(start)}
                        </span>
                        {end && (
                          <span className={`text-[9px] leading-none mt-0.5 tabular-nums ${active ? 'text-green-200' : 'text-gray-400'}`}>
                            {formatTime(end)}
                          </span>
                        )}
                        {price != null && (
                          <span className={`text-[9px] font-bold mt-0.5 ${active ? 'text-green-100' : 'text-green-600'}`}>
                            ₹{price}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* ── Selected slot chips + summary ── */}
                {selectedSlots.length > 0 && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 space-y-2.5">

                    {/* Chips row */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] font-semibold text-green-700 mr-1">Selected:</span>
                      {sortedSel.map(slot => (
                        <span key={slotId(slot)} className="td-chip">
                          {formatTime(slotStart(slot))}–{formatTime(slotEnd(slot))}
                          <button onClick={() => toggleSlot(slot)} aria-label="Remove slot" className="td-chip-x">
                            <RiCloseLine size={10} />
                          </button>
                        </span>
                      ))}
                      <button onClick={() => setSelectedSlots([])}
                        className="text-[10px] text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 hover:border-gray-300 transition ml-auto">
                        Clear all
                      </button>
                    </div>

                    {/* Summary row: count + total */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-green-200">
                      <span className="text-green-700 font-medium flex items-center gap-1">
                        <RiCheckboxCircleLine />
                        {selectedSlots.length} slot{selectedSlots.length > 1 && 's'} · {selectedSlots.length * slotDurationMinutes} min
                      </span>
                      {totalPrice > 0 && (
                        <span className="font-extrabold text-green-700 flex items-center gap-1">
                          <RiWallet3Line />
                          Total: {formatRupee(totalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Book CTA ── */}
                <button disabled={!selectedSlots.length} onClick={handleBook}
                  className={`td-cta w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
                    selectedSlots.length
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}>
                  {selectedSlots.length > 0 && <RiCalendarLine className="text-base" />}
                  {bookLabel}
                  {selectedSlots.length > 0 && <span>→</span>}
                </button>

              </div>
            )}
          </div>

          {/* ── About ── */}
          {description && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 td-up td-s2">
              <h2 className="text-base font-bold text-gray-900 mb-3">About</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          )}

          {/* ── Details + Amenities ── */}
          <div className="grid md:grid-cols-2 gap-4 td-up td-s3">

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Details</h2>
              <dl className="divide-y divide-gray-50">
                {[
                  ['Surface',  capitalize(surfaceType?.replace(/_/g, ' ') ?? '—')],
                  ['Size',     size ?? '—'],
                  ['Duration', `${slotDurationMinutes} min / slot`],
                  ['Hours',    `${formatTime(openingTime)} – ${formatTime(closingTime)}`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center py-2.5 gap-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400 flex-shrink-0">{l}</dt>
                    <dd className="text-sm text-gray-700 text-right font-medium">{v}</dd>
                  </div>
                ))}
                {fullAddress && (
                  <div className="flex justify-between items-start py-2.5 gap-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400 flex-shrink-0">Address</dt>
                    <dd className="text-xs text-gray-600 text-right">{fullAddress}</dd>
                  </div>
                )}
              </dl>

              {sports.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2.5">Sports</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sports.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                        {capitalize(s)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map(a => <AmenityItem key={a} name={a} />)}
                </div>
              </div>
            )}
          </div>

          {/* ── Map + Directions ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden td-up td-s4">

            <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <RiMapPinLine className="text-green-500 text-lg flex-shrink-0" />
                <h2 className="text-base font-bold text-gray-900">Location</h2>
              </div>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="td-dir inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                <RiNavigationLine className="text-sm" />
                Get Directions
              </a>
            </div>

            <div style={{ height: 280 }} className="border-t border-gray-100">
              {pos ? (
                <MapContainer center={pos} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false} tabIndex={-1}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={pos}>
                    <Popup>{name}<br /><small>{fullAddress}</small></Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Map unavailable</div>
              )}
            </div>

            {fullAddress && (
              <div className="px-5 py-3 border-t border-gray-50">
                <p className="text-xs text-gray-500 flex items-start gap-1.5">
                  <RiMapPinLine className="text-green-400 flex-shrink-0 mt-0.5" />
                  {fullAddress}
                </p>
              </div>
            )}
          </div>

        </main>
      </div>
    </>
  );
}