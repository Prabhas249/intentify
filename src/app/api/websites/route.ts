import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";
import { normalizeDomain, getPlanLimits } from "@/lib/utils";

// GET /api/websites - List user's websites
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const websites = await db.website.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            campaigns: true,
            visitors: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(websites);
  } catch (error) {
    console.error("Error fetching websites:", error);
    return NextResponse.json(
      { error: "Failed to fetch websites" },
      { status: 500 }
    );
  }
}

// POST /api/websites - Create new website
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Clean and validate domain
    const cleanDomain = normalizeDomain(domain);

    // Check if domain already exists for this user
    const existing = await db.website.findFirst({
      where: {
        userId: session.user.id,
        domain: cleanDomain,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This website is already added" },
        { status: 400 }
      );
    }

    // Check user's plan limit
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: { websites: true },
        },
      },
    });

    const limits = getPlanLimits(user?.plan);

    if (user && user._count.websites >= limits.websites) {
      return NextResponse.json(
        { error: `Your plan allows only ${limits.websites} website(s). Please upgrade.` },
        { status: 403 }
      );
    }

    // Create website with unique script key
    const website = await db.website.create({
      data: {
        userId: session.user.id,
        domain: cleanDomain,
        scriptKey: nanoid(16),
      },
    });

    return NextResponse.json(website, { status: 201 });
  } catch (error) {
    console.error("Error creating website:", error);
    return NextResponse.json(
      { error: "Failed to create website" },
      { status: 500 }
    );
  }
}
