import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { parseFile } from "@/lib/parseFile";
import { extractProfile } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    // Authenticate
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("cv") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload a PDF, DOCX, or TXT file" },
        { status: 400 }
      );
    }

    // Convert file to buffer and parse text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const rawText = await parseFile(buffer, file.name);

    // Send to Gemini for extraction
    const extracted = await extractProfile(rawText);

    // Save the original file locally (production: use S3)
    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const fileName = `${decoded.userId}-${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Update the user's profile
    await prisma.profile.upsert({
      where: { userId: decoded.userId },
      update: {
        originalCvUrl: `/uploads/${fileName}`,
        extractedData: JSON.stringify(extracted),
        extractedSkills: JSON.stringify(extracted.skills || []),
        yearsExperience: extracted.yearsOfExperience || null,
        industryFocus: Array.isArray(extracted.industries)
          ? extracted.industries.join(", ")
          : extracted.industries || null,
      },
      create: {
        userId: decoded.userId,
        originalCvUrl: `/uploads/${fileName}`,
        extractedData: JSON.stringify(extracted),
        extractedSkills: JSON.stringify(extracted.skills || []),
        yearsExperience: extracted.yearsOfExperience || null,
        industryFocus: Array.isArray(extracted.industries)
          ? extracted.industries.join(", ")
          : extracted.industries || null,
      },
    });

    return NextResponse.json({
      message: "CV uploaded and profile extracted successfully",
      profile: extracted,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process CV" },
      { status: 500 }
    );
  }
}
