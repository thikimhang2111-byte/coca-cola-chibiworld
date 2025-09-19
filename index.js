// Simple Express server to store characters in memory (or file) and serve shareable URLs + QR generation
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const QRCode = require('qrcode')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const DATA_FILE = path.join(__dirname, 'data.json')
let db = { characters: {} }
try {
  if (fs.existsSync(DATA_FILE)) {
    db = JSON.parse(fs.readFileSync(DATA_FILE))
  }
} catch(e){ console.error('load db', e) }

function saveDB(){ fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2)) }

app.post('/api/character', async (req,res) => {
  const char = req.body
  if (!char || !char.id) return res.status(400).json({error:'missing id'})
  db.characters[char.id] = char
  saveDB()
  // generate a small QR linking to /c/:id
  const siteBase = process.env.SITE_BASE || 'http://localhost:3000'
  const target = `${siteBase}/character/${char.id}`
  try {
    const qrDataUrl = await QRCode.toDataURL(target)
    res.json({ ok: true, id: char.id, url: target, qr: qrDataUrl })
  } catch (e) {
    res.json({ ok: true, id: char.id, url: target })
  }
})

app.get('/c/:id', (req,res) => {
  const id = req.params.id
  const char = db.characters[id]
  if (!char) return res.status(404).send('Not found')
  // Redirect to front-end character page (for shareable short link)
  const siteBase = process.env.SITE_BASE || 'http://localhost:3000'
  res.redirect(`${siteBase}/character/${id}`)
})

const port = process.env.PORT || 4000
app.listen(port, ()=> console.log('Server listening on', port))