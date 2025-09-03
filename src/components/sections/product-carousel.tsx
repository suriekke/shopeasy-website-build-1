"use client";

import Image from "next/image";
import * as React from "react";

// Type definitions
interface Product {
  id: number;
  imageUrl: string;
  name: string;
  quantity: string;
  price: number;
  originalPrice?: number;
  discount?: string;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
}

// Data for all product carousels
const dairyProducts: Product[] = [
  { id: 1, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/15.png', name: 'Amul Taaza Toned Milk', quantity: '500 ml', price: 29 },
  { id: 2, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/628c97e0-5ed4-425d-a667-1d3bfa6f0bde-16.png', name: 'Amul Gold Full Cream Milk', quantity: '500 ml', price: 35 },
  { id: 3, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/3af56c86-9a93-4d0c-a8d5-cf38493e4120-17.png', name: 'Amul Masti Pouch Curd', quantity: '390 g', price: 35 },
  { id: 4, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/613787ac-f983-4cfb-b534-e219c8d47b39-18.png', name: 'Amul Salted Butter', quantity: '100 g', price: 62 },
  { id: 5, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/2b146201-870b-4bb8-aee7-8ef0377cbe2b-19.png', name: 'Mother Dairy Classic Pouch Curd', quantity: '400 g', price: 35 },
  { id: 6, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/ae29e828-f5d9-4f8b-89b6-8c6d6919df7b-20.png', name: 'Amul Cow Milk', quantity: '500 ml', price: 30 },
  { id: 7, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/9b3e11ab-9a5d-463d-b098-379a04ce5b7e-21.png', name: 'Harvest Gold White Bread', quantity: '350 g', price: 30 },
  { id: 8, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/0f8ebd88-7b67-4542-bda1-87f8182d767d-22.png', name: 'Harvest Gold 100% Atta Whole Wheat Bread', quantity: '450 g', price: 60 },
  { id: 9, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/aea43219-ee8f-4ffc-993d-7cbc19bc348d-23.png', name: 'Amul Taaza Homogenised Toned Milk', quantity: '1 ltr', price: 74, originalPrice: 77 },
  { id: 10, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/71ddb6c0-c8d8-47fb-80d6-e89bce9fd498-24.png', name: 'Mother Dairy Classic Cup Curd', quantity: '400 g', price: 50 },
];
const tobaccoProducts: Product[] = [
    { id: 11, imageUrl: '', name: 'Ultimate Rolling Paper with Filter Tips & Crushing Tray (King Size, Unbleached) - Mozo', quantity: '1 pack (32 pieces)', price: 90 },
    { id: 12, imageUrl: '', name: 'Brown Rolling Paper Cones - Stash Pro', quantity: '6 pieces', price: 90 },
    { id: 13, imageUrl: '', name: 'Perfect Rolled Cones (Natural) - Bongchie', quantity: '3 pack', price: 45 },
    { id: 14, imageUrl: '', name: 'Brown Ripper Rolling Paper 32 Leaves + 32 Roaches Stash Pro', quantity: '1 pack (64 pieces)', price: 120 },
    { id: 15, imageUrl: '', name: 'Super Slim Brown Rolling Paper by Stash Pro', quantity: '1 pack (32 pieces)', price: 55 },
    { id: 16, imageUrl: '', name: 'Colour Roach - Stash Pro', quantity: '32 sheets', price: 50 },
    { id: 17, imageUrl: '', name: 'Perforated Wide Tips Roach - Raw', quantity: '1 pack (50 pieces)', price: 50 },
];
const snacksAndMunchies: Product[] = [
    { id: 18, imageUrl: '', name: 'Lo! Foods Keto Mixture Namkeen - High Protein Healthy Snack', quantity: '100 g', price: 150, originalPrice: 159, discount: '5% OFF' },
    { id: 19, imageUrl: '', name: 'Lo! Foods Gluten Free Millet Ragi Chips Healthy Snacks', quantity: '75 g', price: 99 },
    { id: 20, imageUrl: '', name: 'Moi Soi White Rice Paper', quantity: '100 g', price: 173, originalPrice: 190, discount: '8% OFF' },
    { id: 21, imageUrl: '', name: 'Beanly Choco Hazelnut Spread with Breadsticks', quantity: '52 g', price: 99, originalPrice: 150, discount: '34% OFF' },
    { id: 22, imageUrl: '', name: 'Protein Chef Baked Coated Peanuts (Masala Roasted Healthy Snacks)', quantity: '50 g', price: 69, originalPrice: 75, discount: '8% OFF' },
    { id: 23, imageUrl: '', name: 'Kettle Studio Sharp Jalapenos & Cream Cheese Potato Chips', quantity: '56 g', price: 47, originalPrice: 49 },
    { id: 24, imageUrl: '', name: 'Protein Chef Baked Bikaneri Bhujia Sev (Guilt Free Healthy Snacks Namkeen)', quantity: '80 g', price: 99 },
];
const hookahProducts: Product[] = [
    { id: 25, imageUrl: '', name: 'Chief Commissioner Herbal Hookah Flavor (Tobacco Free) by Soex', quantity: '50 g', price: 100 },
    { id: 26, imageUrl: '', name: 'Coconut Hookah Coal Cubes by Stash Pro', quantity: '18 pieces', price: 140 },
    { id: 27, imageUrl: '', name: 'Double Apple Herbal Hookah Flavor (Tobacco Free) by Soex', quantity: '50 g', price: 100 },
    { id: 28, imageUrl: '', name: 'Premium Magic Coal By Stash Pro', quantity: '1 pack (10 pieces)', price: 80 },
    { id: 29, imageUrl: '', name: 'Brain Freeze Up Herbal Hookah Flavor (Tobacco Free) by Soex', quantity: '50 g', price: 100 },
    { id: 30, imageUrl: '', name: 'Flat Coconut Hookah Coal Cubes by Stash Pro', quantity: '30 pieces', price: 140 },
    { id: 31, imageUrl: '', name: 'Instant Ignite Magic Coal by Bongchie', quantity: '1 pack (10 pieces)', price: 80 },
];
const mouthFresheners: Product[] = [
    { id: 32, imageUrl: '', name: 'Rajnigandha Silver Pearl Silver Coated Elaichi Mouth Freshener', quantity: '6 g', price: 60 },
    { id: 33, imageUrl: '', name: "Wrigley's 5 Peppermint Cobalt Chewing Gum (Sugar Free)", quantity: '1 pack (15 pieces)', price: 279, originalPrice: 299, discount: '6% OFF' },
    { id: 34, imageUrl: '', name: "Wrigley's 5 Spearmint Rain Chewing Gum (Sugar Free)", quantity: '1 pack (15 pieces)', price: 279, originalPrice: 299, discount: '6% OFF' },
    { id: 35, imageUrl: '', name: "Wrigley's Extra Winterfresh Chewing Gum (Sugar Free)", quantity: '1 pack (15 pieces)', price: 279, originalPrice: 299, discount: '6% OFF' },
    { id: 36, imageUrl: '', name: 'Trident Spearmint Gum (Sugar Free)', quantity: '1 pack (14 pieces)', price: 180, originalPrice: 190, discount: '5% OFF' },
    { id: 37, imageUrl: '', name: 'Pass Pass Sweet Magic Mix Mouth Freshener', quantity: '105 g', price: 64, originalPrice: 90, discount: '28% OFF' },
];
const coldDrinks: Product[] = [
    { id: 38, imageUrl: '', name: 'Mother Dairy Probiotic Tadka Salted Buttermilk', quantity: '270 ml', price: 10 },
    { id: 39, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/f53cbbd4-0a1f-4878-9de9-600f9549d725-28.png', name: 'Amul Lactose Free Milk', quantity: '250 ml', price: 26 },
    { id: 40, imageUrl: '', name: 'Ice Cubes by Dras Ice', quantity: '1 kg', price: 75 },
    { id: 41, imageUrl: '', name: 'Coca-Cola Soft Drink (750 ml)', quantity: '750 ml', price: 40 },
    { id: 42, imageUrl: '', name: 'Coca-Cola Diet Coke Soft Drink', quantity: '180 ml', price: 25 },
    { id: 43, imageUrl: '', name: 'Bisleri Packaged Water (1 l)', quantity: '1 ltr', price: 20 },
];
const candiesAndGums: Product[] = [
    { id: 44, imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/669a9b3f-7d5e-434e-bec2-f976bc976916-30.png', name: 'Haribo Supermix Candy', quantity: '140 g', price: 260 },
    { id: 45, imageUrl: '', name: 'Happydent Wave Sugarfree Mint Chewing Gum 18 Pcs', quantity: '28.9 g', price: 48, originalPrice: 50 },
    { id: 46, imageUrl: '', name: 'Orbit Mixed Fruit Flavour Chewing Gum (Sugar Free)', quantity: '22 g', price: 50 },
    { id: 47, imageUrl: '', name: 'Orbit Spearmint Flavour Sugar Free Chewing Gum', quantity: '22 g', price: 50 },
    { id: 48, imageUrl: '', name: "Wrigley's 5 Peppermint Cobalt Chewing Gum (Sugar Free)", quantity: '1 pack (15 pieces)', price: 279, originalPrice: 299, discount: '6% OFF' },
    { id: 49, imageUrl: '', name: "Wrigley's 5 Spearmint Rain Chewing Gum (Sugar Free)", quantity: '1 pack (15 pieces)', price: 279, originalPrice: 299, discount: '6% OFF' },
];

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="relative flex-shrink-0 w-[179px] border border-border rounded-lg p-3 bg-card hover:shadow-md transition-shadow duration-200 flex flex-col">
      {product.discount && (
        <div className="absolute top-0 left-0 bg-destructive text-destructive-foreground text-[9px] font-extrabold py-0.5 px-1.5 rounded-tl-lg rounded-br-lg z-10">
          {product.discount}
        </div>
      )}
      <div className="flex justify-center mb-2 h-[140px] w-full items-center">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} width={140} height={140} className="object-contain h-full w-auto" />
        ) : (
          <div className="w-full h-full bg-accent rounded-md flex items-center justify-center text-center text-xs text-muted-foreground p-2">{product.name}</div>
        )}
      </div>
      <div className="flex-grow flex flex-col">
        <div className="bg-accent rounded-md px-1 py-0.5 inline-flex items-center self-start">
          <Image src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/icons/15-mins-1.png" alt="delivery time" width={14} height={14} className="mr-1"/>
          <span className="text-[10px] font-bold text-foreground tracking-wider">8 MINS</span>
        </div>
        <h3 className="text-[13px] font-semibold text-foreground mt-2 h-[36px] overflow-hidden leading-[18px]">{product.name}</h3>
        <p className="text-[13px] text-muted-foreground mt-1">{product.quantity}</p>
        <div className="flex justify-between items-center mt-auto pt-3">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
          </div>
          <button className="border border-primary text-primary bg-[#F7FFF9] text-[13px] font-semibold py-1.5 px-5 rounded-md shadow-sm hover:bg-green-100 transition-colors uppercase">
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductCarousel = ({ title, products }: ProductCarouselProps) => {
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <a href="#" className="text-sm font-semibold text-primary cursor-pointer hover:text-green-700">see all</a>
      </div>
      <div className="flex overflow-x-auto pb-4 space-x-4 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

const ProductCarouselSection = () => {
  return (
    <div className="space-y-4">
      <ProductCarousel title="Dairy, Bread & Eggs" products={dairyProducts} />
      <ProductCarousel title="Rolling paper & tobacco" products={tobaccoProducts} />
      <ProductCarousel title="Snacks & Munchies" products={snacksAndMunchies} />
      <ProductCarousel title="Hookah" products={hookahProducts} />
      <ProductCarousel title="Mouth fresheners" products={mouthFresheners} />
      <ProductCarousel title="Cold Drinks & Juices" products={coldDrinks} />
      <ProductCarousel title="Candies & Gums" products={candiesAndGums} />
    </div>
  );
};

export default ProductCarouselSection;