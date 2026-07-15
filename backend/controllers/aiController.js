const OpenAI = require("openai");
const Service = require("../models/serviceModel");

let client = null;

const getClient = () => {
    if (!process.env.OPENAI_API_KEY) {
        return null;
    }

    if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    return client;
};

const SYSTEM_PROMPT = `You are a triage assistant for Project Contractor, a home-services marketplace.
A client will describe a problem in their home or business. Respond with ONLY a JSON object with two keys:
"explanation": 2-3 plain-language sentences describing what's likely going on and what kind of professional handles it.
"category": a single short trade/category word that best matches the problem (e.g. plumbing, electrical, carpentry, roofing, painting, landscaping, HVAC, general contracting).
Do not recommend specific companies or people — you don't know who is available. Only describe the problem and the category.`;

const askAssistant = async (req, res) => {

    try {

        const { messages } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                message: "messages array is required"
            });
        }

        const openai = getClient();

        if (!openai) {
            return res.status(503).json({
                message: "AI assistant is not configured (missing OPENAI_API_KEY)"
            });
        }

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages
            ]
        });

        const parsed = JSON.parse(completion.choices[0].message.content);
        const matches = await Service.searchServicesByKeyword(parsed.category);

        res.json({
            explanation: parsed.explanation,
            category: parsed.category,
            matches
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error getting AI response"
        });

    }

};


module.exports = {
    askAssistant
};
