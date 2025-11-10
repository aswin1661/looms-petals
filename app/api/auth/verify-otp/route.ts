import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find OTP record (get the most recent one)
    const { data: otpRecords, error: otpError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("otp", otp)
      .order("created_at", { ascending: false })
      .limit(1);

    if (otpError || !otpRecords || otpRecords.length === 0) {
      console.error("OTP lookup error:", otpError);
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    const otpRecord = otpRecords[0];

    // Check if OTP is expired - use millisecond timestamps for accuracy
    // Force UTC parsing by appending 'Z' if not present (Supabase TIMESTAMP issue)
    const nowMs = Date.now();
    
    let expiresAtStr = otpRecord.expires_at;
    let createdAtStr = otpRecord.created_at;
    
    // Add 'Z' to force UTC parsing if not present
    if (!expiresAtStr.endsWith('Z') && !expiresAtStr.includes('+')) {
      expiresAtStr += 'Z';
    }
    if (!createdAtStr.endsWith('Z') && !createdAtStr.includes('+')) {
      createdAtStr += 'Z';
    }
    
    const expiresAtMs = new Date(expiresAtStr).getTime();
    const createdAtMs = new Date(createdAtStr).getTime();
    
    console.log("OTP Verification:", {
      nowMs: nowMs,
      nowISO: new Date(nowMs).toISOString(),
      expiresAtMs: expiresAtMs,
      expiresAtISO: new Date(expiresAtMs).toISOString(),
      createdAtMs: createdAtMs,
      createdAtISO: new Date(createdAtMs).toISOString(),
      minutesRemaining: (expiresAtMs - nowMs) / 1000 / 60,
      isExpired: nowMs > expiresAtMs,
      email: email.toLowerCase(),
      otp: otp,
      rawExpires: otpRecord.expires_at,
      rawCreated: otpRecord.created_at
    });

    if (nowMs > expiresAtMs) {
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

    // Check if already used
    if (otpRecord.is_used) {
      return NextResponse.json(
        { success: false, message: "OTP has already been used" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await supabase
      .from("otp_verifications")
      .update({ is_used: true })
      .eq("id", otpRecord.id);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
