const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

// POST /tasks
const createTask = catchAsync(async (req, res) => {
  const { title, description, status, priority, dueDate, assignee } = req.body;

  if (!title) throw new AppError("Title is required", 400, "MISSING_TITLE");

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    assignee: assignee || null,
    createdBy: req.user._id,
  });

  const populatedTask = await task.populate(
    "createdBy",
    "name email role"
  );

  res.status(201).json(populatedTask);
});

// GET /tasks
const getTasks = catchAsync(async (req, res) => {
  let query;

  if (req.user.role === "admin") {
    query = {};
  } else {
    query = {
      $or: [{ assignee: req.user._id }, { createdBy: req.user._id }],
    };
  }

  const tasks = await Task.find(query)
    .populate("assignee", "name email role")
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  res.json(tasks);
});

// GET /tasks/:id
const getTaskById = catchAsync(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignee", "email role")
    .populate("createdBy", "email role");

  if (!task) throw new AppError("Task not found", 404, "TASK_NOT_FOUND");

  // If not admin, make sure they are creator or assignee
  if (
    req.user.role !== "admin" &&
    task.assignee?.toString() !== req.user._id.toString() &&
    task.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  res.json(task);
});

// PATCH /tasks/:id
const updateTask = catchAsync(async (req, res) => {
  const { createdBy, _id, ...updates } = req.body;

  let task = await Task.findById(req.params.id);

  if (!task) throw new AppError("Task not found", 404, "TASK_NOT_FOUND");

  if (
    req.user.role !== "admin" &&
    task.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  Object.assign(task, updates);
  await task.save();

  task = await task.populate([
    { path: "assignee", select: "email role" },
    { path: "createdBy", select: "email role" },
  ]);

  res.json(task);
});

// DELETE /tasks/:id
const deleteTask = catchAsync(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) throw new AppError("Task not found", 404, "TASK_NOT_FOUND");

  if (
    req.user.role !== "admin" &&
    task.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }

  await task.deleteOne();

  res.json({ message: "Task deleted" });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
