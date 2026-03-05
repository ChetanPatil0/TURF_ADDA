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
  RiImageLine,
  RiCalendarLine,
  RiContactsLine,
  RiFileTextLine,
  RiArrowLeftLine,
  RiBankCardLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import { getTurfById, deleteTurf } from '../../api/turfApi';
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
    error:    'bg-[#FEE2E2] text-[#F87171]',
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

const TurfDetailOwnerView = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showMessage } = useMessageModal();

  const [turf, setTurf] = useState(state?.turf || null);
  const [loading, setLoading] = useState(!state?.turf);

  useEffect(() => {
    if (!turf && id) {
      (async () => {
        try {
          const data = await getTurfById(id);
          setTurf(data?.data?.turf || data?.turf || data);
        } catch (err) {
          showMessage({
            type: 'error',
            title: 'Error',
            message: 'Failed to load turf details.',
          });
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [turf, id, showMessage]);

  const handleDelete = () => {
    showMessage({
      type: 'warning',
      title: 'Delete Turf',
      message: 'Are you sure you want to delete this turf? This cannot be undone.',
      primaryText: 'Delete',
      secondaryText: 'Cancel',
      onPrimary: async () => {
        try {
          await deleteTurf(id);
          showMessage({
            type: 'success',
            title: 'Deleted',
            message: 'Turf has been deleted successfully.',
          });
          navigate('/owner/turfs');
        } catch (err) {
          showMessage({
            type: 'error',
            title: 'Delete Failed',
            message: err?.response?.data?.message || 'Could not delete turf.',
          });
        }
      },
    });
  };

  if (loading) return <div className="py-[40vh] text-center"><Loader /></div>;

  if (!turf) return (
    <div className="py-24 px-5 text-center text-[var(--color-text-secondary)]">
      <h2>Turf not found</h2>
      <button 
        onClick={() => navigate(-1)} 
        className="mt-4 px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg"
      >
        Go Back
      </button>
    </div>
  );

  const loc = turf.location || {};
  const owner = turf.owner || {};
  const contact = turf.contact || {};
  const bank = turf.bankDetails || {};
  const ownerName = owner.fullName || `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || '—';

  const isRejected = turf.status === 'rejected';

  return (
    <div className="bg-[var(--color-bg-default)] min-h-screen pb-12">

      <div className="sticky top-0 bg-[var(--color-bg-paper)] border-b border-[var(--color-divider)] px-5 py-3 z-[1000] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5  border-[var(--color-divider)] rounded-lg bg-[var(--color-bg-paper)] text-[var(--color-text-secondary)] hover:bg-gray-50 transition"
          >
            <RiArrowLeftLine size={18} /> Back
          </button>

          <div>
            <h1 className="m-0 text-[1.3rem] font-semibold text-[var(--color-primary)]">
              {turf.name}
            </h1>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <Badge
                label={capLabel(turf.status || 'unknown')}
                variant={
                  turf.status === 'active' ? 'success' :
                  turf.status === 'rejected' ? 'error' :
                  turf.status === 'pending' ? 'warning' : 'neutral'
                }
                tiny
              />
              {turf.isVerified && (
                <Badge label="VERIFIED" variant="success" tiny />
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => navigate(`/turf/${id}/edit`)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition text-sm"
          >
            <RiEdit2Line size={16} /> Edit Turf
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-1.5 border border-[var(--color-error)] text-[var(--color-error)] rounded-lg font-medium hover:bg-red-50 transition text-sm"
          >
            <RiDeleteBinLine size={16} /> Delete
          </button>
        </div>
      </div>

      {isRejected && (
        <div className="max-w-6xl mx-auto mt-6 px-5">
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4">
            <RiErrorWarningLine className="text-red-600 text-2xl flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-red-800 font-semibold text-lg mb-1">This turf was rejected</h3>
              <p className="text-red-700">
                {turf.verification?.verificationNotes 
                  ? `Reason: ${turf.verification.verificationNotes}`
                  : "No specific reason was provided by the admin."}
              </p>
              <p className="text-red-600 text-sm mt-2">
                You can edit the information and resubmit for verification.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-5 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

          <div className="flex flex-col gap-6">

            <Section icon={RiBuilding2Line} title="Turf Information">
              {turf.description && (
                <p className="mb-6 text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                  {turf.description}
                </p>
              )}

              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-6 gap-y-4">
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

            <Section icon={RiContactsLine} title="Contact Information">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
                <Field label="Contact Person" value={contact.contactPersonName} />
                <Field label="Primary Mobile" value={contact.primaryMobile} />
                <Field label="Secondary Mobile" value={contact.secondaryMobile || '—'} />
              </div>
            </Section>

            <Section icon={RiBankCardLine} title="Bank Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Field label="Account Number" value={bank.accountNumber} />
                  <Field label="IFSC Code" value={bank.ifscCode} />
                </div>

                <div>
                  <div className="text-[0.78rem] font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wide">
                    Passbook / Cancelled Cheque
                  </div>
                  {bank.passbookImage ? (
                    <a
                      href={`${BASE_URL_MEDIA}${bank.passbookImage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition font-medium text-sm"
                    >
                      <RiFileTextLine size={18} />
                      View Document
                    </a>
                  ) : (
                    <EmptyBox text="No document uploaded" />
                  )}
                </div>
              </div>
            </Section>

            <Section icon={RiMapPinLine} title="Location">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5 mb-6">
                <Field label="Address" value={loc.address} />
                <Field label="Area" value={loc.area} />
                <Field label="City" value={loc.city} />
                <Field label="State" value={loc.state} />
                <Field label="Pincode" value={loc.pincode} />
                <Field label="Landmark" value={loc.landmark} />
              </div>

              {loc.latitude && loc.longitude ? (
                <div className="h-[320px] md:h-[380px] rounded-xl overflow-hidden border border-[var(--color-divider)] shadow-sm">
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
              <div className="mb-6">
                <div className="font-semibold mb-3 text-[var(--color-text-primary)]">Photos</div>
                {turf.images?.length > 0 || turf.coverImage ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
                    {turf.coverImage && (
                      <img
                        src={`${BASE_URL_MEDIA}${turf.coverImage}`}
                        alt="Cover"
                        className="w-full h-[140px] object-cover rounded-lg shadow-sm"
                        loading="lazy"
                      />
                    )}
                    {turf.images?.map((img, i) => (
                      <img
                        key={i}
                        src={`${BASE_URL_MEDIA}${img}`}
                        alt={`Turf image ${i + 1}`}
                        className="w-full h-[140px] object-cover rounded-lg shadow-sm"
                        loading="lazy"
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyBox text="No photos uploaded yet" />
                )}
              </div>

              <div>
                <div className="font-semibold mb-3 text-[var(--color-text-primary)]">Videos</div>
                {turf.videos?.length > 0 ? (
                  turf.videos.map((vid, i) => (
                    <video
                      key={i}
                      controls
                      className="w-full max-h-[360px] rounded-lg mb-4 shadow-sm"
                      preload="metadata"
                    >
                      <source src={`${BASE_URL_MEDIA}${vid}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ))
                ) : (
                  <EmptyBox text="No videos uploaded yet" />
                )}
              </div>
            </Section>
          </div>

          <div className="sticky top-20 self-start flex flex-col gap-5">
            <Section icon={RiUserLine} title="Owner Information">
              <div className="flex items-center gap-3 mb-5">
                <UserAvatar
                  size="medium"
                  profileImageUrl={owner.profileImage ? `${BASE_URL_MEDIA}${owner.profileImage}` : null}
                  name={ownerName}
                />
                <div>
                  <div className="font-semibold text-[1.1rem]">{ownerName}</div>
                  <div className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                    Owner
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <OwnerRow icon={RiPhoneLine} value={owner.mobile} />
                <OwnerRow icon={RiMailLine} value={owner.email || '—'} />
                <OwnerRow icon={RiCalendarLine} value={owner.createdAt ? `Joined ${formatDateDDMMYYYY(owner.createdAt)}` : null} />
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TurfDetailOwnerView;