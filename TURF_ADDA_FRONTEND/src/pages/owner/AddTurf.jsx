


import React, { useState, useCallback } from 'react';
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
  HiOutlinePhotograph,
  HiOutlineVideoCamera,
  HiChevronDown,
} from 'react-icons/hi';
import { MdMap } from 'react-icons/md';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

import {
  StateSelect,
  CitySelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

import { createTurf } from '../../api/turfApi';
import { useMessageModal } from '../../context/MessageModalContext';
import { sizeOptions, slotDurations, surfaceOptions, sportOptions, amenitiesList } from '../../const';

const validationSchema = Yup.object({
  name: Yup.string().trim().min(3, 'Minimum 3 characters').max(100).required('Turf name is required'),
  description: Yup.string().max(1200),
  address: Yup.string().trim().required('Street address is required'),
  landmark: Yup.string().trim(),
  area: Yup.string().trim(),
  state: Yup.string().required('State is required'),
  city: Yup.string().required('City is required'),
  pincode: Yup.string()
    .trim()
    .required('Pincode is required')
    .matches(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  latitude: Yup.number().min(-90).max(90).required('Please select location on map'),
  longitude: Yup.number().min(-180).max(180).required('Please select location on map'),
  openingTime: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .required('Opening time is required'),
  closingTime: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]|24):[0-5][0-9]$/, 'Invalid time format (HH:MM) – up to 24:00 allowed')
    .required('Closing time is required'),
  slotDurationMinutes: Yup.number()
    .oneOf([30, 60, 90, 120], 'Slot duration must be 30, 60, 90 or 120 minutes')
    .required(),
  pricePerSlot: Yup.number()
    .min(100, 'Minimum ₹100')
    .required('Price per slot is required'),
  sports: Yup.array().of(Yup.string()).min(1, 'Select at least one sport'),
  surfaceType: Yup.string()
    .oneOf(['natural_grass', 'artificial_turf', 'cement', 'hybrid', 'mat'])
    .required('Surface type is required'),
  size: Yup.string()
    .oneOf(['5-a-side', '7-a-side', '9-a-side', '11-a-side', 'full-court', 'other'])
    .required('Size is required'),
  amenities: Yup.array().of(Yup.string()),
  coverImage: Yup.mixed().required('Cover image is required'),
  images: Yup.mixed()
    .required('Gallery images are required')
    .test('min-images', 'At least 3 images are required', function(value) {
      return value && value.length >= 3;
    }),
  videos: Yup.mixed()
    .required('At least one video is required')
    .test('min-videos', 'At least 1 video is required', function(value) {
      return value && value.length >= 1;
    }),
  primaryMobile: Yup.string()
    .required('Primary mobile number is required')
    .matches(/^\d{10}$/, 'Must be exactly 10 digits')
    .length(10, 'Mobile number must be 10 digits'),
  secondaryMobile: Yup.string()
    .matches(/^\d{10}$/, 'Must be exactly 10 digits')
    .length(10, 'Mobile number must be 10 digits')
    .nullable(),
  contactPersonName: Yup.string()
    .required('Contact person name is required')
    .min(2, 'Name too short')
    .max(80),
  accountNumber: Yup.string()
    .required('Bank account number is required')
    .min(9, 'Account number too short')
    .max(18, 'Account number too long'),
  ifscCode: Yup.string()
    .required('IFSC code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format (e.g. SBIN0001234)')
    .uppercase(),
  passbookImage: Yup.mixed()
    .required('Passbook / cancelled cheque is required')
    .test('fileType', 'Only images (JPG, PNG) or PDF allowed', function(value) {
      if (!value) return true;
      const supported = ['image/jpeg', 'image/png', 'application/pdf'];
      return supported.includes(value.type);
    })
    .test('fileSize', 'File too large (max 5MB)', function(value) {
      return !value || (value && value.size <= 5 * 1024 * 1024);
    }),
});

const initialValues = {
  name: '',
  description: '',
  address: '',
  landmark: '',
  area: '',
  state: '',
  city: '',
  pincode: '',
  latitude: null,
  longitude: null,
  openingTime: '07:00',
  closingTime: '23:00',
  slotDurationMinutes: 60,
  pricePerSlot: '',
  sports: [],
  surfaceType: 'artificial_turf',
  size: '5-a-side',
  amenities: [],
  coverImage: null,
  images: null,
  videos: null,
  primaryMobile: '',
  secondaryMobile: '',
  contactPersonName: '',
  accountNumber: '',
  ifscCode: '',
  passbookImage: null,
};

export default function AddTurf() {
  const { showMessage } = useMessageModal();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [videosPreviews, setVideosPreviews] = useState([]);
  const [passbookPreview, setPassbookPreview] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [stateid, setStateid] = useState(0);

  const totalSteps = 5;
  const stepTitles = ['Location & Details', 'Timing & Pricing', 'Sports & Amenities', 'Media Upload', 'Contact & Bank'];

  const stepFields = {
    1: ['name', 'address', 'state', 'city', 'pincode', 'latitude', 'longitude'],
    2: ['openingTime', 'closingTime', 'slotDurationMinutes', 'pricePerSlot'],
    3: ['sports', 'surfaceType', 'size'],
    4: ['coverImage', 'images', 'videos'],
    5: ['primaryMobile', 'contactPersonName', 'accountNumber', 'ifscCode', 'passbookImage'],
  };

  const reverseGeocode = useCallback(async (lat, lng, setFieldValue) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'TurfBookingApp/1.0' } }
      );
      const data = await res.json();
      if (data?.address) {
        const addr = data.address;
        const addressParts = [
          addr.road,
          addr.suburb,
          addr.neighbourhood,
          addr.hamlet,
          addr.residential,
        ].filter(Boolean);
        setFieldValue('address', addressParts.join(', ') || data.display_name.split(',')[0] || '');
        setFieldValue('area', addr.suburb || addr.neighbourhood || addr.locality || '');
        setFieldValue('pincode', addr.postcode || '');
        setFieldValue('city', addr.city || addr.town || addr.village || addr.county || '');
        setFieldValue('state', addr.state || addr.state_district || '');
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
    }
  }, []);

  function LocationMarker({ setFieldValue }) {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setFieldValue('latitude', lat);
        setFieldValue('longitude', lng);
        reverseGeocode(lat, lng, setFieldValue);
      },
    });
    return null;
  }

  function SearchControl({ setFieldValue }) {
    const map = useMapEvents({});
    React.useEffect(() => {
      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider,
        style: 'bar',
        autoClose: true,
        keepResult: true,
        showMarker: true,
        marker: { draggable: true },
      });
      map.addControl(searchControl);
      map.on('geosearch/showlocation', (e) => {
        const { location } = e;
        const lat = location.y;
        const lng = location.x;
        setFieldValue('latitude', lat);
        setFieldValue('longitude', lng);
        reverseGeocode(lat, lng, setFieldValue);
      });
      return () => map.removeControl(searchControl);
    }, [map, setFieldValue]);
    return null;
  }

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = async (validateForm, setTouched, values) => {
    const currentFields = stepFields[step] || [];
    const partialSchema = Yup.object(
      currentFields.reduce((acc, field) => {
        if (validationSchema.fields[field]) {
          acc[field] = validationSchema.fields[field];
        }
        return acc;
      }, {})
    );

    try {
      await partialSchema.validate(values, { abortEarly: false });
      setStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const touchedFields = currentFields.reduce((acc, f) => ({ ...acc, [f]: true }), {});
      setTouched(touchedFields);
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
      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('description', values.description.trim() || '');
      formData.append('address', values.address.trim());
      formData.append('landmark', values.landmark?.trim() || '');
      formData.append('area', values.area?.trim() || '');
      formData.append('city', values.city.trim());
      formData.append('state', values.state.trim());
      formData.append('pincode', values.pincode.trim());
      formData.append('latitude', values.latitude);
      formData.append('longitude', values.longitude);
      formData.append('openingTime', values.openingTime);
      formData.append('closingTime', values.closingTime);
      formData.append('slotDurationMinutes', Number(values.slotDurationMinutes));
      formData.append('pricePerSlot', Number(values.pricePerSlot));
      formData.append('sports', JSON.stringify(values.sports || []));
      formData.append('surfaceType', values.surfaceType);
      formData.append('size', values.size);
      formData.append('amenities', JSON.stringify(values.amenities || []));
      formData.append('primaryMobile', values.primaryMobile);
      formData.append('secondaryMobile', values.secondaryMobile || '');
      formData.append('contactPersonName', values.contactPersonName.trim());
      formData.append('accountNumber', values.accountNumber);
      formData.append('ifscCode', values.ifscCode.toUpperCase());
      if (values.passbookImage) formData.append('passbookImage', values.passbookImage);
      if (values.coverImage) formData.append('coverImage', values.coverImage);
      if (values.images) Array.from(values.images).forEach(file => formData.append('images', file));
      if (values.videos) Array.from(values.videos).forEach(file => formData.append('videos', file));

      await createTurf(formData);
      showMessage({
        type: 'success',
        title: 'Success',
        message: 'Your turf has been submitted successfully and is now pending verification by our team.',
      });
      resetForm();
      setStep(1);
      setCoverPreview(null);
      setImagesPreviews([]);
      setVideosPreviews([]);
      setPassbookPreview(null);
      setStateid(0);
    } catch (err) {
      showMessage({
        type: 'error',
        title: 'Error',
        message: err?.response?.data?.message || 'Failed to create turf. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-default)]">
      <div className="bg-[var(--color-bg-paper)] border-b border-[var(--color-divider)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <HiOutlineArrowLeft size={20} />
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
                Add New Turf
              </h1>
              <p className="text-[var(--color-text-secondary)] text-xs sm:text-sm">
                List your sports facility
              </p>
            </div>

            <div className="w-16 sm:w-20"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between overflow-x-auto pb-6 scrollbar-hide">
            {stepTitles.map((title, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center min-w-[70px] sm:min-w-[100px]">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all ${
                      idx + 1 < step
                        ? 'bg-green-500 text-white'
                        : idx + 1 === step
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {idx + 1 < step ? <HiOutlineCheckCircle size={18} /> : idx + 1}
                  </div>
                  <span
                    className={`mt-1.5 text-[10px] sm:text-xs font-medium text-center leading-tight ${
                      idx + 1 === step ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {title}
                  </span>
                </div>
                {idx < totalSteps - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded ${
                      idx + 1 < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ values, errors, touched, validateForm, setTouched, setFieldValue, submitForm }) => (
              <Form className="bg-[var(--color-bg-paper)] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-1">
                        Location & Basic Details
                      </h2>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                        Pin your turf on the map – city & state will be auto-filled.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Turf Name <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <Field
                          type="text"
                          name="name"
                          placeholder="e.g., Green Arena Sports Complex"
                          className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                        />
                        <ErrorMessage name="name" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Select Location on Map <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowMap(!showMap)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary-light)] transition-all bg-white font-medium"
                        >
                          <MdMap size={20} />
                          {showMap ? 'Close Map' : 'Open Map to Select Location'}
                        </button>
                        {errors.latitude && touched.latitude && (
                          <div className="text-[var(--color-error)] text-xs mt-1">{errors.latitude}</div>
                        )}

                        {showMap && (
                          <div className="mt-4 rounded-xl overflow-hidden border-2 border-[var(--color-divider)] shadow-sm">
                            <MapContainer
                              center={[values.latitude || 19.0760, values.longitude || 72.8777]}
                              zoom={13}
                              style={{ height: '400px', width: '100%' }}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <LocationMarker setFieldValue={setFieldValue} />
                              <SearchControl setFieldValue={setFieldValue} />
                              {values.latitude && values.longitude && (
                                <Marker
                                  position={[values.latitude, values.longitude]}
                                  draggable={true}
                                  eventHandlers={{
                                    dragend: (e) => {
                                      const { lat, lng } = e.target.getLatLng();
                                      setFieldValue('latitude', lat);
                                      setFieldValue('longitude', lng);
                                      reverseGeocode(lat, lng, setFieldValue);
                                    },
                                  }}
                                />
                              )}
                            </MapContainer>
                          </div>
                        )}

                        {values.latitude && values.longitude && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-primary-light)] px-3 py-2 rounded-lg">
                            <HiOutlineLocationMarker className="text-[var(--color-primary)]" />
                            <span>
                              {values.latitude.toFixed(6)}, {values.longitude.toFixed(6)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Address <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <Field
                          type="text"
                          name="address"
                          placeholder="Street address"
                          className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                        />
                        <ErrorMessage name="address" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Landmark (optional)
                          </label>
                          <Field
                            type="text"
                            name="landmark"
                            placeholder="Near..."
                            className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Area / Locality (optional)
                          </label>
                          <Field
                            type="text"
                            name="area"
                            placeholder="Area or locality"
                            className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            State <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <StateSelect
                            countryid={101}
                            placeHolder="Select State"
                            onChange={(val) => {
                              setFieldValue("state", val?.name || "");
                              setStateid(val?.id || 0);
                              setFieldValue("city", "");
                            }}
                            value={values.state ? { name: values.state } : null}
                          />
                          <ErrorMessage name="state" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            City <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <div className={stateid ? "" : "opacity-70 bg-gray-100"}>
                            <CitySelect
                              countryid={101}
                              stateid={stateid}
                              placeHolder={stateid ? "Select City" : "Select State first"}
                              onChange={(val) => setFieldValue("city", val?.name || "")}
                              value={values.city ? { name: values.city } : null}
                              disabled={!stateid}
                            />
                          </div>
                          <ErrorMessage name="city" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Pincode <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <Field
                            name="pincode"
                            maxLength={6}
                            placeholder="400001"
                            className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                          />
                          <ErrorMessage name="pincode" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Description (optional)
                        </label>
                        <Field
                          as="textarea"
                          name="description"
                          rows="4"
                          placeholder="Tell us more about your turf..."
                          className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-1">
                        Timing & Pricing
                      </h2>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                        Set operating hours and pricing details
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Opening Time <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <div className="relative">
                            <Field
                              type="time"
                              name="openingTime"
                              className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                              onClick={(e) => e.target.showPicker && e.target.showPicker()}
                            />
                            <HiOutlineClock
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
                              size={18}
                            />
                          </div>
                          <ErrorMessage name="openingTime" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Closing Time <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <div className="relative">
                            <Field
                              type="time"
                              name="closingTime"
                              className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                              onClick={(e) => e.target.showPicker && e.target.showPicker()}
                            />
                            <HiOutlineClock
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
                              size={18}
                            />
                          </div>
                          <ErrorMessage name="closingTime" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Slot Duration <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <div className="relative">
                            <Field
                              as="select"
                              name="slotDurationMinutes"
                              className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 appearance-none bg-white transition-all"
                            >
                              {slotDurations.map((duration) => (
                                <option key={duration.value} value={duration.value}>
                                  {duration.label}
                                </option>
                              ))}
                            </Field>
                            <HiChevronDown
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
                              size={18}
                            />
                          </div>
                          <ErrorMessage name="slotDurationMinutes" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Price per Slot (₹) <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <div className="relative">
                            <HiOutlineCurrencyRupee
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                              size={18}
                            />
                            <Field
                              type="number"
                              name="pricePerSlot"
                              min="100"
                              placeholder="500"
                              className="w-full pl-12 pr-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                            />
                          </div>
                          <ErrorMessage name="pricePerSlot" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-1">
                        Sports & Amenities
                      </h2>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                        Select sports and other details
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                          Sports Available <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <FieldArray name="sports">
                          {({ push, remove }) => (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {sportOptions.map((sport) => {
                                const Icon = sport.icon;
                                const isSelected = (values.sports || []).includes(sport.value);
                                return (
                                  <button
                                    key={sport.value}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        const idx = values.sports.indexOf(sport.value);
                                        remove(idx);
                                      } else {
                                        push(sport.value);
                                      }
                                    }}
                                    className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                                      isSelected
                                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md'
                                        : 'bg-white text-[var(--color-text-primary)] border-[var(--color-divider)] hover:border-[var(--color-primary)] hover:shadow-sm'
                                    }`}
                                  >
                                    <Icon size={24} />
                                    <span className="text-xs font-medium">{sport.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </FieldArray>
                        <ErrorMessage name="sports" component="div" className="text-[var(--color-error)] text-xs mt-2" />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Surface Type <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <div className="relative">
                            <Field
                              as="select"
                              name="surfaceType"
                              className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 appearance-none bg-white transition-all"
                            >
                              {surfaceOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Field>
                            <HiChevronDown
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
                              size={18}
                            />
                          </div>
                          <ErrorMessage name="surfaceType" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Turf Size <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <div className="relative">
                            <Field
                              as="select"
                              name="size"
                              className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 appearance-none bg-white transition-all"
                            >
                              {sizeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </Field>
                            <HiChevronDown
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] pointer-events-none"
                              size={18}
                            />
                          </div>
                          <ErrorMessage name="size" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
                          Amenities (optional)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {amenitiesList.map((item) => {
                            const Icon = item.icon;
                            const isSelected = (values.amenities || []).includes(item.value);
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => {
                                  const currentAmenities = values.amenities || [];
                                  if (isSelected) {
                                    setFieldValue(
                                      'amenities',
                                      currentAmenities.filter((a) => a !== item.value)
                                    );
                                  } else {
                                    setFieldValue('amenities', [...currentAmenities, item.value]);
                                  }
                                }}
                                className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                                  isSelected
                                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md'
                                    : 'bg-white text-[var(--color-text-primary)] border-[var(--color-divider)] hover:border-[var(--color-primary)] hover:shadow-sm'
                                }`}
                              >
                                <Icon size={24} />
                                <span className="text-xs font-medium text-center">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-1">
                        Upload Media
                      </h2>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                        Required: 1 cover image, 3 gallery images, and 1 video for verification and listing
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Cover Image (Required) <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                          Upload a high-quality cover photo showing the turf clearly
                        </p>
                        <div
                          className="relative border-2 border-dashed border-[var(--color-divider)] rounded-xl overflow-hidden hover:border-[var(--color-primary)] transition-all cursor-pointer bg-white"
                          onClick={() => document.getElementById('coverImage').click()}
                        >
                          {coverPreview ? (
                            <img
                              src={coverPreview}
                              alt="Cover preview"
                              className="w-full h-64 object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                              <HiOutlinePhotograph className="text-[var(--color-text-secondary)] mb-3" size={48} />
                              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                Click to upload cover image
                              </p>
                              <p className="text-xs text-[var(--color-text-secondary)]">
                                PNG, JPG, max 5MB recommended
                              </p>
                            </div>
                          )}
                        </div>
                        <input
                          id="coverImage"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFieldValue('coverImage', file);
                              setCoverPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <ErrorMessage name="coverImage" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Gallery Images (Required - Minimum 3) <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                          Upload at least 3 photos showing different angles of the turf for verification
                        </p>
                        <div
                          className="border-2 border-dashed border-[var(--color-divider)] rounded-xl p-6 hover:border-[var(--color-primary)] transition-all cursor-pointer bg-white"
                          onClick={() => document.getElementById('images').click()}
                        >
                          <div className="flex flex-col items-center">
                            <HiOutlinePhotograph className="text-[var(--color-text-secondary)] mb-3" size={48} />
                            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                              Click to upload gallery images
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              Select at least 3 photos (PNG, JPG)
                            </p>
                          </div>
                        </div>
                        <input
                          id="images"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                              setFieldValue('images', files);
                              const previews = Array.from(files).map(file => URL.createObjectURL(file));
                              setImagesPreviews(previews);
                            }
                          }}
                        />
                        {imagesPreviews.length > 0 && (
                          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {imagesPreviews.map((preview, idx) => (
                              <img
                                key={idx}
                                src={preview}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-20 object-cover rounded-lg shadow-sm"
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                          {values.images ? `${values.images.length} image(s) selected` : 'No images selected'}
                        </p>
                        <ErrorMessage name="images" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Videos (Required - Minimum 1) <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                          Upload at least 1 video (15-30 seconds) showing the turf for verification purposes
                        </p>
                        <div
                          className="border-2 border-dashed border-[var(--color-divider)] rounded-xl p-6 hover:border-[var(--color-primary)] transition-all cursor-pointer bg-white"
                          onClick={() => document.getElementById('videos').click()}
                        >
                          <div className="flex flex-col items-center">
                            <HiOutlineVideoCamera className="text-[var(--color-text-secondary)] mb-3" size={48} />
                            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                              Click to upload videos
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              MP4, MOV recommended (minimum 1 video required)
                            </p>
                          </div>
                        </div>
                        <input
                          id="videos"
                          type="file"
                          accept="video/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                              setFieldValue('videos', files);
                              const previews = Array.from(files).map(file => URL.createObjectURL(file));
                              setVideosPreviews(previews);
                            }
                          }}
                        />
                        {videosPreviews.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {videosPreviews.map((preview, idx) => (
                              <video
                                key={idx}
                                src={preview}
                                className="w-full h-32 object-cover rounded-lg shadow-sm"
                                controls
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                          {values.videos ? `${values.videos.length} video(s) selected` : 'No videos selected'}
                        </p>
                        <ErrorMessage name="videos" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-1">
                        Contact & Bank Details
                      </h2>
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                        Required for verification and payout processing
                      </p>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Contact Person Name <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <Field
                          type="text"
                          name="contactPersonName"
                          placeholder="Full name of contact person"
                          className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                        />
                        <ErrorMessage name="contactPersonName" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Primary Mobile Number <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-4 py-3 text-sm bg-gray-100 border border-r-0 border-[var(--color-divider)] rounded-l-xl text-[var(--color-text-secondary)] font-medium">
                              +91
                            </span>
                            <Field
                              type="tel"
                              name="primaryMobile"
                              maxLength={10}
                              placeholder="Enter 10-digit number"
                              className="flex-1 px-4 py-3 text-sm border border-[var(--color-divider)] rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                            />
                          </div>
                          <ErrorMessage name="primaryMobile" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Secondary Mobile (optional)
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-4 py-3 text-sm bg-gray-100 border border-r-0 border-[var(--color-divider)] rounded-l-xl text-[var(--color-text-secondary)] font-medium">
                              +91
                            </span>
                            <Field
                              type="tel"
                              name="secondaryMobile"
                              maxLength={10}
                              placeholder="Optional"
                              className="flex-1 px-4 py-3 text-sm border border-[var(--color-divider)] rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                            />
                          </div>
                          <ErrorMessage name="secondaryMobile" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            Bank Account Number <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <Field
                            type="text"
                            name="accountNumber"
                            placeholder="Account number"
                            className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all"
                          />
                          <ErrorMessage name="accountNumber" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                            IFSC Code <span className="text-[var(--color-error)]">*</span>
                          </label>
                          <Field
                            type="text"
                            name="ifscCode"
                            placeholder="e.g. SBIN0001234"
                            className="w-full px-4 py-3 text-sm border border-[var(--color-divider)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 bg-white transition-all uppercase"
                            onChange={(e) => setFieldValue('ifscCode', e.target.value.toUpperCase())}
                          />
                          <ErrorMessage name="ifscCode" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                          Upload Passbook / Cancelled Cheque <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                          PDF or image accepted (max 5MB)
                        </p>

                        <div
                          className="relative border-2 border-dashed border-[var(--color-divider)] rounded-xl overflow-hidden hover:border-[var(--color-primary)] transition-all cursor-pointer bg-white"
                          onClick={() => document.getElementById('passbookImage').click()}
                        >
                          {passbookPreview ? (
                            <div className="p-4 text-center">
                              {passbookPreview.type?.includes('pdf') ? (
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                  PDF selected: {passbookPreview.name}
                                </p>
                              ) : (
                                <img
                                  src={passbookPreview}
                                  alt="Passbook preview"
                                  className="max-h-64 mx-auto object-contain"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                              <HiOutlinePhotograph className="text-[var(--color-text-secondary)] mb-3" size={48} />
                              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                                Click to upload passbook / cheque
                              </p>
                              <p className="text-xs text-[var(--color-text-secondary)]">
                                JPG, PNG, PDF • max 5MB
                              </p>
                            </div>
                          )}
                        </div>
                        <input
                          id="passbookImage"
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFieldValue('passbookImage', file);
                              if (file.type.includes('pdf')) {
                                setPassbookPreview({ type: 'pdf', name: file.name });
                              } else {
                                setPassbookPreview(URL.createObjectURL(file));
                              }
                            }
                          }}
                        />
                        <ErrorMessage name="passbookImage" component="div" className="text-[var(--color-error)] text-xs mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-[var(--color-divider)]">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 py-3 px-6 sm:px-8 bg-gray-100 hover:bg-gray-200 text-[var(--color-text-primary)] font-medium rounded-xl disabled:opacity-60 transition-all"
                    >
                      <HiOutlineArrowLeft size={18} />
                      <span className="text-sm">Previous</span>
                    </button>
                  )}

                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={() => handleNext(validateForm, setTouched, values)}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 py-3 px-8 sm:px-10 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium rounded-xl disabled:opacity-60 ml-auto transition-all shadow-sm"
                    >
                      <span className="text-sm">Next</span>
                      <HiOutlineArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitForm}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 py-3 px-8 sm:px-10 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl disabled:opacity-60 ml-auto transition-all shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">Creating...</span>
                        </>
                      ) : (
                        <>
                          <HiOutlineCheckCircle size={18} />
                          <span className="text-sm">Create Turf</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}