"use client";

import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

interface Props {
  value?: File;
  onChange: (file: File) => void;
}

export default function ThumbnailUpload({ value, onChange }: Props) {

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    onChange(acceptedFiles[0]);
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-2xl p-6
        cursor-pointer transition
        hover:border-gray-400
        ${isDragActive ? "border-blue-500 bg-blue-50" : ""}
      `}
    >
      <input {...getInputProps()} />

      {!value ? (
        <p className="text-center text-muted-foreground">
          Drag & drop thumbnail here  
          <br />
          or click to upload
        </p>
      ) : (
        <img
          src={URL.createObjectURL(value)}
          className="rounded-xl max-h-60 mx-auto"
        />
      )}
    </div>
  );
}
