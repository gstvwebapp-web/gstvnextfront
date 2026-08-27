'use client';

import { useState, useEffect } from 'react';
import { fetchCategories, Category } from '@/services/categoryApi';
import { MEDIA_BASE_URL } from '@/constants/api';
import Link from 'next/link';

interface CategoryMenuProps {
  isMobile?: boolean;
  currentPath?: string;
}

export default function CategoryMenu({ isMobile = false, currentPath = '' }: CategoryMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
     
      const response = await fetchCategories();
      if (response.status) {
        // Show all categories from the API response
        const allCategories = response.categories;
        // Sort by catOrder
        allCategories.sort((a, b) => a.catOrder - b.catOrder);
        setCategories(allCategories);
      }
    } catch (error) {
      console.error('CategoryMenu: Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };



  const getIconUrl = (icon: string) => {
    // If icon is already a full URL, use it directly
    if (icon && (icon.startsWith('http://') || icon.startsWith('https://'))) {
      return icon;
    }
    // Otherwise, construct the URL
    const backendUrl = `${MEDIA_BASE_URL}/backend`;
    if (icon) {
      return `${backendUrl}/public/uploads/category/icon/${icon}`;
    }
    return `${backendUrl}/public/uploads/category/icon/default.jpg`;
  };

  const isActive = (slug: string) => {
    return currentPath.includes(`/category/${slug}`);
  };

  if (loading) {
    return (
      <div className="category-menu-loading">
        <div className="loading-spinner"></div>
        <span>કેટેગરી લોડ થઈ રહી છે...</span>
      </div>
    );
  }

  // Mobile Accordion View
  if (isMobile) {
    return (
      <ul className="sidebar-menu accordion-menu">
        {categories.map((category) => {
          // Handle special categories with empty slugs or id 0
          let categoryUrl = `/category/${category.slug}`;


          return (
            <li key={`${category.id}-${category.title}`} className="accordion-item category-item">
              <div className="accordion-header">
                <Link href={categoryUrl} className={isActive(category.slug) ? 'active' : ''}>
                  <img
                    src={getIconUrl(category.icon)}
                    alt={category.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getIconUrl('');
                    }}
                  />
                  <span>{category.title}</span>
                </Link>
              </div>
            </li>
          );
        })}


      </ul>
    );
  }

  // Desktop Sidebar View
  return (
    <ul className="sidebar-menu">
      {categories.map((category) => {
        const showClass = category.slug === "gstv-satrang" ? "catMobileshow" : "";

        // Handle special categories with empty slugs or id 0
        let categoryUrl = `/category/${category.slug}`;

        return (
          <li key={`${category.id}-${category.title}`} className={`allcatshow ${showClass}`}>
            <Link href={categoryUrl} className={isActive(category.slug) ? 'active' : ''}>
              <img
                src={getIconUrl(category.icon)}
                alt={category.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getIconUrl('');
                }}
              />
              <span>{category.title}</span>
            </Link>
          </li>
        );
      })}


    </ul>
  );
}
