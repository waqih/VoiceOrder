import { MenuCategory, MenuItem } from "./types";

export const menuItems: MenuItem[] = [
  // ── Biryani ──
  { id: "M-001", name: "Chicken Biryani", nameUrdu: "چکن بریانی", category: MenuCategory.Biryani, price: 350, description: "Aromatic basmati rice with tender chicken, signature spice blend", available: true, popular: true },
  { id: "M-002", name: "Mutton Biryani", nameUrdu: "مٹن بریانی", category: MenuCategory.Biryani, price: 550, description: "Slow-cooked mutton layered with fragrant rice", available: true, popular: true },
  { id: "M-003", name: "Beef Biryani", nameUrdu: "بیف بریانی", category: MenuCategory.Biryani, price: 450, description: "Tender beef pieces with saffron-infused rice", available: true },
  { id: "M-004", name: "Sindhi Biryani", nameUrdu: "سندھی بریانی", category: MenuCategory.Biryani, price: 400, description: "Spicy Sindhi-style with potatoes and plums", available: true },
  { id: "M-005", name: "Daal Chawal", nameUrdu: "دال چاول", category: MenuCategory.Biryani, price: 200, description: "Comfort food — seasoned lentils with steamed rice", available: true },

  // ── BBQ & Karahi ──
  { id: "M-006", name: "Chicken Karahi (Full)", nameUrdu: "چکن کڑاہی", category: MenuCategory.BBQKarahi, price: 1800, description: "Wok-style chicken in tomato-ginger gravy", available: true, popular: true },
  { id: "M-007", name: "Chicken Karahi (Half)", category: MenuCategory.BBQKarahi, price: 1000, description: "Half portion of our signature Karahi", available: true },
  { id: "M-008", name: "Mutton Karahi (Full)", nameUrdu: "مٹن کڑاہی", category: MenuCategory.BBQKarahi, price: 2200, description: "Premium mutton Karahi with fresh spices", available: true },
  { id: "M-009", name: "Mutton Karahi (Half)", category: MenuCategory.BBQKarahi, price: 1200, description: "Half portion mutton Karahi", available: true },
  { id: "M-010", name: "Seekh Kebab", nameUrdu: "سیخ کباب", category: MenuCategory.BBQKarahi, price: 280, description: "6 pieces of charcoal-grilled minced meat skewers", available: true },
  { id: "M-011", name: "Chicken Tikka", nameUrdu: "چکن ٹکا", category: MenuCategory.BBQKarahi, price: 320, description: "Marinated boneless chicken grilled to perfection", available: true, popular: true },
  { id: "M-012", name: "Chapli Kebab", nameUrdu: "چپلی کباب", category: MenuCategory.BBQKarahi, price: 250, description: "Peshawari-style flat kebabs with tomatoes and spices", available: false },

  // ── Naan & Roti ──
  { id: "M-013", name: "Plain Naan", nameUrdu: "سادہ نان", category: MenuCategory.NaanRoti, price: 30, description: "Freshly baked in tandoor", available: true },
  { id: "M-014", name: "Butter Naan", category: MenuCategory.NaanRoti, price: 50, description: "Naan brushed with desi ghee", available: true },
  { id: "M-015", name: "Garlic Naan", category: MenuCategory.NaanRoti, price: 60, description: "Topped with minced garlic and herbs", available: true },
  { id: "M-016", name: "Roti", nameUrdu: "روٹی", category: MenuCategory.NaanRoti, price: 35, description: "Whole wheat tandoori roti", available: true },
  { id: "M-017", name: "Paratha", nameUrdu: "پراٹھا", category: MenuCategory.NaanRoti, price: 50, description: "Layered flaky flatbread", available: true },
  { id: "M-018", name: "Raita", nameUrdu: "رائتہ", category: MenuCategory.NaanRoti, price: 80, description: "Yogurt with cucumber and mint", available: true },

  // ── Drinks ──
  { id: "M-019", name: "Pepsi", category: MenuCategory.Drinks, price: 70, description: "300ml chilled bottle", available: true },
  { id: "M-020", name: "7Up", category: MenuCategory.Drinks, price: 70, description: "300ml chilled bottle", available: true },
  { id: "M-021", name: "Mango Lassi", nameUrdu: "آم لسی", category: MenuCategory.Drinks, price: 150, description: "Fresh mango yogurt smoothie", available: true, popular: true },
  { id: "M-022", name: "Mint Lemonade", category: MenuCategory.Drinks, price: 120, description: "Fresh mint with lemon and soda", available: false },

  // ── Desserts ──
  { id: "M-023", name: "Gulab Jamun", nameUrdu: "گلاب جامن", category: MenuCategory.Desserts, price: 100, description: "Sweet milk dumplings in rose syrup", available: true, popular: true },
  { id: "M-024", name: "Kheer", nameUrdu: "کھیر", category: MenuCategory.Desserts, price: 120, description: "Creamy rice pudding with cardamom and nuts", available: true },
  { id: "M-025", name: "Firni", nameUrdu: "فرنی", category: MenuCategory.Desserts, price: 100, description: "Ground rice pudding set in clay pot", available: true },
];
