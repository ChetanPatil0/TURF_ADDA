// src/pages/owner/AddTurf.jsx
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineCurrencyRupee,
  HiOutlineLocationMarker,
  HiOutlineClock,
} from 'react-icons/hi';
import {
  MdStadium,
  MdLocalParking,
  MdMeetingRoom,
  MdShower,
  MdWc,
  MdLightbulbOutline,
  MdWifi,
  MdEventSeat,
  MdMedicalServices,
  MdPower,
  MdScoreboard,
  MdSportsSoccer,
  MdSportsCricket,
  MdSportsBasketball,
  MdSportsTennis,
  MdDescription,
} from 'react-icons/md';
import { IoFootballOutline, IoWaterOutline, IoRestaurantOutline } from 'react-icons/io5';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { createTurf } from '../../api/turfApi';
import { useMessageModal } from '../../context/MessageModalContext';

const validationSchema = Yup.object({
  name: Yup.string().trim().min(3, 'Minimum 3 characters').max(100).required('Turf name is required'),
  description: Yup.string().max(1200),
  location: Yup.object({
    address: Yup.string().trim().required('Address is required'),
    city: Yup.string().trim().required('City is required'),
    state: Yup.string().trim(),
    pincode: Yup.string().trim(),
  }).required(),
  latitude: Yup.number().min(-90).max(90).required('Please select location on map'),
  longitude: Yup.number().min(-180).max(180).required('Please select location on map'),
  openingTime: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid format (HH:MM)')
    .required('Opening time is required'),
  closingTime: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid format (HH:MM)')
    .required('Closing time is required'),
  slotDurationMinutes: Yup.number()
    .oneOf([30, 60, 90, 120], 'Must be 30, 60, 90 or 120 minutes')
    .required('Slot duration is required'),
  sports: Yup.array().of(Yup.string()).min(1, 'Select at least one sport'),
  surfaceType: Yup.string()
    .oneOf(['natural_grass', 'artificial_turf', 'cement', 'hybrid', 'mat'])
    .required('Surface type is required'),
  size: Yup.string()
    .oneOf(['5-a-side', '7-a-side', '9-a-side', '11-a-side', 'full-court', 'other'])
    .required('Size is required'),
  pricePerHour: Yup.number()
    .min(100, 'Minimum ₹100')
    .max(50000, 'Price too high')
    .required('Price per hour is required'),
  amenities: Yup.array().of(Yup.string()).optional(),
});

const initialValues = {
  name: '',
  description: '',
  location: {
    address: '',
    city: '',
    state: '',
    pincode: '',
  },
  latitude: null,
  longitude: null,
  openingTime: '',
  closingTime: '',
  slotDurationMinutes: '60',
  sports: [],
  surfaceType: 'artificial_turf',
  size: '5-a-side',
  pricePerHour: '',
  amenities: [],
};

function LocationMarker({ setFieldValue }) {
  useMapEvents({
    click(e) {
      setFieldValue('latitude', e.latlng.lat);
      setFieldValue('longitude', e.latlng.lng);
    },
  });
  return null;
}

function SearchControl({ setFieldValue }) {
  const map = useMapEvents({});

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoClose: true,
      keepResult: true,
      showMarker: true,
      marker: {
        draggable: true,
      },
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (e) => {
      const { location } = e;
      setFieldValue('latitude', location.y);
      setFieldValue('longitude', location.x);

      // Parse address from search result
      const parts = (e.location.label || '').split(', ');
      if (parts.length >= 3) {
        setFieldValue('location.address', parts.slice(0, -3).join(', ') || '');
        setFieldValue('location.city', parts[parts.length - 3] || '');
        setFieldValue('location.state', parts[parts.length - 2] || '');
        setFieldValue('location.pincode', parts[parts.length - 1] || '');
      }
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, setFieldValue]);

  return null;
}

export default function AddTurf() {
  const { showMessage } = useMessageModal();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 3;
  const stepTitles = ['Location & Details', 'Timing & Pricing', 'Sports & Amenities'];

  const amenitiesList = [
    { value: 'parking', label: 'Parking', icon: MdLocalParking },
    { value: 'changing_room', label: 'Changing Room', icon: MdMeetingRoom },
    { value: 'shower', label: 'Shower', icon: MdShower },
    { value: 'restroom', label: 'Restroom', icon: MdWc },
    { value: 'lighting', label: 'Floodlights', icon: MdLightbulbOutline },
    { value: 'drinking_water', label: 'Drinking Water', icon: IoWaterOutline },
    { value: 'seating', label: 'Seating', icon: MdEventSeat },
    { value: 'first_aid', label: 'First Aid', icon: MdMedicalServices },
    { value: 'cafeteria', label: 'Cafeteria', icon: IoRestaurantOutline },
    { value: 'wifi', label: 'WiFi', icon: MdWifi },
    { value: 'power_backup', label: 'Power Backup', icon: MdPower },
    { value: 'scoreboard', label: 'Scoreboard', icon: MdScoreboard },
  ];

  const sportOptions = [
    { value: 'football', label: 'Football', icon: IoFootballOutline },
    { value: 'cricket', label: 'Cricket', icon: MdSportsCricket },
    { value: 'futsal', label: 'Futsal', icon: MdSportsSoccer },
    { value: 'badminton', label: 'Badminton', icon: MdSportsTennis },
    { value: 'basketball', label: 'Basketball', icon: MdSportsBasketball },
    { value: 'volleyball', label: 'Volleyball', icon: MdSportsTennis },
    { value: 'tennis', label: 'Tennis', icon: MdSportsTennis },
    { value: 'kabaddi', label: 'Kabaddi', icon: MdStadium },
  ];

  const surfaceOptions = [
    { value: 'natural_grass', label: 'Natural Grass' },
    { value: 'artificial_turf', label: 'Artificial Turf' },
    { value: 'cement', label: 'Cement' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'mat', label: 'Mat' },
  ];

  const sizeOptions = [
    { value: '5-a-side', label: '5-a-side' },
    { value: '7-a-side', label: '7-a-side' },
    { value: '9-a-side', label: '9-a-side' },
    { value: '11-a-side', label: '11-a-side' },
    { value: 'full-court', label: 'Full Court' },
    { value: 'other', label: 'Other' },
  ];

  const slotDurations = [30, 60, 90, 120];

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = async (validateForm, setTouched) => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      let fields = [];
      if (step === 1) fields = ['name', 'location.address', 'location.city', 'latitude', 'longitude'];
      if (step === 2) fields = ['openingTime', 'closingTime', 'slotDurationMinutes', 'pricePerHour'];
      if (step === 3) fields = ['sports', 'surfaceType', 'size'];

      setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));

      showMessage({
        type: 'error',
        title: 'Please complete required fields',
        message: 'Check the highlighted fields before continuing',
      });
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);

    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        location: {
          address: values.location.address.trim(),
          city: values.location.city.trim(),
          state: values.location.state?.trim() || '',
          pincode: values.location.pincode?.trim() || '',
        },
        latitude: values.latitude,
        longitude: values.longitude,
        openingTime: values.openingTime,
        closingTime: values.closingTime,
        slotDurationMinutes: Number(values.slotDurationMinutes),
        sports: values.sports,
        surfaceType: values.surfaceType,
        size: values.size,
        pricePerSlot: Number(values.pricePerHour),
        amenities: values.amenities,
      };

      await createTurf(payload);

      toast.success('Turf created successfully!');
      resetForm();
      setStep(1);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create turf. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-default)] w-full">
      {/* Header */}
      <header className="bg-[var(--color-bg-paper)] border-b border-[var(--color-divider)] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary-light)] rounded-lg">
              <MdStadium className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Add New Turf</h1>
              <p className="text-xs text-[var(--color-text-secondary)]">List your sports facility</p>
            </div>
          </div>

          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-[var(--color-bg-paper)] rounded-xl border border-[var(--color-divider)]">
          {/* Step Progress */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {stepTitles.map((title, idx) => (
                <React.Fragment key={title}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                        idx + 1 === step
                          ? 'bg-[var(--color-primary)] text-white scale-105'
                          : idx + 1 < step
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-gray-200 text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {idx + 1 < step ? <HiOutlineCheckCircle className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium text-center ${
                        idx + 1 === step ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {title}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`h-0.5 w-12 md:w-20 transition-all duration-300 ${
                        idx + 1 < step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-divider)]'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, validateForm, setTouched, setFieldValue }) => (
              <Form className="px-6 pb-6 space-y-6">
                {/* Step 1: Location & Details */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                        Location & Basic Details
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Pin your location on the map and provide basic information
                      </p>
                    </div>

                    {/* Map Section - First Priority */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Select Location on Map <span className="text-[var(--color-error)]">*</span>
                      </label>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                        Search for your location or click on the map to pin it. Address fields will auto-fill.
                      </p>

                      <div className="h-80 rounded-lg overflow-hidden border border-[var(--color-divider)]">
                        <MapContainer
                          center={[19.076, 72.8777]}
                          zoom={13}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          {values.latitude && values.longitude && (
                            <Marker
                              position={[values.latitude, values.longitude]}
                              draggable={true}
                              eventHandlers={{
                                dragend: (e) => {
                                  const pos = e.target.getLatLng();
                                  setFieldValue('latitude', pos.lat);
                                  setFieldValue('longitude', pos.lng);
                                },
                              }}
                            />
                          )}
                          <LocationMarker setFieldValue={setFieldValue} />
                          <SearchControl setFieldValue={setFieldValue} />
                        </MapContainer>
                      </div>

                      {values.latitude && values.longitude && (
                        <div className="mt-2 p-2 bg-[var(--color-primary-light)] rounded-lg">
                          <p className="text-xs text-[var(--color-primary)] flex items-center gap-1">
                            <HiOutlineLocationMarker className="w-4 h-4" />
                            Selected: {values.latitude.toFixed(6)}, {values.longitude.toFixed(6)}
                          </p>
                        </div>
                      )}

                      {touched.latitude && errors.latitude && (
                        <p className="mt-2 text-xs text-[var(--color-error)]">{errors.latitude}</p>
                      )}
                    </div>

                    {/* Turf Name */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Turf Name <span className="text-[var(--color-error)]">*</span>
                      </label>
                      <div className="relative">
                        <MdStadium className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                        <Field
                          name="name"
                          className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all ${
                            touched.name && errors.name
                              ? 'border-[var(--color-error)]'
                              : 'border-[var(--color-divider)]'
                          }`}
                          placeholder="e.g., Elite Sports Arena"
                        />
                      </div>
                      <ErrorMessage name="name" component="p" className="mt-1 text-xs text-[var(--color-error)]" />
                    </div>

                    {/* Address Fields - Auto-filled from map */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Street Address <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <Field
                          name="location.address"
                          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all ${
                            touched.location?.address && errors.location?.address
                              ? 'border-[var(--color-error)]'
                              : 'border-[var(--color-divider)]'
                          }`}
                          placeholder="Street, landmark, area"
                        />
                        <ErrorMessage name="location.address" component="p" className="mt-1 text-xs text-[var(--color-error)]" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          City <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <Field
                          name="location.city"
                          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all ${
                            touched.location?.city && errors.location?.city
                              ? 'border-[var(--color-error)]'
                              : 'border-[var(--color-divider)]'
                          }`}
                          placeholder="Mumbai"
                        />
                        <ErrorMessage name="location.city" component="p" className="mt-1 text-xs text-[var(--color-error)]" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          State
                        </label>
                        <Field
                          name="location.state"
                          className="w-full px-3 py-2.5 text-sm border border-[var(--color-divider)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                          placeholder="Maharashtra"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Pincode
                        </label>
                        <Field
                          name="location.pincode"
                          className="w-full px-3 py-2.5 text-sm border border-[var(--color-divider)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                          placeholder="400001"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Description
                      </label>
                      <div className="relative">
                        <MdDescription className="absolute left-3 top-3 w-5 h-5 text-[var(--color-text-secondary)]" />
                        <Field
                          as="textarea"
                          name="description"
                          rows={3}
                          className="w-full pl-10 pr-3 py-2.5 text-sm border border-[var(--color-divider)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none"
                          placeholder="Brief description about your turf facility (optional)"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Timing & Pricing */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                        Timing & Pricing
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Set your operating hours and pricing details
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Opening Time <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <div className="relative">
                          <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                          <Field
                            name="openingTime"
                            type="time"
                            className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all ${
                              touched.openingTime && errors.openingTime
                                ? 'border-[var(--color-error)]'
                                : 'border-[var(--color-divider)]'
                            }`}
                          />
                        </div>
                        <ErrorMessage name="openingTime" component="p" className="mt-1 text-xs text-[var(--color-error)]" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Closing Time <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <div className="relative">
                          <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                          <Field
                            name="closingTime"
                            type="time"
                            className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all ${
                              touched.closingTime && errors.closingTime
                                ? 'border-[var(--color-error)]'
                                : 'border-[var(--color-divider)]'
                            }`}
                          />
                        </div>
                        <ErrorMessage name="closingTime" component="p" className="mt-1 text-xs text-[var(--color-error)]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Slot Duration <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <Field
                          as="select"
                          name="slotDurationMinutes"
                          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all ${
                            touched.slotDurationMinutes && errors.slotDurationMinutes
                              ? 'border-[var(--color-error)]'
                              : 'border-[var(--color-divider)]'
                          }`}
                        >
                          {slotDurations.map((d) => (
                            <option key={d} value={d}>
                              {d} minutes
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="slotDurationMinutes" component="p" className="mt-1 text-xs text-[var(--color-error)]" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Price per Hour <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <div className="relative">
                          <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                          <Field
                            name="pricePerHour"
                            type="number"
                            min="100"
                            className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all ${
                              touched.pricePerHour && errors.pricePerHour
                                ? 'border-[var(--color-error)]'
                                : 'border-[var(--color-divider)]'
                            }`}
                            placeholder="1200"
                          />
                        </div>
                        <ErrorMessage name="pricePerHour" component="p" className="mt-1 text-xs text-[var(--color-error)]" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Sports & Amenities */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                        Sports & Amenities
                      </h2>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        Select sports available and facility amenities
                      </p>
                    </div>

                    {/* Sports */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Sports Available <span className="text-[var(--color-error)]">*</span>
                      </label>
                      <FieldArray name="sports">
                        {({ push, remove }) => (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {sportOptions.map((sport) => {
                              const Icon = sport.icon;
                              const isSelected = values.sports.includes(sport.value);
                              return (
                                <button
                                  key={sport.value}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      remove(values.sports.indexOf(sport.value));
                                    } else {
                                      push(sport.value);
                                    }
                                  }}
                                  className={`p-3 rounded-lg border transition-all ${
                                    isSelected
                                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                                      : 'border-[var(--color-divider)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary-light)]/30'
                                  }`}
                                >
                                  <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`} />
                                  <span className="text-xs font-medium block">{sport.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </FieldArray>
                      <ErrorMessage name="sports" component="p" className="mt-2 text-xs text-[var(--color-error)]" />
                    </div>

                    {/* Surface & Size */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Surface Type <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <Field
                          as="select"
                          name="surfaceType"
                          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all ${
                            touched.surfaceType && errors.surfaceType
                              ? 'border-[var(--color-error)]'
                              : 'border-[var(--color-divider)]'
                          }`}
                        >
                          {surfaceOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="surfaceType" component="p" className="mt-1 text-xs text-[var(--color-error)]" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Turf Size <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <Field
                          as="select"
                          name="size"
                          className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all ${
                            touched.size && errors.size
                              ? 'border-[var(--color-error)]'
                              : 'border-[var(--color-divider)]'
                          }`}
                        >
                          {sizeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="size" component="p" className="mt-1 text-xs text-[var(--color-error)]" />
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                        Amenities (Optional)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {amenitiesList.map((item) => {
                          const Icon = item.icon;
                          const isSelected = values.amenities.includes(item.value);
                          return (
                            <label
                              key={item.value}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)]'
                                  : 'border-[var(--color-divider)] hover:bg-[var(--color-primary-light)]/30'
                              }`}
                            >
                              <Field
                                type="checkbox"
                                name="amenities"
                                value={item.value}
                                className="w-4 h-4 text-[var(--color-primary)] border-[var(--color-divider)] rounded focus:ring-[var(--color-primary)]"
                              />
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`} />
                              <span className="text-xs font-medium">{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="pt-4 flex flex-col sm:flex-row gap-2.5 border-t border-[var(--color-divider)]">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={step === 1 || isSubmitting}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-6 rounded-lg font-medium text-sm border transition-all ${
                      step === 1 || isSubmitting
                        ? 'bg-gray-100 text-[var(--color-disabled)] cursor-not-allowed border-[var(--color-divider)]'
                        : 'border-[var(--color-divider)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-default)]'
                    }`}
                  >
                    <HiOutlineArrowLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={() => handleNext(validateForm, setTouched)}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-8 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium text-sm rounded-lg transition-all disabled:opacity-60"
                    >
                      Next
                      <HiOutlineArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-8 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium text-sm rounded-lg transition-all disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" />
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Turf
                          <HiOutlineCheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </main>
    </div>
  );
}