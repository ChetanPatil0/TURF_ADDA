// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate, useParams } from 'react-router-dom';
// import Loader from '../../components/common/Loader';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import {
//   RiBuilding2Line,
//   RiMapPinLine,
//   RiUserLine,
//   RiPhoneLine,
//   RiMailLine,
//   RiShieldCheckLine,
//   RiCloseCircleLine,
//   RiArrowLeftLine,
//   RiImageLine,
//   RiCalendarLine,
//   RiCheckboxCircleLine,
// } from 'react-icons/ri';
// import { getTurfById } from '../../api/turfApi';
// import { verifyTurf } from '../../api/adminApi';
// import { useMessageModal } from '../../context/MessageModalContext';
// import { formatDateDDMMYYYY, formatRupee, formatTime } from '../../utils';
// import UserAvatar from '../../components/common/UserAvatar';

// const capLabel = (s) =>
//   s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';



// const Badge = ({ label, variant = 'neutral', small = false, tiny = false }) => {
//   const variants = {
//     primary:  'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
//     warning:  'bg-[#FEF3C7] text-[#B45309]',
//     error:    'bg-[#FEE2E2] text-[var(--color-error)]',
//     neutral:  'bg-[var(--color-divider)] text-[var(--color-text-secondary)]',
//     success:  'bg-[#D1FAE5] text-[#065F46]',
//   };

//   const sizeClasses = tiny
//     ? 'px-2 py-0.5 text-[0.65rem]'
//     : small
//     ? 'px-2.5 py-1 text-[0.68rem]'
//     : 'px-3 py-1.5 text-[0.75rem]';

//   return (
//     <span
//       className={`
//         ${variants[variant] || variants.neutral}
//         ${sizeClasses}
//         rounded-full font-bold uppercase tracking-wide inline-block
//       `}
//     >
//       {label}
//     </span>
//   );
// };

// const Section = ({ icon: Icon, title, children }) => (
//   <div className="bg-[var(--color-bg-paper)] rounded-xl shadow-sm overflow-hidden">
//     <div className="px-5 py-3.5 border-b border-[var(--color-divider)] flex items-center gap-2.5">
//       {Icon && <Icon size={18} className="text-[var(--color-primary)]" />}
//       <h3 className="m-0 text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>
//     </div>
//     <div className="p-5">{children}</div>
//   </div>
// );

// const Field = ({ label, value }) => (
//   value ? (
//     <div className="mb-3">
//       <div className="text-[0.78rem] font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wide">
//         {label}
//       </div>
//       <div className="text-[0.95rem] text-[var(--color-text-primary)]">
//         {value}
//       </div>
//     </div>
//   ) : null
// );

// const Hr = () => <div className="h-px bg-[var(--color-divider)] my-4" />;

// const TagGroup = ({ label, items, variant = 'neutral' }) =>
//   items?.length > 0 ? (
//     <div className="mb-4">
//       <div className="text-[0.78rem] font-semibold text-[var(--color-text-secondary)] mb-2 uppercase">
//         {label}
//       </div>
//       <div className="flex flex-wrap gap-2">
//         {items.map((item) => (
//           <Badge key={item} label={capLabel(item)} variant={variant} />
//         ))}
//       </div>
//     </div>
//   ) : null;

// const OwnerRow = ({ icon: Icon, value }) =>
//   value ? (
//     <div className="flex items-center gap-2.5 mb-2.5">
//       <Icon size={16} className="text-[var(--color-primary)]" />
//       <span className="text-[0.92rem] text-[var(--color-text-primary)]">{value}</span>
//     </div>
//   ) : null;

// const EmptyBox = ({ text }) => (
//   <div className="p-5 text-center text-[var(--color-text-secondary)] italic border border-dashed border-[var(--color-divider)] rounded-lg">
//     {text}
//   </div>
// );

// // Custom Reject Modal
// const RejectModal = ({ isOpen, onClose, onConfirm }) => {
//   const [reason, setReason] = useState('');

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000]">
//       <div className="bg-[var(--color-bg-paper)] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
//         <h2 className="text-xl font-semibold mb-5 text-[var(--color-text-primary)]">Reject Turf</h2>
        
//         <div className="mb-6">
//           <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
//             Reason for rejection (optional)
//           </label>
//           <textarea
//             value={reason}
//             onChange={(e) => setReason(e.target.value)}
//             className="w-full p-3 border border-[var(--color-divider)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] resize-y min-h-[100px] text-sm"
//             placeholder="Enter reason here..."
//           />
//         </div>

//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-5 py-2 border border-[var(--color-divider)] rounded-lg text-[var(--color-text-secondary)] hover:bg-gray-50 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={() => onConfirm(reason)}
//             className="px-5 py-2 bg-[var(--color-error)] text-white rounded-lg hover:bg-red-600 transition"
//           >
//             Reject
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const TurfVerifyDetail = () => {
//   const { id } = useParams();
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const { showMessage } = useMessageModal();

//   const [turf, setTurf] = useState(state?.turf || null);
//   const [loading, setLoading] = useState(!state?.turf);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [rejectReason, setRejectReason] = useState('');

//   useEffect(() => {
//     if (!turf && id) {
//       (async () => {
//         try {
//           const data = await getTurfById(id);
//           setTurf(data.turf || data);
//         } catch {
//         } finally {
//           setLoading(false);
//         }
//       })();
//     } else {
//       setLoading(false);
//     }
//   }, [turf, id]);

// const handleApprove = () => {
//   showMessage({
//     type: 'confirm',
//     title: 'Approve Turf?',
//     message: 'Do you really want to approve this turf ?',
//     primaryText: 'Confirm',
//     secondaryText: 'Cancel',
//     onPrimary: async () => {
//       setActionLoading(true);
//       try {
        
//         await verifyTurf(id,true);

//         showMessage({
//           type: 'success',
//           title: 'Success',
//           message: 'Turf has been approved successfully.',
//         });

//         // Small delay for user to see success message, then navigate
//         setTimeout(() => {
//           navigate('/admin/turfs/pending');
//         }, 1200);
//       } catch (err) {
//         showMessage({
//           type: 'error',
//           title: 'Approval Failed',
//           message: err?.response?.data?.message || 'Failed to approve turf. Please try again.',
//         });
//       } finally {
//         setActionLoading(false);
//       }
//     },
//   });
// };

//  const handleRejectConfirm = async () => {
//   setShowRejectModal(false);
//   setActionLoading(true);
//   try {
  
//     await verifyTurf(id, { 
//       isVerified: false, 
//       verificationNotes: rejectReason.trim() 
//     });

//     showMessage({
//       type: 'success',
//       title: 'Success',
//       message: 'Turf has been rejected successfully.',
//     });

//     setTimeout(() => {
//       navigate('/admin/turfs/pending');
//     }, 1200);
//   } catch (err) {
//     showMessage({
//       type: 'error',
//       title: 'Rejection Failed',
//       message: err?.response?.data?.message || 'Failed to reject turf. Please try again.',
//     });
//   } finally {
//     setActionLoading(false);
//     setRejectReason('');
//   }
// };

//   if (loading) return <div className="py-[40vh] text-center"><Loader /></div>;

//   if (!turf) return (
//     <div className="py-24 px-5 text-center text-[var(--color-text-secondary)]">
//       <h2>Turf not found</h2>
//       <button onClick={() => navigate('/admin/turfs/pending')}>Back to list</button>
//     </div>
//   );

//   const loc = turf.location || {};
//   const owner = turf.owner || {};
//   const ownerName = owner.fullName || `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || '—';

//   return (
//     <div className="bg-[var(--color-bg-default)] min-h-screen">

//       {/* Header */}
//       <div className="sticky top-0 bg-[var(--color-bg-paper)] border-b border-[var(--color-divider)] px-5 py-2 z-[1000] flex items-center justify-between shadow-sm">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate('/admin/turfs/pending')}
//             className="flex items-center gap-1.5 px-3 py-1 border border-[var(--color-divider)] rounded-lg bg-[var(--color-bg-paper)] text-[var(--color-text-secondary)] hover:bg-gray-50 transition text-sm"
//           >
//             <RiArrowLeftLine size={16} /> Back
//           </button>

//           <div>
//             <h1 className="m-0 text-[1.15rem] font-medium text-[var(--color-primary)]">
//               {turf.name}
//             </h1>
//             <div className="mt-1">
//               <Badge
//                 label={turf.status === 'pending' ? 'Pending Verification' : capLabel(turf.status)}
//                 variant={turf.status === 'pending' ? 'warning' : turf.status === 'active' ? 'success' : 'neutral'}
//                 tiny
//               />
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-2.5">
//           <button
//             disabled={actionLoading}
//             onClick={() => setShowRejectModal(true)}
//             className={`
//               px-4 py-1.5 border border-[var(--color-error)] text-[var(--color-error)] rounded-lg font-medium text-sm
//               ${actionLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-50 transition'}
//             `}
//           >
//             Reject
//           </button>
//           <button
//             disabled={actionLoading}
//             onClick={handleApprove}
//             className={`
//               px-5 py-1.5 bg-[var(--color-primary)] text-white rounded-lg font-medium text-sm
//               ${actionLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-600 transition'}
//             `}
//           >
//             Approve
//           </button>
//         </div>
//       </div>

//       {/* Reject Modal */}
//       <RejectModal
//         isOpen={showRejectModal}
//         onClose={() => setShowRejectModal(false)}
//         onConfirm={handleRejectConfirm}
//       />

//       <div className="max-w-6xl mx-auto p-6">
//         <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

//           <div className="flex flex-col gap-6">

//             <Section icon={RiBuilding2Line} title="Turf Information">
//               {turf.description && (
//                 <p className="mb-5 text-[var(--color-text-secondary)] leading-relaxed">{turf.description}</p>
//               )}

//               <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5">
//                 <Field label="Turf ID" value={turf._id || turf.id} />
//                 <Field label="Registration Date" value={formatDateDDMMYYYY(turf.createdAt)} />
//                 <Field label="Surface" value={capLabel(turf.surfaceType)} />
//                 <Field label="Size" value={turf.size} />
//                 <Field label="Price / slot" value={turf.pricePerSlot ? formatRupee(turf.pricePerSlot) : null} />
//                 <Field label="Commission" value={turf.platformCommissionRate ? `${(turf.platformCommissionRate * 100).toFixed(0)}%` : null} />
//                 <Field label="Slot Duration" value={turf.slotDurationMinutes ? `${turf.slotDurationMinutes} min` : null} />
//                 <Field label="Opening" value={formatTime(turf.openingTime)} />
//                 <Field label="Closing" value={formatTime(turf.closingTime)} />
//                 <Field label="Active" value={turf.isActive ? 'Yes' : 'No'} />
//               </div>

//               <Hr />

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <TagGroup label="Sports" items={turf.sports} variant="primary" />
//                 <TagGroup label="Amenities" items={turf.amenities} variant="neutral" />
//               </div>
//             </Section>

//             <Section icon={RiMapPinLine} title="Location">
//               <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5 mb-5">
//                 <Field label="Address" value={loc.address} />
//                 <Field label="Area" value={loc.area} />
//                 <Field label="City" value={loc.city} />
//                 <Field label="State" value={loc.state} />
//                 <Field label="Pincode" value={loc.pincode} />
//                 <Field label="Landmark" value={loc.landmark} />
//               </div>

//               {loc.latitude && loc.longitude ? (
//                 <div className="h-[300px] rounded-lg overflow-hidden border border-[var(--color-divider)]">
//                   <MapContainer
//                     center={[loc.latitude, loc.longitude]}
//                     zoom={15}
//                     style={{ height: '100%', width: '100%' }}
//                     scrollWheelZoom={false}
//                   >
//                     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                     <Marker position={[loc.latitude, loc.longitude]}>
//                       <Popup>{turf.name}<br />{loc.address || '—'}</Popup>
//                     </Marker>
//                   </MapContainer>
//                 </div>
//               ) : (
//                 <EmptyBox text="No location coordinates available" />
//               )}
//             </Section>

//             <Section icon={RiImageLine} title="Photos & Videos">
//               <div className="mb-5">
//                 <div className="font-semibold mb-2.5 text-[var(--color-text-primary)]">Photos</div>
//                 {turf.images?.length > 0 || turf.coverImage ? (
//                   <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
//                     {turf.coverImage && (
//                       <img src={turf.coverImage} alt="Cover" className="w-full h-[120px] object-cover rounded-lg" />
//                     )}
//                     {turf.images?.map((img, i) => (
//                       <img key={i} src={img} alt={`Image ${i+1}`} className="w-full h-[120px] object-cover rounded-lg" />
//                     ))}
//                   </div>
//                 ) : (
//                   <EmptyBox text="No photos uploaded" />
//                 )}
//               </div>

//               <div>
//                 <div className="font-semibold mb-2.5 text-[var(--color-text-primary)]">Videos</div>
//                 {turf.videos?.length > 0 ? (
//                   turf.videos.map((vid, i) => (
//                     <video key={i} controls className="w-full max-h-[300px] rounded-lg mb-3">
//                       <source src={vid} />
//                     </video>
//                   ))
//                 ) : (
//                   <EmptyBox text="No videos uploaded" />
//                 )}
//               </div>
//             </Section>
//           </div>

//           <div className="sticky top-20 self-start flex flex-col gap-5">

//             <Section icon={RiUserLine} title="Owner">
//               <div className="flex items-center gap-3 mb-4">
//                 <UserAvatar size="medium" profileImageUrl={owner.profileImage} name={ownerName} />
//                 <div>
//                   <div className="font-semibold text-[1.05rem]">{ownerName}</div>
//                   <Badge label={capLabel(owner.status || 'unknown')} variant="success" tiny />
//                 </div>
//               </div>

//               <div className="flex flex-col gap-2">
//                 <OwnerRow icon={RiPhoneLine} value={owner.mobile} />
//                 <OwnerRow icon={RiMailLine} value={owner.email} />
//                 <OwnerRow icon={RiCalendarLine} value={owner.createdAt ? `Joined ${formatDateDDMMYYYY(owner.createdAt)}` : null} />
//               </div>
//             </Section>

//             <Section icon={RiCheckboxCircleLine} title="Quick Status">
//               <div className="flex flex-col gap-2.5">
//                 <div className="flex justify-between">
//                   <span className="text-[var(--color-text-secondary)]">Verification</span>
//                   <strong className={turf.isVerified ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}>
//                     {turf.isVerified ? 'Verified' : 'Pending'}
//                   </strong>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-[var(--color-text-secondary)]">Active</span>
//                   <strong className={turf.isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}>
//                     {turf.isActive ? 'Yes' : 'No'}
//                   </strong>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-[var(--color-text-secondary)]">Staff</span>
//                   <strong className="text-[var(--color-text-primary)]">{turf.staff?.length || 0}</strong>
//                 </div>
//               </div>
//             </Section>

//             <div className="bg-[var(--color-bg-paper)] rounded-xl p-5 shadow-sm">
//               <div className="font-semibold mb-3">Actions</div>
//               <div className="flex flex-col gap-2.5">
//                 <button
//                   onClick={handleApprove}
//                   disabled={actionLoading}
//                   className={`
//                     py-3 px-4 bg-[var(--color-primary)] text-white rounded-lg font-medium
//                     ${actionLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-600 transition'}
//                   `}
//                 >
//                   Approve Turf
//                 </button>
//                 <button
//                   onClick={() => setShowRejectModal(true)}
//                   disabled={actionLoading}
//                   className={`
//                     py-3 px-4 border border-[var(--color-error)] text-[var(--color-error)] rounded-lg font-medium
//                     ${actionLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-50 transition'}
//                   `}
//                 >
//                   Reject Turf
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TurfVerifyDetail;


import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/common/Loader';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RiBuilding2Line,
  RiMapPinLine,
  RiUserLine,
  RiPhoneLine,
  RiMailLine,
  RiShieldCheckLine,
  RiCloseCircleLine,
  RiArrowLeftLine,
  RiImageLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri';
import { getTurfById } from '../../api/turfApi';
import { verifyTurf } from '../../api/adminApi';
import { useMessageModal } from '../../context/MessageModalContext';
import { formatDateDDMMYYYY, formatRupee, formatTime } from '../../utils';
import UserAvatar from '../../components/common/UserAvatar';
import { BASE_URL_MEDIA } from '../../const';




const capLabel = (s) =>
  s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const Badge = ({ label, variant = 'neutral', small = false, tiny = false }) => {
  const variants = {
    primary:  'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
    warning:  'bg-[#FEF3C7] text-[#B45309]',
    error:    'bg-[#FEE2E2] text-[var(--color-error)]',
    neutral:  'bg-[var(--color-divider)] text-[var(--color-text-secondary)]',
    success:  'bg-[#D1FAE5] text-[#065F46]',
  };

  const sizeClasses = tiny
    ? 'px-2 py-0.5 text-[0.65rem]'
    : small
    ? 'px-2.5 py-1 text-[0.68rem]'
    : 'px-3 py-1.5 text-[0.75rem]';

  return (
    <span
      className={`
        ${variants[variant] || variants.neutral}
        ${sizeClasses}
        rounded-full font-bold uppercase tracking-wide inline-block
      `}
    >
      {label}
    </span>
  );
};

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-[var(--color-bg-paper)] rounded-xl shadow-sm overflow-hidden">
    <div className="px-5 py-3.5 border-b border-[var(--color-divider)] flex items-center gap-2.5">
      {Icon && <Icon size={18} className="text-[var(--color-primary)]" />}
      <h3 className="m-0 text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Field = ({ label, value }) => (
  value ? (
    <div className="mb-3">
      <div className="text-[0.78rem] font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-[0.95rem] text-[var(--color-text-primary)]">
        {value}
      </div>
    </div>
  ) : null
);

const Hr = () => <div className="h-px bg-[var(--color-divider)] my-4" />;

const TagGroup = ({ label, items, variant = 'neutral' }) =>
  items?.length > 0 ? (
    <div className="mb-4">
      <div className="text-[0.78rem] font-semibold text-[var(--color-text-secondary)] mb-2 uppercase">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} label={capLabel(item)} variant={variant} />
        ))}
      </div>
    </div>
  ) : null;

const OwnerRow = ({ icon: Icon, value }) =>
  value ? (
    <div className="flex items-center gap-2.5 mb-2.5">
      <Icon size={16} className="text-[var(--color-primary)]" />
      <span className="text-[0.92rem] text-[var(--color-text-primary)]">{value}</span>
    </div>
  ) : null;

const EmptyBox = ({ text }) => (
  <div className="p-5 text-center text-[var(--color-text-secondary)] italic border border-dashed border-[var(--color-divider)] rounded-lg">
    {text}
  </div>
);

const RejectModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[2000]">
      <div className="bg-[var(--color-bg-paper)] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-semibold mb-5 text-[var(--color-text-primary)]">Reject Turf</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Reason for rejection (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 border border-[var(--color-divider)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] resize-y min-h-[100px] text-sm"
            placeholder="Enter reason here..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-[var(--color-divider)] rounded-lg text-[var(--color-text-secondary)] hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-5 py-2 bg-[var(--color-error)] text-white rounded-lg hover:bg-red-600 transition"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const TurfVerifyDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showMessage } = useMessageModal();

  const [turf, setTurf] = useState(state?.turf || null);
  const [loading, setLoading] = useState(!state?.turf);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!turf && id) {
      (async () => {
        try {
          const data = await getTurfById(id);
          setTurf(data.turf || data);
        } catch {
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [turf, id]);

  const handleApprove = () => {
    showMessage({
      type: 'confirm',
      title: 'Approve Turf?',
      message: 'Do you really want to approve this turf ?',
      primaryText: 'Confirm',
      secondaryText: 'Cancel',
      onPrimary: async () => {
        setActionLoading(true);
        try {
          await verifyTurf(id, true);

          showMessage({
            type: 'success',
            title: 'Success',
            message: 'Turf has been approved successfully.',
          });

          setTimeout(() => {
            navigate('/admin/turfs/pending');
          }, 1200);
        } catch (err) {
          showMessage({
            type: 'error',
            title: 'Approval Failed',
            message: err?.response?.data?.message || 'Failed to approve turf. Please try again.',
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleRejectConfirm = async () => {
    setShowRejectModal(false);
    setActionLoading(true);
    try {
      await verifyTurf(id, { 
        isVerified: false, 
        verificationNotes: rejectReason.trim() 
      });

      showMessage({
        type: 'success',
        title: 'Success',
        message: 'Turf has been rejected successfully.',
      });

      setTimeout(() => {
        navigate('/admin/turfs/pending');
      }, 1200);
    } catch (err) {
      showMessage({
        type: 'error',
        title: 'Rejection Failed',
        message: err?.response?.data?.message || 'Failed to reject turf. Please try again.',
      });
    } finally {
      setActionLoading(false);
      setRejectReason('');
    }
  };

  if (loading) return <div className="py-[40vh] text-center"><Loader /></div>;

  if (!turf) return (
    <div className="py-24 px-5 text-center text-[var(--color-text-secondary)]">
      <h2>Turf not found</h2>
      <button onClick={() => navigate('/admin/turfs/pending')}>Back to list</button>
    </div>
  );

  const loc = turf.location || {};
  const owner = turf.owner || {};
  const ownerName = owner.fullName || `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || '—';

  return (
    <div className="bg-[var(--color-bg-default)] min-h-screen">

      {/* Header */}
      <div className="sticky top-0 bg-[var(--color-bg-paper)] border-b border-[var(--color-divider)] px-5 py-2 z-[1000] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/turfs/pending')}
            className="flex items-center gap-1.5 px-3 py-1 border border-[var(--color-divider)] rounded-lg bg-[var(--color-bg-paper)] text-[var(--color-text-secondary)] hover:bg-gray-50 transition text-sm"
          >
            <RiArrowLeftLine size={16} /> Back
          </button>

          <div>
            <h1 className="m-0 text-[1.15rem] font-medium text-[var(--color-primary)]">
              {turf.name}
            </h1>
            <div className="mt-1">
              <Badge
                label={turf.status === 'pending' ? 'Pending Verification' : capLabel(turf.status)}
                variant={turf.status === 'pending' ? 'warning' : turf.status === 'active' ? 'success' : 'neutral'}
                tiny
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            disabled={actionLoading}
            onClick={() => setShowRejectModal(true)}
            className={`
              px-4 py-1.5 border border-[var(--color-error)] text-[var(--color-error)] rounded-lg font-medium text-sm
              ${actionLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-50 transition'}
            `}
          >
            Reject
          </button>
          <button
            disabled={actionLoading}
            onClick={handleApprove}
            className={`
              px-5 py-1.5 bg-[var(--color-primary)] text-white rounded-lg font-medium text-sm
              ${actionLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-600 transition'}
            `}
          >
            Approve
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
      />

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

          <div className="flex flex-col gap-6">

            <Section icon={RiBuilding2Line} title="Turf Information">
              {turf.description && (
                <p className="mb-5 text-[var(--color-text-secondary)] leading-relaxed">{turf.description}</p>
              )}

              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5">
                <Field label="Turf ID" value={turf._id || turf.id} />
                <Field label="Registration Date" value={formatDateDDMMYYYY(turf.createdAt)} />
                <Field label="Surface" value={capLabel(turf.surfaceType)} />
                <Field label="Size" value={turf.size} />
                <Field label="Price / slot" value={turf.pricePerSlot ? formatRupee(turf.pricePerSlot) : null} />
                <Field label="Commission" value={turf.platformCommissionRate ? `${(turf.platformCommissionRate * 100).toFixed(0)}%` : null} />
                <Field label="Slot Duration" value={turf.slotDurationMinutes ? `${turf.slotDurationMinutes} min` : null} />
                <Field label="Opening" value={formatTime(turf.openingTime)} />
                <Field label="Closing" value={formatTime(turf.closingTime)} />
                <Field label="Active" value={turf.isActive ? 'Yes' : 'No'} />
              </div>

              <Hr />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TagGroup label="Sports" items={turf.sports} variant="primary" />
                <TagGroup label="Amenities" items={turf.amenities} variant="neutral" />
              </div>
            </Section>

            <Section icon={RiMapPinLine} title="Location">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5 mb-5">
                <Field label="Address" value={loc.address} />
                <Field label="Area" value={loc.area} />
                <Field label="City" value={loc.city} />
                <Field label="State" value={loc.state} />
                <Field label="Pincode" value={loc.pincode} />
                <Field label="Landmark" value={loc.landmark} />
              </div>

              {loc.latitude && loc.longitude ? (
                <div className="h-[300px] rounded-lg overflow-hidden border border-[var(--color-divider)]">
                  <MapContainer
                    center={[loc.latitude, loc.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[loc.latitude, loc.longitude]}>
                      <Popup>{turf.name}<br />{loc.address || '—'}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <EmptyBox text="No location coordinates available" />
              )}
            </Section>

            <Section icon={RiImageLine} title="Photos & Videos">
              <div className="mb-5">
                <div className="font-semibold mb-2.5 text-[var(--color-text-primary)]">Photos</div>
                {turf.images?.length > 0 || turf.coverImage ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
                    {console.log('conver iamge : ',`${BASE_URL_MEDIA}${turf.coverImage}`)}
                    {turf.coverImage && (

                      <img 
                        src={`${BASE_URL_MEDIA}${turf.coverImage}`} 
                        alt="Cover" 
                        className="w-full h-[120px] object-cover rounded-lg" 
                      />
                    )}
                    {turf.images?.map((img, i) => (
                      <img 
                        key={i} 
                        src={`${BASE_URL_MEDIA}${img}`} 
                        alt={`Image ${i+1}`} 
                        className="w-full h-[120px] object-cover rounded-lg" 
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyBox text="No photos uploaded" />
                )}
              </div>

              <div>
                <div className="font-semibold mb-2.5 text-[var(--color-text-primary)]">Videos</div>
                {turf.videos?.length > 0 ? (
                  turf.videos.map((vid, i) => (
                    <video 
                      key={i} 
                      controls 
                      className="w-full max-h-[300px] rounded-lg mb-3"
                    >
                      <source src={`${BASE_URL_MEDIA}${vid}`} />
                    </video>
                  ))
                ) : (
                  <EmptyBox text="No videos uploaded" />
                )}
              </div>
            </Section>
          </div>

          <div className="sticky top-20 self-start flex flex-col gap-5">

            <Section icon={RiUserLine} title="Owner">
              <div className="flex items-center gap-3 mb-4">
                <UserAvatar size="medium" profileImageUrl={owner.profileImage ? `${BASE_URL_MEDIA}${owner.profileImage}` : null} name={ownerName} />
                <div>
                  <div className="font-semibold text-[1.05rem]">{ownerName}</div>
                  <Badge label={capLabel(owner.status || 'unknown')} variant="success" tiny />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <OwnerRow icon={RiPhoneLine} value={owner.mobile} />
                <OwnerRow icon={RiMailLine} value={owner.email} />
                <OwnerRow icon={RiCalendarLine} value={owner.createdAt ? `Joined ${formatDateDDMMYYYY(owner.createdAt)}` : null} />
              </div>
            </Section>

            <Section icon={RiCheckboxCircleLine} title="Quick Status">
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Verification</span>
                  <strong className={turf.isVerified ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}>
                    {turf.isVerified ? 'Verified' : 'Pending'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Active</span>
                  <strong className={turf.isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}>
                    {turf.isActive ? 'Yes' : 'No'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Staff</span>
                  <strong className="text-[var(--color-text-primary)]">{turf.staff?.length || 0}</strong>
                </div>
              </div>
            </Section>

            <div className="bg-[var(--color-bg-paper)] rounded-xl p-5 shadow-sm">
              <div className="font-semibold mb-3">Actions</div>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className={`
                    py-3 px-4 bg-[var(--color-primary)] text-white rounded-lg font-medium
                    ${actionLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-600 transition'}
                  `}
                >
                  Approve Turf
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className={`
                    py-3 px-4 border border-[var(--color-error)] text-[var(--color-error)] rounded-lg font-medium
                    ${actionLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-50 transition'}
                  `}
                >
                  Reject Turf
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurfVerifyDetail;