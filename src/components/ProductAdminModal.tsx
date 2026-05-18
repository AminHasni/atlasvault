import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { Product, ProductOption, Category } from '../types';
import { db, setDoc, doc, updateDoc } from '../lib/firebase';

interface ProductAdminModalProps {
  product: Partial<Product> | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

import { ImageUpload } from './ImageUpload';

export function ProductAdminModal({ product, categories, onClose, onSave }: ProductAdminModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', price: 0, image: '📦', imageUrl: '', category: '', rating: 5, features: [], options: [], description: '', badge: '', duration: '', ...product
  });

  const rootCats = categories.filter(c => c.level === 0 || !c.level);
  
  const [selectedRoot, setSelectedRoot] = useState<string>(
    categories.find(c => c.name === formData.category)?.slug || ''
  );
  
  const l1Cats = categories.filter(c => c.level === 1 && c.parentId === selectedRoot);
  const [selectedL1, setSelectedL1] = useState<string>(formData.subCategoryL1 || '');

  const l2Cats = categories.filter(c => c.level === 2 && c.parentId === selectedL1);
  const [selectedL2, setSelectedL2] = useState<string>(formData.subCategoryL2 || '');

  const handleSave = async () => {
    if (!formData.name || !formData.price || !selectedRoot) return alert('الرجاء تعبئة الحقول الأساسية (الاسم، السعر، الصنف)');

    const finalProduct = {
      ...formData,
      category: categories.find(c => c.slug === selectedRoot)?.name || '',
      subCategoryL1: selectedL1 || null,
      subCategoryL2: selectedL2 || null,
      updatedAt: new Date(),
    };

    try {
      if (product?.id) {
        await updateDoc(doc(db, 'products', String(product.id)), finalProduct);
      } else {
        const newId = Date.now();
        await setDoc(doc(db, 'products', String(newId)), { ...finalProduct, id: newId, createdAt: new Date() });
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert('خطأ في حفظ المنتج');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel border border-fg/10 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar p-6 md:p-8">
        <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-fg/5 rounded-full hover:bg-fg/10">
          <X size={20} />
        </button>
        
        <h3 className="text-2xl font-black mb-8 text-right">{product?.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>

        <div className="space-y-6 text-right" dir="rtl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-fg/60 mb-2">اسم المنتج</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-fg/60 mb-2">السعر الأساسي (DT)</label>
              <input type="number" step="0.001" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
               <label className="block text-sm font-bold text-fg/60 mb-2">إيموجي</label>
               <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
            </div>
            <div className="col-span-2 md:col-span-1">
               <ImageUpload value={formData.imageUrl || ''} onChange={url => setFormData({...formData, imageUrl: url})} label="صورة المنتج (اختياري)" />
            </div>
            <div>
               <label className="block text-sm font-bold text-fg/60 mb-2">شارة (Badge)</label>
               <input type="text" value={formData.badge || ''} onChange={e => setFormData({...formData, badge: e.target.value})} placeholder="مثال: جديد" className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
            </div>
            <div>
               <label className="block text-sm font-bold text-fg/60 mb-2">المدة (اختياري)</label>
               <input type="text" value={formData.duration || ''} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="مثال: شهر واحد" className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-fg/60 mb-2">الوصف</label>
            <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500 min-h-[80px]" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-fg/60 mb-2">الصنف الأساسي</label>
              <select value={selectedRoot} onChange={e => { setSelectedRoot(e.target.value); setSelectedL1(''); setSelectedL2(''); }} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500">
                <option value="">اختر...</option>
                {rootCats.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            {l1Cats.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-fg/60 mb-2">الصنف الفرعي 1</label>
                <select value={selectedL1} onChange={e => { setSelectedL1(e.target.value); setSelectedL2(''); }} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500">
                  <option value="">لا يوجد (اختياري)</option>
                  {l1Cats.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
            )}
            {l2Cats.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-fg/60 mb-2">الصنف الفرعي 2</label>
                <select value={selectedL2} onChange={e => setSelectedL2(e.target.value)} className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500">
                  <option value="">لا يوجد (اختياري)</option>
                  {l2Cats.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="p-5 bg-fg/[0.02] border border-fg/5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-fg/60">خيارات التسعير (Options)</label>
              <button onClick={() => setFormData({ ...formData, options: [...(formData.options||[]), {name: '', price: 0}] })} className="text-xs bg-violet-500/10 text-violet-400 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">+ أضف خيار</button>
            </div>
            {formData.options?.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input type="text" placeholder="اسم الخيار" value={opt.name} onChange={e => {
                  const newOpts = [...(formData.options||[])];
                  newOpts[idx].name = e.target.value;
                  setFormData({...formData, options: newOpts});
                }} className="flex-1 bg-fg/5 border border-fg/10 rounded-xl px-3 py-2 outline-none focus:border-violet-500 text-sm" />
                <input type="number" placeholder="السعر" value={opt.price} onChange={e => {
                  const newOpts = [...(formData.options||[])];
                  newOpts[idx].price = parseFloat(e.target.value) || 0;
                  setFormData({...formData, options: newOpts});
                }} className="w-24 bg-fg/5 border border-fg/10 rounded-xl px-3 py-2 outline-none focus:border-violet-500 text-sm" />
                <button onClick={() => {
                  const newOpts = [...(formData.options||[])];
                  newOpts.splice(idx, 1);
                  setFormData({...formData, options: newOpts});
                }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <div className="p-5 bg-fg/[0.02] border border-fg/5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-fg/60">المميزات (Features)</label>
              <button onClick={() => setFormData({ ...formData, features: [...(formData.features||[]), ''] })} className="text-xs bg-violet-500/10 text-violet-400 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">+ أضف ميزة</button>
            </div>
            {formData.features?.map((feat, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input type="text" placeholder="اسم الميزة" value={feat} onChange={e => {
                  const newFeats = [...(formData.features||[])];
                  newFeats[idx] = e.target.value;
                  setFormData({...formData, features: newFeats});
                }} className="flex-1 bg-fg/5 border border-fg/10 rounded-xl px-3 py-2 outline-none focus:border-violet-500 text-sm" />
                <button onClick={() => {
                  const newFeats = [...(formData.features||[])];
                  newFeats.splice(idx, 1);
                  setFormData({...formData, features: newFeats});
                }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>

          <button onClick={handleSave} className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-xl transition-all shadow-lg shadow-violet-500/20 text-lg flex justify-center items-center gap-2 mt-4">
            <Check size={20} />
            حفظ المنتج
          </button>
        </div>
      </div>
    </div>
  );
}
