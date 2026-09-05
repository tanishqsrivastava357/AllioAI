module.exports = {
  model: process.env.GEMINI_REASONING_MODEL === "gemini-3.1-pro-preview"
    ? "gemini-2.5-flash"
    : process.env.GEMINI_REASONING_MODEL || "gemini-2.5-flash"
};
