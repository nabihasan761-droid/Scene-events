"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect, useRef } from "react";

export function SceneDialog({ titleId, onClose, children, wide = false }: {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`scene-dialog ${wide ? "scene-dialog-wide" : ""}`}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="dialog-inner">
        <button className="modal-close" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
        {children}
      </div>
    </dialog>
  );
}
