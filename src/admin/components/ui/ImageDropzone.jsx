import API_BASE_URL from "@/config/api";
import React, { useState } from "react";
import { UploadCloud, Image as ImageIcon, Trash2, Plus, Star, Loader2 } from "lucide-react";
import axios from "axios";

export const ImageDropzone = ({ images = [], onChange }) => {
  const [urlInput, setUrlInput] = useState("");

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const next = [...images, { image_url: urlInput.trim(), is_main: images.length === 0 }];
    onChange(next);
    setUrlInput("");
  };

  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/admin/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
      });
      const url = res.data.url;
      const next = [...images, { image_url: url, is_main: images.length === 0 }];
      onChange(next);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  const handleRemove = (idx) => {
    const next = images.filter((_, i) => i !== idx);
    if (next.length > 0 && !next.some((i) => i.is_main)) {
      next[0].is_main = true;
    }
    onChange(next);
  };

  const handleSetMain = (idx) => {
    const next = images.map((img, i) => ({ ...img, is_main: i === idx }));
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 p-8 rounded-2xl text-center transition cursor-pointer flex flex-col items-center justify-center group w-full relative"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <div className="p-4 rounded-full bg-white shadow-2xs text-slate-700 group-hover:scale-105 transition-transform mb-3 border border-slate-100">
            {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-slate-500" /> : <UploadCloud className="w-6 h-6" />}
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            {isUploading ? "Uploading image..." : "Click or drag & drop gallery image files here"}
          </h4>
          <p className="text-xs text-slate-400 mt-1">Or paste a high-resolution image URL below</p>
        </label>

      {/* URL Quick Ingestion */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste high-res image URL (e.g., https://images.unsplash.com/...)"
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition shadow-2xs"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center gap-1.5 transition shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          Add Image
        </button>
      </div>

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition group bg-slate-100 shadow-2xs ${
                img.is_main ? "border-amber-400 ring-2 ring-amber-400/30" : "border-slate-200"
              }`}
            >
              <img src={img.image_url} alt="Gallery item" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => handleSetMain(idx)}
                    title={img.is_main ? "Main Thumbnail" : "Set as Main Thumbnail"}
                    className={`p-1.5 rounded-lg transition ${
                      img.is_main ? "bg-amber-400 text-slate-900 font-bold" : "bg-white/80 hover:bg-white text-slate-700"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${img.is_main ? "fill-current" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Remove image"
                    className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {img.is_main && <span className="text-[10px] font-bold text-amber-300 bg-slate-900/80 px-1.5 py-0.5 rounded text-center">Main Cover</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
