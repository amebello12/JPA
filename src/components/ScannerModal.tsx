import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Loader2,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ValidationResult, CheckIn } from '../types/index.js';
import { api } from '../services/api.js';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose }) => {
  const [operatorName, setOperatorName] = useState<string>('Agent Porte 01');
  const [manualInput, setManualInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ValidationResult | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [recentScans, setRecentScans] = useState<CheckIn[]>([]);
  const [cameraError, setCameraError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Load recent check-ins
  const loadHistory = async () => {
    try {
      const res = await api.getRecentCheckIns();
      if (res.success && res.checkIns) {
        setRecentScans(res.checkIns);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      
      // Setup BarcodeDetector if supported in modern browsers
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        scanIntervalRef.current = window.setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const detectedCode = barcodes[0].rawValue;
                handleValidate(detectedCode, 'camera');
              }
            } catch (err) {
              // frame detection pass
            }
          }
        }, 600);
      }
    } catch (err: any) {
      console.warn('Camera stream error or permission denied:', err);
      setCameraError('Accès caméra non autorisé ou non disponible. Utilisez la recherche manuelle ci-dessous.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleValidate = async (identifier: string, method: 'camera' | 'manual' = 'manual') => {
    if (!identifier.trim()) return;
    setIsProcessing(true);

    try {
      const result = await api.checkInScan(identifier.trim(), operatorName, method);
      setScanResult(result);
      loadHistory();

      // Clear input
      if (method === 'manual') {
        setManualInput('');
      }
    } catch (err: any) {
      setScanResult({
        valid: false,
        status: 'INVALID',
        message: 'Erreur réseau lors de la validation du billet.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090c15] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-4">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#121828]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">ESPACE SÉCURISÉ</div>
              <h3 className="text-lg font-black text-white font-display uppercase tracking-tight">
                Contrôle d'Accès & Scanner
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400 hidden sm:block">
              Opérateur : <span className="font-bold text-white">{operatorName}</span>
            </div>
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Operator name setting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="text-slate-300 font-medium">Nom de l'agent / poste :</span>
            <input
              type="text"
              value={operatorName}
              onChange={e => setOperatorName(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
            />
          </div>

          {/* Camera Scanning Viewfinder */}
          <div className="relative rounded-2xl bg-black border-2 border-purple-500/40 overflow-hidden min-h-[260px] sm:min-h-[300px] flex flex-col items-center justify-center text-center p-4">
            
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover absolute inset-0"
                />
                
                {/* Target Scan Frame */}
                <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 border-2 border-dashed border-amber-400 rounded-2xl flex flex-col items-center justify-between p-4 shadow-2xl bg-purple-950/10">
                  <div className="w-full flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                  </div>
                  <div className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm animate-pulse">
                    Placez le QR dans le cadre
                  </div>
                  <div className="w-full flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                  </div>
                </div>

                <button
                  onClick={stopCamera}
                  className="absolute bottom-4 z-20 px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Arrêter la caméra</span>
                </button>
              </>
            ) : (
              <div className="space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white font-display uppercase">Scanner avec l'appareil photo</h4>
                  <p className="text-xs text-slate-400">
                    Activez la caméra de votre smartphone ou tablette pour scanner les billets en direct à l'entrée.
                  </p>
                </div>
                {cameraError && (
                  <div className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    {cameraError}
                  </div>
                )}
                <button
                  onClick={startCamera}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mx-auto"
                >
                  <Camera className="w-4 h-4" />
                  <span>Démarrer le Scanner Caméra</span>
                </button>
              </div>
            )}
          </div>

          {/* Validation Result Box */}
          {scanResult && (
            <div
              className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                scanResult.status === 'VALID'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                  : scanResult.status === 'ALREADY_USED'
                  ? 'bg-red-950/40 border-red-500 text-red-300'
                  : 'bg-amber-950/40 border-amber-500 text-amber-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-black/40">
                  {scanResult.status === 'VALID' && <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
                  {scanResult.status === 'ALREADY_USED' && <AlertTriangle className="w-8 h-8 text-red-400" />}
                  {scanResult.status === 'INVALID' && <X className="w-8 h-8 text-amber-400" />}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black uppercase tracking-wider">
                      {scanResult.status === 'VALID' && '🟢 BILLET VALIDE — ENTRÉE AUTORISÉE'}
                      {scanResult.status === 'ALREADY_USED' && '🔴 BILLET DÉJÀ UTILISÉ'}
                      {scanResult.status === 'INVALID' && '🔴 BILLET INVALIDE'}
                      {scanResult.status === 'CANCELLED' && '🔴 BILLET ANNULÉ'}
                    </span>
                    <button
                      onClick={() => setScanResult(null)}
                      className="text-xs underline hover:opacity-80"
                    >
                      Fermer
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-white font-medium">
                    {scanResult.message}
                  </p>

                  {scanResult.ticket && (
                    <div className="p-3 rounded-xl bg-black/50 text-xs space-y-1 text-slate-200 mt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Participant :</span>
                        <strong className="text-white">{scanResult.ticket.customer_name}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Billet N° :</span>
                        <strong className="font-mono text-amber-400">{scanResult.ticket.ticket_number}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Type :</span>
                        <span>{scanResult.ticket.ticket_type}</span>
                      </div>
                      {scanResult.status === 'ALREADY_USED' && scanResult.used_at && (
                        <div className="pt-2 border-t border-white/10 text-red-400 flex flex-col">
                          <span>Première entrée : {new Date(scanResult.used_at).toLocaleTimeString('fr-FR')} le {new Date(scanResult.used_at).toLocaleDateString('fr-FR')}</span>
                          <span>Validé par : {scanResult.validated_by || 'Autre agent'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manual Entry Fallback Form */}
          <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Validation Manuelle (Numéro de billet, QR token ou téléphone)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: JP-8F72A1 ou numéro de téléphone"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleValidate(manualInput, 'manual')}
                className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-purple-500 text-white text-sm outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => handleValidate(manualInput, 'manual')}
                disabled={isProcessing || !manualInput.trim()}
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase disabled:opacity-40 flex items-center gap-1.5"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Valider'}
              </button>
            </div>

            {/* Quick Demo Test Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span>Tester rapidement :</span>
              <button
                type="button"
                onClick={() => handleValidate('JP-8F72A1', 'manual')}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-mono"
              >
                JP-8F72A1 (Valide)
              </button>
              <button
                type="button"
                onClick={() => handleValidate('JP-4C91B7', 'manual')}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-mono"
              >
                JP-4C91B7 (Déjà utilisé)
              </button>
              <button
                type="button"
                onClick={() => handleValidate('FAKE-CODE-999', 'manual')}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-mono"
              >
                FAKE-999 (Invalide)
              </button>
            </div>
          </div>

          {/* Recent Entrances Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-slate-300">
                Dernières entrées validées ({recentScans.length})
              </span>
              <button
                onClick={loadHistory}
                className="flex items-center gap-1 hover:text-white"
              >
                <RefreshCw className="w-3 h-3" />
                Actualiser
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
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
                      <div className="text-[10px] text-purple-400">{scan.operator}</div>
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
