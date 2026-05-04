"use client";

import { useState, useRef } from "react";
import ChatBox, { PalmAnalysis } from "@/components/ChatBox"; 

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("Waiting for image...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [englishAnalysis, setEnglishAnalysis] = useState<PalmAnalysis | null>(null);
  const [sinhalaAnalysis, setSinhalaAnalysis] = useState<PalmAnalysis | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'si'>('en');
  
  const [isReadingComplete, setIsReadingComplete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setStatus("Image ready. Click 'Analyze Palm'.");
      
      setEnglishAnalysis(null);
      setSinhalaAnalysis(null);
      setCurrentLanguage('en');
      setIsReadingComplete(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setStatus("Consulting the ancient texts... (Analyzing image)");
    setEnglishAnalysis(null);
    setSinhalaAnalysis(null);
    setIsReadingComplete(false);

    const formData = new FormData();
    formData.append("palmImage", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (response.ok && data.analysis) {
        setStatus("Analysis complete!");
        setEnglishAnalysis(data.analysis);
        setIsReadingComplete(true);
      } else {
        setStatus(`Error: ${data.error || "Failed to parse reading."}`);
      }
    } catch (error) {
      setStatus("Failed to connect to the server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTranslate = async () => {
    if (sinhalaAnalysis) {
      setCurrentLanguage('si');
      return;
    }

    if (!englishAnalysis) return;

    setIsTranslating(true);
    setStatus("Translating to Sinhala... (පරිවර්තනය වෙමින් පවතී)");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: englishAnalysis }),
      });
      const data = await response.json();

      if (response.ok && data.translatedAnalysis) {
        setSinhalaAnalysis(data.translatedAnalysis);
        setCurrentLanguage('si');
        setStatus("Translation complete!");
      } else {
        setStatus("Translation failed. Please try again.");
      }
    } catch (error) {
      setStatus("Failed to connect to the translation service.");
    } finally {
      setIsTranslating(false);
    }
  };

  const displayAnalysis = currentLanguage === 'si' && sinhalaAnalysis ? sinhalaAnalysis : englishAnalysis;

  return (
    <main className="flex min-h-screen flex-col items-center py-10 px-4 bg-gray-50">
      
      <div className={`w-full transition-all duration-500 ease-in-out flex flex-col lg:flex-row gap-8 items-start justify-center ${isReadingComplete ? 'max-w-6xl' : 'max-w-2xl'}`}>

        {isReadingComplete && (
          <div className="w-full lg:w-1/3 lg:sticky lg:top-10 h-[600px] lg:h-[800px] animate-fade-in order-2 lg:order-1">
            <ChatBox analysis={englishAnalysis} />
          </div>
        )}

        <div className={`w-full rounded-xl bg-white p-8 shadow-lg order-1 lg:order-2 ${isReadingComplete ? 'lg:w-2/3' : ''}`}>
          
          <h1 className="mb-2 text-3xl font-bold text-gray-800 text-center">Practical Palmistry</h1>
          <p className="mb-8 text-sm text-gray-500 text-center">Based on the teachings of Dr. Narayan Dutt Shrimali</p>

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
            className="mb-6 flex h-72 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Palm preview" className="h-full w-full object-contain rounded-lg p-2" />
            ) : (
              <div className="text-center text-indigo-500">
                <span className="block text-5xl mb-3">✋</span>
                <p className="font-medium">Tap to take a photo of your palm</p>
                <p className="text-xs mt-1 text-indigo-400">Ensure good lighting and clear lines</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing || isTranslating}
            className={`w-full rounded-lg py-4 font-bold text-white transition-all ${
              file && !isAnalyzing && !isTranslating
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-md" 
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isAnalyzing ? "Reading Lines..." : "Analyze Palm"}
          </button>

          <p className="mt-4 text-center text-sm font-medium text-gray-600">{status}</p>

          {displayAnalysis && (
            <div className="mt-10 animate-fade-in">
              <div className="flex justify-between items-center mb-6 border-b pb-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentLanguage === 'en' ? 'Your Reading' : 'ඔබේ පලාපල'}
                </h2>
                
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => setCurrentLanguage('en')}
                    className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${currentLanguage === 'en' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${currentLanguage === 'si' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {isTranslating ? '...' : 'සිංහල'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
                  <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-2">
                    {currentLanguage === 'en' ? 'Summary' : 'සාරාංශය'}
                  </h3>
                  <p className="text-gray-700 italic">"{displayAnalysis?.reading_summary}&quot;</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {currentLanguage === 'en' ? 'Identified Yogs' : 'හඳුනාගත් යෝග'}
                  </h3>
                  {displayAnalysis?.identified_yogs && displayAnalysis.identified_yogs.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {displayAnalysis.identified_yogs.map((yog, i) => (
                        <li key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {yog}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      {currentLanguage === 'en' ? 'No specific Yogs identified from the image.' : 'රූපයෙන් විශේෂිත යෝග කිසිවක් හඳුනාගෙන නොමැත.'}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {currentLanguage === 'en' ? 'Line Analysis' : 'රේඛා විශ්ලේෂණය'}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{displayAnalysis?.line_analysis}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {currentLanguage === 'en' ? 'Dominant Mounts' : 'ප්‍රධාන ග්‍රහ මණ්ඩල'}
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {displayAnalysis?.dominant_mounts && displayAnalysis.dominant_mounts.map((mount, i) => (
                      <li key={i}>{mount}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}