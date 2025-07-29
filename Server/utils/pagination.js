/**
 * Pagination utility for MongoDB queries
 */

/**
 * Get pagination parameters from request query
 * @param {Object} query - Request query object
 * @returns {Object} Pagination parameters
 */
const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Apply pagination to a MongoDB query
 * @param {Object} mongooseQuery - Mongoose query object
 * @param {Object} paginationParams - Pagination parameters
 * @returns {Object} Query with pagination applied
 */
const applyPagination = (mongooseQuery, paginationParams) => {
  const { limit, skip } = paginationParams;
  return mongooseQuery.limit(limit).skip(skip);
};

/**
 * Get total count for pagination
 * @param {Object} model - Mongoose model
 * @param {Object} filter - Query filter
 * @returns {Promise<number>} Total count
 */
const getTotalCount = async (model, filter = {}) => {
  return await model.countDocuments(filter);
};

/**
 * Create pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
const createPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

/**
 * Execute paginated query
 * @param {Object} model - Mongoose model
 * @param {Object} filter - Query filter
 * @param {Object} options - Query options (sort, populate, select)
 * @param {Object} paginationParams - Pagination parameters
 * @returns {Promise<Object>} Paginated results
 */
const executePaginatedQuery = async (model, filter = {}, options = {}, paginationParams) => {
  const { sort = {}, populate = '', select = '' } = options;
  
  // Get total count
  const total = await getTotalCount(model, filter);
  
  // Build and execute query
  let query = model.find(filter);
  
  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);
  if (Object.keys(sort).length > 0) query = query.sort(sort);
  
  query = applyPagination(query, paginationParams);
  
  const data = await query.exec();
  const pagination = createPaginationMeta(paginationParams.page, paginationParams.limit, total);
  
  return { data, pagination };
};

/**
 * Paginate aggregation pipeline
 * @param {Object} model - Mongoose model
 * @param {Array} pipeline - Aggregation pipeline
 * @param {Object} paginationParams - Pagination parameters
 * @returns {Promise<Object>} Paginated results
 */
const paginateAggregation = async (model, pipeline, paginationParams) => {
  const { page, limit, skip } = paginationParams;
  
  // Create count pipeline
  const countPipeline = [
    ...pipeline,
    { $count: 'total' }
  ];
  
  // Create data pipeline
  const dataPipeline = [
    ...pipeline,
    { $skip: skip },
    { $limit: limit }
  ];
  
  // Execute both pipelines
  const [countResult, data] = await Promise.all([
    model.aggregate(countPipeline),
    model.aggregate(dataPipeline)
  ]);
  
  const total = countResult.length > 0 ? countResult[0].total : 0;
  const pagination = createPaginationMeta(page, limit, total);
  
  return { data, pagination };
};

module.exports = {
  getPaginationParams,
  applyPagination,
  getTotalCount,
  createPaginationMeta,
  executePaginatedQuery,
  paginateAggregation
};
