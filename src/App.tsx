import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './index.css';

import PublicationDetail from './pages/PublicationDetail';
import AuthorProfile from './pages/AuthorProfile';
import Login from './pages/Login';
import Publish from './pages/Publish';
import About from './pages/About';
import Contact from './pages/Contact';
import ShareButtons from './components/ShareButtons';
import AdminHome from './pages/AdminHome';
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PublicationList from './pages/PublicationList';

interface Publication {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  status?: 'EN_CREACION' | 'EN_REVISION' | 'ITERANDO' | 'APROBADO' | 'PUBLICADA';
}

// --- Components ---

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('auth') === 'true';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.roles && Array.isArray(user.roles)) {
            const hasAdmin = user.roles.some((r: any) => r.name === 'admin' || r.name === 'superadmin');
            setIsAdmin(hasAdmin);
          }
        }
      } catch {}
    } else {
      setIsAdmin(false);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" aria-label="Columna Pública" onClick={closeMenu}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120" className="navbar-logo">
          <g transform="matrix(0.3, 0, 0, 0.3, 10, -17)">
              <g fill="currentColor">
                  <rect x="140" y="125" width="120" height="10"/>
                  <rect x="172" y="135" width="56" height="35"/>
                  <path d="M 172,135 A 18,18 0 0,0 172,170 A 25,25 0 0,1 172,135 Z"/>
                  <path d="M 228,135 A 18,18 0 0,1 228,170 A 25,25 0 0,0 228,135 Z"/>
                  <path d="M162,190 L238,190 L228,170 L172,170 Z"/>
                  <rect x="172" y="190" width="12" height="200"/>
                  <rect x="194" y="190" width="12" height="200"/>
                  <rect x="216" y="190" width="12" height="200"/>
              </g>
          </g>

          <text x="110" y="65" fontFamily="'Cinzel', serif" fontSize="38" fontWeight="700" fill="currentColor">COLUMNA</text>
          <text x="115" y="95" fontFamily="'Cinzel', serif" fontSize="14" letterSpacing="0.5em" fontWeight="400" fill="currentColor">PÚBLICA</text>
        </svg>
      </Link>

      <div className="desktop-menu">
        <Link to="/about" className="nav-link">Quiénes somos</Link>
        <Link to="/contact" className="nav-link">Contacto</Link>
        {isAuthenticated ? (
          <>
            {isAdmin && <Link to="/users" className="nav-link">Enrolar usuarios</Link>}
            <Link to="/publish" className="btn-outline">Escribir</Link>
            <button onClick={handleLogout} className="btn-outline" style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}>Salir</button>
          </>
        ) : (
          <Link to="/login" className="btn-outline">Acceder</Link>
        )}
      </div>

      <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <div className={`mobile-side-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <Link to="/about" className="nav-link" onClick={closeMenu}>Quiénes somos</Link>
          <Link to="/contact" className="nav-link" onClick={closeMenu}>Contacto</Link>
          {isAuthenticated ? (
            <>
              {isAdmin && <Link to="/users" className="nav-link" onClick={closeMenu}>Enrolar usuarios</Link>}
              <Link to="/publish" className="btn-outline" onClick={closeMenu}>Escribir</Link>
              <button onClick={handleLogout} className="btn-outline" style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }}>Salir</button>
            </>
          ) : (
            <Link to="/login" className="btn-outline" onClick={closeMenu}>Acceder</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function Home() {
  const [publications, setPublications] = useState<Publication[]>([]);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const res = await fetch('/api/publications');
      if (res.ok) {
        const data = await res.json();
        setPublications(data);
      }
    } catch (error) {
      console.error('Error fetching publications:', error);
    }
  };

  return (
    <div>
      <header className="hero">
        <div className="hero-content">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" className="hero-logo-svg">
            <defs>
              <g id="isotype-paths" fill="currentColor">
                <rect x="140" y="125" width="120" height="10"/>
                <rect x="172" y="135" width="56" height="35"/>
                <path d="M 172,135 A 18,18 0 0,0 172,170 A 25,25 0 0,1 172,135 Z"/>
                <path d="M 228,135 A 18,18 0 0,1 228,170 A 25,25 0 0,0 228,135 Z"/>
                <path d="M162,190 L238,190 L228,170 L172,170 Z"/>
                <rect x="172" y="190" width="12" height="200"/>
                <rect x="194" y="190" width="12" height="200"/>
                <rect x="216" y="190" width="12" height="200"/>
              </g>
            </defs>
            <use href="#isotype-paths"/>
            {/* Typography */}
            <text x="200" y="440" fontFamily="'Cinzel', serif" fontSize="44" textAnchor="middle" fontWeight="700" fill="currentColor">COLUMNA</text>
            <text x="200" y="475" fontFamily="'Cinzel', serif" fontSize="16" textAnchor="middle" letterSpacing="0.6em" fontWeight="400" fill="currentColor">PÚBLICA</text>
          </svg>
        </div>
      </header>

      <main className="container">
        <section className="mosaic-grid">
          {publications.length === 0 ? (
            <div className="empty-state">
              No hay columnas publicadas aún.
            </div>
          ) : (
            publications.map((pub) => (
              <article key={pub.id} className="publication-card">
                <header className="pub-header">
                  <h2 className="pub-title">{pub.title}</h2>
                  <div className="pub-meta">
                    <div className="pub-author-info">
                      <Link to={`/author/${encodeURIComponent(pub.author)}`} className="author-link">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(pub.author)}&background=random&color=fff&size=150`} 
                          alt={pub.author} 
                          className="author-avatar" 
                        />
                      </Link>
                      <div>
                        <Link to={`/author/${encodeURIComponent(pub.author)}`} className="author-link">
                          <span className="pub-author">Por {pub.author}</span>
                        </Link>
                        <span className="pub-date">
                          {new Date(pub.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </header>
                <div className="pub-content">{pub.content}</div>
                <div className="pub-footer">
                  <Link to={`/publication/${pub.id}`} className="btn-read-more">Leer columna</Link>
                  <ShareButtons 
                    url={`${window.location.origin}/publication/${pub.id}`} 
                    title={pub.title} 
                  />
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
// --- Main App ---

function Footer() {
  return (
    <footer className="app-footer">
      <div className="container" style={{ padding: '1.5rem 2rem', textAlign: 'center', borderTop: '1px solid #1f364d', marginTop: 'auto' }}>
        <p style={{ color: '#a0aec0', fontSize: '0.9rem', margin: 0 }}>
          Plataforma desarrollada por <a href="https://omtecnologia.cl" target="_blank" rel="noopener noreferrer" style={{ color: '#5b9bd5', textDecoration: 'none', fontWeight: 'bold' }}>OM Tecnología</a>
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/publication/:id" element={<PublicationDetail />} />
            <Route path="/author/:authorName" element={<AuthorProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/publish" element={<Publish />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            <Route path="/users" element={<UserList />} />
            <Route path="/user/:userId/edit" element={<UserForm />} />
            <Route path="/user/new" element={<UserForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/publications" element={<PublicationList />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
