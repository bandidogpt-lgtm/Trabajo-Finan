"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ModalSimpleProps {
  open: boolean;
  title: string;
  description: string;
  flag: 0 | 1;  
  onClose: () => void;
}

export default function ModalSimple({
  open,
  title,
  description,
  flag,
  onClose,
}: ModalSimpleProps) {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open && flag === 1 && canvasRef.current) {
      const myConfetti = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });

      myConfetti({
        particleCount: 250,
        spread: 160,               
        startVelocity: 40,
        scalar: 1.2,               
        origin: {
          x: 0.5,                  
          y: 0.3,                  
        },
        colors: ["#0f172a", "#3b82f6", "#ffffff"],
      });
    }
  }, [open,flag]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[999] px-4">

      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[1001]"
      />

      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-10 relative animate-fade 
                   flex flex-col gap-6 z-[1002]"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-4 text-slate-400 hover:text-slate-700 text-3xl font-bold"
          style={{ lineHeight: "1rem" }}
        >
          ×
        </button>

        <h2 className="text-center text-3xl font-bold text-slate-900 leading-snug">
          {title}
        </h2>

        <p className="text-center text-lg text-slate-600 leading-relaxed px-2">
          {description}
        </p>

        <button
          onClick={onClose}
          className="mt-2 w-full rounded-xl py-3 text-lg font-semibold shadow-md 
                     hover:shadow-lg active:scale-[0.98] transition text-white"
          style={{ backgroundColor: "#0f172a" }}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}