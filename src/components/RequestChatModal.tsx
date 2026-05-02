import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User as UserIcon, Shield, AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';
import { ServiceRequest, UserProfile } from '../types';
import { db, addDoc, collection, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, increment } from '../lib/firebase';
import { User } from 'firebase/auth';

interface Message {
  id: string;
  text: string;
  senderId: string;
  isAdmin: boolean;
  createdAt: any;
}

interface RequestChatModalProps {
  request: ServiceRequest;
  currentUser: User;
  profile: UserProfile | null;
  onClose: () => void;
}

export function RequestChatModal({ request, currentUser, profile, onClose }: RequestChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'serviceRequests', request.id!, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(fetched);
    }, (err) => console.error("Chat snapshot error:", err));
    return () => unsub();
  }, [request.id]);

  useEffect(() => {
    const clearUnread = async () => {
      if (!request.id) return;
      const isAdminUser = profile?.isAdmin || false;
      const updateData = isAdminUser ? { unreadMessagesAdmin: 0 } : { unreadMessagesUser: 0 };
      try {
        await updateDoc(doc(db, 'serviceRequests', request.id), updateData);
      } catch (e) {
        console.error(e);
      }
    };
    clearUnread();
  }, [request.id, profile?.isAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !request.id) return;

    const text = newMessage;
    setNewMessage('');

    try {
      const isSenderAdmin = profile?.isAdmin || false;
      await addDoc(collection(db, 'serviceRequests', request.id, 'messages'), {
        text,
        senderId: currentUser.uid,
        isAdmin: isSenderAdmin,
        createdAt: serverTimestamp(),
      });

      const unreadField = isSenderAdmin ? 'unreadMessagesUser' : 'unreadMessagesAdmin';
      await updateDoc(doc(db, 'serviceRequests', request.id), {
        [unreadField]: increment(1)
      });

      // Notify the other party
      await addDoc(collection(db, 'notifications'), {
        userId: isSenderAdmin ? request.userId : 'admin',
        title: 'رسالة جديدة',
        message: `رسالة جديدة في طلب الخدمة: ${request.title}`,
        isRead: false,
        link: isSenderAdmin ? 'requests' : 'admin-requests', // admin panel doesn't use links yet but it's fine
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const updateRequestStatus = async (newStatus: 'pending' | 'in-progress' | 'completed' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'serviceRequests', request.id!), {
        status: newStatus,
      });
    } catch (err) {
      console.error("Error updating status", err);
      alert('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const getStatusDisplay = () => {
    switch (request.status) {
      case 'completed': return { text: 'مكتمل', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <CheckCircle2 size={16} /> };
      case 'rejected': return { text: 'مرفوض', color: 'text-red-500', bg: 'bg-red-500/10', icon: <AlertCircle size={16} /> };
      case 'in-progress': return { text: 'قيد التنفيذ', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: <Clock size={16} /> };
      default: return { text: 'في انتظار المراجعة', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: <Clock size={16} /> };
    }
  };

  const statusInfo = getStatusDisplay();
  const isBuyer = currentUser.uid === request.userId;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-panel border border-fg/10 rounded-[2.5rem] w-full max-w-5xl h-[90vh] flex flex-col md:flex-row shadow-2xl overflow-hidden" dir="rtl">
        
        {/* Right Side: Request Details & Actions */}
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
              <p className="font-bold text-lg mb-1">{request.title}</p>
              <div className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.icon}
                {statusInfo.text}
              </div>
            </div>

            {/* Content Details */}
            <div className="bg-fg/5 rounded-3xl p-5 space-y-4">
              <h4 className="font-bold text-sm text-fg/60">الوصف</h4>
              <p className="text-sm leading-relaxed">{request.description}</p>
              <div className="pt-3 border-t border-fg/10 flex justify-between text-xs text-fg/40">
                <span>تاريخ الطلب</span>
                <span className="font-mono">
                  {request.createdAt?.seconds ? new Date(request.createdAt.seconds * 1000).toLocaleDateString() : 'الآن'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {!isBuyer && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => { if(confirm('الموافقة على الطلب والبدء في تنفيذه؟')) updateRequestStatus('in-progress'); }} className="py-3 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white font-bold rounded-xl transition-all">
                       قيد التنفيذ
                     </button>
                     <button onClick={() => { if(confirm('تنفيذ وتأكيد إكمال الطلب؟')) updateRequestStatus('completed'); }} className="py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white font-bold rounded-xl transition-all">
                       مكتمل
                     </button>
                  </div>
                  <button onClick={() => { if(confirm('رفض الطلب وإغلاقه؟')) updateRequestStatus('rejected'); }} className="w-full py-3 bg-fg/5 hover:bg-red-500/10 text-fg/60 hover:text-red-500 font-bold rounded-xl transition-all">
                    رفض الطلب
                  </button>
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
                    محادثة الخدمة المطلوبة
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
             <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold p-3 rounded-2xl text-center mx-auto max-w-sm mb-6">
                💡 تواصل مباشرة لمعرفة إمكانية توفير الخدمة ومدى توفرها.
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
                 />
                 <button 
                   type="submit" 
                   disabled={!newMessage.trim()}
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
