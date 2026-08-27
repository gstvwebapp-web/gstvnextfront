'use client';

import Link from 'next/link';

interface CategoryBreadcrumbProps {
  categoryName: string;
  categorySlug: string;
  subcategoryName?: string;
  subcategorySlug?: string;
}

export default function CategoryBreadcrumb({ 
  categoryName, 
  categorySlug, 
  subcategoryName, 
  subcategorySlug 
}: CategoryBreadcrumbProps) {
  return (
    <nav className="breadcrumb-nav">
      <div className="breadcrumb-container">
        <Link href="/" className="breadcrumb-item">
          <span>હોમ</span>
        </Link>
        
        <span className="breadcrumb-separator">›</span>
        
        <Link href={`/category/${categorySlug}`} className="breadcrumb-item">
          <span>{categoryName}</span>
        </Link>
        
        {subcategoryName && subcategorySlug && (
          <>
            <span className="breadcrumb-separator">›</span>
            <Link href={`/category/${categorySlug}/${subcategorySlug}`} className="breadcrumb-item current">
              <span>{subcategoryName}</span>
            </Link>
          </>
        )}
      </div>

      <style jsx>{`
        .breadcrumb-nav {
          background: #f8f9fa;
          padding: 15px 0;
          border-bottom: 1px solid #e9ecef;
          margin-bottom: 20px;
        }

        .breadcrumb-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .breadcrumb-item {
          color: #6c757d;
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.3s ease;
          padding: 5px 8px;
          border-radius: 4px;
        }

        .breadcrumb-item:hover {
          color: #dc3545;
          background: rgba(220, 53, 69, 0.1);
        }

        .breadcrumb-item.current {
          color: #dc3545;
          font-weight: 600;
          pointer-events: none;
        }

        .breadcrumb-separator {
          color: #adb5bd;
          font-size: 1.1rem;
          user-select: none;
        }

        @media (max-width: 768px) {
          .breadcrumb-container {
            padding: 0 15px;
          }

          .breadcrumb-item {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </nav>
  );
}
