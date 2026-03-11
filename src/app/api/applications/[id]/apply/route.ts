import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { tailorCV, generateCoverLetter } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // Get the application
    const application = await prisma.application.findFirst({
      where: { id, userId: decoded.userId },
    });
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Get the user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: decoded.userId },
    });
    if (!profile?.extractedData) {
      return NextResponse.json(
        { error: "Please upload your CV first" },
        { status: 400 }
      );
    }

    const extractedProfile = JSON.parse(profile.extractedData);

    // Generate tailored CV and cover letter in parallel
    const [tailoredCvText, coverLetterText] = await Promise.all([
      tailorCV(extractedProfile, application.jobDescription),
      generateCoverLetter(extractedProfile, application.jobDescription),
    ]);

    // Save the document
    const document = await prisma.document.create({
      data: {
        applicationId: application.id,
        tailoredCvText,
        coverLetterText,
      },
    });

    // Update application status
    await prisma.application.update({
      where: { id: application.id },
      data: { status: "applying" },
    });

    // Increment the user's application count
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { applicationsUsed: { increment: 1 } },
    });

    return NextResponse.json({
      message: "CV tailored and cover letter generated successfully",
      document: {
        id: document.id,
        tailoredCvText,
        coverLetterText,
      },
    });
  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json(
      { error: "Failed to generate application documents" },
      { status: 500 }
    );
  }
}
