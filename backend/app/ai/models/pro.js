module.exports = {
  model: ["gemini-3.1-pro-preview", "gemini-2.5-flash"].includes(process.env.GEMINI_PRO_MODEL)
    ? "gemini-3.6-flash"
    : process.env.GEMINI_PRO_MODEL || "gemini-3.6-flash"
};
