const Task = require('../models/Task');

// POST /tasks
async function createTask(req, res, next) {
    try {
        const { title, description, status, priority, dueDate, assignee } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const task = await Task.create({
            title, 
            description, 
            status, 
            priority, 
            dueDate, 
            assignee: assignee || null,
            createdBy: req.user._id,
        });

        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
}

// GET /tasks
async function getTasks(req, res, next) {
    try {
        let query;

        if (req.user.role === 'admin') {
            query = {};
        } else {
            query = {
                $or: [{ assignee: req.user._id }, { createdBy: req.user._id }],
            };
        }

        const tasks = await Task.find(query)
            .populate('assignee', 'email role')
            .populate('createdBy', 'email role')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (err) {
        next(err);
    }
}

// GET /tasks/:id
async function getTaskById(req, res, next) {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignee', 'email role')
            .populate('createdBy', 'email role');
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        // If not admin, make sure they are creator or assignee
        if (
            req.user.role !== 'admin' &&
            task.assignee?.toString() !== req.user._id.toString() &&
            task.createdBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.json(task);
    } catch (err) {
        next(err);
    }
}

// PATCH /tasks/:id 
async function updateTask(req, res, next) {
    try {
        const updates = req.body;

        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (
            req.user.role !== 'admin' && 
            task.createdBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        Object.assign(task, updates);
        await task.save();

        task = await task 
            .populate('assignee', 'email role')
            .populate('createdBy', 'email role');

        res.json(task);
    } catch (err) {
        next(err);
    }
}

// DELETE /tasks/:id
async function deleteTask(req, res, next) {
    try {
        const task = await Task.findById(req.params.id);

        if(!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (
            req.user.role !== 'admin' &&
            task.createdBy.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await task.deleteOne();

        res.json({ message: 'Task deleted' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createTask, 
    getTasks, 
    getTaskById, 
    updateTask, 
    deleteTask
}