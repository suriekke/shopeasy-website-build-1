import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            name: 'Rajesh Kumar Sharma',
            email: 'rajesh.sharma@gmail.com',
            phone: '+91 9876543210',
            address: 'Flat 302, Sunrise Apartments, Linking Road, Bandra West',
            city: 'Mumbai',
            pincode: '400050',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            name: 'Priya Gupta',
            email: 'priya.gupta@yahoo.com',
            phone: '9123456789',
            address: 'House No. 45, Sector 15, Rohini',
            city: 'Delhi',
            pincode: '110085',
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            name: 'Arjun Reddy Naidu',
            email: 'arjun.reddy@hotmail.com',
            phone: '+91 8765432109',
            address: 'Plot 12, Jayabheri Enclave, Gachibowli',
            city: 'Hyderabad',
            pincode: '500032',
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'Sneha Iyer',
            email: 'sneha.iyer@gmail.com',
            phone: '9987654321',
            address: '15/A, Ashok Nagar, 2nd Cross Street',
            city: 'Chennai',
            pincode: '600083',
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            name: 'Vikram Singh Chauhan',
            email: 'vikram.chauhan@rediffmail.com',
            phone: '+91 9654321087',
            address: 'B-204, Silver Oak Society, Hinjewadi Phase 2',
            city: 'Pune',
            pincode: '411057',
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            name: 'Meera Patel',
            email: 'meera.patel@outlook.com',
            phone: '8876543210',
            address: '7th Floor, Kohinoor Tower, Koramangala 5th Block',
            city: 'Bangalore',
            pincode: '560095',
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
        {
            name: 'Amit Agarwal',
            email: 'amit.agarwal@gmail.com',
            phone: '+91 9543210876',
            address: 'Flat 1201, Lodha Supremus, Lower Parel',
            city: 'Mumbai',
            pincode: '400013',
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            name: 'Kavya Krishnan',
            email: 'kavya.krishnan@yahoo.in',
            phone: '9432108765',
            address: 'Villa 23, Prestige Ozone, Whitefield',
            city: 'Bangalore',
            pincode: '560066',
            createdAt: new Date('2024-02-03').toISOString(),
            updatedAt: new Date('2024-02-03').toISOString(),
        },
        {
            name: 'Rohit Malhotra',
            email: 'rohit.malhotra@gmail.com',
            phone: '+91 9321087654',
            address: 'C-45, Greater Kailash Part 1',
            city: 'Delhi',
            pincode: '110048',
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: new Date('2024-02-05').toISOString(),
        },
        {
            name: 'Ananya Nair',
            email: 'ananya.nair@hotmail.com',
            phone: '9210876543',
            address: 'Apartment 6B, Phoenix Towers, Anna Nagar',
            city: 'Chennai',
            pincode: '600040',
            createdAt: new Date('2024-02-08').toISOString(),
            updatedAt: new Date('2024-02-08').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});