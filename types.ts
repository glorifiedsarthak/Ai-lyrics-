
export enum Genre {
  POP = 'Pop',
  ROCK = 'Rock',
  HIP_HOP = 'Hip-Hop',
  COUNTRY = 'Country',
  R_AND_B = 'R&B',
  METAL = 'Metal',
  INDIE = 'Indie',
  JAZZ = 'Jazz',
  FOLK = 'Folk'
}

export enum Mood {
  HAPPY = 'Happy',
  SAD = 'Sad',
  ANGRY = 'Angry',
  ROMANTIC = 'Romantic',
  MELANCHOLIC = 'Melancholic',
  ENERGETIC = 'Energetic',
  NOSTALGIC = 'Nostalgic',
  REBELLIOUS = 'Rebellious'
}

export interface LyricSection {
  type: 'Verse' | 'Chorus' | 'Bridge' | 'Outro' | 'Intro';
  lines: string[];
}

export interface SongLyrics {
  title: string;
  artistStyle?: string;
  sections: LyricSection[];
}

export interface GeneratorParams {
  topic: string;
  genre: Genre;
  mood: Mood;
  keywords: string[];
}
