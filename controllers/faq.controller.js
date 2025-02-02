const FAQModel = require("../models/faq.model");
const translateText = require("../utils/translate");
const redisClient = require("../config/redis");

// Create FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    // Create new FAQ
    const newFAQ = new FAQModel({ question, answer });
    await newFAQ.save();

    // Invalidate cache for all stored languages
    const keys = await redisClient.keys("faqs_*"); // Get all FAQ-related cache keys
    if (keys.length > 0) {
      await redisClient.del(keys); // Delete all matching keys
    }

    res.status(201).json({ message: "FAQ created successfully", data: newFAQ });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// Get FAQs with Language Support & Caching
exports.getFAQs = async (req, res) => {
  try {
    const lang = req.query.lang || "en"; // User-selected language
    const cacheKey = `faqs_${lang}`; // Dynamic cache key based on language

    // Check if translation exists in Redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("♻️ Serving from Redis Cache");
      return res.status(200).json({ message: "Data served from cache", data: JSON.parse(cachedData) });
    }

    // Fetch all FAQs from MongoDB
    const faqs = await FAQModel.find();

    // Translate question & answer if language is not English
    let translatedFaqs = [];
    if (lang !== "en") {
      translatedFaqs = await Promise.all(
        faqs.map(async (faq) => {
          const translatedQuestion = faq.translations[lang] || await translateText(faq.question, lang);
          const translatedAnswer = faq.translations[lang] || await translateText(faq.answer, lang);
          return { question: translatedQuestion, answer: translatedAnswer, _id: faq._id };
        })
      );
    } else {
      translatedFaqs = faqs.map(faq => ({ question: faq.question, answer: faq.answer, _id: faq._id }));
    }

    // Store translated data in Redis Cache (Expire in 1 hour)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(translatedFaqs));

    res.status(200).json({ message: "Data served from database", data: translatedFaqs });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


// Update FAQ

exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    // Update FAQ in DB
    const updatedFAQ = await FAQModel.findByIdAndUpdate(id, { question, answer }, { new: true });

    // Invalidate cache for all stored languages
    const keys = await redisClient.keys("faqs_*");
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    res.status(200).json({ message: "FAQ updated successfully", data: updatedFAQ });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete FAQ from DB
    await FAQModel.findByIdAndDelete(id);

    // Invalidate cache for all stored languages
    const keys = await redisClient.keys("faqs_*");
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
