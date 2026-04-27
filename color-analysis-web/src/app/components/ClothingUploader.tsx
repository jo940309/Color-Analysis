import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ClothingUploaderProps {
  onImageUpload: (file: File, url: string) => void;
}

export function ClothingUploader({ onImageUpload }: ClothingUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // 驗證文件類型
    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片檔案');
      return;
    }

    // 驗證文件大小（限制 10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('圖片大小不能超過 10MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageUpload(file, url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-300 hover:border-primary/50 hover:bg-accent/30
            ${isDragging ? 'border-primary bg-accent/50 scale-[1.02]' : 'border-border'}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-2">
              <p className="text-lg">上傳衣服圖片</p>
              <p className="text-sm text-muted-foreground">
                點擊上傳或拖放圖片到此處
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              支援 JPG, PNG, WEBP 格式，最大 10MB
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
            <img
              src={preview}
              alt="上傳的衣服"
              className="w-full h-auto max-h-96 object-contain bg-muted"
            />

            <button
              onClick={handleClear}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="w-4 h-4" />
            <span>圖片已上傳，點擊「開始分析」繼續</span>
          </div>
        </div>
      )}
    </div>
  );
}
