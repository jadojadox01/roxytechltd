import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/rbac";
import {
  getOrCreateSiteSettings,
  updateSiteSettings,
} from "@/lib/site-settings-db";

export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const settings = await getOrCreateSiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: unknown) {
    console.error("GET SITE SETTINGS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch site settings",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const body = await request.json();
    const current = await getOrCreateSiteSettings();
    const settings = await updateSiteSettings(current.id, {
      about: body.about ?? null,
      mission: body.mission ?? null,
      vision: body.vision ?? null,
      contactPhone: body.contactPhone ?? null,
      contactEmail: body.contactEmail ?? null,
      contactAddress: body.contactAddress ?? null,
      facebookUrl: body.facebookUrl ?? null,
      twitterUrl: body.twitterUrl ?? null,
      instagramUrl: body.instagramUrl ?? null,
      linkedinUrl: body.linkedinUrl ?? null,
      currency: body.currency || "RWF",
      momoPhone: body.momoPhone ? String(body.momoPhone).trim() || null : null,
      momoAccountName: body.momoAccountName
        ? String(body.momoAccountName).trim() || null
        : null,
      momoEnabled: body.momoEnabled !== false,
      bankCardsEnabled: body.bankCardsEnabled === true,
      bankCardsMessage: body.bankCardsMessage ?? "Coming soon",
      codEnabled: body.codEnabled !== false,
      heroEyebrow: body.heroEyebrow ?? null,
      heroTitle: body.heroTitle ?? null,
      heroSubtitle: body.heroSubtitle ?? null,
    });

    revalidateTag("site-settings", "max");
    revalidateTag("heroSliders", "max");

    return NextResponse.json({ success: true, settings });
  } catch (error: unknown) {
    console.error("UPDATE SITE SETTINGS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update site settings",
      },
      { status: 500 }
    );
  }
}
