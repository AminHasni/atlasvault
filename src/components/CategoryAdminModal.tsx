import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Category } from '../types';
import { db, setDoc, doc, updateDoc } from '../lib/firebase';
import { ImageUpload } from './ImageUpload';

interface CategoryAdminModalProps {
  category: Partial<Category> | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

export function CategoryAdminModal({ category, categories, onClose, onSave }: CategoryAdminModalProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '', icon: '📦', imageUrl: '', color: 'bg-violet-500/10 text-violet-500', level: 0, parentId: '', ...category
  });

  const handleSave = async () => {
    if (!formData.name) return alert('الرجاء إدخال اسم الصنف');

    const isEdit = !!category?.slug;
    const slug = isEdit ? category.slug : formData.name.trim().toLowerCase().replace(/\s+/g, '-');

    if (!slug) return alert('الاسم غير صالح');

    const finalCategory = {
      slug,
      name: formData.name,
      icon: formData.icon || '📦',
      imageUrl: formData.imageUrl || '',
      color: formData.color || 'bg-violet-500/10 text-violet-500',
      level: Number(formData.level),
      parentId: formData.parentId || null,
    };

    try {
      if (isEdit) {
        await updateDoc(doc(db, 'categories', slug), finalCategory);
      } else {
        await setDoc(doc(db, 'categories', slug), finalCategory);
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert('خطأ في حفظ الصنف');
    }
  };

  const getParentOptions = () => {
    if (formData.level === 1) {
      return categories.filter(c => c.level === 0);
    } else if (formData.level === 2) {
      return categories.filter(c => c.level === 1);
    }
    return [];
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel border border-fg/10 rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar p-6 md:p-8 text-right" dir="rtl">
        <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-fg/5 rounded-full hover:bg-fg/10">
          <X size={20} />
        </button>
        
        <h3 className="text-2xl font-black mb-8">{category?.slug ? 'تعديل الصنف' : 'إضافة صنف جديد'}</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-fg/60 mb-2">اسم الصنف</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
               <label className="block text-sm font-bold text-fg/60 mb-2">إيموجي</label>
               <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
            </div>
            <div className="col-span-2 md:col-span-1">
               <ImageUpload value={formData.imageUrl || ''} onChange={url => setFormData({...formData, imageUrl: url})} label="صورة الصنف (اختياري)" />
            </div>
            <div>
               <label className="block text-sm font-bold text-fg/60 mb-2">الألوان (Tailwind Classes)</label>
               <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500 text-left" dir="ltr" />
            </div>
          </div>

          {!category?.slug && (
            <div>
              <label className="block text-sm font-bold text-fg/60 mb-2">المستوى</label>
              <select value={formData.level} onChange={e => setFormData({...formData, level: Number(e.target.value), parentId: ''})} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500">
                <option value={0}>0 (صنف أساسي)</option>
                <option value={1}>1 (صنف فرعي متفرع من أساسي)</option>
                <option value={2}>2 (صنف فرعي متفرع من مستوى 1)</option>
              </select>
            </div>
          )}

          {formData.level && Number(formData.level) > 0 ? (
            <div>
              <label className="block text-sm font-bold text-fg/60 mb-2">الصنف الأب</label>
              <select value={formData.parentId || ''} onChange={e => setFormData({...formData, parentId: e.target.value})} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500">
                <option value="">اختر الصنف الأب...</option>
                {getParentOptions().map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          ) : null}

          <button onClick={handleSave} className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-xl transition-all shadow-lg shadow-violet-500/20 text-lg flex justify-center items-center gap-2 mt-4">
            <Check size={20} />
            حفظ الصنف
          </button>
        </div>
      </div>
    </div>
  );
}
