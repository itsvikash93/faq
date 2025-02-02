const axios = require("axios");

const translateText = async (text, targetLang) => {
    try {
        const response = await axios.get(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
                text
            )}`
        );
        return response.data[0][0][0];
    } catch (error) {
        console.error("Translation Error ❌", error);
        return text;
    }
};

module.exports = translateText;
