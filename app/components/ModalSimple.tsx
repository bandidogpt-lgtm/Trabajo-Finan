"use client";

interface ModalSimpleProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export default function ModalSimple({
  open,
  title,
  description,
  onClose,
}: ModalSimpleProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[999]">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6 relative animate-fade">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-800 text-xl"
        >
          ×
        </button>

        {/* Título */}
        <h2 className="text-center text-2xl font-semibold text-slate-900">
          {title}
        </h2>

        {/* Descripción */}
        <p className="text-center mt-2 text-slate-600">
          {description}
        </p>

        {/* Botón aceptar */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-brand-600 py-2 font-semibold hover:bg-brand-500"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
