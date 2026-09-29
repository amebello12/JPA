import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  LayoutDashboard, 
  Ticket, 
  ShoppingBag, 
  Users, 
  Tag, 
  Settings, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Lock, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Check, 
  Calendar,
  MapPin,
  RefreshCw,
  Plus,
  Trash2,
  Phone,
  Mail,
  Search,
  Image as ImageIcon,
  Upload,
  Bus,
  FileText,
  Sliders,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Send,
  Copy
} from 'lucide-react';
import { api } from '../services/api.js';
import { Order, Ticket as TicketItem, Customer, PromoCode, EventItem, TicketType, ProgramItem, AppSettings } from '../types/index.js';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner: () => void;
  onDataUpdated?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenScanner,
  onDataUpdated 
}) => {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('jn_admin_token'));
  const [usernameInput, setUsernameInput] = useState<string>('AJCD');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'tickets_config' | 'orders' | 'tickets' | 'participants' | 'promos' | 'program'>('content');

  // Admin Data states
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [participants, setParticipants] = useState<Customer[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventItem | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [participantSearch, setParticipantSearch] = useState<string>('');

  // Shuttle stop input
  const [newShuttleStop, setNewShuttleStop] = useState<string>('');

  // Promo code creation state
  const [newPromoCode, setNewPromoCode] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: 10,
    expiration: '2026-10-04T23:59:59Z',
    usage_limit: 100,
    active: true
  });
  const [showPromoCreate, setShowPromoCreate] = useState(false);

  // New Program item creation state
  const [newProgramItem, setNewProgramItem] = useState({
    time: '23:00',
    title: '',
    description: '',
    order_index: 3
  });
  const [showProgramCreate, setShowProgramCreate] = useState(false);

  // WhatsApp ticket sender state
  const [whatsappModal, setWhatsappModal] = useState<{
    isOpen: boolean;
    phone: string;
    customerName: string;
    orderNumber: string;
    ticketNumber?: string;
    message: string;
    copied: boolean;
  }>({
    isOpen: false,
    phone: '',
    customerName: '',
    orderNumber: '',
    ticketNumber: '',
    message: '',
    copied: false
  });

  const fetchAdminData = async (authToken: string) => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, ticketsRes, partRes, promosRes, eventRes] = await Promise.all([
        api.getAdminStats(authToken),
        api.getAdminOrders(authToken),
        api.getAdminTickets(authToken),
        api.getAdminParticipants(authToken),
        api.getAdminPromoCodes(authToken),
        api.getEventData()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (ticketsRes.success) setTickets(ticketsRes.tickets);
      if (partRes.success) setParticipants(partRes.customers);
      if (promosRes.success) setPromoCodes(promosRes.promoCodes);
      if (eventRes.success) {
        setCurrentEvent(eventRes.event);
        setTicketTypes(eventRes.ticketTypes);
        setPrograms(eventRes.programs);
        setSettings(eventRes.settings);
      }
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchAdminData(token);
    }
  }, [isOpen, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');

    try {
      const res = await api.adminLogin(usernameInput.trim(), passwordInput.trim());
      if (res.success && res.token) {
        setToken(res.token);
        sessionStorage.setItem('jn_admin_token', res.token);
        fetchAdminData(res.token);
      } else {
        setAuthError(res.message || 'Identifiant ou mot de passe incorrect.');
      }
    } catch (err: any) {
      setAuthError('Erreur de connexion au serveur.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    sessionStorage.removeItem('jn_admin_token');
  };

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Save Event Details & Posters
  const handleSaveEvent = async () => {
    if (!token || !currentEvent) return;
    setIsSaving(true);
    try {
      const res = await api.updateAdminEvent(token, currentEvent.id, currentEvent);
      if (res && res.success && res.event) {
        setCurrentEvent(res.event);
        showNotification('✅ Modifications appliquées et synchronisées en direct sur le site !');
        // Notify parent immediately
        if (onDataUpdated) onDataUpdated();
        // Global event dispatch to ensure all components and views update
        window.dispatchEvent(new CustomEvent('jn_event_updated', { detail: res.event }));
        fetchAdminData(token);
      } else {
        alert(res?.message || 'Erreur lors de la sauvegarde du contenu.');
      }
    } catch (err: any) {
      alert('Erreur lors de la sauvegarde: ' + (err.message || 'Erreur réseau'));
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload Handler
  const handleImageUpload = (field: 'poster_url' | 'hero_bg_url' | 'crowd_img_url', file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      if (base64 && currentEvent) {
        const updated = { ...currentEvent, [field]: base64 };
        setCurrentEvent(updated);
        if (token) {
          try {
            await api.updateAdminEvent(token, currentEvent.id, { [field]: base64 });
            showNotification(`✅ Visuel (${field}) mis à jour immédiatement !`);
            if (onDataUpdated) onDataUpdated();
          } catch (err) {
            console.error(err);
          }
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Shuttle stops management
  const handleAddShuttleStop = () => {
    if (!newShuttleStop.trim() || !currentEvent) return;
    const updatedStops = [...currentEvent.free_transport_info, newShuttleStop.trim()];
    setCurrentEvent({ ...currentEvent, free_transport_info: updatedStops });
    setNewShuttleStop('');
  };

  const handleRemoveShuttleStop = (index: number) => {
    if (!currentEvent) return;
    const updatedStops = currentEvent.free_transport_info.filter((_, i) => i !== index);
    setCurrentEvent({ ...currentEvent, free_transport_info: updatedStops });
  };

  // Ticket Type update
  const handleSaveTicketType = async (type: TicketType) => {
    if (!token) return;
    try {
      await api.updateAdminTicketType(token, type.id, type);
      showNotification(`✅ Billet "${type.name}" mis à jour !`);
      fetchAdminData(token);
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert('Erreur de mise à jour du billet.');
    }
  };

  // Program Management
  const handleSaveProgramItem = async (item: ProgramItem) => {
    if (!token) return;
    try {
      await api.updateAdminProgramItem(token, item.id, item);
      showNotification(`✅ Étape "${item.title}" mise à jour !`);
      fetchAdminData(token);
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert('Erreur de mise à jour du programme.');
    }
  };

  const handleCreateProgramItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newProgramItem.title.trim()) return;
    try {
      await api.createAdminProgramItem(token, {
        ...newProgramItem,
        event_id: currentEvent?.id || 'event-jersey-2026'
      });
      setShowProgramCreate(false);
      setNewProgramItem({ time: '23:00', title: '', description: '', order_index: programs.length + 1 });
      showNotification('✅ Nouvelle étape ajoutée au programme !');
      fetchAdminData(token);
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert('Erreur lors de la création de l’étape.');
    }
  };

  const handleDeleteProgramItem = async (id: string) => {
    if (!token || !confirm('Supprimer cette étape du programme ?')) return;
    try {
      await api.deleteAdminProgramItem(token, id);
      showNotification('Étape supprimée du programme.');
      fetchAdminData(token);
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  // Approve a pending Wave payment
  const handleApprovePayment = async (orderNumber: string) => {
    if (!token) return;
    try {
      const res = await api.confirmOrder(orderNumber, `ADMIN-VALIDATED-${Date.now().toString(36)}`, 'Administrateur AJCD');
      if (res.success) {
        showNotification(`✅ Commande ${orderNumber} validée et billets générés !`);
        fetchAdminData(token);
        if (onDataUpdated) onDataUpdated();
      }
    } catch (err) {
      alert('Erreur lors de la validation.');
    }
  };

  // Delete participant
  const handleDeleteParticipant = async (id: string, name: string) => {
    if (!token) return;
    if (!confirm(`Supprimer définitivement le participant "${name}" ainsi que ses billets et commandes associés ?`)) {
      return;
    }
    try {
      const res = await api.deleteAdminParticipant(token, id);
      if (res.success) {
        showNotification(`✅ Participant "${name}" supprimé avec succès.`);
        fetchAdminData(token);
        if (onDataUpdated) onDataUpdated();
      } else {
        alert(res.message || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      alert('Erreur réseau lors de la suppression du participant.');
    }
  };

  // WhatsApp message generation & sending
  const generateWhatsAppTicketMessage = (
    customerName: string,
    orderNumber: string,
    ticketType: string,
    quantity: number,
    amount: number,
    ticketNumber?: string
  ) => {
    const origin = window.location.origin;
    const ticketUrl = `${origin}/?order=${encodeURIComponent(orderNumber)}`;
    const eventName = currentEvent?.name || 'JERSEY NIGHT CLUB PARTY REMIX';
    const eventEdition = currentEvent?.edition || '2026';
    const eventLocation = currentEvent ? `${currentEvent.location} · ${currentEvent.venue_details}` : 'Amaya Beach · Mboro Plage';
    const eventDate = currentEvent ? new Date(currentEvent.date).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : 'Samedi 03 Octobre 2026';
    const eventTime = currentEvent?.time || '20h00';
    const shuttles = currentEvent?.free_transport_info?.join(', ') || 'Diamaguene, Station Dabo, Mosquée HLM & Station marché';

    return `🎟️ *VOTRE BILLET OFFICIEL — ${eventName} ${eventEdition}*

Bonjour *${customerName || 'Cher Festivalier'}*,

Votre billet officiel pour la *${eventName}* est prêt et validé ! 🎉

📋 *DÉTAILS DU BILLET :*
• *N° Commande :* ${orderNumber}
${ticketNumber ? `• *N° Billet :* ${ticketNumber}\n` : ''}• *Formule :* ${ticketType}
• *Quantité :* ${quantity} billet(s)
• *Montant payé :* ${amount.toLocaleString('fr-FR')} FCFA

📅 *DATE & HEURE :*
${eventDate} dès ${eventTime}

📍 *LIEU DE LA SOIRÉE :*
${eventLocation}

👕 *DRESS CODE OFFICIEL :*
« Ton plus beau maillot ! » (Club, équipe nationale ou rétro)

🚌 *NAVETTES GRATUITES :*
Départs assurés depuis : ${shuttles}

📱 *VOTRE BILLET NUMÉRIQUE & QR CODE EN DIRECT :*
Cliquez ci-dessous pour afficher votre e-ticket avec QR Code :
👉 ${ticketUrl}

⚠️ *Consigne d'accès :* Présentez simplement ce lien ou le QR code à l'entrée du club pour le scan par les agents.

Au plaisir de vous accueillir à Amaya Beach !
_L'équipe AJCD Cogne Diola & Amaya_`;
  };

  const handleOpenWhatsAppModalForOrder = (order: Order) => {
    const phone = order.customer?.phone || '';
    const name = order.customer?.full_name || 'Client';
    const msg = generateWhatsAppTicketMessage(
      name,
      order.order_number,
      order.ticket_type_name || 'Billet',
      order.quantity || 1,
      order.total_amount || 0
    );

    setWhatsappModal({
      isOpen: true,
      phone,
      customerName: name,
      orderNumber: order.order_number,
      ticketNumber: '',
      message: msg,
      copied: false
    });
  };

  const handleOpenWhatsAppModalForTicket = (ticket: TicketItem) => {
    const phone = ticket.customer_phone || '';
    const name = ticket.customer_name || 'Client';
    const msg = generateWhatsAppTicketMessage(
      name,
      ticket.order_number,
      ticket.ticket_type || 'Billet',
      1,
      ticket.price || 0,
      ticket.ticket_number
    );

    setWhatsappModal({
      isOpen: true,
      phone,
      customerName: name,
      orderNumber: ticket.order_number,
      ticketNumber: ticket.ticket_number,
      message: msg,
      copied: false
    });
  };

  const handleSendWhatsAppNow = () => {
    let cleanPhone = whatsappModal.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 8 || cleanPhone.length === 9) {
      cleanPhone = '221' + cleanPhone;
    } else if (cleanPhone.startsWith('00221')) {
      cleanPhone = cleanPhone.slice(2);
    }

    const encodedMsg = encodeURIComponent(whatsappModal.message);
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;

    window.open(waUrl, '_blank');
    showNotification(`📱 WhatsApp ouvert pour ${whatsappModal.customerName} !`);
    setWhatsappModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleCopyWhatsAppMessage = () => {
    navigator.clipboard.writeText(whatsappModal.message);
    setWhatsappModal(prev => ({ ...prev, copied: true }));
    setTimeout(() => {
      setWhatsappModal(prev => ({ ...prev, copied: false }));
    }, 2500);
  };

  // Toggle promo active
  const handleTogglePromo = async (promoId: string) => {
    if (!token) return;
    try {
      await api.toggleAdminPromoCode(token, promoId);
      fetchAdminData(token);
    } catch (err) {
      console.error(err);
    }
  };

  // Create promo
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPromoCode.code) return;
    try {
      await api.createAdminPromoCode(token, newPromoCode);
      setShowPromoCreate(false);
      setNewPromoCode({
        code: '',
        discount_type: 'percent',
        discount_value: 10,
        expiration: '2026-10-04T23:59:59Z',
        usage_limit: 100,
        active: true
      });
      showNotification('✅ Nouveau code promo créé !');
      fetchAdminData(token);
    } catch (err) {
      alert('Erreur de création du code promo');
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    if (!token || !settings) return;
    try {
      await api.updateAdminSettings(token, settings);
      showNotification('✅ Paramètres généraux enregistrés !');
      fetchAdminData(token);
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert('Erreur lors de la sauvegarde des paramètres.');
    }
  };

  // Export CSV
  const handleExportCSV = (type: string) => {
    if (!token) return;
    window.open(`/api/export/${type}?token=${token}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#090d18] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-4 min-h-[640px] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#101626]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                ESPACE ORGANISATEURS — AJCD & AMAYA
              </div>
              <h3 className="text-lg font-black text-white font-display uppercase tracking-tight">
                Tableau de Bord & Gestionnaire de Contenu
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {token && (
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-slate-400 hover:text-white underline"
              >
                Déconnexion
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Save Success Notification Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center animate-fadeIn flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* If not logged in -> Login Screen with Identifiant & Mot de passe */}
        {!token ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <form onSubmit={handleLogin} className="max-w-md w-full space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400 shadow-xl">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                  Connexion Administration
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Accès réservé aux organisateurs AJCD Cogne Diola et Amaya.
                </p>
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Identifiant
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Identifiant (ex: AJCD)"
                    value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-white text-sm outline-none font-bold tracking-wider uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mot de passe"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-white text-sm outline-none"
                  />
                </div>

                {authError && (
                  <div className="text-xs text-red-400 font-medium bg-red-950/40 border border-red-500/30 p-2.5 rounded-lg flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 transition-all"
              >
                {isAuthenticating ? 'Vérification en cours...' : 'Se Connecter à l’Administration'}
              </button>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
                <span className="text-amber-400 font-bold block text-[11px] uppercase tracking-wider">Identifiants demandés :</span>
                <div>Identifiant : <strong className="text-white font-mono">AJCD</strong></div>
                <div>Mot de passe : <strong className="text-white font-mono">cognediola</strong></div>
              </div>
            </form>
          </div>
        ) : (
          /* Logged In Dashboard Layout */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 border-r border-white/10 bg-[#0c101c] p-4 flex md:flex-col justify-between overflow-x-auto">
              <nav className="flex md:flex-col gap-1 w-full text-xs font-semibold">
                
                {/* 1. Contenu & Affiches */}
                <button
                  onClick={() => setActiveTab('content')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'content' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-amber-300" />
                  <span>Affiches & Contenu</span>
                </button>

                {/* 2. Tarifs & Billets */}
                <button
                  onClick={() => setActiveTab('tickets_config')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'tickets_config' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-emerald-300" />
                  <span>Tarifs & Billetterie</span>
                </button>

                {/* 3. Programme */}
                <button
                  onClick={() => setActiveTab('program')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'program' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Clock className="w-4 h-4 text-blue-300" />
                  <span>Programme Soirée</span>
                </button>

                {/* 4. Dashboard KPIs */}
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Statistiques</span>
                </button>

                {/* 5. Commandes */}
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'orders' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Commandes</span>
                  {orders.filter(o => o.payment_status === 'PENDING').length > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-bold">
                      {orders.filter(o => o.payment_status === 'PENDING').length}
                    </span>
                  )}
                </button>

                {/* 6. Billets émis */}
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'tickets' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Billets Émis</span>
                </button>

                {/* 7. Participants */}
                <button
                  onClick={() => setActiveTab('participants')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'participants' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Participants</span>
                </button>

                {/* 8. Codes promo */}
                <button
                  onClick={() => setActiveTab('promos')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                    activeTab === 'promos' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Codes Promo</span>
                </button>
              </nav>

              {/* Fast Scanner CTA */}
              <div className="hidden md:block pt-4 border-t border-white/10 space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenScanner();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ouvrir Scanner Entrée</span>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-5 sm:p-8 overflow-y-auto max-h-[75vh]">
              
              {/* TAB 1: MODIFIER LES AFFICHES ET LE CONTENU DU SITE */}
              {activeTab === 'content' && currentEvent && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h4 className="text-xl font-black text-white uppercase font-display tracking-tight flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-amber-400" />
                        <span>Modifier les Affiches & Textes du Site</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Toutes les modifications sont immédiatement répercutées sur la page d'accueil et la billetterie.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveEvent}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 self-start disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}</span>
                    </button>
                  </div>

                  {/* Section 1: Affiches & Visuels */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <span>1. Visuels & Affiches</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Affiche Principale de l'événement */}
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-white text-sm">Affiche Officielle Principale</div>
                            <div className="text-xs text-slate-400">Présente dans la section d'accueil & zoom plein écran</div>
                          </div>
                        </div>

                        {/* Image Preview */}
                        <div className="w-full h-72 bg-black rounded-xl border border-white/15 overflow-hidden flex items-center justify-center p-2">
                          <img
                            src={currentEvent.poster_url || "/src/assets/images/official_jersey_flyer_1790635512344.jpg"}
                            alt="Affiche Officielle"
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>

                        {/* Upload Button */}
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-slate-300">
                            Remplacer par un fichier image de votre appareil (Photo / Galerie / PC) :
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload('poster_url', file);
                            }}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                          />
                        </div>

                        {/* URL Direct Input */}
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Ou saisir l'URL directe de l'image :</label>
                          <input
                            type="text"
                            value={currentEvent.poster_url}
                            onChange={e => setCurrentEvent({ ...currentEvent, poster_url: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Arrière-plan Hero & Photo Ambiance */}
                      <div className="space-y-4">
                        {/* Background Hero */}
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                          <div>
                            <div className="font-bold text-white text-sm">Image d'Arrière-Plan Hero (Plage / Soirée)</div>
                            <div className="text-xs text-slate-400">Fond de la bannière principale</div>
                          </div>

                          <div className="w-full h-32 bg-black rounded-xl border border-white/15 overflow-hidden">
                            <img
                              src={currentEvent.hero_bg_url || "/src/assets/images/beach_nightclub_hero_1790634663007.jpg"}
                              alt="Fond Hero"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload('hero_bg_url', file);
                            }}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                          />
                        </div>

                        {/* Photo Ambiance Concept */}
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                          <div>
                            <div className="font-bold text-white text-sm">Photo Ambiance (Section Concept)</div>
                            <div className="text-xs text-slate-400">Aperçu photo des festivaliers en maillots</div>
                          </div>

                          <div className="w-full h-32 bg-black rounded-xl border border-white/15 overflow-hidden">
                            <img
                              src={currentEvent.crowd_img_url || "/src/assets/images/jersey_crowd_vibe_1790634672721.jpg"}
                              alt="Ambiance Concept"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload('crowd_img_url', file);
                            }}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Section 2: Informations & Textes de l'Événement */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h5 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">
                      2. Informations & Textes Clés
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-slate-300 font-bold block mb-1">Nom de l'événement</label>
                        <input
                          type="text"
                          value={currentEvent.name}
                          onChange={e => setCurrentEvent({ ...currentEvent, name: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 font-bold block mb-1">Édition / Année</label>
                        <input
                          type="text"
                          value={currentEvent.edition}
                          onChange={e => setCurrentEvent({ ...currentEvent, edition: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 font-bold block mb-1">Téléphone de Réservation</label>
                        <input
                          type="text"
                          value={currentEvent.reservation_phone}
                          onChange={e => setCurrentEvent({ ...currentEvent, reservation_phone: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Slogan */}
                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1">Slogan officiel</label>
                      <input
                        type="text"
                        value={currentEvent.slogan || "« Venez avec votre maillot… Repartez avec des souvenirs inoubliables. »"}
                        onChange={e => setCurrentEvent({ ...currentEvent, slogan: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs italic"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs text-slate-300 font-bold block mb-1">Date</label>
                        <input
                          type="date"
                          value={currentEvent.date}
                          onChange={e => setCurrentEvent({ ...currentEvent, date: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 font-bold block mb-1">Heure de début</label>
                        <input
                          type="text"
                          value={currentEvent.time}
                          onChange={e => setCurrentEvent({ ...currentEvent, time: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 font-bold block mb-1">Lieu</label>
                        <input
                          type="text"
                          value={currentEvent.location}
                          onChange={e => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 font-bold block mb-1">Précision Plage</label>
                        <input
                          type="text"
                          value={currentEvent.venue_details}
                          onChange={e => setCurrentEvent({ ...currentEvent, venue_details: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Dress Code & Ladies Offer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-300 font-bold block mb-1">Consigne Dress Code</label>
                        <textarea
                          rows={2}
                          value={currentEvent.dress_code}
                          onChange={e => setCurrentEvent({ ...currentEvent, dress_code: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-slate-300 font-bold block mb-1">Privilège Dames</label>
                        <input
                          type="text"
                          value={currentEvent.ladies_free_until}
                          onChange={e => setCurrentEvent({ ...currentEvent, ladies_free_until: e.target.value })}
                          placeholder="Ex: 1h du matin"
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Description du Concept */}
                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1">Description Complète du Concept</label>
                      <textarea
                        rows={3}
                        value={currentEvent.description}
                        onChange={e => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Section 3: Points de Navettes Gratuites */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h5 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Bus className="w-4 h-4 text-emerald-400" />
                      <span>3. Navettes Gratuites (Points de Départ)</span>
                    </h5>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ajouter un nouveau lieu de ramassage (ex: Station Shell Mboro)"
                        value={newShuttleStop}
                        onChange={e => setNewShuttleStop(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddShuttleStop}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentEvent.free_transport_info.map((stop, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                          <span className="font-medium text-white">{stop}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveShuttleStop(i)}
                            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Save Bar */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleSaveEvent}
                      className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Check className="w-5 h-5" />
                      <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer Toutes les Modifications'}</span>
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: TARIFS & BILLETTERIE */}
              {activeTab === 'tickets_config' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h4 className="text-xl font-black text-white uppercase font-display tracking-tight flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                        <span>Gestion des Tarifs & Types de Billets</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Ajustez les prix en FCFA, les quotas disponibles et activez ou suspendez les formules.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ticketTypes.map((tt) => (
                      <div key={tt.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            value={tt.name}
                            onChange={(e) => {
                              const updated = ticketTypes.map(t => t.id === tt.id ? { ...t, name: e.target.value } : t);
                              setTicketTypes(updated);
                            }}
                            className="font-black text-lg text-white bg-transparent border-b border-white/20 pb-1 outline-none w-3/4"
                          />
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tt.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {tt.active ? 'ACTIF' : 'SUSPENDU'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Prix (FCFA)</label>
                            <input
                              type="number"
                              value={tt.price}
                              onChange={(e) => {
                                const updated = ticketTypes.map(t => t.id === tt.id ? { ...t, price: Number(e.target.value) } : t);
                                setTicketTypes(updated);
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-amber-400 font-black text-base outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Prix barré / Original</label>
                            <input
                              type="number"
                              value={tt.original_price || ''}
                              placeholder="Facultatif"
                              onChange={(e) => {
                                const updated = ticketTypes.map(t => t.id === tt.id ? { ...t, original_price: Number(e.target.value) || undefined } : t);
                                setTicketTypes(updated);
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-slate-400 text-sm outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Badge Promo</label>
                            <input
                              type="text"
                              value={tt.badge || ''}
                              placeholder="Ex: PROMO EXCLUSIVE"
                              onChange={(e) => {
                                const updated = ticketTypes.map(t => t.id === tt.id ? { ...t, badge: e.target.value } : t);
                                setTicketTypes(updated);
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-xs text-slate-400 block mb-1">Quantité Totale</label>
                            <input
                              type="number"
                              value={tt.available_quantity}
                              onChange={(e) => {
                                const updated = ticketTypes.map(t => t.id === tt.id ? { ...t, available_quantity: Number(e.target.value) } : t);
                                setTicketTypes(updated);
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={tt.description}
                            onChange={(e) => {
                              const updated = ticketTypes.map(t => t.id === tt.id ? { ...t, description: e.target.value } : t);
                              setTicketTypes(updated);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs outline-none"
                          />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = ticketTypes.map(t => t.id === tt.id ? { ...t, active: !t.active } : t);
                              setTicketTypes(updated);
                            }}
                            className="text-xs text-slate-400 underline hover:text-white"
                          >
                            {tt.active ? 'Désactiver les ventes' : 'Réactiver les ventes'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveTicketType(tt)}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase"
                          >
                            Sauvegarder ce billet
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Wave Link & Payment Settings */}
                  {settings && (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                      <h5 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        <span>Paramètres de Paiement & Wave</span>
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Lien de Paiement Wave Officiel</label>
                          <input
                            type="text"
                            value={settings.wave_link}
                            onChange={e => setSettings({ ...settings, wave_link: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Numéro WhatsApp Officiel</label>
                          <input
                            type="text"
                            value={settings.whatsapp_phone_number}
                            onChange={e => setSettings({ ...settings, whatsapp_phone_number: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveSettings}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase"
                        >
                          Enregistrer les paramètres
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 3: PROGRAMME */}
              {activeTab === 'program' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h4 className="text-xl font-black text-white uppercase font-display tracking-tight flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <span>Programme de la Soirée ({programs.length} étapes)</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Gérez les créneaux horaires, les DJ sets et les animations en direct.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowProgramCreate(!showProgramCreate)}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter une étape</span>
                    </button>
                  </div>

                  {showProgramCreate && (
                    <form onSubmit={handleCreateProgramItem} className="p-5 rounded-2xl bg-white/5 border border-white/15 space-y-4">
                      <h5 className="text-xs font-bold text-amber-400 uppercase">Nouvelle Étape au Programme</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Horaire (ex: 23:30)</label>
                          <input
                            type="text"
                            required
                            value={newProgramItem.time}
                            onChange={e => setNewProgramItem({ ...newProgramItem, time: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-slate-400 block mb-1">Titre de l'étape</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Concours du meilleur maillot vintage"
                            value={newProgramItem.title}
                            onChange={e => setNewProgramItem({ ...newProgramItem, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={newProgramItem.description}
                          onChange={e => setNewProgramItem({ ...newProgramItem, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowProgramCreate(false)}
                          className="px-3 py-1.5 text-xs text-slate-400"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Ajouter au programme
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {programs.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <input
                            type="text"
                            value={item.time}
                            onChange={(e) => {
                              const updated = programs.map(p => p.id === item.id ? { ...p, time: e.target.value } : p);
                              setPrograms(updated);
                            }}
                            className="w-20 px-2 py-1 rounded bg-black/60 border border-white/10 text-amber-400 font-mono font-bold text-xs text-center"
                          />
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const updated = programs.map(p => p.id === item.id ? { ...p, title: e.target.value } : p);
                              setPrograms(updated);
                            }}
                            className="flex-1 font-bold text-white text-sm bg-transparent border-b border-white/10 pb-0.5 outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleSaveProgramItem(item)}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                          >
                            Enregistrer
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProgramItem(item.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 4: DASHBOARD STATS */}
              {activeTab === 'dashboard' && stats && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-xs text-slate-400 uppercase font-semibold">Chiffre d'Affaires</div>
                      <div className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
                        {stats.totalRevenue.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
                      </div>
                      <div className="text-[11px] text-emerald-400">Paiements Wave confirmés</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-xs text-slate-400 uppercase font-semibold">Billets Vendus</div>
                      <div className="text-2xl sm:text-3xl font-black text-white font-display">
                        {stats.totalTicketsSold}
                      </div>
                      <div className="text-[11px] text-slate-400">Sur {stats.capacity} places dispo</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-xs text-slate-400 uppercase font-semibold">Entrées Validées</div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
                        {stats.totalTicketsUsed}
                      </div>
                      <div className="text-[11px] text-slate-400">Taux de présence au club</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <div className="text-xs text-slate-400 uppercase font-semibold">Taux de Remplissage</div>
                      <div className="text-2xl sm:text-3xl font-black text-purple-400 font-display">
                        {stats.fillRate}%
                      </div>
                      <div className="text-[11px] text-slate-400">{stats.ticketsAvailable} billets restants</div>
                    </div>
                  </div>

                  {/* Daily Trend Chart Cards */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Évolution des Ventes & Entrées (7 derniers jours)
                    </h4>
                    <div className="grid grid-cols-7 gap-2 items-end h-40 pt-4">
                      {stats.dailyChart.map((item: any, i: number) => {
                        const maxVal = Math.max(...stats.dailyChart.map((d: any) => d.sales), 10);
                        const heightPct = Math.round((item.sales / maxVal) * 100);
                        return (
                          <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                            <div className="text-[10px] text-slate-400 font-mono">{item.sales}</div>
                            <div
                              className="w-full bg-gradient-to-t from-purple-600 to-amber-400 rounded-t-lg transition-all"
                              style={{ height: `${Math.max(12, heightPct)}%` }}
                              title={`${item.date}: ${item.sales} billets, ${item.revenue.toLocaleString('fr-FR')} FCFA`}
                            />
                            <div className="text-[10px] text-slate-400 truncate max-w-full">
                              {item.date.slice(5)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Export shortcuts */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-white">Exportation des Données Centralisées</div>
                      <div className="text-xs text-slate-400">Téléchargez les listings complets au format CSV/Excel.</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExportCSV('orders')}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Commandes (CSV)</span>
                      </button>
                      <button
                        onClick={() => handleExportCSV('tickets')}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Billets (CSV)</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white uppercase tracking-wider">
                      Gestion des Commandes ({orders.length})
                    </h4>
                    <button
                      onClick={() => fetchAdminData(token)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Actualiser
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-[#121828] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                        <tr>
                          <th className="p-3.5">N° Commande</th>
                          <th className="p-3.5">Client & Contact</th>
                          <th className="p-3.5">Qté & Formule</th>
                          <th className="p-3.5">Montant</th>
                          <th className="p-3.5">Statut</th>
                          <th className="p-3.5">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map(order => (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-white">
                              {order.order_number}
                              <div className="text-[10px] text-slate-500 font-sans">
                                {new Date(order.created_at).toLocaleDateString('fr-FR')} {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-white">{order.customer?.full_name}</div>
                              <div className="text-[11px] text-slate-400">{order.customer?.phone}</div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-white">{order.quantity}×</span> {order.ticket_type_name}
                            </td>
                            <td className="p-3.5 font-black text-amber-400 font-display">
                              {order.total_amount.toLocaleString('fr-FR')} FCFA
                            </td>
                            <td className="p-3.5">
                              {order.payment_status === 'PAID' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle className="w-3 h-3" />
                                  PAYÉ
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  <Clock className="w-3 h-3" />
                                  EN ATTENTE
                                </span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {order.payment_status === 'PENDING' && (
                                  <button
                                    onClick={() => handleApprovePayment(order.order_number)}
                                    className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase shadow-md transition-colors"
                                  >
                                    Valider
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenWhatsAppModalForOrder(order)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase shadow-md transition-colors flex items-center gap-1"
                                  title="Envoyer le ticket par WhatsApp au client"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: TICKETS DIRECTORY */}
              {activeTab === 'tickets' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white uppercase tracking-wider">
                      Tous les Billets Émis ({tickets.length})
                    </h4>
                    <button
                      onClick={() => handleExportCSV('tickets')}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exporter CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-[#121828] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                        <tr>
                          <th className="p-3.5">N° Billet</th>
                          <th className="p-3.5">Participant</th>
                          <th className="p-3.5">Formule</th>
                          <th className="p-3.5">Statut Entrée</th>
                          <th className="p-3.5">Contrôle / Horodatage</th>
                          <th className="p-3.5">WhatsApp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {tickets.map(ticket => (
                          <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-amber-400">
                              {ticket.ticket_number}
                              <div className="text-[10px] text-slate-500">{ticket.order_number}</div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-white">{ticket.customer_name}</div>
                              <div className="text-[11px] text-slate-400">{ticket.customer_phone}</div>
                            </td>
                            <td className="p-3.5">
                              {ticket.ticket_type}
                            </td>
                            <td className="p-3.5">
                              {ticket.status === 'USED' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  UTILISÉ
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  VALIDE
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-400">
                              {ticket.used_at ? (
                                <div>
                                  <div className="text-white font-medium">{new Date(ticket.used_at).toLocaleTimeString('fr-FR')}</div>
                                  <div className="text-[10px]">{ticket.validated_by}</div>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">Non scanné</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <button
                                onClick={() => handleOpenWhatsAppModalForTicket(ticket)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase shadow-md transition-colors flex items-center gap-1"
                                title="Envoyer ce billet au client par WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: PARTICIPANTS */}
              {activeTab === 'participants' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h4 className="text-base font-bold text-white uppercase tracking-wider">
                      Participants Inscrits ({participants.length})
                    </h4>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Rechercher nom, téléphone..."
                        value={participantSearch}
                        onChange={e => setParticipantSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-purple-500 w-64"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {participants
                      .filter(p => 
                        p.full_name.toLowerCase().includes(participantSearch.toLowerCase()) ||
                        p.phone.includes(participantSearch)
                      )
                      .map(p => (
                        <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 relative group hover:border-white/20 transition-all">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-8 h-8 rounded-full bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                {p.full_name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="overflow-hidden">
                                <div className="font-bold text-white text-sm truncate">{p.full_name}</div>
                                <div className="text-xs text-amber-400 font-mono">{p.phone}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const custOrder = orders.find(o => o.customer_id === p.id || o.customer?.phone === p.phone);
                                  if (custOrder) {
                                    handleOpenWhatsAppModalForOrder(custOrder);
                                  } else {
                                    const msg = generateWhatsAppTicketMessage(p.full_name, 'RÉSERVATION', 'Entrée Jersey Party', 1, 0);
                                    setWhatsappModal({
                                      isOpen: true,
                                      phone: p.phone,
                                      customerName: p.full_name,
                                      orderNumber: 'BILLET',
                                      ticketNumber: '',
                                      message: msg,
                                      copied: false
                                    });
                                  }
                                }}
                                className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                                title="Envoyer le ticket par WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteParticipant(p.id, p.full_name)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Supprimer ce participant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {p.email && (
                            <div className="text-xs text-slate-400 truncate">{p.email}</div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 8: CODES PROMO */}
              {activeTab === 'promos' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white uppercase tracking-wider">
                      Codes Promotionnels ({promoCodes.length})
                    </h4>
                    <button
                      onClick={() => setShowPromoCreate(!showPromoCreate)}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Créer un code promo</span>
                    </button>
                  </div>

                  {showPromoCreate && (
                    <form onSubmit={handleCreatePromo} className="p-5 rounded-2xl bg-white/5 border border-white/15 space-y-4">
                      <h5 className="text-sm font-bold text-white uppercase">Nouveau Code Promo</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Code</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: VIP2026"
                            value={newPromoCode.code}
                            onChange={e => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono uppercase"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Type de réduction</label>
                          <select
                            value={newPromoCode.discount_type}
                            onChange={e => setNewPromoCode({ ...newPromoCode, discount_type: e.target.value as any })}
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs"
                          >
                            <option value="percent">Pourcentage (%)</option>
                            <option value="fixed">Montant fixe (FCFA)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Valeur</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={newPromoCode.discount_value}
                            onChange={e => setNewPromoCode({ ...newPromoCode, discount_value: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPromoCreate(false)}
                          className="px-3 py-1.5 text-xs text-slate-400"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {promoCodes.map(promo => (
                      <div key={promo.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-lg text-amber-400">{promo.code}</span>
                          <button
                            onClick={() => handleTogglePromo(promo.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              promo.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {promo.active ? 'ACTIF' : 'INACTIF'}
                          </button>
                        </div>
                        <div className="text-xs text-slate-300">
                          Réduction : <strong>{promo.discount_value} {promo.discount_type === 'percent' ? '%' : 'FCFA'}</strong>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Utilisations : {promo.times_used} / {promo.usage_limit || 'Illimité'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* WHATSAPP TICKET SENDER POPUP MODAL */}
        {whatsappModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-xl bg-[#0d1322] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl shadow-emerald-950/50 space-y-4 text-white">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg font-display uppercase tracking-tight">
                      Envoi du Billet via WhatsApp
                    </h4>
                    <div className="text-xs text-slate-400">
                      Destinataire : <strong className="text-white">{whatsappModal.customerName}</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsappModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Numéro WhatsApp du client (avec indicatif) :
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={whatsappModal.phone}
                      onChange={e => setWhatsappModal(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Ex: 77 123 45 67 ou 221771234567"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-emerald-400 outline-none"
                    />
                    <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 rounded-xl">
                      +221 Auto
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-bold">
                      Message formaté officiel (modulable avant envoi) :
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Format WhatsApp compatible</span>
                  </div>
                  <textarea
                    rows={11}
                    value={whatsappModal.message}
                    onChange={e => setWhatsappModal(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full p-3.5 rounded-xl bg-black/60 border border-white/15 text-slate-200 text-xs font-mono leading-relaxed outline-none focus:border-emerald-400 resize-none shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCopyWhatsAppMessage}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{whatsappModal.copied ? '✅ Texte Copié !' : 'Copier le texte'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWhatsappModal(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsAppNow}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Ouvrir WhatsApp & Envoyer</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
