
import React, { useState, useCallback, FC } from 'react';
import { AppStatus } from './types';
import { findAvailableUsernames } from './services/geminiService';

const SearchIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const CopyIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 4.625-2.25-2.25m0 0a3.75 3.75 0 0 1-5.303-5.303m-3.75 5.303 5.303-5.303" />
  </svg>
);

const CheckIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const LoadingSpinner: FC = () => (
  <div className="flex flex-col items-center justify-center gap-4 text-center">
    <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
    <p className="text-lg text-slate-300">جاري البحث عن أسماء مستخدمين...</p>
  </div>
);

interface UsernameCardProps {
  username: string;
}

const UsernameCard: FC<UsernameCardProps> = ({ username }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg flex items-center justify-between shadow-lg transition-all duration-300 hover:bg-white/20 hover:scale-105">
      <span className="font-mono text-lg text-white">@{username}</span>
      <button
        onClick={handleCopy}
        className="p-2 rounded-full bg-blue-500/50 text-white hover:bg-blue-500 transition-colors relative"
        aria-label={`Copy username ${username}`}
      >
        {copied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
        {copied && (
            <div className="absolute -top-10 right-1/2 translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg">
                تم النسخ!
            </div>
        )}
      </button>
    </div>
  );
};

const App: FC = () => {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.Idle);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setStatus(AppStatus.Loading);
    setError(null);
    setUsernames([]);

    try {
      const results = await findAvailableUsernames(keyword);
      setUsernames(results);
      setStatus(AppStatus.Success);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStatus(AppStatus.Error);
    }
  }, [keyword]);

  const renderContent = () => {
    switch (status) {
      case AppStatus.Loading:
        return <LoadingSpinner />;
      case AppStatus.Success:
        return usernames.length > 0 ? (
          <div className="w-full">
            <h2 className="text-2xl font-bold text-white text-center mb-6">أسماء المستخدمين المتاحة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
              {usernames.map((name) => (
                <UsernameCard key={name} username={name} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-center">لم يتم العثور على اقتراحات. جرب كلمة مفتاحية أخرى.</p>
        );
      case AppStatus.Error:
        return <p className="text-red-400 text-center bg-red-900/50 p-4 rounded-lg">{error}</p>;
      case AppStatus.Idle:
      default:
        return (
          <div className="text-center text-slate-400">
            <p>ابحث عن أسماء مستخدمين فريدة من 3 إلى 7 أحرف.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center overflow-auto" style={{backgroundImage: 'radial-gradient(circle at top, hsla(214, 41%, 25%, 1) 0%, hsla(214, 41%, 10%, 1) 100%)'}}>
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300 py-2">
                مدقق إتاحة اليوزرات
            </h1>
            <p className="text-slate-300 mt-2 text-lg">ابحث عن اسم المستخدم المثالي لك باستخدام الذكاء الاصطناعي</p>
        </header>

        <main className="w-full flex-grow flex flex-col items-center">
          <form onSubmit={handleSearch} className="w-full max-w-lg mb-8 sticky top-4 z-10">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="أدخل كلمة مفتاحية (مثل: game, art, tech)"
                className="w-full px-5 pr-12 py-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 shadow-lg"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-slate-400 hover:text-blue-400 transition-colors rounded-full"
                disabled={status === AppStatus.Loading}
              >
                <SearchIcon className="w-6 h-6" />
              </button>
            </div>
          </form>

          <div className="w-full max-w-4xl p-4 min-h-[300px] flex items-center justify-center">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
