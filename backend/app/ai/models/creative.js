module.exports = {
  model: process.env.OPENROUTER_CREATIVE_MODEL || "anthropic/claude-sonnet-4",
  imageModel: process.env.OPENROUTER_IMAGE_MODEL || "google/gemini-2.5-flash-image-preview"
};
