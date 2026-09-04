import React, { useRef, useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File) => void;
  isSaving: boolean;
  existingSignature?: string;
}

export default function SignatureDialog({ isOpen, onClose, onSave, isSaving, existingSignature }: SignatureDialogProps) {
  const [activeTab, setActiveTab] = useState<"draw" | "upload">("draw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Canvas drawing logic
  useEffect(() => {
    if (activeTab === "draw" && isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
      }
    }
  }, [activeTab, isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    const pos = getPointerPos(e, canvas);
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPointerPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    if (activeTab === "upload") {
      if (uploadFile) {
        onSave(uploadFile);
      }
    } else {
      // Draw tab
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "signature.png", { type: "image/png" });
          onSave(file);
        }
      }, "image/png");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
      <div className="relative w-full max-w-[500px] overflow-hidden rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
        <h4 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
          Manage Signature
        </h4>
        
        <div className="flex gap-4 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
          <button
            className={`text-sm font-medium ${activeTab === "draw" ? "text-brand-500" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            onClick={() => setActiveTab("draw")}
          >
            Draw Signature
          </button>
          <button
            className={`text-sm font-medium ${activeTab === "upload" ? "text-brand-500" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            onClick={() => setActiveTab("upload")}
          >
            Upload Image
          </button>
        </div>

        <div className="min-h-[250px]">
          {activeTab === "draw" && (
            <div className="flex flex-col gap-2">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="touch-none w-full cursor-crosshair"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-error-500 hover:text-error-600"
                >
                  Clear Canvas
                </button>
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="flex flex-col items-center justify-center w-full h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 p-4"
              />
              {uploadFile && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Selected: {uploadFile.name}
                </p>
              )}
            </div>
          )}
        </div>

        {existingSignature && !uploadFile && !isDrawing && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Signature
            </h5>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 flex justify-center">
              <img 
                src={existingSignature} 
                alt="Current Signature" 
                className="max-h-24 object-contain"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6 lg:justify-end">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving || (activeTab === "upload" && !uploadFile)}>
            {isSaving ? "Saving..." : "Save Signature"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
