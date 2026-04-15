import jwt, { SignOptions } from 'jsonwebtoken';

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) throw new Error('JWT_SECRET env var is required');
const SECRET: string = rawSecret;

export function signToken(payload: object, options: SignOptions = { expiresIn: '1d' }) {
  return jwt.sign(payload, SECRET, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
