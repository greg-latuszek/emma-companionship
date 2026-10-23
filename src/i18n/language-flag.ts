import type { Locale } from './locales';

const regionalIndicatorA = 0x1f1e6;

/** English has no single home country; the app has always shown the British flag. */
const regionOfLanguagesWithoutLikelyRegion: Record<Locale, string> = { en: 'GB' };

function likelyRegionOf(code: Locale): string | undefined {
  try {
    return new Intl.Locale(code).maximize().region;
  } catch {
    return undefined;
  }
}

/** The flag emoji is the ISO 3166-1 country code written in regional indicator letters. */
export function flagOfLanguage(code: Locale): string {
  const region = regionOfLanguagesWithoutLikelyRegion[code] ?? likelyRegionOf(code);
  if (!region || !/^[A-Z]{2}$/.test(region)) {
    return '';
  }

  return String.fromCodePoint(
    ...[...region].map((letter) => regionalIndicatorA + letter.charCodeAt(0) - 'A'.charCodeAt(0))
  );
}
