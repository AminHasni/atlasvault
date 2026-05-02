import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { db, setDoc, doc, updateDoc, serverTimestamp, handleFirestoreError, OperationType } from '../lib/firebase';
import { GiftCode } from '../types';

interface GiftAdminModalProps {
  giftCode: Partial<GiftCode> | null;
  onClose: () => void;
  onSave: () => void;
}

export function GiftAdminModal({ giftCode, onClose, onSave }: GiftAdminModalProps) {
  const [formData, setFormData] = useState<Partial<GiftCode>>({
    code: '',
    value: 10,
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (giftCode && Object.keys(giftCode).length > 0) {
      setFormData(giftCode);
    } else {
      setFormData({
        code: Math.random().toString(36).substring(2, 10).toUpperCase(),
        value: 10,
        status: 'active',
      });
    }
  }, [giftCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || formData.value === undefined) return;
    
    setLoading(true);
    try {
      if (giftCode?.id) {
        // Update
        await updateDoc(doc(db, 'giftCodes', giftCode.id), {
          ...formData,
        });
      } else {
        // Create
        const id = formData.code;
        await setDoc(doc(db, 'giftCodes', id), {
          ...formData,
          createdAt: serverTimestamp(),
        });
      }
      onSave();
    } catch (error) {
      handleFirestoreError(error, giftCode?.id ? OperationType.UPDATE : OperationType.CREATE, `giftCodes/${giftCode?.id || formData.code}`);
    } finally {
      setLoading(false);
    }
  };

  if (!giftCode) return null;

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
            <h2 className="text-xl font-bold">{giftCode.id ? 'تعديل كود هدية' : 'إضافة كود جديد'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-fg/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">الكود</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full bg-fg/[0.02] border border-fg/10 rounded-xl px-4 py-3 text-fg outline-none focus:border-amber-500 font-mono tracking-widest text-center"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">القيمة</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.value || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full bg-fg/[0.02] border border-fg/10 rounded-xl px-4 py-3 text-fg outline-none focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2">النوع</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-fg/[0.02] border border-fg/10 rounded-xl px-4 py-3 text-fg outline-none focus:border-amber-500"
                >
                  <option value="active" className="bg-background">فعال</option>
                  <option value="used" className="bg-background">مستعمل</option>
                  <option value="expired" className="bg-background">منتهي</option>
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
