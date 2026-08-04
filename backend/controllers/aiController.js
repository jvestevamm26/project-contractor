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
A client describes a problem in their home or business, and may attach a photo of it. Respond with ONLY a JSON object.

If a photo is attached, look at it carefully — it often makes the trade obvious and can let
you skip straight to a confident answer instead of asking a question. If the photo doesn't
show enough (wrong angle, too far away, the issue isn't visible), you may still ask ONE
clarifying question, and it's fine to ask the client to describe or re-upload a clearer photo.

SAFETY FIRST, above every other rule in this prompt: if the description involves a gas smell,
active flooding, exposed/sparking wiring, fire, smoke, or anything else immediately dangerous,
you MUST answer right away with needs_more_info: false and lead the explanation with the safety
warning — never ask a clarifying question in a dangerous situation, even if the trade is unclear.

For everything else (non-dangerous), default to asking, not guessing. Before answering, check: could a reasonable person read
this description and think of TWO OR MORE different trades that might fix it (e.g. plumber
vs electrician, HVAC vs electrician, carpenter vs general contractor)? If yes, that counts
as NOT confident, even if you could technically make a plausible guess — ask instead. Only
skip asking when the trade is genuinely obvious (e.g. "my toilet won't stop running" is
clearly plumbing). When in doubt, ask. Respond with:
{ "needs_more_info": true, "question": "<one short clarifying question>" }

You may ask up to 3 clarifying questions total across the whole conversation, one at a time.
Stop asking once you're confident, or once you've already asked 3 — after that, make your
best guess instead of asking a 4th. Respond with:
{
  "needs_more_info": false,
  "explanation": "<what's likely wrong, ONE sentence>",
  "category": "<single short trade word, e.g. plumbing, electrical, carpentry, roofing, painting, landscaping, HVAC, general contracting>",
  "suggestions": "<ONE quick, safe thing the client can check or do before a contractor arrives>"
}

Hard rules:
- Every text field (question, explanation, suggestions) is ONE sentence, under 15 words. This is strict — short like a text message, not an email. No lists, no multiple sentences.
- Never recommend specific companies or people — you don't know who is available.
- If something sounds dangerous (gas smell, active flooding, exposed wiring, fire risk), say so plainly in that one-sentence explanation and prioritize safety over the question step.`;

const isValidContent = (content) => {
    if (typeof content === "string") {
        return content.trim().length > 0;
    }

    if (Array.isArray(content)) {
        return content.length > 0 && content.every((part) => part && typeof part === "object" && typeof part.type === "string");
    }

    return false;
};


const sanitizeMessages = (messages) => {
    if (!Array.isArray(messages) || messages.length === 0) {
        return null;
    }

    const sanitized = [];

    for (const message of messages) {
        if (!message || !isValidContent(message.content)) {
            return null;
        }

        sanitized.push({
            role: message.role === "assistant" ? "assistant" : "user",
            content: message.content
        });
    }

    return sanitized;
};


const askAssistant = async (req, res) => {

    try {

        const messages = sanitizeMessages(req.body.messages);

        if (!messages) {
            return res.status(400).json({
                message: "messages array is required, and every message needs non-empty content"
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

        if (parsed.needs_more_info) {
            return res.json({
                needs_more_info: true,
                question: parsed.question
            });
        }

        const matches = await Service.searchServicesByKeyword(parsed.category);

        res.json({
            needs_more_info: false,
            explanation: parsed.explanation,
            category: parsed.category,
            suggestions: parsed.suggestions,
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
