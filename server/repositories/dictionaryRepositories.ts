// dictionaryRepositories.ts
import { DictionaryService, DictionaryEntry, RawDictionaryEntry } from '../interfaces/Dictionary';
import { DictionaryAdapter } from '../adapter/dictionaryAdapter';

export class DictionaryRepositories implements DictionaryService {
  private readonly baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';

  async lookup(word: string): Promise<DictionaryEntry | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(word.trim())}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Từ không tìm thấy
        }
        throw new Error(`Dictionary API error: ${response.status}`);
      }
      
      const data = await response.json() as RawDictionaryEntry[];
      return DictionaryAdapter.adapt(data);
    } catch (error) {
      console.error('Dictionary lookup error:', error);
      throw error;
    }
  }
}