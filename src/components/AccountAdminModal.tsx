import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { db, setDoc, doc, updateDoc, serverTimestamp, handleFirestoreError, OperationType } from '../lib/firebase';
import { AccountCategory } from '../types';

interface AccountAdminModalProps {
  accountCat: Partial<AccountCategory> | null;
  onClose: () => void;
  onSave: () => void;
}

export function AccountAdminModal({ accountCat, onClose, onSave }: AccountAdminModalProps) {
  const [formData, setFormData] = useState<Partial<AccountCategory>>({
    title: '',
    icon: 'Monitor',
    imageUrl: '',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    count: 10,
    desc: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accountCat && Object.keys(accountCat).length > 0) {
      setFormData(accountCat);
    }
  }, [accountCat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    setLoading(true);
    try {
      if (accountCat?.id) {
        // Update
        await updateDoc(doc(db, 'accountCategories', accountCat.id), {
          ...formData,
        });
      } else {
        // Create
        const id = formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
        await setDoc(doc(db, 'accountCategories', id), {
          ...formData,
          createdAt: serverTimestamp(),
        });
      }
      onSave();
    } catch (error) {
      handleFirestoreError(error, accountCat?.id ? OperationType.UPDATE : OperationType.CREATE, `accountCategories/${accountCat?.id || 'new'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!accountCat) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-panel border-fg/10 border rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{accountCat.id ? 'تعديل صنف حسابات' : 'إضافة صنف حسابات'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-fg/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">اسم الصنف</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-fg/[0.02] border border-fg/10 rounded-xl px-4 py-3 text-fg outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">الوصف</label>
              <textarea
                required
                value={formData.desc || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                className="w-full bg-fg/[0.02] border border-fg/10 rounded-xl px-4 py-3 text-fg outline-none focus:border-amber-500 resize-none h-24"
              />
            </div>
            
            <div>
               <label className="block text-sm font-bold mb-2">رابط الصورة (URL - اختياري)</label>
               <input
                 type="text"
                 value={formData.imageUrl || ''}
                 onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                 placeholder="https://..."
                 className="w-full bg-fg/[0.02] border border-fg/10 rounded-xl px-4 py-3 text-fg outline-none focus:border-amber-500 text-left"
                 dir="ltr"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">عدد الحسابات المتوفرة</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.count || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, count: Number(e.target.value) }))}
                  className="w-full bg-fg/[0.02] border border-fg/10 rounded-xl px-4 py-3 text-fg outline-none focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">اللون (Tailwind Class)</label>
                <select
                  value={formData.color || 'text-blue-500'}
                  onChange={(e) => {
                     const color = e.target.value;
                     const bg = color.replace('text-', 'bg-') + '/10';
                     setFormData(prev => ({ ...prev, color, bg }));
                  }}
                  className="w-full bg-fg/[0.02] border border-fg/10 rounded-xl px-4 py-3 text-fg outline-none focus:border-amber-500"
                >
                  <option value="text-blue-500" className="bg-background">أزرق</option>
                  <option value="text-red-500" className="bg-background">أحمر</option>
                  <option value="text-fuchsia-500" className="bg-background">وردي</option>
                  <option value="text-emerald-500" className="bg-background">أخضر</option>
                  <option value="text-violet-500" className="bg-background">بنفسجي</option>
                  <option value="text-cyan-500" className="bg-background">سماوي</option>
                  <option value="text-amber-500" className="bg-background">أصفر</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-fg/5 hover:bg-fg/10 rounded-xl font-bold transition-colors"
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? 'قيد الحفظ...' : (
                  <>
                    <Save size={18} />
                    حفظ
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
