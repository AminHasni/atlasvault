import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, className = '', label = 'صورة' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onChange(dataUrl);
          setProgress(100);
          setUploading(false);
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        };
        img.onerror = () => {
          alert('فشل قراءة الصورة');
          setUploading(false);
        };
        img.src = event.target?.result as string;
      };
      
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProgress(p => {
          if (p >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return p + 10;
        });
      }, 100);

      reader.onloadend = () => clearInterval(progressInterval);
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert('حدث خطأ');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-bold text-fg/60">{label}</label>}
      <div className="relative">
        {value ? (
          <div className="relative rounded-xl overflow-hidden border border-fg/10 group bg-fg/5 flex items-center justify-center p-2 min-h-[120px]">
            <img src={value} alt="Uploaded" className="max-h-[200px] object-contain rounded-lg" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md hover:bg-red-600 z-10"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-fg/20 hover:border-violet-500/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-fg/[0.02] hover:bg-fg/[0.05] min-h-[120px] ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="text-violet-500 animate-spin" />
                <span className="text-sm font-bold text-fg/60" dir="ltr">{Math.round(progress)}% جاري الرفع...</span>
              </div>
            ) : (
              <>
                <Upload size={24} className="text-fg/40 mb-2" />
                <span className="text-sm font-bold text-fg/60">اضغط لرفع صورة</span>
                <span className="text-xs text-fg/40 mt-1">PNG, JPG, WEBP</span>
              </>
            )}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
