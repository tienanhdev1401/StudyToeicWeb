// dictionaryAdapter.ts
import { RawDictionaryEntry, DictionaryEntry } from '../interfaces/Dictionary';

export class DictionaryAdapter {
  static adapt(rawEntries: RawDictionaryEntry[]): DictionaryEntry | null {
    if (!rawEntries || rawEntries.length === 0) {
      return null;
    }

    const entry = rawEntries[0];
    
    // Tìm phonetic đầu tiên có audio
    const phoneticWithAudio = entry.phonetics.find(p => p.audio);
     
    return {
      word: entry.word,
      pronunciation: {
        text: entry.phonetic || (entry.phonetics[0]?.text || ''),
        audioUrl: phoneticWithAudio?.audio
      },
      origin: entry.origin,
      meanings: entry.meanings.map(meaning => ({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions.map(def => ({
          text: def.definition,
          example: def.example,
          synonyms: def.synonyms,
          antonyms: def.antonyms
        }))
      }))
    };
  }
}