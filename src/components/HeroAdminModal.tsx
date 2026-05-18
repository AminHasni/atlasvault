import React, { useState } from 'react';
import { X, Save, Image, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { ImageUpload } from './ImageUpload';

export function HeroAdminModal({ slide, onClose, onSave }: { slide: any; onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    title: slide?.title || '',
    subtitle: slide?.subtitle || '',
    emojis: slide?.emojis?.join(', ') || '',
    accent: slide?.accent || 'from-violet-500 to-fuchsia-500',
    bg: slide?.bg || 'bg-violet-600/10',
    buttonText: slide?.buttonText || '',
    link: slide?.link || '',
    imageUrl: slide?.imageUrl || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSave = {
        title: formData.title,
        subtitle: formData.subtitle,
        emojis: formData.emojis.split(',').map(e => e.trim()).filter(Boolean),
        accent: formData.accent,
        bg: formData.bg,
        buttonText: formData.buttonText,
        link: formData.link,
        imageUrl: formData.imageUrl,
      };

      if (slide?.id && !slide.id.startsWith('default-')) {
        await updateDoc(doc(db, 'heroSlides', slide.id), dataToSave);
      } else {
        const docRef = doc(collection(db, 'heroSlides'));
        await setDoc(docRef, dataToSave);
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert('خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-panel border border-fg/10 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-fg/5">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Image className="text-violet-500" />
            {slide ? 'تعديل لافتة' : 'إضافة لافتة جديدة'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-fg/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">العنوان (يمكنك استخدام \n للسطر الجديد)</label>
            <textarea
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">الوصف الفرعي</label>
            <textarea
              value={formData.subtitle}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">الإيموجي (مفصولة بفاصلة)</label>
            <input
              type="text"
              value={formData.emojis}
              onChange={e => setFormData({ ...formData, emojis: e.target.value })}
              className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500"
              placeholder="✨, 🤖, 🎮, 🎵"
            />
          </div>

          <div>
             <label className="block text-sm font-bold mb-2">صورة الخلفية (اختياري)</label>
             <ImageUpload value={formData.imageUrl} onChange={url => setFormData({ ...formData, imageUrl: url })} label="" />
             <p className="text-xs text-fg/40 mt-1">إذا تم رفع صورة، ستظهر كخلفية للافتة بدلاً من الألوان المجردة.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">لون التأثير (Accent)</label>
              <select
                value={formData.accent}
                onChange={e => setFormData({ ...formData, accent: e.target.value })}
                className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 appearance-none"
              >
                <option value="from-violet-500 to-fuchsia-500">بنفسجي - فوشيا</option>
                <option value="from-emerald-500 to-teal-500">زمردي - تركوازي</option>
                <option value="from-orange-500 to-red-500">برتقالي - أحمر</option>
                <option value="from-blue-500 to-cyan-500">أزرق - سماوي</option>
                <option value="from-pink-500 to-rose-500">وردي - قرمزي</option>
                <option value="from-amber-500 to-yellow-500">كهرماني - أصفر</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">خلفية اللافتة (Background)</label>
              <select
                value={formData.bg}
                onChange={e => setFormData({ ...formData, bg: e.target.value })}
                className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 appearance-none"
              >
                <option value="bg-violet-600/10">بنفسجي شفاف</option>
                <option value="bg-emerald-600/10">زمردي شفاف</option>
                <option value="bg-orange-600/10">برتقالي شفاف</option>
                <option value="bg-blue-600/10">أزرق شفاف</option>
                <option value="bg-pink-600/10">وردي شفاف</option>
                <option value="bg-amber-600/10">كهرماني شفاف</option>
                <option value="bg-fg/5">رمادي محايد شفاف</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">نص الزر (اختياري)</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500"
                placeholder="مثال: تسوق الآن"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">رابط الزر (Link)</label>
              <select
                value={formData.link}
                onChange={e => setFormData({ ...formData, link: e.target.value })}
                className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 appearance-none"
              >
                <option value="">-- بدون رابط --</option>
                <option value="shop">البوتيك (الكل)</option>
                <option value="accounts">حسابات</option>
                <option value="gift">هدايا (كادو)</option>
                <option value="contact">التواصل</option>
                <option value="faq">الأسئلة الشائعة</option>
                <option value="home">الرئيسية</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-fg/5">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold hover:bg-fg/5 transition-colors">
              إلغاء
            </button>
            <button type="submit" disabled={saving} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-colors flex items-center gap-2">
              <Save size={18} />
              {saving ? 'جاري الحفظ...' : 'حفظ اللافتة'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
