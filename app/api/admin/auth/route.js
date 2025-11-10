import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// POST - Admin Login
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      console.error('Server configuration error: SUPABASE_SERVICE_ROLE_KEY not set');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('role', 'admin')
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate secure session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete old expired sessions for this user
    await supabaseAdmin
      .from('admin_sessions')
      .delete()
      .eq('user_id', user.id)
      .lt('expires_at', new Date().toISOString());

    // Create session
    const { error: sessionError } = await supabaseAdmin
      .from('admin_sessions')
      .insert([
        {
          user_id: user.id,
          token,
          expires_at: expiresAt.toISOString(),
        },
      ]);

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { success: false, message: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
      path: '/',
    });

    // Remove sensitive data from response
    const { password: _, reset_password_token, verification_token, ...userResponse } = user;

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: { 
          user: userResponse,
          expiresAt: expiresAt.toISOString()
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed', error: error.message },
      { status: 500 }
    );
  }
}

// GET - Verify session
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify session and check expiration
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('admin_sessions')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      cookieStore.delete('admin_token');
      return NextResponse.json(
        { success: false, message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Fetch user separately
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single();

    if (userError || !user) {
      cookieStore.delete('admin_token');
      await supabaseAdmin.from('admin_sessions').delete().eq('token', token);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }

    // Verify user is still an admin
    if (user.role !== 'admin') {
      cookieStore.delete('admin_token');
      await supabaseAdmin.from('admin_sessions').delete().eq('token', token);
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Remove sensitive data from response
    const { password, reset_password_token, verification_token, ...userResponse } = user;

    return NextResponse.json(
      {
        success: true,
        data: { 
          user: userResponse,
          sessionExpiresAt: session.expires_at
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    );
  }
}

// DELETE - Logout
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (token) {
      // Delete session from database
      const { error } = await supabaseAdmin
        .from('admin_sessions')
        .delete()
        .eq('token', token);

      if (error) {
        console.error('Session deletion error:', error);
      }
    }

    // Clear cookie
    cookieStore.delete('admin_token');

    return NextResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
