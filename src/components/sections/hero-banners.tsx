import React from 'react';
import Image from 'next/image';

const mainBanner = {
  imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/Group-33704-1.jpg",
  title: "Paan corner",
  subtitle: "Your favourite paan shop is now online",
  buttonText: "Shop Now",
  alt: "paan corner banner",
};

const promoCards = [
  {
    title: "Pharmacy at your doorstep!",
    subtitle: "Cough syrups, pain relief sprays & more",
    buttonText: "Order Now",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/pharmacy-WEB-2.jpg",
    alt: "masthead_web_pharma",
    textColor: "text-white",
    buttonClasses: "bg-white text-black hover:bg-gray-100",
  },
  {
    title: "Pet Care supplies in minutes",
    subtitle: "Food, treats, toys & more",
    buttonText: "Order Now",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/Pet-Care_WEB-3.jpg",
    alt: "masthead_web_pet_care",
    textColor: "text-black",
    buttonClasses: "bg-black text-white hover:bg-gray-800",
  },
  {
    title: "No time for a diaper run?",
    subtitle: "Get baby care essentials in minutes",
    buttonText: "Order Now",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/d032e5ca-78d8-481f-a4aa-2361a2b798e6-blinkit-com/assets/images/babycare-WEB-4.jpg",
    alt: "masthead_web_baby_care",
    textColor: "text-black",
    buttonClasses: "bg-black text-white hover:bg-gray-800",
  },
];

const HeroBanners = () => {
  return (
    <section className="my-6">
      {/* Main Hero Banner */}
      <div className="relative w-full cursor-pointer rounded-2xl overflow-hidden aspect-[1279/235]">
        <Image
          src={mainBanner.imageUrl}
          alt={mainBanner.alt}
          fill
          priority
          className="object-cover object-center z-0"
        />
        <div className="absolute inset-0 z-10 flex flex-col justify-center p-6 md:p-12">
          <div className="max-w-md">
            <h1 className="text-white text-4xl md:text-5xl font-extrabold">
              {mainBanner.title}
            </h1>
            <p className="text-white text-xl md:text-2xl mt-2">
              {mainBanner.subtitle}
            </p>
            <button className="mt-8 px-6 py-2.5 bg-white text-primary text-sm font-bold rounded-lg shadow-md hover:bg-gray-100 transition-colors">
              {mainBanner.buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* Promotional Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoCards.map((card, index) => (
          <div key={index} className="relative w-full rounded-2xl overflow-hidden cursor-pointer aspect-[335/195]">
            <Image
              src={card.imageUrl}
              alt={card.alt}
              fill
              className="object-cover object-center z-0"
            />
            <div className={`relative z-10 flex h-full flex-col justify-between p-5 ${card.textColor}`}>
              <div className="max-w-[220px]">
                <h2 className="text-2xl font-bold leading-tight">
                  {card.title}
                </h2>
                <p className="text-base mt-2">
                  {card.subtitle}
                </p>
              </div>
              <button className={`w-fit px-5 py-2 text-sm font-semibold rounded-lg shadow-md transition-colors ${card.buttonClasses}`}>
                {card.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroBanners;