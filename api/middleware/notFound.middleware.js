import { errorHandler } from '../utils/error.js';

export const notFound = (req, res, next) => {
  next(errorHandler(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
