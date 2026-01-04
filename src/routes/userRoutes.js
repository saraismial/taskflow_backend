const router = require("express").Router();
const auth = require('../middlewares/auth');
const { updateUser, changePassword, deleteUser } = require("../controllers/userController");

router.patch("/me", auth, updateUser);
router.patch("/me/password", auth, changePassword);
router.delete("/me", auth, deleteUser);

module.exports = router;