import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

// Fetch reviews for a product (used by review data loader)
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { productSlug } = body;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        AND: [
          {
            productSlug: productSlug,
          },
          {
            isApproved: true,
          },
        ]
      },
    });

    if (!reviews) {
      return NextResponse.json(
        { message: "No reviews found" },
        { status: 200 }
      );
    }

    return NextResponse.json({ review: reviews }, { status: 200 });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Submit a new review (awaits approval)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { productSlug, name, email, comment, ratings } = body;

    if (!productSlug || !name || !email || !comment || !ratings) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (ratings < 1 || ratings > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productSlug,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        comment: comment.trim(),
        ratings: Number(ratings),
        isApproved: false,
      },
    });

    return NextResponse.json(
      { success: true, message: "Review submitted for approval", review },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
