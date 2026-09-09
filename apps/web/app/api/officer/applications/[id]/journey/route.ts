import { NextResponse } from "next/server";
import { auth } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";
import { advanceResidenceJourney } from "../../../../../../lib/services/application.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // 1. Authentication
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    // 2. Verify the user directly in PostgreSQL
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 401 }
      );
    }

    // 3. Officer authorization
    if (user.role !== "officer" && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. Officer access required.",
        },
        { status: 403 }
      );
    }

    // 4. Application ID
    const { id } = await params;

    // 5. Validate request body
    const body = await request.json();
    const { action } = body;

    const allowedActions = [
      "VALIDATE_DOCUMENTS",
      "VERIFY_MEDICAL",
      "VERIFY_PAYMENT",
      "APPROVE_IMMIGRATION",
    ];

    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid journey action.",
        },
        { status: 400 }
      );
    }

    // 6. Advance the journey
    const journey = await advanceResidenceJourney(
      id,
      action,
      user.email
    );

    return NextResponse.json({
      success: true,
      journey,
      message: "Residence journey updated successfully.",
    });
  } catch (error) {
    console.error("Journey update error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update residence journey.";

    let status = 400;

    if (message === "Unauthorized.") {
      status = 401;
    }

    if (message === "Forbidden.") {
      status = 403;
    }

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  }
}