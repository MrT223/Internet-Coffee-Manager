'use client';
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Upload } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

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

export default function ImageCropper({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropComplete,
  aspectRatio = 1, // 1 for square avatar
  title = "Cắt ảnh"
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    
    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedBlob);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Lỗi khi cắt ảnh. Vui lòng thử lại!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    onClose();
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl mx-4 shadow-2xl border border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-[400px] md:h-[500px] bg-slate-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
            cropShape="round"
            showGrid={false}
            style={{
              containerStyle: {
                background: '#0f172a',
              },
              cropAreaStyle: {
                border: '3px solid #3b82f6',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ZoomOut className="w-5 h-5 text-slate-300" />
              </button>
              
              <div className="flex-1 md:w-48">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ZoomIn className="w-5 h-5 text-slate-300" />
              </button>

              <button
                onClick={handleRotate}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors ml-2"
                title="Xoay 90°"
              >
                <RotateCw className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleClose}
                disabled={isProcessing}
                className="flex-1 md:flex-none px-6 py-2.5 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="flex-1 md:flex-none px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Xác nhận
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
