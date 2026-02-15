import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/storageService';
import { Mail, Lock, User as UserIcon, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface AuthModalProps {
  onSuccess: (user: User) => void;
  onCancel: () => void;
  lang: 'en' | 'fr' | 'ar';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onCancel, lang }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });

  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[lang][key] || key;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (mode === 'login') {
        const user = await loginUser(formData.email, formData.password);
        onSuccess(user);
      } else {
        if (formData.password !== formData.confirmPassword) {
            throw new Error(t('passwordsDoNotMatch'));
        }
        const user = await registerUser({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone
        });
        onSuccess(user);
      }
    } catch (err: any) {
        if (err.message === 'Invalid credentials') {
            setError(t('invalidCredentials'));
        } else if (err.message === 'Email already registered') {
            setError(t('emailExists'));
        } else {
            setError(err.message || 'An error occurred');
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-center mb-6">
         <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
               onClick={() => { setMode('login'); setError(''); }}
               className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
               {t('login')}
            </button>
            <button
               onClick={() => { setMode('register'); setError(''); }}
               className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'register' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
               {t('register')}
            </button>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
         {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg animate-in slide-in-from-top-1">
               <AlertCircle className="h-4 w-4" />
               {error}
            </div>
         )}

         {mode === 'register' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
               <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('name')}</label>
                  <div className="relative">
                     <UserIcon className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
                     <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className={`w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                     />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('phone')}</label>
                  <div className="relative">
                     <Phone className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
                     <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                     />
                  </div>
               </div>
            </div>
         )}

         <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('email')}</label>
            <div className="relative">
               <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
               <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                  placeholder="name@example.com"
               />
            </div>
         </div>

         <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('password')}</label>
            <div className="relative">
               <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
               <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
               />
            </div>
         </div>

         {mode === 'register' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('confirmPassword')}</label>
                <div className="relative">
                   <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
                   <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className={`w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                   />
                </div>
            </div>
         )}

         <div className="pt-4">
            <button
               type="submit"
               disabled={loading}
               className="w-full flex justify-center items-center gap-2 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading && <Loader2 className="h-4 w-4 animate-spin" />}
               {mode === 'login' ? t('login') : t('register')}
            </button>
         </div>

         <div className="flex justify-center items-center px-1">
             <button
               type="button"
               onClick={onCancel}
               className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
             >
               {t('cancel')}
             </button>
         </div>
      </form>
    </div>
  );
};