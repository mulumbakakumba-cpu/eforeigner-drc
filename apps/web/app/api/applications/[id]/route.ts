import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../lib/auth";
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
} from "../../../../lib/email";

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

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user || (user.role !== "officer" && user.role !== "admin")) {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const allowedStatuses = ["Submitted", "Approved", "Rejected"] as const;

  if (typeof body.status !== "string" || !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ message: "Invalid application status." }, { status: 400 });
  }

  const application = await prisma.application.update({
    where: { id },
    data: { status: body.status },
  });

  if (body.status === "Approved") {
  await sendApplicationApprovedEmail(
    application.email,
    application.fullName,
    application.applicationId
  );
}

if (body.status === "Rejected") {
  await sendApplicationRejectedEmail(
    application.email,
    application.fullName,
    application.applicationId
  );
}

  return NextResponse.json(application);
}