function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: true,
    message: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}

module.exports = errorHandler;
