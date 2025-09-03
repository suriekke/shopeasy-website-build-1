import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

const VALID_STATUSES = ['pending', 'confirmed', 'delivered'];

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
      
      const order = await db.select()
        .from(orders)
        .where(eq(orders.id, parseInt(id)))
        .limit(1);
      
      if (order.length === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      
      return NextResponse.json(order[0]);
    }
    
    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    let query = db.select().from(orders);
    
    const conditions = [];
    
    // Filter by user_id
    if (userId && !isNaN(parseInt(userId))) {
      conditions.push(eq(orders.userId, parseInt(userId)));
    }
    
    // Filter by status
    if (status && VALID_STATUSES.includes(status)) {
      conditions.push(eq(orders.status, status));
    }
    
    // Search in delivery address
    if (search) {
      conditions.push(like(orders.deliveryAddress, `%${search}%`));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    const sortColumn = orders[sort as keyof typeof orders] || orders.createdAt;
    query = query.orderBy(order === 'asc' ? asc(sortColumn) : desc(sortColumn));
    
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
    const { userId, totalAmount, deliveryAddress, status } = requestBody;
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }
    
    if (!totalAmount) {
      return NextResponse.json({ 
        error: "Total amount is required",
        code: "MISSING_TOTAL_AMOUNT" 
      }, { status: 400 });
    }
    
    if (!deliveryAddress) {
      return NextResponse.json({ 
        error: "Delivery address is required",
        code: "MISSING_DELIVERY_ADDRESS" 
      }, { status: 400 });
    }
    
    // Validate user_id is a number
    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "User ID must be a valid number",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }
    
    // Validate total_amount is a number
    if (isNaN(parseFloat(totalAmount))) {
      return NextResponse.json({ 
        error: "Total amount must be a valid number",
        code: "INVALID_TOTAL_AMOUNT" 
      }, { status: 400 });
    }
    
    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ 
        error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }
    
    // Sanitize inputs
    const sanitizedDeliveryAddress = deliveryAddress.trim();
    
    const insertData = {
      userId: parseInt(userId),
      totalAmount: parseFloat(totalAmount),
      deliveryAddress: sanitizedDeliveryAddress,
      status: status || 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const newOrder = await db.insert(orders)
      .values(insertData)
      .returning();
    
    return NextResponse.json(newOrder[0], { status: 201 });
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
    const { totalAmount, deliveryAddress, status } = requestBody;
    
    // Check if record exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);
    
    if (existingOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ 
        error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }
    
    // Validate totalAmount if provided
    if (totalAmount !== undefined && isNaN(parseFloat(totalAmount))) {
      return NextResponse.json({ 
        error: "Total amount must be a valid number",
        code: "INVALID_TOTAL_AMOUNT" 
      }, { status: 400 });
    }
    
    const updates: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (totalAmount !== undefined) {
      updates.totalAmount = parseFloat(totalAmount);
    }
    
    if (deliveryAddress !== undefined) {
      updates.deliveryAddress = deliveryAddress.trim();
    }
    
    if (status !== undefined) {
      updates.status = status;
    }
    
    const updated = await db.update(orders)
      .set(updates)
      .where(eq(orders.id, parseInt(id)))
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
    
    // Check if record exists
    const existingOrder = await db.select()
      .from(orders)
      .where(eq(orders.id, parseInt(id)))
      .limit(1);
    
    if (existingOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    const deleted = await db.delete(orders)
      .where(eq(orders.id, parseInt(id)))
      .returning();
    
    return NextResponse.json({
      message: 'Order deleted successfully',
      deletedOrder: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}