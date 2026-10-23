import en from './messages/en.json';
import pl from './messages/pl.json';
import { createTranslator, mergeOverEnglish } from './translator';

/** Lists are sorted by the Polish label whatever language the screen shows. */
export const translateInPolish = createTranslator(mergeOverEnglish(en, pl));
