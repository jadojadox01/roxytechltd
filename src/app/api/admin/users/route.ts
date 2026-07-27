import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prismaClientInstance } from "@/lib/prismaDB";
import { requireAdmin } from "@/lib/rbac";
import { logActivity, getRequestMeta } from "@/lib/activity-log";

export async function GET() {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const users = await prismaClientInstance.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (err: unknown) {
    console.error("Fetch users error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password required" }, { status: 400 });
    }

    const validRoles = ["USER", "ADMIN", "STORE_KEEPER"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 });
    }

    const existing = await prismaClientInstance.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);
    const user = await prismaClientInstance.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role: role || "USER",
      },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    const meta = getRequestMeta(req);
    await logActivity({
      userId: session!.user.id,
      userName: session!.user.name || session!.user.email,
      userRole: session!.user.role,
      action: "USER_CREATED",
      module: "USER",
      entityId: user.id,
      entityName: user.email,
      description: `Created user ${user.email} with role ${user.role}`,
      newValue: { name: user.name, email: user.email, role: user.role },
      ...meta,
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (err: unknown) {
    console.error("Create user error:", err);
    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { userId, name, role, status, password } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId required" }, { status: 400 });
    }

    const existing = await prismaClientInstance.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) {
      const validRoles = ["USER", "ADMIN", "STORE_KEEPER"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 });
      }
      updateData.role = role;
    }
    if (status !== undefined) updateData.status = status;
    if (password) updateData.password = await hash(password, 12);

    const user = await prismaClientInstance.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, status: true, updatedAt: true },
    });

    const meta = getRequestMeta(req);
    await logActivity({
      userId: session!.user.id,
      userName: session!.user.name || session!.user.email,
      userRole: session!.user.role,
      action: "USER_UPDATED",
      module: "USER",
      entityId: user.id,
      entityName: user.email,
      description: `Updated user ${user.email}`,
      oldValue: { name: existing.name, role: existing.role, status: existing.status },
      newValue: { name: user.name, role: user.role, status: user.status },
      ...meta,
    });

    return NextResponse.json({ success: true, user });
  } catch (err: unknown) {
    console.error("Update user error:", err);
    return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId required" }, { status: 400 });
    }

    if (userId === session!.user.id) {
      return NextResponse.json({ success: false, message: "Cannot delete your own account" }, { status: 400 });
    }

    const existing = await prismaClientInstance.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    await prismaClientInstance.user.delete({ where: { id: userId } });

    const meta = getRequestMeta(req);
    await logActivity({
      userId: session!.user.id,
      userName: session!.user.name || session!.user.email,
      userRole: session!.user.role,
      action: "USER_DELETED",
      module: "USER",
      entityId: userId,
      entityName: existing.email,
      description: `Deleted user ${existing.email}`,
      oldValue: { name: existing.name, email: existing.email, role: existing.role },
      ...meta,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete user error:", err);
    return NextResponse.json({ success: false, message: "Failed to delete user" }, { status: 500 });
  }
}
