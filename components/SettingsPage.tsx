import React, { useState } from 'react';
import { User } from '../types';
import { TRANSLATIONS } from '../constants';
import { Moon, Sun, Globe, Bell, User as UserIcon, Shield, Info, Smartphone, Mail, ChevronRight, LogIn } from 'lucide-react';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  lang: 'en' | 'fr' | 'ar';
  setLang: (lang: 'en' | 'fr' | 'ar') => void;
  user: User | null;
  onOpenProfile: () => void;
  onLogin: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  theme, setTheme, lang, setLang, user, onOpenProfile, onLogin 
}) => {
  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[lang][key] || key;
  };

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t('settings')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('themeDesc')}</p>
        </div>

        {/* --- Appearance --- */}
        <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sun className="h-5 w-5 text-amber-500" /> {t('appearance')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${theme === 'light' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                >
                    <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-amber-500 shadow-sm">
                        <Sun className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                        <p className={`font-semibold ${theme === 'light' ? 'text-indigo-900' : 'text-slate-900 dark:text-white'}`}>{t('themeLight')}</p>
                        <p className="text-xs text-slate-500">Clean and bright</p>
                    </div>
                    {theme === 'light' && <div className="ml-auto h-2 w-2 rounded-full bg-indigo-600"></div>}
                </button>

                <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-slate-800 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
                >
                    <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-sm">
                        <Moon className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{t('themeDark')}</p>
                        <p className="text-xs text-slate-500">Easy on the eyes</p>
                    </div>
                    {theme === 'dark' && <div className="ml-auto h-2 w-2 rounded-full bg-indigo-500"></div>}
                </button>
            </div>
        </section>

        {/* --- Language --- */}
        <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" /> {t('language')}
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 flex">
                {[
                    { code: 'en', label: 'English', flag: '🇺🇸' },
                    { code: 'fr', label: 'Français', flag: '🇫🇷' },
                    { code: 'ar', label: 'العربية', flag: '🇸🇦' }
                ].map((item) => (
                    <button
                        key={item.code}
                        onClick={() => setLang(item.code as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${lang === item.code ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                    >
                        <span className="text-lg">{item.flag}</span>
                        {item.label}
                    </button>
                ))}
            </div>
        </section>

        {/* --- Account --- */}
        <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-emerald-500" /> {t('account')}
            </h3>
            {user ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h4>
                        <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                            {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                            {user.role === 'admin' ? t('admin') : t('user')}
                        </div>
                    </div>
                    <button
                        onClick={onOpenProfile}
                        className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        {t('updateProfile')}
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-4">
                        <UserIcon className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('guestMode')}</h4>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">{t('loginToAccess')}</p>
                    <button
                        onClick={onLogin}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all"
                    >
                        <LogIn className="h-4 w-4" />
                        {t('login')}
                    </button>
                </div>
            )}
        </section>

        {/* --- Notifications (Mock) --- */}
        <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-rose-500" /> {t('notifications')}
            </h3>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">{t('enableNotifs')}</p>
                            <p className="text-xs text-slate-500">{t('notifDesc')}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                            <Smartphone className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">{t('marketing')}</p>
                            <p className="text-xs text-slate-500">Updates about new features</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={marketingEmails} onChange={() => setMarketingEmails(!marketingEmails)} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>
        </section>

        {/* --- About --- */}
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>ATLASVAULT v2.4.0</span>
                </div>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</a>
                    <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</a>
                </div>
            </div>
        </section>
    </div>
  );
};