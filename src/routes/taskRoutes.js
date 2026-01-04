const router = require("express").Router();
const auth = require('../middlewares/auth');
const {
    createTask, 
    getTasks, 
    getTaskById, 
    updateTask, 
    deleteTask
} = require('../controllers/taskController');

// All routes below will require authorization
router.use(auth); 

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;