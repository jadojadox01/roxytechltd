import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcrypt";
import { prismaClientInstance } from "@/lib/prismaDB";
import { requireAuth } from "@/lib/rbac";
import { logActivity, getRequestMeta } from "@/lib/activity-log";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const user = await prismaClientInstance.user.findUnique({
      where: { id: session!.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Fetch profile error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    const existing = await prismaClientInstance.user.findUnique({
      where: { id: session!.user.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const emailChanging = email !== undefined && email !== existing.email;
    const passwordChanging = Boolean(newPassword);

    if ((emailChanging || passwordChanging) && !currentPassword) {
      return NextResponse.json(
        { success: false, message: "Current password is required to change email or password" },
        { status: 400 }
      );
    }

    if (emailChanging || passwordChanging) {
      const valid = await compare(currentPassword, existing.password);
      if (!valid) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 400 }
        );
      }
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (emailChanging) {
      if (!email || typeof email !== "string") {
        return NextResponse.json({ success: false, message: "Valid email is required" }, { status: 400 });
      }

      const taken = await prismaClientInstance.user.findUnique({ where: { email } });
      if (taken && taken.id !== existing.id) {
        return NextResponse.json({ success: false, message: "Email is already in use" }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name || null;
    if (emailChanging) updateData.email = email;
    if (passwordChanging) updateData.password = await hash(newPassword, 12);

    const user = await prismaClientInstance.user.update({
      where: { id: existing.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    const meta = getRequestMeta(req);
    await logActivity({
      userId: session!.user.id,
      userName: user.name || user.email,
      userRole: user.role,
      action: "PROFILE_UPDATED",
      module: "USER",
      entityId: user.id,
      entityName: user.email,
      description: "Updated account profile",
      oldValue: {
        name: existing.name,
        email: existing.email,
        passwordChanged: false,
      },
      newValue: {
        name: user.name,
        email: user.email,
        passwordChanged: passwordChanging,
      },
      ...meta,
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 });
  }
}
