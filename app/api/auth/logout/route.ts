import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value;

    if (sessionToken) {
      // Delete session from database
      await supabase
        .from("user_sessions")
        .delete()
        .eq("session_token", sessionToken);
    }

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.delete("session_token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
