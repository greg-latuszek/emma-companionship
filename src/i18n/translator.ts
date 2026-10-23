import type en from './messages/en.json';

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
export type MessageRef = { key: MessageKey; values?: MessageValues };
export type MessageValues = Record<string, string | number | MessageRef>;
export type Translate = (
  key: MessageKey | MessageRef,
  values?: MessageValues
) => string;

export function messageRef(key: MessageKey, values?: MessageValues): MessageRef {
  return values ? { key, values } : { key };
}

export function mergeOverEnglish(
  english: Messages,
  translated: Partial<Messages>
): Messages {
  const merged = { ...english };
  for (const key of Object.keys(english) as MessageKey[]) {
    const text = translated[key];
    if (text) {
      merged[key] = text;
    }
  }
  return merged;
}

export function createTranslator(messages: Messages): Translate {
  const translate: Translate = (keyOrRef, ownValues) => {
    const key = typeof keyOrRef === 'string' ? keyOrRef : keyOrRef.key;
    const values =
      ownValues ?? (typeof keyOrRef === 'string' ? undefined : keyOrRef.values);
    const text = messages[key] ?? key;
    if (!values) {
      return text;
    }
    return text.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
      if (!(name in values)) {
        return placeholder;
      }
      const value = values[name];
      return typeof value === 'object' ? translate(value) : String(value);
    });
  };
  return translate;
}
