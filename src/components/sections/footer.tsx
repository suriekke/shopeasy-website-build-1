"use client";
import {
  ChevronDown,
  Search,
  ShoppingCart,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  AtSign,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const linkData = {
  column1: {
    title: "Useful Links",
    links: ["Terms", "FAQs", "Security", "Contact"],
  },
  categories: [
    {
      title: "Categories",
      links: [
        {
          heading: "Instant & Frozen Food",
          sublinks: ["Instant Food", "Frozen Veggies & Snacks"],
        },
        { heading: "Sweet Tooth", sublinks: ["Chocolates", "Ice Cream"] },
        { heading: "Sauces & Spreads", sublinks: [] },
        { heading: "Organic & Premium", sublinks: [] },
        { heading: "Cleaning Essentials", sublinks: [] },
      ],
    },
    {
      title: "",
      links: [
        {
          heading: "Tea, Coffee & Health Drinks",
          sublinks: ["Health Drinks", "Tea & Coffee"],
        },
        {
          heading: "Atta, Rice & Dal",
          sublinks: ["Atta & Flours", "Rice & Rice Products", "Dal & Pulses"],
        },
        { heading: "Chicken, Meat & Fish", sublinks: [] },
        { heading: "Baby Care", sublinks: [] },
        { heading: "Home & Office", sublinks: [] },
      ],
    },
    {
      title: "",
      links: [
        { heading: "Pet Care", sublinks: [] },
        { heading: "Kitchen & Dining", sublinks: [] },
        { heading: "Fashion & Accessories", sublinks: [] },
        { heading: "Electronics & Electricals", sublinks: [] },
        { heading: "Toys & Games", sublinks: [] },
      ],
    },
    {
      title: "",
      links: [
        { heading: "Rakhi Gifts", sublinks: [] },
        { heading: "Stationery Needs", sublinks: [] },
        { heading: "Print Store", sublinks: [] },
        { heading: "E-Gift Cards", sublinks: [] },
        { heading: "Books", sublinks: [] },
      ],
    },
  ],
};

const SocialIcon = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white"
  >
    {children}
  </a>
);

export default function Footer() {
  return (
    <footer className="bg-accent text-foreground pt-6">
      <div className="max-w-[1240px] mx-auto px-5">
        <div className="border-b border-border pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="col-span-1">
              <h3 className="font-semibold text-sm text-[#1a1a1a] mb-6">
                {linkData.column1.title}
              </h3>
              <ul>
                {linkData.column1.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground leading-9">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-1 lg:col-span-3">
              <h3 className="font-semibold text-sm text-[#1a1a1a] mb-6">
                Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8">
                {linkData.categories.map((col, colIndex) => (
                  <div key={colIndex}>
                    {col.links.map((group, groupIndex) => (
                      <div key={groupIndex} className="mb-6">
                        <a href="#" className="text-sm text-muted-foreground leading-9 font-normal block">
                          {group.heading}
                        </a>
                        {group.sublinks.length > 0 && (
                          <ul className="pl-4">
                            {group.sublinks.map((sublink, sublinkIndex) => (
                              <li key={sublinkIndex}>
                                <a
                                  href="#"
                                  className="text-sm text-muted-foreground/80 leading-8"
                                >
                                  {sublink}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between py-8">
          <p className="text-sm text-muted-foreground mb-6 md:mb-0 order-2 md:order-1">
            © Blink Commerce Private Limited, 2016-2025
          </p>
          <div className="flex items-center gap-4 mb-6 md:mb-0 order-1 md:order-2">
            <span className="font-semibold text-base">Download App</span>
            <a href="#">
              <Image
                src="https://blinkit.com/d6d03f70a05f03461023.png"
                alt="App Store"
                width={120}
                height={40}
              />
            </a>
            <a href="#">
              <Image
                src="https://blinkit.com/e7bc63a435ab3def9202.png"
                alt="Google Play"
                width={120}
                height={40}
              />
            </a>
          </div>
          <div className="flex items-center gap-2 order-3">
            <SocialIcon href="#">
              <Facebook size={16} />
            </SocialIcon>
            <SocialIcon href="#">
              <Twitter size={16} />
            </SocialIcon>
            <SocialIcon href="#">
              <Instagram size={16} />
            </SocialIcon>
            <SocialIcon href="#">
              <Linkedin size={16} />
            </SocialIcon>
            <SocialIcon href="#">
              <AtSign size={16} />
            </SocialIcon>
          </div>
        </div>
      </div>
      <div className="bg-white py-6">
        <div className="max-w-[1240px] mx-auto px-5">
          <p className="text-xs text-muted-foreground leading-relaxed text-center">
            “Blinkit” is owned & managed by "Blink Commerce Private Limited" and
            is not related, linked or interconnected in whatsoever manner or
            nature, to “GROFFR.COM” which is a real estate services business
            operated by “Redstone Consultancy Services Private Limited”.
          </p>
        </div>
      </div>
    </footer>
  );
}