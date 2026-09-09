import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createApplication } from "../../../lib/services/application.service";
import { auth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import path from "path";
import { writeFile } from "fs/promises";
import { sendApplicationSubmittedEmail } from "../../../lib/email";

const FILE_RULES = {
  passport: {
    maxSize: 5 * 1024 * 1024,
    types: [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ],
  },

  photo: {
    maxSize: 5 * 1024 * 1024,
    types: [
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
  },

  support: {
    maxSize: 10 * 1024 * 1024,
    types: [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ],
  },
} as const;

function hasValidFileSignature(
  buffer: Buffer,
  fileType: string
): boolean {
  // PDF: %PDF
  if (fileType === "application/pdf") {
    return buffer.subarray(0, 4).toString() === "%PDF";
  }

  // JPEG: FF D8 FF
  if (fileType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (fileType === "image/png") {
    const signature = [
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a,
    ];

    return signature.every(
      (byte, index) => buffer[index] === byte
    );
  }

  // WEBP: RIFF....WEBP
  if (fileType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString() === "RIFF" &&
      buffer.subarray(8, 12).toString() === "WEBP"
    );
  }

  return false;
}

async function saveFile(
  file: File | null,
  prefix: keyof typeof FILE_RULES
) {
  if (!file || file.size === 0) {
    return null;
  }

  const rules = FILE_RULES[prefix];

  // Check file size
  if (file.size > rules.maxSize) {
    throw new Error(
      `${prefix} file is too large. Maximum size is ${
        rules.maxSize / (1024 * 1024)
      } MB.`
    );
  }

  // Check MIME type
  if (!rules.types.includes(file.type as never)) {
    throw new Error(
      `Invalid ${prefix} file type: ${file.type || "unknown"}.`
    );
  }

  // Keep only the final filename component
  const originalName = path.basename(file.name);

  // Sanitize filename
  const safeName = originalName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  const filename = `${prefix}-${Date.now()}-${safeName}`;

  const uploadPath = path.join(
    process.cwd(),
    "private",
    "uploads",
    filename
  );

  const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);

if (!hasValidFileSignature(buffer, file.type)) {
  throw new Error(
    `Invalid file content for ${prefix}.`
  );
}

await writeFile(uploadPath, buffer);
  return filename;
}
export async function POST(request: Request) {
  const createdFiles: string[] = [];

  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();

    if (!idempotencyKey || idempotencyKey.length > 128) {
      return NextResponse.json(
        { success: false, message: "A valid Idempotency-Key is required." },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const getText = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value.trim() : "";
    };

    const body = {
      fullName: getText("fullName"),
      email: getText("email").toLowerCase(),
      nationality: getText("nationality"),
      passportNumber: getText("passportNumber"),
      birthDate: getText("birthDate"),
      arrivalDate: getText("arrivalDate"),
      purpose: getText("purpose"),
    };

    if (!body.fullName || !body.email || !body.nationality || !body.passportNumber || !body.purpose) {
      return NextResponse.json(
        { success: false, message: "Full name, email, nationality, passport number and purpose are required." },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(body.email)) {
      return NextResponse.json({ success: false, message: "Invalid email address." }, { status: 400 });
    }

    const parseDate = (value: string, label: string) => {
      if (!value) return undefined;
      const date = new Date(`${value}T00:00:00.000Z`);
      if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${label}.`);
      return date;
    };

    const birthDate = parseDate(body.birthDate, "birth date");
    const arrivalDate = parseDate(body.arrivalDate, "arrival date");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    // Idempotency replay: return the original application before touching the filesystem.
    const existingApplication = await prisma.application.findUnique({
      where: { idempotencyKey },
      include: {
        residenceJourney: {
          include: {
            steps: true,
            medical: true,
            payments: true,
            immigration: true,
          },
        },
      },
    });

    if (existingApplication) {
      if (existingApplication.userId !== user.id) {
        return NextResponse.json({ success: false, message: "Idempotency key belongs to another application." }, { status: 409 });
      }

      return NextResponse.json({
        success: true,
        application: existingApplication,
        journey: existingApplication.residenceJourney,
        message: "Application already submitted.",
        created: false,
      });
    }

    const passportFile = formData.get("passportFile") as File | null;
    const photoFile = formData.get("photoFile") as File | null;
    const supportFile = formData.get("supportFile") as File | null;

    const passportFilename = await saveFile(passportFile, "passport");
    if (passportFilename) createdFiles.push(passportFilename);

    const photoFilename = await saveFile(photoFile, "photo");
    if (photoFilename) createdFiles.push(photoFilename);

    const supportFilename = await saveFile(supportFile, "support");
    if (supportFilename) createdFiles.push(supportFilename);

    const applicationId = `DRC-${new Date().getUTCFullYear()}-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;

   const { application, journey, created } = await createApplication({
      applicationId,
      idempotencyKey,
      fullName: body.fullName,
      email: body.email,
      nationality: body.nationality,
      passportNumber: body.passportNumber,
      purpose: body.purpose,
      birthDate,
      arrivalDate,
      userId: user.id,
      passportFile: passportFilename ?? undefined,
      photoFile: photoFilename ?? undefined,
      supportFile: supportFilename ?? undefined,
    });

    if (!created) {
      const { unlink } = await import("fs/promises");
      await Promise.all(
        createdFiles.map(async (filename) => {
          try {
            await unlink(path.join(process.cwd(), "private", "uploads", filename));
          } catch {
            // Ignore cleanup failures.
          }
        })
      );
    }

    if (created) {
      await sendApplicationSubmittedEmail(
        body.email,
        body.fullName,
        application.applicationId
      );
    }

    return NextResponse.json({
      success: true,
      application,
      journey,
      message: created
        ? "Application submitted successfully!"
        : "Application already submitted.",
      created,
    }, { status: created ? 201 : 200 });
  } catch (error) {
    console.error("Visa application error:", error);

    // Remove files written by this request if application creation failed.
    if (createdFiles.length > 0) {
      const { unlink } = await import("fs/promises");
      await Promise.all(
        createdFiles.map(async (filename) => {
          try {
            await unlink(path.join(process.cwd(), "private", "uploads", filename));
          } catch {
            // Ignore cleanup failures; the original error is more important.
          }
        })
      );
    }

    const message = error instanceof Error ? error.message : "Failed to submit application.";
    const status = message.startsWith("Invalid ") ? 400 : 500;

    return NextResponse.json({ success: false, message }, { status });
  }
}
