import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wishlists, users, products } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }
      
      const record = await db.select()
        .from(wishlists)
        .where(eq(wishlists.id, parseInt(id)))
        .limit(1);
      
      if (record.length === 0) {
        return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
      }
      
      return NextResponse.json(record[0]);
    }
    
    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const userId = searchParams.get('user_id');
    const productId = searchParams.get('product_id');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    let query = db.select().from(wishlists);
    let conditions = [];
    
    if (userId) {
      conditions.push(eq(wishlists.userId, parseInt(userId)));
    }
    
    if (productId) {
      conditions.push(eq(wishlists.productId, parseInt(productId)));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    const orderDirection = order === 'asc' ? asc : desc;
    if (sort === 'createdAt') {
      query = query.orderBy(orderDirection(wishlists.createdAt));
    } else if (sort === 'id') {
      query = query.orderBy(orderDirection(wishlists.id));
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
    const { userId, productId } = requestBody;
    
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
    
    // Validate IDs are integers
    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "Valid User ID is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }
    
    if (isNaN(parseInt(productId))) {
      return NextResponse.json({ 
        error: "Valid Product ID is required",
        code: "INVALID_PRODUCT_ID" 
      }, { status: 400 });
    }
    
    // Validate foreign keys exist
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
    
    // Check if wishlist item already exists
    const existingWishlist = await db.select()
      .from(wishlists)
      .where(and(
        eq(wishlists.userId, parseInt(userId)),
        eq(wishlists.productId, parseInt(productId))
      ))
      .limit(1);
    
    if (existingWishlist.length > 0) {
      return NextResponse.json({ 
        error: "Product already in wishlist",
        code: "DUPLICATE_WISHLIST_ITEM" 
      }, { status: 400 });
    }
    
    const insertData = {
      userId: parseInt(userId),
      productId: parseInt(productId),
      createdAt: new Date().toISOString()
    };
    
    const newRecord = await db.insert(wishlists)
      .values(insertData)
      .returning();
    
    return NextResponse.json(newRecord[0], { status: 201 });
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
    const { userId, productId } = requestBody;
    
    // Check record exists
    const existingRecord = await db.select()
      .from(wishlists)
      .where(eq(wishlists.id, parseInt(id)))
      .limit(1);
    
    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
    }
    
    const updates: any = {};
    
    // Validate and update userId if provided
    if (userId !== undefined) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "Valid User ID is required",
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
    
    // Validate and update productId if provided
    if (productId !== undefined) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json({ 
          error: "Valid Product ID is required",
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
    
    // Check for duplicate if updating userId or productId
    if (updates.userId || updates.productId) {
      const checkUserId = updates.userId || existingRecord[0].userId;
      const checkProductId = updates.productId || existingRecord[0].productId;
      
      const duplicateCheck = await db.select()
        .from(wishlists)
        .where(and(
          eq(wishlists.userId, checkUserId),
          eq(wishlists.productId, checkProductId),
          // Exclude current record
          eq(wishlists.id, parseInt(id))
        ))
        .limit(1);
      
      if (duplicateCheck.length === 0) {
        // Check if combination exists in other records
        const otherDuplicateCheck = await db.select()
          .from(wishlists)
          .where(and(
            eq(wishlists.userId, checkUserId),
            eq(wishlists.productId, checkProductId)
          ))
          .limit(1);
        
        if (otherDuplicateCheck.length > 0) {
          return NextResponse.json({ 
            error: "Product already in wishlist for this user",
            code: "DUPLICATE_WISHLIST_ITEM" 
          }, { status: 400 });
        }
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: "No valid fields to update",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }
    
    const updated = await db.update(wishlists)
      .set(updates)
      .where(eq(wishlists.id, parseInt(id)))
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
    
    // Check record exists
    const existingRecord = await db.select()
      .from(wishlists)
      .where(eq(wishlists.id, parseInt(id)))
      .limit(1);
    
    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
    }
    
    const deleted = await db.delete(wishlists)
      .where(eq(wishlists.id, parseInt(id)))
      .returning();
    
    return NextResponse.json({
      message: 'Wishlist item deleted successfully',
      deleted: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}