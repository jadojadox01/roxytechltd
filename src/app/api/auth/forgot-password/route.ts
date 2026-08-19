import { NextResponse } from "next/server";
import { createPasswordResetForEmail } from "@/lib/password-reset";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const result = await createPasswordResetForEmail(email);

    if (!result.ok && result.reason === "not_found") {
      return NextResponse.json(
        {
          success: false,
          message: "This email is not registered. Please check it or create an account.",
        },
        { status: 404 }
      );
    }

    if (!result.ok && result.reason === "mail_failed") {
      return NextResponse.json(
        {
          success: false,
          message: "We could not send the reset email. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    if (result.ok && result.sent) {
      return NextResponse.json({
        success: true,
        message: "A password reset link has been sent to your email. Check your inbox and spam folder.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Unable to send a reset link for this email." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { success: false, message: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
