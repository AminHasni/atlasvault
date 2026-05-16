import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User as UserIcon, Shield, AlertCircle, CheckCircle2, Clock, Wallet, Info, Paperclip, FileText, Download, Loader2, AlertTriangle, Lock } from 'lucide-react';
import { Order, UserProfile, Message as MessageType } from '../types';
import { storage, db, addDoc, collection, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, increment } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { User } from 'firebase/auth';

interface Message {
  id: string;
  text: string;
  senderId: string;
  isAdmin: boolean;
  createdAt: any;
}

interface OrderChatModalProps {
  order: Order;
  currentUser: User;
  profile: UserProfile | null;
  onClose: () => void;
}

export function OrderChatModal({ order, currentUser, profile, onClose }: OrderChatModalProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('d17');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Security confirmation state
  const [confirmAction, setConfirmAction] = useState<'paid' | 'completed' | 'cancelled' | null>(null);
  const [isAgreed, setIsAgreed] = useState(false);

  const paymentMethods = [
    {
      id: 'd17',
      name: 'تطبيق D17',
      details: [
        { label: 'رقم الهاتف', value: '55 123 456' },
        { label: 'الاسم', value: 'Mohamed Amine Hasni' }
      ]
    },
    {
      id: 'bank',
      name: 'تحويل بنكي',
      details: [
        { label: 'البنك', value: 'Attijari Bank' },
        { label: 'RIB', value: '04 000 0000000000000 00' },
        { label: 'الاسم', value: 'Mohamed Amine Hasni' }
      ]
    },
    {
      id: 'flouci',
      name: 'تطبيق Flouci',
      details: [
        { label: 'رقم الهاتف', value: '55 123 456' }
      ]
    }
  ];

  useEffect(() => {
    const q = query(collection(db, 'orders', order.orderId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MessageType));
      setMessages(fetched);
    }, (err) => console.error("Chat snapshot error:", err));
    return () => unsub();
  }, [order.orderId]);

  useEffect(() => {
    const clearUnread = async () => {
      if (!order.orderId) return;
      const isAdminUser = profile?.isAdmin || false;
      const updateData = isAdminUser ? { unreadMessagesAdmin: 0 } : { unreadMessagesUser: 0 };
      try {
        await updateDoc(doc(db, 'orders', order.orderId), updateData);
      } catch (e) {
        console.error(e);
      }
    };
    clearUnread();
  }, [order.orderId, profile?.isAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order.orderId) return;

    if (file.size > 800 * 1024) {
      alert('حجم الملف كبير جداً (الأقصى 800KB لضمان التخزين المحلي)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });

      const isSenderAdmin = profile?.isAdmin || false;
      
      await addDoc(collection(db, 'orders', order.orderId, 'messages'), {
        text: `أرسل ملفاً: ${file.name}`,
        senderId: currentUser.uid,
        isAdmin: isSenderAdmin,
        createdAt: serverTimestamp(),
        attachment: {
          url: dataUrl,
          name: file.name,
          type: file.type
        }
      });

      const unreadField = isSenderAdmin ? 'unreadMessagesUser' : 'unreadMessagesAdmin';
      await updateDoc(doc(db, 'orders', order.orderId), {
        [unreadField]: increment(1)
      });

      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error("Upload error", err);
      alert('خطأ غير متوقع: ' + err.message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage('');

    try {
      const isSenderAdmin = profile?.isAdmin || false;
      await addDoc(collection(db, 'orders', order.orderId, 'messages'), {
        text,
        senderId: currentUser.uid,
        isAdmin: isSenderAdmin,
        createdAt: serverTimestamp(),
      });

      const unreadField = isSenderAdmin ? 'unreadMessagesUser' : 'unreadMessagesAdmin';
      await updateDoc(doc(db, 'orders', order.orderId), {
        [unreadField]: increment(1)
      });

      // Notify the other party
      await addDoc(collection(db, 'notifications'), {
        userId: isSenderAdmin ? order.userId : 'admin',
        title: 'رسالة جديدة',
        message: `رسالة جديدة في طلب رقم #${order.orderId.substring(0,6)}`,
        isRead: false,
        link: isSenderAdmin ? 'orders' : 'admin-orders',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const updateOrderStatus = async (newStatus: 'pending' | 'paid' | 'completed' | 'cancelled') => {
    try {
      const isSenderAdmin = profile?.isAdmin || false;
      const unreadField = isSenderAdmin ? 'unreadMessagesUser' : 'unreadMessagesAdmin';

      await updateDoc(doc(db, 'orders', order.orderId), {
        status: newStatus,
        [unreadField]: increment(1),
        updatedAt: serverTimestamp()
      });

      let statusMessage = '';
      if (newStatus === 'paid') statusMessage = 'قام الحريف بتأكيد الدفع 💰';
      if (newStatus === 'completed') statusMessage = 'تم تنفيذ وتسليم الطلب بنجاح ✅';
      if (newStatus === 'cancelled') statusMessage = 'تم إلغاء الطلب ❌';
      
      if (statusMessage) {
        await addDoc(collection(db, 'orders', order.orderId, 'messages'), {
          text: statusMessage,
          senderId: currentUser.uid,
          isAdmin: isSenderAdmin,
          createdAt: serverTimestamp(),
          isSystemMessage: true,
        });

        // Notify the other party
        await addDoc(collection(db, 'notifications'), {
          userId: isSenderAdmin ? order.userId : 'admin',
          title: 'تحديث في الطلب',
          message: statusMessage + ` (طلب #${order.orderId.substring(0,6)})`,
          isRead: false,
          link: isSenderAdmin ? 'orders' : 'admin-orders',
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error("Error updating status", err);
      alert('حدث خطأ أثناء تحديث حالة الطلب: ' + err.message);
    }
  };

  const getStatusDisplay = () => {
    switch (order.status) {
      case 'completed': return { text: 'تم التنفيذ', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <CheckCircle2 size={16} /> };
      case 'cancelled': return { text: 'ملغى', color: 'text-red-500', bg: 'bg-red-500/10', icon: <AlertCircle size={16} /> };
      case 'paid': return { text: 'في انتظار التأكيد', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: <Clock size={16} /> };
      default: return { text: 'في انتظار الدفع', color: 'text-violet-500', bg: 'bg-violet-500/10', icon: <Wallet size={16} /> };
    }
  };

  const statusInfo = getStatusDisplay();
  const isBuyer = currentUser.uid === order.userId;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel border border-fg/10 rounded-[2.5rem] w-full max-w-5xl h-[90vh] flex flex-col md:flex-row shadow-2xl overflow-hidden" dir="rtl">
        
        {/* Right Side: Order Details & Actions */}
        <div className="w-full md:w-[400px] max-h-[40vh] md:max-h-full bg-fg/[0.02] border-b md:border-b-0 md:border-l border-fg/10 flex flex-col overflow-y-auto shrink-0 z-10 custom-scrollbar">
          <div className="p-4 md:p-6 border-b border-fg/10 flex items-center justify-between sticky top-0 bg-panel/90 backdrop-blur-md z-20">
             <h3 className="font-black text-lg md:text-xl">تفاصيل الطلب</h3>
             <button onClick={onClose} className="p-2 bg-fg/5 rounded-full hover:bg-fg/10 transition-colors md:hidden">
                <X size={20} />
             </button>
          </div>

          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Amount */}
            <div className="text-center">
              <p className="text-sm font-bold text-fg/40 mb-1">المبلغ المطلوب</p>
              <div className="text-4xl font-black text-violet-400">
                {(Number(order.total) || 0).toFixed(3)} DT
              </div>
              <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.text}
              </div>
            </div>

            {/* Content Details */}
            <div className="bg-fg/5 rounded-3xl p-5 space-y-4">
              <h4 className="font-bold text-sm text-fg/60">عناصر الطلب</h4>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold flex items-center gap-2">{item.image} {item.name}</span>
                      <span className="text-fg/60">x{item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-fg/10 flex justify-between text-xs text-fg/40">
                <span>رقم الطلب</span>
                <span className="font-mono">#{order.orderId.slice(-8)}</span>
              </div>
            </div>

            {/* Payment Instructions / Action Rules */}
            <div className="space-y-4">
              {order.status === 'pending' && (
                 <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 space-y-4">
                    <h4 className="font-bold text-amber-500 flex items-center gap-2">
                       <Shield size={18} />
                       تعليمات الدفع الآمن
                    </h4>
                    {isBuyer ? (
                       <div className="text-sm space-y-4 text-fg/80 leading-relaxed font-medium">
                          <p>يجب تحويل المبلغ المطلوب من خلال إحدى طرق الدفع التالية لتجنب إلغاء الطلب تلقائياً:</p>
                          
                          <div className="bg-bg border border-amber-500/20 p-4 rounded-xl space-y-4 my-2 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-1 h-full bg-amber-500 rounded-r-lg" />
                             <div>
                                <select 
                                  value={selectedPaymentMethod}
                                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                  className="w-full bg-fg/5 border border-fg/10 rounded-lg px-3 py-2 text-sm text-fg outline-none focus:border-amber-500/50 transition-colors font-bold"
                                >
                                  {paymentMethods.map(method => (
                                    <option key={method.id} value={method.id} className="bg-bg text-fg">
                                      {method.name}
                                    </option>
                                  ))}
                                </select>
                             </div>
                             
                             <div className="space-y-2 pt-2 border-t border-fg/10">
                                {paymentMethods.find(m => m.id === selectedPaymentMethod)?.details.map((detail, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="text-fg/60">{detail.label}</span>
                                    <span className="font-mono font-black tracking-wider text-violet-500 dark:text-violet-400 select-all">{detail.value}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                          
                          <div className="bg-amber-500/10 p-3 rounded-lg text-xs flex items-start gap-2">
                            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-amber-600 dark:text-amber-400">تنبيه أمان: لا تقم بكتابة أي كلمات تخص العملات الرقمية أو الحسابات الوهمية في ملاحظات التحويل البنكي أو D17 لتجنب تجميد حسابك.</p>
                          </div>
                          <p className="text-xs opacity-70">بعد الدفع والتأكد، اضغط على زر "تم الدفع، أخبر البائع" وأرسل صورة الإثبات في الدردشة.</p>
                       </div>
                    ) : (
                       <div className="text-sm space-y-2 text-amber-500/80 leading-relaxed">
                          <p>بانتظار أن يقوم الحريف بدفع المبلغ ({Number(order.total).toFixed(3)} DT) وتأكيده.</p>
                       </div>
                    )}
                 </div>
              )}
              
              {order.status === 'paid' && !isBuyer && (
                 <div className="bg-violet-500/10 border border-violet-500/20 rounded-3xl p-5 space-y-4">
                    <h4 className="font-bold text-violet-500 flex items-center gap-2">
                       <Shield size={18} />
                       التحقق من الدفع (إجراء أمني)
                    </h4>
                    <div className="text-sm space-y-3 text-fg/80 leading-relaxed">
                       <p>قام الحريف بتأكيد إجراء التحويل. يرجى مراجعة حسابك المصرفي أو تطبيق D17 الخاص بك واستلام صورة الإثبات.</p>
                       <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2">
                         <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                         <p>تحذير: لا تفرج عن الطلب أو العملات قبل التأكد الفعلي من دخول المبلغ في حسابك. إيصالات التحويل يمكن تزويرها!</p>
                       </div>
                    </div>
                 </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {isBuyer ? (
                <>
                  {order.status === 'pending' && (
                    <button onClick={() => { setConfirmAction('paid'); setIsAgreed(false); }} className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-xl transition-all shadow-lg shadow-violet-500/20">
                      تم الدفع، أخبر البائع
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'paid') && (
                    <button onClick={() => { setConfirmAction('cancelled'); setIsAgreed(false); }} className="w-full py-3 bg-fg/5 hover:bg-red-500/10 text-fg/60 hover:text-red-500 font-bold rounded-xl transition-all">
                      إلغاء الطلب
                    </button>
                  )}
                </>
              ) : (
                <>
                  {(order.status === 'pending' || order.status === 'paid') && (
                    <button onClick={() => { setConfirmAction('completed'); setIsAgreed(false); }} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                      تأكيد استلام الأموال
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'paid') && (
                    <button onClick={() => { setConfirmAction('cancelled'); setIsAgreed(false); }} className="w-full py-3 bg-fg/5 hover:bg-red-500/10 text-fg/60 hover:text-red-500 font-bold rounded-xl transition-all">
                      إلغاء الطلب
                    </button>
                  )}
                  {order.status === 'completed' && (
                     <button className="w-full py-3 bg-emerald-500/10 text-emerald-500 font-bold rounded-xl cursor-default border border-emerald-500/20">
                        الطلب مكتمل ومنفذ
                     </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Left Side: Chat */}
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
           {/* Desktop Header */}
           <div className="hidden md:flex px-6 py-4 border-b border-fg/10 bg-fg/[0.01] items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
               <div>
                 <h3 className="font-black text-lg flex items-center gap-2">
                    <Shield size={18} className="text-violet-400" />
                    محادثة ملحقة بالطلب
                 </h3>
               </div>
             </div>
             <button onClick={onClose} className="p-2 bg-fg/5 rounded-full hover:bg-fg/10 transition-colors">
               <X size={20} />
             </button>
           </div>

           {/* Mobile Header (When stacked) */}
           <div className="md:hidden px-6 py-3 border-y border-fg/10 bg-fg/[0.03] shrink-0 font-bold text-sm flex items-center gap-2">
             <Shield size={16} className="text-violet-400" /> محادثة الطلب
           </div>

           {/* Messages */}
           <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-fg/5">
             <div className="bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold p-3 rounded-2xl text-center mx-auto max-w-sm mb-6">
                💡 التداول بأمان: قم بإرفاق صور تحويل الأموال هنا لتسريع العملية. لا تقم بتحويل الأموال خارج القنوات المتفق عليها.
             </div>

             {messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-fg/30 space-y-4">
                  <p>لا توجد رسائل بعد</p>
               </div>
             ) : (
               messages.map((msg) => {
                 if (msg.isSystemMessage) {
                   return (
                     <div key={msg.id} className="flex justify-center w-full my-6">
                       <div className="bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold text-center flex flex-col sm:flex-row items-center justify-center gap-2 max-w-[90%] shadow-sm">
                         <AlertCircle size={16} className="shrink-0" />
                         <span>{msg.text}</span>
                       </div>
                     </div>
                   );
                 }
                 const isMe = msg.senderId === currentUser.uid;
                 return (
                   <div key={msg.id} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                      <div className={`max-w-[85%] p-4 rounded-3xl ${isMe ? 'bg-violet-600 text-white rounded-tr-sm shadow-md' : 'bg-fg/10 text-fg rounded-tl-sm border border-fg/5'}`}>
                         <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                         
                         {msg.attachment && (
                           msg.attachment.type.startsWith('image/') ? (
                             <div className="mt-3 overflow-hidden rounded-2xl border border-black/10 shadow-lg group relative">
                                <img src={msg.attachment.url} alt={msg.attachment.name} className="max-w-full h-auto max-h-64 object-contain" />
                                <a href={msg.attachment.url} download={msg.attachment.name} className="absolute bottom-2 left-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                  <Download size={16} />
                                </a>
                             </div>
                           ) : (
                             <div className="mt-3 p-3 bg-black/5 rounded-2xl border border-black/10 flex items-center gap-3 group/file">
                               <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center shrink-0">
                                 <FileText size={20} />
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className="text-xs font-bold truncate">{msg.attachment.name}</p>
                                 <a 
                                   href={msg.attachment.url} 
                                   download={msg.attachment.name}
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="text-[10px] text-fg/60 hover:text-fg flex items-center gap-1 mt-1 transition-colors underline decoration-black/20"
                                 >
                                   <Download size={10} /> تحميل الملف
                                 </a>
                               </div>
                             </div>
                           )
                         )}
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 px-2 text-[10px] text-fg/40 font-bold">
                         {msg.isAdmin ? <Shield size={10} className="text-violet-400" /> : <UserIcon size={10} />}
                         <span>{msg.isAdmin ? 'الدعم الفني' : 'الحريف'}</span>
                      </div>
                   </div>
                 );
               })
             )}
             <div ref={messagesEndRef} />
           </div>

           {/* Chat Input */}
           <form onSubmit={handleSend} className="p-4 bg-fg/[0.02] border-t border-fg/10 shrink-0">
              <div className="flex items-center gap-2">
                 <input 
                   type="file" 
                   ref={fileInputRef}
                   onChange={handleFileUpload}
                   className="hidden"
                   accept="image/*,.pdf,.doc,.docx"
                 />
                 <button 
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isUploading || order.status === 'cancelled' || order.status === 'completed'}
                   className="w-14 h-14 bg-fg/5 hover:bg-fg/10 text-fg rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 shrink-0 relative overflow-hidden"
                 >
                   {isUploading ? (
                     <>
                       <Loader2 size={20} className="animate-spin z-10" />
                       <div className="absolute inset-x-0 bottom-0 bg-violet-500/20 transition-all duration-300" style={{ height: `${uploadProgress}%` }} />
                       <span className="absolute bottom-1 text-[8px] font-bold z-10">{uploadProgress}%</span>
                     </>
                   ) : <Paperclip size={20} />}
                 </button>
                 <input 
                   type="text" 
                   value={newMessage}
                   onChange={e => setNewMessage(e.target.value)}
                   placeholder="اكتب رسالتك هنا..." 
                   className="flex-1 bg-fg/5 border border-fg/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-violet-500 transition-colors shadow-inner"
                   disabled={order.status === 'cancelled' || order.status === 'completed'}
                 />
                 <button 
                   type="submit" 
                   disabled={!newMessage.trim() || order.status === 'cancelled' || order.status === 'completed'}
                   className="w-14 h-14 bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center rounded-2xl transition-all disabled:opacity-50 disabled:hover:bg-violet-600 shrink-0 shadow-lg shadow-violet-500/20"
                 >
                    <Send size={20} className={newMessage.trim() ? "translate-x-[-2px]" : ""} />
                 </button>
              </div>
           </form>
        </div>

      </div>

      {/* Security Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
          <div className="relative bg-bg border border-fg/10 rounded-3xl w-full max-w-md p-6 overflow-hidden" dir="rtl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-full ${confirmAction === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {confirmAction === 'cancelled' ? <AlertTriangle size={24} /> : <Lock size={24} />}
              </div>
              <div>
                <h3 className="font-black text-xl">
                  {confirmAction === 'paid' && 'تأكيد الدفع'}
                  {confirmAction === 'completed' && 'تأكيد استلام الأموال والإفراج'}
                  {confirmAction === 'cancelled' && 'إلغاء الطلب'}
                </h3>
                <p className="text-xs text-fg/60">إجراء أمني للتحقق</p>
              </div>
            </div>

            <div className="bg-fg/5 rounded-2xl p-4 mb-6 text-sm font-medium leading-relaxed">
              {confirmAction === 'paid' && (
                <p className="text-fg/80">
                  يرجى التأكد من أنك قمت بتحويل مبلغ <span className="font-black text-violet-400">{(Number(order.total) || 0).toFixed(3)} DT</span> كاملاً إلى حساب البائع. النقر على تأكيد دون إتمام الدفع قد يؤدي إلى حظر حسابك.
                </p>
              )}
              {confirmAction === 'completed' && (
                <p className="text-amber-600 dark:text-amber-400">
                  <strong className="block mb-2">انتبه بشدة:</strong>
                  تأكد من تسجيل الدخول إلى حسابك البنكي أو حساب D17 الخاص بك والتحقق من وصول المبلغ كاملاً. <strong>لا تعتمد فقط على صورة الإيصال المرسلة من الحريف!</strong>
                </p>
              )}
              {confirmAction === 'cancelled' && (
                <p className="text-fg/80">
                  هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ إذا كنت قد قمت بالدفع فعلياً، يرجى عدم إلغاء الطلب والتواصل مع الدعم الفني بدلاً من ذلك.
                </p>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer group mb-8">
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input 
                  type="checkbox" 
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-fg/30 rounded bg-transparent checked:bg-violet-500 checked:border-violet-500 transition-colors"
                />
                <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-sm font-bold text-fg/80 group-hover:text-fg transition-colors select-none">
                {confirmAction === 'paid' && 'أؤكد أنني قمت بتحويل المبلغ كاملاً وأتحمل المسؤولية الكلية.'}
                {confirmAction === 'completed' && 'أؤكد أنني تحققت بنفسي من وصول الأموال إلى حسابي.'}
                {confirmAction === 'cancelled' && 'أؤكد أنني أريد إلغاء الطلب بشكل نهائي.'}
              </span>
            </label>

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 bg-fg/5 hover:bg-fg/10 text-fg font-bold rounded-xl transition-colors"
              >
                تراجع
              </button>
              <button 
                onClick={() => {
                  if (!isAgreed) return;
                  updateOrderStatus(confirmAction);
                  setConfirmAction(null);
                }}
                disabled={!isAgreed}
                className={`flex-1 py-3 font-black rounded-xl transition-all shadow-lg ${
                  confirmAction === 'cancelled'
                  ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20 disabled:bg-red-500/50'
                  : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20 disabled:bg-violet-500/50'
                }`}
              >
                {confirmAction === 'cancelled' ? 'تأكيد الإلغاء' : 'تأكيد'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
