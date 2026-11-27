import { Food } from '@/types';
import fishRollImg from '@/assets/Fish Roll.webp';
import fishBunImg from '@/assets/fish bun.jpg';
import fishPastryImg from '@/assets/fish pastry.jpg';
import chickenBurgerImg from '@/assets/chicken burger.jpg';
import chickenPastryImg from '@/assets/chicken pastry.jpg';
import sausagePastryImg from '@/assets/sausage pastry.jpg';
import seeniSambolBunImg from '@/assets/seenisambol bun.jpg';
import teaBunImg from '@/assets/tea bun.jpg';

// Extended Food interface for menu display
export interface MenuFood extends Omit<Food, '_id' | 'createdAt' | 'updatedAt'> {
  image?: string;
  badge?: 'Popular' | 'New' | 'Special';
}

// Menu items with image paths
export const menuItems: MenuFood[] = [
  {
    name: 'Fish Roll',
    price: 150,
    category: 'Rolls',
    description: 'Crispy, golden-fried roll filled with spiced fish and aromatic Sri Lankan herbs',
    available: true,
    image: fishRollImg,
    badge: 'Popular'
  },
  {
    name: 'Fish Bun',
    price: 120,
    category: 'Buns',
    description: 'Soft, fluffy bun stuffed with deliciously seasoned fish filling',
    available: true,
    image: fishBunImg,
    badge: 'Popular'
  },
  {
    name: 'Fish Pastry',
    price: 130,
    category: 'Pastries',
    description: 'Flaky pastry pocket filled with savory fish mixture and spices',
    available: true,
    image: fishPastryImg
  },
  {
    name: 'Chicken Burger',
    price: 280,
    category: 'Burgers',
    description: 'Juicy chicken patty with fresh vegetables and special sauce in a toasted bun',
    available: true,
    image: chickenBurgerImg,
    badge: 'New'
  },
  {
    name: 'Chicken Pastry',
    price: 140,
    category: 'Pastries',
    description: 'Golden pastry filled with tender chicken and aromatic spices',
    available: true,
    image: chickenPastryImg
  },
  {
    name: 'Sausage Pastry',
    price: 135,
    category: 'Pastries',
    description: 'Buttery pastry with succulent sausage and herbs',
    available: true,
    image: sausagePastryImg
  },
  {
    name: 'Seeni Sambol Bun',
    price: 110,
    category: 'Buns',
    description: 'Traditional Sri Lankan sweet and spicy caramelized onion filling in a soft bun',
    available: true,
    image: seeniSambolBunImg,
    badge: 'Popular'
  },
  {
    name: 'Tea Bun',
    price: 90,
    category: 'Buns',
    description: 'Classic sweet bun perfect for pairing with Ceylon tea',
    available: true,
    image: teaBunImg
  }
];
