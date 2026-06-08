import React, { useState } from 'react';
import { handleShare, downloadFromServer } from '../../../services/exportService';

export default function ToolActionButtons({ 
  contentData, 
  toolName, 
  exportType = 'PDF' // Defaults to PDF, pass 'PPTX' for presentations
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false); // State for dropdown menu

  const onExport = async () => {
    if (!contentData) return;
    setIsExporting(true);
    
    const filename = `${toolName.replace(/\s+/g, '_')}_${new Date().getTime()}.${exportType.toLowerCase()}`;
    
    // Pointing to your gs-rag backend
    const endpoint = exportType === 'PPTX' 
      ? 'http://localhost:8001/api/v1/export/pptx' 
      : 'http://localhost:8001/api/v1/export/pdf';
      
    const payload = exportType === 'PPTX' 
      ? contentData 
      : { tool_name: toolName, content_data: contentData };

    try {
      await downloadFromServer(endpoint, payload, filename);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const onShare = () => {
    handleShare(
      `Academic Architect: ${toolName}`, 
      `Check out this ${toolName} I generated using the AI Assistant!`
    );
  };

  // --- Native File Sharing Logic (Strictly PDF & Links) ---
  const handleNativeShare = async (shareType) => {
    setIsShareOpen(false); // Close dropdown
    
    try {
      // 1. Share standard Link
      if (shareType === 'link') {
        onShare();
        return;
      }

      // 2. Share physical PDF
      if (shareType === 'pdf') {
        const endpoint = 'http://localhost:8001/api/v1/export/pdf';
        const payload = { tool_name: toolName, content_data: contentData };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to generate PDF');

        const blob = await response.blob();
        const fileName = `${toolName.replace(/\s+/g, '_')}.pdf`;
        const file = new File([blob], fileName, { type: 'application/pdf' });

        // Open the native share dialog directly with the fetched file
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: fileName, 
            files: [file]
          });
        } else {
          alert("Your browser does not support direct file sharing. Please use the Export button to download it first.");
        }
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Sharing failed:", error);
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-gray-100 bg-white rounded-b-xl">
      <button className="flex items-center gap-2 px-6 py-2.5 bg-[#0058be] text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-all">
        <span className="material-symbols-outlined text-[18px]">save</span>
        Save {toolName.split(' ')[0]}
      </button>

      <button 
        onClick={onExport}
        disabled={isExporting || !contentData}
        className="flex items-center gap-2 px-6 py-2.5 bg-[#eff4ff] text-[#0058be] text-sm font-bold rounded-lg hover:bg-[#dce9ff] transition-all disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isExporting ? 'hourglass_empty' : 'download'}
        </span>
        {isExporting ? 'Exporting...' : `Export ${exportType}`}
      </button>

      {/* --- Share Dropdown Button --- */}
      <div className="relative">
        <button 
          onClick={() => setIsShareOpen(!isShareOpen)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#eff4ff] text-[#0058be] text-sm font-bold rounded-lg hover:bg-[#dce9ff] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          Share
        </button>

        {isShareOpen && (
          <div className="absolute bottom-full mb-2 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
            <button 
              onClick={() => handleNativeShare('link')}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-gray-500">link</span>
              Share Link
            </button>
            <button 
              onClick={() => handleNativeShare('pdf')}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-red-500">picture_as_pdf</span>
              Share as PDF
            </button>
          </div>
        )}
      </div>

      <button className="flex items-center gap-2 px-6 py-2.5 bg-[#6b38d4] text-white text-sm font-bold rounded-lg shadow-sm hover:bg-purple-700 transition-all ml-auto">
        <span className="material-symbols-outlined text-[18px]">assignment_add</span>
        Assign
      </button>
    </div>
  );
}