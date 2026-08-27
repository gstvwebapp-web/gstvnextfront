'use client';

import Link from 'next/link';
import { getAllCategories } from '@/data/categories';

const categories = getAllCategories();

export default function CategoriesPage() {
  return (
    <div className="categories-page">
      <div className="container">
        <h1 className="page-title">ઓલ કેટેગરી</h1>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <Link 
              key={category.slug} 
              href={`/category/${category.slug}`}
              className="category-card"
            >
              <div className="category-icon">
                <img src={category.icon} alt={category.name} />
              </div>
              <h3 className="category-name">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .categories-page {
          padding: 40px 0;
        }

        .page-title {
          text-align: center;
          font-size: 2.5rem;
          color: #333;
          margin-bottom: 40px;
          font-weight: bold;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 25px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .category-card {
          background: white;
          border-radius: 12px;
          padding: 30px 20px;
          text-align: center;
          text-decoration: none;
          color: #333;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #dc3545;
          color: #dc3545;
        }

        .category-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 20px;
          background: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .category-card:hover .category-icon {
          background: rgba(220, 53, 69, 0.1);
        }

        .category-icon img {
          width: 30px;
          height: 30px;
          object-fit: contain;
        }

        .category-name {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
          transition: color 0.3s ease;
        }

        @media (max-width: 768px) {
          .categories-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            padding: 0 15px;
          }

          .category-card {
            padding: 20px 15px;
          }

          .page-title {
            font-size: 2rem;
            margin-bottom: 30px;
          }
        }
      `}</style>
    </div>
  );
}
