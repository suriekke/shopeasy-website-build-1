import { db } from '@/db';
import { reviews } from '@/db/schema';

async function main() {
    const sampleReviews = [
        {
            userId: 1,
            productId: 5,
            rating: 5,
            comment: 'Excellent product! The quality is outstanding and delivery was super fast within 8 minutes as promised. Packaging was also very good, no damage at all. Highly recommended!',
            createdAt: new Date('2024-01-16').toISOString(),
            updatedAt: new Date('2024-01-16').toISOString(),
        },
        {
            userId: 2,
            productId: 12,
            rating: 4,
            comment: 'Good product, value for money. Delivery was quick and the item was exactly as described. Only minor issue was the packaging could be better.',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            userId: 3,
            productId: 8,
            rating: 5,
            comment: 'Amazing! Got it delivered in just 6 minutes. Fresh and good quality. Will definitely order again.',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            userId: 4,
            productId: 15,
            rating: 4,
            comment: 'Product is good but took 12 minutes for delivery, slightly more than expected. Quality is satisfactory.',
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            userId: 5,
            productId: 3,
            rating: 5,
            comment: 'Perfect! Exactly what I needed. The delivery person was very polite and the product was well-packaged. ShopEasy never disappoints!',
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            userId: 6,
            productId: 22,
            rating: 3,
            comment: 'Average product. Quality could be better for the price. Delivery was on time though.',
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            userId: 7,
            productId: 7,
            rating: 4,
            comment: 'Good purchase. Fresh items and quick delivery. The app is also very user-friendly.',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            userId: 8,
            productId: 18,
            rating: 5,
            comment: 'Excellent service! Got the product in 7 minutes and it was exactly as shown in the picture. Great job ShopEasy team!',
            createdAt: new Date('2024-02-03').toISOString(),
            updatedAt: new Date('2024-02-03').toISOString(),
        },
        {
            userId: 1,
            productId: 25,
            rating: 4,
            comment: 'Good product quality. Packaging was eco-friendly which I appreciate. Delivery was prompt.',
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: new Date('2024-02-05').toISOString(),
        },
        {
            userId: 2,
            productId: 11,
            rating: 5,
            comment: 'Outstanding! This is my third order and every time the experience gets better. Keep it up!',
            createdAt: new Date('2024-02-08').toISOString(),
            updatedAt: new Date('2024-02-08').toISOString(),
        },
        {
            userId: 3,
            productId: 30,
            rating: 4,
            comment: 'Very satisfied with the purchase. Product arrived in perfect condition and the delivery boy was very helpful.',
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            userId: 4,
            productId: 14,
            rating: 3,
            comment: 'Product is okay, nothing extraordinary. Expected better quality. Delivery was fast though.',
            createdAt: new Date('2024-02-12').toISOString(),
            updatedAt: new Date('2024-02-12').toISOString(),
        },
        {
            userId: 5,
            productId: 6,
            rating: 5,
            comment: 'Best online shopping experience! Super fast delivery and excellent product quality. Highly recommend to everyone.',
            createdAt: new Date('2024-02-15').toISOString(),
            updatedAt: new Date('2024-02-15').toISOString(),
        },
        {
            userId: 6,
            productId: 19,
            rating: 4,
            comment: 'Good value for money. The product quality is decent and delivery was within the promised time.',
            createdAt: new Date('2024-02-18').toISOString(),
            updatedAt: new Date('2024-02-18').toISOString(),
        },
        {
            userId: 7,
            productId: 9,
            rating: 5,
            comment: 'Amazing service! The product was fresh and delivered in just 5 minutes. The packaging was also very neat.',
            createdAt: new Date('2024-02-20').toISOString(),
            updatedAt: new Date('2024-02-20').toISOString(),
        },
        {
            userId: 8,
            productId: 27,
            rating: 4,
            comment: 'Nice product. Good quality and reasonable price. Delivery was quick and professional.',
            createdAt: new Date('2024-02-22').toISOString(),
            updatedAt: new Date('2024-02-22').toISOString(),
        },
        {
            userId: 1,
            productId: 33,
            rating: 3,
            comment: 'Product is average. Could improve on the quality aspect. Delivery was fast as usual.',
            createdAt: new Date('2024-02-25').toISOString(),
            updatedAt: new Date('2024-02-25').toISOString(),
        },
        {
            userId: 2,
            productId: 16,
            rating: 5,
            comment: 'Fantastic! Exactly what I was looking for. Great quality and super fast delivery. Will definitely order more items.',
            createdAt: new Date('2024-02-28').toISOString(),
            updatedAt: new Date('2024-02-28').toISOString(),
        },
        {
            userId: 3,
            productId: 21,
            rating: 4,
            comment: 'Good experience overall. Product matches the description and delivery was timely. Happy with the purchase.',
            createdAt: new Date('2024-03-02').toISOString(),
            updatedAt: new Date('2024-03-02').toISOString(),
        },
        {
            userId: 4,
            productId: 4,
            rating: 5,
            comment: 'Excellent quality and very fresh! The 8-minute delivery is truly impressive. Thank you ShopEasy for such great service.',
            createdAt: new Date('2024-03-05').toISOString(),
            updatedAt: new Date('2024-03-05').toISOString(),
        },
        {
            userId: 5,
            productId: 13,
            rating: 4,
            comment: 'Good product and fast delivery. The packaging was secure and the product was in perfect condition.',
            createdAt: new Date('2024-03-08').toISOString(),
            updatedAt: new Date('2024-03-08').toISOString(),
        },
        {
            userId: 6,
            productId: 28,
            rating: 5,
            comment: 'Perfect shopping experience! Product quality is top-notch and the delivery was lightning fast. Highly satisfied customer!',
            createdAt: new Date('2024-03-10').toISOString(),
            updatedAt: new Date('2024-03-10').toISOString(),
        }
    ];

    await db.insert(reviews).values(sampleReviews);
    
    console.log('✅ Reviews seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});