import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    // Validation
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Verify OTP - accept OTPs that were verified recently (within 30 minutes)
    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("otp", otp)
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check if OTP is expired (with timezone fix)
    let expiresAtStr = otpRecord.expires_at;
    if (!expiresAtStr.endsWith('Z')) {
      expiresAtStr += 'Z';
    }

    let createdAtStr = otpRecord.created_at;
    if (!createdAtStr.endsWith('Z')) {
      createdAtStr += 'Z';
    }

    const now = Date.now();
    const expiresAtMs = new Date(expiresAtStr).getTime();
    const createdAtMs = new Date(createdAtStr).getTime();
    
    // Allow OTP to be used for password reset within 30 minutes of creation
    const maxAgeMs = 30 * 60 * 1000; // 30 minutes
    const ageMs = now - createdAtMs;

    console.log("Password Reset OTP Verification:", {
      nowMs: now,
      nowISO: new Date(now).toISOString(),
      expiresAtMs: expiresAtMs,
      expiresAtISO: new Date(expiresAtMs).toISOString(),
      createdAtMs: createdAtMs,
      createdAtISO: new Date(createdAtMs).toISOString(),
      ageMinutes: ageMs / 1000 / 60,
      maxAgeMinutes: maxAgeMs / 1000 / 60,
      isExpired: ageMs > maxAgeMs,
      isUsed: otpRecord.is_used,
      email: email.toLowerCase(),
      otp: otp,
      rawExpires: otpRecord.expires_at,
      rawCreated: otpRecord.created_at,
    });

    if (ageMs > maxAgeMs) {
      // Delete expired OTP
      await supabase
        .from("otp_verifications")
        .delete()
        .eq("id", otpRecord.id);

      return NextResponse.json(
        { success: false, message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const { error: updateError } = await supabase
      .from("users")
      .update({ 
        password: hashedPassword
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json(
        { success: false, message: "Failed to update password" },
        { status: 500 }
      );
    }

    // Mark OTP as used
    await supabase
      .from("otp_verifications")
      .update({ is_used: true })
      .eq("id", otpRecord.id);

    // Delete all sessions for this user (force re-login)
    await supabase
      .from("user_sessions")
      .delete()
      .eq("user_id", user.id);

    console.log("Password reset successful for:", email.toLowerCase());

    return NextResponse.json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
