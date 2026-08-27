export interface Subcategory {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Category {
  name: string;
  slug: string;
  icon: string;
  description?: string;
  subcategories?: Subcategory[];
}

export const categoriesData: Category[] = [
  {
    name: 'Gujarat',
    slug: 'gujarat',
    icon: '/images/category_icon.svg',
    description: 'Latest news from Gujarat state',
    subcategories: [
      { name: 'Surat', slug: 'surat', description: 'News from Surat city' },
      { name: 'Ahmedabad', slug: 'ahmedabad', description: 'News from Ahmedabad city' },
      { name: 'Vadodara', slug: 'vadodara', description: 'News from Vadodara city' },
      { name: 'Rajkot', slug: 'rajkot', description: 'News from Rajkot city' },
      { name: 'Bhavnagar', slug: 'bhavnagar', description: 'News from Bhavnagar city' },
      { name: 'Gandhinagar', slug: 'gandhinagar', description: 'News from Gandhinagar city' },
      { name: 'Junagadh', slug: 'junagadh', description: 'News from Junagadh city' },
      { name: 'Kutch', slug: 'kutch', description: 'News from Kutch district' },
      { name: 'Mehsana', slug: 'mehsana', description: 'News from Mehsana city' },
      { name: 'Anand', slug: 'anand', description: 'News from Anand city' },
    ]
  },
  {
    name: 'India',
    slug: 'india',
    icon: '/images/category_icon.svg',
    description: 'National news from across India',
    subcategories: [
      { name: 'Delhi', slug: 'delhi', description: 'News from Delhi' },
      { name: 'Mumbai', slug: 'mumbai', description: 'News from Mumbai' },
      { name: 'Bangalore', slug: 'bangalore', description: 'News from Bangalore' },
      { name: 'Chennai', slug: 'chennai', description: 'News from Chennai' },
      { name: 'Kolkata', slug: 'kolkata', description: 'News from Kolkata' },
      { name: 'Hyderabad', slug: 'hyderabad', description: 'News from Hyderabad' },
      { name: 'Pune', slug: 'pune', description: 'News from Pune' },
      { name: 'Jaipur', slug: 'jaipur', description: 'News from Jaipur' },
    ]
  },
  {
    name: 'World',
    slug: 'world',
    icon: '/images/category_icon.svg',
    description: 'International news from around the world',
    subcategories: [
      { name: 'USA', slug: 'usa', description: 'News from United States' },
      { name: 'Europe', slug: 'europe', description: 'News from Europe' },
      { name: 'Asia', slug: 'asia', description: 'News from Asia' },
      { name: 'Middle East', slug: 'middle-east', description: 'News from Middle East' },
      { name: 'Africa', slug: 'africa', description: 'News from Africa' },
    ]
  },
  {
    name: 'Business',
    slug: 'business',
    icon: '/images/category_icon.svg',
    description: 'Business and economic news',
    subcategories: [
      { name: 'Stock Market', slug: 'stock-market', description: 'Stock market updates' },
      { name: 'Banking', slug: 'banking', description: 'Banking sector news' },
      { name: 'Technology', slug: 'technology', description: 'Tech business news' },
      { name: 'Startups', slug: 'startups', description: 'Startup ecosystem news' },
      { name: 'Economy', slug: 'economy', description: 'Economic developments' },
    ]
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    icon: '/images/category_icon.svg',
    description: 'Entertainment and celebrity news',
    subcategories: [
      { name: 'Bollywood', slug: 'bollywood', description: 'Bollywood news and updates' },
      { name: 'Hollywood', slug: 'hollywood', description: 'Hollywood news and updates' },
      { name: 'TV Shows', slug: 'tv-shows', description: 'Television shows and serials' },
      { name: 'Music', slug: 'music', description: 'Music industry news' },
      { name: 'Celebrity', slug: 'celebrity', description: 'Celebrity news and gossip' },
    ]
  },
  {
    name: 'Sports',
    slug: 'sports',
    icon: '/images/category_icon.svg',
    description: 'Sports news and updates',
    subcategories: [
      { name: 'Cricket', slug: 'cricket', description: 'Cricket news and scores' },
      { name: 'Football', slug: 'football', description: 'Football news and updates' },
      { name: 'Tennis', slug: 'tennis', description: 'Tennis tournaments and news' },
      { name: 'Olympics', slug: 'olympics', description: 'Olympic games and sports' },
      { name: 'IPL', slug: 'ipl', description: 'Indian Premier League' },
    ]
  },
  {
    name: 'Videos',
    slug: 'videos',
    icon: '/images/category_icon.svg',
    description: 'Video content and news',
    subcategories: [
      { name: 'Breaking News', slug: 'breaking-news', description: 'Breaking news videos' },
      { name: 'Interviews', slug: 'interviews', description: 'Interview videos' },
      { name: 'Documentaries', slug: 'documentaries', description: 'Documentary videos' },
      { name: 'Live Events', slug: 'live-events', description: 'Live event coverage' },
    ]
  },
];

// Helper functions
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categoriesData.find(category => category.slug === slug);
};

export const getSubcategoryBySlug = (categorySlug: string, subcategorySlug: string): Subcategory | undefined => {
  const category = getCategoryBySlug(categorySlug);
  return category?.subcategories?.find(sub => sub.slug === subcategorySlug);
};

export const getAllCategories = (): Category[] => {
  return categoriesData;
};

export const getSubcategoriesByCategory = (categorySlug: string): Subcategory[] => {
  const category = getCategoryBySlug(categorySlug);
  return category?.subcategories || [];
};
