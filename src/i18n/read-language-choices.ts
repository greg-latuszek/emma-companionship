import fs from 'node:fs';
import path from 'node:path';

/**
 * Build-time only: next.config.ts and vitest.config.ts call this to find the language files.
 * App code never imports it; it reads the result from process.env.LANGUAGE_CHOICES.
 */
export function readLanguageChoices(): { code: string; name: string }[] {
  const folder = path.join(__dirname, 'messages');
  return fs
    .readdirSync(folder)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => fileName.slice(0, -'.json'.length))
    .sort()
    .map((code) => ({
      code,
      name: JSON.parse(fs.readFileSync(path.join(folder, `${code}.json`), 'utf8'))['language.name'] ?? code,
    }));
}
