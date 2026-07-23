import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

import { prisma } from "@/lib/prismaDB";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

// ======================================================
// GET SITE SETTINGS (PUBLIC)
// ======================================================
export async function GET() {
  try {
    let settings = await prisma.siteSetting.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: {
          currency: "RWF",
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error("GET SITE SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch site settings",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// UPDATE SITE SETTINGS (ADMIN ONLY)
// ======================================================
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        {
          status: 403,
        }
      );
    }

    // Parse request body
    const body = await request.json();

    const {
      about,
      mission,
      vision,
      contactPhone,
      contactEmail,
      contactAddress,
      facebookUrl,
      twitterUrl,
      instagramUrl,
      linkedinUrl,
      currency,
    } = body;

    // Find existing settings
    let settings = await prisma.siteSetting.findFirst();

    const data = {
      about: about ?? null,
      mission: mission ?? null,
      vision: vision ?? null,
      contactPhone: contactPhone ?? null,
      contactEmail: contactEmail ?? null,
      contactAddress: contactAddress ?? null,
      facebookUrl: facebookUrl ?? null,
      twitterUrl: twitterUrl ?? null,
      instagramUrl: instagramUrl ?? null,
      linkedinUrl: linkedinUrl ?? null,
      currency: currency || "RWF",
    };

    // Create or update
    if (!settings) {
      settings = await prisma.siteSetting.create({
        data,
      });
    } else {
      settings = await prisma.siteSetting.update({
        where: {
          id: settings.id,
        },
        data,
      });
    }

    // Refresh cached pages/components
    revalidateTag("site-settings", "max");

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error("UPDATE SITE SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update site settings",
      },
      {
        status: 500,
      }
    );
  }
}