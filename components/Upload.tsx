"use client";

import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

interface Props {
  value?: File | string | null;
  onChange: (file: File | null) => void;
}

export default function ThumbnailUpload({ value, onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  // 🔥 handle preview
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    // Existing image from DB
    if (typeof value === "string") {
      setPreview(value);
      return;
    }

    // New uploaded file
    const objectUrl = URL.createObjectURL(value);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [value]);

  // 🔥 Drop handler
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      onChange(acceptedFiles[0]);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-6
          cursor-pointer transition
          hover:border-gray-400
          ${isDragActive ? "border-blue-500 bg-blue-50" : ""}
        `}
      >
        <input {...getInputProps()} />

        {!preview ? (
          <p className="text-center text-muted-foreground">
            Drag & drop thumbnail here  
            <br />
            or click to upload
          </p>
        ) : (
          <img
            src={preview}
            alt="thumbnail"
            className="rounded-xl max-h-60 mx-auto object-cover"
          />
        )}
      </div>

      {/* Replace + Remove */}
      {preview && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-1 text-sm text-red-500 hover:underline"
          >
            <X size={16} />
            Remove
          </button>

          <span className="text-xs text-muted-foreground">
            Click the box to replace the image
          </span>
        </div>
      )}
    </div>
  );
}
