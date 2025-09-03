import { db } from '@/db';
import { orderItems } from '@/db/schema';

async function main() {
    const sampleOrderItems = [
        // Order 1 - 3 items
        {
            orderId: 1,
            productId: 5,
            quantity: 2,
            price: 45.99,
            createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        },
        {
            orderId: 1,
            productId: 23,
            quantity: 1,
            price: 89.99,
            createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        },
        {
            orderId: 1,
            productId: 41,
            quantity: 3,
            price: 25.50,
            createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        },
        
        // Order 2 - 2 items
        {
            orderId: 2,
            productId: 12,
            quantity: 1,
            price: 125.00,
            createdAt: new Date('2024-01-16T14:15:00Z').toISOString(),
        },
        {
            orderId: 2,
            productId: 33,
            quantity: 2,
            price: 65.75,
            createdAt: new Date('2024-01-16T14:15:00Z').toISOString(),
        },
        
        // Order 3 - 4 items
        {
            orderId: 3,
            productId: 7,
            quantity: 1,
            price: 299.99,
            createdAt: new Date('2024-01-17T09:45:00Z').toISOString(),
        },
        {
            orderId: 3,
            productId: 18,
            quantity: 2,
            price: 35.25,
            createdAt: new Date('2024-01-17T09:45:00Z').toISOString(),
        },
        {
            orderId: 3,
            productId: 44,
            quantity: 1,
            price: 78.50,
            createdAt: new Date('2024-01-17T09:45:00Z').toISOString(),
        },
        {
            orderId: 3,
            productId: 56,
            quantity: 3,
            price: 15.99,
            createdAt: new Date('2024-01-17T09:45:00Z').toISOString(),
        },
        
        // Order 4 - 2 items
        {
            orderId: 4,
            productId: 3,
            quantity: 2,
            price: 55.75,
            createdAt: new Date('2024-01-18T16:20:00Z').toISOString(),
        },
        {
            orderId: 4,
            productId: 27,
            quantity: 1,
            price: 145.00,
            createdAt: new Date('2024-01-18T16:20:00Z').toISOString(),
        },
        
        // Order 5 - 3 items
        {
            orderId: 5,
            productId: 14,
            quantity: 1,
            price: 189.99,
            createdAt: new Date('2024-01-19T11:00:00Z').toISOString(),
        },
        {
            orderId: 5,
            productId: 38,
            quantity: 4,
            price: 22.25,
            createdAt: new Date('2024-01-19T11:00:00Z').toISOString(),
        },
        {
            orderId: 5,
            productId: 52,
            quantity: 2,
            price: 95.50,
            createdAt: new Date('2024-01-19T11:00:00Z').toISOString(),
        },
        
        // Order 6 - 2 items
        {
            orderId: 6,
            productId: 9,
            quantity: 1,
            price: 75.25,
            createdAt: new Date('2024-01-20T13:30:00Z').toISOString(),
        },
        {
            orderId: 6,
            productId: 31,
            quantity: 3,
            price: 42.99,
            createdAt: new Date('2024-01-20T13:30:00Z').toISOString(),
        },
        
        // Order 7 - 3 items
        {
            orderId: 7,
            productId: 16,
            quantity: 2,
            price: 125.75,
            createdAt: new Date('2024-01-21T08:45:00Z').toISOString(),
        },
        {
            orderId: 7,
            productId: 29,
            quantity: 1,
            price: 67.50,
            createdAt: new Date('2024-01-21T08:45:00Z').toISOString(),
        },
        {
            orderId: 7,
            productId: 47,
            quantity: 2,
            price: 38.75,
            createdAt: new Date('2024-01-21T08:45:00Z').toISOString(),
        },
        
        // Order 8 - 2 items
        {
            orderId: 8,
            productId: 22,
            quantity: 1,
            price: 199.99,
            createdAt: new Date('2024-01-22T15:10:00Z').toISOString(),
        },
        {
            orderId: 8,
            productId: 35,
            quantity: 4,
            price: 18.50,
            createdAt: new Date('2024-01-22T15:10:00Z').toISOString(),
        },
        
        // Order 9 - 4 items
        {
            orderId: 9,
            productId: 4,
            quantity: 1,
            price: 249.99,
            createdAt: new Date('2024-01-23T12:25:00Z').toISOString(),
        },
        {
            orderId: 9,
            productId: 19,
            quantity: 2,
            price: 85.25,
            createdAt: new Date('2024-01-23T12:25:00Z').toISOString(),
        },
        {
            orderId: 9,
            productId: 42,
            quantity: 1,
            price: 115.75,
            createdAt: new Date('2024-01-23T12:25:00Z').toISOString(),
        },
        {
            orderId: 9,
            productId: 58,
            quantity: 3,
            price: 28.99,
            createdAt: new Date('2024-01-23T12:25:00Z').toISOString(),
        },
        
        // Order 10 - 2 items
        {
            orderId: 10,
            productId: 11,
            quantity: 2,
            price: 72.50,
            createdAt: new Date('2024-01-24T17:40:00Z').toISOString(),
        },
        {
            orderId: 10,
            productId: 26,
            quantity: 1,
            price: 156.25,
            createdAt: new Date('2024-01-24T17:40:00Z').toISOString(),
        },
        
        // Order 11 - 3 items
        {
            orderId: 11,
            productId: 8,
            quantity: 1,
            price: 325.00,
            createdAt: new Date('2024-01-25T10:15:00Z').toISOString(),
        },
        {
            orderId: 11,
            productId: 39,
            quantity: 2,
            price: 48.75,
            createdAt: new Date('2024-01-25T10:15:00Z').toISOString(),
        },
        {
            orderId: 11,
            productId: 54,
            quantity: 4,
            price: 19.99,
            createdAt: new Date('2024-01-25T10:15:00Z').toISOString(),
        },
        
        // Order 12 - 2 items
        {
            orderId: 12,
            productId: 15,
            quantity: 1,
            price: 275.50,
            createdAt: new Date('2024-01-26T14:50:00Z').toISOString(),
        },
        {
            orderId: 12,
            productId: 49,
            quantity: 3,
            price: 32.25,
            createdAt: new Date('2024-01-26T14:50:00Z').toISOString(),
        },
    ];

    await db.insert(orderItems).values(sampleOrderItems);
    
    console.log('✅ Order items seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});