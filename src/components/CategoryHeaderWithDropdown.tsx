'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MEDIA_BASE_URL } from '@/constants/api';
import Link from 'next/link';
import { fetchCategories, buildCategoryTree, Category } from '@/services/categoryApi';
import { fetchCategorySetting, CategorySettingItem } from '@/services/newsApi';

interface CategoryHeaderWithDropdownProps {
  categoryName: string;
  categorySlug: string;
  categoryId?: number;
  showViewAll?: boolean;
  className?: string;
}

export default function CategoryHeaderWithDropdown({
  categoryName,
  categorySlug,
  categoryId,
  showViewAll = false,
  className = ''
}: CategoryHeaderWithDropdownProps) {
  const [dropdownCategories, setDropdownCategories] = useState<CategorySettingItem[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategorySettingItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug);
  const [currentCategory, setCurrentCategory] = useState<CategorySettingItem | null>(null);
  const [parentCategory, setParentCategory] = useState<CategorySettingItem | null>(null);
  const [isSubcategory, setIsSubcategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories and determine dropdown content
  useEffect(() => {
    const fetchDropdownCategories = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
       

        const response = await fetchCategorySetting();
        if (response.category && Array.isArray(response.category)) {
          const allCategories = response.category;

          // Find current category
          const current = allCategories.find(cat => cat.id === categoryId);
          if (!current) {
         
            return;
          }

          setCurrentCategory(current);
        
          // Special handling for videos category
          if (categorySlug === 'videos') {
            // Create hardcoded video subcategories
           
            const videoSubcategories = allCategories.filter(cat =>
              cat.parentID === categoryId && cat.status === 'Active'
            );
            setDropdownCategories(videoSubcategories);
            setFilteredCategories(videoSubcategories);
            setIsSubcategory(false);
            
          } else if (current.parentID === 0) {
            // This is a parent category - show child categories
            const children = allCategories.filter(cat =>
              cat.parentID === categoryId && cat.status === 'Active'
            );
            setDropdownCategories(children);
            setFilteredCategories(children);
            setIsSubcategory(false);
           
          } else {
            // This is a subcategory - show sibling subcategories
            const parent = allCategories.find(cat => cat.id === current.parentID);
            if (parent) {
              setParentCategory(parent);
              const siblings = allCategories.filter(cat =>
                cat.parentID === current.parentID && cat.status === 'Active'
              );
              setDropdownCategories(siblings);
              setFilteredCategories(siblings);
              setIsSubcategory(true);
              
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching dropdown categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownCategories();
  }, [categoryId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategorySelect = (slug: string, isParentOption: boolean = false) => {
    setSelectedCategory(slug);
    setIsDropdownOpen(false);

    // Special handling for videos category
    if (categorySlug === 'videos') {
      if (slug === 'videos') {
        // Navigate to main videos category
        window.location.href = `/category/videos`;
      } else {
        // Navigate to videos subcategory
        window.location.href = `/category/videos/${slug}`;
      }
      return;
    }

    // Navigate to selected category
    if (isParentOption && parentCategory) {
      // Navigate to parent category
      window.location.href = `/category/${parentCategory.slug}`;
    } else if (isSubcategory && parentCategory) {
      // Navigate to sibling subcategory
      window.location.href = `/category/${parentCategory.slug}/${slug}`;
    } else {
      // Navigate to child category (parent category case)
      window.location.href = `/category/${categorySlug}/${slug}`;
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      // Focus search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      // Clear search when closing
      setSearchTerm('');
      setFilteredCategories(dropdownCategories);
    }
  };
  const getDefaultGujaratiLabel = () => {
  // Gujarat special case
  if (categorySlug === 'gujarat') {
    return 'તમારું શહેર પસંદ કરો';
  }

  // If current category loaded, use Gujarati
  if (currentCategory?.category_name_guj) {
    return currentCategory.category_name_guj;
  }

  // Safe Gujarati fallback (NO ENGLISH)
  return 'પસંદ કરો';
};
  // Handle search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      setFilteredCategories(dropdownCategories);
    } else {
      const filtered = dropdownCategories.filter(category =>
        category.title.toLowerCase().includes(term) ||
        category.category_name.toLowerCase().includes(term) ||
        (category.category_name_guj && category.category_name_guj.toLowerCase().includes(term))
      );
      setFilteredCategories(filtered);
    }
  };

  const getIconUrl = (icon: string) => {
    if (icon) {
      // Check if icon is already a full URL
      if (icon.startsWith('http')) {
        return icon;
      }
      // Otherwise, construct the full URL
      const backendUrl = `${MEDIA_BASE_URL}/backend`;
      return `${backendUrl}/public/uploads/category/icon/${icon}`;
    }
    return `${MEDIA_BASE_URL}/backend/public/uploads/category/icon/default.jpg`;
  };

  return (
    <div className={`category-header-with-dropdown ${className}`}>
      <div className="blogs-head-bar first">
      
          <span className="blog-category">
            {categoryName}
            
          </span>
        

        {/* Select2 Dropdown on Right Side */}
        {dropdownCategories.length > 0 && (
          <div className="category-dropdown-right ">
            <div className={`select2-container select2-container--default category-select2-custom ${isDropdownOpen ? 'select2-container--open select2-container--below' : ''}`} ref={dropdownRef}>
              <span
                className="select2-selection select2-selection--single"
                onClick={toggleDropdown}
                role="combobox"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
               
<span className="select2-selection__rendered">
  {
    // Selected subcategory
    selectedCategory !== categorySlug
      ? (
          filteredCategories.find(cat => cat.slug === selectedCategory)
            ?.category_name_guj || getDefaultGujaratiLabel()
        )

      // Default state (no selection yet)
      : getDefaultGujaratiLabel()
  }
</span>
                <span className="select2-selection__arrow" role="presentation">
                  <b role="presentation"></b>
                </span>
              </span>

              {isDropdownOpen && (
                <span className="select2-dropdown select2-dropdown--below">
                  {/* Search Input */}
                  <span className="select2-search select2-search--dropdown">
                    <input
                      ref={searchInputRef}
                      className="select2-search__field"
                      type="search"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={handleSearch}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </span>

                  <span className="select2-results">
                    <ul className="select2-results__options" role="listbox">
                      {/* Parent/All Categories Option */}
                      {isSubcategory && parentCategory ? (
                        <li
                          className={`select2-results__option select2-results__option--selectable ${selectedCategory === parentCategory.slug ? 'select2-results__option--selected' : ''}`}
                          onClick={() => handleCategorySelect(parentCategory.slug, true)}
                          role="option"
                        >
                          ઓલ {parentCategory.category_name_guj}
                        </li>
                      ) : (
                        <li
                          className={`select2-results__option select2-results__option--selectable ${selectedCategory === categorySlug ? 'select2-results__option--selected' : ''}`}
                          onClick={() => handleCategorySelect(categorySlug)}
                          role="option"
                        >
                          ઓલ {categoryName}
                        </li>
                      )}

                      {/* Filtered Categories */}
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                          <li
                            key={category.id}
                            className={`select2-results__option select2-results__option--selectable ${selectedCategory === category.slug ? 'select2-results__option--selected' : ''}`}
                            onClick={() => handleCategorySelect(category.slug)}
                            role="option"
                          >
                            {category.category_name_guj}
                          </li>
                        ))
                      ) : (
                        <li className="select2-results__option select2-results__option--disabled">
                          કોઈ પરિણામ મળ્યું નથી
                        </li>
                      )}
                    </ul>
                  </span>
                </span>
              )}

              {loading && (
                <div className="select2-loading">
                  <i className="fas fa-spinner fa-spin"></i> લોડ કરી રહ્યું છે...
                </div>
              )}
            </div>
          </div>
        )}

        {/* View All Link */}
        {showViewAll && (
          <Link href={`/category/${categorySlug}`} className="category-view-all">
            વધુ વાંચો
            <i className="fas fa-chevron-right"></i>
          </Link>
        )}
      </div>


    </div>
  );
}
