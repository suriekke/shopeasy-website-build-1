import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cart, users, products } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('user_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Single cart item by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const cartItem = await db.select()
        .from(cart)
        .where(eq(cart.id, parseInt(id)))
        .limit(1);

      if (cartItem.length === 0) {
        return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
      }

      return NextResponse.json(cartItem[0]);
    }

    // List cart items with optional filtering
    let query = db.select().from(cart);
    let conditions = [];

    // Filter by user_id if provided
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "Valid user_id is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(cart.userId, parseInt(userId)));
    }

    // Apply search if provided (search by product_id as string)
    if (search) {
      conditions.push(like(cart.productId.toString(), `%${search}%`));
    }

    // Apply filters
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Apply sorting
    const orderDirection = order === 'asc' ? asc : desc;
    switch (sort) {
      case 'quantity':
        query = query.orderBy(orderDirection(cart.quantity));
        break;
      case 'updatedAt':
        query = query.orderBy(orderDirection(cart.updatedAt));
        break;
      default:
        query = query.orderBy(orderDirection(cart.createdAt));
    }

    const results = await query.limit(limit).offset(offset);
    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { userId, productId, quantity } = requestBody;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "user_id is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ 
        error: "product_id is required",
        code: "MISSING_PRODUCT_ID" 
      }, { status: 400 });
    }

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ 
        error: "quantity is required and must be greater than 0",
        code: "INVALID_QUANTITY" 
      }, { status: 400 });
    }

    // Validate userId and productId are integers
    if (isNaN(parseInt(userId)) || isNaN(parseInt(productId))) {
      return NextResponse.json({ 
        error: "user_id and product_id must be valid integers",
        code: "INVALID_IDS" 
      }, { status: 400 });
    }

    // Validate that user exists
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

    // Validate that product exists
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

    // Create cart item
    const newCartItem = await db.insert(cart)
      .values({
        userId: parseInt(userId),
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newCartItem[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
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

    const requestBody = await request.json();
    const { quantity, userId, productId } = requestBody;

    // Check if cart item exists
    const existingItem = await db.select()
      .from(cart)
      .where(eq(cart.id, parseInt(id)))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    let updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate quantity if provided
    if (quantity !== undefined) {
      if (quantity <= 0) {
        return NextResponse.json({ 
          error: "quantity must be greater than 0",
          code: "INVALID_QUANTITY" 
        }, { status: 400 });
      }
      updates.quantity = parseInt(quantity);
    }

    // Validate userId if provided
    if (userId !== undefined) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "user_id must be a valid integer",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }

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

    // Validate productId if provided
    if (productId !== undefined) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json({ 
          error: "product_id must be a valid integer",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }

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

    const updated = await db.update(cart)
      .set(updates)
      .where(eq(cart.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
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

    // Check if cart item exists
    const existingItem = await db.select()
      .from(cart)
      .where(eq(cart.id, parseInt(id)))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    const deleted = await db.delete(cart)
      .where(eq(cart.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Cart item deleted successfully',
      deletedItem: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}