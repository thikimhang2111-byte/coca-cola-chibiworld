// App.jsx — simplified CocaWorld front-end (client-only)
// NOTE: This file is based on the canvas preview created earlier. It is intentionally self-contained.
import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'

const generateId = (prefix = 'id') => prefix + '_' + Math.random().toString(36).slice(2, 9)

const Storage = {
  saveCharacter: (userId, char) => {
    const key = `cw:chars:${userId}`
    const arr = JSON.parse(localStorage.getItem(key) || '[]')
    arr.push(char)
    localStorage.setItem(key, JSON.stringify(arr))
    return char
  },
  getCharacters: (userId) => JSON.parse(localStorage.getItem(`cw:chars:${userId}`) || '[]'),
  saveUser: (user) => { localStorage.setItem('cw:user', JSON.stringify(user)); },
  getUser: () => JSON.parse(localStorage.getItem('cw:user') || 'null')
}

const AppShell = ({ children }) => {
  const user = Storage.getUser()
  return (
    <div style={{minHeight:'100vh',background:'#b71c1c',color:'white',fontFamily:'sans-serif'}}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 24px',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:40,height:40,background:'#fff2',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>C</div>
          <h1 style={{margin:0}}>CocaWorld</h1>
        </div>
        <nav style={{display:'flex',gap:8}}>
          <Link to="/create" style={{color:'white'}}>Tạo nhân vật</Link>
          <Link to="/interact" style={{color:'white'}}>Tương tác</Link>
          <Link to="/qr" style={{color:'white'}}>QR</Link>
          <Link to="/minigame" style={{color:'white'}}>Minigame</Link>
        </nav>
        <div>
          {user ? (<span>{user.name}</span>) : (<GoogleSignIn />)}
        </div>
      </header>
      <main style={{padding:24}}>{children}</main>
    </div>
  )
}

function GoogleSignIn () {
  const signIn = () => {
    const name = prompt('Nhập tên (mô phỏng đăng nhập Google)')
    if (name) { Storage.saveUser({ id: generateId('user'), name }); window.location.reload() }
  }
  return <button onClick={signIn} style={{background:'rgba(255,255,255,0.08)',border:'none',padding:'8px 12px',borderRadius:6,color:'white'}}>Đăng nhập bằng Google</button>
}

const STARTER_CLOTHES = {
  shirts: ['Áo 1','Áo 2','Áo 3'],
  pants: ['Quần 1','Quần 2','Quần 3'],
  hats: ['Mũ 1','Mũ 2'],
  hairs: ['Tóc ngắn','Tóc dài'],
  bottle: ['Chai coca mini']
}

export default function App () {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateCharacter />} />
          <Route path="/character/:id" element={<CharacterView />} />
          <Route path="/qr" element={<QRPage />} />
          <Route path="/interact" element={<Interact />} />
          <Route path="/story/:npcId" element={<StoryPage />} />
          <Route path="/minigame" element={<MinigameIndex />} />
          <Route path="/minigame/collect" element={<CollectGame />} />
          <Route path="/minigame/slime" element={<SlimeGame />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/collection" element={<Collection />} />
        </Routes>
      </AppShell>
    </Router>
  )
}

function Home () {
  return (
    <div style={{maxWidth:900,margin:'0 auto',background:'rgba(255,255,255,0.03)',padding:20,borderRadius:10}}>
      <h2>Chào mừng đến CocaWorld</h2>
      <p>Sử dụng menu trên để tạo nhân vật, quét QR, chơi minigame và thu thập icon.</p>
    </div>
  )
}

function CreateCharacter () {
  const user = Storage.getUser() || { id: 'guest' }
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [gender, setGender] = useState('nam')
  const [tone, setTone] = useState(3)
  const [personality, setPersonality] = useState('Vui vẻ')
  const [emotion, setEmotion] = useState('cười')
  const [clothes, setClothes] = useState({ shirt: 0, pant: 0, hat: null, hair: 0 })

  const save = async () => {
    const id = generateId('char')
    const char = { id, owner: user.id, name, gender, tone, personality, emotion, clothes }
    // save locally and also POST to server (if available)
    Storage.saveCharacter(user.id, char)
    try {
      await fetch('/api/character', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(char)
      })
    } catch(e){}
    alert('Đã lưu nhân vật! Link chia sẻ sẽ được tạo.')
    navigate(`/character/${id}`)
  }

  return (
    <div style={{maxWidth:900,margin:'0 auto',background:'rgba(255,255,255,0.03)',padding:20,borderRadius:10}}>
      <h2>Tạo nhân vật</h2>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <label>Tên</label>
          <input value={name} onChange={e=>setName(e.target.value)} style={{width:'100%',padding:8,marginTop:6}} />
          <label style={{marginTop:12}}>Giới tính</label>
          <select value={gender} onChange={e=>setGender(e.target.value)} style={{width:'100%',padding:8,marginTop:6}}>
            <option value="nam">Nam</option>
            <option value="nu">Nữ</option>
          </select>
          <label style={{marginTop:12}}>Tính cách</label>
          <input value={personality} onChange={e=>setPersonality(e.target.value)} style={{width:'100%',padding:8,marginTop:6}} />
          <div style={{marginTop:12}}>
            <button onClick={save} style={{padding:'8px 12px',borderRadius:6,background:'rgba(255,255,255,0.08)',border:'none'}}>Lưu</button>
          </div>
        </div>
        <div style={{width:320}}>
          <div style={{background:'rgba(255,255,255,0.02)',padding:12,borderRadius:8}}>
            <div>Preview nhân vật (mock)</div>
            <div style={{height:160,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.03)',marginTop:12,borderRadius:6}}>CHIBI MOCK</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CharacterView () {
  const { id } = useParams()
  const searchAll = () => {
    const keys = Object.keys(localStorage).filter(k=>k.startsWith('cw:chars:'))
    for (const k of keys) {
      const arr = JSON.parse(localStorage.getItem(k) || '[]')
      const c = arr.find(x=>x.id===id)
      if (c) return c
    }
    return null
  }
  const char = searchAll()
  if (!char) return <div>Không tìm thấy nhân vật</div>
  return (
    <div style={{maxWidth:800,margin:'0 auto',background:'rgba(255,255,255,0.03)',padding:20,borderRadius:10}}>
      <h2>{char.name} (chibi)</h2>
      <div>Giới tính: {char.gender} — Tính cách: {char.personality}</div>
      <div style={{marginTop:12}}>Link chia sẻ: <input readOnly value={window.location.href} style={{width:'100%',padding:8,marginTop:6}} /></div>
    </div>
  )
}

function QRPage () {
  const codes = [
    { id: 'npc_unlock', label: 'Mã mở khóa NPC (cốt truyện)' },
    { id: 'clothes', label: 'Mã nhận phụ kiện' },
    { id: 'heal', label: 'Mã vật phẩm hồi sức' },
    { id: 'icon', label: 'Mã nhận icon bộ sưu tập' }
  ]
  return (
    <div style={{maxWidth:900,margin:'0 auto',background:'rgba(255,255,255,0.03)',padding:20,borderRadius:10}}>
      <h2>QR & Mã</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {codes.map(c=>(
          <div key={c.id} style={{padding:12,background:'rgba(0,0,0,0.15)',borderRadius:8}}>
            <div style={{fontWeight:600}}>{c.label}</div>
            <div style={{marginTop:8,fontSize:13}}>Mã ví dụ: {c.id}_{generateId().slice(3)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Interact () {
  const npcs = [
    { id: 'npc1', type: 'nam', title: 'NPC nam cao to (khóa)' },
    { id: 'npc2', type: 'nu', title: 'NPC nữ mang bầu (khóa)' },
    { id: 'npc3', type: 'kid', title: 'NPC con nít (khóa)' }
  ]
  return (
    <div style={{maxWidth:900,margin:'0 auto',background:'rgba(255,255,255,0.03)',padding:20,borderRadius:10}}>
      <h2>Tương tác</h2>
      <div style={{display:'grid',gap:8}}>
        {npcs.map(n=>(
          <div key={n.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:12,background:'rgba(0,0,0,0.12)',borderRadius:8}}>
            <div>
              <div style={{fontWeight:600}}>{n.title}</div>
              <div style={{fontSize:13,marginTop:6}}>Trạng thái: Khóa — Mở khóa bằng QR trên chai</div>
            </div>
            <Link to={`/story/${n.id}`} style={{background:'rgba(255,255,255,0.08)',padding:'8px 12px',borderRadius:6}}>Xem</Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function StoryPage () {
  const { npcId } = useParams()
  const stories = {
    npc1: {
      title: 'Nam cao to nhặt rác',
      actions: [
        { id: 'pick', text: 'nhặt rác cùng', reward: { points: 100, achievement: 'Người bảo vệ môi trường sống' } },
        { id: 'skip', text: 'kệ và đi tiếp', penalty: -50 }
      ]
    },
    npc2: {
      title: 'Nữ mang bầu bị té',
      actions: [
        { id: 'help', text: 'đỡ NPC nữ dậy', reward: { achievement: 'Người tốt', item: 'chai coca' } },
        { id: 'ignore', text: 'bỏ qua và đi tiếp', penalty: -50 }
      ]
    },
    npc3: {
      title: 'Con nít bị đe dọa',
      actions: [
        { id: 'intervene', text: 'lại can ngăn', reward: { achievement: 'Không khí trong lành', item: 'chai coca' } },
        { id: 'leave', text: 'kệ', penalty: -50 }
      ]
    }
  }
  const st = stories[npcId]
  if (!st) return <div>NPC không tồn tại</div>
  const [message, setMessage] = useState('')
  const [points, setPoints] = useState(0)
  const handleAction = (a) => {
    if (a.reward) {
      setMessage(`Thưởng: ${JSON.stringify(a.reward)}`)
      setPoints(p=>p + (a.reward.points || 100))
    } else if (a.penalty) {
      setMessage('Bị trừ 50 điểm')
      setPoints(p=>p - 50)
    }
  }
  return (
    <div style={{maxWidth:800,margin:'0 auto',background:'rgba(255,255,255,0.03)',padding:20,borderRadius:10}}>
      <h2>{st.title}</h2>
      <div>{message}</div>
      <div style={{display:'grid',gap:8,marginTop:12}}>
        {st.actions.map(a=>(
          <button key={a.id} onClick={()=>handleAction(a)} style={{padding:'8px 12px',borderRadius:6,background:'rgba(255,255,255,0.06)'}}>{a.text}</button>
        ))}
      </div>
      <div style={{marginTop:12}}>Điểm hiện tại: {points}</div>
    </div>
  )
}

function MinigameIndex () {
  return (
    <div style={{maxWidth:900,margin:'0 auto',background:'rgba(255,255,255,0.03)',padding:20,borderRadius:10}}>
      <h2>Minigame</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Link to="/minigame/collect" style={{padding:12,background:'rgba(0,0,0,0.12)',borderRadius:8}}>Thu thập icon coca mini</Link>
        <Link to="/minigame/slime" style={{padding:12,background:'rgba(0,0,0,0.12)',borderRadius:8}}>Đánh quái (slime)</Link>
      </div>
    </div>
  )
}

function CollectGame () {
  const [round, setRound] = useState(1)
  const [collected, setCollected] = useState(0)
  const collect = () => setCollected(c=>c+1)
  useEffect(()=>{ if (collected>=3) { alert('Bạn thắng vòng ' + round); setCollected(0); setRound(r=>r+1) } }, [collected])
  return (
    <div style={{maxWidth:600,margin:'0 auto',background:'rgba(255,255,255,0.03)',padding:20,borderRadius:10}}>
      <h3>Vòng {round}</h3>
      <div>Thu thập: {collected}/3</div>
      <div style={{marginTop:12}}><button onClick={collect} style={{padding:'8px 12px',borderRadius:6}}>Thu icon coca</button></div>
    </div>
  )
}

function SlimeGame () {
  const [wave, setWave] = useState(1)
  const [stamina, setStamina] = useState(3)
  const attack = () => {
    alert('Bạn tiêu diệt quái ! +200 điểm')
    setWave(w=>w+1)
    setStamina(s=>s-1)
  }
  return (
    <div style={{maxWidth:600,margin:'0 auto',background:'rgba(255,255,255,0.03)',padding:20,borderRadius:10}}>
      <h3>Đánh slime — Vòng {wave}</h3>
      <div>Thể lực: {stamina}</div>
      <div style={{marginTop:12}}><button onClick={attack} style={{padding:'8px 12px',borderRadius:6}}>Đánh</button></div>
    </div>
  )
}

function Achievements () {
  return (
    <div style={{maxWidth:900,margin:'0 auto',background:'rgba(255,255,255,0.03)',padding:20,borderRadius:10}}>
      <h2>Thành tựu</h2>
      <div style={{display:'grid',gap:8,marginTop:12}}>
        <div style={{padding:12,background:'rgba(0,0,0,0.12)',borderRadius:8}}>Chào mừng đến thế giới mới — 100 điểm</div>
        <div style={{padding:12,background:'rgba(0,0,0,0.12)',borderRadius:8}}>Người sảng khoái — 700 điểm (icon kiếm)</div>
      </div>
    </div>
  )
}

function Collection () {
  const icons = new Array(10).fill(0).map((_,i)=>({ id:i, locked: true }))
  return (
    <div style={{maxWidth:900,margin:'0 auto',background:'rgba(255,255,255,0.03)',padding:20,borderRadius:10}}>
      <h2>Bộ sưu tập</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginTop:12}}>
        {icons.map(ic=>(<div key={ic.id} style={{padding:12,background:'rgba(0,0,0,0.12)',borderRadius:8}}>Icon {ic.id+1}</div>))}
      </div>
    </div>
  )
}