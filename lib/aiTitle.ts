// AI Title Generator for Sivaa Studio portfolio images
export const CATEGORY_TITLES: Record<string, string[]> = {
  baby: [
    "Sweet Slumber",
    "Little Wonder",
    "Tiny Footprints",
    "Pure Innocence",
    "Gentle Dreams",
    "Tender Cherish",
    "Cradle of Love",
    "Golden Sunshine",
    "Angelic Grace",
    "Little Miracle",
    "First Smiles",
    "Soft Whispers",
    "Precious Soul",
    "A New Dawn",
    "Heart of Joy",
    "Innocent Gaze",
    "Warm Embrace",
    "Chasing Dreams",
    "Tiny Treasure",
    "Seraphic Light",
  ],
  wedding: [
    "Sacred Vows",
    "Royal Entrance",
    "Holy Union",
    "Bridal Splendor",
    "Ceremonial Joy",
    "Traditional Elegance",
    "Temple Blessings",
    "Everlasting Story",
    "Grand Celebration",
    "Pure Emotion",
    "Graceful Twirl",
    "Soulful Union",
    "The Sacred Walk",
    "Golden Garland",
    "Eternal Promise",
    "Ritual of Love",
    "Divine Blessings",
    "Radiant Togetherness",
    "Glimpse of Eternity",
    "Regal Union",
  ],
  "pre-wedding": [
    "Sunlit Romance",
    "Together in Bliss",
    "Whispering Winds",
    "Eternal Bond",
    "Enchanted Moments",
    "Golden Hour Reverie",
    "Prelude to Forever",
    "In Your Arms",
    "Chasing Horizons",
    "Symphony of Hearts",
    "Echoes of Love",
    "Timeless Devotion",
    "Starlit Promise",
    "By Your Side",
    "Sunset Waltz",
    "Serenade of Two",
  ],
  engagement: [
    "Golden Promise",
    "Ring Ceremony",
    "The Beautiful Beginning",
    "Two Souls, One Path",
    "Unspoken Vows",
    "Gaze of Forever",
    "Hand in Hand",
    "Spark of Eternity",
    "A New Chapter",
    "Soulful Promise",
    "A Promise Sealed",
    "Tokens of Love",
  ],
  maternity: [
    "A Mother's Grace",
    "Glow of New Life",
    "Radiant Bloom",
    "Sacred Anticipation",
    "Embrace of Love",
    "Divine Motherhood",
    "Miracle Within",
    "Tender Expectation",
    "Serene Radiance",
    "Whispers of Life",
    "Cradle of Hope",
    "The Sacred Journey",
  ],
  sreemantham: [
    "Divine Blessings",
    "Sacred Rituals",
    "A Mother's Celebration",
    "Tradition & Grace",
    "Bangles of Joy",
    "Ancestral Blessings",
    "Auspicious Glow",
    "Heritage of Love",
    "Sanctified Moments",
    "Bounty of Blessings",
  ],
  modeling: [
    "Editorial Aura",
    "High Fashion Allure",
    "Vogue Silhouette",
    "Striking Elegance",
    "Luminous Poise",
    "Chic Noir",
    "Dramatic Shadows",
    "The Art of Expression",
    "Refined Essence",
    "Modern Silhouette",
  ],
  fashion: [
    "Couture Symphony",
    "Velvet Allure",
    "Runway Grace",
    "Modern Icon",
    "Fashion In Motion",
    "Timeless Chic",
    "Haute Elegance",
    "Artistic Silhouette",
    "Draped in Elegance",
  ],
  default: [
    "Luminous Moments",
    "Unforgettable Joy",
    "Golden Hour",
    "Timeless Frame",
    "Essence of Beauty",
    "Grandeur in Motion",
    "The Living Canvas",
    "Radiant Story",
    "Pure Expression",
    "Captivating Light",
  ],
};

function getCategoryKey(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes("baby")) return "baby";
  if (c.includes("pre-wedding") || c.includes("prewedding")) return "pre-wedding";
  if (c.includes("wedding")) return "wedding";
  if (c.includes("maternity")) return "maternity";
  if (c.includes("engagement")) return "engagement";
  if (c.includes("sreemantham")) return "sreemantham";
  if (c.includes("model")) return "modeling";
  if (c.includes("fashion")) return "fashion";
  return "default";
}

export function generateAiTitle(
  category: string,
  fileName?: string,
  isTall?: boolean,
  randomSeed?: boolean
): string {
  const key = getCategoryKey(category);
  const titles = CATEGORY_TITLES[key] || CATEGORY_TITLES.default;

  // If filename contains identifiable words (e.g. smile, sunset, couple), check for match
  if (fileName && !randomSeed) {
    const cleanName = fileName.toLowerCase().replace(/\.[^/.]+$/, "");
    for (const title of titles) {
      const words = title.toLowerCase().split(/\s+/);
      if (words.some((w) => w.length > 3 && cleanName.includes(w))) {
        return title;
      }
    }
  }

  // If orientation is known, favor vertical/portrait or landscape hints
  if (isTall) {
    const portraitTitles = titles.filter((t) =>
      /grace|poise|gaze|aura|bloom|soul|wonder|slumber/i.test(t)
    );
    if (portraitTitles.length > 0 && Math.random() > 0.3) {
      const idx = Math.floor(Math.random() * portraitTitles.length);
      return portraitTitles[idx];
    }
  }

  const idx = Math.floor(Math.random() * titles.length);
  return titles[idx];
}
