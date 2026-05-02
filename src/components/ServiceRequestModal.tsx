import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send } from 'lucide-react';
import { db, setDoc, doc, collection, serverTimestamp, handleFirestoreError, OperationType, addDoc } from '../lib/firebase';
import { ServiceRequest } from '../types';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail?: string;
}

export function ServiceRequestModal({ isOpen, onClose, userId, userEmail }: ServiceRequestModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    setLoading(true);
    try {
      const id = doc(collection(db, 'serviceRequests')).id; // Generate auto id manually by doc() approach if using addDoc isn't preferred or better:
      await setDoc(doc(db, 'serviceRequests', id), {
        userId,
        userEmail,
        title: formData.title,
        description: formData.description,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      try {
        await addDoc(collection(db, 'notifications'), {
          userId: 'admin',
          title: 'طلب خدمة جديد',
          message: `${formData.title} طلب من  ${userEmail || 'مستخدم'}`,
          isRead: false,
          link: 'admin-requests',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Failed to notify admin", err);
      }

      setFormData({ title: '', description: '' });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `serviceRequests/new`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-panel border-fg/10 border rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-500">طلب خدمة جديدة</h2>
            <button onClick={onClose} className="p-2 hover:bg-fg/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-3">ماهي الخدمة التي تبحث عنها؟</label>
              <input
                type="text"
                required
                placeholder="مثال: حساب ديزني+"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-fg/[0.02] border border-fg/10 rounded-2xl px-5 py-4 text-fg outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-3">تفاصيل الطلب</label>
              <textarea
                required
                placeholder="اذكر أي تفاصيل إضافية..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-fg/[0.02] border border-fg/10 rounded-2xl px-5 py-4 text-fg outline-none focus:border-violet-500 transition-colors resize-none h-32"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 text-white rounded-2xl font-black transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? 'جاري الإرسال...' : (
                <>
                  <Send size={18} className="group-hover:-translate-y-1 transition-transform" />
                  إرسال الطلب
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
