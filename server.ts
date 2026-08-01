import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Initialize Express App
const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Meta Webhook Verification Endpoint
app.get('/api/webhook', (req, res) => {
  const verify_token = process.env.META_VERIFY_TOKEN || 'my_secure_verify_token_123';

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).type('text/plain').send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Meta Webhook Receive Endpoint (for incoming messages if you need them)
app.post('/api/webhook', (req, res) => {
  const body = req.body;
  if (body.object) {
    if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const message = body.entry[0].changes[0].value.messages[0];
      console.log("Received WhatsApp Message:", message);
      // You can process the incoming message here if needed
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Endpoint to send WhatsApp notification on new order via Meta Cloud API
app.post('/api/notify-order', async (req, res) => {
  try {
    const { orderId, customerName, totalAmount, items } = req.body;
    
    const metaToken = process.env.META_WHATSAPP_TOKEN;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    const toNumber = process.env.ADMIN_WHATSAPP_NUMBER; // e.g. "21612345678" (No + sign)

    if (!metaToken || !phoneNumberId || !toNumber) {
      console.warn("Meta WhatsApp credentials not fully configured. Notification skipped.");
      return res.status(200).json({ success: false, message: 'Meta WhatsApp not configured' });
    }

    const messageBody = `*طلب جديد!* 🛒\n\n*رقم الطلب:* ${orderId}\n*العميل:* ${customerName || 'غير معروف'}\n*القيمة:* ${totalAmount} د.ت\n*المنتجات:* ${items || 1}\n\nيرجى مراجعة لوحة التحكم للتفاصيل.`;

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${metaToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toNumber,
        type: 'text',
        text: { body: messageBody }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta API Error:', data);
      return res.status(500).json({ success: false, error: 'Failed to send WhatsApp message via Meta API' });
    }

    res.json({ success: true, messageId: data.messages?.[0]?.id });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ success: false, error: 'Failed to send WhatsApp message' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
