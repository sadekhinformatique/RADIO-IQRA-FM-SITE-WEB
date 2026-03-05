/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useLocation 
} from 'react-router-dom';
import { 
  Play, 
  Pause,
  Youtube, 
  Menu, 
  X,
  Facebook,
  Twitter,
  Instagram,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';

// Import Pages
import Home from './pages/Home';
import Programmes from './pages/Programmes';
import About from './pages/About';
import Contact from './pages/Contact';
import Apprentissage from './pages/Apprentissage';
import Admin from './pages/Admin';

// --- Components ---

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isPlaying, togglePlay, volume, setVolume, isMuted, toggleMute, downloadM3U } = usePlayer();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'Programmes', href: '/programmes' },
    { name: 'Apprentissage', href: '/apprentissage' },
    { name: 'À Propos', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || !isHome ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-full border border-white/10">
            <img 
              src="https://radioiqraburkina.com/wp-content/uploads/2025/09/2732x2732-1.png" 
              alt="RADIO IQRA FM Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className={`text-2xl font-serif font-bold tracking-tight ${isScrolled || !isHome ? 'text-islamic-green' : 'text-white'}`}>
            RADIO IQRA FM
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6 mr-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href} 
                className={`nav-link font-medium ${isScrolled || !isHome ? 'text-stone-700' : 'text-white/90'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* Integrated Player Controls */}
            <div className="flex items-center gap-3 pl-6 border-l border-white/20">
              <button 
                onClick={downloadM3U}
                title="Ouvrir dans VLC"
                className={`p-2 rounded-full transition-colors ${isScrolled || !isHome ? 'text-stone-500 hover:bg-stone-100' : 'text-white/70 hover:bg-white/10'}`}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/VLC_Icon.svg" alt="VLC" className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mr-2">
              <button 
                onClick={toggleMute}
                className={`${isScrolled || !isHome ? 'text-stone-500 hover:text-islamic-green' : 'text-white/70 hover:text-white'} transition-colors`}
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume} 
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className={`w-20 h-1 rounded-lg appearance-none cursor-pointer ${isScrolled || !isHome ? 'bg-stone-200' : 'bg-white/20'}`}
                style={{
                  accentColor: '#1B4D3E'
                }}
              />
            </div>
            <button 
              onClick={togglePlay}
              className="bg-islamic-green hover:bg-islamic-green/90 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-islamic-green/20 flex items-center gap-2 text-sm"
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              {isPlaying ? 'Pause' : 'Direct'}
            </button>
          </div>
        </div>

        {/* Mobile Controls & Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <button 
            onClick={togglePlay}
            className="bg-islamic-green text-white p-2.5 rounded-full shadow-lg active:scale-90 transition-transform"
            aria-label={isPlaying ? "Pause" : "Écouter en direct"}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
          <button 
            className="p-1" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X size={28} className={isScrolled || !isHome ? 'text-stone-900' : 'text-white'} />
            ) : (
              <Menu size={28} className={isScrolled || !isHome ? 'text-stone-900' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-stone-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href} 
                  className="block px-3 py-4 text-lg font-medium text-stone-700 hover:bg-stone-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={downloadM3U}
                      className="text-stone-500 hover:text-islamic-green transition-colors flex items-center gap-2"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/VLC_Icon.svg" alt="VLC" className="w-5 h-5" />
                      <span className="text-sm font-medium">Ouvrir dans VLC</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={toggleMute}
                      className="text-stone-500 hover:text-islamic-green transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <span className="text-sm font-medium text-stone-600">Volume</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={isMuted ? 0 : volume} 
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-32 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: '#1B4D3E' }}
                  />
                </div>
                <button 
                  onClick={() => {
                    togglePlay();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-islamic-green text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  {isPlaying ? 'Pause' : 'Écouter en Direct'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-stone-950 text-white pt-16 pb-8 border-t border-white/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-full border border-white/10">
              <img 
                src="https://radioiqraburkina.com/wp-content/uploads/2025/09/2732x2732-1.png" 
                alt="RADIO IQRA FM Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight">RADIO IQRA FM</span>
          </div>
          <p className="text-stone-400 max-w-sm mb-6 leading-relaxed">
            La Voix du Saint Coran au Burkina Faso. Une station dédiée à l'éducation, la spiritualité et la culture islamique.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com/profile.php?id=61571862830361" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-islamic-green transition-colors">
              <Facebook size={18} />
            </a>
            <a href="https://x.com/iqra_radio4578" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-islamic-green transition-colors">
              <Twitter size={18} />
            </a>
            <a href="https://instagram.com/radioiqratv_officielle?igsh=bTB1NDF6aGNtM3Uy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-islamic-green transition-colors">
              <Instagram size={18} />
            </a>
            <a href="https://www.youtube.com/@RADIOIQRA-TV" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-600 transition-colors">
              <Youtube size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-serif font-bold mb-6">Navigation</h4>
          <ul className="space-y-4 text-stone-400">
            <li><Link to="/" className="hover:text-islamic-green transition-colors">Accueil</Link></li>
            <li><Link to="/programmes" className="hover:text-islamic-green transition-colors">Programmes</Link></li>
            <li><Link to="/apprentissage" className="hover:text-islamic-green transition-colors">Apprentissage</Link></li>
            <li><Link to="/about" className="hover:text-islamic-green transition-colors">À Propos</Link></li>
            <li><Link to="/contact" className="hover:text-islamic-green transition-colors">Contact</Link></li>
            <li><Link to="/admin" className="text-stone-700 hover:text-islamic-green transition-colors text-xs mt-4 block">Administration</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-serif font-bold mb-6">Contact</h4>
          <ul className="space-y-4 text-stone-400">
            <li className="flex items-start gap-3">
              <span className="text-islamic-green mt-1">📍</span>
              <span>Ouagadougou, Burkina Faso</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-islamic-green">📞</span>
              <span>+226 76 01 12 08</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-islamic-green">✉️</span>
              <span>radioiqra07@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-stone-500 text-sm">
          © {new Date().getFullYear()} RADIO IQRA FM. Tous droits réservés.
        </p>
        <div className="flex gap-6 text-stone-500 text-xs uppercase tracking-widest">
          <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
          <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <PlayerProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/programmes" element={<Programmes />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/apprentissage" element={<Apprentissage />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </PlayerProvider>
  );
}

