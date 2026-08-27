'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SatrangAuthor } from '@/services/newsApi';

interface SatrangHeaderWithDropdownProps {
  categoryName: string;
  categorySlug: string;
  authors: SatrangAuthor[];
  selectedAuthor?: string;
  onAuthorSelect?: (authorSlug: string) => void;
  className?: string;
}

export default function SatrangHeaderWithDropdown({
  categoryName,
  categorySlug,
  authors,
  selectedAuthor,
  onAuthorSelect,
  className = ''
}: SatrangHeaderWithDropdownProps) {
  const [filteredAuthors, setFilteredAuthors] = useState<SatrangAuthor[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize filtered authors
  useEffect(() => {
    setFilteredAuthors(authors);
  }, [authors]);

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
      setFilteredAuthors(authors);
    }
  };

  // Handle search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredAuthors(authors);
    } else {
      const filtered = authors.filter(author =>
        author.title.toLowerCase().includes(term) ||
        author.category_name.toLowerCase().includes(term) ||
        author.category_name_guj.toLowerCase().includes(term) ||
        author.authorName.toLowerCase().includes(term)
      );
      setFilteredAuthors(filtered);
    }
  };

  const handleAuthorSelect = (authorSlug: string) => {
    setIsDropdownOpen(false);
    setSearchTerm('');
    setFilteredAuthors(authors);
    
    if (onAuthorSelect) {
      onAuthorSelect(authorSlug);
    } else {
      // Default navigation
      window.location.href = `/category/${categorySlug}/${authorSlug}`;
    }
  };

  const getDisplayText = () => {
    if (selectedAuthor) {
      const author = authors.find(a => a.slug === selectedAuthor);
      return author ? author.title : selectedAuthor;
    }
    return 'લેખક પસંદ કરો'; // "Select Author" in Gujarati
  };

  return (
    <div className={`category-header-with-dropdown ${className}`}>
      <div className="blogs-head-bar first">
          <span className="blog-category">
            {categoryName}
          </span>
        
        {/* Select2 Dropdown on Right Side */}
        {authors.length > 0 && (
          <div className="category-dropdown-right">
            <div className={`select2-container select2-container--default category-select2-custom ${isDropdownOpen ? 'select2-container--open select2-container--below' : ''}`} ref={dropdownRef}>
              <span 
                className="select2-selection select2-selection--single"
                onClick={toggleDropdown}
                role="combobox"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <span className="select2-selection__rendered">
                  {getDisplayText()}
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
                      placeholder="લેખક શોધો..." // "Search authors..." in Gujarati
                      value={searchTerm}
                      onChange={handleSearch}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </span>
                  
                  <span className="select2-results">
                    <ul className="select2-results__options" role="listbox">
                      {/* All Authors Option */}
                      <li 
                        className={`select2-results__option select2-results__option--selectable ${!selectedAuthor ? 'select2-results__option--selected' : ''}`}
                        onClick={() => handleAuthorSelect('')}
                        role="option"
                      >
                        બધા લેખકો {/* "All Authors" in Gujarati */}
                      </li>
                      
                      {/* Filtered Authors */}
                      {filteredAuthors.length > 0 ? (
                        filteredAuthors.map((author) => (
                          <li 
                            key={author.id}
                            className={`select2-results__option select2-results__option--selectable ${selectedAuthor === author.slug ? 'select2-results__option--selected' : ''}`}
                            onClick={() => handleAuthorSelect(author.slug)}
                            role="option"
                            title={`${author.title} - ${author.authorName}`}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: '500' }}>{author.title}</span>
                              
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="select2-results__option select2-results__option--disabled">
                          કોઈ પરિણામ મળ્યું નથી {/* "No results found" in Gujarati */}
                        </li>
                      )}
                    </ul>
                  </span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
