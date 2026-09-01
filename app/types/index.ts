export interface Product {
  id: string;
  name: string;
  category: 'daun' | 'umbi_buah' | 'bumbu' | 'paket_masak' | 'buah' | 'organik';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  unit: string;
  weightGrams?: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: 'Panen Hari Ini' | 'Organik' | 'Best Seller' | 'Diskon' | 'Promo Spesial';
  origin: string;
  description: string;
  benefits: string[];
  storageTips: string;
  isOrganic?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  cookingTime: string;
  servings: string;
  difficulty: 'Mudah' | 'Sedang' | 'Ahli';
  image: string;
  description: string;
  ingredients: {
    name: string;
    amount: string;
    productMatchId?: string;
  }[];
  steps: string[];
}

export interface CustomerTestimonial {
  id: string;
  name: string;
  city: string;
  comment: string;
  rating: number;
  avatar: string;
  date: string;
  purchasedItem: string;
}

export interface Voucher {
  code: string;
  discountPercent: number;
  minSpend: number;
  description: string;
}
