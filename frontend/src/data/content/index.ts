import { ContentMap, SupportedLanguages } from './types';
import { portugueseContent } from './pt';
import { englishContent } from './en';

export const content: ContentMap = {
  "Português": portugueseContent,
  "English": englishContent
};

export const getContent = (language: SupportedLanguages) => {
  return content[language] || content["Português"];
};

export * from './types';