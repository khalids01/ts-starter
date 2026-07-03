export type BrandConfig = {
  slug: string;
  name: string;
  description: string;
  textLogo: string;
  logoUrl?: string;
  iconUrl?: string;
  contact: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    supportUrl?: string;
  };
  location: {
    address?: string;
    city?: string;
    country?: string;
  };
  socials: {
    facebook?: string;
    instagram?: string;
    x?: string;
    youtube?: string;
    tiktok?: string;
  };
  commerce: {
    defaultCurrency: string;
    defaultLocale: string;
    supportedLocales: string[];
  };
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
};

export const brandConfig = {
  slug: "ecommerce-starter",
  name: "Ecommerce Starter",
  description: "A flexible ecommerce starter for dynamic product catalogs.",
  textLogo: "Ecommerce",
  contact: {
    email: "support@example.com",
    phone: "+880123456789",
    whatsapp: "+880123456789",
    supportUrl: "https://example.com/support",
  },
  location: {
    city: "Dhaka",
    country: "Bangladesh",
  },
  socials: {},
  commerce: {
    defaultCurrency: "BDT",
    defaultLocale: "en",
    supportedLocales: ["en"],
  },
  seo: {
    title: "Ecommerce Starter",
    description: "A flexible ecommerce starter for dynamic product catalogs.",
    ogImage: "/og-image.jpg",
  },
} satisfies BrandConfig;
