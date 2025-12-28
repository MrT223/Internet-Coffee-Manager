'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop';
import axiosClient from '@/api/axios';
import { 
  ArrowLeft, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Check, 
  Loader2,
  Camera
} from 'lucide-react';

// Helper function to create cropped image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
};

// Get cropped preview as data URL
const getCroppedPreview = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return canvas.toDataURL('image/jpeg', 0.8);
};

export default function AvatarEditPage() {
  const { user, updateUserAvatar, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const onCropChange = useCallback((crop) => setCrop(crop), []);
  const onZoomChange = useCallback((zoom) => setZoom(zoom), []);
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Generate preview when crop changes
  useEffect(() => {
    const generatePreview = async () => {
      if (imageSrc && croppedAreaPixels) {
        try {
          const preview = await getCroppedPreview(imageSrc, croppedAreaPixels, rotation);
          setPreviewUrl(preview);
        } catch (error) {
          console.error('Error generating preview:', error);
        }
      }
    };
    
    // Debounce preview generation
    const timeoutId = setTimeout(generatePreview, 100);
    return () => clearTimeout(timeoutId);
  }, [imageSrc, croppedAreaPixels, rotation]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Vui lòng chọn file ảnh!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.warning('Ảnh không được quá 10MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setPreviewUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      
      const formData = new FormData();
      formData.append('avatar', croppedBlob, 'avatar.jpg');

      const res = await axiosClient.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.avatar) {
        updateUserAvatar(res.data.avatar);
        router.push('/profile');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi upload ảnh. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Cập nhật Avatar</h1>
              <p className="text-sm text-slate-400">Chọn và cắt ảnh đại diện của bạn</p>
            </div>
          </div>

          {imageSrc && (
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 font-medium flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Lưu Avatar
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!imageSrc ? (
          /* Upload Area */
          <div className="flex flex-col items-center justify-center">
            {/* Current Avatar */}
            <div className="mb-8 text-center">
              <p className="text-slate-400 mb-4">Avatar hiện tại</p>
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>

            {/* Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-xl border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-12 text-center cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-900"
            >
              <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Chọn ảnh mới
              </h3>
              <p className="text-slate-400 mb-4">
                Kéo thả ảnh vào đây hoặc click để chọn
              </p>
              <p className="text-sm text-slate-500">
                Hỗ trợ: JPG, PNG, GIF, WEBP (tối đa 10MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          /* Cropper Area */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Cropper */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="relative h-[500px] bg-slate-950">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={1}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropComplete}
                    cropShape="round"
                    showGrid={false}
                    style={{
                      containerStyle: { background: '#0f172a' },
                      cropAreaStyle: {
                        border: '3px solid #3b82f6',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                      },
                    }}
                  />
                </div>

                {/* Controls */}
                <div className="p-4 border-t border-slate-800">
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {/* Zoom */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <ZoomOut className="w-5 h-5 text-slate-300" />
                      </button>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <button
                        onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <ZoomIn className="w-5 h-5 text-slate-300" />
                      </button>
                    </div>

                    {/* Rotate */}
                    <button
                      onClick={handleRotate}
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <RotateCw className="w-5 h-5 text-slate-300" />
                    </button>

                    {/* Reset */}
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Reset
                    </button>

                    {/* Change Image */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Đổi ảnh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-6 text-center">
                  Xem trước
                </h3>

                <div className="space-y-6">
                  {/* Large Preview */}
                  <div className="flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg shadow-blue-500/20 bg-slate-800">
                      {previewUrl && (
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-sm text-slate-500 mt-2">Trang cá nhân</span>
                  </div>

                  {/* Size Previews */}
                  <div className="flex justify-center gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
                        {previewUrl && (
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 mt-1">Bình luận</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800">
                        {previewUrl && (
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 mt-1">Góc trên</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
                  <p className="text-sm text-slate-400 text-center">
                    💡 Kéo để di chuyển, cuộn để zoom
                  </p>
                </div>

                {/* Mobile Save Button */}
                <button
                  onClick={handleSave}
                  disabled={isUploading}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2 lg:hidden"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Lưu Avatar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
