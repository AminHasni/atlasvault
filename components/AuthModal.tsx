import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, registerUser, mockGoogleLogin } from '../services/storageService';
import { Mail, Lock, User as UserIcon, Phone, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleFillAdmin = () => {
    setMode('login');
    setFormData(prev => ({
        ...prev,
        email: 'admin@nexus.com',
        password: 'admin'
    }));
    setError('');
  };

  const handleGoogleLogin = async () => {
     setIsGoogleLoading(true);
     setError('');
     try {
         // Simulate network delay for social login
         await new Promise(resolve => setTimeout(resolve, 1500));
         const user = await mockGoogleLogin();
         onSuccess(user);
     } catch (err) {
         setError('Google login failed');
     } finally {
         setIsGoogleLoading(false);
     }
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

      <div className="space-y-4">
        <button
          onClick={handleGoogleLogin}
          disabled={loading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 disabled:opacity-70"
        >
          {isGoogleLoading ? (
             <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.424 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.424 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
          )}
          {t('loginGoogle')}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
              {t('or')}
            </span>
          </div>
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
               disabled={loading || isGoogleLoading}
               className="w-full flex justify-center items-center gap-2 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading && <Loader2 className="h-4 w-4 animate-spin" />}
               {mode === 'login' ? t('login') : t('register')}
            </button>
         </div>

         <div className="flex justify-between items-center px-1">
             <button
               type="button"
               onClick={handleFillAdmin}
               className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
               title="Fill Admin Credentials"
             >
               <ShieldCheck className="h-3.5 w-3.5" />
               Demo Admin
             </button>
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