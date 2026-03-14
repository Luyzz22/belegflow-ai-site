"use client";
import { useState, useCallback } from "react";

interface Props {
  onFiles: (files: File[]) => void;
  children: React.ReactNode;
  className?: string;
}

export default function DropZone({ onFiles, children, className = "" }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items?.length > 0) setDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      [".pdf",".xml",".png",".jpg",".jpeg"].some(ext => f.name.toLowerCase().endsWith(ext))
    );
    if (files.length > 0) onFiles(files);
  }, [onFiles]);

  return (
    <div
      className={className + " relative"}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {children}
      {dragging && (
        <div className="absolute inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-sm flex items-center justify-center rounded-xl border-2 border-dashed border-[#e85d04]">
          <div className="text-center">
            <div className="text-5xl mb-3">📄</div>
            <p className="text-lg font-semibold text-[#e85d04]">Rechnungen hier ablegen</p>
            <p className="text-sm text-[#737373] mt-1">PDF, XML, PNG oder JPG</p>
          </div>
        </div>
      )}
    </div>
  );
}
