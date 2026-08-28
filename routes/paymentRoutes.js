const express = require("express");
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/client-token", paymentController.getClientToken);
router.post("/checkout", paymentController.checkout);

module.exports = router;
