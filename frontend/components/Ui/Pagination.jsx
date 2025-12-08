import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Pagination Component
 * @param {Object} pagination - Pagination metadata from API
 * @param {Function} onPageChange - Callback when page changes
 */
export default function Pagination({ pagination, onPageChange }) {
    if (!pagination || pagination.totalPages <= 1) {
        return null; // Don't show pagination if only one page
    }

    const { currentPage, totalPages, totalItems, hasNextPage, hasPrevPage } = pagination;

    const handlePrevious = () => {
        if (hasPrevPage) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (hasNextPage) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page) => {
        if (page !== currentPage) {
            onPageChange(page);
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show current page with 2 pages on each side
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);

            // Adjust if at the beginning or end
            if (currentPage <= 3) {
                endPage = maxPagesToShow;
            } else if (currentPage >= totalPages - 2) {
                startPage = totalPages - maxPagesToShow + 1;
            }

            // Add first page and ellipsis if needed
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push('...');
            }

            // Add page numbers
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            // Add ellipsis and last page if needed
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
            {/* Mobile view */}
            <div className="flex justify-between flex-1 sm:hidden">
                <button
                    onClick={handlePrevious}
                    disabled={!hasPrevPage}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    disabled={!hasNextPage}
                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>

            {/* Desktop view */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span> ({totalItems} total items)
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {/* Previous button */}
                        <button
                            onClick={handlePrevious}
                            disabled={!hasPrevPage}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Page numbers */}
                        {getPageNumbers().map((page, index) => (
                            page === '...' ? (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => handlePageClick(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                            ? 'z-10 bg-blue-600 border-blue-600 text-white'
                                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}

                        {/* Next button */}
                        <button
                            onClick={handleNext}
                            disabled={!hasNextPage}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
