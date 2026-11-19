import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));

// Health check endpoint for Cloud Run
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// Proxy Google Maps Static API image generation for PNG report exports (avoids browser CORS issues)
app.post('/api/static-map', async (req, res) => {
  try {
    const body = req.body as {
      center?: { lat?: number; lng?: number };
      zoom?: number;
      width?: number;
      height?: number;
      scale?: number;
      maptype?: string;
      markers?: unknown;
      paths?: unknown;
      apiKey?: string;
    };

    const rawKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      (typeof body?.apiKey === 'string' ? body.apiKey.trim() : '');

    if (!rawKey) {
      res.status(400).json({ error: 'Kunci API Google Maps tidak tersedia.' });
      return;
    }

    const lat = Number(body?.center?.lat);
    const lng = Number(body?.center?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ error: 'Koordinat pusat peta tidak valid.' });
      return;
    }

    const rawZoom = Number(body?.zoom);
    const zoom = Number.isFinite(rawZoom) ? Math.min(21, Math.max(1, Math.round(rawZoom))) : 6;
    const width = Number.isFinite(Number(body?.width))
      ? Math.min(640, Math.max(200, Math.round(Number(body.width))))
      : 640;
    const height = Number.isFinite(Number(body?.height))
      ? Math.min(640, Math.max(200, Math.round(Number(body.height))))
      : 400;
    const scale = body?.scale === 1 ? '1' : '2';
    const allowedMapTypes = new Set(['roadmap', 'satellite', 'terrain', 'hybrid']);
    const maptype =
      typeof body?.maptype === 'string' && allowedMapTypes.has(body.maptype)
        ? body.maptype
        : 'roadmap';

    const params = new URLSearchParams({
      center: `${lat.toFixed(6)},${lng.toFixed(6)}`,
      zoom: String(zoom),
      size: `${width}x${height}`,
      scale,
      format: 'png32',
      maptype,
      language: 'id',
      region: 'ID',
      solution_id: 'gmp_mcp_codeassist_v1_aistudio',
      key: rawKey,
    });

    if (Array.isArray(body?.paths)) {
      body.paths
        .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
        .slice(0, 12)
        .forEach((p) => params.append('path', p));
    }

    if (Array.isArray(body?.markers)) {
      body.markers
        .filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
        .slice(0, 20)
        .forEach((m) => params.append('markers', m));
    }

    const targetUrl = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
    if (targetUrl.length > 16384) {
      res.status(400).json({ error: 'Parameter peta melebihi batas panjang URL Maps Static API.' });
      return;
    }

    const upstream = await fetch(targetUrl);
    const contentType = upstream.headers.get('content-type') || '';

    if (!upstream.ok || !contentType.startsWith('image/')) {
      const errText = await upstream.text().catch(() => '');
      const upper = errText.toUpperCase();
      const quotaExceeded =
        upstream.status === 429 ||
        upper.includes('QUOTA') ||
        upper.includes('OVER_QUERY_LIMIT') ||
        upper.includes('RESOURCE_EXHAUSTED');

      res.status(upstream.status || 502).json({
        error: errText.slice(0, 300) || `Maps Static API mengembalikan status ${upstream.status}`,
        quotaExceeded,
      });
      return;
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="peta-proyek-sapa.png"');
    res.setHeader('Cache-Control', 'no-store');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Static map export error:', err);
    res.status(500).json({ error: 'Gagal membuat gambar peta statis.' });
  }
});

// Setup development vs production server
async function setupServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get('*', (_req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('OK');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (${isDev ? 'Development' : 'Production'})`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
