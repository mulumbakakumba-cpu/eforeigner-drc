import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function POST(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // Development/demo payment only
    if (process.env.PAYMENT_PROVIDER !== "demo") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment provider is not configured. Configure the official payment provider before accepting payments.",
        },
        { status: 503 }
      );
    }

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

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
        { status: 404 }
      );
    }

    const application = await prisma.application.findUnique({
      where: {
        id,
      },
      include: {
        residenceJourney: {
          include: {
            payments: {
              orderBy: {
                createdAt: "desc",
              },
            },
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
        { status: 404 }
      );
    }

    // Citizens can only pay for their own application.
    if (
      user.role === "citizen" &&
      application.userId !== user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not allowed to pay for this application.",
        },
        { status: 403 }
      );
    }

    if (!application.residenceJourney) {
      return NextResponse.json(
        {
          success: false,
          message: "Residence journey not found.",
        },
        { status: 404 }
      );
    }

    // Payment becomes available at 60%.
    if (application.residenceJourney.percentage !== 60) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment is not available at the current application stage.",
        },
        { status: 409 }
      );
    }

    const payment = application.residenceJourney.payments.find(
      (item) => item.status === "PENDING"
    );

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "No pending payment was found.",
        },
        { status: 409 }
      );
    }

    const reference = `PAY-DRC-${randomUUID()
      .replaceAll("-", "")
      .slice(0, 12)
      .toUpperCase()}`;

    const updatedPayment = await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "PAID",
        reference,
        paidAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment completed successfully.",
      payment: {
        id: updatedPayment.id,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        status: updatedPayment.status,
        reference: updatedPayment.reference,
        paidAt: updatedPayment.paidAt,
      },
      demo: true,
    });
  } catch (error) {
    console.error("PAYMENT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Payment processing failed.",
      },
      { status: 500 }
    );
  }
}