"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("Waiting for image...");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setStatus("Image ready for analysis.");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setStatus("Uploading and analyzing...");

    const formData = new FormData();
    formData.append("palmImage", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus(`Success! Backend received image: ${data.filename}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus("Failed to connect to the server.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-gray-800 text-center">Palmistry Reader</h1>
        <p className="mb-6 text-sm text-gray-500 text-center">Upload a clear photo of your palm</p>

        <input
          type="file"
          accept="image/*"
          capture="environment" 
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="mb-6 flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Palm preview" 
              className="h-full w-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-center text-gray-500">
              <span className="block text-4xl mb-2">📸</span>
              <p>Tap to Open Camera / Gallery</p>
            </div>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!file}
          className={`w-full rounded-lg py-3 font-semibold text-white transition-colors ${
            file ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Analyze Palm
        </button>

        <p className="mt-4 text-center text-sm font-medium text-gray-700">
          {status}
        </p>
      </div>
    </main>
  );
}