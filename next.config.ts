import type { NextConfig } from "next";
import { readLanguageChoices } from "./src/i18n/read-language-choices";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.*.*'],
  // Every language file in src/i18n/messages is a language; restart the dev server after adding one.
  env: { LANGUAGE_CHOICES: JSON.stringify(readLanguageChoices()) },
};

export default nextConfig;
