import { captureImageAsBase64 } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";

const CameraModal = ({ isOpen, onClose, onCapture, targetField }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen) {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          console.error("Gagal mengakses kamera:", err);
          alert("Pastikan Anda memberikan izin akses kamera!");
          onClose();
        }
      };
      startCamera();
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isOpen, onClose]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = captureImageAsBase64(canvasRef.current);
        onCapture(targetField, imageData);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title="Ambil Foto Tanda Tangan" className="max-w-md">
      <div className="space-y-4">
        <video ref={videoRef} autoPlay playsInline className="w-full h-64 bg-black rounded" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleCapture} className="flex-1">Ambil Foto</Button>
          <Button variant="outline" onClick={onClose} className="flex-1">Batal</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CameraModal