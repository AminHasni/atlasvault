import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, Upload, CheckCircle2, User, Camera, FileText, Loader2 } from 'lucide-react';
import { db, addDoc, collection, serverTimestamp, storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { User as AuthUser } from 'firebase/auth';

interface P2PModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
}

export const P2PModal: React.FC<P2PModalProps> = ({ isOpen, onClose, user }) => {
  const [accountType, setAccountType] = useState('ألعاب (Valorant, FF, الخ)');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) {
      alert("الرجاء الموافقة على شروط البيع المُلزمة.");
      return;
    }
    
    setIsUploading(true);
    let proofDataUrl = '';
    
    try {
      if (proofImage) {
        if (proofImage.size > 800 * 1024) {
          alert('حجم الصورة كبير جداً (الأقصى 800KB لضمان التخزين المحلي)');
          setIsUploading(false);
          return;
        }
        proofDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(proofImage);
        });
      }

      await addDoc(collection(db, 'p2pRequests'), {
        userId: user.uid,
        userEmail: user.email,
        accountType,
        description,
        price: Number(price),
        phone,
        proofUrl: proofDataUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    } catch (error: any) {
      console.error(error);
      alert('حدث خطأ أثناء إرسال الطلب: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-bg border border-fg/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-fg/5 flex items-center justify-between shrink-0 bg-gradient-to-r from-blue-900/40 to-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-black text-xl text-white">بيع حسابك (P2P آمن)</h3>
              <p className="text-xs text-blue-200/60 mt-1">منصة آمنة بضمان AtlasVault</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black">تم استلام طلبك بنجاح!</h3>
              <p className="text-fg/60">سيقوم فريقنا بمراجعة الحساب والتواصل معك في أقرب وقت لإتمام عملية العرض.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Trust & Policy Badge */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-4">
                <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-1" />
                <p className="text-sm text-amber-500/90 leading-relaxed font-bold">
                  هذا النموذج يعتبر عقداً مُلزماً بينك وبين المشتري برعاية AtlasVault. تقديم معلومات خاطئة يعرضك للحظر النهائي والملاحقة. نوفر هذه المساحة لخلق بيئة تداول آمنة وشفافة.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-fg/80">نوع الحساب</label>
                  <select 
                    value={accountType} 
                    onChange={e => setAccountType(e.target.value)}
                    className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option>ألعاب (Valorant, FF, الخ)</option>
                    <option>اشتراكات (Netflix, Spotify)</option>
                    <option>حسابات سوشيال ميديا</option>
                    <option>أخرى</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-fg/80">السعر المقترح (د.ت)</label>
                  <input 
                    type="number" 
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="مثال: 50"
                    className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-fg/80">تفاصيل الحساب بدقة</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="عدد السكنات، المستوى، تاريخ الإنشاء، وهل يمتلك إيميل أساسي؟"
                  className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 text-sm min-h-[100px] resize-none focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-fg/80">رقم الهاتف (للتواصل)</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="2X XXX XXX"
                    className="w-full bg-fg/5 border border-fg/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-fg/80">إثبات ملكية (صورة)</label>
                  <label className="w-full bg-fg/5 border border-fg/10 border-dashed rounded-xl px-4 py-3 text-sm flex items-center justify-between cursor-pointer hover:bg-fg/10 transition-colors">
                    <span className="text-fg/60 overflow-hidden text-ellipsis whitespace-nowrap">
                      {proofImage ? proofImage.name : 'ارفع لقطة شاشة للحساب'}
                    </span>
                    <Upload size={18} className="text-fg/40" />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setProofImage(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 mt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAgreed}
                    onChange={e => setIsAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-fg/5 border-fg/20"
                  />
                  <span className="text-sm text-fg/80 leading-relaxed font-bold">
                    أقر بأنني المالك الأصلي للحساب والمخول الوحيد ببيعه. أتعهد بنقل الملكية للمشتري بالكامل أو للإدارة، وأوافق على أن هذا تعهد مُلزم. وأعلم أن أي محاولة تلاعب ستؤدي لحظر IP الخاص بي وإبلاغ الجهات المختصة لضمان أمان مجتمعنا.
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-fg/5 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-3 font-bold text-fg/60 hover:text-fg hover:bg-fg/5 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  disabled={!isAgreed || isUploading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : 'تأكيد التعهد وإرسال العرض'}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
