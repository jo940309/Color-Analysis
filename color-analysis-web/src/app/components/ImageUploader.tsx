import { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (file: File, url: string) => void;
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      onImageUpload(file, url);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <form
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className="relative"
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-primary bg-primary/10 scale-105'
              : 'border-border bg-accent/20 hover:border-primary/50 hover:bg-accent/40'
          }`}
          onClick={onButtonClick}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="relative w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                {dragActive ? (
                  <ImageIcon className="w-10 h-10 text-primary" />
                ) : (
                  <Upload className="w-10 h-10 text-primary" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg">
                {dragActive ? '放開以上傳圖片' : '上傳您的照片'}
              </h3>
              <p className="text-sm text-muted-foreground">
                拖曳圖片到此處，或點擊選擇檔案
              </p>
              <p className="text-xs text-muted-foreground">
                支援 JPG、PNG 格式
              </p>
            </div>

            <button
              type="button"
              className="mt-4 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={onButtonClick}
            >
              選擇圖片
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
