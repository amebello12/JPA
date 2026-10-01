import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  QrCode, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  User, 
  Clock, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles,
  Loader2,
  RefreshCw,
  Volume2,
  VolumeX,
  Zap,
  ZapOff,
  SwitchCamera,
  Check,
  Phone,
  Ticket,
  Maximize2
} from 'lucide-react';
import jsQR from 'jsqr';
import { ValidationResult, CheckIn } from '../types/index.js';
import { api } from '../services/api.js';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Audio synthesizer for instant gatekeeper audio feedback
function playSecurityChime(type: 'success' | 'alarm') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start(ctx.currentTime + 0.08);
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } else {
      // Harsh warning buzzer for FRAUD / ALREADY_USED / INVALID
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.24);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.36);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    }
  } catch (e) {
    // Ignore autoplay restriction before user interaction
  }
}

// Haptic feedback for gate controllers
function triggerHaptic(type: 'success' | 'alarm') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'success') {
        navigator.vibrate(120);
      } else {
        navigator.vibrate([250, 100, 250, 100, 350]);
      }
    } catch {}
  }
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose }) => {
  const [operatorGate, setOperatorGate] = useState<string>('Porte 1 — Entrée Principale Plage');
  const [operatorName, setOperatorName] = useState<string>('Agent Sécurité 01');
  const [manualInput, setManualInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ValidationResult | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [recentScans, setRecentScans] = useState<CheckIn[]>([]);
  const [cameraError, setCameraError] = useState<string>('');
  
  // Audio & Torch controls
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);

  // Camera devices
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isRearCamera, setIsRearCamera] = useState<boolean>(true);

  // Security live counters
  const [validCount, setValidCount] = useState<number>(0);
  const [fraudCount, setFraudCount] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isLockedRef = useRef<boolean>(false);
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimestampRef = useRef<number>(0);

  // Pre-configured gate checkpoints
  const GATE_OPTIONS = [
    'Porte 1 — Entrée Principale Plage',
    'Porte 2 — Entrée VIP & Partenaires',
    'Porte 3 — Accueil Navette Diamaguene',
    'Porte 4 — Accueil Navette Station Dabo / HLM',
    'Porte 5 — Contrôle Intérieur Club'
  ];

  // Load history & calculate session stats
  const loadHistory = async () => {
    try {
      const res = await api.getRecentCheckIns();
      if (res.success && res.checkIns) {
        setRecentScans(res.checkIns);
        const valid = res.checkIns.filter((c: any) => c.result === 'SUCCESS' || !c.result).length;
        const fraud = res.checkIns.filter((c: any) => c.result === 'ALREADY_USED' || c.result === 'NOT_FOUND').length;
        setValidCount(valid);
        setFraudCount(fraud);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Enumerate cameras to find rear camera
  const enumerateCameras = async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(videoInputs);

      // Prioritize rear camera (environment / back)
      const rear = videoInputs.find(d => 
        /back|rear|environnement|arrière|facing back/i.test(d.label) ||
        d.label.toLowerCase().includes('0')
      );

      if (rear && !selectedDeviceId) {
        setSelectedDeviceId(rear.deviceId);
        setIsRearCamera(true);
      } else if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.warn('Could not enumerate cameras', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      enumerateCameras();
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Start Rear Camera with fallback constraints
  const startCamera = async (targetDeviceId?: string) => {
    stopCamera();
    setCameraError('');
    isLockedRef.current = false;

    // Explicitly target rear camera: facingMode exact: 'environment' or ideal
    const constraintsList: MediaStreamConstraints[] = [
      // 1. If user selected specific device ID
      ...(targetDeviceId ? [{
        video: {
          deviceId: { exact: targetDeviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }] : []),
      // 2. Ideal environment / rear camera with resolution
      {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      },
      // 3. Exact environment requirement
      {
        video: { facingMode: 'environment' },
        audio: false
      },
      // 4. Generic fallback
      {
        video: true,
        audio: false
      }
    ];

    let stream: MediaStream | null = null;
    let successfulConstraint: MediaStreamConstraints | null = null;

    for (const constraint of constraintsList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraint);
        successfulConstraint = constraint;
        break;
      } catch (err) {
        // try next fallback
      }
    }

    if (!stream) {
      setCameraError('Impossible d’accéder à la caméra arrière. Veuillez autoriser la caméra dans votre navigateur ou utiliser la saisie manuelle.');
      setCameraActive(false);
      return;
    }

    streamRef.current = stream;
    const videoTrack = stream.getVideoTracks()[0];

    // Check torch capabilities on rear camera
    try {
      const caps = videoTrack.getCapabilities ? (videoTrack.getCapabilities() as any) : {};
      setTorchSupported(Boolean(caps?.torch));
      setTorchOn(false);

      const label = videoTrack.label || '';
      setIsRearCamera(/back|rear|environnement|arrière|facing back/i.test(label) || label.includes('0'));
    } catch {}

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('muted', 'true');
      try {
        await videoRef.current.play();
      } catch (e) {
        console.warn('Video play error:', e);
      }
    }

    setCameraActive(true);
    enumerateCameras();

    // Start frame loop with jsQR for continuous high-speed recognition
    startScanningLoop();
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    setTorchOn(false);
    setTorchSupported(false);
    setCameraActive(false);
  };

  // Toggle Torch / Flash on rear camera
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const nextTorch = !torchOn;
      await (videoTrack as any).applyConstraints({
        advanced: [{ torch: nextTorch }]
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn('Torch toggle failed', err);
    }
  };

  // Switch between available cameras
  const handleSwitchCamera = () => {
    if (videoDevices.length <= 1) {
      // Toggle facing mode directly
      startCamera();
      return;
    }
    const currentIndex = videoDevices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    const nextDevice = videoDevices[nextIndex];
    setSelectedDeviceId(nextDevice.deviceId);
    startCamera(nextDevice.deviceId);
  };

  // Ultra-fast Real-Time QR Scanner Frame Loop
  const startScanningLoop = () => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let barcodeDetector: any = null;
    if ('BarcodeDetector' in window) {
      try {
        barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      } catch {}
    }

    const tick = async () => {
      if (!videoRef.current || !streamRef.current) {
        return;
      }

      const video = videoRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA && !isLockedRef.current) {
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (width > 0 && height > 0) {
          // Hardware-accelerated pass if available
          let codeDetected = '';

          if (barcodeDetector) {
            try {
              const barcodes = await barcodeDetector.detect(video);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                codeDetected = barcodes[0].rawValue;
              }
            } catch {}
          }

          // Pure client JSQR fallback (works on ALL iOS Safari and Android browsers)
          if (!codeDetected && ctx) {
            canvas.width = Math.min(width, 720);
            canvas.height = Math.round((canvas.width / width) * height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qr = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert'
            });

            if (qr && qr.data) {
              codeDetected = qr.data;
            }
          }

          if (codeDetected) {
            const now = Date.now();
            // Anti-tamper debounce to prevent multi-hit replay within 1.5s
            if (codeDetected !== lastScannedCodeRef.current || now - lastScanTimestampRef.current > 1500) {
              lastScannedCodeRef.current = codeDetected;
              lastScanTimestampRef.current = now;
              isLockedRef.current = true;
              handleValidate(codeDetected, 'camera');
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  };

  // Main atomic validation function
  const handleValidate = async (identifier: string, method: 'camera' | 'manual' = 'manual') => {
    const clean = identifier.trim();
    if (!clean) return;

    setIsProcessing(true);

    try {
      const fullOperator = `${operatorName} (${operatorGate})`;
      const result = await api.checkInScan(clean, fullOperator, method);
      setScanResult(result);

      // Audio & Vibration Feedback
      if (soundEnabled) {
        if (result.status === 'VALID') {
          playSecurityChime('success');
          triggerHaptic('success');
        } else {
          playSecurityChime('alarm');
          triggerHaptic('alarm');
        }
      }

      // Live metrics update
      if (result.status === 'VALID') {
        setValidCount(prev => prev + 1);
      } else {
        setFraudCount(prev => prev + 1);
      }

      loadHistory();

      if (method === 'manual') {
        setManualInput('');
      }
    } catch (err: any) {
      if (soundEnabled) {
        playSecurityChime('alarm');
        triggerHaptic('alarm');
      }
      setScanResult({
        valid: false,
        status: 'INVALID',
        message: 'Erreur réseau ou code illisible. Veuillez vérifier manuellement.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Resume camera scanning for next ticket
  const handleScanNext = () => {
    setScanResult(null);
    lastScannedCodeRef.current = '';
    isLockedRef.current = false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090c15] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-4">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#121828]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  CONTRÔLE D'ACCÈS CERTIFIÉ
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SÉCURITÉ ACTIVE
                </span>
              </div>
              <h3 className="text-lg font-black text-white font-display uppercase tracking-tight mt-0.5">
                Scanner Billet — Caméra Arrière
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}
              title={soundEnabled ? 'Son activé (bip de validation)' : 'Son désactivé'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Security Metrics Bar */}
        <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10 bg-black/40 text-center py-2.5 text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Entrées Validées</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 font-display">
              {validCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Fraudes / Doublons Bloqués</div>
            <div className="text-base sm:text-lg font-black text-rose-400 font-display">
              {fraudCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Caméra Sélectionnée</div>
            <div className="text-xs font-bold text-amber-300 truncate px-2 mt-0.5">
              {isRearCamera ? '📷 Arrière (Environnement)' : '📷 Caméra Standard'}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5">
          
          {/* Operator and Gate Point Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Point de contrôle / Porte :</label>
              <select
                value={operatorGate}
                onChange={e => setOperatorGate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs outline-none focus:border-purple-400"
              >
                {GATE_OPTIONS.map((gate, i) => (
                  <option key={i} value={gate} className="bg-[#121828] text-white">
                    {gate}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Agent responsable :</label>
              <input
                type="text"
                value={operatorName}
                onChange={e => setOperatorName(e.target.value)}
                placeholder="Ex: Agent Porte 01"
                className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs outline-none focus:border-purple-400"
              >
              </input>
            </div>
          </div>

          {/* Camera Viewfinder (Prioritizing Rear Camera) */}
          <div className="relative rounded-2xl bg-black border-2 border-purple-500/40 overflow-hidden min-h-[280px] sm:min-h-[340px] flex flex-col items-center justify-center text-center">
            
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover absolute inset-0"
                />

                {/* Nightclub Darkness Vignette Overlay */}
                <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

                {/* Target Scan Frame */}
                <div className="relative z-10 w-60 h-60 sm:w-72 sm:h-72 border-2 border-dashed border-amber-400 rounded-3xl flex flex-col items-center justify-between p-4 shadow-2xl bg-purple-950/20 backdrop-brightness-110">
                  <div className="w-full flex justify-between">
                    <span className="w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                    <span className="w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                  </div>
                  
                  {/* Glowing Laser Scan Bar */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_12px_#f59e0b] animate-scanBar" />

                  <div className="text-[11px] font-black text-white bg-black/75 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md shadow-lg flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cadrez le QR Code officiel</span>
                  </div>

                  <div className="w-full flex justify-between">
                    <span className="w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                    <span className="w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                  </div>
                </div>

                {/* Bottom Camera Controls Bar (Rear Camera Switch + Torch Flash) */}
                <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between gap-2">
                  
                  {/* Torch / Flashlight toggle */}
                  {torchSupported ? (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all ${
                        torchOn 
                          ? 'bg-amber-400 text-black shadow-amber-400/40' 
                          : 'bg-black/60 hover:bg-black/80 text-white border border-white/20'
                      }`}
                      title="Allumer le flash de la caméra arrière (idéal en soirée)"
                    >
                      {torchOn ? <Zap className="w-4 h-4 text-black fill-black" /> : <ZapOff className="w-4 h-4 text-amber-400" />}
                      <span>{torchOn ? 'Flash ON' : 'Flash'}</span>
                    </button>
                  ) : <div />}

                  {/* Switch Camera if multiple cameras detected */}
                  {videoDevices.length > 1 && (
                    <button
                      type="button"
                      onClick={handleSwitchCamera}
                      className="px-3 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg"
                      title="Basculer vers une autre caméra arrière ou avant"
                    >
                      <SwitchCamera className="w-4 h-4 text-purple-400" />
                      <span>Changer Caméra</span>
                    </button>
                  )}

                  {/* Stop Camera Button */}
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>Fermer</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4 max-w-sm p-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white font-display uppercase">
                    Scanner avec la Caméra Arrière
                  </h4>
                  <p className="text-xs text-slate-400">
                    Sélectionne automatiquement l'appareil photo arrière de votre smartphone pour une lecture instantanée des QR codes.
                  </p>
                </div>

                {cameraError && (
                  <div className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-left">
                    {cameraError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => startCamera(selectedDeviceId)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mx-auto"
                >
                  <Camera className="w-4 h-4" />
                  <span>Activer la Caméra Arrière</span>
                </button>
              </div>
            )}
          </div>

          {/* Validation Result Box with Anti-Fraud Indicators */}
          {scanResult && (
            <div
              className={`p-5 rounded-3xl border-2 transition-all duration-300 animate-scaleUp shadow-2xl ${
                scanResult.status === 'VALID'
                  ? 'bg-emerald-950/70 border-emerald-400 shadow-emerald-900/40 text-emerald-200'
                  : scanResult.status === 'ALREADY_USED'
                  ? 'bg-rose-950/80 border-rose-500 shadow-rose-900/60 text-rose-200 animate-pulse'
                  : 'bg-amber-950/70 border-amber-500 shadow-amber-900/40 text-amber-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl ${
                  scanResult.status === 'VALID' 
                    ? 'bg-emerald-500 text-black' 
                    : scanResult.status === 'ALREADY_USED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-500 text-black'
                }`}>
                  {scanResult.status === 'VALID' && <CheckCircle2 className="w-9 h-9" />}
                  {scanResult.status === 'ALREADY_USED' && <ShieldAlert className="w-9 h-9" />}
                  {scanResult.status === 'INVALID' && <AlertTriangle className="w-9 h-9" />}
                  {scanResult.status === 'CANCELLED' && <X className="w-9 h-9" />}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-black uppercase tracking-wider">
                      {scanResult.status === 'VALID' && '🟢 ACCÈS AUTORISÉ — BIENVENUE !'}
                      {scanResult.status === 'ALREADY_USED' && '🔴 ALERTE FRAUDE : BILLET DÉJÀ SCANNÉ !'}
                      {scanResult.status === 'INVALID' && '⚠️ CODE INVALIDE / CONTREFAÇON SUSPECTE'}
                      {scanResult.status === 'CANCELLED' && '🔴 COMMANDE ANNULÉE / REMBOURSÉE'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-white font-medium">
                    {scanResult.message}
                  </p>

                  {/* High Security Details Card */}
                  {scanResult.ticket && (
                    <div className="p-3.5 rounded-2xl bg-black/60 text-xs space-y-1.5 text-slate-200 border border-white/10 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Participant certifié :</span>
                        <strong className="text-white text-sm">{scanResult.ticket.customer_name}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Numéro Officiel :</span>
                        <strong className="font-mono text-amber-400 font-bold">{scanResult.ticket.ticket_number}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Formule :</span>
                        <span className="font-semibold text-purple-300">{scanResult.ticket.ticket_type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">N° Commande :</span>
                        <span className="font-mono text-slate-300">{scanResult.ticket.order_number}</span>
                      </div>

                      {/* FRAUD INVESTIGATION DETAILS */}
                      {scanResult.status === 'ALREADY_USED' && (
                        <div className="mt-2 pt-2 border-t border-rose-500/40 text-rose-300 text-xs space-y-1">
                          <div className="font-bold flex items-center gap-1 text-rose-400">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Détails de la première entrée :</span>
                          </div>
                          <div>
                            Heure : {scanResult.used_at ? new Date(scanResult.used_at).toLocaleTimeString('fr-FR') : 'Heure inconnue'} le {scanResult.used_at ? new Date(scanResult.used_at).toLocaleDateString('fr-FR') : ''}
                          </div>
                          <div>
                            Validé par : <strong className="text-white">{scanResult.validated_by || 'Agent entrée'}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ready for Next Ticket Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleScanNext}
                      className="w-full py-2.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-slate-200 shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scanner le Billet Suivant</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Manual Entry Fallback Form */}
          <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Contrôle Manuel (Numéro de billet JP, Token ou Téléphone)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: JP-8F72A1 ou 776543210"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleValidate(manualInput, 'manual')}
                className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-purple-500 text-white text-sm outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => handleValidate(manualInput, 'manual')}
                disabled={isProcessing || !manualInput.trim()}
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase disabled:opacity-40 flex items-center gap-1.5 shadow-md shadow-purple-600/30"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vérifier'}
              </button>
            </div>

            {/* Quick Demo Test Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span className="text-[10px] uppercase font-bold">Tests sécurité :</span>
              <button
                type="button"
                onClick={() => handleValidate('JP-8F72A1', 'manual')}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-emerald-300 font-mono text-[10px]"
              >
                JP-8F72A1 (Valide)
              </button>
              <button
                type="button"
                onClick={() => handleValidate('JP-8F72A3', 'manual')}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-rose-300 font-mono text-[10px]"
              >
                JP-8F72A3 (Déjà Utilisé)
              </button>
              <button
                type="button"
                onClick={() => handleValidate('FAKE-CODE-999', 'manual')}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-amber-300 font-mono text-[10px]"
              >
                FAKE-999 (Invalide)
              </button>
            </div>
          </div>

          {/* Audit Trail: Recent Scans History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Journal d'audit des contrôles ({recentScans.length})</span>
              </span>
              <button
                onClick={loadHistory}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Actualiser
              </button>
            </div>

            <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
              {recentScans.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 bg-white/5 rounded-xl">
                  Aucune entrée enregistrée pour le moment.
                </div>
              ) : (
                recentScans.slice(0, 8).map(scan => (
                  <div
                    key={scan.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <div className="font-bold text-white">{scan.customer_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">Billet {scan.ticket_number} · {scan.ticket_type}</div>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <div>{new Date(scan.scanned_at).toLocaleTimeString('fr-FR')}</div>
                      <div className="text-[10px] text-purple-400 truncate max-w-[120px]">{scan.operator}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
