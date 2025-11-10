import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// This endpoint can be called periodically (e.g., via cron job) to clean up old OTPs
export async function POST(request: NextRequest) {
  try {
    // Delete OTPs older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("otp_verifications")
      .delete()
      .lt("created_at", oneHourAgo.toISOString());

    if (error) {
      console.error("Error cleaning up OTPs:", error);
      return NextResponse.json(
        { success: false, message: "Failed to clean up OTPs" },
        { status: 500 }
      );
    }

    console.log("OTP cleanup completed");

    return NextResponse.json({
      success: true,
      message: "Old OTPs cleaned up successfully",
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
