import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name, email and message are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Store in DB as a simple log — we re-use SiteSetting context but save to a
    // dedicated contact_message table. Since no model exists yet, we log to console
    // and return success. To persist, add a ContactMessage model to schema.prisma.
    console.log("[Contact Form Submission]", {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      subject: subject?.trim() || null,
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    });

    // TODO: wire up email sending here (nodemailer, Resend, etc.)

    return NextResponse.json({
      success: true,
      message: "Your message has been received. We will get back to you shortly.",
    });
  } catch (error: any) {
    console.error("[Contact API Error]", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
