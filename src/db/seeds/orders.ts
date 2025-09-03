import { db } from '@/db';
import { orders } from '@/db/schema';

async function main() {
    const sampleOrders = [
        {
            userId: 1,
            totalAmount: 450.50,
            deliveryAddress: '123 MG Road, Bangalore, Karnataka - 560001',
            status: 'delivered',
            createdAt: new Date('2024-11-15T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-11-16T14:20:00Z').toISOString(),
        },
        {
            userId: 2,
            totalAmount: 1250.00,
            deliveryAddress: '45 Connaught Place, New Delhi, Delhi - 110001',
            status: 'delivered',
            createdAt: new Date('2024-11-20T16:45:00Z').toISOString(),
            updatedAt: new Date('2024-11-22T11:30:00Z').toISOString(),
        },
        {
            userId: 3,
            totalAmount: 175.75,
            deliveryAddress: '78 Marine Drive, Mumbai, Maharashtra - 400001',
            status: 'confirmed',
            createdAt: new Date('2024-12-01T09:15:00Z').toISOString(),
            updatedAt: new Date('2024-12-01T09:15:00Z').toISOString(),
        },
        {
            userId: 4,
            totalAmount: 890.25,
            deliveryAddress: '56 Park Street, Kolkata, West Bengal - 700016',
            status: 'delivered',
            createdAt: new Date('2024-12-05T14:20:00Z').toISOString(),
            updatedAt: new Date('2024-12-06T18:45:00Z').toISOString(),
        },
        {
            userId: 5,
            totalAmount: 320.00,
            deliveryAddress: '12 Anna Salai, Chennai, Tamil Nadu - 600002',
            status: 'delivered',
            createdAt: new Date('2024-12-10T11:30:00Z').toISOString(),
            updatedAt: new Date('2024-12-11T15:20:00Z').toISOString(),
        },
        {
            userId: 6,
            totalAmount: 1850.50,
            deliveryAddress: '89 Banjara Hills, Hyderabad, Telangana - 500034',
            status: 'delivered',
            createdAt: new Date('2024-12-15T13:45:00Z').toISOString(),
            updatedAt: new Date('2024-12-17T10:30:00Z').toISOString(),
        },
        {
            userId: 7,
            totalAmount: 275.80,
            deliveryAddress: '34 Civil Lines, Jaipur, Rajasthan - 302006',
            status: 'confirmed',
            createdAt: new Date('2024-12-20T17:20:00Z').toISOString(),
            updatedAt: new Date('2024-12-20T17:20:00Z').toISOString(),
        },
        {
            userId: 8,
            totalAmount: 650.00,
            deliveryAddress: '67 Sector 17, Chandigarh, Punjab - 160017',
            status: 'delivered',
            createdAt: new Date('2024-12-25T12:15:00Z').toISOString(),
            updatedAt: new Date('2024-12-26T16:40:00Z').toISOString(),
        },
        {
            userId: 1,
            totalAmount: 195.25,
            deliveryAddress: '123 MG Road, Bangalore, Karnataka - 560001',
            status: 'delivered',
            createdAt: new Date('2025-01-02T08:30:00Z').toISOString(),
            updatedAt: new Date('2025-01-03T12:45:00Z').toISOString(),
        },
        {
            userId: 3,
            totalAmount: 780.90,
            deliveryAddress: '78 Marine Drive, Mumbai, Maharashtra - 400001',
            status: 'confirmed',
            createdAt: new Date('2025-01-08T15:10:00Z').toISOString(),
            updatedAt: new Date('2025-01-08T15:10:00Z').toISOString(),
        },
        {
            userId: 4,
            totalAmount: 425.60,
            deliveryAddress: '56 Park Street, Kolkata, West Bengal - 700016',
            status: 'pending',
            createdAt: new Date('2025-01-12T10:45:00Z').toISOString(),
            updatedAt: new Date('2025-01-12T10:45:00Z').toISOString(),
        }
    ];

    await db.insert(orders).values(sampleOrders);
    
    console.log('✅ Orders seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});