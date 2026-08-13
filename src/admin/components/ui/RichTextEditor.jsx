import React, { useState } from "react";
import { Bold, Italic, Heading1, Heading2, List, Link, Code, Type, AlignLeft, Eye, Edit } from "lucide-react";

export const RichTextEditor = ({ value, onChange, placeholder = "Type content here..." }) => {
  const [isPreview, setIsPreview] = useState(false);

  const insertTag = (openTag, closeTag = "") => {
    const textarea = document.getElementById("cms-rich-editor");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = openTag + selected + closeTag;
    const nextVal = text.substring(0, start) + replacement + text.substring(end);
    onChange(nextVal);
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs focus-within:ring-2 focus-within:ring-slate-900 transition">
      {/* Editor Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => insertTag("<h2>", "</h2>")} className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-700 font-bold text-xs flex items-center gap-1" title="Heading 2">
            <Heading2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertTag("<h3>", "</h3>")} className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-700 font-bold text-xs" title="Heading 3">
            <Type className="w-4 h-4" />
          </button>
          <span className="w-px h-5 bg-slate-200 mx-1" />
          <button type="button" onClick={() => insertTag("<strong>", "</strong>")} className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-700" title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertTag("<em>", "</em>")} className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-700" title="Italic">
            <Italic className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertTag("<p>", "</p>")} className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-700" title="Paragraph">
            <AlignLeft className="w-4 h-4" />
          </button>
          <span className="w-px h-5 bg-slate-200 mx-1" />
          <button type="button" onClick={() => insertTag("<ul>\n  <li>", "</li>\n</ul>")} className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-700" title="Bullet List">
            <List className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertTag('<a href="#" target="_blank">', '</a>')} className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-700" title="Insert Link">
            <Link className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              !isPreview ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            Edit HTML
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              isPreview ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isPreview ? (
        <div
          className="p-6 prose prose-slate max-w-none min-h-[250px] bg-slate-50/30 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: value || "<p class='text-slate-400 italic'>No content written yet.</p>" }}
        />
      ) : (
        <textarea
          id="cms-rich-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={10}
          className="w-full p-4 font-mono text-xs sm:text-sm bg-white text-slate-800 focus:outline-hidden leading-relaxed border-none resize-y"
        />
      )}
    </div>
  );
};
