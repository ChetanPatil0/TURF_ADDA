export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = (mobile, otp) => {
  console.log(`[OTP] Sent ${otp} to mobile ${mobile}`);
  return true;
};