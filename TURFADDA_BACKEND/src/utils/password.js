
import bcrypt from 'bcrypt';


export const hashPassword = async (password) => {
  const saltRounds = 12; 
  const salt = await bcrypt.genSalt(saltRounds);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
};


export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};