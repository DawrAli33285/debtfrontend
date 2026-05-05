import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [isSpanish, setIsSpanish] = useState(
    () => document.cookie.includes('googtrans=/en/es')
  );

  return (
    <LanguageContext.Provider value={{ isSpanish, setIsSpanish }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}