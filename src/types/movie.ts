
export interface Movie {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  year: number;
  rating: number;
  genres: string[];
  director: string;
  modelUrl?: string; // 3D model URL if applicable
  popularity: number; // 0-100 scale
  mood: string[]; // e.g., "happy", "dark", "thoughtful", etc.
  duration: number; // in minutes
}

export interface UserPreferences {
  genres: string[];
  era: string; // e.g., "classic", "modern", "recent"
  mood: string; // e.g., "happy", "thoughtful", "exciting"
}
