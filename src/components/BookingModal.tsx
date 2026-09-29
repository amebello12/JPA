import React, { useState, useEffect } from 'react';
import { 
  X, 
  Ticket as TicketIcon, 
  Plus, 
  Minus, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  Phone,
  User,
  Mail,
  ArrowRight,
  Clock,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TicketType, Order, Ticket } from '../types/index.js';
import { api } from '../services/api.js';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketTypes: TicketType[];
  initialSelectedType?: TicketType | null;
  onOrderSuccess: (order: Order, tickets: Ticket[]) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  ticketTypes,
  initialSelectedType,
  onOrderSuccess
}) => {
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  
  // Promo state
  const [promoChecking, setPromoChecking] = useState<boolean>(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({
    text: '',
    type: null
  });
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [verifiedPromo, setVerifiedPromo] = useState<string | null>(null);

  // Flow step: 'form' | 'payment_pending' | 'success'
  const [currentStep, setCurrentStep] = useState<'form' | 'payment_pending' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [waveReference, setWaveReference] = useState<string>('');
  const [confirmingPayment, setConfirmingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>('');

  useEffect(() => {
    if (initialSelectedType) {
      setSelectedTypeId(initialSelectedType.id);
    } else if (ticketTypes.length > 0 && !selectedTypeId) {
      setSelectedTypeId(ticketTypes[0].id);
    }
  }, [initialSelectedType, ticketTypes]);

  if (!isOpen) return null;

  const currentTicketType = ticketTypes.find(t => t.id === selectedTypeId) || ticketTypes[0];
  const unitPrice = currentTicketType ? currentTicketType.price : 2000;
  const subtotal = unitPrice * quantity;
  const totalAmount = Math.max(0, subtotal - appliedDiscount);

  // Validate Promo Code
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      setPromoMessage({ text: 'Veuillez saisir un code promo.', type: 'error' });
      return;
    }

    setPromoChecking(true);
    setPromoMessage({ text: '', type: null });

    try {
      const res = await api.validatePromo(promoCodeInput.trim(), subtotal);
      if (res.valid) {
        setAppliedDiscount(res.discount);
        setVerifiedPromo(res.promo?.code || promoCodeInput.trim().toUpperCase());
        setPromoMessage({
          text: `✅ Code promo appliqué ! Réduction de ${res.discount.toLocaleString('fr-FR')} FCFA.`,
          type: 'success'
        });
      } else {
        setAppliedDiscount(0);
        setVerifiedPromo(null);
        setPromoMessage({
          text: `❌ ${res.message || 'Code promo invalide'}`,
          type: 'error'
        });
      }
    } catch (err: any) {
      setAppliedDiscount(0);
      setVerifiedPromo(null);
      setPromoMessage({
        text: '❌ Erreur de vérification du code promo.',
        type: 'error'
      });
    } finally {
      setPromoChecking(false);
    }
  };

  // Re-verify promo when quantity changes if promo already applied
  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1 || newQty > 10) return;
    setQuantity(newQty);
    if (verifiedPromo) {
      const newSubtotal = unitPrice * newQty;
      api.validatePromo(verifiedPromo, newSubtotal).then(res => {
        if (res.valid) {
          setAppliedDiscount(res.discount);
        } else {
          setAppliedDiscount(0);
          setVerifiedPromo(null);
          setPromoMessage({ text: res.message, type: 'error' });
        }
      });
    }
  };

  // Create Order & Move to Step 2 (Wave Payment)
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Veuillez renseigner votre nom complet et numéro de téléphone.');
      return;
    }

    setIsSubmitting(true);
    setPaymentError('');

    try {
      const res = await api.createOrder({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        ticketTypeId: selectedTypeId,
        quantity,
        promoCode: verifiedPromo || undefined
      });

      if (res.success && res.order) {
        setCreatedOrder(res.order);
        setCurrentStep('payment_pending');
      } else {
        alert(res.message || 'Erreur lors de la création de la commande.');
      }
    } catch (err: any) {
      alert('Une erreur est survenue lors de la communication avec le serveur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Wave Payment
  const handleConfirmWavePayment = async () => {
    if (!createdOrder) return;
    setConfirmingPayment(true);
    setPaymentError('');

    try {
      const res = await api.confirmOrder(
        createdOrder.order_number,
        waveReference.trim() || `WAVE-TX-${Date.now().toString(36).toUpperCase()}`,
        'Validation Client Wave'
      );

      if (res.success && res.order && res.tickets) {
        setCreatedOrder(res.order);
        setCurrentStep('success');
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        onOrderSuccess(res.order, res.tickets);
      } else {
        setPaymentError(res.message || 'La vérification du paiement a échoué.');
      }
    } catch (err: any) {
      setPaymentError('Impossible de vérifier le paiement. Réessayez ou contactez le support.');
    } finally {
      setConfirmingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0f1422] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#161d30]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <TicketIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">JERSEY NIGHT CLUB 2026</div>
              <h3 className="text-lg sm:text-xl font-black text-white font-display">
                {currentStep === 'form' && 'Réservation de Billets'}
                {currentStep === 'payment_pending' && 'Paiement Wave'}
                {currentStep === 'success' && 'Billets Confirmés !'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: FORMULAIRE D'ACHAT */}
        {currentStep === 'form' && (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
            
            {/* 1. Choix du Billet */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Type de billet
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ticketTypes.map((tt) => {
                  const isSelected = tt.id === selectedTypeId;
                  return (
                    <button
                      key={tt.id}
                      type="button"
                      onClick={() => setSelectedTypeId(tt.id)}
                      className={`p-3.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-950/40 text-white shadow-md'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm">{tt.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div className="text-amber-400 font-black text-lg">
                        {tt.price.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {tt.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Quantité */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <div className="text-sm font-bold text-white">Nombre de billets</div>
                <div className="text-xs text-slate-400">Prix unitaire : {unitPrice.toLocaleString('fr-FR')} FCFA</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-black text-lg text-white w-6 text-center font-display">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                  className="w-9 h-9 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3. Informations Participant */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Nom complet *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mamadou Diop"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1a2238] border border-white/10 focus:border-purple-500 text-white placeholder-slate-500 text-sm outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Téléphone (Wave / WhatsApp) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 77 123 45 67"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#1a2238] border border-white/10 focus:border-purple-500 text-white placeholder-slate-500 text-sm outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Email (facultatif)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: mamadou@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#1a2238] border border-white/10 focus:border-purple-500 text-white placeholder-slate-500 text-sm outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 4. Code Promo */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Code Promo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: JERSEY10 ou COGNE500"
                  value={promoCodeInput}
                  onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#1a2238] border border-white/10 focus:border-purple-500 text-white placeholder-slate-500 text-sm uppercase font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={promoChecking || !promoCodeInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase disabled:opacity-40"
                >
                  {promoChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Appliquer'}
                </button>
              </div>

              {promoMessage.text && (
                <div className={`text-xs font-medium mt-1 ${
                  promoMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {promoMessage.text}
                </div>
              )}
            </div>

            {/* 5. Récapitulatif & Calcul Automatique */}
            <div className="rounded-xl p-4 bg-black/40 border border-white/10 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>{quantity} × {currentTicketType?.name}</span>
                <span>{subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Réduction Code Promo ({verifiedPromo})</span>
                  <span>- {appliedDiscount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                <span className="font-extrabold text-white text-base">TOTAL À PAYER</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400 font-display">
                    {totalAmount.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs font-bold text-amber-400 ml-1">FCFA</span>
                </div>
              </div>
            </div>

            {/* Bouton Suivant */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-extrabold text-sm sm:text-base uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Génération de la commande...</span>
                </>
              ) : (
                <>
                  <span>Procéder au paiement Wave</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: PAIEMENT WAVE & CONFIRMATION RÉELLE */}
        {currentStep === 'payment_pending' && createdOrder && (
          <div className="p-6 space-y-6">
            
            {/* Order summary banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Numéro de Commande</span>
                <div className="text-lg font-black text-white font-mono tracking-wider">
                  {createdOrder.order_number}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Statut</span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-black">
                  <Clock className="w-3 h-3" />
                  <span>EN ATTENTE</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white font-display">
                Étape suivante : Paiement via Wave
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Veuillez cliquer sur le bouton ci-dessous pour régler votre commande de{' '}
                <strong className="text-amber-400">{createdOrder.total_amount.toLocaleString('fr-FR')} FCFA</strong>{' '}
                sur le lien Wave officiel.
              </p>

              {/* Wave External Link Button */}
              <a
                href={createdOrder.wave_payment_url || 'https://pay.wave.com/m/M_sn_lHy4DaHe66Bv/c/sn/'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 hover:from-cyan-300 hover:to-blue-300 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
              >
                <span>Ouvrir l’application Wave</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <p className="text-xs text-slate-400 italic text-center">
                (Le paiement s'ouvre dans un nouvel onglet sécurisé Wave)
              </p>
            </div>

            {/* Verification Section */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-1">
                  Référence de transaction Wave (facultatif)
                </label>
                <input
                  type="text"
                  placeholder="Ex: WAVE-TX-99214 ou numéro de transaction"
                  value={waveReference}
                  onChange={e => setWaveReference(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1a2238] border border-white/10 focus:border-purple-500 text-white text-sm outline-none font-mono"
                />
              </div>

              {paymentError && (
                <div className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmWavePayment}
                disabled={confirmingPayment}
                className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {confirmingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Vérification du paiement...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>J’ai effectué mon paiement Wave</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setCurrentStep('form')}
                className="hover:text-white underline"
              >
                Modifier mes informations
              </button>
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Validation instantanée
              </span>
            </div>

          </div>
        )}

        {/* STEP 3: SUCCÈS & BILLETS GÉNÉRÉS */}
        {currentStep === 'success' && createdOrder && (
          <div className="p-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                Paiement Confirmé · Statut : PAYÉ
              </span>
              <h3 className="text-2xl font-black text-white font-display">
                Félicitations {createdOrder.customer?.full_name} !
              </h3>
              <p className="text-sm text-slate-300">
                Votre réservation pour <strong className="text-amber-400">JERSEY NIGHT CLUB 2026</strong> est validée. Vos billets électroniques avec QR Code sont prêts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Commande :</span>
                <span className="font-bold text-white font-mono">{createdOrder.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Billets générés :</span>
                <span className="font-bold text-amber-400">{createdOrder.quantity} billet(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total réglé :</span>
                <span className="font-bold text-emerald-400">{createdOrder.total_amount.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <QrCode className="w-5 h-5 text-amber-300" />
                <span>Afficher mes billets & QR Codes</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
