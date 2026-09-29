import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Admin authentication middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.query.token as string);

  if (!db.verifyAdminToken(token)) {
    return res.status(401).json({ success: false, message: 'Accès non autorisé. Session invalide ou expirée.' });
  }
  next();
};

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// 1. Get Event Information & Initial Data
app.get('/api/event', (_req: Request, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=5, stale-while-revalidate=30');
    const event = db.getActiveEvent();
    const ticketTypes = db.getTicketTypes(event.id);
    const programs = db.getPrograms(event.id);
    const settings = db.getSettings();

    res.json({
      success: true,
      event,
      ticketTypes,
      programs,
      settings: {
        wave_link: settings.wave_link,
        whatsapp_phone_number: settings.whatsapp_phone_number,
        contact_phone: settings.contact_phone,
        contact_email: settings.contact_email,
        currency: settings.currency
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Validate Promo Code
app.post('/api/promo/validate', (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code promo requis.' });
    }
    const result = db.validatePromoCode(code, Number(subtotal) || 0);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Create Order (Pending Wave payment)
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { fullName, phone, email, ticketTypeId, quantity, promoCode } = req.body;
    const result = db.createOrder({
      fullName,
      phone,
      email,
      ticketTypeId,
      quantity: Number(quantity) || 1,
      promoCode
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Get Order Status & Details
app.get('/api/orders/:id', (req: Request, res: Response) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable.' });
    }
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Confirm Payment (Atomic ticket generation)
app.post('/api/orders/:id/confirm', (req: Request, res: Response) => {
  try {
    const { reference, operator } = req.body;
    const result = db.confirmPayment(req.params.id, reference, operator || 'Système Wave');

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Cancel Order
app.post('/api/orders/:id/cancel', (req: Request, res: Response) => {
  try {
    const success = db.cancelOrder(req.params.id);
    res.json({ success, message: success ? 'Commande annulée' : 'Commande introuvable' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Atomic Ticket Entrance Check-in (Scan / Manual)
app.post('/api/checkin/scan', (req: Request, res: Response) => {
  try {
    const { identifier, operator, method } = req.body;
    if (!identifier) {
      return res.status(400).json({
        valid: false,
        status: 'INVALID',
        message: 'Identifiant du QR code ou numéro de billet manquant.'
      });
    }

    const result = db.validateTicketAtEntrance(identifier, operator || 'Contrôle Entrée Amaya', method || 'camera');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Get Recent Check-ins
app.get('/api/checkin/history', (_req: Request, res: Response) => {
  try {
    const checkIns = db.getCheckIns(50);
    res.json({ success: true, checkIns });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = db.adminLogin(username, password);
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// SECURED ADMIN ROUTES
// -------------------------------------------------------------

// 10. Dashboard Stats
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 11. All Orders
app.get('/api/admin/orders', requireAdmin, (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 200;
    const orders = db.getOrders(limit);
    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 12. All Tickets
app.get('/api/admin/tickets', requireAdmin, (_req: Request, res: Response) => {
  try {
    const tickets = db.getTickets();
    res.json({ success: true, tickets });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 13. Participants
app.get('/api/admin/participants', requireAdmin, (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const customers = db.searchCustomers(query);
    res.json({ success: true, customers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/participants/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const ok = db.deleteCustomer(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Participant introuvable.' });
    }
    res.json({ success: true, message: 'Participant supprimé avec succès.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 14. Promo Codes List
app.get('/api/admin/promo-codes', requireAdmin, (_req: Request, res: Response) => {
  try {
    const promoCodes = db.getPromoCodes();
    res.json({ success: true, promoCodes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 15. Create Promo Code
app.post('/api/admin/promo-codes', requireAdmin, (req: Request, res: Response) => {
  try {
    const newPromo = db.createPromoCode(req.body);
    res.status(201).json({ success: true, promoCode: newPromo });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 16. Toggle Promo Code
app.post('/api/admin/promo-codes/:id/toggle', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.togglePromoCode(req.params.id);
    if (!updated) return res.status(404).json({ success: false, message: 'Code promo introuvable.' });
    res.json({ success: true, promoCode: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 17. Update Event
app.post('/api/admin/events/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateEvent(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Événement introuvable.' });
    res.json({ success: true, event: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 18. Update Ticket Type
app.post('/api/admin/ticket-types/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateTicketType(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Type de billet introuvable.' });
    res.json({ success: true, ticketType: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 19. Program Item Actions
app.post('/api/admin/program', requireAdmin, (req: Request, res: Response) => {
  try {
    const item = db.createProgramItem(req.body);
    res.status(201).json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/program/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateProgram(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Élément introuvable.' });
    res.json({ success: true, item: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/program/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const ok = db.deleteProgramItem(req.params.id);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 20. Update Settings
app.post('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 21. Data Export (CSV)
app.get('/api/export/:type', requireAdmin, (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    let csvData = '';
    let filename = `jerseynight-${type}-${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'orders') {
      const orders = db.getOrders(1000);
      csvData = 'Numéro Commande,Client,Téléphone,Email,Quantité,Montant Total,Statut,Date,Code Promo\n';
      orders.forEach(o => {
        csvData += `"${o.order_number}","${o.customer?.full_name || ''}","${o.customer?.phone || ''}","${o.customer?.email || ''}",${o.quantity},${o.total_amount},"${o.payment_status}","${o.created_at}","${o.promo_code || ''}"\n`;
      });
    } else if (type === 'tickets') {
      const tickets = db.getTickets();
      csvData = 'Numéro Billet,Commande,Nom Participant,Téléphone,Type Billet,Statut,Date Validation,Opérateur,QR Token\n';
      tickets.forEach(t => {
        csvData += `"${t.ticket_number}","${t.order_number}","${t.customer_name}","${t.customer_phone}","${t.ticket_type}","${t.status}","${t.used_at || ''}","${t.validated_by || ''}","${t.qr_token}"\n`;
      });
    } else if (type === 'checkins') {
      const checkIns = db.getCheckIns(1000);
      csvData = 'Numéro Billet,Participant,Type Billet,Date Scan,Opérateur,Méthode\n';
      checkIns.forEach(c => {
        csvData += `"${c.ticket_number}","${c.customer_name}","${c.ticket_type}","${c.scanned_at}","${c.operator}","${c.method}"\n`;
      });
    } else {
      return res.status(400).send('Type d’export non supporté.');
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE OR STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jersey Night Ticketing server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
