import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Cropper from 'react-easy-crop';

interface Props {
  open: boolean;
  imageSrc: string | null;
  outputSize?: number; // fallback square size
  outputWidth?: number;
  outputHeight?: number;
  aspect?: number;
  onClose: () => void;
  onApply: (dataUrl: string) => void;
}

export default function AvatarCropDialog({ open, imageSrc, outputSize = 400, outputWidth, outputHeight, aspect = 1, onClose, onApply }: Props) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any | null>(null);

  const onCropComplete = (_: any, croppedArea: any) => {
    setCroppedAreaPixels(croppedArea);
  };

  async function createImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', error => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });
  }

  async function getCroppedImg(imageSrc: string, pixelCrop: any, outputW?: number, outputH?: number) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const w = outputW || outputSize;
    const h = outputH || outputSize;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      w,
      h
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  }

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const dataUrl = await getCroppedImg(imageSrc, croppedAreaPixels, outputWidth, outputHeight);
      onApply(dataUrl);
    } catch (err) {
      console.error('Error cropping image:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { background: '#071021', color: '#cbd5e0', borderRadius: 2 } }}
    >
      <DialogTitle sx={{ background: 'transparent', color: '#e6eef8' }}>Recortar foto</DialogTitle>
      <DialogContent sx={{ paddingTop: 0 }}>
        <div style={{ position: 'relative', width: '100%', height: 400, background: '#071021', borderRadius: 8, overflow: 'hidden', border: '1px solid #2d4356' }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={(c) => setCrop(c)}
              onZoomChange={(z) => setZoom(z)}
              onCropComplete={onCropComplete}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ color: '#9fb0c8', fontSize: 13 }}>Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ accentColor: '#5b9bd5', width: 160 }}
            />
          </div>
        </div>
      </DialogContent>
      <DialogActions sx={{ padding: '12px 16px' }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderColor: '#2d4356', color: '#cbd5e0' }}>Cancelar</Button>
        <Button variant="contained" onClick={handleApply} disabled={!croppedAreaPixels} sx={{ ml: 1 }}>Aplicar</Button>
      </DialogActions>
    </Dialog>
  );
}
