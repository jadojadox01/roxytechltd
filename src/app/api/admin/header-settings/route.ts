import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";


// GET HEADER SETTINGS
export async function GET() {
  try {
    let settings = await prisma.headerSetting.findFirst();

    if (!settings) {
      settings = await prisma.headerSetting.create({
        data: {},
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (error: any) {

    console.error("GET HEADER SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch settings",
      },
      {
        status: 500,
      }
    );
  }
}


// UPDATE HEADER SETTINGS
export async function PUT(request: NextRequest) {
  try {

    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 403,
        }
      );
    }

    const formData = await request.formData();

    const siteName = formData.get("siteName")?.toString() ?? "";
    const headerText = formData.get("headerText")?.toString() ?? "";
    const removeLogo = formData.get("removeLogo")?.toString() === "true";

    let logoUrl: string | undefined;

    const logo = formData.get("headerLogo");

    // Upload new logo
    if (logo instanceof File && logo.size > 0) {

      const buffer = Buffer.from(
        await logo.arrayBuffer()
      );

      const uploaded: any = await new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "roxytech/header",
          },
          (error, result) => {

            if (error) {
              reject(error);
            } else {
              resolve(result);
            }

          }
        );

        stream.end(buffer);

      });

      logoUrl = uploaded.secure_url;

    }

    let settings = await prisma.headerSetting.findFirst();

    if (!settings) {

      settings = await prisma.headerSetting.create({
        data: {
          siteName,
          headerText,
          headerLogo: removeLogo ? null : logoUrl,
        },
      });

    } else {

      settings = await prisma.headerSetting.update({

        where: {
          id: settings.id,
        },

        data: {

          siteName,

          headerText,

          ...(removeLogo
            ? { headerLogo: null }
            : logoUrl
            ? { headerLogo: logoUrl }
            : {}),

        },

      });

    }

    revalidateTag("header-setting", "max");
    revalidateTag("header-logo", "max");
    revalidateTag("site-name", "max");

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (error: any) {

    console.error("HEADER SETTINGS UPDATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update settings",
      },
      {
        status: 500,
      }
    );

  }
}