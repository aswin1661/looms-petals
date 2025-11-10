import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", email.toLowerCase())
      .single();

    // Don't reveal if user exists or not for security
    if (userError || !user) {
      // Still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset OTP.",
      });
    }

    // Delete old OTPs for this email
    const { error: deleteError, count: deletedCount } = await supabase
      .from("otp_verifications")
      .delete()
      .eq("email", email.toLowerCase());

    console.log("Deleted old OTPs:", {
      email: email.toLowerCase(),
      deletedCount,
      deleteError,
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 10 minutes
    const now = Date.now();
    const expiresAtMs = now + 10 * 60 * 1000;
    const expiresAt = new Date(expiresAtMs);

    // Insert new OTP
    const { error: insertError } = await supabase
      .from("otp_verifications")
      .insert({
        email: email.toLowerCase(),
        otp: otp,
        expires_at: expiresAt.toISOString(),
        is_used: false,
      });

    console.log("Created new OTP for password reset:", {
      email: email.toLowerCase(),
      otp: otp,
      nowMs: now,
      expiresAtMs: expiresAtMs,
      nowISO: new Date(now).toISOString(),
      expiresAtISO: expiresAt.toISOString(),
      insertError,
    });

    if (insertError) {
      console.error("Error creating OTP:", insertError);
      return NextResponse.json(
        { success: false, message: "Failed to generate OTP" },
        { status: 500 }
      );
    }

    // Send OTP via email
    if (resend && process.env.EMAIL_FROM) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: email.toLowerCase(),
          subject: "Password Reset OTP",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>Hello ${user.name || 'there'},</p>
              <p>You requested to reset your password. Use the following OTP to proceed:</p>
              <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                <h1 style="color: #4CAF50; margin: 0; letter-spacing: 5px;">${otp}</h1>
              </div>
              <p>This OTP will expire in 10 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">This is an automated email, please do not reply.</p>
            </div>
          `,
        });
        console.log("Password reset OTP email sent successfully");
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log("⚠️ RESEND_API_KEY not configured. Password reset OTP:", otp);
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset OTP.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
