import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../../lib/utils';

interface PhotoUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ files, onChange, maxFiles = 5 }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setError(null);

    const newFiles: File[] = Array.from(selectedFiles);

    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} incident photographs allowed.`);
      return;
    }

    for (const f of newFiles) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        setError(`Invalid format (${f.name}). Only JPEG, PNG, and WebP images are allowed.`);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setError(`File ${f.name} exceeds the 10 MB size limit.`);
        return;
      }
    }

    onChange([...files, ...newFiles]);
  };

  const removeFile = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    onChange(updated);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
          <ImageIcon className="w-4 h-4 text-red-400" />
          <span>Incident Photographs (Optional)</span>
        </label>
        <span className="text-slate-400 font-mono">
          {files.length} / {maxFiles} files (JPEG, PNG, WebP ≤ 10MB)
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      {files.length < maxFiles && (
        <label className="border-2 border-dashed border-slate-700 hover:border-red-500/60 bg-slate-900/50 hover:bg-slate-800/40 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center group">
          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-red-400 mb-2 transition transform group-hover:scale-110" />
          <p className="text-xs font-semibold text-slate-200">
            <span className="text-red-400 underline">Click to upload</span> or drag and drop photos here
          </p>
          <p className="text-[11px] text-slate-400 mt-1">JPEG, PNG, or WebP up to 10MB per image</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </label>
      )}

      {/* Image Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {files.map((file, idx) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-square shadow-md">
                <img src={previewUrl} alt={`Upload preview ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-lg transition opacity-90 hover:opacity-100"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-2 py-1 text-[10px] text-slate-300 truncate">
                  {file.name}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
