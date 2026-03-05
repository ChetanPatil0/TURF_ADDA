import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { updateProfile } from '../api/authApi';

import {
  RiEdit2Line,
  RiPhoneLine,
  RiMapPinLine,
  RiFootballLine,
  RiShieldCheckLine,
  RiLogoutBoxLine,
  RiErrorWarningLine,
  RiUserLine,
  RiCheckLine,
  RiCloseLine,
  RiLockPasswordLine,
  RiMailLine,
  RiTimeLine,
  RiCameraLine,
} from 'react-icons/ri';
import { IoFootballOutline } from 'react-icons/io5';
import {
  MdSportsCricket,
  MdSportsSoccer,
  MdSportsTennis,
  MdSportsBasketball,
  MdStadium,
} from 'react-icons/md';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import UserAvatar from '../components/common/UserAvatar';
import { useMessageModal } from '../context/MessageModalContext';
import { BASE_URL_MEDIA } from '../const';

import Loader from '../components/common/Loader';
import Cropper from 'react-easy-crop';

import {
  StateSelect,
  CitySelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

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

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required').min(2, 'Too short'),
  middleName: Yup.string().nullable(),
  lastName: Yup.string().required('Last name is required').min(2, 'Too short'),
  gender: Yup.string().nullable(),
  mobile: Yup.string()
    .required('Mobile is required')
    .matches(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number')
    .length(10, 'Mobile must be 10 digits'),
  email: Yup.string().email('Invalid email format').nullable(),
  city: Yup.string().nullable(),
  state: Yup.string().nullable(),
  area: Yup.string().nullable(),
});

const isFormDirty = (initial, current) => {
  return JSON.stringify(initial) !== JSON.stringify(current);
};

const Profile = () => {
  const { user, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const { showMessage } = useMessageModal();

  const [isEditMode, setIsEditMode] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const countryid = 101; // India
  const [stateid, setStateid] = useState(0);

  useEffect(() => {
    const vals = {
      firstName: user?.firstName || '',
      middleName: user?.middleName || '',
      lastName: user?.lastName || '',
      gender: user?.gender || '',
      mobile: user?.mobile || '',
      email: user?.email || '',
      city: user?.city || '',
      state: user?.state || '',
      area: user?.area || '',
      preferredSports: user?.preferredSports || [],
    };
    setInitialFormValues(vals);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <RiErrorWarningLine className="mx-auto text-7xl text-red-500 mb-6" />
          <h2 className="text-2xl font-bold mb-3">Profile Not Found</h2>
          <p className="text-gray-600 mb-8">Please log in to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow-md transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!previewImage || !croppedAreaPixels) return null;

    try {
      const img = await createImage(previewImage);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.9);
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [previewImage, croppedAreaPixels]);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const handleProfilePictureSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMessage({ type: 'error', message: 'Please select an image file' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage({ type: 'error', message: 'Image size should be less than 5MB' });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    setSelectedFile(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);

    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleSaveProfilePicture = async () => {
    if (!previewImage || !croppedAreaPixels) return;

    setIsUploading(true);

    try {
      const croppedBlob = await getCroppedImg();

      if (!croppedBlob) throw new Error('Failed to crop image');

      const formData = new FormData();
      formData.append('profileImage', croppedBlob, 'profile.jpg');

      const res = await updateProfile(formData);

      if (res.success && res.user) {
        setAuth(res.user, localStorage.getItem('token'));
        setPreviewImage(null);
        setSelectedFile(null);
        setShowImageModal(false);

        showMessage({
          type: 'success',
          title: 'Success',
          message: 'Profile picture updated successfully!',
        });
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err) {
      showMessage({
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Could not update profile picture',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const hasChanges = isFormDirty(initialFormValues, values);

    if (!hasChanges) {
      showMessage({
        type: 'info',
        title: 'No changes',
        message: 'Nothing was modified.',
      });
      setIsEditMode(false);
      setSubmitting(false);
      return;
    }

    try {
      const res = await updateProfile(values);

      if (res.success && res.user) {
        setAuth(res.user, localStorage.getItem('token'));

        const newInitial = {
          firstName: res.user.firstName || '',
          middleName: res.user.middleName || '',
          lastName: res.user.lastName || '',
          gender: res.user.gender || '',
          mobile: res.user.mobile || '',
          email: res.user.email || '',
          city: res.user.city || '',
          state: res.user.state || '',
          area: res.user.area || '',
          preferredSports: res.user.preferredSports || [],
        };

        setInitialFormValues(newInitial);
        resetForm({ values: newInitial });
        setIsEditMode(false);

        showMessage({
          type: 'success',
          title: 'Success',
          message: 'Profile updated successfully!',
        });
      } else {
        throw new Error(res.message || 'Update failed');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to update profile. Please try again.';
      showMessage({
        type: 'error',
        title: 'Update Failed',
        message: errorMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSport = (value, setFieldValue, current) => {
    if (current.includes(value)) {
      setFieldValue('preferredSports', current.filter((s) => s !== value));
    } else {
      setFieldValue('preferredSports', [...current, value]);
    }
  };

  const handleVerifyMobile = () => navigate('/verify-mobile');
  const handleVerifyEmail = () => navigate('/verify-email');

  const formatLastLogin = (dateStr) => {
    if (!dateStr) return 'Never logged in';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-IN', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-20">
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Change Profile Photo</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
              >
                <RiCloseLine size={22} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="relative w-full h-72 mb-5 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                {previewImage ? (
                  <Cropper
                    image={previewImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    cropShape="round"
                    showGrid={false}
                    zoomWithScroll={true}
                  />
                ) : user.profileImage ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={`${BASE_URL_MEDIA}${user.profileImage}`}
                      alt="Current profile"
                      className="w-56 h-56 rounded-full object-cover border-4 border-white shadow-md"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <RiUserLine size={100} />
                  </div>
                )}
              </div>

              {previewImage && (
                <div className="w-full max-w-xs mb-5">
                  <label className="block text-sm text-gray-600 mb-1.5">Zoom</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-green-600"
                  />
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-green-700 transition text-base font-medium shadow-sm"
              >
                <RiCameraLine size={20} />
                {previewImage ? 'Choose Another' : 'Choose Photo'}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureSelect}
              />
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setPreviewImage(null);
                  setSelectedFile(null);
                  setShowImageModal(false);
                }}
                className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveProfilePicture}
                disabled={!previewImage || isUploading || !croppedAreaPixels}
                className={`flex-1 py-2.5 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 text-sm
                  ${previewImage && !isUploading
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-green-400 opacity-70 cursor-not-allowed'
                  }`}
              >
                {isUploading ? (
                  <>
                    <Loader size="sm" />
                    Uploading...
                  </>
                ) : (
                  'Save Photo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-b from-green-50 to-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-5 pt-12 pb-10 md:pt-16 md:pb-14 text-center relative">
          <div
            className="relative inline-block mb-5 cursor-pointer group"
            onClick={() => setShowImageModal(true)}
          >
            {user.profileImage ? (
              <img
                src={`${BASE_URL_MEDIA}${user.profileImage}`}
                alt="Profile"
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <UserAvatar size="2xl" className="shadow-xl" />
            )}

            <div className="absolute bottom-1 right-1 bg-green-600 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer border border-green-700">
              <RiEdit2Line size={18} />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            {user.firstName || ''} {user.lastName || ''}
          </h1>
          <p className="text-gray-600 capitalize">
            {user.role || 'user'} • {user.city || ''}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-10 pb-10">
        <Formik
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting, resetForm }) => {
            const hasChanges = isFormDirty(initialFormValues, values);

            return (
              <Form className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 md:px-6 md:py-5 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RiUserLine className="text-green-600 text-xl" />
                    <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
                  </div>

                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={() => setIsEditMode(true)}
                      className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
                    >
                      <RiEdit2Line size={16} />
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="p-5 md:p-8 space-y-8 md:space-y-10">
                  <section>
                    <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                      <RiUserLine className="text-green-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">First Name</label>
                        {isEditMode ? (
                          <Field
                            name="firstName"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
                          />
                        ) : (
                          <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                            {values.firstName || 'Not available'}
                          </div>
                        )}
                        <ErrorMessage name="firstName" component="div" className="text-red-600 text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Middle Name</label>
                        {isEditMode ? (
                          <Field
                            name="middleName"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
                          />
                        ) : (
                          <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                            {values.middleName || 'Not available'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Last Name</label>
                        {isEditMode ? (
                          <Field
                            name="lastName"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
                          />
                        ) : (
                          <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                            {values.lastName || 'Not available'}
                          </div>
                        )}
                        <ErrorMessage name="lastName" component="div" className="text-red-600 text-xs mt-1" />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Gender</label>
                        {isEditMode ? (
                          <Field
                            as="select"
                            name="gender"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 outline-none bg-white transition"
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </Field>
                        ) : (
                          <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 capitalize">
                            {values.gender || 'Not available'}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                      <RiPhoneLine className="text-green-600" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Mobile Number</label>
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-400">
                          <span className="inline-flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 font-medium border-r border-gray-200">
                            +91
                          </span>
                          {isEditMode ? (
                            <Field
                              name="mobile"
                              maxLength={10}
                              className="flex-1 px-4 py-2.5 outline-none"
                            />
                          ) : (
                            <div className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-700">
                              {values.mobile || 'Not available'}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <ErrorMessage name="mobile" component="div" className="text-red-600 text-xs flex-1" />
                          {!user.isVerifiedMobile && !isEditMode && values.mobile && (
                            <button
                              onClick={handleVerifyMobile}
                              className="text-sm text-amber-700 hover:text-amber-800 font-medium"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Email Address</label>
                        <div className="flex items-center gap-3">
                          {isEditMode ? (
                            <Field
                              name="email"
                              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
                            />
                          ) : (
                            <div className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                              {values.email || 'Not available'}
                            </div>
                          )}
                          {values.email && !user.isVerifiedEmail && !isEditMode && (
                            <button
                              onClick={handleVerifyEmail}
                              className="text-sm text-amber-700 hover:text-amber-800 font-medium"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                        <ErrorMessage name="email" component="div" className="text-red-600 text-xs mt-1" />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                      <RiMapPinLine className="text-green-600" />
                      Location
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">State</label>
                        {isEditMode ? (
                          <div className="border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-green-400">
                            <StateSelect
                              countryid={countryid}
                              placeHolder="Select State"
                              onChange={(val) => {
                                setFieldValue("state", val?.name || "");
                                setStateid(val?.id || 0);
                                setFieldValue("city", "");
                              }}
                              value={values.state ? { name: values.state } : null}
                            />
                          </div>
                        ) : (
                          <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                            {values.state || 'Not available'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">City</label>
                        {isEditMode ? (
                          <div className={`border border-gray-200 rounded-lg ${!stateid ? 'bg-gray-100 opacity-70' : 'focus-within:ring-2 focus-within:ring-green-400'}`}>
                            <CitySelect
                              countryid={countryid}
                              stateid={stateid}
                              placeHolder={stateid ? "Select City" : "Select State first"}
                              onChange={(val) => setFieldValue("city", val?.name || "")}
                              value={values.city ? { name: values.city } : null}
                              disabled={!stateid}
                            />
                          </div>
                        ) : (
                          <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                            {values.city || 'Not available'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1.5">Area / Locality</label>
                        {isEditMode ? (
                          <Field
                            name="area"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 outline-none transition"
                          />
                        ) : (
                          <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                            {values.area || 'Not available'}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {user.role === 'player' && (
                    <section>
                      <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                        <RiFootballLine className="text-green-600" />
                        Preferred Sports
                      </h3>

                      {isEditMode ? (
                        <div className="flex flex-wrap gap-3">
                          {sportOptions.map((sport) => {
                            const selected = values.preferredSports.includes(sport.value);
                            return (
                              <button
                                key={sport.value}
                                type="button"
                                onClick={() => toggleSport(sport.value, setFieldValue, values.preferredSports)}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm transition-all border ${
                                  selected
                                    ? 'bg-green-600 text-white border-green-700 shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {React.createElement(sport.icon, { size: 18 })}
                                {sport.label}
                              </button>
                            );
                          })}
                        </div>
                      ) : values.preferredSports?.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {values.preferredSports.map((val) => {
                            const sport = sportOptions.find((s) => s.value === val);
                            return (
                              <div
                                key={val}
                                className="flex items-center gap-2 px-5 py-2 bg-green-50 text-green-700 rounded-full text-sm border border-green-200"
                              >
                                {sport && React.createElement(sport.icon, { size: 18 })}
                                {sport?.label || val}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 italic">
                          Not available
                        </div>
                      )}
                    </section>
                  )}

                  {isEditMode && (
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditMode(false);
                          resetForm();
                        }}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 border border-gray-300 text-sm"
                      >
                        <RiCloseLine size={18} />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !hasChanges}
                        className={`px-6 py-2.5 rounded-lg text-white flex items-center justify-center gap-2 shadow-sm text-sm ${
                          hasChanges && !isSubmitting
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-green-400 opacity-70 cursor-not-allowed'
                        }`}
                      >
                        <RiCheckLine size={18} />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </Form>
            );
          }}
        </Formik>

        <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
            <RiShieldCheckLine className="text-green-600 text-xl" />
            <h2 className="text-xl font-semibold text-gray-900">Account & Security</h2>
          </div>

          <div className="p-6 md:p-8 space-y-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <RiLockPasswordLine className="text-gray-600 text-xl" />
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-gray-500">Change your login password</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile/change-password')}
                className="px-5 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
              >
                <RiLockPasswordLine size={16} />
                Change
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <RiPhoneLine className="text-gray-600 text-xl" />
                <div>
                  <h3 className="font-medium">Mobile Verification</h3>
                  <p className="text-sm text-gray-500">
                    {user.isVerifiedMobile ? 'Verified' : 'Not verified'}
                  </p>
                </div>
              </div>
              {user.isVerifiedMobile ? (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                  <RiCheckLine className="text-green-600" size={18} />
                  Verified
                </div>
              ) : (
                <button
                  onClick={handleVerifyMobile}
                  className="px-5 py-2 bg-amber-50 text-amber-800 text-sm rounded-lg hover:bg-amber-100 transition flex items-center gap-2 border border-amber-200"
                >
                  <RiErrorWarningLine size={16} />
                  Verify
                </button>
              )}
            </div>

            {user.email && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <RiMailLine className="text-gray-600 text-xl" />
                  <div>
                    <h3 className="font-medium">Email Verification</h3>
                    <p className="text-sm text-gray-500">
                      {user.isVerifiedEmail ? 'Verified' : 'Not verified'}
                    </p>
                  </div>
                </div>
                {user.isVerifiedEmail ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                    <RiCheckLine className="text-green-600" size={18} />
                    Verified
                  </div>
                ) : (
                  <button
                    onClick={handleVerifyEmail}
                    className="px-5 py-2 bg-amber-50 text-amber-800 text-sm rounded-lg hover:bg-amber-100 transition flex items-center gap-2 border border-amber-200"
                  >
                    <RiErrorWarningLine size={16} />
                    Verify
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
              <RiTimeLine className="text-gray-600 text-xl" />
              <div>
                <h3 className="font-medium">Last Login</h3>
                <p className="text-sm text-gray-600">{formatLastLogin(user.lastLogin)}</p>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition border border-red-200 shadow-sm"
              >
                <RiLogoutBoxLine size={20} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;