import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, CheckCircle } from 'lucide-react';
import { db, doc, updateDoc } from '../lib/firebase';
import { UserProfile } from '../types';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  profile: UserProfile;
}

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose, onComplete, profile }) => {
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setPhoneNumber(profile.phoneNumber || '');
      setDisplayName(profile.displayName || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() || !displayName.trim()) {
      alert('الرجاء إدخال جميع البيانات المطلوبة');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateDoc(doc(db, 'users', profile.userId), {
        phoneNumber: phoneNumber.trim(),
        displayName: displayName.trim(),
      });
      setIsSubmitting(false);
      onComplete();
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء حفظ البيانات');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-panel border border-fg/10 rounded-[2rem] overflow-hidden shadow-2xl"
            dir="rtl"
          >
            <div className="flex items-center justify-between p-6 border-b border-fg/5">
              <h2 className="text-xl font-bold flex items-center gap-2 text-fg">
                <User className="text-violet-600" />
                أكمل بياناتك للمواصلة
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-fg/5 rounded-full transition-colors"
                type="button"
              >
                <X size={20} className="text-fg/60" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 text-fg">
              <p className="text-sm text-fg/60 leading-relaxed font-medium">
                لكي نتمكن من تقديم أفضل خدمة وتسهيل التواصل معك في أسرع وقت، الرجاء إكمال معلوماتك الشخصية.
              </p>

              <div>
                <label className="block text-sm font-bold mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-fg/40" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-fg/5 border border-fg/10 rounded-xl py-3 pr-11 pl-4 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium"
                    placeholder="اكتب اسمك الكامل"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">رقم الهاتف <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fg/40" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-fg/5 border border-fg/10 rounded-xl py-3 pr-4 pl-11 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-left dir-ltr font-medium text-lg tracking-wider"
                    placeholder="مثال: 55 123 456"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !phoneNumber.trim() || !displayName.trim()}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_-10px_rgba(139,92,246,0.6)] hover:shadow-[0_10px_25px_-5px_rgba(139,92,246,0.7)]"
                >
                  {isSubmitting ? 'جاري الحفظ...' : (
                    <>
                      <CheckCircle size={20} />
                      حفظ ومتابعة للدردشة
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
