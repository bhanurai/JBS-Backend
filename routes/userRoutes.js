// import
const router = require("express").Router();
const userController = require("../controllers/userControllers");
const { authGuard } = require("../middleware/authGuard");

// register api
router.post("/create", userController.createUser);

//login api
router.post("/login", userController.loginUser);

//forget  pw api
router.post("/resetpassword", userController.resetPassword);
router.post("/resetcode", userController.verifyResetCode);
router.post("/updatepassword", userController.updatePassword);

//profile
router.get("/profile", userController.getUserProfile);
router.put("/update_profile/:id", authGuard, userController.updateUserProfile);

// exporting
module.exports = router;
