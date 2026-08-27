'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`pagination-container ${className}`}>
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          {/* Previous Button */}
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>

          {/* Page Numbers */}
          {visiblePages.map((page, index) => (
            <li key={index} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button
                  className="page-link"
                  onClick={() => onPageChange(page as number)}
                  disabled={loading}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          {/* Next Button */}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              aria-label="Next"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Page Info */}
      <div className="pagination-info text-center mt-2">
        <small className="text-muted">
          Page {currentPage} of {totalPages}
        </small>
      </div>

      <style jsx>{`
        .pagination-container {
          margin: 30px 0;
          padding: 20px 0;
        }

        .pagination {
          margin-bottom: 10px;
        }

        .page-link {
          color: #850E00;
          border-color: #dee2e6;
          padding: 8px 12px;
          margin: 0 2px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .page-link:hover {
          color: #fff;
          background-color: #850E00;
          border-color: #850E00;
        }

        .page-item.active .page-link {
          background-color: #850E00;
          border-color: #850E00;
          color: #fff;
        }

        .page-item.disabled .page-link {
          color: #6c757d;
          background-color: #fff;
          border-color: #dee2e6;
          cursor: not-allowed;
        }

        .page-link:focus {
          box-shadow: 0 0 0 0.2rem rgba(133, 14, 0, 0.25);
        }

        .pagination-info {
          color: #666;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .page-link {
            padding: 6px 10px;
            font-size: 14px;
          }
          
          .pagination {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default Pagination;
