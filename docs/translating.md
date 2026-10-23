# Adding a language

You do not need to write code to translate the app. You copy one text file, translate the sentences in it, and register the language in two places. English is the base language: any sentence you leave out is shown in English, so a half-finished translation already works.

The examples use Czech (`cs`). Use the two-letter code of your language instead.

## 1. Copy the English file

Copy `src/i18n/messages/en.json` to `src/i18n/messages/cs.json`.

## 2. Translate the values

Each line is `"key": "sentence"`. Translate only the sentence on the right.

```json
"panel.welcome": "Welcome, Companionship Delegate",
```

becomes

```json
"panel.welcome": "Vítejte, delegáte pro doprovázení",
```

Rules:

- **Never change the key** (the left side).
- **Keep placeholders exactly as they are.** `{count}`, `{name}`, `{date}` and `{field}` are filled in by the app. Move them to where your language needs them, but do not translate or remove them.
  `"Missing companionships: {count}"` can become `"Chybějící doprovázení: {count}"`.
- **Keep each sentence whole.** Some languages need a different word order or word form; that is why sentences are never built from pieces.
- **Use the canonical domain terms** from `docs/application_idea.md` (Companionship, Accompanied, Companion). Agree one translation for each with your community and use it everywhere.
- Delete a line if you are not ready to translate it. The English sentence will show instead.
- The file must stay valid JSON: every line ends with a comma except the last one, and a `"` inside a sentence is written `\"`.

## 3. Register the language

Two small edits.

In `src/i18n/locales.ts`, add the code to `locales` and a flag and name to `languageChoices`:

```ts
export const locales = ['en', 'pl', 'cs'] as const;
...
  cs: { flag: '🇨🇿', name: 'Čeština' },
```

In `src/i18n/messages.ts`, import the file and add it to `translations`:

```ts
import cs from './messages/cs.json';
...
const translations: Record<Locale, Partial<Messages>> = { en, pl, cs };
```

The language now appears in the dropdown in the navbar. The choice is remembered in a cookie.

## 4. Check what is still untranslated

Keys that are in English but not in your file still show English text in the app. To list them:

```bash
diff <(jq -r 'keys[]' src/i18n/messages/en.json | sort) \
     <(jq -r 'keys[]' src/i18n/messages/cs.json | sort)
```

Lines starting with `<` are missing from your file. Lines starting with `>` are keys that do not exist in English (usually a typo in a key).

Then run the app (`npm run dev`), choose your language in the navbar, and walk through the screens: landing page, panel, Companionships (all five tabs), Community members (all four tabs), and the sign-in error page.

## What is deliberately not translated

- Names of people, e-mail addresses and notes: they are data.
- The values stored in the database (for example `Commited`): only their labels on screen are translated.
- Lists sort by the words the user sees, using the rules of the chosen language. Switching language can therefore reorder a list.

## For developers

New user-visible text goes into `src/i18n/messages/en.json` and `pl.json` under a key that names the meaning, not the wording. Client components read it with `useTranslate()`, server components with `currentTranslator()`. Server actions return `messageRef(key, values)` and the UI translates it. See "How texts get translated" in [current-architecture.md](./current-architecture.md).
