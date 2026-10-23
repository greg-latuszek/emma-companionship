import type en from './messages/en.json';

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
export type MessageValues = Record<string, string | number>;
export type Translate = (key: MessageKey, values?: MessageValues) => string;

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
  return (key, values) => {
    const text = messages[key] ?? key;
    if (!values) {
      return text;
    }
    return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
      name in values ? String(values[name]) : placeholder
    );
  };
}
