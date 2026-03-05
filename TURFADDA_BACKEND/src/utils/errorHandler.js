export const sendError = (res, status = 500, message = 'Server error') => {
     console.log('Message : ',message)
  return res.status(status).json({
    success: false,
    message,
  });
};

export const sendSuccess = (res, data = {}, message = 'Success') => {
    console.log('Message : ',message)
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};