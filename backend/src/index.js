import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// ==========================================
// 1. MIDDLEWARE (Zero Bottleneck CORS)
// ==========================================
app.use('/*', cors({
  origin: '*', // Saat production, ganti dengan domain lu (contoh: 'https://kelompok4.pages.dev')
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Global Error Handler
app.onError((err, c) => {
  console.error(`[NEXA ERROR]: ${err.message}`)
  return c.json({ success: false, message: "Terjadi kesalahan pada server NEXA.", error: err.message }, 500)
})

// ==========================================
// 2. ROOT ENDPOINT (Health Check)
// ==========================================
app.get('/', (c) => {
  return c.json({
    system: "NEXA API Core",
    status: "Online",
    version: c.env.NEXA_VERSION,
    timestamp: new Date().toISOString()
  })
})

// ==========================================
// 3. LEADERBOARD ENDPOINTS
// ==========================================
app.get('/api/leaderboard', async (c) => {
  try {
    // Mengambil 10 skor tertinggi
    const { results } = await c.env.DB.prepare(`
      SELECT username, score, time_spent 
      FROM quiz_scores 
      ORDER BY score DESC, time_spent ASC 
      LIMIT 10
    `).all()

    return c.json({ success: true, data: results })
  } catch (error) {
    throw new Error("Gagal mengambil data leaderboard dari Database.")
  }
})

// ==========================================
// 4. SUBMIT SCORE ENDPOINT
// ==========================================
app.post('/api/quiz/submit', async (c) => {
  try {
    const body = await c.req.json()
    const { username, score, time_spent } = body

    // Validasi basic
    if (!username || score === undefined) {
      return c.json({ success: false, message: "Data tidak lengkap. Username dan Score wajib diisi!" }, 400)
    }

    // Insert ke D1 Database
    const result = await c.env.DB.prepare(`
      INSERT INTO quiz_scores (username, score, time_spent) 
      VALUES (?, ?, ?)
    `).bind(username, score, time_spent || 0).run()

    if (result.success) {
      return c.json({ success: true, message: "Skor berhasil disinkronisasi ke server NEXA!" }, 201)
    } else {
      throw new Error("Insert database gagal.")
    }
  } catch (error) {
    throw new Error("Gagal menyimpan skor.")
  }
})

// ==========================================
// 5. NEXA AI INSIGHT (Simulasi Endpoint)
// ==========================================
app.get('/api/ai/insight/:topic', async (c) => {
  const topic = c.req.param('topic')
  
  // Nanti lu bisa integrasiin API asli ke sini tanpa mengekspos API Key ke frontend
  return c.json({
    success: true,
    topic: topic,
    insight: `NEXA AI memproses analisis mendalam mengenai ${topic}. Ini adalah sintesis dari rasionalitas dan hikmah klasik.`
  })
})

export default app