const express = require("express");
const router = express.Router();
const {
  getStats,
  getAllUsers,
  approveTutor,
  updateUserRole,
  deleteUser,
  getAllQuestions,
  getAllAnswers,
  getAllPayments,
} = require("../controllers/adminController");
const protect = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

router.use(protect);
router.use(roleCheck("admin"));


router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.put("/tutors/:id/approve", approveTutor);
router.get("/questions", getAllQuestions);
router.get("/answers", getAllAnswers);
router.get("/payments", getAllPayments);

module.exports = router;
