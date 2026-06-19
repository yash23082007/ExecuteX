// server/services/aiService.js
// AI service — talks to Gemini REST API (no SDK needed)

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Check if the AI service is available (API key is configured).
 */
function isAvailable() {
  return GEMINI_API_KEY.length > 0;
}

/**
 * Generate an inline code completion (ghost-text autocomplete).
 *
 * @param {string} language - The programming language (e.g. "python").
 * @param {string} prefix   - Code before the cursor.
 * @param {string} suffix   - Code after the cursor.
 * @returns {{ completion: string }} The raw code completion.
 */
async function generateCompletion(language, prefix, suffix) {
  const systemPrompt = [
    `You are a code autocomplete engine for ${language}.`,
    "Output ONLY the raw code that should be inserted at the cursor position.",
    "Do NOT include any explanations, comments, markdown fences, or formatting.",
    "Do NOT repeat any of the prefix or suffix code.",
    "Output only the missing code fragment. If nothing should be inserted, output an empty string.",
  ].join(" ");

  const userPrompt = [
    "Complete the code at the cursor position marked by <CURSOR>.",
    "",
    "```",
    prefix + "<CURSOR>" + suffix,
    "```",
  ].join("\n");

  const body = {
    contents: [
      { role: "user", parts: [{ text: userPrompt }] },
    ],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      maxOutputTokens: 150,
      temperature: 0.15,
      topP: 0.9,
      stopSequences: ["\n\n\n"], // stop on triple newline
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.error("[AI] Gemini completion error:", res.status, errText);
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip accidental markdown fences the model might wrap
    const cleaned = text
      .replace(/^```[\w]*\n?/gm, "")
      .replace(/```$/gm, "")
      .trimEnd();

    return { completion: cleaned };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Generate an AI code review with structured suggestions.
 *
 * @param {string} language - The programming language.
 * @param {string} code     - The full code buffer.
 * @returns {{ suggestions: Array<{ line: number, title: string, detail: string, severity: string }> }}
 */
async function generateReview(language, code) {
  const systemPrompt = [
    `You are a senior code reviewer for ${language}.`,
    "Analyze the code and return a JSON array of suggestions.",
    "Each suggestion must have: line (number), title (short string), detail (explanation string), severity (one of: bug, warning, improvement).",
    "Return ONLY a valid JSON array. No markdown fences. No explanations outside the array.",
    "If the code is perfect, return an empty array: []",
    "Maximum 5 suggestions. Focus on the most impactful issues first.",
  ].join(" ");

  const body = {
    contents: [
      { role: "user", parts: [{ text: code }] },
    ],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.3,
      topP: 0.9,
      responseMimeType: "application/json",
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.error("[AI] Gemini review error:", res.status, errText);
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Parse the JSON response, with a safe fallback
    let suggestions;
    try {
      // Strip potential markdown fences before parsing
      const cleaned = text
        .replace(/^```json?\n?/gm, "")
        .replace(/```$/gm, "")
        .trim();
      suggestions = JSON.parse(cleaned);
    } catch {
      console.warn("[AI] Failed to parse review JSON, raw:", text);
      suggestions = [];
    }

    // Validate each suggestion has the required shape
    if (!Array.isArray(suggestions)) suggestions = [];
    suggestions = suggestions
      .filter((s) => s && typeof s.line === "number" && typeof s.title === "string")
      .slice(0, 5)
      .map((s) => ({
        line: s.line,
        title: s.title,
        detail: s.detail || "",
        severity: ["bug", "warning", "improvement"].includes(s.severity) ? s.severity : "improvement",
      }));

    return { suggestions };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

module.exports = { isAvailable, generateCompletion, generateReview };
