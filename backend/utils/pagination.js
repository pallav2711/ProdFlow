const parsePagination = (query = {}) => {
  const hasPage = query.page !== undefined;
  const hasLimit = query.limit !== undefined;

  // Preserve existing behavior unless client opts in.
  if (!hasPage && !hasLimit) {
    return null;
  }

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const requestedLimit = parseInt(query.limit, 10) || 20;
  const limit = Math.min(Math.max(requestedLimit, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

module.exports = {
  parsePagination
};
