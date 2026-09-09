import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../lib/auth";
import PDFDocument from "pdfkit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const application = await prisma.application.findUnique({
  where: {
    applicationId: id,
  },
});

  if (!application) {
    return new NextResponse("Application not found", { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  if (application.userId !== user.id && user.role !== "officer" && user.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const doc = new PDFDocument({
    margin: 50,
  });

  const buffers: Buffer[] = [];

  doc.on("data", (chunk) => buffers.push(chunk));

  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });

  doc.fontSize(22).text("eForeigner DRC", {
    align: "center",
  });

  doc.moveDown();

  doc.fontSize(16).text("Visa Application Receipt", {
    align: "center",
  });

  doc.moveDown(2);

  doc.fontSize(12);

  doc.text(`Application ID: ${application.applicationId}`);
  doc.text(`Full Name: ${application.fullName}`);
  doc.text(`Email: ${application.email}`);
  doc.text(`Nationality: ${application.nationality}`);
  doc.text(`Passport Number: ${application.passportNumber}`);
  doc.text(`Purpose: ${application.purpose}`);
  doc.text(`Status: ${application.status}`);

  doc.text(
    `Submitted: ${application.createdAt.toLocaleString()}`
  );

  doc.moveDown(2);

  doc.text(
    "Thank you for using eForeigner DRC."
  );

  doc.end();

  const pdf = await pdfPromise;

return new NextResponse(new Uint8Array(pdf), {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${application.applicationId}-receipt.pdf"`,
  },
});
}