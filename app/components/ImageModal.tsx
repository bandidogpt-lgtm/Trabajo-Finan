// app/components/ImageModal.tsx
import { useEffect } from "react";

type ImageModalProps = {
  imageUrl: string | null;
  onClose: () => void;
};

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!imageUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-300 animate-fade"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] max-w-[90vw] flex-col gap-4 rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Vista ampliada"
          className="block max-h-[75vh] max-w-full object-contain"
        />
        <button
          onClick={onClose}
          className="self-end rounded-md border border-slate-200 bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
