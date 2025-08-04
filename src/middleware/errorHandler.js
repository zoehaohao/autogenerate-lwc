const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error'
  });
};

module.exports = errorHandler;