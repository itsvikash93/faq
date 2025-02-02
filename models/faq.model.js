const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    translations: {
        type: Map,
        of: String,
        default: {}
    }
}, { timestamps: true });

const FAQModel = mongoose.model("FAQ", faqSchema);
module.exports = FAQModel;
