export type BrandKey = "foodshop" | "bestsky" | "airshop";
export type BrandConfig = {
  key: BrandKey;
  slug: string;
  name: string;
  description: string;
  textLogo: string;
  niche: "food" | "electronics" | "fashion";
  publicOrigin?: string;
  policies?: Partial<Record<"terms" | "privacy" | "returns", { title: string; effectiveDate: string; sections: { heading: string; paragraphs: string[] }[] }>>;
  logoUrl?: string;
  iconUrl: string;
  contact: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    supportUrl?: string;
  };
  location: { address?: string; city?: string; country?: string };
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
  seo: { title: string; description: string; ogImage: string };
  homepage: {
    eyebrow: string;
    headline: string;
    highlightedLine: string;
    description: string;
    heroImage: string;
    collectionTitle: string;
    collectionDescription: string;
    bannerTitle: string;
    bannerDescription: string;
  };
  seed: {
    datasetKey: BrandKey;
    dataPath: string;
    productImages: readonly [string, string, string];
  };
};

const common = {
  contact: {},
  location: { country: "Bangladesh" },
  socials: {},
  commerce: {
    defaultCurrency: "BDT",
    defaultLocale: "en",
    supportedLocales: ["en"],
  },
};

export const brands: Record<BrandKey, BrandConfig> = {
  foodshop: {
    ...common,
    key: "foodshop",
    slug: "foodshop",
    name: "FoodShop BD",
    textLogo: "FoodShop BD",
    niche: "food",
    description: "Fruit, pantry favourites and everyday goodness.",
    iconUrl: "/brands/foodshop/icon.svg",
    seo: {
      title: "FoodShop BD — Fruit & Pantry Favourites",
      description:
        "Explore fruit, seasonal mangoes and pantry favourites at FoodShop BD.",
      ogImage: "/brands/foodshop/hero.webp",
    },
    homepage: {
      eyebrow: "GOODNESS FOR YOUR EVERYDAY",
      headline: "Good food.",
      highlightedLine: "Simple pleasures",
      description:
        "From seasonal mangoes to pantry favourites. Bring a little everyday goodness to your table.",
      heroImage: "/brands/foodshop/hero.webp",
      collectionTitle: "Something delicious awaits.",
      collectionDescription:
        "Discover fruit and pantry favourites for your next basket.",
      bannerTitle: "Your table. A little more goodness.",
      bannerDescription:
        "Explore seasonal flavours and everyday favourites, all in one place.",
    },
    seed: {
      datasetKey: "foodshop",
      dataPath: "packages/db/prisma/seed/data/brands/foodshop",
      productImages: [
        "/brands/foodshop/products/mangoes.webp",
        "/brands/foodshop/products/honey.webp",
        "/brands/foodshop/products/dates.webp",
      ],
    },
  },
  bestsky: {
    ...common,
    key: "bestsky",
    slug: "bestsky",
    name: "BestSky BD",
    textLogo: "BestSky BD",
    niche: "electronics",
    publicOrigin: "https://bestskybd.com",
    description: "Discover gadgets that fit your everyday life.",
    iconUrl: "/brands/bestsky/icon.svg",
    seo: {
      title: "BestSky BD — Electronics & Gadgets",
      description:
        "Explore electronics, audio and everyday gadgets at BestSky BD.",
      ogImage: "/brands/bestsky/hero.webp",
    },
    homepage: {
      eyebrow: "MAKE MORE OF YOUR EVERYDAY",
      headline: "Smart finds.",
      highlightedLine: "Better everyday",
      description:
        "For your playlist, your workspace and everything in between. Discover gadgets that fit the way you live.",
      heroImage: "/brands/bestsky/hero.webp",
      collectionTitle: "Find your next upgrade.",
      collectionDescription:
        "Explore everyday tech and find the right fit for you.",
      bannerTitle: "Your world. A little more connected.",
      bannerDescription:
        "From personal audio to everyday accessories. Find something that works for you.",
    },
    seed: {
      datasetKey: "bestsky",
      dataPath: "packages/db/prisma/seed/data/brands/bestsky",
      productImages: [
        "/brands/bestsky/products/headphones.webp",
        "/brands/bestsky/products/smartwatch.webp",
        "/brands/bestsky/products/earbuds.webp",
      ],
    },
  },
  airshop: {
    ...common,
    key: "airshop",
    slug: "airshop",
    name: "AirShop BD",
    textLogo: "AirShop BD",
    niche: "fashion",
    publicOrigin: "https://airshopbd.com",
    description: "Everyday clothing and footwear, styled your way.",
    iconUrl: "/brands/airshop/icon.svg",
    seo: {
      title: "AirShop BD — Clothing & Footwear",
      description: "Explore everyday clothing and footwear at AirShop BD.",
      ogImage: "/ecommerce/images/shopping-editorial.webp",
    },
    homepage: {
      eyebrow: "YOUR EVERYDAY, REIMAGINED",
      headline: "Good finds.",
      highlightedLine: "Great everyday",
      description:
        "From everyday outfits to your next favourite pair. Find clothing and footwear that feel like you.",
      heroImage: "/ecommerce/images/shopping-editorial.webp",
      collectionTitle: "Find your next favourite.",
      collectionDescription:
        "A little inspiration for your wardrobe. Explore what’s in store.",
      bannerTitle: "Your everyday. A little more you.",
      bannerDescription:
        "The pieces you need. The discoveries you’ll love. Make your everyday your own.",
    },
    seed: {
      datasetKey: "airshop",
      dataPath: "packages/db/prisma/seed/data/brands/airshop",
      productImages: [
        "/brands/airshop/products/t-shirt.webp",
        "/brands/airshop/products/sneakers.webp",
        "/brands/airshop/products/hoodie.webp",
      ],
    },
  },
};

export function resolveBrandKey(value: string | undefined): BrandKey {
  const key = value?.trim();
  if (!key || !Object.hasOwn(brands, key))
    throw new Error("BRAND must be one of: foodshop, bestsky, airshop");
  return key as BrandKey;
}
export function resolveBrand(value: string | undefined): BrandConfig {
  return brands[resolveBrandKey(value)];
}
export function assertBuildBrand(built: unknown, runtime: string | undefined) {
  const selected = resolveBrandKey(runtime);
  if (built !== selected)
    throw new Error(
      `Web build BRAND (${String(built)}) differs from runtime BRAND (${selected}); rebuild with BRAND=${selected}`,
    );
  return selected;
}
