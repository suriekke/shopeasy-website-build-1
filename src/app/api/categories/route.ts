import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, like, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Single category by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const category = await db.select()
        .from(categories)
        .where(eq(categories.id, parseInt(id)))
        .limit(1);

      if (category.length === 0) {
        return NextResponse.json({ 
          error: 'Category not found',
          code: "CATEGORY_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(category[0]);
    }

    // List categories with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(categories);

    if (search) {
      query = query.where(like(categories.name, `%${search}%`));
    }

    // Apply sorting
    const orderBy = order === 'asc' ? asc : desc;
    if (sort === 'name') {
      query = query.orderBy(orderBy(categories.name));
    } else if (sort === 'updatedAt') {
      query = query.orderBy(orderBy(categories.updatedAt));
    } else {
      query = query.orderBy(orderBy(categories.createdAt));
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
    const { name, description, imageUrl } = requestBody;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: "Name is required and must be a non-empty string",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Check for duplicate name
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.name, name.trim()))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json({ 
        error: "Category name must be unique",
        code: "DUPLICATE_NAME" 
      }, { status: 400 });
    }

    // Prepare insert data
    const insertData = {
      name: name.trim(),
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newCategory = await db.insert(categories)
      .values(insertData)
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Category name must be unique",
        code: "DUPLICATE_NAME" 
      }, { status: 400 });
    }
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

    // Check if category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ 
        error: 'Category not found',
        code: "CATEGORY_NOT_FOUND" 
      }, { status: 404 });
    }

    const requestBody = await request.json();
    const { name, description, imageUrl } = requestBody;

    // Validate name if provided
    if (name !== undefined && (!name || typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({ 
        error: "Name must be a non-empty string",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    // Check for duplicate name if name is being updated
    if (name && name.trim() !== existingCategory[0].name) {
      const duplicateCategory = await db.select()
        .from(categories)
        .where(eq(categories.name, name.trim()))
        .limit(1);

      if (duplicateCategory.length > 0) {
        return NextResponse.json({ 
          error: "Category name must be unique",
          code: "DUPLICATE_NAME" 
        }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;

    const updated = await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Category name must be unique",
        code: "DUPLICATE_NAME" 
      }, { status: 400 });
    }
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

    // Check if category exists
    const existingCategory = await db.select()
      .from(categories)
      .where(eq(categories.id, parseInt(id)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ 
        error: 'Category not found',
        code: "CATEGORY_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(categories)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Category deleted successfully',
      deletedCategory: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}