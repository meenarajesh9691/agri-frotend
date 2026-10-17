"use client";
import { useEffect, useRef } from "react";

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto max-h-[92vh] ${wide ? "w-[min(94vw,60rem)]" : "w-[min(94vw,42rem)]"} overflow-y-auto rounded-3xl border border-stone-200 p-0 shadow-2xl backdrop:bg-black/40`}>
      <div className="p-6">
        <h2 className="mb-5 text-xl font-semibold tracking-tight">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
