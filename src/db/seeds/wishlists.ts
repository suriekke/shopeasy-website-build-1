import { db } from '@/db';
import { wishlists } from '@/db/schema';

async function main() {
    const sampleWishlists = [
        // User 1 - 3 items
        {
            userId: 1,
            productId: 15, // Premium electronics
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            userId: 1,
            productId: 32, // High-value appliance
            createdAt: new Date('2024-01-25').toISOString(),
        },
        {
            userId: 1,
            productId: 48, // Premium product
            createdAt: new Date('2024-02-01').toISOString(),
        },
        
        // User 2 - 2 items
        {
            userId: 2,
            productId: 8, // Special item
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            userId: 2,
            productId: 56, // High-value product
            createdAt: new Date('2024-01-30').toISOString(),
        },
        
        // User 3 - 3 items
        {
            userId: 3,
            productId: 22, // Premium category
            createdAt: new Date('2024-01-22').toISOString(),
        },
        {
            userId: 3,
            productId: 39, // Electronics
            createdAt: new Date('2024-02-05').toISOString(),
        },
        {
            userId: 3,
            productId: 51, // Special occasion item
            createdAt: new Date('2024-02-08').toISOString(),
        },
        
        // User 4 - 2 items
        {
            userId: 4,
            productId: 12, // Higher-value item
            createdAt: new Date('2024-01-28').toISOString(),
        },
        {
            userId: 4,
            productId: 44, // Premium product
            createdAt: new Date('2024-02-03').toISOString(),
        },
        
        // User 5 - 2 items
        {
            userId: 5,
            productId: 27, // Electronics/tech
            createdAt: new Date('2024-01-16').toISOString(),
        },
        {
            userId: 5,
            productId: 58, // High-end product
            createdAt: new Date('2024-02-06').toISOString(),
        },
        
        // User 6 - 2 items
        {
            userId: 6,
            productId: 19, // Premium item
            createdAt: new Date('2024-01-24').toISOString(),
        },
        {
            userId: 6,
            productId: 35, // Special product
            createdAt: new Date('2024-02-02').toISOString(),
        },
        
        // User 7 - 2 items
        {
            userId: 7,
            productId: 6, // Higher-value category
            createdAt: new Date('2024-01-19').toISOString(),
        },
        {
            userId: 7,
            productId: 53, // Premium product
            createdAt: new Date('2024-02-07').toISOString(),
        },
        
        // User 8 - 2 items
        {
            userId: 8,
            productId: 41, // High-end item
            createdAt: new Date('2024-01-26').toISOString(),
        },
        {
            userId: 8,
            productId: 60, // Premium category
            createdAt: new Date('2024-02-04').toISOString(),
        },
    ];

    await db.insert(wishlists).values(sampleWishlists);
    
    console.log('✅ Wishlists seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});