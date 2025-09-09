export interface Suggestion {
  text: string;
  prompt: string;
}

const artStyles = [
  "cinematic 4k photography",
  "digital art",
  "oil painting",
  "studio ghibli",
  "cyberpunk",
  "art nouveau",
  "hyperrealistic",
  "impressionist",
  "pixel art",
  "synthwave",
  "ukiyo-e woodblock print",
  "watercolor illustration",
];

const basePrompts: { text: string; prompt: string }[] = [
  {
    text: "Cosmic Coffee Shop",
    prompt:
      "A cozy coffee shop floating in space, with nebulas swirling outside the windows, barista robot serving alien customers, soft ambient lighting, detailed interior design",
  },
  {
    text: "Forest Spirit",
    prompt:
      "An ethereal forest spirit with glowing butterflies, surrounded by bioluminescent plants, morning mist, rays of sunlight filtering through ancient trees, magical atmosphere",
  },
  {
    text: "Steampunk Library",
    prompt:
      "A vast steampunk library with brass and copper machinery, floating books, spiral staircases, stained glass ceiling, steam-powered automatons organizing shelves",
  },
  {
    text: "Desert Oasis",
    prompt:
      "A hidden desert oasis at twilight, crystal-clear pools reflecting stars, bioluminescent flowers, ancient ruins, palm trees swaying in warm breeze, rich colors",
  },
  {
    text: "Underwater City",
    prompt:
      "A futuristic underwater city protected by glass domes, bioluminescent architecture, schools of colorful fish, coral gardens, submarine transport pods",
  },
  {
    text: "Sky Pirates",
    prompt:
      "Sky pirates on a wooden airship with solar sails, navigating through floating islands, golden sunset clouds, steampunk details, dramatic lighting",
  },
  {
    text: "Crystal Garden",
    prompt:
      "A garden made entirely of crystals and precious gems, rainbow light refractions, crystalline flowers, geometric patterns, iridescent butterflies",
  },
  {
    text: "Time Traveler's Study",
    prompt:
      "A cluttered study of a time traveler, vintage artifacts from different eras, floating holographic displays, antique maps, mysterious gadgets, warm lighting",
  },
  {
    text: "Dragon's Tea Party",
    prompt:
      "A sophisticated dragon hosting a tea party in a cloud palace, fine china, pastries, other mythical creatures as guests, elegant atmosphere",
  },
  {
    text: "Neon Rain",
    prompt:
      "A cyberpunk street scene during neon rain, reflective puddles, holographic advertisements, flying cars, dense urban environment, moody atmosphere",
  },
  {
    text: "Quantum Garden",
    prompt:
      "A garden where quantum physics manifests visually, floating fractals, probability clouds, mirror dimensions, surreal colors, abstract patterns",
  },
  {
    text: "Arctic Research Station",
    prompt:
      "A futuristic research station in the Arctic, northern lights, advanced technology, ice crystals, research vehicles, dramatic landscape",
  },
  {
    text: "Music Forest",
    prompt:
      "A magical forest where plants grow in the shape of musical instruments, sound waves visible in the air, musical notes as butterflies, enchanted atmosphere",
  },
  {
    text: "Mechanical Butterfly",
    prompt:
      "An intricate mechanical butterfly with clockwork wings, brass and copper components, glowing energy core, floating in a Victorian laboratory",
  },
  {
    text: "Dream Library",
    prompt:
      "A library where books come alive, stories floating as ethereal wisps, spiral staircases to nowhere, impossible architecture, magical lighting",
  },
  {
    text: "Space Botanist",
    prompt:
      "A botanist tending to alien plants in a space greenhouse, exotic flora, strange colors, advanced gardening tools, Earth visible through the dome",
  },
  {
    text: "Witch's Kitchen",
    prompt:
      "A modern witch's kitchen with floating ingredients, smart cauldron, spell books on tablets, magical herbs, familiar cat, cozy magical atmosphere",
  },
  {
    text: "Train to Dreams",
    prompt:
      "A mystical train traveling between dreams, surreal landscapes outside windows, impossible physics, dreamy atmosphere, soft ethereal lighting",
  },
  {
    text: "Cloud Lighthouse",
    prompt:
      "A lighthouse perched on a cloud, beaming aurora lights, floating islands, airships in distance, celestial atmosphere, magical evening sky",
  },
  {
    text: "Time Cafe",
    prompt:
      "A cafe where each table exists in a different time period, historical figures having coffee together, temporal anomalies, cozy atmosphere",
  },
];

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomSuggestions(count: number = 3): Suggestion[] {
  const shuffledPrompts = shuffle(basePrompts);
  const shuffledStyles = shuffle(artStyles);

  return shuffledPrompts.slice(0, count).map((item, index) => ({
    text: item.text,
    prompt: `${item.prompt}, ${
      shuffledStyles[index % shuffledStyles.length]
    }, highly detailed, professional lighting, 8k resolution, masterpiece`,
  }));
}
