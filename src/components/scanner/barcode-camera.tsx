'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Flashlight, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sounds } from '@/lib/audio';

interface BarcodeCameraProps {
  onScan: (barcode: string) => void;
  active?: boolean;
}

export function BarcodeCamera({ onScan, active = true }: BarcodeCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const lastScannedRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
  }, []);

  const startScanning = useCallback(async (deviceId?: string) => {
    stopScanning();
    setErrorMsg(null);

    if (!videoRef.current) return;

    try {
      const codeReader = new BrowserMultiFormatReader();

      // List video input devices
      const videoDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      setDevices(videoDevices);

      // Prefer back camera (environment) if not explicitly specified
      let targetDeviceId = deviceId;
      if (!targetDeviceId && videoDevices.length > 0) {
        const backCamera = videoDevices.find((d) =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('belakang') ||
          d.label.toLowerCase().includes('environment')
        );
        targetDeviceId = backCamera ? backCamera.deviceId : videoDevices[0].deviceId;
      }

      if (targetDeviceId) {
        setSelectedDeviceId(targetDeviceId);
      }

      // Start decoding from video element
      const controls = await codeReader.decodeFromVideoDevice(
        targetDeviceId || undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            const code = result.getText();
            const now = Date.now();

            // Debounce same barcode within 1.5 seconds
            if (code === lastScannedRef.current.code && now - lastScannedRef.current.time < 1500) {
              return;
            }

            lastScannedRef.current = { code, time: now };
            sounds.playBeep();
            onScan(code);
          }
        }
      );

      controlsRef.current = controls;
      setHasPermission(true);

      // Check if torch/flashlight is supported
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        const track = stream?.getVideoTracks()[0];
        const capabilities = track?.getCapabilities() as { torch?: boolean };
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: unknown) {
      console.error('Camera scan error:', err);
      setHasPermission(false);
      const message = (err as Error)?.message || '';
      if (message.includes('Permission denied') || message.includes('NotAllowedError')) {
        setErrorMsg('Izin kamera ditolak. Berikan izin kamera di pengaturan browser Anda.');
      } else {
        setErrorMsg('Tidak dapat mengakses kamera perangkat atau kamera sedang digunakan.');
      }
    }
  }, [onScan, stopScanning]);

  useEffect(() => {
    if (active) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [active, startScanning, stopScanning]);

  async function toggleTorch() {
    if (!videoRef.current) return;
    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream?.getVideoTracks()[0];
      if (track) {
        const nextState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as unknown as MediaTrackConstraintSet],
        });
        setTorchOn(nextState);
      }
    } catch {
      // Torch not supported
    }
  }

  function switchCamera() {
    if (devices.length <= 1) return;
    const currentIndex = devices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    setSelectedDeviceId(nextDevice.deviceId);
    startScanning(nextDevice.deviceId);
  }

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-2xl bg-black shadow-lg border border-border/40 flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Viewfinder Target Overlay */}
      {hasPermission && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
          <div className="relative w-full h-48 border-2 border-primary/80 rounded-xl bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />

            {/* Scanning line animation */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse top-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}

      {/* Floating Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        {hasTorch && (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={toggleTorch}
            className={`h-8 w-8 rounded-full backdrop-blur-md ${torchOn ? 'bg-amber-400 text-black hover:bg-amber-300' : 'bg-black/50 text-white hover:bg-black/70'}`}
          >
            <Flashlight className="h-4 w-4" />
          </Button>
        )}

        {devices.length > 1 && (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={switchCamera}
            className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="absolute inset-0 bg-background/95 p-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <CameraOff className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">{errorMsg}</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => startScanning(selectedDeviceId)}
            className="gap-1.5"
          >
            <Camera className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      )}
    </div>
  );
}
