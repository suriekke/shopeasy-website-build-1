import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, categories } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single product by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const product = await db.select()
        .from(products)
        .where(eq(products.id, parseInt(id)))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json({ 
          error: 'Product not found',
          code: "PRODUCT_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(product[0]);
    }

    // List products with pagination, search, and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('category_id');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(products);
    const conditions = [];

    // Search by name
    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }

    // Filter by category_id
    if (categoryId && !isNaN(parseInt(categoryId))) {
      conditions.push(eq(products.categoryId, parseInt(categoryId)));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = products[sort as keyof typeof products] || products.createdAt;
    const orderDirection = order === 'asc' ? asc : desc;
    query = query.orderBy(orderDirection(sortColumn));

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
    const { 
      name, 
      description, 
      price, 
      discountedPrice, 
      imageUrl, 
      categoryId, 
      stockQuantity, 
      deliveryTime,
      rating,
      reviewCount
    } = requestBody;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        error: "Product name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!price || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ 
        error: "Valid price is required",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (!categoryId || isNaN(parseInt(categoryId))) {
      return NextResponse.json({ 
        error: "Valid category ID is required",
        code: "INVALID_CATEGORY_ID" 
      }, { status: 400 });
    }

    // Validate category exists
    const category = await db.select()
      .from(categories)
      .where(eq(categories.id, parseInt(categoryId)))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json({ 
        error: "Category not found",
        code: "CATEGORY_NOT_FOUND" 
      }, { status: 400 });
    }

    // Prepare insert data with defaults
    const insertData = {
      name: name.trim(),
      description: description?.trim() || null,
      price: parseFloat(price),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      imageUrl: imageUrl?.trim() || null,
      categoryId: parseInt(categoryId),
      stockQuantity: stockQuantity ? parseInt(stockQuantity) : 0,
      deliveryTime: deliveryTime?.trim() || '8 mins',
      rating: rating ? parseFloat(rating) : 0,
      reviewCount: reviewCount ? parseInt(reviewCount) : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newProduct = await db.insert(products)
      .values(insertData)
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });

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

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found',
        code: "PRODUCT_NOT_FOUND" 
      }, { status: 404 });
    }

    const requestBody = await request.json();
    const { 
      name, 
      description, 
      price, 
      discountedPrice, 
      imageUrl, 
      categoryId, 
      stockQuantity, 
      deliveryTime,
      rating,
      reviewCount
    } = requestBody;

    // Validate fields if provided
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json({ 
        error: "Product name cannot be empty",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return NextResponse.json({ 
        error: "Valid price is required",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (categoryId !== undefined) {
      if (isNaN(parseInt(categoryId))) {
        return NextResponse.json({ 
          error: "Valid category ID is required",
          code: "INVALID_CATEGORY_ID" 
        }, { status: 400 });
      }

      // Validate category exists
      const category = await db.select()
        .from(categories)
        .where(eq(categories.id, parseInt(categoryId)))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json({ 
          error: "Category not found",
          code: "CATEGORY_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (discountedPrice !== undefined) updateData.discountedPrice = discountedPrice ? parseFloat(discountedPrice) : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
    if (stockQuantity !== undefined) updateData.stockQuantity = parseInt(stockQuantity);
    if (deliveryTime !== undefined) updateData.deliveryTime = deliveryTime?.trim() || '8 mins';
    if (rating !== undefined) updateData.rating = parseFloat(rating);
    if (reviewCount !== undefined) updateData.reviewCount = parseInt(reviewCount);

    const updated = await db.update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(id)))
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

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found',
        code: "PRODUCT_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Product deleted successfully',
      deletedProduct: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}