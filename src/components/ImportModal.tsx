import React, { useState, useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import { UploadCloud, FolderUp, Link as LinkIcon, FileMusic, Film, X, CheckCircle2 } from 'lucide-react';

export const ImportModal: React.FC = () => {
  const { isImportOpen, setIsImportOpen, importFiles, importFromUrl, setToastNotification } = useMedia();
  const [activeTab, setActiveTab] = useState<'files' | 'url'>('files');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // URL Stream form state
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlArtist, setUrlArtist] = useState('');
  const [urlType, setUrlType] = useState<'audio' | 'video'>('audio');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  if (!isImportOpen) return null;

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsProcessing(true);
      await importFiles(e.dataTransfer.files);
      setIsProcessing(false);
      setToastNotification({
        title: `${e.dataTransfer.files.length} file(s) ready`,
        subtitle: `${e.dataTransfer.files[0].name} imported`
      });
      setIsImportOpen(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      await importFiles(e.target.files);
      setIsProcessing(false);
      setToastNotification({
        title: `${e.target.files.length} file(s) ready`,
        subtitle: `${e.target.files[0].name} imported`
      });
      setIsImportOpen(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsProcessing(true);
    await importFromUrl(
      urlInput.trim(),
      urlTitle.trim() || 'Online Stream',
      urlArtist.trim() || 'Web Stream',
      urlType
    );
    setIsProcessing(false);
    setToastNotification({
      title: 'Stream loaded',
      subtitle: urlTitle.trim() || 'Online Stream'
    });
    setIsImportOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div 
        id="import-modal-card"
        className="w-full max-w-lg rounded-2xl bg-[#18181c] border border-white/10 shadow-2xl p-6 text-white space-y-5"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div>
            <h2 className="text-base font-bold tracking-tight">Add Media</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Upload audio stems, beats, sample packs, or video files</p>
          </div>
          <button
            id="close-import-modal-btn"
            onClick={() => setIsImportOpen(false)}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#121215] p-1 rounded-xl border border-white/5">
          <button
            id="tab-import-files-btn"
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'files'
                ? 'bg-[#27272f] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload Files & Folders
          </button>
          <button
            id="tab-import-url-btn"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'url'
                ? 'bg-[#27272f] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Stream URL
          </button>
        </div>

        {/* Tab 1: Drag & Drop Files */}
        {activeTab === 'files' && (
          <div className="space-y-4">
            <div
              id="file-dropzone"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-white bg-white/5 scale-[1.01]'
                  : 'border-white/10 hover:border-white/20 bg-black/20'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Click or drag & drop files here</p>
                <p className="text-xs text-neutral-400 mt-1">MP3, WAV, FLAC, AAC, OGG, MP4, WebM, MOV</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*,video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Folder Upload & Sample Quick Load */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
              >
                <FolderUp className="w-4 h-4" />
                <span>Import Entire Folder</span>
              </button>
              <input
                ref={folderInputRef}
                type="file"
                {...{ webkitdirectory: '', directory: '' }}
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Stream URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Direct Media URL</label>
              <input
                type="url"
                required
                placeholder="https://example.com/audio.mp3 or .mp4"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-[#121215] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Track"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  className="w-full bg-[#121215] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Artist / Producer</label>
                <input
                  type="text"
                  placeholder="e.g. Producer Name"
                  value={urlArtist}
                  onChange={(e) => setUrlArtist(e.target.value)}
                  className="w-full bg-[#121215] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUrlType('audio')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 ${
                    urlType === 'audio' ? 'bg-white text-black border-white' : 'bg-white/5 text-neutral-400 border-white/5'
                  }`}
                >
                  <FileMusic className="w-3.5 h-3.5" /> Audio
                </button>
                <button
                  type="button"
                  onClick={() => setUrlType('video')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 ${
                    urlType === 'video' ? 'bg-white text-black border-white' : 'bg-white/5 text-neutral-400 border-white/5'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" /> Video
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || !urlInput.trim()}
              className="w-full py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all disabled:opacity-50 mt-2 shadow-md"
            >
              {isProcessing ? 'Loading...' : 'Add Stream to Library'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
