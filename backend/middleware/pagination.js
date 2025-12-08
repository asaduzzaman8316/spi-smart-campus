/**
 * Pagination middleware
 * Parses pagination parameters from query string and adds to req object
 */
const paginate = (req, res, next) => {
    // Parse page and limit from query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Ensure valid values
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
    
    // Calculate skip value
    const skip = (validPage - 1) * validLimit;
    
    // Attach to request object
    req.pagination = {
        page: validPage,
        limit: validLimit,
        skip: skip
    };
    
    next();
};

/**
 * Helper function to create paginated response
 * @param {Array} data - Array of documents
 * @param {Number} total - Total count of documents
 * @param {Object} pagination - Pagination object from req.pagination
 * @returns {Object} Paginated response object
 */
const createPaginatedResponse = (data, total, pagination) => {
    const { page, limit } = pagination;
    const totalPages = Math.ceil(total / limit);
    
    return {
        success: true,
        data: data,
        pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

module.exports = {
    paginate,
    createPaginatedResponse
};
