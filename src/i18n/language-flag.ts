const regionalIndicatorA = 0x1f1e6;

/** A language code is `<language>-<COUNTRY>`, for example `cs-CZ`. */
export function isLanguageCode(code: string): boolean {
  return /^[a-z]{2,3}-[A-Z]{2}$/.test(code);
}

/** The flag emoji is the ISO 3166-1 country code written in regional indicator letters. */
export function flagOfLanguage(code: string): string {
  if (!isLanguageCode(code)) {
    return '';
  }

  const country = code.slice(code.indexOf('-') + 1);
  return String.fromCodePoint(
    ...[...country].map((letter) => regionalIndicatorA + letter.charCodeAt(0) - 'A'.charCodeAt(0))
  );
}
