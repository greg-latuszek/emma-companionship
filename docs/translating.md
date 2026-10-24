# Adding a language

You do not need to write code to translate the app. You copy one text file, translate the sentences in it, and send that one file. Nothing else needs to be registered: every language file in `src/i18n/messages/` is a language. English is the base language: any sentence you leave out is shown in English, so a half-finished translation already works.

The examples use Czech (`cs-CZ`). A language code is always the language and the country in capitals, joined by a hyphen: `cs-CZ`, `sk-SK`, `pl-PL`, `en-GB`, `pt-BR`. The country decides the flag shown in the dropdown, so for a language spoken in several countries pick the one your community is in (`de-AT`, not `de-DE`, for Austria).

## 1. Copy the English file

Copy `src/i18n/messages/en-GB.json` to `src/i18n/messages/cs-CZ.json`. The file name must be the language code in exactly this form; `npm test` fails otherwise.

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

## 3. Check what is still untranslated

Keys that are in English but not in your file still show English text in the app. To list them:

```bash
diff <(jq -r 'keys[]' src/i18n/messages/en-GB.json | sort) \
     <(jq -r 'keys[]' src/i18n/messages/cs-CZ.json | sort)
```

Lines starting with `<` are missing from your file. Lines starting with `>` are keys that do not exist in English (usually a typo in a key).

Then look at your translation in the running app. Start it with `npm run dev` (restart it after adding the file), choose your language in the navbar, and click through every screen you can reach. Do not stop at the first view of a screen:

- open every tab and every page the menus lead to;
- open each form and submit it empty or with a wrong value, to see the error messages;
- try the buttons that ask for confirmation, and look at lists with no entries;
- sort and filter the lists, and use the dropdown choices.

While you do this, look for sentences that are still in English (a line you left out or mistyped), text that does not fit its place (too long, cut off), and `{placeholders}` that show up as numbers or names in the wrong place.

## 4. Send the file

The easiest way needs no git commands: on the repository's GitHub page open `src/i18n/messages`, choose **Add file → Upload files**, drop in your `cs-CZ.json`, and choose **Propose changes**. GitHub opens a pull request; the automatic tests tell you if the file name, a key or a placeholder is wrong, and a developer reviews it.

With git instead:

```bash
git checkout -b add-czech
git add src/i18n/messages/cs-CZ.json
git commit -m "Add a Czech translation"
git push -u origin add-czech
```

and open a pull request from that branch. After it is merged and the app is built again, the language is in the dropdown.

## What is deliberately not translated

- Names of people, e-mail addresses and notes: they are data.
- The values stored in the database (for example `Commited`): only their labels on screen are translated.
- Lists sort by the words the user sees, using the rules of the chosen language. Switching language can therefore reorder a list.

## For developers

New user-visible text goes into `src/i18n/messages/en-GB.json` and `pl-PL.json` under a key that names the meaning, not the wording. The language list is read from the folder when the app is built (`next.config.ts` calls `readLanguageChoices` and passes the list on as `process.env.LANGUAGE_CHOICES`; `vitest.config.ts` does the same for tests), and the texts are loaded with a template-literal `import()` that makes the bundler include every file in the folder. Nothing reads the folder at run time, so a built image does not need the `src/` folder. Client components read it with `useTranslate()`, server components with `currentTranslator()`. Server actions return `messageRef(key, values)` and the UI translates it. See "How texts get translated" in [current-architecture.md](./current-architecture.md).
