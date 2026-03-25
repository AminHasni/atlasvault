import React, { useState } from 'react';
import { User } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Moon, Sun, Globe, Bell, User as UserIcon, Shield, Info, Smartphone, 
  Mail, ChevronRight, LogIn, Lock, Layout, HelpCircle, Bug, MessageSquare, 
  Database, Download, Trash2, Eye, EyeOff, Monitor, Smartphone as MobileIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  lang: 'en' | 'fr' | 'ar';
  setLang: (lang: 'en' | 'fr' | 'ar') => void;
  user: User | null;
  onOpenProfile: () => void;
  onLogin: () => void;
  glassmorphism: boolean;
  setGlassmorphism: (val: boolean) => void;
  compactMode: boolean;
  setCompactMode: (val: boolean) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  theme, setTheme, lang, setLang, user, onOpenProfile, onLogin,
  glassmorphism, setGlassmorphism, compactMode, setCompactMode
}) => {
  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[lang][key] || key;
  };

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const SettingToggle = ({ 
    icon: Icon, 
    title, 
    desc, 
    checked, 
    onChange, 
    colorClass = "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400" 
  }: any) => (
    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={() => onChange(!checked)} />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
      </label>
    </div>
  );

  const SettingLink = ({ icon: Icon, title, desc, onClick, colorClass = "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400" }: any) => (
    <button 
      onClick={onClick}
      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-400" />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{t('settings')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Personalize your AtlasVault experience</p>
        </header>

        {/* --- Appearance --- */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">{t('appearance')}</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${theme === 'light' ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-500/10' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200'}`}
                >
                    <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-sm">
                        <Sun className="h-7 w-7" />
                    </div>
                    <div className="text-left">
                        <p className={`font-bold text-lg ${theme === 'light' ? 'text-indigo-900' : 'text-slate-900 dark:text-white'}`}>{t('themeLight')}</p>
                        <p className="text-xs text-slate-500">Clean and bright</p>
                    </div>
                    {theme === 'light' && <div className="ml-auto h-3 w-3 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'bg-slate-800 border-indigo-500 shadow-xl shadow-indigo-500/10' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200'}`}
                >
                    <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-sm">
                        <Moon className="h-7 w-7" />
                    </div>
                    <div className="text-left">
                        <p className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{t('themeDark')}</p>
                        <p className="text-xs text-slate-500">Easy on the eyes</p>
                    </div>
                    {theme === 'dark' && <div className="ml-auto h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
                </motion.button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                <SettingToggle 
                  icon={Layout} 
                  title={t('glassmorphism')} 
                  desc="Enable frosted glass effects" 
                  checked={glassmorphism} 
                  onChange={setGlassmorphism}
                  colorClass="text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400"
                />
                <SettingToggle 
                  icon={Monitor} 
                  title={t('compactMode')} 
                  desc="Reduce spacing for more content" 
                  checked={compactMode} 
                  onChange={setCompactMode}
                  colorClass="text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400"
                />
            </div>
        </section>

        {/* --- Language --- */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">{t('language')}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 flex gap-1">
                {[
                    { code: 'en', label: 'English', flag: '🇺🇸' },
                    { code: 'fr', label: 'Français', flag: '🇫🇷' },
                    { code: 'ar', label: 'العربية', flag: '🇸🇦' }
                ].map((item) => (
                    <button
                        key={item.code}
                        onClick={() => setLang(item.code as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${lang === item.code ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                        <span className="text-xl">{item.flag}</span>
                        <span className="hidden sm:inline">{item.label}</span>
                        <span className="sm:hidden uppercase">{item.code}</span>
                    </button>
                ))}
            </div>
        </section>

        {/* --- Account & Security --- */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-1 bg-emerald-600 rounded-full"></div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">{t('account')} & {t('security')}</h3>
            </div>
            
            {user ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center gap-6 mb-4">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-500/20 transform -rotate-3">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                            {user.role === 'admin' ? <Shield className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
                            {user.role === 'admin' ? t('admin') : t('user')}
                        </div>
                    </div>
                    <button
                        onClick={onOpenProfile}
                        className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        {t('updateProfile')}
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-6">
                        <UserIcon className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t('guestMode')}</h4>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium">{t('loginToAccess')}</p>
                    <button
                        onClick={onLogin}
                        className="inline-flex items-center gap-3 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                    >
                        <LogIn className="h-5 w-5" />
                        {t('login')}
                    </button>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                <SettingToggle 
                  icon={Lock} 
                  title={t('twoFactor')} 
                  desc="Add an extra layer of security" 
                  checked={twoFactor} 
                  onChange={setTwoFactor}
                  colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
                />
                <SettingLink 
                  icon={Smartphone} 
                  title={t('activeSessions')} 
                  desc="Manage devices logged into your account" 
                  onClick={() => {}}
                  colorClass="text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                />
            </div>
        </section>

        {/* --- Notifications --- */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-1 bg-rose-600 rounded-full"></div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">{t('notifications')}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                <SettingToggle 
                  icon={Mail} 
                  title={t('enableNotifs')} 
                  desc={t('notifDesc')} 
                  checked={emailNotifs} 
                  onChange={setEmailNotifs}
                  colorClass="text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                />
                <SettingToggle 
                  icon={Bell} 
                  title={t('pushNotifs')} 
                  desc="Receive alerts on your device" 
                  checked={pushNotifs} 
                  onChange={setPushNotifs}
                  colorClass="text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
                />
                <SettingToggle 
                  icon={Smartphone} 
                  title={t('orderUpdates')} 
                  desc="Get notified about your order status" 
                  checked={orderUpdates} 
                  onChange={setOrderUpdates}
                  colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400"
                />
                <SettingToggle 
                  icon={Smartphone} 
                  title={t('marketing')} 
                  desc="Updates about new features and offers" 
                  checked={marketingEmails} 
                  onChange={setMarketingEmails}
                  colorClass="text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400"
                />
            </div>
        </section>

        {/* --- Support --- */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-1 bg-amber-600 rounded-full"></div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">{t('support')}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                <SettingLink 
                  icon={HelpCircle} 
                  title={t('helpCenter')} 
                  desc="Browse guides and FAQs" 
                  onClick={() => {}}
                  colorClass="text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"
                />
                <SettingLink 
                  icon={Bug} 
                  title={t('reportBug')} 
                  desc="Help us improve AtlasVault" 
                  onClick={() => {}}
                  colorClass="text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
                />
                <SettingLink 
                  icon={MessageSquare} 
                  title={t('contactSupport')} 
                  desc="Talk to our team via WhatsApp or Email" 
                  onClick={() => {}}
                  colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400"
                />
            </div>
        </section>

        {/* --- Data & Privacy --- */}
        <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-1 bg-slate-600 rounded-full"></div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">{t('dataPrivacy')}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                <SettingLink 
                  icon={Download} 
                  title={t('exportData')} 
                  desc="Download a copy of your personal data" 
                  onClick={() => {}}
                  colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400"
                />
                <SettingLink 
                  icon={Trash2} 
                  title={t('clearCache')} 
                  desc="Free up space and reset local settings" 
                  onClick={() => {}}
                  colorClass="text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400"
                />
            </div>
        </section>

        {/* --- About --- */}
        <footer className="pt-10 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-500 text-sm font-bold">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Info className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-slate-900 dark:text-white uppercase tracking-widest text-[10px]">Version</p>
                        <p>ATLASVAULT v2.5.0-stable</p>
                    </div>
                </div>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest text-xs">{t('terms')}</a>
                    <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest text-xs">{t('privacy')}</a>
                </div>
            </div>
            <p className="text-center mt-10 text-slate-400 text-xs uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} AtlasVault. {t('rightsReserved')}
            </p>
        </footer>
    </div>
  );
};