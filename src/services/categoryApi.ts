// Category API Service
import { API_V5_BASE_URL, commonApiGet, COMMON_API_BASE_URL } from '@/constants/api';
export interface Category {
  id: number;
  title: string;
  slug: string;
  icon: string;
  catOrder: number;
  parentID: number;
  status: string;
  children?: Category[];
}

export interface CategoryResponse {
  status: boolean;
  message: string;
  categories: Category[];
}

/**
 * Fetch all categories with their children
 * @returns Promise<CategoryResponse>
 */
export const fetchCategories = async (): Promise<CategoryResponse> => {
  try {
    // Use the new categorysetting API endpoint
    const response = await fetch(`${API_V5_BASE_URL}/categorysetting`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();

      // Extract categories from the category[] key in response
      return {
        status: true,
        message: 'Success',
        categories: data.category || []
      };
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      categories: []
    };
  }
};

/**
 * Build category tree structure
 * @param categories - Flat array of categories
 * @returns Hierarchical category tree
 */
export const buildCategoryTree = (categories: Category[]): Category[] => {
  const categoryMap = new Map<number, Category>();
  const rootCategories: Category[] = [];

  // First pass: create map of all categories
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Second pass: build tree structure
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!;
    
    if (category.parentID === 0) {
      // Root category
      rootCategories.push(categoryWithChildren);
    } else {
      // Child category
      const parent = categoryMap.get(category.parentID);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(categoryWithChildren);
      }
    }
  });

  // Sort categories by catOrder
  const sortCategories = (cats: Category[]) => {
    cats.sort((a, b) => a.catOrder - b.catOrder);
    cats.forEach(cat => {
      if (cat.children && cat.children.length > 0) {
        sortCategories(cat.children);
      }
    });
  };

  sortCategories(rootCategories);
  return rootCategories;
};
