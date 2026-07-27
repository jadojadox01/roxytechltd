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

    if (result.ok && "missingMail" in result && result.missingMail) {
      return NextResponse.json({
        success: true,
        message:
          "If an account exists for that email, a reset link will be sent. Email delivery is not configured on the server yet — contact the store admin.",
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account exists for that email, we sent a password reset link. Check your inbox and spam folder.",
    });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json(
      { success: false, message: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
