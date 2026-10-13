export const products = [
  { id: 'yogurt', name: 'Greek yogurt', brand: 'The cultured kind', size: '450 g', price: 4.5, protein: 18, color: 'lilac', label: 'GREEK', sub: 'plain & simple', shape: 'tub', category: 'Dairy', note: 'A little more protein, a lot of possibility.' },
  { id: 'oats', name: 'Organic rolled oats', brand: 'Good mornings', size: '500 g', price: 3.8, protein: 5, color: 'peach', label: 'OATS', sub: 'whole grain goodness', shape: 'box', category: 'Pantry', note: 'Your breakfast, with a little extra goodness.' },
  { id: 'milk', name: 'Unsweetened oat milk', brand: 'Everyday oat', size: '1 L', price: 3.2, protein: 3, color: 'green', label: 'oat.', sub: 'nothing extra', shape: 'carton', category: 'Plant-based', note: 'A lovely little addition to your morning.' },
  { id: 'chickpeas', name: 'Organic chickpeas', brand: 'Little harvest', size: '400 g', price: 2.4, protein: 7, color: 'pink', label: 'CHICK\nPEAS', sub: 'small but mighty', shape: 'can', category: 'Pantry', note: 'An easy pantry pick for your next lunch.' },
] as const;
export type Product = typeof products[number];
export const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
