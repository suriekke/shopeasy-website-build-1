import Image from 'next/image';
import Link from 'next/link';

const categories = [
  {
    name: "Paan Corner",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/paan-corner_web-5.png",
    href: "#",
  },
  {
    name: "Dairy Bread & Eggs",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/Slice-2_10-6.png",
    href: "#",
  },
  {
    name: "Fruits & Vegetables",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/Slice-3_9-7.png",
    href: "#",
  },
  {
    name: "Cold Drinks & Juices",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/Slice-4_9-8.png",
    href: "#",
  },
  {
    name: "Snacks & Munchies",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/Slice-5_4-9.png",
    href: "#",
  },
  {
    name: "Breakfast & Instant Food",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/Slice-6_5-10.png",
    href: "#",
  },
  {
    name: "Sweet Tooth",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/Slice-7_3-11.png",
    href: "#",
  },
  {
    name: "Bakery & Biscuits",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/Slice-8_4-12.png",
    href: "#",
  },
  {
    name: "Tea Coffee & Health Drink",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/Slice-9_3-13.png",
    href: "#",
  },
  {
    name: "Atta Rice & Dal",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/Slice-10-14.png",
    href: "#",
  },
];

const CategoryGrid = () => {
  return (
    <section className="bg-white">
      <div className="max-w-[1200px] mx-auto px-5 py-10">
        <div className="grid grid-cols-4 gap-y-6 gap-x-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 lg:gap-x-4">
          {categories.map((category) => (
            <Link href={category.href} key={category.name} className="block group">
              <Image
                src={category.image}
                alt={category.name}
                width={128}
                height={188}
                className="w-full h-auto object-contain transition-transform duration-200 ease-in-out group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;