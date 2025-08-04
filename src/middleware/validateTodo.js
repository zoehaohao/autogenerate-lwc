const validateTodo = (req, res, next) => {
  const { title } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      error: 'Title is required and must be a non-empty string'
    });
  }

  // Optional description validation
  if (req.body.description !== undefined && 
      (typeof req.body.description !== 'string')) {
    return res.status(400).json({
      error: 'Description must be a string'
    });
  }

  // Optional completed validation
  if (req.body.completed !== undefined && 
      typeof req.body.completed !== 'boolean') {
    return res.status(400).json({
      error: 'Completed must be a boolean'
    });
  }

  next();
};

module.exports = validateTodo;