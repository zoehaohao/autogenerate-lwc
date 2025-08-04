const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const validateTodo = require('../middleware/validateTodo');

// In-memory storage (replace with database in production)
let todos = [];

// GET /todos - Get all todos
router.get('/', (req, res) => {
  res.json(todos);
});

// GET /todos/:id - Get a specific todo
router.get('/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(todo);
});

// POST /todos - Create a new todo
router.post('/', validateTodo, (req, res) => {
  const newTodo = {
    id: uuidv4(),
    title: req.body.title,
    description: req.body.description,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT /todos/:id - Update a todo
router.put('/:id', validateTodo, (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todos[index] = {
    ...todos[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(todos[index]);
});

// DELETE /todos/:id - Delete a todo
router.delete('/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  todos.splice(index, 1);
  res.status(204).send();
});

module.exports = router;