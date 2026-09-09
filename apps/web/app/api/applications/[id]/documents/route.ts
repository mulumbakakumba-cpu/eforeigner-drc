import { NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

const allowedDocuments = [
  "passport",
  "photo",
  "support",
] as const;

type DocumentType = (typeof allowedDocuments)[number];

function isDocumentType(value: string): value is DocumentType {
  return allowedDocuments.includes(value as DocumentType);
}

function getContentType(filename: string) {
  const extension = path.extname(filename).toLowerCase();

  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const url = new URL(request.url);
    const documentType = url.searchParams.get("type");

    if (!documentType || !isDocumentType(documentType)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document type.",
        },
        { status: 400 }
      );
    }

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

    const application = await prisma.application.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        passportFile: true,
        photoFile: true,
        supportFile: true,
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

    const isOwner = application.userId === user.id;
    const isOfficer =
      user.role === "officer" || user.role === "admin";

    if (!isOwner && !isOfficer) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }

    const filenameMap: Record<DocumentType, string | null> = {
      passport: application.passportFile,
      photo: application.photoFile,
      support: application.supportFile,
    };

    const filename = filenameMap[documentType];

    if (!filename) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found.",
        },
        { status: 404 }
      );
    }

    const uploadDirectory = path.join(
  process.cwd(),
  "private",
  "uploads"
);

    const safeFilename = path.basename(filename);

    const filePath = path.join(
      uploadDirectory,
      safeFilename
    );

    const file = await readFile(filePath);

await prisma.documentAccessLog.create({
  data: {
    applicationId: application.id,
    userId: user.id,
    documentType,
    action: "VIEWED",
  },
});

return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": getContentType(safeFilename),
        "Content-Disposition": `inline; filename="${safeFilename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Document access error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve document.",
      },
      { status: 500 }
    );
  }
}