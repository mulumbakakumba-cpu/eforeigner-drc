import { NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const admin = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!admin || admin.role !== "admin") {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  const { role } = await request.json();
  const { id } = await params;
  const allowedRoles = ["citizen", "officer", "admin"] as const;

if (
  typeof role !== "string" ||
  !allowedRoles.includes(role as (typeof allowedRoles)[number])
) {
    return NextResponse.json({ message: "Invalid role." }, { status: 400 });
  }

  if (id === admin.id && role !== "admin") {
    return NextResponse.json({ message: "An administrator cannot remove their own admin role." }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, fullName: true, email: true, role: true },
  });

  return NextResponse.json(updatedUser);
}