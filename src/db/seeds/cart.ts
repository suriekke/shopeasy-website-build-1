import { db } from '@/db';
import { cart } from '@/db/schema';

async function main() {
    const sampleCartItems = [
        {
            userId: 1,
            productId: 5,
            quantity: 2,
            createdAt: new Date('2024-01-15T10:30:00').toISOString(),
            updatedAt: new Date('2024-01-15T10:30:00').toISOString(),
        },
        {
            userId: 1,
            productId: 23,
            quantity: 1,
            createdAt: new Date('2024-01-15T11:15:00').toISOString(),
            updatedAt: new Date('2024-01-15T11:15:00').toISOString(),
        },
        {
            userId: 1,
            productId: 41,
            quantity: 3,
            createdAt: new Date('2024-01-15T14:20:00').toISOString(),
            updatedAt: new Date('2024-01-15T14:20:00').toISOString(),
        },
        {
            userId: 2,
            productId: 12,
            quantity: 1,
            createdAt: new Date('2024-01-16T09:45:00').toISOString(),
            updatedAt: new Date('2024-01-16T09:45:00').toISOString(),
        },
        {
            userId: 3,
            productId: 7,
            quantity: 2,
            createdAt: new Date('2024-01-16T16:10:00').toISOString(),
            updatedAt: new Date('2024-01-16T16:10:00').toISOString(),
        },
        {
            userId: 3,
            productId: 34,
            quantity: 1,
            createdAt: new Date('2024-01-16T16:25:00').toISOString(),
            updatedAt: new Date('2024-01-16T16:25:00').toISOString(),
        },
        {
            userId: 4,
            productId: 18,
            quantity: 4,
            createdAt: new Date('2024-01-17T13:30:00').toISOString(),
            updatedAt: new Date('2024-01-17T13:30:00').toISOString(),
        },
        {
            userId: 5,
            productId: 2,
            quantity: 1,
            createdAt: new Date('2024-01-17T08:15:00').toISOString(),
            updatedAt: new Date('2024-01-17T08:15:00').toISOString(),
        },
        {
            userId: 5,
            productId: 29,
            quantity: 2,
            createdAt: new Date('2024-01-17T12:40:00').toISOString(),
            updatedAt: new Date('2024-01-17T12:40:00').toISOString(),
        },
        {
            userId: 5,
            productId: 56,
            quantity: 1,
            createdAt: new Date('2024-01-17T15:55:00').toISOString(),
            updatedAt: new Date('2024-01-17T15:55:00').toISOString(),
        },
        {
            userId: 6,
            productId: 15,
            quantity: 3,
            createdAt: new Date('2024-01-18T11:20:00').toISOString(),
            updatedAt: new Date('2024-01-18T11:20:00').toISOString(),
        },
        {
            userId: 6,
            productId: 48,
            quantity: 2,
            createdAt: new Date('2024-01-18T17:10:00').toISOString(),
            updatedAt: new Date('2024-01-18T17:10:00').toISOString(),
        },
        {
            userId: 7,
            productId: 36,
            quantity: 1,
            createdAt: new Date('2024-01-19T14:45:00').toISOString(),
            updatedAt: new Date('2024-01-19T14:45:00').toISOString(),
        },
        {
            userId: 8,
            productId: 9,
            quantity: 5,
            createdAt: new Date('2024-01-19T10:30:00').toISOString(),
            updatedAt: new Date('2024-01-19T10:30:00').toISOString(),
        },
        {
            userId: 8,
            productId: 52,
            quantity: 2,
            createdAt: new Date('2024-01-19T18:20:00').toISOString(),
            updatedAt: new Date('2024-01-19T18:20:00').toISOString(),
        }
    ];

    await db.insert(cart).values(sampleCartItems);
    
    console.log('✅ Cart seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});