/**
 * Reusable query builder mimicking a lightweight "APIFeatures" pattern.
 * Wraps a Mongoose Query so controllers can chain filter/search/sort/paginate
 * without duplicating the same parsing logic in every controller.
 *
 * Usage:
 *   const features = new APIFeatures(Hackathon.find(), req.query)
 *     .filter()
 *     .search(["title", "tagline"])
 *     .sort()
 *     .paginate();
 *   const results = await features.query;
 *   const meta = await features.getPaginationMeta(Hackathon);
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Handles equality/range filters, e.g. ?status=published&prizePool[gte]=1000
  filter() {
    const excludedFields = ["page", "sort", "limit", "fields", "search", "keyword"];
    const queryObj = { ...this.queryString };
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne|in)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Full-text search across the given fields using $text (requires a text index)
  // or a case-insensitive regex fallback across multiple fields.
  search(fields = []) {
    const term = this.queryString.search || this.queryString.keyword;
    if (term && fields.length) {
      const regex = new RegExp(term, "i");
      this.query = this.query.find({
        $or: fields.map((field) => ({ [field]: regex })),
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }

  // Runs a count on the model with the same filter/search criteria to build pagination metadata.
  async getPaginationMeta(Model, baseFilter = {}) {
    const total = await Model.countDocuments(baseFilter);
    const { page = 1, limit = 12 } = this.pagination || {};
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }
}

module.exports = APIFeatures;
