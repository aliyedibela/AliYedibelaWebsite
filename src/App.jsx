import { useEffect, useRef, useState, useCallback } from 'react'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import './App.css'


function Lightbox({ screenshots, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)
  const touchX = useRef(null)

  const prev = useCallback(() => setCurrent(i => (i - 1 + screenshots.length) % screenshots.length), [screenshots.length])
  const next = useCallback(() => setCurrent(i => (i + 1) % screenshots.length), [screenshots.length])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose, prev, next])

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const diff = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchX.current = null
  }

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lb-close" onClick={onClose} aria-label="Kapat">✕</button>
      <button className="lb-arrow lb-prev" onClick={(e) => { e.stopPropagation(); prev() }}>‹</button>
      <div className="lb-img-wrap" onClick={(e) => e.stopPropagation()} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <img src={screenshots[current]} alt={`Ekran ${current + 1}`} className="lb-img" />
        <div className="lb-counter">{current + 1} / {screenshots.length}</div>
      </div>
      <button className="lb-arrow lb-next" onClick={(e) => { e.stopPropagation(); next() }}>›</button>
      <div className="lb-thumbs">
        {screenshots.map((src, i) => (
          <button key={i} className={`lb-thumb ${i === current ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setCurrent(i) }}>
            <img src={src} alt={`Küçük ${i + 1}`} />
          </button>
        ))}
      </div>
    </div>
  )
}


function useSwipe(onPrev, onNext) {
  const touchX = useRef(null)
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const diff = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? onNext() : onPrev()
    touchX.current = null
  }
  return { onTouchStart, onTouchEnd }
}


function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0
    const move = (e) => { mx = e.clientX; my = e.clientY }
    window.addEventListener('mousemove', move)
    let raf
    const animate = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12
      if (dot.current) dot.current.style.transform = `translate(${mx - 4}px, ${my - 4}px)`
      if (ring.current) ring.current.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`
      raf = requestAnimationFrame(animate)
    }
    animate()
    const grow = () => ring.current?.classList.add('hovered')
    const shrink = () => ring.current?.classList.remove('hovered')
    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', grow); el.addEventListener('mouseleave', shrink)
    })
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [])
  return (<><div className="cursor-dot" ref={dot} /><div className="cursor-ring" ref={ring} /></>)
}


function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const links = [
    { label: 'Hakkımda', href: '#hakkimda' },
    { label: 'Çalışmalarım', href: '#calismalarim' },
    { label: 'Projeler', href: '#projeler' },
    { label: 'İletişim', href: '#iletisim' },
  ]
  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo">
        <img src="/aylogo.png" alt="Ali Yedibela" className="nav-logo-img" />
      </div>
      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {links.map(l => (
          <li key={l.label}><a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a></li>
        ))}
      </ul>
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="menu">
        <span className={`bar ${menuOpen ? 'b1' : ''}`} />
        <span className={`bar ${menuOpen ? 'b2' : ''}`} />
        <span className={`bar ${menuOpen ? 'b3' : ''}`} />
      </button>
    </nav>
  )
}


function Hero() {
  const words = ['Backend Developer', '.NET Developer', 'Full Stack Developer']
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setIdx(i => (i + 1) % words.length); setVisible(true) }, 400)
    }, 2800)
    return () => clearInterval(cycle)
  }, [])
  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="grid-lines" />
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
      </div>
      <div className="hero-content">
        <p className="hero-eyebrow"><span className="dot-pulse" /> Merhaba, ben</p>
        <h1 className="hero-name">Ali<br /><span className="name-outline">Yedibela</span></h1>
        <div className="hero-role">
          <span className={`role-text ${visible ? 'visible' : 'hidden'}`}>{words[idx]}</span>
        </div>
        <p className="hero-sub">
          Erzurum Teknik Üniversitesi · Bilgisayar Mühendisliği · Son Sınıf<br />
          Backend geliştirme, .NET ekosistemi ve API tasarımı üzerine çalışıyorum.
        </p>
        <div className="hero-cta">
          <a href="#projeler" className="btn-primary">Projeleri Gör</a>
          <a href="#iletisim" className="btn-outline">İletişime Geç</a>
        </div>
      </div>
      <div className="hero-scroll"><div className="scroll-line" /><span>scroll</span></div>
    </section>
  )
}


const BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons'
const TECH = [
  { name: '.NET',         src: `${BASE}/dotnetcore/dotnetcore-original.svg` },
  { name: 'C#',           src: `${BASE}/csharp/csharp-original.svg` },
  { name: 'ASP.NET Core', src: `${BASE}/dotnetcore/dotnetcore-original.svg` },
  { name: 'React',        src: `${BASE}/react/react-original.svg` },
  { name: 'JavaScript',   src: `${BASE}/javascript/javascript-original.svg` },
  { name: 'SQL Server',   src: `${BASE}/microsoftsqlserver/microsoftsqlserver-plain.svg` },
  { name: 'PostgreSQL',   src: `${BASE}/postgresql/postgresql-original.svg` },
  { name: 'Redis',        src: `${BASE}/redis/redis-original.svg` },
  { name: 'Docker',       src: `${BASE}/docker/docker-original.svg` },
  { name: 'Git',          src: `${BASE}/git/git-original.svg` },
  { name: 'Linux',        src: `${BASE}/linux/linux-original.svg` },
  { name: 'Flutter',      src: `${BASE}/flutter/flutter-original.svg` },
]
function TechStack() {
  return (
    <section className="techstack">
      <div className="ts-inner">
        <div className="section-tag">Teknolojiler</div>
        <div className="tech-grid">
          {TECH.map(t => (
            <div className="tech-pill" key={t.name} data-hover="true">
              <img src={t.src} alt={t.name} className="tech-logo" width="18" height="18" />
              <span className="tech-name">{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


function About() {
  return (
    <section className="about" id="hakkimda">
      <div className="about-inner">
        <div className="section-tag">01 — Hakkımda</div>
        <div className="about-grid">
          <div className="about-text">
            <h2 className="section-title">Ali Yedibela</h2>
            <p>Erzurum Teknik Üniversitesi Bilgisayar Mühendisliği son sınıf öğrencisiyim. Backend geliştirme alanında çalışıyorum. .NET ekosistemi, veritabanı yönetimi ve API tasarımı üzerine odaklanıyorum.</p>
            <p>Ölçeklenebilir ve bakımı kolay sistemler yazmak temel önceliğim. Şu an mezuniyet projem üzerinde çalışıyorum.</p>
          </div>
          <div className="about-highlights">
            <div className="highlight-item"><span className="hl-icon">⬡</span><div><span className="hl-title">Backend & API</span><span className="hl-desc">.NET 8, ASP.NET Core, REST, CQRS</span></div></div>
            <div className="highlight-item"><span className="hl-icon">⬡</span><div><span className="hl-title">Veritabanı</span><span className="hl-desc">SQL Server, PostgreSQL, MongoDB, Redis</span></div></div>
            <div className="highlight-item"><span className="hl-icon">⬡</span><div><span className="hl-title">Mimari</span><span className="hl-desc">Clean Architecture, Microservices, MVVM</span></div></div>
            <div className="highlight-item"><span className="hl-icon">⬡</span><div><span className="hl-title">Frontend & Mobil</span><span className="hl-desc">React, Next.js, Flutter, WPF</span></div></div>
          </div>
        </div>
      </div>
    </section>
  )
}


const WORKS = [
  {
    id: 1,
    title: 'StockApp',
    subtitle: 'Kurumsal Stok & Satış Yönetim Sistemi',
    description: 'Şirketlerin stok, satış ve ürün süreçlerini uçtan uca yönetebileceği masaüstü uygulama. Barkod okuma, satış geçmişi, fiyat teklifi, kategori yönetimi ve anlık dashboard ile işletmenizin tüm verisi tek ekranda.',
    features: ['Barkod ile hızlı ürün tanıma','Satış & satış geçmişi takibi','Stok hareketi ve uyarı sistemi','Fiyat teklifi oluşturma','Kategori & ürün yönetimi','Anlık dashboard istatistikleri'],
    tech: ['WPF', 'ASP.NET Core', 'MVVM', 'SQL Server', 'Clean Architecture'],
    screenshots: ['/work1ss1.png','/work1ss2.png','/work1ss3.png','/work1ss4.png','/work1ss5.png','/work1ss6.png','/work1ss7.png','/work1ss8.png','/work1ss9.png','/work1ss10.png','/work1ss11.png','/work1ss12.png','/work1ss13.png','/work1ss14.png','/work1ss15.png','/work1ss16.png','/work1ss17.png'],
    badge: 'Ticari Ürün',
  },
  {
    id: 2,
    title: 'ESF Yapı & İnşaat',
    subtitle: 'E-Ticaret Platformu & Admin Yönetim Paneli',
    description: 'Erzurum\'un Permolit Boya Doğu Anadolu Bayii ESF Yapı & İnşaat için geliştirilen tam kapsamlı e-ticaret sistemi. Müşteriler ürünleri inceleyip sipariş verebilirken yönetici panelinden stok, sipariş ve kampanya süreçlerinin tamamı anlık yönetilebiliyor.',
    features: ['72+ ürün & hiyerarşik kategori','Sipariş takibi & durum yönetimi','Müşteri & sipariş geçmişi','Ürün bazlı indirim tanımlama','Slider & kayan yazı yönetimi','Tam işlem logu kaydı'],
    tech: ['ASP.NET Core', 'React', 'SQL Server', 'JWT', 'Admin Panel'],
    screenshots: ['/work2ss1.png','/work2ss2.png','/work2ss3.png','/work2ss4.png','/work2ss5.png','/work2ss6.png','/work2ss7.png','/work2ss8.png','/work2ss9.png','/work2ss10.png','/work2ss11.png','/work2ss12.png','/work2ss13.png','/work2ss14.png','/work2ss15.png','/work2ss16.png','/work2ss17.png','/work2ss18.png','/work2ss19.png','/work2ss20.png','/work2ss21.png','/work2ss22.png'],
    badge: 'Canlı Ürün',
    link: 'https://www.esfyapi.tr/',
  },
]

function WorkCard({ work, index }) {
  const [activeImg, setActiveImg] = useState(0)
  const [lightbox, setLightbox] = useState(null)
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const isEven = index % 2 === 1
  const total = work.screenshots.length

  const prev = useCallback(() => setActiveImg(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setActiveImg(i => (i + 1) % total), [total])
  const swipe = useSwipe(prev, next)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (total <= 1) return
    const t = setInterval(() => setActiveImg(i => (i + 1) % total), 3200)
    return () => clearInterval(t)
  }, [total])

  return (
    <>
      {lightbox !== null && <Lightbox screenshots={work.screenshots} startIndex={lightbox} onClose={() => setLightbox(null)} />}
      <div className={`work-card ${visible ? 'in-view' : ''} ${isEven ? 'reverse' : ''}`} ref={ref} style={{ transitionDelay: `${index * 0.1}s` }}>
        <div className="work-media">
          <div className="work-img-wrap" onClick={() => setLightbox(activeImg)} title="Büyütmek için tıkla" {...swipe}>
            <div className="work-badge">{work.badge}</div>
            <div className="work-zoom-hint">🔍 Tıkla</div>

            <button className="img-arrow img-arrow-prev" onClick={(e) => { e.stopPropagation(); prev() }} aria-label="Önceki">‹</button>

            <button className="img-arrow img-arrow-next" onClick={(e) => { e.stopPropagation(); next() }} aria-label="Sonraki">›</button>
            {work.screenshots.map((src, i) => (
              <img key={src} src={src} alt={`${work.title} ekran ${i + 1}`} className={`work-img ${i === activeImg ? 'active' : ''}`} />
            ))}
            <div className="work-img-placeholder"><span>public/work{work.id}ss1.png</span></div>
            <div className="work-img-dots" onClick={e => e.stopPropagation()}>
              {work.screenshots.map((_, i) => (
                <button key={i} className={`work-dot ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)} aria-label={`Görsel ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="work-info">
          <div className="work-number">0{work.id}</div>
          <h3 className="work-title">{work.title}</h3>
          <p className="work-subtitle">{work.subtitle}</p>
          <p className="work-desc">{work.description}</p>
          <ul className="work-features">
            {work.features.map(f => (<li key={f}><span className="feat-check">✓</span>{f}</li>))}
          </ul>
          <div className="work-tech">
            {work.tech.map(t => <span key={t} className="tech-badge">{t}</span>)}
          </div>
          <div className="work-cta">
            <a href="#iletisim" className="btn-primary">Bilgi Al</a>
            {work.link && <a href={work.link} target="_blank" rel="noreferrer" className="btn-outline">Siteyi Gör →</a>}
          </div>
        </div>
      </div>
    </>
  )
}

function Works() {
  return (
    <section className="works" id="calismalarim">
      <div className="works-inner">
        <div className="section-tag">02 — Çalışmalarım</div>
        <h2 className="section-title">Ticari Ürünler</h2>
        <p className="works-sub">Gerçek iş süreçleri için geliştirilmiş, sahaya çıkmış yazılım ürünleri.</p>
        <div className="works-list">
          {WORKS.map((w, i) => <WorkCard work={w} index={i} key={w.id} />)}
        </div>
      </div>
    </section>
  )
}


const PROJECTS = [
  { id: 1, title: 'Erzurum Şehir Rehberi', tag: 'Mobil · Bitirme Projesi', desc: 'Erzurum Büyükşehir Belediyesi için geliştirilen akıllı şehir temalı mobil uygulama. 60+ otobüs hattı, canlı otobüs takibi, SignalR ile anlık taksi sistemi, nöbetçi eczane, hava durumu ve deprem verileri.', tech: ['Flutter', 'Dart', 'SignalR', 'OSRM', 'Google Places API'], screenshots: ['/thumbnail.png'], github: 'https://github.com/aliyedibela/ErzurumRota' },
  { id: 2, title: 'BasketballInform', tag: 'Full Stack · Mikroservis', desc: 'Basketbol liglerini, takımları, antrenörleri ve oyuncuları yönetmek için geliştirilmiş spor veri platformu. CQRS pattern, RabbitMQ mesajlaşma ve MongoDB ile .NET 8 Mikroservis mimarisi.', tech: ['.NET 8', 'CQRS', 'RabbitMQ', 'MongoDB', 'Next.js 14', 'TypeScript'], screenshots: ['/thumbnail.png'], github: 'https://github.com/aliyedibela/BasketballInform' },
  { id: 3, title: 'Erzurum Taksi Sürücü', tag: 'Mobil · Gerçek Zamanlı', desc: 'Erzurum Büyükşehir Belediyesi taksi sisteminin sürücü tarafı uygulaması. SignalR ile anlık müşteri talep bildirimi, kabul/red mekanizması, email doğrulama ve oturum kalıcılığı.', tech: ['Flutter', 'Dart', 'SignalR', 'SharedPreferences', 'JWT'], screenshots: ['/thumbnail.png'], github: 'https://github.com/aliyedibela/TaksiApp' },
  { id: 4, title: 'StaySync', tag: 'Desktop App · API', desc: 'Otel yönetimi için WPF masaüstü uygulaması ve ASP.NET Core Web API. Rezervasyon, ödeme ve oda yönetimi. Clean Architecture ile Core, Infrastructure ve Presentation katmanları.', tech: ['ASP.NET Core', 'WPF', 'MVVM', 'AutoMapper', 'Clean Architecture'], screenshots: ['/thumbnail.png'], github: 'https://github.com/aliyedibela/HotelManagementSystem-DesktopApp-UsingASP.NET' },
  { id: 5, title: 'Hospital Management System', tag: 'Full Stack · Web', desc: 'Tam kapsamlı hastane yönetim sistemi. ASP.NET Core 8 backend ve React frontend. MediatR ile CQRS pattern, Entity Framework Core, hasta ve doktor yönetimi.', tech: ['ASP.NET Core 8', 'React', 'MediatR', 'CQRS', 'EF Core', 'MSSQL'], screenshots: ['/thumbnail.png'], github: 'https://github.com/aliyedibela/HospitalManagementSystem-UsingASP.NETCore-React' },
  { id: 6, title: 'Library Management System', tag: 'Full Stack · Web', desc: 'Üyelik sistemi, JWT kimlik doğrulama, kitap ve yazar yönetimi, ödünç alma takibi ve istatistik dashboard. Onion Architecture ile Clean tasarım.', tech: ['ASP.NET Core 8', 'React', 'JWT', 'EF Core', 'SQL Server', 'Clean Arch.'], screenshots: ['/thumbnail.png'], github: 'https://github.com/aliyedibela/LibraryManagementSystem-Using-ASP.NET-Core-React.js' },
]

function ProjectCard({ project, index }) {
  const [activeImg, setActiveImg] = useState(0)
  const [lightbox, setLightbox] = useState(null)
  const cardRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const total = project.screenshots.length

  const prev = useCallback(() => setActiveImg(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setActiveImg(i => (i + 1) % total), [total])
  const swipe = useSwipe(prev, next)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (cardRef.current) obs.observe(cardRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {lightbox !== null && <Lightbox screenshots={project.screenshots} startIndex={lightbox} onClose={() => setLightbox(null)} />}
      <article className={`project-card ${visible ? 'in-view' : ''}`} ref={cardRef} style={{ transitionDelay: `${index * 0.08}s` }}>
        <div className="project-media">
          <div className="project-img-wrap" onClick={() => setLightbox(activeImg)} title="Büyütmek için tıkla" {...swipe}>
            <div className="work-zoom-hint">🔍 Tıkla</div>
            <button className="img-arrow img-arrow-prev" onClick={(e) => { e.stopPropagation(); prev() }} aria-label="Önceki">‹</button>
            <button className="img-arrow img-arrow-next" onClick={(e) => { e.stopPropagation(); next() }} aria-label="Sonraki">›</button>
            {project.screenshots.map((src, i) => (
              <img key={src} src={src} alt={`${project.title} ss${i + 1}`} className={`project-img ${i === activeImg ? 'active' : ''}`} />
            ))}
            <div className="project-img-placeholder"><span>public/app{project.id}ss1.png</span></div>
          </div>
          <div className="project-thumbs">
            {project.screenshots.map((_, i) => (
              <button key={i} className={`thumb-dot ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)} aria-label={`Görsel ${i + 1}`} />
            ))}
          </div>
        </div>
        <div className="project-info">
          <div className="project-meta">
            <span className="project-num">0{project.id}</span>
            <span className="project-tag">{project.tag}</span>
          </div>
          <h3 className="project-title">{project.title}</h3>
          <p className="project-desc">{project.desc}</p>
          <div className="project-tech">
            {project.tech.map(t => <span key={t} className="tech-badge">{t}</span>)}
          </div>
          <div className="project-actions">
            <a href={project.github} target="_blank" rel="noreferrer" className="btn-primary btn-sm">GitHub →</a>
          </div>
        </div>
      </article>
    </>
  )
}

function Projects() {
  return (
    <section className="projects" id="projeler">
      <div className="projects-inner">
        <div className="section-tag">03 — Projeler</div>
        <h2 className="section-title">Projeler</h2>
        <div className="projects-list">
          {PROJECTS.map((p, i) => <ProjectCard project={p} index={i} key={p.id} />)}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="contact" id="iletisim">
      <div className="contact-inner">
        <div className="section-tag">04 — İletişim</div>
        <h2 className="section-title">İletişim</h2>
        <p className="contact-sub">Aşağıdaki kanallardan ulaşabilirsiniz.</p>
        <div className="contact-cards">
          <a href="mailto:aliyedibela07@gmail.com" className="contact-card">
            <span className="cc-icon">✉</span><span className="cc-label">E-posta</span><span className="cc-value">aliyedibela07@gmail.com</span>
          </a>
          <a href="https://linkedin.com/in/aliyedibela" target="_blank" rel="noreferrer" className="contact-card">
            <span className="cc-icon">in</span><span className="cc-label">LinkedIn</span><span className="cc-value">linkedin.com/in/aliyedibela</span>
          </a>
          <a href="https://github.com/aliyedibela" target="_blank" rel="noreferrer" className="contact-card">
            <span className="cc-icon">gh</span><span className="cc-label">GitHub</span><span className="cc-value">github.com/aliyedibela</span>
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-line" />
      <div className="footer-inner">
        <img src="/aylogo.png" alt="Ali Yedibela" className="footer-logo-img" />
        <p>© 2025 Ali Yedibela — Tüm hakları saklıdır.</p>
        <p className="footer-note">Erzurum Teknik Üniversitesi</p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <TechStack />
        <About />
        <Works />
        <Projects />
        <Contact />
      </main>
      <Footer />
    <Analytics /> 
    <SpeedInsights/>
    </>
  )
}