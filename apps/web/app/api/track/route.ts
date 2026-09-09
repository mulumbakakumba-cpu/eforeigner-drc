import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const { applicationId } = await request.json();

    if (typeof applicationId !== "string" || !/^DRC-\d{4}-(?:\d{6}|[A-Z0-9]{8})$/i.test(applicationId.trim())) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID." },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { applicationId: applicationId.trim() },
      select: {
        applicationId: true,
        status: true,
        createdAt: true,
        residenceJourney: {
          select: {
            percentage: true,
            currentStep: true,
            status: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error.",
      },
      {
        status: 500,
      }
    );
  }
}