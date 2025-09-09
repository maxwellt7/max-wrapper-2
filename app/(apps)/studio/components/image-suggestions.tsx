export type Suggestion = {
  text: string;
  prompt: string;
};

// New set of default suggestions
export const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    text: "Cyberpunk cityscape at night",
    prompt:
      "A sprawling cyberpunk metropolis at night, neon lights reflecting on wet streets, flying vehicles, cinematic lighting, highly detailed.",
  },
  {
    text: "Watercolor painting of a forest stream",
    prompt:
      "Create a serene watercolor painting of a gentle stream flowing through a lush green forest, sunlight filtering through the canopy.",
  },
  {
    text: "Abstract representation of music",
    prompt:
      "Generate an abstract digital artwork representing the feeling of classical music, using flowing lines, vibrant colors, and dynamic shapes.",
  },
  {
    text: "Steampunk inventor's workshop",
    prompt:
      "Illustrate the cluttered workshop of a steampunk inventor, filled with gears, brass contraptions, blueprints, and glowing vials, warm lighting.",
  },
];

// New set of editing suggestions
export const EDITING_SUGGESTIONS: Suggestion[] = [
  {
    text: "Apply a vintage film look",
    prompt:
      "Edit the image to have a vintage film aesthetic, slightly desaturated colors, added grain, and soft focus.",
  },
  {
    text: "Change the season to autumn",
    prompt:
      "Modify the image to depict an autumn scene, changing leaves to orange and red hues, adding fallen leaves on the ground.",
  },
  {
    text: "Make the lighting dramatic, like a thunderstorm",
    prompt:
      "Adjust the lighting to be dark and dramatic, as if a thunderstorm is approaching, with strong contrasts and cool tones.",
  },
  {
    text: "Convert to a black and white sketch",
    prompt:
      "Transform the image into a detailed black and white pencil sketch style.",
  },
];

export function getRandomSuggestions(hasImages: boolean): Suggestion[] {
  const sourceArray = hasImages ? EDITING_SUGGESTIONS : DEFAULT_SUGGESTIONS;
  return [...sourceArray].sort(() => 0.5 - Math.random()).slice(0, 3);
}
