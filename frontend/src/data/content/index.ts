import { ContentMap, SupportedLanguages } from './types';
import { portugueseContent } from './pt';
import { englishContent } from './en';
import { germanContent } from './de';
import './_validate';

export const content: ContentMap = {
  "Português": portugueseContent,
  "English": englishContent,
  "Deutsch": germanContent
};

export const getContent = (language: SupportedLanguages) => {
  return content[language] || content["Português"];
};

export * from './types';