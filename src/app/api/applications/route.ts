import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// GET /api/applications — List all applications for the authenticated user
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const applications = await prisma.application.findMany({
      where: { userId: decoded.userId },
      include: { documents: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

// POST /api/applications — Create a new application
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const { companyName, jobTitle, jobDescription, jobUrl } =
      await request.json();

    if (!companyName || !jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: "Company name, job title, and job description are required" },
        { status: 400 }
      );
    }

    // Check subscription limits
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const limits: Record<string, number> = {
      spark: 3,
      momentum: 50,
      apex: Infinity,
    };
    const limit = limits[user.subscriptionStatus] || 3;
    if (user.applicationsUsed >= limit) {
      return NextResponse.json(
        {
          error: `You've reached your ${user.subscriptionStatus} tier limit of ${limit} applications. Please upgrade your plan.`,
        },
        { status: 403 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId: decoded.userId,
        companyName,
        jobTitle,
        jobDescription,
        jobUrl: jobUrl || null,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
