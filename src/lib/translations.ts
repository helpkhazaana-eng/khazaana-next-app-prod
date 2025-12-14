/**
 * Bengali Translation System
 * 
 * Provides translations for menu items, categories, and UI elements
 * from English to Bengali (বাংলা)
 */

export type Language = 'en' | 'bn';

// Common food item translations (English -> Bengali)
export const foodTranslations: Record<string, string> = {
  // Proteins
  'chicken': 'মুরগি',
  'mutton': 'মাটন',
  'fish': 'মাছ',
  'egg': 'ডিম',
  'prawn': 'চিংড়ি',
  'prawns': 'চিংড়ি',
  'paneer': 'পনির',
  'veg': 'নিরামিষ',
  'vegetable': 'সবজি',
  'aloo': 'আলু',
  'potato': 'আলু',
  'dal': 'ডাল',
  'daal': 'ডাল',
  'lentil': 'ডাল',
  'pomfret': 'পমফ্রেট',
  'keema': 'কিমা',
  'seekh': 'সিখ',
  
  // Rice dishes
  'biryani': 'বিরিয়ানি',
  'rice': 'ভাত',
  'fried rice': 'ফ্রাইড রাইস',
  'pulao': 'পোলাও',
  'khichdi': 'খিচুড়ি',
  
  // Breads
  'roti': 'রুটি',
  'naan': 'নান',
  'paratha': 'পরোটা',
  'luchi': 'লুচি',
  'puri': 'পুরি',
  'chapati': 'চাপাটি',
  
  // Curries & Gravies
  'curry': 'তরকারি',
  'gravy': 'ঝোল',
  'masala': 'মশলা',
  'korma': 'কোর্মা',
  'butter': 'বাটার',
  'tikka': 'টিক্কা',
  'tandoori': 'তন্দুরি',
  'kebab': 'কাবাব',
  'kabab': 'কাবাব',
  'kofta': 'কোফতা',
  'bhuna': 'ভুনা',
  'roast': 'রোস্ট',
  'fry': 'ভাজা',
  'fried': 'ভাজা',
  'grilled': 'গ্রিলড',
  
  // Chinese
  'noodles': 'নুডলস',
  'chowmein': 'চাউমিন',
  'hakka': 'হাক্কা',
  'manchurian': 'মাঞ্চুরিয়ান',
  'chilli': 'চিলি',
  'schezwan': 'সিজওয়ান',
  'szechuan': 'সিজওয়ান',
  'momos': 'মোমো',
  'momo': 'মোমো',
  'soup': 'স্যুপ',
  'spring roll': 'স্প্রিং রোল',
  'roll': 'রোল',
  
  // Snacks & Starters
  'pakora': 'পাকোড়া',
  'samosa': 'সমোসা',
  'chop': 'চপ',
  'cutlet': 'কাটলেট',
  'finger': 'ফিঙ্গার',
  'crispy': 'ক্রিস্পি',
  'golden': 'গোল্ডেন',
  'special': 'স্পেশাল',
  'extra': 'এক্সট্রা',
  'piece': 'পিস',
  'full': 'ফুল',
  'half': 'হাফ',
  
  // Desserts & Sweets
  'sweet': 'মিষ্টি',
  'dessert': 'ডেজার্ট',
  'ice cream': 'আইসক্রিম',
  'cake': 'কেক',
  'pastry': 'পেস্ট্রি',
  'brownie': 'ব্রাউনি',
  'chocolate': 'চকোলেট',
  'vanilla': 'ভ্যানিলা',
  'strawberry': 'স্ট্রবেরি',
  'mango': 'আম',
  'gulab jamun': 'গোলাপ জামুন',
  'rasgulla': 'রসগোল্লা',
  'rasmalai': 'রসমালাই',
  'kheer': 'পায়েস',
  'payesh': 'পায়েস',
  
  // Beverages
  'tea': 'চা',
  'coffee': 'কফি',
  'lassi': 'লাচ্ছি',
  'shake': 'শেক',
  'milkshake': 'মিল্কশেক',
  'juice': 'জুস',
  'cold drink': 'কোল্ড ড্রিংক',
  'cold': 'ঠান্ডা',
  'iced': 'আইসড',
  'water': 'জল',
  'lemon': 'লেবু',
  'nimbu': 'লেবু',
  'soda': 'সোডা',
  'mojito': 'মোজিতো',
  'ginger': 'আদা',
  'green': 'গ্রিন',
  'black': 'ব্ল্যাক',
  'herbal': 'হার্বাল',
  
  // Cafe items
  'sandwich': 'স্যান্ডউইচ',
  'burger': 'বার্গার',
  'pizza': 'পিৎজা',
  'pasta': 'পাস্তা',
  'fries': 'ফ্রাইস',
  'french fries': 'ফ্রেঞ্চ ফ্রাইস',
  'toast': 'টোস্ট',
  'bread': 'পাউরুটি',
  'cheese': 'চিজ',
  'mayo': 'মেয়ো',
  'sauce': 'সস',
  
  // Cooking styles
  'steamed': 'স্টিমড',
  'boiled': 'সেদ্ধ',
  'baked': 'বেকড',
  'stuffed': 'স্টাফড',
  'mixed': 'মিক্সড',
  'combo': 'কম্বো',
  'platter': 'প্ল্যাটার',
  'thali': 'থালি',
  
  // Sizes & Quantities
  'small': 'ছোট',
  'medium': 'মাঝারি',
  'large': 'বড়',
  'regular': 'রেগুলার',
  'mini': 'মিনি',
  'jumbo': 'জাম্বো',
  'double': 'ডাবল',
  'single': 'সিঙ্গেল',
  
  // Common adjectives
  'hot': 'গরম',
  'spicy': 'ঝাল',
  'mild': 'মৃদু',
  'creamy': 'ক্রিমি',
  'dry': 'শুকনো',
  'fresh': 'তাজা',
  'homemade': 'ঘরে তৈরি',
  'traditional': 'ঐতিহ্যবাহী',
  'classic': 'ক্লাসিক',
  'premium': 'প্রিমিয়াম',
  'deluxe': 'ডিলাক্স',
  
  // Additional menu items
  'patties': 'প্যাটিস',
  'mac': 'ম্যাক',
  'tomato': 'টমেটো',
  'twist': 'টুইস্ট',
  'milky': 'মিল্কি',
  'malai': 'মালাই',
  'red': 'রেড',
  'velvet': 'ভেলভেট',
  'donut': 'ডোনাট',
  'doughnut': 'ডোনাট',
  'forest': 'ফরেস্ট',
  'salted': 'সল্টেড',
  'peri': 'পেরি',
  'loaded': 'লোডেড',
  'cheesy': 'চিজি',
  'shot': 'শট',
  'nuggets': 'নাগেটস',
  'maggi': 'ম্যাগি',
  'honey': 'মধু',
  'pancake': 'প্যানকেক',
  'waffle': 'ওয়াফেল',
  'oreo': 'ওরিও',
  'butterscotch': 'বাটারস্কচ',
  'currant': 'কারেন্ট',
  
  // Soups & preparations
  'manchow': 'মানচাও',
  'corn': 'কর্ন',
  'sour': 'সাওয়ার',
  'clear': 'ক্লিয়ার',
  'cream': 'ক্রিম',
  'mushroom': 'মাশরুম',
  'coriander': 'ধনে',
  'noodle': 'নুডল',
  'salt': 'সল্ট',
  'pepper': 'পেপার',
  'fingers': 'ফিঙ্গারস',
  'pakoda': 'পাকোড়া',
  'lollipop': 'ললিপপ',
  'dragon': 'ড্রাগন',
  'drumstick': 'ড্রামস্টিক',
  
  // Rice & pulao
  'jeera': 'জিরা',
  'peas': 'মটর',
  'hong': 'হং',
  'kong': 'কং',
  'basmati': 'বাসমতি',
  
  // Paneer & veg dishes
  'chilli': 'চিলি',
  'baby': 'বেবি',
  'mutter': 'মটর',
  'varta': 'ভার্তা',
  'pyaza': 'পেঁয়াজি',
  'dopayaza': 'দোপেঁয়াজা',
  'do': 'দো',
  'kadhai': 'কড়াই',
  'shahi': 'শাহী',
  'tadka': 'তড়কা',
  'dum': 'দম',
  'kashmiri': 'কাশ্মীরি',
  'mix': 'মিক্স',
  'chana': 'ছোলা',
  'tawa': 'তাওয়া',
  'bhurji': 'ভুর্জি',
  'omelette': 'অমলেট',
  'omelet': 'অমলেট',
  
  // Non-veg dishes
  'reshmi': 'রেশমি',
  'haryali': 'হরিয়ালি',
  'rogan': 'রোগান',
  'josh': 'জোশ',
  'rezala': 'রেজালা',
  'kosha': 'কষা',
  'chaap': 'চাপ',
  'leg': 'লেগ',
  'handi': 'হান্ডি',
  'kolhapuri': 'কোলহাপুরি',
  
  // Breads additional
  'kulcha': 'কুলচা',
  'rumali': 'রুমালি',
  'lachcha': 'লাচ্ছা',
  'garlic': 'রসুন',
  'plain': 'প্লেইন',
  'ghee': 'ঘি',
  
  // Desserts additional
  'truffle': 'ট্রাফল',
  'ganache': 'গানাশ',
  'pound': 'পাউন্ড',
  'choco': 'চকো',
  'vancho': 'ভাঞ্চো',
  'saffron': 'জাফরান',
  'kiwi': 'কিউই',
  
  // Misc
  'american': 'আমেরিকান',
  'chopsuey': 'চপসুই',
  'chow': 'চাও',
  'mein': 'মেইন',
  'dog': 'ডগ',
  'stick': 'স্টিক',
  'mineral': 'মিনারেল',
  'drink': 'ড্রিংক',
  'salad': 'সালাদ',
  'onion': 'পেঁয়াজ',
  'kurkure': 'কুরকুরে',
  'kuleba': 'কুলেবা',
  'with': 'উইথ',
  'of': 'অফ',
  'n': 'এন',
  'pc': 'পিস',
  'pcs': 'পিস',
  'per': 'প্রতি',
  'ml': 'মিলি',
  'white': 'সাদা',
  'ice': 'আইস',
  'nonveg': 'আমিষ',
};

// Category translations
export const categoryTranslations: Record<string, string> = {
  'Biryani': 'বিরিয়ানি',
  'Rice': 'ভাত',
  'Fried Rice': 'ফ্রাইড রাইস',
  'Noodles': 'নুডলস',
  'Chowmein': 'চাউমিন',
  'Chinese': 'চাইনিজ',
  'Indian': 'ইন্ডিয়ান',
  'Bengali': 'বাঙালি',
  'Mughlai': 'মোগলাই',
  'Tandoor': 'তন্দুর',
  'Starters': 'স্টার্টার',
  'Appetizers': 'অ্যাপেটাইজার',
  'Snacks': 'স্ন্যাকস',
  'Main Course': 'মেইন কোর্স',
  'Curry': 'তরকারি',
  'Gravy': 'ঝোল',
  'Dry': 'শুকনো',
  'Bread': 'রুটি',
  'Roti': 'রুটি',
  'Desserts': 'ডেজার্ট',
  'Sweets': 'মিষ্টি',
  'Beverages': 'পানীয়',
  'Drinks': 'পানীয়',
  'Add-on': 'অ্যাড-অন',
  'Add-ons': 'অ্যাড-অন',
  'Extras': 'এক্সট্রা',
  'Combo': 'কম্বো',
  'Thali': 'থালি',
  'Soup': 'স্যুপ',
  'Salad': 'সালাদ',
  'Momos': 'মোমো',
  'Rolls': 'রোল',
  'Sandwich': 'স্যান্ডউইচ',
  'Burger': 'বার্গার',
  'Burgers': 'বার্গার',
  'Pizza': 'পিৎজা',
  'Pizzas': 'পিৎজা',
  'Pasta': 'পাস্তা',
  'Pastas': 'পাস্তা',
  'Cafe': 'ক্যাফে',
  'Bakery': 'বেকারি',
  'Cakes': 'কেক',
  'Pastries': 'পেস্ট্রি',
  'Ice Cream': 'আইসক্রিম',
  'Shakes': 'শেক',
  'Milkshakes': 'মিল্কশেক',
  'Milkshake': 'মিল্কশেক',
  'Coffee': 'কফি',
  'Tea': 'চা',
  'Chicken': 'মুরগি',
  'Mutton': 'মাটন',
  'Fish': 'মাছ',
  'Egg': 'ডিম',
  'Veg': 'নিরামিষ',
  'Non-Veg': 'আমিষ',
  'Seafood': 'সামুদ্রিক খাবার',
  'Chaat': 'চাট',
  'Waffles': 'ওয়াফেল',
  'Waffle': 'ওয়াফেল',
  'Fries': 'ফ্রাইস',
  'Grill Sandwich': 'গ্রিল স্যান্ডউইচ',
  'Grilled Sandwich': 'গ্রিল স্যান্ডউইচ',
  'Toast': 'টোস্ট',
  'Wraps': 'র‍্যাপ',
  'Wrap': 'র‍্যাপ',
};

// UI translations
export const uiTranslations: Record<Language, Record<string, string>> = {
  en: {
    'add_to_cart': 'Add to Cart',
    'view_cart': 'View Cart',
    'checkout': 'Checkout',
    'search': 'Search',
    'search_placeholder': 'Search for dishes or restaurants...',
    'menu': 'Menu',
    'restaurants': 'Restaurants',
    'home': 'Home',
    'cart': 'Cart',
    'orders': 'Orders',
    'profile': 'Profile',
    'veg': 'Veg',
    'non_veg': 'Non-Veg',
    'price': 'Price',
    'quantity': 'Quantity',
    'total': 'Total',
    'subtotal': 'Subtotal',
    'tax': 'Tax',
    'delivery_fee': 'Delivery Fee',
    'place_order': 'Place Order',
    'order_placed': 'Order Placed!',
    'open': 'Open',
    'closed': 'Closed',
    'opens_at': 'Opens at',
    'closes_at': 'Closes at',
    'rating': 'Rating',
    'cost_for_two': 'Cost for two',
    'view_menu': 'View Menu',
    'all_categories': 'All Categories',
    'filter': 'Filter',
    'sort': 'Sort',
    'language': 'Language',
    'english': 'English',
    'bengali': 'বাংলা',
  },
  bn: {
    'add_to_cart': 'কার্টে যোগ করুন',
    'view_cart': 'কার্ট দেখুন',
    'checkout': 'চেকআউট',
    'search': 'খুঁজুন',
    'search_placeholder': 'খাবার বা রেস্তোরাঁ খুঁজুন...',
    'menu': 'মেনু',
    'restaurants': 'রেস্তোরাঁ',
    'home': 'হোম',
    'cart': 'কার্ট',
    'orders': 'অর্ডার',
    'profile': 'প্রোফাইল',
    'veg': 'নিরামিষ',
    'non_veg': 'আমিষ',
    'price': 'দাম',
    'quantity': 'পরিমাণ',
    'total': 'মোট',
    'subtotal': 'উপমোট',
    'tax': 'কর',
    'delivery_fee': 'ডেলিভারি ফি',
    'place_order': 'অর্ডার করুন',
    'order_placed': 'অর্ডার সম্পন্ন!',
    'open': 'খোলা',
    'closed': 'বন্ধ',
    'opens_at': 'খোলার সময়',
    'closes_at': 'বন্ধের সময়',
    'rating': 'রেটিং',
    'cost_for_two': 'দুজনের জন্য',
    'view_menu': 'মেনু দেখুন',
    'all_categories': 'সব ক্যাটাগরি',
    'filter': 'ফিল্টার',
    'sort': 'সাজান',
    'language': 'ভাষা',
    'english': 'English',
    'bengali': 'বাংলা',
  }
};

// Restaurant name translations (manual for accuracy)
export const restaurantTranslations: Record<string, string> = {
  'Cups N Crumbs': 'কাপস এন ক্রাম্বস',
  'Aaviora': 'আভিওরা',
  'Kolkata Arsalan Biryani': 'কলকাতা আরসালান বিরিয়ানি',
  'Bandhu Hotel': 'বন্ধু হোটেল',
  'Bhole Baba Roll Corner': 'ভোলে বাবা রোল কর্নার',
  'White Chocolate The Cake House': 'হোয়াইট চকোলেট দ্য কেক হাউস',
};

/**
 * Translate a menu item name to Bengali
 * Uses word-by-word translation with smart matching
 */
export function translateItemName(name: string): string {
  if (!name) return '';
  
  let translated = name;
  
  // Sort by length (longest first) to avoid partial replacements
  const sortedKeys = Object.keys(foodTranslations).sort((a, b) => b.length - a.length);
  
  for (const english of sortedKeys) {
    const bengali = foodTranslations[english];
    // Case-insensitive replacement
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, bengali);
  }
  
  return translated;
}

/**
 * Translate a category name to Bengali
 */
export function translateCategory(category: string): string {
  if (!category) return '';
  return categoryTranslations[category] || translateItemName(category);
}

/**
 * Translate a restaurant name to Bengali
 */
export function translateRestaurantName(name: string): string {
  if (!name) return '';
  return restaurantTranslations[name] || name;
}

/**
 * Get UI text in the specified language
 */
export function t(key: string, lang: Language = 'en'): string {
  return uiTranslations[lang][key] || uiTranslations['en'][key] || key;
}

/**
 * Format price in Bengali numerals
 */
export function formatPriceBengali(price: number): string {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return price.toString().split('').map(digit => {
    const num = parseInt(digit);
    return isNaN(num) ? digit : bengaliNumerals[num];
  }).join('');
}

/**
 * Format price with currency symbol
 */
export function formatPrice(price: number, lang: Language = 'en'): string {
  if (lang === 'bn') {
    return `৳${formatPriceBengali(price)}`;
  }
  return `₹${price}`;
}
