import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orderItems, orders, products } from '@/db/schema';
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
        .from(orderItems)
        .where(eq(orderItems.id, parseInt(id)))
        .limit(1);
      
      if (record.length === 0) {
        return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
      }
      
      return NextResponse.json(record[0]);
    }
    
    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const orderId = searchParams.get('order_id');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    let query = db.select().from(orderItems);
    
    // Filter by order_id if provided
    if (orderId) {
      if (isNaN(parseInt(orderId))) {
        return NextResponse.json({ 
          error: "Valid order_id is required",
          code: "INVALID_ORDER_ID" 
        }, { status: 400 });
      }
      query = query.where(eq(orderItems.orderId, parseInt(orderId)));
    }
    
    // Apply sorting
    const orderBy = order === 'asc' ? asc : desc;
    if (sort === 'createdAt') {
      query = query.orderBy(orderBy(orderItems.createdAt));
    } else if (sort === 'quantity') {
      query = query.orderBy(orderBy(orderItems.quantity));
    } else if (sort === 'price') {
      query = query.orderBy(orderBy(orderItems.price));
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
    const { orderId, productId, quantity, price } = requestBody;
    
    // Validate required fields
    if (!orderId) {
      return NextResponse.json({ 
        error: "Order ID is required",
        code: "MISSING_ORDER_ID" 
      }, { status: 400 });
    }
    
    if (!productId) {
      return NextResponse.json({ 
        error: "Product ID is required",
        code: "MISSING_PRODUCT_ID" 
      }, { status: 400 });
    }
    
    if (!quantity) {
      return NextResponse.json({ 
        error: "Quantity is required",
        code: "MISSING_QUANTITY" 
      }, { status: 400 });
    }
    
    if (price === undefined || price === null) {
      return NextResponse.json({ 
        error: "Price is required",
        code: "MISSING_PRICE" 
      }, { status: 400 });
    }
    
    // Validate numeric fields
    if (isNaN(parseInt(orderId))) {
      return NextResponse.json({ 
        error: "Valid order ID is required",
        code: "INVALID_ORDER_ID" 
      }, { status: 400 });
    }
    
    if (isNaN(parseInt(productId))) {
      return NextResponse.json({ 
        error: "Valid product ID is required",
        code: "INVALID_PRODUCT_ID" 
      }, { status: 400 });
    }
    
    if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      return NextResponse.json({ 
        error: "Valid quantity greater than 0 is required",
        code: "INVALID_QUANTITY" 
      }, { status: 400 });
    }
    
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return NextResponse.json({ 
        error: "Valid price greater than 0 is required",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }
    
    // Validate foreign keys exist
    const orderExists = await db.select().from(orders).where(eq(orders.id, parseInt(orderId))).limit(1);
    if (orderExists.length === 0) {
      return NextResponse.json({ 
        error: "Order not found",
        code: "ORDER_NOT_FOUND" 
      }, { status: 400 });
    }
    
    const productExists = await db.select().from(products).where(eq(products.id, parseInt(productId))).limit(1);
    if (productExists.length === 0) {
      return NextResponse.json({ 
        error: "Product not found",
        code: "PRODUCT_NOT_FOUND" 
      }, { status: 400 });
    }
    
    const insertData = {
      orderId: parseInt(orderId),
      productId: parseInt(productId),
      quantity: parseInt(quantity),
      price: parseFloat(price),
      createdAt: new Date().toISOString()
    };
    
    const newRecord = await db.insert(orderItems)
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
    const { orderId, productId, quantity, price } = requestBody;
    
    // Check record exists
    const existing = await db.select()
      .from(orderItems)
      .where(eq(orderItems.id, parseInt(id)))
      .limit(1);
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }
    
    // Prepare updates object
    const updates: any = {};
    
    // Validate and add fields if provided
    if (orderId !== undefined) {
      if (isNaN(parseInt(orderId))) {
        return NextResponse.json({ 
          error: "Valid order ID is required",
          code: "INVALID_ORDER_ID" 
        }, { status: 400 });
      }
      
      // Validate foreign key exists
      const orderExists = await db.select().from(orders).where(eq(orders.id, parseInt(orderId))).limit(1);
      if (orderExists.length === 0) {
        return NextResponse.json({ 
          error: "Order not found",
          code: "ORDER_NOT_FOUND" 
        }, { status: 400 });
      }
      
      updates.orderId = parseInt(orderId);
    }
    
    if (productId !== undefined) {
      if (isNaN(parseInt(productId))) {
        return NextResponse.json({ 
          error: "Valid product ID is required",
          code: "INVALID_PRODUCT_ID" 
        }, { status: 400 });
      }
      
      // Validate foreign key exists
      const productExists = await db.select().from(products).where(eq(products.id, parseInt(productId))).limit(1);
      if (productExists.length === 0) {
        return NextResponse.json({ 
          error: "Product not found",
          code: "PRODUCT_NOT_FOUND" 
        }, { status: 400 });
      }
      
      updates.productId = parseInt(productId);
    }
    
    if (quantity !== undefined) {
      if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
        return NextResponse.json({ 
          error: "Valid quantity greater than 0 is required",
          code: "INVALID_QUANTITY" 
        }, { status: 400 });
      }
      updates.quantity = parseInt(quantity);
    }
    
    if (price !== undefined) {
      if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        return NextResponse.json({ 
          error: "Valid price greater than 0 is required",
          code: "INVALID_PRICE" 
        }, { status: 400 });
      }
      updates.price = parseFloat(price);
    }
    
    const updated = await db.update(orderItems)
      .set(updates)
      .where(eq(orderItems.id, parseInt(id)))
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
    const existing = await db.select()
      .from(orderItems)
      .where(eq(orderItems.id, parseInt(id)))
      .limit(1);
    
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }
    
    const deleted = await db.delete(orderItems)
      .where(eq(orderItems.id, parseInt(id)))
      .returning();
    
    return NextResponse.json({ 
      message: 'Order item deleted successfully',
      deletedRecord: deleted[0] 
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}