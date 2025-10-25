import { useContext, useEffect, useState } from "react";
import { TranslationContext } from "../context/TranslationContext";

const useTranslate = (text) => {
  const { translateText } = useContext(TranslationContext);
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let isMounted = true;
    translateText(text).then((t) => isMounted && setTranslated(t));
    return () => { isMounted = false; };
  }, [text, translateText]);

  return translated;
};

export default useTranslate;
