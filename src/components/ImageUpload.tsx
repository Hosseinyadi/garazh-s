import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Supabase removed: images will be converted to Data URLs for submission to backend
import { Upload, X, Loader2 } from 'lucide-react';
import { validateFileUpload, logSecurityEvent } from '@/utils/security';

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
  maxSize?: number; // in MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImagesChange, 
  maxImages = 5, 
  maxSize = 5 
}) => {
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages: File[] = [];

    for (const file of Array.from(files)) {
      // Use security validation
      const validation = validateFileUpload(file, {
        maxSize: maxSize * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif']
      });

      if (!validation.isValid) {
        logSecurityEvent('INVALID_FILE_UPLOAD', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          error: validation.error
        });
        alert(validation.error);
        continue;
      }

      newImages.push(file);
    }

    if (images.length + newImages.length > maxImages) {
      alert(`حداکثر ${maxImages} تصویر مجاز است`);
      return;
    }

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (images.length === 0) {
      onImagesChange([]);
      return;
    }

    setUploading(true);
    try {
      const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadPromises = images.map(async (file, index) => {
        setUploadProgress(prev => ({ ...prev, [index]: 0 }));
        const dataUrl = await toDataUrl(file);
        setUploadProgress(prev => ({ ...prev, [index]: 100 }));
        return dataUrl;
      });

      const urls = await Promise.all(uploadPromises);
      onImagesChange(urls);
      
      // Clear local images after successful upload
      setImages([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Upload error:', error);
      alert('خطا در آپلود تصاویر');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="image-upload"
          disabled={uploading || images.length >= maxImages}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">
            برای انتخاب تصاویر کلیک کنید
          </p>
          <p className="text-xs text-gray-500">
            حداکثر {maxImages} تصویر، هر کدام تا {maxSize} مگابایت
          </p>
        </label>
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {images.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`تصویر ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 w-6 h-6 p-0"
                  onClick={() => removeImage(index)}
                  disabled={uploading}
                >
                  <X className="w-3 h-3" />
                </Button>
                {uploadProgress[index] !== undefined && (
                  <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 rounded text-white text-xs p-1">
                    {uploadProgress[index]}%
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {images.length} تصویر انتخاب شده
            </span>
            <Button
              onClick={uploadImages}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              آپلود تصاویر
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
