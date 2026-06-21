import express from 'express';

const router = express.Router();

/**
 * @openapi
 * /api/test:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: 'boolean', example: true }
 */
router.get('/test', (req, res) => res.json({ ok: true }));

/**
 * @openapi
 * /api/games:
 *   get:
 *     summary: Get all games
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of games
 */
router.get('/games', async (req, res) => {
  try {
    const games = await req.prisma.games.findMany({
      select: { id: true, name: true, slug: true, hasZone: true, bgPosition: true, updatedAt: true, logo: true, bg: true }
    });
    const ts = Date.now();
    const data = games.map(g => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      hasZone: g.hasZone,
      bgPosition: g.bgPosition,
      updatedAt: g.updatedAt,
      logo: g.logo ? `/api/game-media/${g.id}/logo?v=${g.updatedAt?.getTime() || ts}` : null,
      bg: g.bg ? `/api/game-media/${g.id}/bg?v=${g.updatedAt?.getTime() || ts}` : null
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @openapi
 * /api/games/{slug}:
 *   get:
 *     summary: Get specific game by slug
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Game details with items
 *       404:
 *         description: Game not found
 */
router.get('/games/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const game = await req.prisma.games.findUnique({ where: { slug } });

    if (!game) {
      return res.status(404).json({ success: false, message: "Game tidak ditemukan" });
    }

    const data = {
      id: game.id,
      name: game.name,
      slug: game.slug,
      logoUrl: game.logo ? `/api/game-media/${game.id}/logo?v=${game.updatedAt?.getTime() || Date.now()}` : null,
      itemIconUrl: game.itemIcon ? `/api/game-media/${game.id}/icon?v=${game.updatedAt?.getTime() || Date.now()}` : null,
      bgUrl: game.bg ? `/api/game-media/${game.id}/bg?v=${game.updatedAt?.getTime() || Date.now()}` : null,
      bgPosition: game.bgPosition,
      hasZone: game.hasZone,
      userIdLabel: game.userIdLabel,
      userIdPlaceholder: game.userIdPlaceholder,
      zoneIdLabel: game.zoneIdLabel,
      zoneIdPlaceholder: game.zoneIdPlaceholder,
      zoneIdHint: game.zoneIdHint,
      zoneIdMaxLength: game.zoneIdMaxLength,
      items: game.items,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @openapi
 * /api/game-media/{id}/{type}:
 *   get:
 *     summary: Get game image (logo, bg, or icon)
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [logo, bg, icon] }
 *     responses:
 *       200:
 *         description: Binary image data
 *       404:
 *         description: Image not found
 */
router.get('/game-media/:id/:type', async (req, res) => {
  try {
    const { id, type } = req.params;

    const fieldMap = { logo: 'logo', bg: 'bg', icon: 'itemIcon' };
    const field = fieldMap[type];
    if (!field) return res.status(400).json({ success: false, message: "Tipe media tidak valid" });

    const game = await req.prisma.games.findUnique({
      where: { id },
      select: { [field]: true }
    });

    if (!game || !game[field]) {
      return res.status(404).json({ success: false, message: "Media tidak ditemukan" });
    }

    const mimeMap = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp'
    };

    const buffer = Buffer.isBuffer(game[field]) ? game[field] : Buffer.from(game[field]);
    const sig = buffer.slice(0, 4).toString('hex');
    const mime = sig.startsWith('8950') ? 'image/png'
      : sig.startsWith('ffd8') ? 'image/jpeg'
      : sig.startsWith('4746') ? 'image/gif'
      : sig.startsWith('5249') ? 'image/webp'
      : 'image/png';

    res.set('Content-Type', mime);
    res.set('Cache-Control', 'no-cache, must-revalidate');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @openapi
 * /api/payment-methods:
 *   get:
 *     summary: Get all payment methods
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of payment methods
 */
router.get('/payment-methods', async (req, res) => {
  try {
    const paymentMethods = await req.prisma.payment_methods.findMany();
    res.json({ success: true, data: paymentMethods });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @openapi
 * /api/leaderboard:
 *   get:
 *     summary: Get leaderboard (top spenders last 30 days)
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Leaderboard data
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const data = await req.transactionService.getLeaderboard();
    res.json({ success: true, data });
  } catch (err) {
    req.transactionService.handleError(res, err, "Gagal mengambil leaderboard");
  }
});

export default router;
