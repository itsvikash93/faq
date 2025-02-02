const express = require("express");
const { createFAQ, getFAQs, deleteFAQ, updateFAQ } = require("../controllers/faq.controller");

const router = express.Router();

router.post("/faqs", createFAQ);
router.get("/faqs", getFAQs);
router.put("/faqs/:id", updateFAQ);
router.delete("/faqs/:id", deleteFAQ);

module.exports = router;
