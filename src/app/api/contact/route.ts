import { NextRequest, NextResponse } from "next/server";
import { prismaClientInstance } from "@/lib/prismaDB";

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

    if (String(message).length > 2000) {
      return NextResponse.json(
        { success: false, message: "Message is too long" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    await prismaClientInstance.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been received. We will get back to you shortly.",
    });
  } catch (error: unknown) {
    console.error("[Contact API Error]", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
