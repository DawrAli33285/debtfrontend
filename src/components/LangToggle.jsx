import { useLang } from './LanguageContext';

export default function LangToggle() {
  const { isSpanish, setIsSpanish } = useLang();

  const toggle = () => {
    if (isSpanish) {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      setIsSpanish(false);
      window.location.reload();
    } else {
      document.cookie = `googtrans=/en/es; path=/`;
      document.cookie = `googtrans=/en/es; path=/; domain=${window.location.hostname}`;
      setIsSpanish(true);
      window.location.reload();
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 
                 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600"
    >
      <span className="text-base">{isSpanish ? '🇪🇸' : '🇺🇸'}</span>
      <span>{isSpanish ? 'ES' : 'EN'}</span>
    </button>
  );
}