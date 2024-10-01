import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretisalwayssecretcantfind'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'myrefreshsecretisalwayssecretcantfind'

interface JwtPayload {
  id: string;
  email: string;
  role:string;
}


export const jwtCreate = (payload : JwtPayload) => {

    const {id,email,role} = payload


    console.log(id,email,role, " gooooooooooooooooooot the id and email")


    
const accessToken = jwt.sign(
    { userId: id, email: email,role}, // Include any necessary user data
    JWT_SECRET,
    { expiresIn: '15m' } // Access token expires in 15 minutes
  );

  const refreshToken = jwt.sign(
    { userId: id, email : email,role},
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Refresh token expires in 7 days
  );

  return {accessToken,refreshToken}
}