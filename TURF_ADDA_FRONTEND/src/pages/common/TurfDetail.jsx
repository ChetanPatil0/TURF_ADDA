


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

// const StarRating = ({ rating = 0 }) => {
//   const full = Math.floor(rating), half = rating % 1 >= 0.5 ? 1 : 0, empty = 5 - full - half;
//   return (
//     <div className="flex items-center gap-0.5">
//       {[...Array(full)].map((_,i) => <RiStarFill key={`f${i}`} className="text-amber-500 text-sm" />)}
//       {half === 1 && <RiStarHalfFill className="text-amber-500 text-sm" />}
//       {[...Array(empty)].map((_,i) => <RiStarLine key={`e${i}`} className="text-gray-300 text-sm" />)}
//       <span className="ml-1.5 text-xs font-semibold text-gray-600">{rating.toFixed(1)}</span>
//     </div>
//   );
// };

// const AMEN_ICONS = {
//   parking:        <RiParkingBoxLine />,
//   seating:        <RiGroupLine />,
//   drinking_water: <RiWaterFlashLine />,
//   lighting:       <RiLightbulbLine />,
//   wifi:           <RiWifiLine />,
//   scoreboard:     <RiChatCheckLine />,
// };

// const AmenityItem = ({ name }) => (
//   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors">
//     <span className="text-sm">{AMEN_ICONS[name] ?? <RiCheckLine />}</span>
//     <span className="capitalize">{name.replace(/_/g, ' ')}</span>
//   </div>
// );

// const ImageSlider = ({ images = [] }) => {
//   const [idx, setIdx] = useState(0);
//   const timer = useRef(null);

//   const go = useCallback((d) =>
//     setIdx(p => {
//       const n = p + d;
//       if (n < 0) return images.length - 1;
//       if (n >= images.length) return 0;
//       return n;
//     }),
//   [images.length]);

//   useEffect(() => {
//     if (images.length <= 1) return;
//     timer.current = setInterval(() => go(1), 5000);
//     return () => clearInterval(timer.current);
//   }, [images.length, go]);

//   if (!images.length) {
//     return (
//       <div className="w-full h-64 sm:h-80 md:h-[420px] bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
//         No images available
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full h-64 sm:h-80 md:h-[420px] overflow-hidden">
//       {images.map((img, i) => (
//         <img
//           key={i}
//           src={`${BASE_URL_MEDIA}${img}`}
//           alt={`Photo ${i + 1}`}
//           className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
//         />
//       ))}
//       <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

//       {images.length > 1 && (
//         <>
//           <button
//             onClick={() => go(-1)}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
//           >
//             <RiArrowLeftSLine size={22} />
//           </button>
//           <button
//             onClick={() => go(1)}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
//           >
//             <RiArrowRightSLine size={22} />
//           </button>
//           <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
//             {images.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setIdx(i)}
//                 className={`h-2 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/90'}`}
//               />
//             ))}
//           </div>
//           <span className="absolute bottom-5 right-5 z-10 text-white/80 text-xs font-medium">
//             {idx + 1} / {images.length}
//           </span>
//         </>
//       )}
//     </div>
//   );
// };

// const SlotSkeleton = () => (
//   <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
//     {[...Array(16)].map((_, i) => (
//       <div key={i} className="h-14 bg-gray-200 animate-pulse rounded-xl" style={{ animationDelay: `${i * 40}ms` }} />
//     ))}
//   </div>
// );

// export default function TurfDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [turf, setTurf] = useState(null);
//   const [slots, setSlots] = useState([]);
//   const [selectedSlots, setSelectedSlots] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [slotsLoading, setSlotsLoading] = useState(false);
//   const [slotsError, setSlotsError] = useState(false);
//   const [pageError, setPageError] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(todayStr());

//   const MIN_DATE = todayStr();
//   const MAX_DATE = shiftDate(MIN_DATE, 30);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setPageError(null);
//         const res = await getTurfById(id);
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

//   useEffect(() => {
//     if (!turf) return;
//     let alive = true;
//     (async () => {
//       setSlotsLoading(true);
//       setSlotsError(false);
//       setSlots([]);
//       setSelectedSlots([]);
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

//   const toggleSlot = useCallback((slot) => {
//     const sid = slotId(slot);
//     setSelectedSlots(prev => {
//       const exists = prev.some(s => slotId(s) === sid);
//       return exists ? prev.filter(s => slotId(s) !== sid) : [...prev, slot];
//     });
//   }, []);

//   const isSelected = useCallback((slot) =>
//     selectedSlots.some(s => slotId(s) === slotId(slot)),
//   [selectedSlots]);

//   const prevDate = () => {
//     const p = shiftDate(selectedDate, -1);
//     if (p >= MIN_DATE) setSelectedDate(p);
//   };

//   const nextDate = () => {
//     const n = shiftDate(selectedDate, 1);
//     if (n <= MAX_DATE) setSelectedDate(n);
//   };

//   const handleBook = () => {
//     if (!selectedSlots.length) return;
//     const sorted = [...selectedSlots].sort((a, b) => slotStart(a).localeCompare(slotStart(b)));
//     const starts = sorted.map(s => encodeURIComponent(slotStart(s))).join(',');
//     navigate(`/book/${id}?slots=${starts}&date=${selectedDate}`);
//   };

//   const totalPrice = selectedSlots.reduce((sum, s) => sum + (slotPrice(s) ?? 0), 0);
//   const totalMinutes = selectedSlots.length * (turf?.slotDurationMinutes || 60);

//   const sortedSel = [...selectedSlots].sort((a, b) => slotStart(a).localeCompare(slotStart(b)));

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader />
//       </div>
//     );
//   }

//   if (pageError || !turf) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5 text-center">
//         <div>
//           <RiErrorWarningLine className="text-red-500 text-6xl mb-4 mx-auto" />
//           <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
//           <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">{pageError ?? "We couldn't load this turf."}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-900 transition"
//           >
//             <RiArrowLeftLine /> Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const {
//     name,
//     images = [],
//     coverImage,
//     location = {},
//     openingTime,
//     closingTime,
//     pricePerSlot,
//     sports = [],
//     amenities = [],
//     surfaceType,
//     size,
//     isVerified,
//     description,
//     slotDurationMinutes = 60,
//     averageRating = 0,
//     reviewCount = 0,
//   } = turf;

//   const sliderImages = coverImage
//     ? [coverImage, ...images.filter(i => i !== coverImage)]
//     : images;

//   const pos = location.latitude && location.longitude
//     ? [parseFloat(location.latitude), parseFloat(location.longitude)]
//     : null;

//   const fullAddress = [location.address, location.area, location.city, location.state, location.pincode]
//     .filter(Boolean)
//     .join(', ');

//   const cityStateArea = [location.area, location.city, location.state]
//     .filter(Boolean)
//     .join(', ');

//   const googleMapsUrl = pos
//     ? `https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`
//     : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || name)}`;

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20 font-sans">
//       <div className="relative">
//         <button
//           onClick={() => navigate(-1)}
//           className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
//         >
//           <RiArrowLeftLine size={20} />
//         </button>
//         <ImageSlider images={sliderImages} />
//       </div>

//       <main className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-6 max-w-7xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//           <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
//             <div className="flex-1 min-w-0">
//               <div className="flex items-start gap-3 flex-wrap">
//                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
//                 {isVerified && (
//                   <span className="mt-1.5 inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
//                     <RiShieldCheckLine className="text-green-600" /> VERIFIED
//                   </span>
//                 )}
//               </div>

//               {cityStateArea && (
//                 <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 font-medium">
//                   <RiMapPinLine className="text-green-600" />
//                   {cityStateArea}
//                 </div>
//               )}

//               <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
//                 <StarRating rating={averageRating} />
//                 {reviewCount > 0 && (
//                   <span className="text-sm text-gray-500">{reviewCount} review{reviewCount !== 1 && 's'}</span>
//                 )}
//               </div>
//             </div>

//             <div className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-center sm:text-right">
//               <div className="text-3xl font-bold text-gray-800">
//                 {formatRupee(pricePerSlot)}
//               </div>
//               <div className="text-sm text-gray-600 mt-1">per {slotDurationMinutes} min</div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 flex-wrap">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
//                 <RiCalendarLine className="text-green-600" />
//               </div>
//               <h2 className="text-lg font-bold text-gray-900">Book Slots</h2>
//             </div>

//             <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
//               <button
//                 onClick={prevDate}
//                 disabled={selectedDate <= MIN_DATE}
//                 className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 <RiArrowLeftSLine size={18} />
//               </button>

//               <div className="relative flex items-center gap-2 px-2 cursor-pointer">
//                 <RiCalendarLine className="text-green-600 text-sm" />
//                 <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
//                   {prettyDate(selectedDate)}
//                 </span>
//                 <span className="text-xs text-gray-500 hidden sm:inline">
//                   · {longDate(selectedDate)}
//                 </span>
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   min={MIN_DATE}
//                   max={MAX_DATE}
//                   onChange={e => e.target.value && setSelectedDate(e.target.value)}
//                   className="absolute inset-0 opacity-0 cursor-pointer"
//                 />
//               </div>

//               <button
//                 onClick={nextDate}
//                 disabled={selectedDate >= MAX_DATE}
//                 className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 <RiArrowRightSLine size={18} />
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
//             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
//             <span>Open {formatTime(openingTime)} – {formatTime(closingTime)}</span>
//             <span className="text-gray-300 mx-1">|</span>
//             <span>{slotDurationMinutes} min slots</span>
//           </div>

//           {slotsLoading ? (
//             <SlotSkeleton />
//           ) : slotsError ? (
//             <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
//               <RiErrorWarningLine className="text-red-500 text-3xl mx-auto mb-2" />
//               <p className="text-red-700 font-medium">Couldn't load slots</p>
//               <p className="text-red-600 text-sm mt-1">Please try again later</p>
//             </div>
//           ) : slots.length === 0 ? (
//             <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-center">
//               <RiTimeLine className="text-amber-600 text-3xl mx-auto mb-2" />
//               <p className="text-amber-800 font-medium">No slots available</p>
//               <p className="text-amber-700 text-sm mt-1">Try another date</p>
//             </div>
//           ) : (
//             <div className="space-y-5">
            

//               <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
//                 {slots.map((slot, i) => {
//                   const sid = slotId(slot);
//                   const start = slotStart(slot);
//                   const end = slotEnd(slot);
//                   const price = slotPrice(slot);
//                   const active = isSelected(slot);

//                   return (
//                     <button
//                       key={sid}
//                       onClick={() => toggleSlot(slot)}
//                       className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all
//                         ${active
//                           ? 'bg-green-600 border-green-600 text-white shadow-md'
//                           : 'bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50'
//                         }`}
//                     >
//                       {active && (
//                         <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
//                           <RiCheckboxCircleLine className="text-green-600 text-base" />
//                         </span>
//                       )}

//                       <span className="text-sm font-bold tabular-nums">
//                         {formatTime(start)}
//                       </span>
//                       {end && (
//                         <span className={`text-xs mt-1 ${active ? 'text-green-100' : 'text-gray-500'}`}>
//                           {formatTime(end)}
//                         </span>
//                       )}
//                       {price != null && (
//                         <span className={`text-xs font-bold mt-1.5 ${active ? 'text-green-100' : 'text-green-700'}`}>
//                           ₹{price}
//                         </span>
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>

//               {selectedSlots.length === 0 && (
//                 <div className="text-center text-gray-500 text-sm py-6">
//                   Tap time slots to select one or more slot
//                 </div>
//               )}
//                 {selectedSlots.length > 0 && (
//                 <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">


//   <div className="mb-4 pb-3 border-b border-gray-200 flex flex-wrap gap-2">
//                     {sortedSel.map(slot => (
//                       <span
//                         key={slotId(slot)}
//                         className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-xs px-3 py-1 rounded-full border border-gray-300"
//                       >
//                         {formatTime(slotStart(slot))}–{formatTime(slotEnd(slot))}
//                         <button
//                           onClick={() => toggleSlot(slot)}
//                           className="text-gray-500 hover:text-red-600"
//                         >
//                           <RiCloseLine size={14} />
//                         </button>
//                       </span>
//                     ))}
//                   </div>

//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                     <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
//                       <div>
//                         <span className="text-gray-600">Slots:</span>{' '}
//                         <span className="font-semibold text-gray-900">{selectedSlots.length}</span>
//                       </div>
//                       <div>
//                         <span className="text-gray-600">Duration:</span>{' '}
//                         <span className="font-semibold text-gray-900">{totalMinutes} min</span>
//                       </div>
//                       <div>
//                         <span className="text-gray-600">Price:</span>{' '}
//                         <span className="font-bold text-green-700">{formatRupee(totalPrice)}</span>
//                       </div>
//                     </div>

//                     <button
//                       onClick={handleBook}
//                       className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
//                     >
//                       Book Now
//                     </button>
//                   </div>

                
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {description && (
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
//             <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{description}</p>
//           </div>
//         )}

//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-bold text-gray-900 mb-4">Details</h2>
//             <dl className="divide-y divide-gray-100">
//               {[
//                 ['Surface', capitalize(surfaceType?.replace(/_/g, ' ') ?? '—')],
//                 ['Size', size ?? '—'],
//                 ['Duration', `${slotDurationMinutes} min / slot`],
//                 ['Hours', `${formatTime(openingTime)} – ${formatTime(closingTime)}`],
//               ].map(([label, value]) => (
//                 <div key={label} className="flex justify-between py-3">
//                   <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
//                   <dd className="text-sm font-medium text-gray-800">{value}</dd>
//                 </div>
//               ))}
//               {fullAddress && (
//                 <div className="flex justify-between py-3">
//                   <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</dt>
//                   <dd className="text-sm text-gray-700 text-right">{fullAddress}</dd>
//                 </div>
//               )}
//             </dl>

//             {sports.length > 0 && (
//               <div className="mt-6 pt-5 border-t border-gray-100">
//                 <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Sports</p>
//                 <div className="flex flex-wrap gap-2">
//                   {sports.map(s => (
//                     <span
//                       key={s}
//                       className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200"
//                     >
//                       {capitalize(s)}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {amenities.length > 0 && (
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities</h2>
//               <div className="flex flex-wrap gap-2">
//                 {amenities.map(a => <AmenityItem key={a} name={a} />)}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 pt-5 pb-3 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <RiMapPinLine className="text-green-600 text-xl" />
//               <h2 className="text-lg font-bold text-gray-900">Location</h2>
//             </div>
//             <a
//               href={googleMapsUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
//             >
//               <RiNavigationLine />
//               Get Directions
//             </a>
//           </div>

//           <div className="h-72 border-t border-gray-200">
//             {pos ? (
//               <MapContainer center={pos} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
//                 <TileLayer
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                   attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//                 />
//                 <Marker position={pos}>
//                   <Popup>{name}<br /><small>{fullAddress}</small></Popup>
//                 </Marker>
//               </MapContainer>
//             ) : (
//               <div className="h-full flex items-center justify-center text-gray-500 text-sm">
//                 Map unavailable
//               </div>
//             )}
//           </div>

//           {fullAddress && (
//             <div className="px-6 py-4 border-t border-gray-200">
//               <p className="text-sm text-gray-600 flex items-start gap-2">
//                 <RiMapPinLine className="text-green-600 mt-0.5 flex-shrink-0" />
//                 {fullAddress}
//               </p>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }


// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getTurfById, getAvailableSlots, deleteTurf } from '../../api/turfApi';
// import Loader from '../../components/common/Loader';
// import useAuthStore from '../../store/authStore';

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
//   RiPhoneLine,
//   RiMailLine,
//   RiEdit2Line,
//   RiDeleteBinLine,
//   RiUserLine,
// } from 'react-icons/ri';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import {
//   formatRupee,
//   formatTime,
//   capitalize,
//   formatDateDDMMYYYY,
// } from '../../utils';
// import { BASE_URL_MEDIA } from '../../const';
// import { useMessageModal } from '../../context/MessageModalContext';
// import { StarRating } from '../../components/common';
// import MockPaymentModal from '../../components/common/MockPaymentModal';

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// });

// const toDateStr = (d) => d.toISOString().split('T')[0];
// const todayStr = () => toDateStr(new Date());

// function shiftDate(s, n) {
//   const d = new Date(s);
//   d.setDate(d.getDate() + n);
//   return toDateStr(d);
// }

// function prettyDate(s) {
//   const t = todayStr();
//   if (s === t) return 'Today';
//   if (s === shiftDate(t, 1)) return 'Tomorrow';
//   return new Date(s).toLocaleDateString('en-IN', {
//     weekday: 'short',
//     day: 'numeric',
//     month: 'short',
//   });
// }

// function longDate(s) {
//   return new Date(s).toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   });
// }

// function normaliseSlots(r) {
//   if (r?.data?.slots && Array.isArray(r.data.slots)) return r.data.slots;
//   if (Array.isArray(r)) return r;
//   if (Array.isArray(r?.slots)) return r.slots;
//   if (Array.isArray(r?.availableSlots)) return r.availableSlots;
//   if (Array.isArray(r?.data)) return r.data;
//   return [];
// }

// const slotStart = (s) => (typeof s === 'string' ? s : s?.startTime ?? '');
// const slotEnd = (s) => (typeof s === 'string' ? '' : s?.endTime ?? '');
// const slotId = (s) => (typeof s === 'string' ? s : s?._id ?? s?.id ?? s?.startTime ?? '');
// const slotPrice = (s) => (typeof s === 'object' && s?.price != null ? s.price : null);
// const isValid = (s) => (typeof s === 'string' ? /^\d{1,2}:\d{2}/.test(s) : !!s?.startTime);

// const AMEN_ICONS = {
//   parking: <RiParkingBoxLine />,
//   seating: <RiGroupLine />,
//   drinking_water: <RiWaterFlashLine />,
//   lighting: <RiLightbulbLine />,
//   wifi: <RiWifiLine />,
//   scoreboard: <RiChatCheckLine />,
// };

// const AmenityItem = ({ name }) => (
//   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors">
//     <span className="text-sm">{AMEN_ICONS[name] ?? <RiCheckLine />}</span>
//     <span className="capitalize">{name.replace(/_/g, ' ')}</span>
//   </div>
// );

// const ImageSlider = ({ images = [] }) => {
//   const [idx, setIdx] = useState(0);
//   const timer = useRef(null);

//   const go = useCallback(
//     (d) =>
//       setIdx((p) => {
//         const n = p + d;
//         if (n < 0) return images.length - 1;
//         if (n >= images.length) return 0;
//         return n;
//       }),
//     [images.length]
//   );

//   useEffect(() => {
//     if (images.length <= 1) return;
//     timer.current = setInterval(() => go(1), 5000);
//     return () => clearInterval(timer.current);
//   }, [images.length, go]);

//   if (!images.length) {
//     return (
//       <div className="w-full h-64 sm:h-80 md:h-[420px] bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
//         No images available
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full h-64 sm:h-80 md:h-[420px] overflow-hidden">
//       {images.map((img, i) => (
//         <img
//           key={i}
//           src={`${BASE_URL_MEDIA}${img}`}
//           alt={`Photo ${i + 1}`}
//           className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
//         />
//       ))}
//       <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

//       {images.length > 1 && (
//         <>
//           <button
//             onClick={() => go(-1)}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
//           >
//             <RiArrowLeftSLine size={22} />
//           </button>
//           <button
//             onClick={() => go(1)}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
//           >
//             <RiArrowRightSLine size={22} />
//           </button>
//           <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
//             {images.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setIdx(i)}
//                 className={`h-2 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/90'}`}
//               />
//             ))}
//           </div>
//           <span className="absolute bottom-5 right-5 z-10 text-white/80 text-xs font-medium">
//             {idx + 1} / {images.length}
//           </span>
//         </>
//       )}
//     </div>
//   );
// };

// const SlotSkeleton = () => (
//   <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
//     {[...Array(16)].map((_, i) => (
//       <div key={i} className="h-14 bg-gray-200 animate-pulse rounded-xl" style={{ animationDelay: `${i * 40}ms` }} />
//     ))}
//   </div>
// );

// export default function TurfDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuthStore();
//   const { showMessage } = useMessageModal();

//   const [turf, setTurf] = useState(null);
//   const [slots, setSlots] = useState([]);
//   const [selectedSlots, setSelectedSlots] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [slotsLoading, setSlotsLoading] = useState(false);
//   const [slotsError, setSlotsError] = useState(false);
//   const [pageError, setPageError] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(todayStr());

//   const [showMockPayment, setShowMockPayment] = useState(false);
//   const [mockBookingData, setMockBookingData] = useState(null);

//   const MIN_DATE = todayStr();
//   const MAX_DATE = shiftDate(MIN_DATE, 30);

//   const isPlayer = user?.role === 'player';
//   const isOwner = user?.role === 'owner' && user?.id === turf?.owner?.id;
//   const isStaff = user?.role === 'staff';
//   const isAdminOrSuper = user?.role === 'admin' || user?.role === 'superadmin';

//   // Show full booking UI to players and owners
//   const showBookingSection = isPlayer || isOwner;

//   // Allow selection and booking only for players and owners
//   const canSelectAndBook = isPlayer || isOwner;

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setPageError(null);
//         const res = await getTurfById(id);
//         const data = res?.data?.turf ?? res?.turf ?? null;
//         console.log('Fetched turf data:', data);
//         if (alive) setTurf(data);
//       } catch (e) {
//         if (alive) setPageError(e?.message ?? 'Failed to load turf');
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [id]);

//   useEffect(() => {
//     if (!turf || !showBookingSection) return;
//     let alive = true;
//     (async () => {
//       setSlotsLoading(true);
//       setSlotsError(false);
//       setSlots([]);
//       setSelectedSlots([]);
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
//   }, [id, turf, selectedDate, showBookingSection]);

//   const toggleSlot = useCallback((slot) => {
//     if (!canSelectAndBook) return;
//     const sid = slotId(slot);
//     setSelectedSlots(prev => {
//       const exists = prev.some(s => slotId(s) === sid);
//       return exists ? prev.filter(s => slotId(s) !== sid) : [...prev, slot];
//     });
//   }, [canSelectAndBook]);

//   const isSelected = useCallback((slot) =>
//     selectedSlots.some(s => slotId(s) === slotId(slot)),
//   [selectedSlots]);

//   const prevDate = () => {
//     if (!canSelectAndBook) return;
//     const p = shiftDate(selectedDate, -1);
//     if (p >= MIN_DATE) setSelectedDate(p);
//   };

//   const nextDate = () => {
//     if (!canSelectAndBook) return;
//     const n = shiftDate(selectedDate, 1);
//     if (n <= MAX_DATE) setSelectedDate(n);
//   };

//   const handleBook = () => {
//     if (!canSelectAndBook || !selectedSlots.length) return;

//     showMessage({
//       type: 'info',
//       title: 'Confirm Booking',
//       message: `You are about to book ${selectedSlots.length} slot(s) for ${prettyDate(selectedDate)}.\n\nTotal: ${formatRupee(totalPrice)}\nAdvance (demo): ~${formatRupee(Math.ceil(totalPrice * 0.2))}\n\nProceed to payment?`,
//       primaryText: 'Proceed',
//       onPrimary: async () => {
//         try {
//           const sorted = [...selectedSlots].sort((a, b) => slotStart(a).localeCompare(slotStart(b)));
//           const slotIds = selectedSlots.map(slotId);

//           const response = await createBooking({
//             turfId: id,
//             date: selectedDate,
//             slotIds,
//             sport: 'football', // change if needed
//           });

//           if (response.success) {
//             setMockBookingData(response.data.booking);
//             setShowMockPayment(true);
//           } else {
//             showMessage({ type: 'error', message: response.message || 'Failed to reserve' });
//           }
//         } catch (err) {
//           showMessage({ type: 'error', message: err.message || 'Network error' });
//         }
//       },
//       secondaryText: 'Cancel',
//     });
//   };

//   const handleDeleteClick = () => {
//     showMessage({
//       type: 'warning',
//       title: 'Delete Turf',
//       message: 'Are you sure you want to delete this turf? This action cannot be undone.',
//       primaryText: 'Delete',
//       onPrimary: async () => {
//         try {
//           await deleteTurf(turf._id);
//           showMessage({
//             type: 'success',
//             title: 'Success',
//             message: 'Turf has been deleted successfully.',
//             primaryText: 'OK',
//             onPrimary: () => navigate('/owner/turfs'),
//           });
//         } catch (error) {
//           showMessage({
//             type: 'error',
//             title: 'Error',
//             message: 'Failed to delete turf. Please try again.',
//             primaryText: 'OK',
//           });
//           console.error('Delete error:', error);
//         }
//       },
//       secondaryText: 'Cancel',
//       onSecondary: () => {},
//     });
//   };

//   const totalPrice = selectedSlots.reduce((sum, s) => sum + (slotPrice(s) ?? 0), 0);
//   const totalMinutes = selectedSlots.length * (turf?.slotDurationMinutes || 60);

//   const sortedSel = [...selectedSlots].sort((a, b) => slotStart(a).localeCompare(slotStart(b)));

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader />
//       </div>
//     );
//   }

//   if (pageError || !turf) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5 text-center">
//         <div>
//           <RiErrorWarningLine className="text-red-500 text-6xl mb-4 mx-auto" />
//           <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
//           <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">{pageError ?? "We couldn't load this turf."}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-900 transition"
//           >
//             <RiArrowLeftLine /> Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const {
//     name,
//     images = [],
//     coverImage,
//     location = {},
//     openingTime,
//     closingTime,
//     pricePerSlot,
//     sports = [],
//     amenities = [],
//     surfaceType,
//     size,
//     isVerified,
//     description,
//     slotDurationMinutes = 60,
//     averageRating = 0,
//     reviewCount = 0,
//     owner,
//     stats,
//     verification,
//     _id,
//   } = turf;

//   const sliderImages = coverImage
//     ? [coverImage, ...images.filter(i => i !== coverImage)]
//     : images;

//   const pos = location.latitude && location.longitude
//     ? [parseFloat(location.latitude), parseFloat(location.longitude)]
//     : null;

//   const fullAddress = [location.address, location.area, location.city, location.state, location.pincode]
//     .filter(Boolean)
//     .join(', ');

//   const cityStateArea = [location.area, location.city, location.state]
//     .filter(Boolean)
//     .join(', ');

//   const googleMapsUrl = pos
//     ? `https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`
//     : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || name)}`;

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20 font-sans">
//       <div className="relative">
//         <button
//           onClick={() => navigate(-1)}
//           className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
//         >
//           <RiArrowLeftLine size={20} />
//         </button>
//         <ImageSlider images={sliderImages} />
//       </div>

//       <main className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-6 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//           <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
//             <div className="flex-1 min-w-0">
//               <div className="flex items-start gap-3 flex-wrap">
//                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
//                 {isVerified && (
//                   <span className="mt-1.5 inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
//                     <RiShieldCheckLine className="text-green-600" /> VERIFIED
//                   </span>
//                 )}
//               </div>
//               {cityStateArea && (
//                 <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 font-medium">
//                   <RiMapPinLine className="text-green-600" />
//                   {cityStateArea}
//                 </div>
//               )}
//               <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
//                 <StarRating rating={averageRating} />
//                 {reviewCount > 0 && (
//                   <span className="text-sm text-gray-500">{reviewCount} review{reviewCount !== 1 && 's'}</span>
//                 )}
//               </div>
//             </div>
//             <div className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-center sm:text-right">
//               <div className="text-3xl font-bold text-gray-800">
//                 {formatRupee(pricePerSlot)}
//               </div>
//               <div className="text-sm text-gray-600 mt-1">per {slotDurationMinutes} min</div>
//             </div>
//           </div>
//         </div>

//         {/* Management section */}
//         {(isOwner || isAdmin || isStaff) && (
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
//                   <RiUserLine className="text-gray-700 text-xl" />
//                 </div>
//                 <h2 className="text-xl font-semibold text-gray-900">Management</h2>
//               </div>

//               {(isOwner || isAdmin) && (
//                 <div className="flex gap-2.5">
//                   <button
//                     onClick={() => navigate(`/owner/turf/${turf._id}/edit`)}
//                     className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
//                   >
//                     <RiEdit2Line size={16} /> Edit
//                   </button>
//                   <button
//                     onClick={handleDeleteClick}
//                     className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
//                   >
//                     <RiDeleteBinLine size={16} /> Delete
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* ... rest of management UI unchanged ... */}
//           </div>
//         )}

//         {/* Booking section */}
//         {showBookingSection && (
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 flex-wrap">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
//                   <RiCalendarLine className="text-green-600" />
//                 </div>
//                 <h2 className="text-lg font-bold text-gray-900">Book Slots</h2>
//               </div>

//               <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
//                 <button
//                   onClick={prevDate}
//                   disabled={selectedDate <= MIN_DATE}
//                   className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
//                 >
//                   <RiArrowLeftSLine size={18} />
//                 </button>

//                 <div className="relative flex items-center gap-2 px-2 cursor-pointer">
//                   <RiCalendarLine className="text-green-600 text-sm" />
//                   <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
//                     {prettyDate(selectedDate)}
//                   </span>
//                   <span className="text-xs text-gray-500 hidden sm:inline">
//                     · {longDate(selectedDate)}
//                   </span>
//                   <input
//                     type="date"
//                     value={selectedDate}
//                     min={MIN_DATE}
//                     max={MAX_DATE}
//                     onChange={e => e.target.value && setSelectedDate(e.target.value)}
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                   />
//                 </div>

//                 <button
//                   onClick={nextDate}
//                   disabled={selectedDate >= MAX_DATE}
//                   className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
//                 >
//                   <RiArrowRightSLine size={18} />
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
//               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
//               <span>Open {formatTime(openingTime)} – {formatTime(closingTime)}</span>
//               <span className="text-gray-300 mx-1">|</span>
//               <span>{slotDurationMinutes} min slots</span>
//             </div>

//             {slotsLoading ? (
//               <SlotSkeleton />
//             ) : slotsError ? (
//               <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
//                 <RiErrorWarningLine className="text-red-500 text-3xl mx-auto mb-2" />
//                 <p className="text-red-700 font-medium">Couldn't load slots</p>
//                 <p className="text-red-600 text-sm mt-1">Please try again later</p>
//               </div>
//             ) : slots.length === 0 ? (
//               <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-center">
//                 <RiTimeLine className="text-amber-600 text-3xl mx-auto mb-2" />
//                 <p className="text-amber-800 font-medium">No slots available</p>
//                 <p className="text-amber-700 text-sm mt-1">Try another date</p>
//               </div>
//             ) : (
//               <div className="space-y-5">
//                 <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
//                   {slots.map((slot, i) => {
//                     const sid = slotId(slot);
//                     const start = slotStart(slot);
//                     const end = slotEnd(slot);
//                     const price = slotPrice(slot);
//                     const active = isSelected(slot);

//                     return (
//                       <button
//                         key={sid}
//                         onClick={() => toggleSlot(slot)}
//                         disabled={!canSelectAndBook}
//                         className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all
//                           ${active
//                             ? 'bg-green-600 border-green-600 text-white shadow-md'
//                             : canSelectAndBook
//                               ? 'bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50'
//                               : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
//                           }`}
//                       >
//                         {active && (
//                           <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
//                             <RiCheckboxCircleLine className="text-green-600 text-base" />
//                           </span>
//                         )}
//                         <span className="text-sm font-bold tabular-nums">
//                           {formatTime(start)}
//                         </span>
//                         {end && (
//                           <span className={`text-xs mt-1 ${active ? 'text-green-100' : 'text-gray-500'}`}>
//                             {formatTime(end)}
//                           </span>
//                         )}
//                         {price != null && (
//                           <span className={`text-xs font-bold mt-1.5 ${active ? 'text-green-100' : 'text-green-700'}`}>
//                             ₹{price}
//                           </span>
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {selectedSlots.length === 0 && canSelectAndBook && (
//                   <div className="text-center text-gray-500 text-sm py-6">
//                     Tap time slots to select one or more slot
//                   </div>
//                 )}

//                 {selectedSlots.length > 0 && canSelectAndBook && (
//                   <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
//                     <div className="mb-4 pb-3 border-b border-gray-200 flex flex-wrap gap-2">
//                       {sortedSel.map(slot => (
//                         <span
//                           key={slotId(slot)}
//                           className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-xs px-3 py-1 rounded-full border border-gray-300"
//                         >
//                           {formatTime(slotStart(slot))}–{formatTime(slotEnd(slot))}
//                           <button
//                             onClick={() => toggleSlot(slot)}
//                             className="text-gray-500 hover:text-red-600"
//                           >
//                             <RiCloseLine size={14} />
//                           </button>
//                         </span>
//                       ))}
//                     </div>

//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                       <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
//                         <div>
//                           <span className="text-gray-600">Slots:</span>{' '}
//                           <span className="font-semibold text-gray-900">{selectedSlots.length}</span>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Duration:</span>{' '}
//                           <span className="font-semibold text-gray-900">{totalMinutes} min</span>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Price:</span>{' '}
//                           <span className="font-bold text-green-700">{formatRupee(totalPrice)}</span>
//                         </div>
//                       </div>

//                       <button
//                         onClick={handleBook}
//                         className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
//                       >
//                         Book Now
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {description && (
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
//             <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{description}</p>
//           </div>
//         )}

//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-bold text-gray-900 mb-4">Turf Details</h2>
//             <dl className="divide-y divide-gray-100">
//               {[
//                 ['Surface', capitalize(surfaceType?.replace(/_/g, ' ') ?? '—')],
//                 ['Size', size ?? '—'],
//                 ['Duration', `${slotDurationMinutes} min / slot`],
//                 ['Hours', `${formatTime(openingTime)} – ${formatTime(closingTime)}`],
//               ].map(([label, value]) => (
//                 <div key={label} className="flex justify-between py-3">
//                   <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
//                   <dd className="text-sm font-medium text-gray-800">{value}</dd>
//                 </div>
//               ))}
//               {fullAddress && (
//                 <div className="flex justify-between py-3">
//                   <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</dt>
//                   <dd className="text-sm text-gray-700 text-right">{fullAddress}</dd>
//                 </div>
//               )}
//             </dl>

//             {sports.length > 0 && (
//               <div className="mt-6 pt-5 border-t border-gray-100">
//                 <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Sports</p>
//                 <div className="flex flex-wrap gap-2">
//                   {sports.map(s => (
//                     <span
//                       key={s}
//                       className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200"
//                     >
//                       {capitalize(s)}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {amenities.length > 0 && (
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities</h2>
//               <div className="flex flex-wrap gap-2">
//                 {amenities.map(a => <AmenityItem key={a} name={a} />)}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 pt-5 pb-3 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <RiMapPinLine className="text-green-600 text-xl" />
//               <h2 className="text-lg font-bold text-gray-900">Location</h2>
//             </div>
//             <a
//               href={googleMapsUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
//             >
//               <RiNavigationLine />
//               Get Directions
//             </a>
//           </div>

//           <div className="h-72 border-t border-gray-200">
//             {pos ? (
//               <MapContainer center={pos} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
//                 <TileLayer
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                   attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//                 />
//                 <Marker position={pos}>
//                   <Popup>{name}<br /><small>{fullAddress}</small></Popup>
//                 </Marker>
//               </MapContainer>
//             ) : (
//               <div className="h-full flex items-center justify-center text-gray-500 text-sm">
//                 Map unavailable
//               </div>
//             )}
//           </div>

//           {fullAddress && (
//             <div className="px-6 py-4 border-t border-gray-200">
//               <p className="text-sm text-gray-600 flex items-start gap-2">
//                 <RiMapPinLine className="text-green-600 mt-0.5 flex-shrink-0" />
//                 {fullAddress}
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Mock Payment Modal */}
//         {showMockPayment && (
//           <MockPaymentModal
//             isOpen={showMockPayment}
//             onClose={() => setShowMockPayment(false)}
//             bookingData={mockBookingData}
//             onSuccess={(data) => {
//               showMessage({
//                 type: 'success',
//                 title: 'Booking Confirmed!',
//                 message: `Payment successful (demo mode).\nFake Transaction ID: ${data?.transactionId || 'MOCK123'}`,
//                 primaryText: 'OK',
//               });
//               setShowMockPayment(false);
//               setSelectedSlots([]); // clear selection
//             }}
//           />
//         )}
//       </main>
//     </div>
//   );
// }



// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getTurfById, getAvailableSlots, deleteTurf } from '../../api/turfApi';
// import Loader from '../../components/common/Loader';
// import useAuthStore from '../../store/authStore';

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
//   RiPhoneLine,
//   RiMailLine,
//   RiEdit2Line,
//   RiDeleteBinLine,
//   RiUserLine,
// } from 'react-icons/ri';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import {
//   formatRupee,
//   formatTime,
//   capitalize,
//   formatDateDDMMYYYY,
// } from '../../utils';
// import { BASE_URL_MEDIA } from '../../const';
// import { useMessageModal } from '../../context/MessageModalContext';
// import { StarRating } from '../../components/common';

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// });

// const toDateStr = (d) => d.toISOString().split('T')[0];
// const todayStr = () => toDateStr(new Date());

// function shiftDate(s, n) {
//   const d = new Date(s);
//   d.setDate(d.getDate() + n);
//   return toDateStr(d);
// }

// function prettyDate(s) {
//   const t = todayStr();
//   if (s === t) return 'Today';
//   if (s === shiftDate(t, 1)) return 'Tomorrow';
//   return new Date(s).toLocaleDateString('en-IN', {
//     weekday: 'short',
//     day: 'numeric',
//     month: 'short',
//   });
// }

// function longDate(s) {
//   return new Date(s).toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric',
//   });
// }

// function normaliseSlots(r) {
//   if (r?.data?.slots && Array.isArray(r.data.slots)) return r.data.slots;
//   if (Array.isArray(r)) return r;
//   if (Array.isArray(r?.slots)) return r.slots;
//   if (Array.isArray(r?.availableSlots)) return r.availableSlots;
//   if (Array.isArray(r?.data)) return r.data;
//   return [];
// }

// const slotStart = (s) => (typeof s === 'string' ? s : s?.startTime ?? '');
// const slotEnd = (s) => (typeof s === 'string' ? '' : s?.endTime ?? '');
// const slotId = (s) => (typeof s === 'string' ? s : s?._id ?? s?.id ?? s?.startTime ?? '');
// const slotPrice = (s) => (typeof s === 'object' && s?.price != null ? s.price : null);
// const isValid = (s) => (typeof s === 'string' ? /^\d{1,2}:\d{2}/.test(s) : !!s?.startTime);

// const AMEN_ICONS = {
//   parking: <RiParkingBoxLine />,
//   seating: <RiGroupLine />,
//   drinking_water: <RiWaterFlashLine />,
//   lighting: <RiLightbulbLine />,
//   wifi: <RiWifiLine />,
//   scoreboard: <RiChatCheckLine />,
// };

// const AmenityItem = ({ name }) => (
//   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors">
//     <span className="text-sm">{AMEN_ICONS[name] ?? <RiCheckLine />}</span>
//     <span className="capitalize">{name.replace(/_/g, ' ')}</span>
//   </div>
// );

// const ImageSlider = ({ images = [] }) => {
//   const [idx, setIdx] = useState(0);
//   const timer = useRef(null);

//   const go = useCallback(
//     (d) =>
//       setIdx((p) => {
//         const n = p + d;
//         if (n < 0) return images.length - 1;
//         if (n >= images.length) return 0;
//         return n;
//       }),
//     [images.length]
//   );

//   useEffect(() => {
//     if (images.length <= 1) return;
//     timer.current = setInterval(() => go(1), 5000);
//     return () => clearInterval(timer.current);
//   }, [images.length, go]);

//   if (!images.length) {
//     return (
//       <div className="w-full h-64 sm:h-80 md:h-[420px] bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
//         No images available
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full h-64 sm:h-80 md:h-[420px] overflow-hidden">
//       {images.map((img, i) => (
//         <img
//           key={i}
//           src={`${BASE_URL_MEDIA}${img}`}
//           alt={`Photo ${i + 1}`}
//           className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
//         />
//       ))}
//       <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

//       {images.length > 1 && (
//         <>
//           <button
//             onClick={() => go(-1)}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
//           >
//             <RiArrowLeftSLine size={22} />
//           </button>
//           <button
//             onClick={() => go(1)}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
//           >
//             <RiArrowRightSLine size={22} />
//           </button>
//           <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
//             {images.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setIdx(i)}
//                 className={`h-2 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/90'}`}
//               />
//             ))}
//           </div>
//           <span className="absolute bottom-5 right-5 z-10 text-white/80 text-xs font-medium">
//             {idx + 1} / {images.length}
//           </span>
//         </>
//       )}
//     </div>
//   );
// };

// const SlotSkeleton = () => (
//   <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
//     {[...Array(16)].map((_, i) => (
//       <div key={i} className="h-14 bg-gray-200 animate-pulse rounded-xl" style={{ animationDelay: `${i * 40}ms` }} />
//     ))}
//   </div>
// );

// // Razorpay Payment Modal (shows summary + Pay Now button)
// const RazorpayPaymentModal = ({ isOpen, onClose, bookingSummary, onSuccess }) => {
//   const { showMessage } = useMessageModal();

//   if (!isOpen || !bookingSummary) return null;

//   const {
//     turfName,
//     date,
//     slots,
//     totalAmount,
//     advanceRequired,
//     razorpayOrderId,
//   } = bookingSummary;

//   const handlePayNow = () => {
//     if (!razorpayOrderId) {
//       showMessage({
//         type: 'error',
//         title: 'Error',
//         message: 'Payment order not available. Please try again.',
//       });
//       return;
//     }

//     const options = {
//       key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//       amount: advanceRequired * 100,
//       currency: 'INR',
//       name: 'Turfadda Booking',
//       description: `Advance for ${turfName}`,
//       order_id: razorpayOrderId,
//       handler: async function (response) {
//         try {
//           const verifyRes = await fetch('/api/bookings/verify-payment', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//             }),
//           });

//           const verifyData = await verifyRes.json();

//           if (verifyData.success) {
//             showMessage({
//               type: 'success',
//               title: 'Payment Successful',
//               message: `Advance of ₹${formatRupee(advanceRequired)} paid! Your booking is now confirmed.`,
//               primaryText: 'View My Bookings',
//               onPrimary: () => {
//                 onSuccess(verifyData);
//                 onClose();
//               },
//             });
//           } else {
//             showMessage({
//               type: 'error',
//               title: 'Payment Verification Failed',
//               message: verifyData.message || 'Verification failed. Please contact support.',
//             });
//           }
//         } catch (err) {
//           showMessage({
//             type: 'error',
//             title: 'Error',
//             message: 'Failed to verify payment. Please try again or contact support.',
//           });
//         }
//       },
//       prefill: {
//         name: 'Player Name',
//         email: 'player@example.com',
//         contact: '9999999999',
//       },
//       theme: { color: '#22c55e' },
//       modal: {
//         ondismiss: function () {
//           showMessage({
//             type: 'warning',
//             title: 'Payment Cancelled',
//             message: 'You cancelled the payment. Booking is not confirmed yet.',
//           });
//         },
//       },
//     };

//     const rzp = new window.Razorpay(options);

//     rzp.on('payment.failed', function (response) {
//       showMessage({
//         type: 'error',
//         title: 'Payment Failed',
//         message: response.error.description || 'Payment could not be processed.',
//       });
//     });

//     rzp.open();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
//         >
//           <RiCloseLine size={28} />
//         </button>

//         <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
//           Confirm & Pay Advance
//         </h2>

//         <div className="space-y-5 mb-8">
//           <div>
//             <p className="text-sm text-gray-600">Turf</p>
//             <p className="font-semibold text-lg">{turfName}</p>
//           </div>

//           <div>
//             <p className="text-sm text-gray-600">Date</p>
//             <p className="font-semibold text-lg">{date}</p>
//           </div>

//           <div>
//             <p className="text-sm text-gray-600">Selected Slots</p>
//             <div className="flex flex-wrap gap-2 mt-2">
//               {slots.map((slot, idx) => (
//                 <span
//                   key={idx}
//                   className="inline-flex items-center px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm font-medium"
//                 >
//                   {slot.startTime} – {slot.endTime} (₹{formatRupee(slot.price)})
//                 </span>
//               ))}
//             </div>
//           </div>

//           <div className="border-t pt-5 mt-5">
//             <div className="flex justify-between text-lg mb-2">
//               <span>Total Amount:</span>
//               <span className="font-semibold">{formatRupee(totalAmount)}</span>
//             </div>
//             <div className="flex justify-between text-xl font-bold text-green-700">
//               <span>Advance to Pay Now:</span>
//               <span>{formatRupee(advanceRequired)}</span>
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-col gap-4">
//           <button
//             onClick={handlePayNow}
//             className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition"
//           >
//             Pay ₹{formatRupee(advanceRequired)} Now
//           </button>

//           <button
//             onClick={onClose}
//             className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition"
//           >
//             Cancel
//           </button>
//         </div>

//         <p className="text-xs text-gray-500 text-center mt-6">
//           Secure payment powered by Razorpay
//         </p>
//       </div>
//     </div>
//   );
// };

// export default function TurfDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuthStore();
//   const { showMessage } = useMessageModal();

//   const [turf, setTurf] = useState(null);
//   const [slots, setSlots] = useState([]);
//   const [selectedSlots, setSelectedSlots] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [slotsLoading, setSlotsLoading] = useState(false);
//   const [slotsError, setSlotsError] = useState(false);
//   const [pageError, setPageError] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(todayStr());

//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [bookingSummary, setBookingSummary] = useState(null);

//   const MIN_DATE = todayStr();
//   const MAX_DATE = shiftDate(MIN_DATE, 30);

//   const isPlayer = user?.role === 'player';
//   const isOwner = user?.role === 'owner' && user?.id === turf?.owner?.id;
//   const isStaff = user?.role === 'staff';
//   const isAdminOrSuper = user?.role === 'admin' || user?.role === 'superadmin';

//   const showBookingSection = isPlayer || isOwner || isStaff;
//   const canSelectAndBook = isPlayer;

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setPageError(null);
//         const res = await getTurfById(id);
//         const data = res?.data?.turf ?? res?.turf ?? null;
//         console.log('Fetched turf data:', data);
//         if (alive) setTurf(data);
//       } catch (e) {
//         if (alive) setPageError(e?.message ?? 'Failed to load turf');
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [id]);

//   useEffect(() => {
//     if (!turf || !showBookingSection) return;
//     let alive = true;
//     (async () => {
//       setSlotsLoading(true);
//       setSlotsError(false);
//       setSlots([]);
//       if (canSelectAndBook) setSelectedSlots([]);
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
//   }, [id, turf, selectedDate, showBookingSection, canSelectAndBook]);

//   const toggleSlot = useCallback((slot) => {
//     if (!canSelectAndBook) return;
//     const sid = slotId(slot);
//     setSelectedSlots(prev => {
//       const exists = prev.some(s => slotId(s) === sid);
//       return exists ? prev.filter(s => slotId(s) !== sid) : [...prev, slot];
//     });
//   }, [canSelectAndBook]);

//   const isSelected = useCallback((slot) =>
//     selectedSlots.some(s => slotId(s) === slotId(slot)),
//   [selectedSlots]);

//   const prevDate = () => {
//     if (!canSelectAndBook) return;
//     const p = shiftDate(selectedDate, -1);
//     if (p >= MIN_DATE) setSelectedDate(p);
//   };

//   const nextDate = () => {
//     if (!canSelectAndBook) return;
//     const n = shiftDate(selectedDate, 1);
//     if (n <= MAX_DATE) setSelectedDate(n);
//   };

// const handleBook = () => {
//   if (!canSelectAndBook || !selectedSlots.length) return;

//   const totalPrice = selectedSlots.reduce((sum, s) => sum + (slotPrice(s) ?? turf?.pricePerSlot ?? 0), 0);

//   const summary = {
//     turfName: turf.name,
//     date: selectedDate,
//     slots: selectedSlots.map(s => ({
//       startTime: formatTime(slotStart(s)),
//       endTime: formatTime(slotEnd(s)),
//       price: slotPrice(s) ?? turf?.pricePerSlot ?? 0,
//     })),
//     totalAmount: totalPrice,
//     advanceRequired: Math.ceil(totalPrice * 0.2), 
//   };

//   setBookingSummary(summary);
//   setShowPaymentModal(true);
// };

//   const handleDeleteClick = () => {
//     showMessage({
//       type: 'warning',
//       title: 'Delete Turf',
//       message: 'Are you sure you want to delete this turf? This action cannot be undone.',
//       primaryText: 'Delete',
//       onPrimary: async () => {
//         try {
//           await deleteTurf(turf._id);
//           showMessage({
//             type: 'success',
//             title: 'Success',
//             message: 'Turf has been deleted successfully.',
//             primaryText: 'OK',
//             onPrimary: () => navigate('/turfs'),
//           });
//         } catch (error) {
//           showMessage({
//             type: 'error',
//             title: 'Error',
//             message: 'Failed to delete turf. Please try again.',
//             primaryText: 'OK',
//           });
//           console.error('Delete error:', error);
//         }
//       },
//       secondaryText: 'Cancel',
//       onSecondary: () => {},
//     });
//   };

//   const totalPrice = selectedSlots.reduce((sum, s) => sum + (slotPrice(s) ?? 0), 0);
//   const totalMinutes = selectedSlots.length * (turf?.slotDurationMinutes || 60);

//   const sortedSel = [...selectedSlots].sort((a, b) => slotStart(a).localeCompare(slotStart(b)));

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <Loader />
//       </div>
//     );
//   }

//   if (pageError || !turf) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5 text-center">
//         <div>
//           <RiErrorWarningLine className="text-red-500 text-6xl mb-4 mx-auto" />
//           <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
//           <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">{pageError ?? "We couldn't load this turf."}</p>
//           <button
//             onClick={() => navigate(-1)}
//             className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-900 transition"
//           >
//             <RiArrowLeftLine /> Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const {
//     name,
//     images = [],
//     coverImage,
//     location = {},
//     openingTime,
//     closingTime,
//     pricePerSlot,
//     sports = [],
//     amenities = [],
//     surfaceType,
//     size,
//     isVerified,
//     description,
//     slotDurationMinutes = 60,
//     averageRating = 0,
//     reviewCount = 0,
//     owner,
//     stats,
//     verification,
//     _id,
//   } = turf;

//   const sliderImages = coverImage
//     ? [coverImage, ...images.filter(i => i !== coverImage)]
//     : images;

//   const pos = location.latitude && location.longitude
//     ? [parseFloat(location.latitude), parseFloat(location.longitude)]
//     : null;

//   const fullAddress = [location.address, location.area, location.city, location.state, location.pincode]
//     .filter(Boolean)
//     .join(', ');

//   const cityStateArea = [location.area, location.city, location.state]
//     .filter(Boolean)
//     .join(', ');

//   const googleMapsUrl = pos
//     ? `https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`
//     : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || name)}`;

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20 font-sans">
//       <div className="relative">
//         <button
//           onClick={() => navigate(-1)}
//           className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
//         >
//           <RiArrowLeftLine size={20} />
//         </button>
//         <ImageSlider images={sliderImages} />
//       </div>

//       <main className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-6 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//           <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
//             <div className="flex-1 min-w-0">
//               <div className="flex items-start gap-3 flex-wrap">
//                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
//                 {isVerified && (
//                   <span className="mt-1.5 inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
//                     <RiShieldCheckLine className="text-green-600" /> VERIFIED
//                   </span>
//                 )}
//               </div>
//               {cityStateArea && (
//                 <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 font-medium">
//                   <RiMapPinLine className="text-green-600" />
//                   {cityStateArea}
//                 </div>
//               )}
//               <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
//                 <StarRating rating={averageRating} />
//                 {reviewCount > 0 && (
//                   <span className="text-sm text-gray-500">{reviewCount} review{reviewCount !== 1 && 's'}</span>
//                 )}
//               </div>
//             </div>
//             <div className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-center sm:text-right">
//               <div className="text-3xl font-bold text-gray-800">
//                 {formatRupee(pricePerSlot)}
//               </div>
//               <div className="text-sm text-gray-600 mt-1">per {slotDurationMinutes} min</div>
//             </div>
//           </div>
//         </div>

//         {/* Management Section */}
//         {(isOwner || isAdminOrSuper || isStaff) && (
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
//                   <RiUserLine className="text-gray-700 text-xl" />
//                 </div>
//                 <h2 className="text-xl font-semibold text-gray-900">Management</h2>
//               </div>

//               {(isOwner || isAdminOrSuper) && (
//                 <div className="flex gap-2.5">
//                   <button
//                     onClick={() => navigate(`/turf/${turf._id}/edit`)}
//                     className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
//                   >
//                     <RiEdit2Line size={16} /> Edit
//                   </button>
//                   <button
//                     onClick={handleDeleteClick}
//                     className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
//                   >
//                     <RiDeleteBinLine size={16} /> Delete
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* ... your existing management content (owner, verification, stats) remains unchanged ... */}
//           </div>
//         )}

//         {/* Booking Section */}
//         {showBookingSection && (
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 flex-wrap">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
//                   <RiCalendarLine className="text-green-600" />
//                 </div>
//                 <h2 className="text-lg font-bold text-gray-900">
//                   {canSelectAndBook ? 'Book Slots' : 'Available Slots'}
//                 </h2>
//               </div>

//               <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
//                 <button
//                   onClick={prevDate}
//                   disabled={selectedDate <= MIN_DATE}
//                   className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
//                 >
//                   <RiArrowLeftSLine size={18} />
//                 </button>

//                 <div className="relative flex items-center gap-2 px-2 cursor-pointer">
//                   <RiCalendarLine className="text-green-600 text-sm" />
//                   <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
//                     {prettyDate(selectedDate)}
//                   </span>
//                   <span className="text-xs text-gray-500 hidden sm:inline">
//                     · {longDate(selectedDate)}
//                   </span>
//                   <input
//                     type="date"
//                     value={selectedDate}
//                     min={MIN_DATE}
//                     max={MAX_DATE}
//                     onChange={e => e.target.value && setSelectedDate(e.target.value)}
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                   />
//                 </div>

//                 <button
//                   onClick={nextDate}
//                   disabled={selectedDate >= MAX_DATE}
//                   className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
//                 >
//                   <RiArrowRightSLine size={18} />
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
//               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
//               <span>Open {formatTime(openingTime)} – {formatTime(closingTime)}</span>
//               <span className="text-gray-300 mx-1">|</span>
//               <span>{slotDurationMinutes} min slots</span>
//             </div>

//             {slotsLoading ? (
//               <SlotSkeleton />
//             ) : slotsError ? (
//               <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
//                 <RiErrorWarningLine className="text-red-500 text-3xl mx-auto mb-2" />
//                 <p className="text-red-700 font-medium">Couldn't load slots</p>
//                 <p className="text-red-600 text-sm mt-1">Please try again later</p>
//               </div>
//             ) : slots.length === 0 ? (
//               <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-center">
//                 <RiTimeLine className="text-amber-600 text-3xl mx-auto mb-2" />
//                 <p className="text-amber-800 font-medium">No slots available</p>
//                 <p className="text-amber-700 text-sm mt-1">Try another date</p>
//               </div>
//             ) : (
//               <div className="space-y-5">
//                 <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
//                   {slots.map((slot, i) => {
//                     const sid = slotId(slot);
//                     const start = slotStart(slot);
//                     const end = slotEnd(slot);
//                     const price = slotPrice(slot);
//                     const active = canSelectAndBook && isSelected(slot);

//                     return (
//                       <button
//                         key={sid}
//                         onClick={() => toggleSlot(slot)}
//                         disabled={!canSelectAndBook}
//                         className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all
//                           ${active
//                             ? 'bg-green-600 border-green-600 text-white shadow-md'
//                             : canSelectAndBook
//                               ? 'bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50'
//                               : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
//                           }`}
//                       >
//                         {active && (
//                           <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
//                             <RiCheckboxCircleLine className="text-green-600 text-base" />
//                           </span>
//                         )}
//                         <span className="text-sm font-bold tabular-nums">
//                           {formatTime(start)}
//                         </span>
//                         {end && (
//                           <span className={`text-xs mt-1 ${active ? 'text-green-100' : 'text-gray-500'}`}>
//                             {formatTime(end)}
//                           </span>
//                         )}
//                         {price != null && (
//                           <span className={`text-xs font-bold mt-1.5 ${active ? 'text-green-100' : 'text-green-700'}`}>
//                             ₹{price}
//                           </span>
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {canSelectAndBook && selectedSlots.length === 0 && (
//                   <div className="text-center text-gray-500 text-sm py-6">
//                     Tap time slots to select one or more slot
//                   </div>
//                 )}

//                 {canSelectAndBook && selectedSlots.length > 0 && (
//                   <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
//                     <div className="mb-4 pb-3 border-b border-gray-200 flex flex-wrap gap-2">
//                       {sortedSel.map(slot => (
//                         <span
//                           key={slotId(slot)}
//                           className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-xs px-3 py-1 rounded-full border border-gray-300"
//                         >
//                           {formatTime(slotStart(slot))}–{formatTime(slotEnd(slot))}
//                           <button
//                             onClick={() => toggleSlot(slot)}
//                             className="text-gray-500 hover:text-red-600"
//                           >
//                             <RiCloseLine size={14} />
//                           </button>
//                         </span>
//                       ))}
//                     </div>

//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                       <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
//                         <div>
//                           <span className="text-gray-600">Slots:</span>{' '}
//                           <span className="font-semibold text-gray-900">{selectedSlots.length}</span>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Duration:</span>{' '}
//                           <span className="font-semibold text-gray-900">{totalMinutes} min</span>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Price:</span>{' '}
//                           <span className="font-bold text-green-700">{formatRupee(totalPrice)}</span>
//                         </div>
//                       </div>

//                       <button
//                         onClick={handleBook}
//                         className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
//                       >
//                         Book Now
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {description && (
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
//             <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{description}</p>
//           </div>
//         )}

//         <div className="grid md:grid-cols-2 gap-6">
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//             <h2 className="text-lg font-bold text-gray-900 mb-4">Turf Details</h2>
//             <dl className="divide-y divide-gray-100">
//               {[
//                 ['Surface', capitalize(surfaceType?.replace(/_/g, ' ') ?? '—')],
//                 ['Size', size ?? '—'],
//                 ['Duration', `${slotDurationMinutes} min / slot`],
//                 ['Hours', `${formatTime(openingTime)} – ${formatTime(closingTime)}`],
//               ].map(([label, value]) => (
//                 <div key={label} className="flex justify-between py-3">
//                   <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
//                   <dd className="text-sm font-medium text-gray-800">{value}</dd>
//                 </div>
//               ))}
//               {fullAddress && (
//                 <div className="flex justify-between py-3">
//                   <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</dt>
//                   <dd className="text-sm text-gray-700 text-right">{fullAddress}</dd>
//                 </div>
//               )}
//             </dl>

//             {sports.length > 0 && (
//               <div className="mt-6 pt-5 border-t border-gray-100">
//                 <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Sports</p>
//                 <div className="flex flex-wrap gap-2">
//                   {sports.map(s => (
//                     <span
//                       key={s}
//                       className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200"
//                     >
//                       {capitalize(s)}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           {amenities.length > 0 && (
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities</h2>
//               <div className="flex flex-wrap gap-2">
//                 {amenities.map(a => <AmenityItem key={a} name={a} />)}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 pt-5 pb-3 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <RiMapPinLine className="text-green-600 text-xl" />
//               <h2 className="text-lg font-bold text-gray-900">Location</h2>
//             </div>
//             <a
//               href={googleMapsUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
//             >
//               <RiNavigationLine />
//               Get Directions
//             </a>
//           </div>

//           <div className="h-72 border-t border-gray-200">
//             {pos ? (
//               <MapContainer center={pos} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
//                 <TileLayer
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                   attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//                 />
//                 <Marker position={pos}>
//                   <Popup>{name}<br /><small>{fullAddress}</small></Popup>
//                 </Marker>
//               </MapContainer>
//             ) : (
//               <div className="h-full flex items-center justify-center text-gray-500 text-sm">
//                 Map unavailable
//               </div>
//             )}
//           </div>

//           {fullAddress && (
//             <div className="px-6 py-4 border-t border-gray-200">
//               <p className="text-sm text-gray-600 flex items-start gap-2">
//                 <RiMapPinLine className="text-green-600 mt-0.5 flex-shrink-0" />
//                 {fullAddress}
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Razorpay Payment Modal */}
//       {showPaymentModal && bookingSummary && (
//   <RazorpayPaymentModal
//     isOpen={showPaymentModal}
//     onClose={() => setShowPaymentModal(false)}
//     bookingSummary={bookingSummary}
//     onSuccess={(verifiedData) => {
//       showMessage({
//         type: 'success',
//         title: 'Booking Confirmed!',
//         message: 'Payment successful! Your booking is now confirmed.',
//         primaryText: 'OK',
//       });
//       setSelectedSlots([]);
//       setShowPaymentModal(false);
//     }}
//     turfId={id}                  // pass turfId
//     selectedDate={selectedDate}   // pass for backend
//     selectedSlots={selectedSlots} // pass for slot IDs
//   />
// )}
//       </main>
//     </div>
//   );
// }


import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTurfById, getAvailableSlots, deleteTurf } from '../../api/turfApi';
import Loader from '../../components/common/Loader';
import useAuthStore from '../../store/authStore';

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
  RiEdit2Line,
  RiDeleteBinLine,
  RiUserLine,
} from 'react-icons/ri';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  formatRupee,
  formatTime,
  capitalize,
  formatDateDDMMYYYY,
} from '../../utils';
import { BASE_URL_MEDIA } from '../../const';
import { useMessageModal } from '../../context/MessageModalContext';
import { StarRating } from '../../components/common';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const toDateStr = (d) => d.toISOString().split('T')[0];
const todayStr = () => toDateStr(new Date());

function shiftDate(s, n) {
  const d = new Date(s);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

function prettyDate(s) {
  const t = todayStr();
  if (s === t) return 'Today';
  if (s === shiftDate(t, 1)) return 'Tomorrow';
  return new Date(s).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function longDate(s) {
  return new Date(s).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function normaliseSlots(r) {
  if (r?.data?.slots && Array.isArray(r.data.slots)) return r.data.slots;
  if (Array.isArray(r)) return r;
  if (Array.isArray(r?.slots)) return r.slots;
  if (Array.isArray(r?.availableSlots)) return r.availableSlots;
  if (Array.isArray(r?.data)) return r.data;
  return [];
}

const slotStart = (s) => (typeof s === 'string' ? s : s?.startTime ?? '');
const slotEnd = (s) => (typeof s === 'string' ? '' : s?.endTime ?? '');
const slotId = (s) => (typeof s === 'string' ? s : s?._id ?? s?.id ?? s?.startTime ?? '');
const slotPrice = (s) => (typeof s === 'object' && s?.price != null ? s.price : null);
const isValid = (s) => (typeof s === 'string' ? /^\d{1,2}:\d{2}/.test(s) : !!s?.startTime);

const AMEN_ICONS = {
  parking: <RiParkingBoxLine />,
  seating: <RiGroupLine />,
  drinking_water: <RiWaterFlashLine />,
  lighting: <RiLightbulbLine />,
  wifi: <RiWifiLine />,
  scoreboard: <RiChatCheckLine />,
};

const AmenityItem = ({ name }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors">
    <span className="text-sm">{AMEN_ICONS[name] ?? <RiCheckLine />}</span>
    <span className="capitalize">{name.replace(/_/g, ' ')}</span>
  </div>
);

const ImageSlider = ({ images = [] }) => {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  const go = useCallback(
    (d) =>
      setIdx((p) => {
        const n = p + d;
        if (n < 0) return images.length - 1;
        if (n >= images.length) return 0;
        return n;
      }),
    [images.length]
  );

  useEffect(() => {
    if (images.length <= 1) return;
    timer.current = setInterval(() => go(1), 5000);
    return () => clearInterval(timer.current);
  }, [images.length, go]);

  if (!images.length) {
    return (
      <div className="w-full h-64 sm:h-80 md:h-[420px] bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
        No images available
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-[420px] overflow-hidden">
      {images.map((img, i) => (
        <img
          key={i}
          src={`${BASE_URL_MEDIA}${img}`}
          alt={`Photo ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

      {images.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
          >
            <RiArrowLeftSLine size={22} />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
          >
            <RiArrowRightSLine size={22} />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/90'}`}
              />
            ))}
          </div>
          <span className="absolute bottom-5 right-5 z-10 text-white/80 text-xs font-medium">
            {idx + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
};

const SlotSkeleton = () => (
  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
    {[...Array(16)].map((_, i) => (
      <div key={i} className="h-14 bg-gray-200 animate-pulse rounded-xl" style={{ animationDelay: `${i * 40}ms` }} />
    ))}
  </div>
);

export default function TurfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showMessage } = useMessageModal();

  const [turf, setTurf] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const MIN_DATE = todayStr();
  const MAX_DATE = shiftDate(MIN_DATE, 30);

  const isPlayer = user?.role === 'player';
  const isOwner = user?.role === 'owner' && user?.id === turf?.owner?.id;
  const isStaff = user?.role === 'staff';
  const isAdminOrSuper = user?.role === 'admin' || user?.role === 'superadmin';

  const showBookingSection = isPlayer || isOwner || isStaff;
  const canSelectAndBook = isPlayer;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setPageError(null);
        const res = await getTurfById(id);
        const data = res?.data?.turf ?? res?.turf ?? null;
        console.log('Fetched turf data:', data);
        if (alive) setTurf(data);
      } catch (e) {
        if (alive) setPageError(e?.message ?? 'Failed to load turf');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    if (!turf || !showBookingSection) return;
    let alive = true;
    (async () => {
      setSlotsLoading(true);
      setSlotsError(false);
      setSlots([]);
      if (canSelectAndBook) setSelectedSlots([]);
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
  }, [id, turf, selectedDate, showBookingSection, canSelectAndBook]);

  const toggleSlot = useCallback((slot) => {
    if (!canSelectAndBook) return;
    const sid = slotId(slot);
    setSelectedSlots(prev => {
      const exists = prev.some(s => slotId(s) === sid);
      return exists ? prev.filter(s => slotId(s) !== sid) : [...prev, slot];
    });
  }, [canSelectAndBook]);

  const isSelected = useCallback((slot) =>
    selectedSlots.some(s => slotId(s) === slotId(slot)),
  [selectedSlots]);

  const prevDate = () => {
    if (!canSelectAndBook) return;
    const p = shiftDate(selectedDate, -1);
    if (p >= MIN_DATE) setSelectedDate(p);
  };

  const nextDate = () => {
    if (!canSelectAndBook) return;
    const n = shiftDate(selectedDate, 1);
    if (n <= MAX_DATE) setSelectedDate(n);
  };

  const handleBook = () => {
    if (!canSelectAndBook || selectedSlots.length === 0) {
      showMessage({
        type: 'warning',
        title: 'No slots selected',
        message: 'Please select at least one slot to proceed.',
      });
      return;
    }

    const totalPrice = selectedSlots.reduce((sum, s) => {
      return sum + (slotPrice(s) ?? turf?.pricePerSlot ?? 0);
    }, 0);

    // Advance: minimum ₹500 or 20% of total — adjust as per your business rule
    const advanceRequired = Math.max(500, Math.ceil(totalPrice * 0.2));

    const bookingSummary = {
      turfName: turf.name || 'Turf Booking',
      date: selectedDate,
      slots: selectedSlots.map(s => ({
        startTime: formatTime(slotStart(s)),
        endTime: formatTime(slotEnd(s)),
        price: slotPrice(s) ?? turf?.pricePerSlot ?? 0,
      })),
      totalAmount: totalPrice,
      advanceRequired,
    };

    // Navigate to payment screen
    navigate('/payment', {
      state: {
        bookingSummary,
        turfId: id,
        selectedDate,
        selectedSlots, // full slot objects — extract IDs in PaymentScreen or backend
      },
    });
  };

  const handleDeleteClick = () => {
    showMessage({
      type: 'warning',
      title: 'Delete Turf',
      message: 'Are you sure you want to delete this turf? This action cannot be undone.',
      primaryText: 'Delete',
      onPrimary: async () => {
        try {
          await deleteTurf(turf._id);
          showMessage({
            type: 'success',
            title: 'Success',
            message: 'Turf has been deleted successfully.',
            primaryText: 'OK',
            onPrimary: () => navigate('/turfs'),
          });
        } catch (error) {
          showMessage({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete turf. Please try again.',
            primaryText: 'OK',
          });
          console.error('Delete error:', error);
        }
      },
      secondaryText: 'Cancel',
      onSecondary: () => {},
    });
  };

  const totalPrice = selectedSlots.reduce((sum, s) => sum + (slotPrice(s) ?? 0), 0);
  const totalMinutes = selectedSlots.length * (turf?.slotDurationMinutes || 60);

  const sortedSel = [...selectedSlots].sort((a, b) => slotStart(a).localeCompare(slotStart(b)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  if (pageError || !turf) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5 text-center">
        <div>
          <RiErrorWarningLine className="text-red-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">{pageError ?? "We couldn't load this turf."}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-900 transition"
          >
            <RiArrowLeftLine /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const {
    name,
    images = [],
    coverImage,
    location = {},
    openingTime,
    closingTime,
    pricePerSlot,
    sports = [],
    amenities = [],
    surfaceType,
    size,
    isVerified,
    description,
    slotDurationMinutes = 60,
    averageRating = 0,
    reviewCount = 0,
    owner,
    stats,
    verification,
    _id,
  } = turf;

  const sliderImages = coverImage
    ? [coverImage, ...images.filter(i => i !== coverImage)]
    : images;

  const pos = location.latitude && location.longitude
    ? [parseFloat(location.latitude), parseFloat(location.longitude)]
    : null;

  const fullAddress = [location.address, location.area, location.city, location.state, location.pincode]
    .filter(Boolean)
    .join(', ');

  const cityStateArea = [location.area, location.city, location.state]
    .filter(Boolean)
    .join(', ');

  const googleMapsUrl = pos
    ? `https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || name)}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
        >
          <RiArrowLeftLine size={20} />
        </button>
        <ImageSlider images={sliderImages} />
      </div>

      <main className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>
                {isVerified && (
                  <span className="mt-1.5 inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
                    <RiShieldCheckLine className="text-green-600" /> VERIFIED
                  </span>
                )}
              </div>
              {cityStateArea && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <RiMapPinLine className="text-green-600" />
                  {cityStateArea}
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <StarRating rating={averageRating} />
                {reviewCount > 0 && (
                  <span className="text-sm text-gray-500">{reviewCount} review{reviewCount !== 1 && 's'}</span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-center sm:text-right">
              <div className="text-3xl font-bold text-gray-800">
                {formatRupee(pricePerSlot)}
              </div>
              <div className="text-sm text-gray-600 mt-1">per {slotDurationMinutes} min</div>
            </div>
          </div>
        </div>

        {/* Management Section */}
        {(isOwner || isAdminOrSuper || isStaff) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <RiUserLine className="text-gray-700 text-xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Management</h2>
              </div>

              {(isOwner || isAdminOrSuper) && (
                <div className="flex gap-2.5">
                  <button
                    onClick={() => navigate(`/turf/${turf._id}/edit`)}
                    className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    <RiEdit2Line size={16} /> Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    <RiDeleteBinLine size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking Section */}
        {showBookingSection && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <RiCalendarLine className="text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {canSelectAndBook ? 'Book Slots' : 'Available Slots'}
                </h2>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <button
                  onClick={prevDate}
                  disabled={selectedDate <= MIN_DATE}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RiArrowLeftSLine size={18} />
                </button>

                <div className="relative flex items-center gap-2 px-2 cursor-pointer">
                  <RiCalendarLine className="text-green-600 text-sm" />
                  <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {prettyDate(selectedDate)}
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:inline">
                    · {longDate(selectedDate)}
                  </span>
                  <input
                    type="date"
                    value={selectedDate}
                    min={MIN_DATE}
                    max={MAX_DATE}
                    onChange={e => e.target.value && setSelectedDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <button
                  onClick={nextDate}
                  disabled={selectedDate >= MAX_DATE}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RiArrowRightSLine size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Open {formatTime(openingTime)} – {formatTime(closingTime)}</span>
              <span className="text-gray-300 mx-1">|</span>
              <span>{slotDurationMinutes} min slots</span>
            </div>

            {slotsLoading ? (
              <SlotSkeleton />
            ) : slotsError ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
                <RiErrorWarningLine className="text-red-500 text-3xl mx-auto mb-2" />
                <p className="text-red-700 font-medium">Couldn't load slots</p>
                <p className="text-red-600 text-sm mt-1">Please try again later</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-center">
                <RiTimeLine className="text-amber-600 text-3xl mx-auto mb-2" />
                <p className="text-amber-800 font-medium">No slots available</p>
                <p className="text-amber-700 text-sm mt-1">Try another date</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {slots.map((slot, i) => {
                    const sid = slotId(slot);
                    const start = slotStart(slot);
                    const end = slotEnd(slot);
                    const price = slotPrice(slot);
                    const active = canSelectAndBook && isSelected(slot);

                    return (
                      <button
                        key={sid}
                        onClick={() => toggleSlot(slot)}
                        disabled={!canSelectAndBook}
                        className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-center transition-all
                          ${active
                            ? 'bg-green-600 border-green-600 text-white shadow-md'
                            : canSelectAndBook
                              ? 'bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50'
                              : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                          }`}
                      >
                        {active && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
                            <RiCheckboxCircleLine className="text-green-600 text-base" />
                          </span>
                        )}
                        <span className="text-sm font-bold tabular-nums">
                          {formatTime(start)}
                        </span>
                        {end && (
                          <span className={`text-xs mt-1 ${active ? 'text-green-100' : 'text-gray-500'}`}>
                            {formatTime(end)}
                          </span>
                        )}
                        {price != null && (
                          <span className={`text-xs font-bold mt-1.5 ${active ? 'text-green-100' : 'text-green-700'}`}>
                            ₹{price}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {canSelectAndBook && selectedSlots.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-6">
                    Tap time slots to select one or more slot
                  </div>
                )}

                {canSelectAndBook && selectedSlots.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="mb-4 pb-3 border-b border-gray-200 flex flex-wrap gap-2">
                      {sortedSel.map(slot => (
                        <span
                          key={slotId(slot)}
                          className="inline-flex items-center gap-1.5 bg-white text-gray-800 text-xs px-3 py-1 rounded-full border border-gray-300"
                        >
                          {formatTime(slotStart(slot))}–{formatTime(slotEnd(slot))}
                          <button
                            onClick={() => toggleSlot(slot)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <RiCloseLine size={14} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Slots:</span>{' '}
                          <span className="font-semibold text-gray-900">{selectedSlots.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>{' '}
                          <span className="font-semibold text-gray-900">{totalMinutes} min</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Price:</span>{' '}
                          <span className="font-bold text-green-700">{formatRupee(totalPrice)}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleBook}
                        className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {description && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{description}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Turf Details</h2>
            <dl className="divide-y divide-gray-100">
              {[
                ['Surface', capitalize(surfaceType?.replace(/_/g, ' ') ?? '—')],
                ['Size', size ?? '—'],
                ['Duration', `${slotDurationMinutes} min / slot`],
                ['Hours', `${formatTime(openingTime)} – ${formatTime(closingTime)}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-3">
                  <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
                  <dd className="text-sm font-medium text-gray-800">{value}</dd>
                </div>
              ))}
              {fullAddress && (
                <div className="flex justify-between py-3">
                  <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</dt>
                  <dd className="text-sm text-gray-700 text-right">{fullAddress}</dd>
                </div>
              )}
            </dl>

            {sports.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Sports</p>
                <div className="flex flex-wrap gap-2">
                  {sports.map(s => (
                    <span
                      key={s}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200"
                    >
                      {capitalize(s)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {amenities.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {amenities.map(a => <AmenityItem key={a} name={a} />)}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiMapPinLine className="text-green-600 text-xl" />
              <h2 className="text-lg font-bold text-gray-900">Location</h2>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
            >
              <RiNavigationLine />
              Get Directions
            </a>
          </div>

          <div className="h-72 border-t border-gray-200">
            {pos ? (
              <MapContainer center={pos} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={pos}>
                  <Popup>{name}<br /><small>{fullAddress}</small></Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Map unavailable
              </div>
            )}
          </div>

          {fullAddress && (
            <div className="px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 flex items-start gap-2">
                <RiMapPinLine className="text-green-600 mt-0.5 flex-shrink-0" />
                {fullAddress}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}