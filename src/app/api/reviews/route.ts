import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, users, products } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single review by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const review = await db.select()
        .from(reviews)
        .where(eq(reviews.id, parseInt(id)))
        .limit(1);

      if (review.length === 0) {
        return NextResponse.json({ 
          error: 'Review not found',
          code: "REVIEW_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(review[0], { status: 200 });
    }

    // List reviews with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const userId = searchParams.get('user_id');
    const productId = searchParams.get('product_id');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(reviews);

    // Build where conditions
    const conditions = [];
    
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "Valid user ID is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(reviews.userId, parseInt(userId)));
    }

    if (productId) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json({ 
          error: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(reviews.productId, parseInt(productId)));
    }

    if (search) {
      conditions.push(like(reviews.comment, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const orderDirection = order === 'asc' ? asc : desc;
    const sortField = sort === 'rating' ? reviews.rating : 
                     sort === 'updatedAt' ? reviews.updatedAt : 
                     reviews.createdAt;
    
    query = query.orderBy(orderDirection(sortField));

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('GET reviews error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, rating, comment } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ 
        error: "Product ID is required",
        code: "MISSING_PRODUCT_ID" 
      }, { status: 400 });
    }

    if (!rating) {
      return NextResponse.json({ 
        error: "Rating is required",
        code: "MISSING_RATING" 
      }, { status: 400 });
    }

    // Validate field types and values
    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "Valid user ID is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(productId))) {
      return NextResponse.json({ 
        error: "Valid product ID is required",
        code: "INVALID_PRODUCT_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5) {
      return NextResponse.json({ 
        error: "Rating must be between 1 and 5",
        code: "INVALID_RATING" 
      }, { status: 400 });
    }

    // Verify user exists
    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 400 });
    }

    // Verify product exists
    const productExists = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(productId)))
      .limit(1);

    if (productExists.length === 0) {
      return NextResponse.json({ 
        error: "Product not found",
        code: "PRODUCT_NOT_FOUND" 
      }, { status: 400 });
    }

    // Create new review
    const newReview = await db.insert(reviews)
      .values({
        userId: parseInt(userId),
        productId: parseInt(productId),
        rating: parseInt(rating),
        comment: comment ? comment.trim() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newReview[0], { status: 201 });

  } catch (error) {
    console.error('POST reviews error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { userId, productId, rating, comment } = body;

    // Check if review exists
    const existingReview = await db.select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json({ 
        error: 'Review not found',
        code: "REVIEW_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate fields if provided
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (userId !== undefined) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "Valid user ID is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }

      // Verify user exists
      const userExists = await db.select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (userExists.length === 0) {
        return NextResponse.json({ 
          error: "User not found",
          code: "USER_NOT_FOUND" 
        }, { status: 400 });
      }

      updates.userId = parseInt(userId);
    }

    if (productId !== undefined) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json({ 
          error: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }

      // Verify product exists
      const productExists = await db.select()
        .from(products)
        .where(eq(products.id, parseInt(productId)))
        .limit(1);

      if (productExists.length === 0) {
        return NextResponse.json({ 
          error: "Product not found",
          code: "PRODUCT_NOT_FOUND" 
        }, { status: 400 });
      }

      updates.productId = parseInt(productId);
    }

    if (rating !== undefined) {
      if (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5) {
        return NextResponse.json({ 
          error: "Rating must be between 1 and 5",
          code: "INVALID_RATING" 
        }, { status: 400 });
      }
      updates.rating = parseInt(rating);
    }

    if (comment !== undefined) {
      updates.comment = comment ? comment.trim() : null;
    }

    // Update review
    const updatedReview = await db.update(reviews)
      .set(updates)
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    if (updatedReview.length === 0) {
      return NextResponse.json({ 
        error: 'Review not found',
        code: "REVIEW_NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json(updatedReview[0], { status: 200 });

  } catch (error) {
    console.error('PUT reviews error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if review exists before deleting
    const existingReview = await db.select()
      .from(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .limit(1);

    if (existingReview.length === 0) {
      return NextResponse.json({ 
        error: 'Review not found',
        code: "REVIEW_NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete review
    const deletedReview = await db.delete(reviews)
      .where(eq(reviews.id, parseInt(id)))
      .returning();

    if (deletedReview.length === 0) {
      return NextResponse.json({ 
        error: 'Review not found',
        code: "REVIEW_NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Review deleted successfully',
      review: deletedReview[0] 
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE reviews error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}