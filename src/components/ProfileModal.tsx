import React, { useState, useRef, useEffect } from 'react';
import { useMedia } from '../context/MediaContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Camera, 
  Video, 
  Upload, 
  Check, 
  Sparkles, 
  Play, 
  Square, 
  RotateCcw,
  User,
  AtSign,
  FileText
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
];

const PRESET_VIDEO_AVATARS = [
  {
    name: 'Neon Synth Waves',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-41553-large.mp4'
  },
  {
    name: 'Cyberpunk Grid',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-tunnel-with-neon-lights-41554-large.mp4'
  },
  {
    name: 'Retro Vinyl Spin',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-dj-playing-music-on-a-turntable-42777-large.mp4'
  }
];

export const ProfileModal: React.FC = () => {
  const { 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    userProfile, 
    setUserProfile, 
    themeConfig 
  } = useMedia();

  const [name, setName] = useState(userProfile.name);
  const [tag, setTag] = useState(userProfile.tag);
  const [bio, setBio] = useState(userProfile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState(userProfile.avatarVideoUrl || '');
  const [isVideoAvatar, setIsVideoAvatar] = useState(userProfile.isVideoAvatar);

  // Webcam recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingCountdown, setRecordingCountdown] = useState<number | null>(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isProfileModalOpen) {
      setName(userProfile.name);
      setTag(userProfile.tag);
      setBio(userProfile.bio || '');
      setAvatarUrl(userProfile.avatarUrl);
      setAvatarVideoUrl(userProfile.avatarVideoUrl || '');
      setIsVideoAvatar(userProfile.isVideoAvatar);
    } else {
      stopWebcam();
    }
  }, [isProfileModalOpen, userProfile]);

  const startWebcam = async () => {
    try {
      setWebcamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: false
      });
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      setWebcamActive(true);
    } catch (err) {
      console.warn('Webcam permission error:', err);
      setWebcamError('Camera access unavailable or declined.');
    }
  };

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setWebcamActive(false);
    setIsRecording(false);
    setRecordingCountdown(null);
  };

  const handleStartRecordVideo = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    
    // 3-second recording
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';

    try {
      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType: mime });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setAvatarVideoUrl(videoUrl);
        setIsVideoAvatar(true);
        stopWebcam();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingCountdown(3);

      let timeLeft = 3;
      const timer = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          clearInterval(timer);
          recorder.stop();
          setIsRecording(false);
          setRecordingCountdown(null);
        } else {
          setRecordingCountdown(timeLeft);
        }
      }, 1000);
    } catch (e) {
      console.error('Failed to record video avatar:', e);
      setWebcamError('MediaRecorder not supported in this browser.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      setIsVideoAvatar(false);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarVideoUrl(url);
      setIsVideoAvatar(true);
    }
  };

  const handleSave = () => {
    setUserProfile({
      name: name.trim() || 'Anonymous Producer',
      tag: tag.startsWith('@') ? tag.trim() : `@${tag.trim()}`,
      bio: bio.trim(),
      avatarUrl,
      avatarVideoUrl,
      isVideoAvatar
    });
    stopWebcam();
    setIsProfileModalOpen(false);
  };

  if (!isProfileModalOpen) return null;

  return (
    <div
      id="profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={() => {
        stopWebcam();
        setIsProfileModalOpen(false);
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#141418] border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl bg-white/5 ${themeConfig.accentIconColor}`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Producer Profile & Moving Avatar</h2>
              <p className="text-xs text-neutral-400">Customize identity, record live video avatar, and set your producer tag</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopWebcam();
              setIsProfileModalOpen(false);
            }}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 custom-scrollbar">
          {/* Avatar Hero Area */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-[#1a1a22] border border-white/10">
            {/* Live Preview Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/30 shadow-xl bg-neutral-900 flex items-center justify-center relative">
                {webcamActive ? (
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : isVideoAvatar && avatarVideoUrl ? (
                  <video
                    src={avatarVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Recording indicator */}
                {isRecording && (
                  <div className="absolute inset-0 bg-rose-950/60 flex flex-col items-center justify-center text-white">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping mb-1" />
                    <span className="text-xs font-mono font-bold">{recordingCountdown}s</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-black/90 border border-white/20 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 text-neutral-300">
                {isVideoAvatar ? (
                  <>
                    <Video className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
                    <span>Video</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    <span>Photo</span>
                  </>
                )}
              </div>
            </div>

            {/* Avatar Actions */}
            <div className="flex-1 space-y-2.5 text-center sm:text-left">
              <div className="text-xs font-semibold text-neutral-300">Avatar Format & Live Video</div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {!webcamActive ? (
                  <button
                    type="button"
                    onClick={startWebcam}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Record Video Avatar</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isRecording}
                      onClick={handleStartRecordVideo}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg animate-pulse"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{isRecording ? `Recording (${recordingCountdown}s)...` : 'Record 3s Loop'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopWebcam}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>Upload Video / GIF</span>
                </button>

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload Photo</span>
                </button>

                {/* Hidden inputs */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*,image/gif"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>

              {webcamError && (
                <p className="text-[11px] text-rose-400 font-medium">{webcamError}</p>
              )}
            </div>
          </div>

          {/* Preset Video & Photo Avatars */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Curated Video Loops
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {PRESET_VIDEO_AVATARS.map((p) => {
                const isCurrent = isVideoAvatar && avatarVideoUrl === p.url;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setAvatarVideoUrl(p.url);
                      setIsVideoAvatar(true);
                      stopWebcam();
                    }}
                    className={`relative rounded-xl overflow-hidden border p-1 text-left transition-all group ${
                      isCurrent
                        ? 'border-rose-400 ring-2 ring-rose-400/40 bg-rose-500/10'
                        : 'border-white/10 hover:border-white/30 bg-[#191920]'
                    }`}
                  >
                    <div className="h-16 w-full rounded-lg overflow-hidden bg-black relative">
                      <video
                        src={p.url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="mt-1 px-1 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-neutral-300 truncate">{p.name}</span>
                      {isCurrent && <Check className="w-3 h-3 text-rose-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Photos */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Preset Photo Avatars
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {PRESET_AVATARS.map((url, i) => {
                const isSelected = !isVideoAvatar && avatarUrl === url;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(url);
                      setIsVideoAvatar(false);
                      stopWebcam();
                    }}
                    className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 transition-transform hover:scale-105 ${
                      isSelected ? 'border-white ring-2 ring-white/50 scale-105' : 'border-white/20 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile Form Fields */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Display Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jack Anderson"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#191920] border border-white/10 focus:border-white/30 focus:outline-none text-xs text-white placeholder-neutral-500 font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Producer Handle / Tag</span>
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. @jackbeats"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#191920] border border-white/10 focus:border-white/30 focus:outline-none text-xs text-white placeholder-neutral-500 font-medium transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                <span>Bio & Production Style</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell listeners your genres, BPM specialties, and workflow..."
                rows={2}
                className="w-full p-3 rounded-xl bg-[#191920] border border-white/10 focus:border-white/30 focus:outline-none text-xs text-white placeholder-neutral-500 font-medium transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              stopWebcam();
              setIsProfileModalOpen(false);
            }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md active:scale-95"
          >
            Save Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};
