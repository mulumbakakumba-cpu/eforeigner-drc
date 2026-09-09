import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!fullName || !email || password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Full name, valid email and a password of at least 8 characters are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email address." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { fullName, email, password: hashedPassword },
      select: { id: true, fullName: true, email: true, role: true },
    });

    return NextResponse.json(
      { success: true, user, message: "Account created successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed." },
      { status: 500 }
    );
  }
}
