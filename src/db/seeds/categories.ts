import { db } from '@/db';
import { categories } from '@/db/schema';

async function main() {
    const sampleCategories = [
        {
            name: 'Dairy Bread & Eggs',
            description: 'Fresh dairy products including milk, yogurt, cheese, and butter. Also includes fresh bread, eggs, and other bakery essentials for your daily needs.',
            imageUrl: '/images/categories/dairy-bread-eggs.jpg',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            name: 'Rolling paper & tobacco',
            description: 'Premium rolling papers, tobacco products, and smoking accessories. Wide variety of brands and sizes to choose from.',
            imageUrl: '/images/categories/rolling-paper-tobacco.jpg',
            createdAt: new Date('2024-01-02').toISOString(),
            updatedAt: new Date('2024-01-02').toISOString(),
        },
        {
            name: 'Snacks & Munchies',
            description: 'Delicious snacks including chips, namkeen, crackers, and munchies. Perfect for your tea time or movie nights with family and friends.',
            imageUrl: '/images/categories/snacks-munchies.jpg',
            createdAt: new Date('2024-01-03').toISOString(),
            updatedAt: new Date('2024-01-03').toISOString(),
        },
        {
            name: 'Hookah',
            description: 'Complete hookah collection including flavored tobacco, coals, and accessories. Premium quality products for the best smoking experience.',
            imageUrl: '/images/categories/hookah.jpg',
            createdAt: new Date('2024-01-04').toISOString(),
            updatedAt: new Date('2024-01-04').toISOString(),
        },
        {
            name: 'Mouth fresheners',
            description: 'Traditional and modern mouth fresheners including paan masala, elaichi, saunf, and flavored mouth sprays. Keep your breath fresh all day long.',
            imageUrl: '/images/categories/mouth-fresheners.jpg',
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
        },
        {
            name: 'Cold Drinks & Juices',
            description: 'Refreshing cold drinks, soft drinks, energy drinks, and fresh fruit juices. Beat the heat with our wide selection of beverages.',
            imageUrl: '/images/categories/cold-drinks-juices.jpg',
            createdAt: new Date('2024-01-06').toISOString(),
            updatedAt: new Date('2024-01-06').toISOString(),
        },
        {
            name: 'Candies & Gums',
            description: 'Sweet candies, chewing gums, toffees, and chocolates. Perfect treats for kids and adults alike with various flavors and brands.',
            imageUrl: '/images/categories/candies-gums.jpg',
            createdAt: new Date('2024-01-07').toISOString(),
            updatedAt: new Date('2024-01-07').toISOString(),
        },
        {
            name: 'Paan Corner',
            description: 'Traditional paan essentials including betel leaves, areca nuts, lime paste, and various paan masalas. Everything you need for authentic paan making.',
            imageUrl: '/images/categories/paan-corner.jpg',
            createdAt: new Date('2024-01-08').toISOString(),
            updatedAt: new Date('2024-01-08').toISOString(),
        },
        {
            name: 'Fruits & Vegetables',
            description: 'Fresh seasonal fruits and vegetables sourced daily from local farms. Get the best quality produce delivered to your doorstep.',
            imageUrl: '/images/categories/fruits-vegetables.jpg',
            createdAt: new Date('2024-01-09').toISOString(),
            updatedAt: new Date('2024-01-09').toISOString(),
        },
        {
            name: 'Breakfast & Instant Food',
            description: 'Quick breakfast options and instant food items including cereals, oats, instant noodles, and ready-to-eat meals. Perfect for busy mornings.',
            imageUrl: '/images/categories/breakfast-instant-food.jpg',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            name: 'Sweet Tooth',
            description: 'Traditional Indian sweets, mithai, desserts, and sweet treats. Satisfy your sweet cravings with our premium collection of sweets.',
            imageUrl: '/images/categories/sweet-tooth.jpg',
            createdAt: new Date('2024-01-11').toISOString(),
            updatedAt: new Date('2024-01-11').toISOString(),
        },
        {
            name: 'Bakery & Biscuits',
            description: 'Fresh bakery items, variety of biscuits, cookies, rusks, and cakes. Freshly baked goods and packaged biscuits from trusted brands.',
            imageUrl: '/images/categories/bakery-biscuits.jpg',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            name: 'Tea Coffee & Health Drink',
            description: 'Premium tea, coffee, health drinks, and hot beverages. Choose from green tea, black tea, instant coffee, and nutritious health drink mixes.',
            imageUrl: '/images/categories/tea-coffee-health-drink.jpg',
            createdAt: new Date('2024-01-13').toISOString(),
            updatedAt: new Date('2024-01-13').toISOString(),
        },
        {
            name: 'Atta Rice & Dal',
            description: 'Essential kitchen staples including wheat flour, various types of rice, lentils, and pulses. High-quality grains for your daily cooking needs.',
            imageUrl: '/images/categories/atta-rice-dal.jpg',
            createdAt: new Date('2024-01-14').toISOString(),
            updatedAt: new Date('2024-01-14').toISOString(),
        }
    ];

    await db.insert(categories).values(sampleCategories);
    
    console.log('✅ Categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});