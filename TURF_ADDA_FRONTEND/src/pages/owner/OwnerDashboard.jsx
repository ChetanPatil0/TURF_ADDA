// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import useAuthStore from '../../store/authStore';
// import Loader from '../../components/common/Loader';

// import {
//   RiBuilding2Line,
//   RiCalendarCheckLine,
//   RiMoneyRupeeCircleLine,
//   RiTimeLine,
//   RiAddCircleLine,

//   RiMapPinLine,
//   RiBarChartBoxLine,
//   RiErrorWarningLine,
//   RiRefreshLine,
//   RiArrowUpLine,
//   RiArrowDownLine,
//   RiCheckboxCircleFill,
//   RiEyeLine,
//   RiCalendarEventLine,
//   RiWalletLine,
//   RiArrowLeftSLine,
//   RiArrowRightSLine,
// } from 'react-icons/ri';

// import { geOwnerDashboardData } from '../../api/dashboardApi';

// import {
//   formatNumber,
//   formatRupee,
//   getGreeting,
//   getTodayShort,
//   getStatusStyle,
//   formatTime,
// } from '../../utils/index';

// const todayLabel = getTodayShort;

// const getSportClass = () =>
//   'bg-[color-mix(in srgb,var(--color-disabled)_15%,white)] text-[#333333] font-medium';

// const BigStat = ({ icon: Icon, iconBg, iconColor, label, value, trend, sub }) => {
//   const up = (trend ?? 0) >= 0;
//   return (
//     <div className="bg-white rounded-2xl border border-[var(--color-divider)] p-5 flex flex-col gap-2.5">
//       <div className="flex items-start justify-between gap-2">
//         <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-snug">{label}</p>
//         <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
//           <Icon className={`text-lg ${iconColor}`} />
//         </div>
//       </div>
//       <p className="text-3xl font-bold text-[var(--color-text-primary)] leading-none tracking-tight">{value}</p>
//       {trend != null && (
//         <div className="flex items-center gap-1">
//           <span className={`flex items-center gap-0.5 text-xs font-bold ${up ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
//             {up ? <RiArrowUpLine /> : <RiArrowDownLine />}
//             {Math.abs(trend)}%
//           </span>
//           <span className="text-xs text-[var(--color-text-secondary)]">vs last month</span>
//         </div>
//       )}
//       <p className="text-[11px] text-[var(--color-text-secondary)] border-t border-[var(--color-divider)] pt-2 mt-0.5">
//         {sub ?? todayLabel()}
//       </p>
//     </div>
//   );
// };

// const Card = ({ title, badge, onViewAll, viewAllLabel = 'View all', children, className = '' }) => (
//   <div className={`bg-white rounded-2xl border border-[var(--color-divider)] overflow-hidden ${className}`}>
//     <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-divider)]">
//       <div className="flex items-center gap-2">
//         <h2 className="text-sm font-bold text-[var(--color-text-primary)]">{title}</h2>
//         {badge != null && badge > 0 && (
//           <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center">
//             {badge > 99 ? '99+' : badge}
//           </span>
//         )}
//       </div>
//       {onViewAll && (
//         <button
//           onClick={onViewAll}
//           className="flex items-center gap-0.5 text-xs font-semibold text-[var(--color-primary)] hover:opacity-70 transition-opacity"
//         >
//           {viewAllLabel} <RiArrowRightSLine className="text-sm" />
//         </button>
//       )}
//     </div>
//     {children}
//   </div>
// );

// const Empty = ({ icon: Icon, title, desc, action }) => (
//   <div className="py-10 flex flex-col items-center text-center gap-2 px-6">
//     <div className="w-11 h-11 rounded-2xl bg-[#F3F4F6] flex items-center justify-center">
//       <Icon className="text-xl text-[#D4D4D4]" />
//     </div>
//     <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
//     {desc && <p className="text-xs text-[var(--color-text-secondary)] max-w-[15rem] leading-relaxed">{desc}</p>}
//     {action}
//   </div>
// );

// const SlotCard = ({ slot }) => {
//   const avail = !slot.isBooked && slot.status !== 'booked';
//   return (
//     <div className="border border-[var(--color-divider)] rounded-2xl p-4 flex flex-col gap-2.5 bg-white min-w-[220px] snap-start">
//       <div className="flex items-center gap-1.5">
//         <span className="w-2 h-2 rounded-full shrink-0" style={{ background: avail ? 'var(--color-primary)' : 'var(--color-error)' }} />
//         <span className={`text-[11px] font-semibold ${avail ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
//           {avail ? 'Available' : 'Booked'}
//         </span>
//       </div>
//       <div>
//         <p className="text-sm font-bold text-[var(--color-text-primary)]">
//           {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
//         </p>
//         {slot.duration && <p className="text-[11px] text-[var(--color-text-secondary)]">{slot.duration} slot</p>}
//         {slot.turfName && <p className="text-[11px] text-[var(--color-text-secondary)] truncate">{slot.turfName}</p>}
//       </div>
//       <p className="text-base font-bold text-[var(--color-primary)]">{slot.price ? formatRupee(slot.price) : '₹0'}</p>
//       <button
//         className={`w-full py-2 rounded-xl text-[11px] font-semibold border transition-all ${
//           avail
//             ? 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
//             : 'border-[var(--color-divider)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-default)]'
//         }`}
//       >
//         {avail ? 'Book now' : 'View info'}
//       </button>
//     </div>
//   );
// };

// const NewBookingRow = ({ booking, onView }) => {
//   const initials = (booking.userName || 'P').charAt(0).toUpperCase();
//   return (
//     <div className="px-5 py-4 border-b border-[var(--color-divider)] last:border-0">
//       <div className="flex items-start gap-3">
//         <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0 text-xs font-bold text-[var(--color-primary)] overflow-hidden">
//           {booking.userImage ? (
//             <img src={booking.userImage} alt={booking.userName} className="w-full h-full object-cover" />
//           ) : (
//             initials
//           )}
//         </div>
//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between gap-1">
//             <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{booking.userName || 'Player'}</p>
//             <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0">{booking.date}</span>
//           </div>
//           <p className="text-[11px] text-[var(--color-text-secondary)] truncate">Booked a slot · {booking.turfName}</p>
//           {booking.slotTime && (
//             <p className="text-[11px] font-semibold text-[var(--color-primary)] mt-0.5">{booking.slotTime}</p>
//           )}
//           <div className="flex items-center justify-between mt-1">
//             <button
//               onClick={onView}
//               className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary)] hover:opacity-70 transition-opacity"
//             >
//               <RiEyeLine className="text-xs" /> View booking
//             </button>
//             {booking.totalAmount > 0 && (
//               <span className="text-[10px] font-bold text-[var(--color-text-primary)]">{formatRupee(booking.totalAmount)}</span>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const ActionTile = ({ icon: Icon, label, desc, onClick, accent = false }) => (
//   <button
//     onClick={onClick}
//     className={`flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:shadow-md active:scale-[0.98] ${
//       accent
//         ? 'bg-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[color-mix(in srgb,var(--color-primary)_90%,black)]'
//         : 'bg-white border-[var(--color-divider)] hover:border-[var(--color-primary)]'
//     }`}
//   >
//     <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? 'bg-white/20' : 'bg-[var(--color-primary-light)]'}`}>
//       <Icon className={`text-xl ${accent ? 'text-white' : 'text-[var(--color-primary)]'}`} />
//     </div>
//     <div>
//       <p className={`text-sm font-bold ${accent ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>{label}</p>
//       <p className={`text-[11px] ${accent ? 'text-white/70' : 'text-[var(--color-text-secondary)]'}`}>{desc}</p>
//     </div>
//   </button>
// );

// const PageLoading = () => (
//   <div className="min-h-screen bg-[var(--color-bg-default)] flex flex-col items-center justify-center gap-4">
//     <Loader size="xl" />
//     <p className="text-sm font-medium text-[var(--color-text-secondary)] animate-pulse">Loading your dashboard…</p>
//   </div>
// );

// const PageError = ({ message, onRetry }) => (
//   <div className="min-h-screen bg-[var(--color-bg-default)] flex items-center justify-center px-4">
//     <div className="bg-white rounded-2xl border border-[var(--color-divider)] p-8 max-w-sm w-full text-center">
//       <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
//         <RiErrorWarningLine className="text-3xl text-[var(--color-error)]" />
//       </div>
//       <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Dashboard unavailable</h2>
//       <p className="text-[var(--color-text-secondary)] text-sm mb-6 leading-relaxed">{message}</p>
//       <button
//         onClick={onRetry}
//         className="inline-flex items-center gap-2 bg-[var(--color-error)] hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
//       >
//         <RiRefreshLine /> Try Again
//       </button>
//     </div>
//   </div>
// );

// const OwnerDashboard = () => {
//   const { user, isAuthenticated } = useAuthStore();
//   const navigate = useNavigate();

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [slotFilter, setSlotFilter] = useState('All');
//   const [turfFilter, setTurfFilter] = useState('All');

//   const slotsContainerRef = useRef(null);

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const res = await geOwnerDashboardData();
//       console.log('owner dashboard data : ', res.data);
//       setData(res?.data || res);
//     } catch (e) {
//       setError(e.response?.data?.message || e.message || 'Failed to load dashboard.');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!isAuthenticated || user?.role !== 'owner') {
//       navigate('/login');
//       return;
//     }
//     fetchData();
//   }, [isAuthenticated, user?.role, navigate, fetchData]);

//   const go = (path) => () => navigate(path);

//   const stats = data?.stats ?? {};
//   const turfs = data?.turfs ?? [];
//   const quickAvailableSlots = data?.quickAvailableSlots ?? [];
//   const newBookings = data?.newBookings ?? [];

//   const turfFilterOptions = [
//     { value: 'All', label: 'All Turfs' },
//     ...turfs.map(t => ({ value: t.id, label: t.name })),
//   ];

//   const allSlots = quickAvailableSlots.flatMap(group =>
//     group.slots.map(slot => ({
//       ...slot,
//       turfName: group.turfName,
//     }))
//   );

//   const turfFilteredSlots = turfFilter === 'All'
//     ? allSlots
//     : allSlots.filter(slot => {
//         const group = quickAvailableSlots.find(g => g.turfId === turfFilter);
//         return slot.turfName === group?.turfName;
//       });

//   const FILTERS = ['All', 'Morning', 'Evening', 'Night'];
//   const filteredSlots = slotFilter === 'All'
//     ? turfFilteredSlots
//     : turfFilteredSlots.filter(slot => {
//         const hour = parseInt(slot.startTime.split(':')[0], 10);
//         if (slotFilter === 'Morning') return hour >= 5 && hour < 12;
//         if (slotFilter === 'Evening') return hour >= 12 && hour < 18;
//         if (slotFilter === 'Night') return hour >= 18 || hour < 5;
//         return true;
//       });

//   const scrollLeft = () => {
//     if (slotsContainerRef.current) {
//       slotsContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
//     }
//   };

//   const scrollRight = () => {
//     if (slotsContainerRef.current) {
//       slotsContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
//     }
//   };

//   const dateStr = new Date().toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric',
//   });

//   if (loading) return <PageLoading />;
//   if (error && !data) return <PageError message={error} onRetry={fetchData} />;

//   return (
//     <div className="min-h-screen bg-[var(--color-bg-default)]" style={{ fontFamily: 'Roboto, sans-serif' }}>

//       <div className="sticky top-0 z-20 bg-[var(--color-bg-paper)] border-b border-[var(--color-divider)]">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
//           <div className="min-w-0">
//             <h1 className="text-base font-bold text-[var(--color-text-primary)] leading-tight truncate">
//               {getGreeting()}, <span className="text-[var(--color-primary)]">{user?.firstName || 'Owner'}</span>
//             </h1>
//             <p className="text-[11px] text-[var(--color-text-secondary)]">{dateStr}</p>
//           </div>
//           <div className="flex items-center gap-2 shrink-0">
//             <button
//               onClick={go('/owner/bookings')}
//               className="hidden sm:flex items-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] font-semibold px-3.5 py-2 rounded-xl text-xs transition-all"
//             >
//               <RiCalendarEventLine className="text-sm" /> Bookings
//             </button>
//             <button
//               onClick={go('/owner/slots')}
//               className="hidden sm:flex items-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] font-semibold px-3.5 py-2 rounded-xl text-xs transition-all"
//             >
//               <RiTimeLine className="text-sm" /> Book Slot
//             </button>
//             <button
//               onClick={go('/owner/add-turf')}
//               className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[color-mix(in srgb,var(--color-primary)_90%,black)] text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
//             >
//               <RiAddCircleLine className="text-sm" />
//               <span>Add Turf</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <BigStat
//             icon={RiCalendarCheckLine}
//             iconBg="bg-violet-100"
//             iconColor="text-violet-500"
//             label="Upcoming bookings (next 7 days)"
//             value={formatNumber(stats.upcomingBookedCount)}
//             trend={stats.bookedTrend ?? null}
//             sub={`This month: ${formatNumber(stats.thisMonthBookings)} bookings`}
//           />
//           <BigStat
//             icon={RiMoneyRupeeCircleLine}
//             iconBg="bg-[var(--color-primary-light)]"
//             iconColor="text-[var(--color-primary)]"
//             label="Revenue this month"
//             value={formatRupee(stats.thisMonthRevenue)}
//             trend={stats.revenueTrend ?? null}
//             sub={`All-time: ${formatRupee(stats.totalRevenue)}`}
//           />
//           <BigStat
//             icon={RiTimeLine}
//             iconBg="bg-sky-50"
//             iconColor="text-sky-500"
//             label="Available slots today"
//             value={formatNumber(stats.todayAvailableSlots)}
//             trend={null}
//             sub={`Booked today: ${formatNumber(stats.todayBookedSlots)} · Total: ${formatNumber(stats.todayTotalSlots)}`}
//           />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

//           <div className="lg:col-span-2 space-y-6">

//             <section>
//               <h2 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-3">Quick Actions</h2>
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                 <ActionTile icon={RiAddCircleLine} label="Add Turf" desc="List new venue" onClick={go('/owner/add-turf')} accent />
//                 <ActionTile icon={RiCalendarEventLine} label="Bookings" desc="View all" onClick={go('/owner/bookings')} />
//                 <ActionTile icon={RiTimeLine} label="Book Slot" desc="Manage slots" onClick={go('/owner/slots')} />
//                 <ActionTile icon={RiBarChartBoxLine} label="Revenue" desc="Earnings overview" onClick={go('/owner/revenue')} />
//               </div>
//             </section>

//             <Card title="Today's Slot Info" onViewAll={go('/owner/slots')}>
//               <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between px-5 py-3 bg-[var(--color-bg-default)] border-b border-[var(--color-divider)]">
//                 <p className="text-xs text-[var(--color-text-secondary)]">
//                   Total all slots <span className="font-bold text-[var(--color-text-primary)]">{formatNumber(stats.todayTotalSlots)}</span>
//                 </p>

//                 <div className="flex items-center gap-4 flex-wrap">
//                   <div className="flex items-center gap-1 bg-[var(--color-bg-paper)] border border-[var(--color-divider)] rounded-xl p-1">
//                     {FILTERS.map((f) => (
//                       <button
//                         key={f}
//                         onClick={() => setSlotFilter(f)}
//                         className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
//                           slotFilter === f
//                             ? 'bg-[var(--color-primary)] text-white shadow-sm'
//                             : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
//                         }`}
//                       >
//                         {f}
//                       </button>
//                     ))}
//                   </div>

//                   <select
//                     value={turfFilter}
//                     onChange={(e) => setTurfFilter(e.target.value)}
//                     className="px-3 py-1.5 bg-white border border-[var(--color-divider)] rounded-lg text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
//                   >
//                     {turfFilterOptions.map(opt => (
//                       <option key={opt.value} value={opt.value}>
//                         {opt.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               <div className="relative p-5">
//                 {filteredSlots.length === 0 ? (
//                   <Empty icon={RiTimeLine} title="No slots today" desc="Slots for your turfs will appear here once added." />
//                 ) : (
//                   <div className="relative">
//                     <div
//                       ref={slotsContainerRef}
//                       className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
//                       style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//                     >
//                       {filteredSlots.map((slot, i) => (
//                         <div key={slot.id || i} className="snap-start">
//                           <SlotCard slot={slot} />
//                         </div>
//                       ))}
//                     </div>

//                     <button
//                       onClick={scrollLeft}
//                       className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white z-10 hidden sm:flex items-center justify-center disabled:opacity-40"
//                       disabled={slotsContainerRef.current?.scrollLeft <= 0}
//                     >
//                       <RiArrowLeftSLine className="text-2xl text-[var(--color-primary)]" />
//                     </button>

//                     <button
//                       onClick={scrollRight}
//                       className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white z-10 hidden sm:flex items-center justify-center"
//                     >
//                       <RiArrowRightSLine className="text-2xl text-[var(--color-primary)]" />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </Card>

//             <Card
//               title="My Turfs"
//               onViewAll={go('/owner/turfs')}
//               viewAllLabel={turfs.length > 3 ? `View all ${turfs.length}` : 'View all'}
//             >
//               {turfs.length === 0 ? (
//                 <Empty
//                   icon={RiBuilding2Line}
//                   title="No turfs yet"
//                   desc="Add your first turf to start receiving bookings."
//                   action={
//                     <button
//                       onClick={go('/owner/add-turf')}
//                       className="mt-2 flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[color-mix(in srgb,var(--color-primary)_90%,black)] text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
//                     >
//                       <RiAddCircleLine /> Add Turf
//                     </button>
//                   }
//                 />
//               ) : (
//                 <div className="divide-y divide-[var(--color-divider)]">
//                   {turfs.slice(0, 3).map((turf) => {
//                     const st = getStatusStyle(turf.status);
//                     const loc = [turf.area, turf.city].filter(Boolean).join(', ') || 'Location not set';
//                     const img = turf.coverImage || turf.images?.[0];
//                     return (
//                       <div key={turf.id || turf._id} className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--color-bg-default)] transition-colors">
//                         <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden bg-[var(--color-primary-light)]">
//                           {img ? (
//                             <img src={img} alt={turf.name} className="w-full h-full object-cover" />
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center">
//                               <RiBuilding2Line className="text-2xl text-[var(--color-primary)]" />
//                             </div>
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2 flex-wrap mb-0.5">
//                             <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{turf.name}</p>
//                             <span
//                               className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text} shrink-0`}
//                             >
//                               <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
//                               {st.label}
//                             </span>
//                           </div>
//                           <p className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1 mb-1.5">
//                             <RiMapPinLine className="text-[var(--color-primary)] shrink-0" /> {loc}
//                           </p>
//                           <div className="flex flex-wrap gap-1.5">
//                             {turf.sports?.map((s, i) => (
//                               <span
//                                 key={i}
//                                 className={`text-[10px] px-2.5 py-1 rounded-full font-medium border border-gray-200 ${getSportClass()}`}
//                               >
//                                 {s}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                         <div className="shrink-0 text-right hidden sm:block">
//                           <p className="text-sm font-extrabold text-[var(--color-primary)]">
//                             {turf.pricePerSlot ? formatRupee(turf.pricePerSlot) : '₹0'}
//                           </p>
//                           <p className="text-[10px] text-[var(--color-text-secondary)] mb-2">per slot</p>
//                           <button
//                             onClick={() => navigate(`/owner/turf/${turf.id || turf._id}`)}
//                             className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
//                           >
//                             Manage →
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </Card>
//           </div>

//           <div className="flex flex-col gap-5">
//             <div className="bg-[var(--color-bg-paper)] rounded-2xl border border-[var(--color-divider)] p-5">
//               <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">At a Glance</h2>
//               <div className="space-y-3">
//                 {[
//                   { label: 'Total Turfs', value: formatNumber(stats.totalTurfs), icon: RiBuilding2Line, bg: 'bg-[var(--color-primary-light)]', color: 'text-[var(--color-primary)]' },
//                   { label: 'Active Turfs', value: formatNumber(stats.activeTurfs), icon: RiCheckboxCircleFill, bg: 'bg-[var(--color-primary-light)]', color: 'text-[var(--color-primary)]' },
//                   { label: 'Total Revenue', value: formatRupee(stats.totalRevenue), icon: RiWalletLine, bg: 'bg-amber-50', color: 'text-[var(--color-secondary)]' },
//                   { label: 'Slots Today', value: formatNumber(stats.todayAvailableSlots), icon: RiTimeLine, bg: 'bg-violet-50', color: 'text-violet-500' },
//                 ].map(({ label, value, icon: Icon, bg, color }) => (
//                   <div key={label} className="flex items-center justify-between">
//                     <div className="flex items-center gap-2.5">
//                       <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
//                         <Icon className={`text-sm ${color}`} />
//                       </div>
//                       <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
//                     </div>
//                     <p className="text-sm font-bold text-[var(--color-text-primary)]">{value}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <Card
//               title="New Bookings"
//               badge={stats.newBookingsToday}
//               onViewAll={go('/owner/bookings')}
//               viewAllLabel="View all bookings"
//             >
//               {newBookings.length === 0 ? (
//                 <Empty
//                   icon={RiCalendarEventLine}
//                   title="No bookings yet"
//                   desc="New player bookings will appear here."
//                 />
//               ) : (
//                 <>
//                   {newBookings.slice(0, 4).map((b, i) => (
//                     <NewBookingRow
//                       key={b.id || i}
//                       booking={b}
//                       onView={go('/owner/bookings')}
//                     />
//                   ))}
//                   <div className="px-5 py-3 border-t border-[var(--color-divider)]">
//                     <button
//                       onClick={go('/owner/bookings')}
//                       className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:opacity-70 transition-opacity py-1"
//                     >
//                       <RiEyeLine /> View all bookings
//                     </button>
//                   </div>
//                 </>
//               )}
//             </Card>

//             <button
//               onClick={go('/owner/revenue')}
//               className="w-full flex items-center gap-3 p-4 bg-[var(--color-primary-light)] rounded-2xl border border-[color-mix(in srgb,var(--color-primary)_20%,transparent)] hover:shadow-md transition-all group text-left"
//             >
//               <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shrink-0">
//                 <RiBarChartBoxLine className="text-white text-xl" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-sm font-bold text-[var(--color-text-primary)]">Revenue Overview</p>
//                 <p className="text-xs text-[var(--color-text-secondary)]">Track earnings & trends</p>
//               </div>
//               <RiArrowRightSLine className="text-[var(--color-primary)] text-xl group-hover:translate-x-1 transition-transform shrink-0" />
//             </button>

//             <div className="flex gap-3 sm:hidden">
//               <button
//                 onClick={go('/owner/bookings')}
//                 className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] font-semibold py-3 rounded-xl text-xs hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
//               >
//                 <RiCalendarEventLine /> Bookings
//               </button>
//               <button
//                 onClick={go('/owner/slots')}
//                 className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] font-semibold py-3 rounded-xl text-xs hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
//               >
//                 <RiTimeLine /> Book Slot
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OwnerDashboard;

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Loader from '../../components/common/Loader';

import {
  RiBuilding2Line,
  RiCalendarCheckLine,
  RiMoneyRupeeCircleLine,
  RiTimeLine,
  RiAddCircleLine,
 
  RiMapPinLine,
  RiBarChartBoxLine,
  RiErrorWarningLine,
  RiRefreshLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCheckboxCircleFill,
  RiEyeLine,
  RiCalendarEventLine,
  RiWalletLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from 'react-icons/ri';

import { geOwnerDashboardData } from '../../api/dashboardApi';

import {
  formatNumber,
  formatRupee,
  getGreeting,
  getTodayShort,
  getStatusStyle,
  formatTime,
} from '../../utils/index';

const todayLabel = getTodayShort;

const getSportClass = () =>
  'bg-[color-mix(in srgb,var(--color-disabled)_15%,white)] text-[#333333] font-medium';

const BigStat = ({ icon: Icon, iconBg, iconColor, label, value, trend, sub }) => {
  const up = (trend ?? 0) >= 0;
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-divider)] p-5 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-[var(--color-text-secondary)] font-medium leading-snug">{label}</p>
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`text-lg ${iconColor}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-[var(--color-text-primary)] leading-none tracking-tight">{value}</p>
      {trend != null && (
        <div className="flex items-center gap-1">
          <span className={`flex items-center gap-0.5 text-xs font-bold ${up ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
            {up ? <RiArrowUpLine /> : <RiArrowDownLine />}
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">vs last month</span>
        </div>
      )}
      <p className="text-[11px] text-[var(--color-text-secondary)] border-t border-[var(--color-divider)] pt-2 mt-0.5">
        {sub ?? todayLabel()}
      </p>
    </div>
  );
};

const Card = ({ title, badge, onViewAll, viewAllLabel = 'View all', children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-[var(--color-divider)] overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-divider)]">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)]">{title}</h2>
        {badge != null && badge > 0 && (
          <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-xs font-semibold text-[var(--color-primary)] hover:opacity-70 transition-opacity"
        >
          {viewAllLabel} <RiArrowRightSLine className="text-sm" />
        </button>
      )}
    </div>
    {children}
  </div>
);

const Empty = ({ icon: Icon, title, desc, action }) => (
  <div className="py-10 flex flex-col items-center text-center gap-2 px-6">
    <div className="w-11 h-11 rounded-2xl bg-[#F3F4F6] flex items-center justify-center">
      <Icon className="text-xl text-[#D4D4D4]" />
    </div>
    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
    {desc && <p className="text-xs text-[var(--color-text-secondary)] max-w-[15rem] leading-relaxed">{desc}</p>}
    {action}
  </div>
);

const SlotCard = ({ slot }) => {
  const avail = !slot.isBooked && slot.status !== 'booked';
  return (
    <div className="border border-[var(--color-divider)] rounded-2xl p-4 flex flex-col gap-2.5 bg-white min-w-[220px] snap-start">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: avail ? 'var(--color-primary)' : 'var(--color-error)' }} />
        <span className={`text-[11px] font-semibold ${avail ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
          {avail ? 'Available' : 'Booked'}
        </span>
      </div>
      <div>
        <p className="text-sm font-bold text-[var(--color-text-primary)]">
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </p>
        {slot.duration && <p className="text-[11px] text-[var(--color-text-secondary)]">{slot.duration} slot</p>}
        {slot.turfName && <p className="text-[11px] text-[var(--color-text-secondary)] truncate">{slot.turfName}</p>}
      </div>
      <p className="text-base font-bold text-[var(--color-primary)]">{slot.price ? formatRupee(slot.price) : '₹0'}</p>
      <button
        className={`w-full py-2 rounded-xl text-[11px] font-semibold border transition-all ${
          avail
            ? 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
            : 'border-[var(--color-divider)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-default)]'
        }`}
      >
        {avail ? 'Book now' : 'View info'}
      </button>
    </div>
  );
};

const NewBookingRow = ({ booking, onView }) => {
  const initials = (booking.userName || 'P').charAt(0).toUpperCase();
  return (
    <div className="px-5 py-4 border-b border-[var(--color-divider)] last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center shrink-0 text-xs font-bold text-[var(--color-primary)] overflow-hidden">
          {booking.userImage ? (
            <img src={booking.userImage} alt={booking.userName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{booking.userName || 'Player'}</p>
            <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0">{booking.date}</span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)] truncate">Booked a slot · {booking.turfName}</p>
          {booking.slotTime && (
            <p className="text-[11px] font-semibold text-[var(--color-primary)] mt-0.5">{booking.slotTime}</p>
          )}
          <div className="flex items-center justify-between mt-1">
            <button
              onClick={onView}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary)] hover:opacity-70 transition-opacity"
            >
              <RiEyeLine className="text-xs" /> View booking
            </button>
            {booking.totalAmount > 0 && (
              <span className="text-[10px] font-bold text-[var(--color-text-primary)]">{formatRupee(booking.totalAmount)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionTile = ({ icon: Icon, label, desc, onClick, accent = false }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:shadow-md active:scale-[0.98] ${
      accent
        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[color-mix(in srgb,var(--color-primary)_90%,black)]'
        : 'bg-white border-[var(--color-divider)] hover:border-[var(--color-primary)]'
    }`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? 'bg-white/20' : 'bg-[var(--color-primary-light)]'}`}>
      <Icon className={`text-xl ${accent ? 'text-white' : 'text-[var(--color-primary)]'}`} />
    </div>
    <div>
      <p className={`text-sm font-bold ${accent ? 'text-white' : 'text-[var(--color-text-primary)]'}`}>{label}</p>
      <p className={`text-[11px] ${accent ? 'text-white/70' : 'text-[var(--color-text-secondary)]'}`}>{desc}</p>
    </div>
  </button>
);

const PageLoading = () => (
  <div className="min-h-screen bg-[var(--color-bg-default)] flex flex-col items-center justify-center gap-4">
    <Loader size="xl" />
    <p className="text-sm font-medium text-[var(--color-text-secondary)] animate-pulse">Loading your dashboard…</p>
  </div>
);

const PageError = ({ message, onRetry }) => (
  <div className="min-h-screen bg-[var(--color-bg-default)] flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl border border-[var(--color-divider)] p-8 max-w-sm w-full text-center">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <RiErrorWarningLine className="text-3xl text-[var(--color-error)]" />
      </div>
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Dashboard unavailable</h2>
      <p className="text-[var(--color-text-secondary)] text-sm mb-6 leading-relaxed">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-[var(--color-error)] hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
      >
        <RiRefreshLine /> Try Again
      </button>
    </div>
  </div>
);

const OwnerDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [slotFilter, setSlotFilter] = useState('All');
  const [turfFilter, setTurfFilter] = useState('All');
  const [scrollPosition, setScrollPosition] = useState(0);

  const slotsContainerRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await geOwnerDashboardData();
      console.log('owner dashboard data : ', res.data);
      setData(res?.data || res);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'owner') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, user?.role, navigate, fetchData]);

  useEffect(() => {
    const container = slotsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollPosition(container.scrollLeft);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = slotsContainerRef.current
    ? scrollPosition + slotsContainerRef.current.clientWidth < slotsContainerRef.current.scrollWidth - 1
    : false;

  const scrollLeft = () => {
    slotsContainerRef.current?.scrollBy({ left: -280, behavior: 'smooth' });
  };

  const scrollRight = () => {
    slotsContainerRef.current?.scrollBy({ left: 280, behavior: 'smooth' });
  };

  const go = (path) => () => navigate(path);

  const stats = data?.stats ?? {};
  const turfs = data?.turfs ?? [];
  const quickAvailableSlots = data?.quickAvailableSlots ?? [];
  const newBookings = data?.newBookings ?? [];

  const turfFilterOptions = [
    { value: 'All', label: 'All Turfs' },
    ...turfs.map(t => ({ value: t.id, label: t.name })),
  ];

  const allSlots = quickAvailableSlots.flatMap(group =>
    group.slots.map(slot => ({
      ...slot,
      turfName: group.turfName,
    }))
  );

  const turfFilteredSlots = turfFilter === 'All'
    ? allSlots
    : allSlots.filter(slot => {
        const group = quickAvailableSlots.find(g => g.turfId === turfFilter);
        return slot.turfName === group?.turfName;
      });

  const FILTERS = ['All', 'Morning', 'Evening', 'Night'];
  const filteredSlots = slotFilter === 'All'
    ? turfFilteredSlots
    : turfFilteredSlots.filter(slot => {
        const hour = parseInt(slot.startTime?.split(':')[0] || '0', 10);
        if (slotFilter === 'Morning') return hour >= 5 && hour < 12;
        if (slotFilter === 'Evening') return hour >= 12 && hour < 18;
        if (slotFilter === 'Night') return hour >= 18 || hour < 5;
        return true;
      });

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) return <PageLoading />;
  if (error && !data) return <PageError message={error} onRetry={fetchData} />;

  return (
    <div className="min-h-screen bg-[var(--color-bg-default)]" style={{ fontFamily: 'Roboto, sans-serif' }}>

      <div className="sticky top-0 z-20 bg-[var(--color-bg-paper)] border-b border-[var(--color-divider)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[var(--color-text-primary)] leading-tight truncate">
              {getGreeting()}, <span className="text-[var(--color-primary)]">{user?.firstName || 'Owner'}</span>
            </h1>
            <p className="text-[11px] text-[var(--color-text-secondary)]">{dateStr}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={go('/owner/bookings')}
              className="hidden sm:flex items-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] font-semibold px-3.5 py-2 rounded-xl text-xs transition-all"
            >
              <RiCalendarEventLine className="text-sm" /> Bookings
            </button>
            <button
              onClick={go('/owner/slots')}
              className="hidden sm:flex items-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] font-semibold px-3.5 py-2 rounded-xl text-xs transition-all"
            >
              <RiTimeLine className="text-sm" /> Book Slot
            </button>
            <button
              onClick={go('/owner/add-turf')}
              className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[color-mix(in srgb,var(--color-primary)_90%,black)] text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              <RiAddCircleLine className="text-sm" />
              <span>Add Turf</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BigStat
            icon={RiCalendarCheckLine}
            iconBg="bg-violet-100"
            iconColor="text-violet-500"
            label="Upcoming bookings (next 7 days)"
            value={formatNumber(stats.upcomingBookedCount)}
            trend={stats.bookedTrend ?? null}
            sub={`This month: ${formatNumber(stats.thisMonthBookings)} bookings`}
          />
          <BigStat
            icon={RiMoneyRupeeCircleLine}
            iconBg="bg-[var(--color-primary-light)]"
            iconColor="text-[var(--color-primary)]"
            label="Revenue this month"
            value={formatRupee(stats.thisMonthRevenue)}
            trend={stats.revenueTrend ?? null}
            sub={`All-time: ${formatRupee(stats.totalRevenue)}`}
          />
          <BigStat
            icon={RiTimeLine}
            iconBg="bg-sky-50"
            iconColor="text-sky-500"
            label="Available slots today"
            value={formatNumber(stats.todayAvailableSlots)}
            trend={null}
            sub={`Booked today: ${formatNumber(stats.todayBookedSlots)} · Total: ${formatNumber(stats.todayTotalSlots)}`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <div className="lg:col-span-2 space-y-6">

            <section>
              <h2 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ActionTile icon={RiAddCircleLine} label="Add Turf" desc="List new venue" onClick={go('/owner/add-turf')} accent />
                <ActionTile icon={RiCalendarEventLine} label="Bookings" desc="View all" onClick={go('/owner/bookings')} />
                <ActionTile icon={RiTimeLine} label="Book Slot" desc="Manage slots" onClick={go('/owner/slots')} />
                <ActionTile icon={RiBarChartBoxLine} label="Revenue" desc="Earnings overview" onClick={go('/owner/revenue')} />
              </div>
            </section>

            <Card title="Today's Slot Info" onViewAll={go('/owner/slots')}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between px-5 py-3 bg-[var(--color-bg-default)] border-b border-[var(--color-divider)]">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Total all slots <span className="font-bold text-[var(--color-text-primary)]">{formatNumber(stats.todayTotalSlots)}</span>
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1 bg-[var(--color-bg-paper)] border border-[var(--color-divider)] rounded-xl p-1">
                    {FILTERS.map(f => (
                      <button
                        key={f}
                        onClick={() => setSlotFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                          slotFilter === f
                            ? 'bg-[var(--color-primary)] text-white shadow-sm'
                            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <select
                    value={turfFilter}
                    onChange={e => setTurfFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-[var(--color-divider)] rounded-lg text-sm font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    {turfFilterOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative p-5">
                {filteredSlots.length === 0 ? (
                  <Empty icon={RiTimeLine} title="No slots today" desc="Slots for your turfs will appear here once added." />
                ) : (
                  <div className="relative">
                    <div
                      ref={slotsContainerRef}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {filteredSlots.slice(0, 6).map((slot, i) => (
                        <div key={slot.id || i} className="snap-start">
                          <SlotCard slot={slot} />
                        </div>
                      ))}
                    </div>

                    {filteredSlots.length > 6 && (
                      <>
                        <button
                          onClick={scrollLeft}
                          disabled={!canScrollLeft}
                          className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white z-10 hidden sm:flex items-center justify-center transition-all ${
                            canScrollLeft ? 'cursor-pointer opacity-100 hover:shadow-xl' : 'cursor-not-allowed opacity-40'
                          }`}
                        >
                          <RiArrowLeftSLine className="text-2xl text-[var(--color-primary)]" />
                        </button>

                        <button
                          onClick={scrollRight}
                          disabled={!canScrollRight}
                          className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white z-10 hidden sm:flex items-center justify-center transition-all ${
                            canScrollRight ? 'cursor-pointer opacity-100 hover:shadow-xl' : 'cursor-not-allowed opacity-40'
                          }`}
                        >
                          <RiArrowRightSLine className="text-2xl text-[var(--color-primary)]" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>

            <Card
              title="My Turfs"
              onViewAll={go('/owner/turfs')}
              viewAllLabel={turfs.length > 3 ? `View all ${turfs.length}` : 'View all'}
            >
              {turfs.length === 0 ? (
                <Empty
                  icon={RiBuilding2Line}
                  title="No turfs yet"
                  desc="Add your first turf to start receiving bookings."
                  action={
                    <button
                      onClick={go('/owner/add-turf')}
                      className="mt-2 flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[color-mix(in srgb,var(--color-primary)_90%,black)] text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
                    >
                      <RiAddCircleLine /> Add Turf
                    </button>
                  }
                />
              ) : (
                <div className="divide-y divide-[var(--color-divider)]">
                  {turfs.slice(0, 3).map((turf) => {
                    const st = getStatusStyle(turf.status);
                    const loc = [turf.area, turf.city].filter(Boolean).join(', ') || 'Location not set';
                    const img = turf.coverImage || turf.images?.[0];
                    return (
                      <div key={turf.id || turf._id} className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--color-bg-default)] transition-colors">
                        <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden bg-[var(--color-primary-light)]">
                          {img ? (
                            <img src={img} alt={turf.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <RiBuilding2Line className="text-2xl text-[var(--color-primary)]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{turf.name}</p>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text} shrink-0`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                              {st.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1 mb-1.5">
                            <RiMapPinLine className="text-[var(--color-primary)] shrink-0" /> {loc}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {turf.sports?.map((s, i) => (
                              <span
                                key={i}
                                className={`text-[10px] px-2.5 py-1 rounded-full font-medium border border-gray-200 ${getSportClass()}`}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="shrink-0 text-right hidden sm:block">
                          <p className="text-sm font-extrabold text-[var(--color-primary)]">
                            {turf.pricePerSlot ? formatRupee(turf.pricePerSlot) : '₹0'}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-secondary)] mb-2">per slot</p>
                          <button
                            onClick={() => navigate(`/owner/turf/${turf.id || turf._id}`)}
                            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all"
                          >
                            Manage →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <div className="bg-[var(--color-bg-paper)] rounded-2xl border border-[var(--color-divider)] p-5">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">At a Glance</h2>
              <div className="space-y-3">
                {[
                  { label: 'Total Turfs', value: formatNumber(stats.totalTurfs), icon: RiBuilding2Line, bg: 'bg-[var(--color-primary-light)]', color: 'text-[var(--color-primary)]' },
                  { label: 'Active Turfs', value: formatNumber(stats.activeTurfs), icon: RiCheckboxCircleFill, bg: 'bg-[var(--color-primary-light)]', color: 'text-[var(--color-primary)]' },
                  { label: 'Total Revenue', value: formatRupee(stats.totalRevenue), icon: RiWalletLine, bg: 'bg-amber-50', color: 'text-[var(--color-secondary)]' },
                  { label: 'Slots Today', value: formatNumber(stats.todayAvailableSlots), icon: RiTimeLine, bg: 'bg-violet-50', color: 'text-violet-500' },
                ].map(({ label, value, icon: Icon, bg, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                        <Icon className={`text-sm ${color}`} />
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
                    </div>
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card
              title="New Bookings"
              badge={stats.newBookingsToday}
              onViewAll={go('/owner/bookings')}
              viewAllLabel="View all bookings"
            >
              {newBookings.length === 0 ? (
                <Empty
                  icon={RiCalendarEventLine}
                  title="No bookings yet"
                  desc="New player bookings will appear here."
                />
              ) : (
                <>
                  {newBookings.slice(0, 4).map((b, i) => (
                    <NewBookingRow
                      key={b.id || i}
                      booking={b}
                      onView={go('/owner/bookings')}
                    />
                  ))}
                  <div className="px-5 py-3 border-t border-[var(--color-divider)]">
                    <button
                      onClick={go('/owner/bookings')}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:opacity-70 transition-opacity py-1"
                    >
                      <RiEyeLine /> View all bookings
                    </button>
                  </div>
                </>
              )}
            </Card>

            <button
              onClick={go('/owner/revenue')}
              className="w-full flex items-center gap-3 p-4 bg-[var(--color-primary-light)] rounded-2xl border border-[color-mix(in srgb,var(--color-primary)_20%,transparent)] hover:shadow-md transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center shrink-0">
                <RiBarChartBoxLine className="text-white text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--color-text-primary)]">Revenue Overview</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Track earnings & trends</p>
              </div>
              <RiArrowRightSLine className="text-[var(--color-primary)] text-xl group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <div className="flex gap-3 sm:hidden">
              <button
                onClick={go('/owner/bookings')}
                className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] font-semibold py-3 rounded-xl text-xs hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
              >
                <RiCalendarEventLine /> Bookings
              </button>
              <button
                onClick={go('/owner/slots')}
                className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-divider)] text-[var(--color-text-primary)] font-semibold py-3 rounded-xl text-xs hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
              >
                <RiTimeLine /> Book Slot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;