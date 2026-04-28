export type Product = {
  id: string;
  name: string;
  price: number;
  colors: string[];
  sizes: string[];
  emoji: string;
  colorHex: Record<string, string>;
  rating?: number;
  ratingCount?: number;
  originalPrice?: number;
  prime?: boolean;
  badge?: string;
  boughtRecently?: string;
  brand?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "hoodie",
    name: "Classic Hoodie",
    price: 49.99,
    colors: ["Blue", "Grey", "Black"],
    sizes: ["S", "M", "L", "XL"],
    emoji: "🧥",
    colorHex: { Blue: "#3B82F6", Grey: "#9CA3AF", Black: "#1F2937" },
    brand: "UrbanBlend",
    rating: 4.3,
    ratingCount: 1847,
    originalPrice: 79.99,
    prime: true,
    boughtRecently: "200+",
  },
  {
    id: "sneakers",
    name: "Runner Sneakers",
    price: 89.99,
    colors: ["White", "Black"],
    sizes: ["8", "9", "10", "11"],
    emoji: "👟",
    colorHex: { White: "#F9FAFB", Black: "#1F2937" },
    brand: "StridePro",
    rating: 4.1,
    ratingCount: 923,
    originalPrice: 129.99,
    prime: true,
    boughtRecently: "100+",
    badge: "Limited time deal",
  },
  {
    id: "backpack",
    name: "Canvas Backpack",
    price: 59.99,
    colors: ["Tan", "Black"],
    sizes: ["One Size"],
    emoji: "🎒",
    colorHex: { Tan: "#D4A96A", Black: "#1F2937" },
    brand: "TrailCraft",
    rating: 4.5,
    ratingCount: 2341,
    originalPrice: 89.99,
    prime: true,
    boughtRecently: "500+",
  },
  {
    id: "sweatpants",
    name: "Slim Sweatpants",
    price: 39.99,
    colors: ["Grey", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    emoji: "👖",
    colorHex: { Grey: "#9CA3AF", Navy: "#1E3A5F" },
    brand: "ComfortFit",
    rating: 4.2,
    ratingCount: 654,
    originalPrice: 64.99,
    prime: false,
    boughtRecently: "75+",
    badge: "Limited time deal",
  },
];

export const PRODUCT_NAMES = PRODUCTS.map((p) => p.name) as [string, ...string[]];

export function findProduct(nameOrId: string): Product | undefined {
  const lower = nameOrId.toLowerCase();
  return PRODUCTS.find(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.id.toLowerCase().includes(lower)
  );
}
