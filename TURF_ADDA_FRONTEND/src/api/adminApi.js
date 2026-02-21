import api from "../lib/api";

export const getPendingVerficationTurf = async () => {
  const res = await api.get(`/turf/pending-verification`);
  console.log('Response  : ',res)
  return res.data;
};



export const verifyTurf = async (turfId, isVerified, verificationNotes = '') => {
 
  const payload = {
    isVerified: isVerified,        
  };

  if (verificationNotes.trim()) {
    payload.verificationNotes = verificationNotes.trim();
  }

  const res = await api.patch(`/turf/${turfId}/verify`, payload);
  return res.data;
};