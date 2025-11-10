-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT true,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on session_token for faster lookups
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);

-- Create OTP verifications table for email verification
CREATE TABLE IF NOT EXISTS otp_verifications (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email and OTP for faster lookups
CREATE INDEX idx_otp_email ON otp_verifications(email);
CREATE INDEX idx_otp_email_otp ON otp_verifications(email, otp);
