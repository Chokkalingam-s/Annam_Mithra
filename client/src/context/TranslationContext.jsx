import React, { createContext, useState, useEffect } from "react";

export const TranslationContext = createContext();

const GOOGLE_API_KEY = "AIzaSyAvrfyVFVzwABfkZZe9E1_2dpXSDmzvch8"; // store safely (env file)

const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState({});

  const translateText = async (text) => {
    if (language === "en") return text;
    if (translations[text]) return translations[text];

    try {
      const res = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: text,
            target: language,
            source: "en",
          }),
        }
      );
      const data = await res.json();
      const translated = data?.data?.translations?.[0]?.translatedText || text;

      setTranslations((prev) => ({ ...prev, [text]: translated }));
      return translated;
    } catch (err) {
      console.error("Translation error:", err);
      return text;
    }
  };

  return (
    <TranslationContext.Provider
      value={{ language, setLanguage, translateText }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationProvider;
