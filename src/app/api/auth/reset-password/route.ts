import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/password-reset";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body?.token || "").trim();
    const password = String(body?.password || "");
    const confirm = String(body?.confirmPassword || body?.passwordConfirm || "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Reset token is missing." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (password !== confirm) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match." },
        { status: 400 }
      );
    }

    const result = await resetPasswordWithToken(token, password);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated. You can sign in with your new password.",
    });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json(
      { success: false, message: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}
