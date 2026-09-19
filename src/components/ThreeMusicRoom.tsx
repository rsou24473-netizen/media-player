import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useMedia } from '../context/MediaContext';
import { audioEngine } from '../audio/audioEngine';
import { Activity, Maximize2, Maximize } from 'lucide-react';

interface ThreeMusicRoomProps {
  videoUrl: string | null;
  trackId: string | null;
  onImportVideoClick: () => void;
  isDraggingOver: boolean;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
  onToggleFullscreen?: () => void;
  isMatrixOpen?: boolean;
  onToggleMatrix?: () => void;
}

export const ThreeMusicRoom: React.FC<ThreeMusicRoomProps> = ({
  videoUrl,
  trackId,
  onImportVideoClick,
  isDraggingOver,
  isTheaterMode = false,
  onToggleTheater,
  onToggleFullscreen,
  isMatrixOpen = false,
  onToggleMatrix
}) => {
  const { isPlaying, currentTrack, themeConfig } = useMedia();
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Three.js instances refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const videoMeshRef = useRef<THREE.Mesh | null>(null);
  const videoMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const videoTextureRef = useRef<THREE.Texture | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const snareLightRef = useRef<THREE.PointLight | null>(null);
  const floorGridRef = useRef<THREE.GridHelper | null>(null);
  
  // Animation & Audio analysis state
  const animFrameId = useRef<number | null>(null);
  const originalVerticesRef = useRef<Float32Array | null>(null);
  const prevTrackIdRef = useRef<string | null>(trackId);
  const foldProgressRef = useRef<number>(1); // 1 = fully unfolded, 0 = folded away
  const isTransitioningRef = useRef<boolean>(false);

  // Mouse interaction for subtle 3D orbital tilt
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  });

  // Real-time audio band metrics
  const [audioMetrics, setAudioMetrics] = useState({
    bass: 0,
    lowMid: 0,
    mid: 0,
    high: 0,
    beatPulse: false
  });

  // Track change animation: fold away old video and unfold new video
  useEffect(() => {
    if (trackId && prevTrackIdRef.current && trackId !== prevTrackIdRef.current) {
      isTransitioningRef.current = true;
      foldProgressRef.current = 0; // trigger unfold animation
    }
    prevTrackIdRef.current = trackId;
  }, [trackId]);

  // Fallback procedural canvas generator for when no video is attached yet
  const drawProceduralVideoFrame = useCallback((time: number, bass: number, high: number) => {
    const canvas = fallbackCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    
    // Gradient fluid background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#050814');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Audio-reactive cyber wave ribbons
    const cx = w / 2;
    const cy = h / 2;
    const layers = 5;

    for (let l = 0; l < layers; l++) {
      ctx.beginPath();
      const waveColor = l % 2 === 0 ? '#22d3ee' : '#a855f7';
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 3 + l * 1.5 + bass * 6;
      ctx.globalAlpha = 0.4 + l * 0.12;

      for (let x = 0; x < w; x += 15) {
        const freq = 0.008 + l * 0.004;
        const speed = time * (1.5 + l * 0.8);
        const y = cy + Math.sin(x * freq + speed) * (40 + bass * 90 + l * 15)
                      + Math.cos(x * 0.02 - speed) * (20 + high * 40);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Glowing core audio ring
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    const ringRadius = 80 + bass * 60;
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4 + bass * 8;
    ctx.shadowBlur = 25 + bass * 30;
    ctx.shadowColor = '#38bdf8';
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;

    // Center text watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('3D AUDIO REACTIVE SURFACE', cx, cy - 10);
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.fillText('CLICK "+ IMPORT VIDEO" TO MAP YOUR MP4', cx, cy + 22);
  }, []);

  // Initialize Three.js Scene, Camera, Renderer, and Objects
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.04);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.3, 7.8);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x22d3ee, 2.5, 30);
    pointLight.position.set(0, 2, 5);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    const snareLight = new THREE.PointLight(0xffffff, 0, 20);
    snareLight.position.set(0, 0, 4);
    scene.add(snareLight);
    snareLightRef.current = snareLight;

    // 5. Floor Grid with Perspective
    const gridHelper = new THREE.GridHelper(40, 40, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -2.8;
    scene.add(gridHelper);
    floorGridRef.current = gridHelper;

    // 6. Subdivided 3D Plane Mesh for Video Deformations
    // 64x48 segments gives 3,120 deformable vertices for fluid, organic audio ripples
    const planeGeo = new THREE.PlaneGeometry(8, 4.5, 64, 48);
    
    // Cache original vertex positions for safe non-destructive deformations
    const posAttr = planeGeo.attributes.position;
    const originalPos = new Float32Array(posAttr.count * 3);
    for (let i = 0; i < posAttr.count; i++) {
      originalPos[i * 3] = posAttr.getX(i);
      originalPos[i * 3 + 1] = posAttr.getY(i);
      originalPos[i * 3 + 2] = posAttr.getZ(i);
    }
    originalVerticesRef.current = originalPos;

    // Texture setup: Use video texture if videoUrl exists, else procedural canvas
    let activeTexture: THREE.Texture;
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    if (videoUrl && videoRef.current) {
      const vTex = new THREE.VideoTexture(videoRef.current);
      vTex.minFilter = THREE.LinearFilter;
      vTex.magFilter = THREE.LinearFilter;
      vTex.format = THREE.RGBAFormat;
      vTex.anisotropy = Math.min(maxAniso, 8);
      activeTexture = vTex;
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      fallbackCanvasRef.current = canvas;
      const cTex = new THREE.CanvasTexture(canvas);
      cTex.minFilter = THREE.LinearFilter;
      cTex.magFilter = THREE.LinearFilter;
      cTex.anisotropy = Math.min(maxAniso, 8);
      activeTexture = cTex;
    }
    videoTextureRef.current = activeTexture;

    const planeMat = new THREE.MeshStandardMaterial({
      map: activeTexture,
      side: THREE.DoubleSide,
      roughness: 0.25,
      metalness: 0.15,
      wireframe: false
    });
    videoMaterialRef.current = planeMat;

    const videoMesh = new THREE.Mesh(planeGeo, planeMat);
    videoMesh.position.set(0, 0.2, 0);
    scene.add(videoMesh);
    videoMeshRef.current = videoMesh;

    // 7. Outer Bezel / Glow Frame around the Video Surface
    const frameGeo = new THREE.BoxGeometry(8.2, 4.7, 0.12);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x111317,
      metalness: 0.9,
      roughness: 0.2
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 0, -0.07);
    videoMesh.add(frameMesh);

    // 8. 3D Audio-Reactive Particle Cloud
    const particleCount = 1400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Orbiting torus/cloud around the 3D surface
      const radius = 4 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      particlePos[i * 3 + 1] = radius * Math.sin(phi) + 0.5;
      particlePos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      particleScales[i] = Math.random() * 0.08 + 0.02;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.018,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Handle container resize
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Mouse move parallax
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.35;
      mouseRef.current.targetY = y * 0.25;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  // Update video texture when videoUrl changes
  useEffect(() => {
    if (!videoMeshRef.current) return;

    const maxAniso = rendererRef.current ? rendererRef.current.capabilities.getMaxAnisotropy() : 8;

    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});

      const vTex = new THREE.VideoTexture(videoRef.current);
      vTex.minFilter = THREE.LinearFilter;
      vTex.magFilter = THREE.LinearFilter;
      vTex.format = THREE.RGBAFormat;
      vTex.anisotropy = Math.min(maxAniso, 8);

      videoTextureRef.current = vTex;
      if (videoMaterialRef.current) {
        videoMaterialRef.current.map = vTex;
        videoMaterialRef.current.needsUpdate = true;
      }
    } else {
      // Revert to procedural canvas
      if (fallbackCanvasRef.current) {
        const cTex = new THREE.CanvasTexture(fallbackCanvasRef.current);
        cTex.minFilter = THREE.LinearFilter;
        cTex.magFilter = THREE.LinearFilter;
        cTex.anisotropy = Math.min(maxAniso, 8);
        videoTextureRef.current = cTex;
        if (videoMaterialRef.current) {
          videoMaterialRef.current.map = cTex;
          videoMaterialRef.current.needsUpdate = true;
        }
      }
    }
  }, [videoUrl]);

  // Main 60FPS Audio-Reactive Animation Loop
  useEffect(() => {
    let lastBeatTimestamp = 0;
    let smoothedBass = 0;
    let smoothedLowMid = 0;
    let smoothedMid = 0;
    let smoothedHigh = 0;
    let kickImpulse = 0;
    let snareFlash = 0;
    let clockTime = 0;

    const renderLoop = () => {
      clockTime += 0.016;

      // 1. Web Audio Real-Time FFT Frequency Extraction
      const freqData = audioEngine.getFrequencyData();
      let rawBass = 0;
      let rawLowMid = 0;
      let rawMid = 0;
      let rawHigh = 0;

      if (freqData && freqData.length > 0 && isPlaying) {
        // Bass: bins 1..8 (approx 20Hz - 250Hz)
        let bSum = 0;
        for (let i = 1; i <= 8; i++) bSum += freqData[i];
        rawBass = bSum / (8 * 255);

        // Low-mid: bins 9..24 (approx 250Hz - 800Hz)
        let lmSum = 0;
        for (let i = 9; i <= 24; i++) lmSum += freqData[i];
        rawLowMid = lmSum / (16 * 255);

        // Mid: bins 25..55 (approx 800Hz - 2500Hz)
        let mSum = 0;
        for (let i = 25; i <= 55; i++) mSum += freqData[i];
        rawMid = mSum / (31 * 255);

        // High: bins 56..120 (approx 2500Hz - 16000Hz)
        let hSum = 0;
        for (let i = 56; i <= 120; i++) hSum += freqData[i];
        rawHigh = hSum / (65 * 255);

        // Beat / Kick detection: sudden energy spike in bass
        const now = performance.now();
        if (rawBass > 0.62 && rawBass - smoothedBass > 0.18 && now - lastBeatTimestamp > 220) {
          kickImpulse = 1.0;
          lastBeatTimestamp = now;
        }

        // Snare / transient detection: rapid spike in mid-high
        if (rawMid > 0.55 && rawMid - smoothedMid > 0.15) {
          snareFlash = 1.0;
        }
      }

      // Smooth decay using spring/exponential interpolation
      smoothedBass += (rawBass - smoothedBass) * 0.28;
      smoothedLowMid += (rawLowMid - smoothedLowMid) * 0.22;
      smoothedMid += (rawMid - smoothedMid) * 0.24;
      smoothedHigh += (rawHigh - smoothedHigh) * 0.3;
      kickImpulse = Math.max(0, kickImpulse - 0.05);
      snareFlash = Math.max(0, snareFlash - 0.08);

      // Publish metrics for HUD readout
      setAudioMetrics({
        bass: smoothedBass,
        lowMid: smoothedLowMid,
        mid: smoothedMid,
        high: smoothedHigh,
        beatPulse: kickImpulse > 0.5
      });

      // Draw procedural canvas if no video is active
      if (!videoUrl && fallbackCanvasRef.current && videoTextureRef.current) {
        drawProceduralVideoFrame(clockTime, smoothedBass, smoothedHigh);
        videoTextureRef.current.needsUpdate = true;
      }

      // 2. 3D Video Mesh Vertex Deformations
      if (videoMeshRef.current && originalVerticesRef.current) {
        const mesh = videoMeshRef.current;
        const geo = mesh.geometry as THREE.PlaneGeometry;
        const pos = geo.attributes.position;
        const orig = originalVerticesRef.current;

        // Unfold animation physics
        if (foldProgressRef.current < 1) {
          foldProgressRef.current += 0.045;
          if (foldProgressRef.current > 1) foldProgressRef.current = 1;
        }
        const fold = foldProgressRef.current;

        // Compute vertex deformation based on Audio Analyzer:
        // - Center punches forward with Bass & Kick
        // - Ripples & waves travel across surface with Mid frequencies
        // - Edges vibrate with High frequencies
        const count = pos.count;
        for (let i = 0; i < count; i++) {
          const origX = orig[i * 3];
          const origY = orig[i * 3 + 1];

          // Normalized coordinates (-1 to 1)
          const normX = origX / 4.0;
          const normY = origY / 2.25;
          const distFromCenter = Math.sqrt(normX * normX + normY * normY);

          // 1. Kick & Bass Punch outward from center
          const centerPunch = Math.max(0, 1 - distFromCenter * 1.15) * (smoothedBass * 1.6 + kickImpulse * 1.1);

          // 2. Traveling wave ripple driven by Mid frequencies & time
          const wave = Math.sin(normX * 8 + clockTime * 3.5) * 
                       Math.cos(normY * 6 + clockTime * 2.8) * 
                       (smoothedMid * 0.85);

          // 3. Edge vibration driven by High frequencies
          const edgeVibration = (distFromCenter > 0.75) 
            ? Math.sin(clockTime * 30 + i) * (smoothedHigh * 0.35) 
            : 0;

          // Combined Z displacement
          const totalZ = (centerPunch + wave + edgeVibration) * fold;

          pos.setXYZ(
            i, 
            origX * fold, 
            origY * (0.2 + 0.8 * fold), 
            totalZ
          );
        }

        pos.needsUpdate = true;
        geo.computeVertexNormals();

        // Object movement: subtle tilt & bounce driven by Low-mid and kick
        mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, (mouseRef.current.x * 0.4) + (smoothedLowMid * 0.15 * Math.sin(clockTime)), 0.1);
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, (mouseRef.current.y * 0.3) + (smoothedBass * 0.1 * Math.cos(clockTime * 0.8)), 0.1);
        mesh.rotation.z = Math.sin(clockTime * 1.5) * (smoothedLowMid * 0.04);

        // Entire surface punches toward you on kick
        mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, kickImpulse * 0.65 + smoothedBass * 0.3, 0.2);
        mesh.scale.setScalar(1 + (kickImpulse * 0.05) + (smoothedBass * 0.02));
      }

      // 3. Snare Geometry Flash & Light Pulse
      if (pointLightRef.current) {
        pointLightRef.current.intensity = 1.8 + (smoothedBass * 2.8) + (kickImpulse * 2.0);
      }
      if (snareLightRef.current) {
        snareLightRef.current.intensity = snareFlash * 4.5;
      }

      // 4. Particle Cloud Audio Physics
      if (particlesRef.current) {
        const pObj = particlesRef.current;
        pObj.rotation.y += 0.002 + (smoothedLowMid * 0.008);
        pObj.rotation.x += 0.001 + (smoothedBass * 0.004);

        // Particles expand outward and glow brighter on high frequencies and beat
        const pScale = 1 + (smoothedHigh * 0.45) + (kickImpulse * 0.2);
        pObj.scale.set(pScale, pScale, pScale);

        const pMat = pObj.material as THREE.PointsMaterial;
        pMat.size = 0.015 + (smoothedHigh * 0.012) + (kickImpulse * 0.008);
        pMat.opacity = 0.7 + (smoothedHigh * 0.3);
      }

      // 5. Floor Grid reacts to Bass
      if (floorGridRef.current) {
        floorGridRef.current.position.y = -2.8 - (smoothedBass * 0.2);
      }

      // 6. Camera Pulse & Smooth Parallax Tracking
      if (cameraRef.current) {
        const cam = cameraRef.current;
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

        // Camera makes subtle rhythmic movement with the beat
        const cameraBeatPulse = (smoothedBass * 0.45) + (kickImpulse * 0.3);
        cam.position.x = mouseRef.current.x * 2.2;
        cam.position.y = 0.3 + mouseRef.current.y * 1.5;
        cam.position.z = 7.8 - cameraBeatPulse;
        cam.lookAt(0, 0.2, 0);
      }

      // Render scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    animFrameId.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying, videoUrl, drawProceduralVideoFrame]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none ${
        isDraggingOver ? 'ring-4 ring-cyan-400/80 bg-cyan-950/20' : ''
      }`}
    >
      {/* Hidden Video element for Three.js VideoTexture */}
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* Floating HUD Badges on 3D Stage */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-lg">
          <span className={`w-2 h-2 rounded-full ${audioMetrics.beatPulse ? 'bg-amber-400 scale-125' : 'bg-cyan-400'} transition-transform`} />
          <span className="text-[11px] font-bold text-white tracking-wide uppercase">
            3D Visual Surface
          </span>
          <span className="text-[10px] font-mono text-cyan-400">
            {videoUrl ? 'VIDEO MAPPED' : 'PROCEDURAL CANVAS'}
          </span>
        </div>

        {/* Live Audio Reaction Meters */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-300">
          <span className="text-neutral-400">BASS:</span>
          <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 rounded-full transition-all duration-75"
              style={{ width: `${Math.min(100, audioMetrics.bass * 100)}%` }}
            />
          </div>
          <span className="text-neutral-400 ml-1">MID:</span>
          <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all duration-75"
              style={{ width: `${Math.min(100, audioMetrics.mid * 100)}%` }}
            />
          </div>
          <span className="text-neutral-400 ml-1">HIGH:</span>
          <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-400 rounded-full transition-all duration-75"
              style={{ width: `${Math.min(100, audioMetrics.high * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Right: Floating HUD Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onImportVideoClick}
          className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 border border-white/15 hover:border-cyan-400/60 text-xs font-semibold text-neutral-200 hover:text-white transition-all shadow-xl flex items-center gap-1.5 cursor-pointer backdrop-blur-md active:scale-95"
        >
          <span className="text-cyan-400 font-bold">+</span>
          <span>{videoUrl ? 'Change Video' : 'Import Video (.mp4)'}</span>
        </button>

        {onToggleMatrix && (
          <button
            type="button"
            onClick={onToggleMatrix}
            title="Toggle Beat Analyzer Radar"
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xl cursor-pointer backdrop-blur-md active:scale-95 ${
              isMatrixOpen
                ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                : 'bg-black/70 hover:bg-black/90 border-white/15 hover:border-rose-400/60 text-neutral-200 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Beat Radar</span>
          </button>
        )}

        {onToggleTheater && (
          <button
            type="button"
            onClick={onToggleTheater}
            title={isTheaterMode ? "Exit Cinematic Mode" : "Cinematic Mode (Hide Sidebars)"}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xl cursor-pointer backdrop-blur-md active:scale-95 ${
              isTheaterMode
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'bg-black/70 hover:bg-black/90 border-white/15 hover:border-purple-400/60 text-neutral-200 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isTheaterMode ? 'Show Sidebars' : 'Cinematic'}</span>
          </button>
        )}

        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            title="Toggle Fullscreen"
            className="px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 border border-white/15 hover:border-cyan-400/60 text-xs font-semibold text-neutral-200 hover:text-white transition-all shadow-xl flex items-center gap-1.5 cursor-pointer backdrop-blur-md active:scale-95"
          >
            <Maximize className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fullscreen</span>
          </button>
        )}
      </div>

      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none">
          <div className="p-6 rounded-3xl border-2 border-dashed border-cyan-400 bg-cyan-950/40 text-center animate-pulse">
            <h3 className="text-lg font-bold text-white">Drop Video Here (.mp4, .webm, .mov)</h3>
            <p className="text-xs text-neutral-300 mt-1">Automatically maps onto this 3D audio-reactive surface</p>
          </div>
        </div>
      )}
    </div>
  );
};
