// app/api/verify/route.js

import { jwtVerify } from 'jose';
import { users } from '../users.js';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    '04f5f88600ff01ce410d0445199a24a1dbd68795a3b40fcba3b7909a9b9e562e'
);

export async function verifyToken(token) {
  try {
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Check if user still exists
    const user = users.find((u) => u.id === payload.userId);
    return !!user;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ valid: false, message: 'No token provided' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const isValid = await verifyToken(token);

    if (!isValid) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user info
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = users.find((u) => u.id === payload.userId);

    return new Response(
      JSON.stringify({
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return new Response(
      JSON.stringify({ valid: false, message: 'Invalid token' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
