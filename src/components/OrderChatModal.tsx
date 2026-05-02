import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User as UserIcon, Shield, AlertCircle, CheckCircle2, Clock, Wallet, Info } from 'lucide-react';
import { Order, UserProfile } from '../types';
import { db, addDoc, collection, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, increment } from '../lib/firebase';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('d17');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
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
      await updateDoc(doc(db, 'orders', order.orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error updating status", err);
      alert('حدث خطأ أثناء تحديث حالة الطلب');
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
        <div className="w-full md:w-[400px] bg-fg/[0.02] border-l border-fg/10 flex flex-col overflow-y-auto no-scrollbar shrink-0">
          <div className="p-6 border-b border-fg/10 flex items-center justify-between">
             <h3 className="font-black text-xl">تفاصيل الطلب</h3>
             <button onClick={onClose} className="p-2 bg-fg/5 rounded-full hover:bg-fg/10 transition-colors md:hidden">
                <X size={20} />
             </button>
          </div>

          <div className="p-6 space-y-6">
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
            {order.status === 'pending' && (
               <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 space-y-4">
                  <h4 className="font-bold text-amber-500 flex items-center gap-2">
                     <Info size={18} />
                     تعليمات الدفع
                  </h4>
                  {isBuyer ? (
                     <div className="text-sm space-y-4 text-fg/80 leading-relaxed font-medium">
                        <p>الرجاء اختيار طريقة الدفع المناسبة وتحويل المبلغ المطلوب:</p>
                        
                        <div className="bg-fg/5 p-4 rounded-xl border border-fg/10 space-y-4 my-2">
                           <div>
                              <select 
                                value={selectedPaymentMethod}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                className="w-full bg-bg border border-fg/10 rounded-lg px-3 py-2 text-sm text-fg outline-none focus:border-amber-500/50 transition-colors"
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
                                  <span className="font-mono font-bold tracking-wider text-violet-500 dark:text-violet-300">{detail.value}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                        
                        <p className="text-xs opacity-70">بعد عملية الدفع، اضغط على "تم الدفع، أخبر البائع" وقم بإرسال صورة الإيصال في المحادثة لتسريع التأكيد.</p>
                     </div>
                  ) : (
                     <div className="text-sm space-y-2 text-amber-500/80 leading-relaxed">
                        <p>بانتظار أن يقوم الحريف بتحويل المبلغ.</p>
                     </div>
                  )}
               </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {isBuyer ? (
                <>
                  {order.status === 'pending' && (
                    <button onClick={() => { if(confirm('هل أنت متأكد أنك قمت بالتحويل فعلاً؟')) updateOrderStatus('paid'); }} className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-xl transition-all shadow-lg shadow-violet-500/20">
                      تم الدفع، أخبر البائع
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'paid') && (
                    <button onClick={() => { if(confirm('هل تريد فعلاً إلغاء هذا الطلب؟')) updateOrderStatus('cancelled'); }} className="w-full py-3 bg-fg/5 hover:bg-red-500/10 text-fg/60 hover:text-red-500 font-bold rounded-xl transition-all">
                      إلغاء الطلب
                    </button>
                  )}
                </>
              ) : (
                <>
                  {(order.status === 'pending' || order.status === 'paid') && (
                    <button onClick={() => { if(confirm('تأكيد استلامك للأموال وتسليم الطلب للحريف؟')) updateOrderStatus('completed'); }} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                      تأكيد استلام الأموال
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'paid') && (
                    <button onClick={() => { if(confirm('إلغاء الطلب بشكل نهائي؟')) updateOrderStatus('cancelled'); }} className="w-full py-3 bg-fg/5 hover:bg-red-500/10 text-fg/60 hover:text-red-500 font-bold rounded-xl transition-all">
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
        <div className="flex-1 flex flex-col relative h-[50vh] md:h-auto">
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
                 const isMe = msg.senderId === currentUser.uid;
                 return (
                   <div key={msg.id} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                      <div className={`max-w-[85%] p-4 rounded-3xl ${isMe ? 'bg-violet-600 text-white rounded-tr-sm shadow-md' : 'bg-fg/10 text-fg rounded-tl-sm border border-fg/5'}`}>
                         <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
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
    </div>
  );
}
