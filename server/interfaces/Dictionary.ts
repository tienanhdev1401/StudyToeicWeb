
export interface Phonetic {
  text: string;
  audio?: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

export interface RawDictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  origin?: string;
  meanings: Meaning[];
}

// Đây là interface cho dữ liệu đã được chuyển đổi
export interface DictionaryEntry {
  word: string;
  pronunciation: {
    text: string;
    audioUrl?: string;
  };
  origin?: string;
  meanings: {
    partOfSpeech: string;
    definitions: Array<{
      text: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }>;
  }[];
}

// Interface cho Dictionary Service
export interface DictionaryService {
  lookup(word: string): Promise<DictionaryEntry | null>;
}