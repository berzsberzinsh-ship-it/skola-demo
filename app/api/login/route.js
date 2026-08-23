// app/api/login/route.js

import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { users } from '../users.js';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    '04f5f88600ff01ce410d0445199a24a1dbd68795a3b40fcba3b7909a9b9e562e'
);

export async function POST(request) {
  try {
    const { password } = await request.json();

    // Find user (in production, you'd search by username too)
    const user = users[0]; // For now, single user

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      // Generate JWT token
      const token = await new SignJWT({
        userId: user.id,
        username: user.username,
        role: user.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8760h') // 1 year
        .sign(JWT_SECRET);

      return new Response(
        JSON.stringify({
          success: true,
          token,
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
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid password',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
