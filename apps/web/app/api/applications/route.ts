import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load applications." },
      { status: 500 }
    );
  }
}