import React, { useState } from 'react';
import { User } from '../types';
import { updateUser } from '../services/storageService';
import { User as UserIcon, Mail, Phone, Loader2, Save, Shield } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface ProfileModalProps {
  user: User;
  onUpdate: (user: User) => void;
  onCancel: () => void;
  lang: 'en' | 'fr' | 'ar';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onUpdate, onCancel, lang }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    password: user.password
  });
  const [loading, setLoading] = useState(false);

  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[lang][key] || key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const updated = await updateUser({
            ...user,
            ...formData
        });
        onUpdate(updated);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const inputPadding = lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3';
  const iconPosition = lang === 'ar' ? 'right-3' : 'left-3';

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user.name}</h3>
                <div className="flex items-center gap-2 text-xs">
                     <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        {user.role === 'admin' && <Shield className="h-3 w-3" />}
                        {user.role === 'admin' ? t('admin') : t('user')}
                     </span>
                     <span className="text-slate-400">
                        {t('accountType')}
                     </span>
                </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('name')}</label>
                <div className="relative">
                    <UserIcon className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${iconPosition}`} />
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className={`w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white ${inputPadding}`}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('email')}</label>
                <div className="relative">
                    <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${iconPosition}`} />
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className={`w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white ${inputPadding}`}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('phone')}</label>
                <div className="relative">
                    <Phone className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${iconPosition}`} />
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className={`w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white ${inputPadding}`}
                    />
                </div>
            </div>

            <div className="pt-4 flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                    {t('cancel')}
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {t('saveChanges')}
                </button>
            </div>
        </form>
    </div>
  );
};