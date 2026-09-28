import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Image as ImageIcon, Flame, CheckCircle, Music, X, ChevronLeft, ChevronRight, Plus, Play, Pause } from 'lucide-react';
import { supabase } from '../supabase';

const photoFiles = [
  'WhatsApp Image 2026-09-28 at 11.49.26.jpeg',
  'WhatsApp Image 2026-09-28 at 11.49.25 (1).jpeg',
  'WhatsApp Image 2026-09-28 at 11.49.25.jpeg',
  'WhatsApp Image 2026-09-28 at 11.49.26 (1).jpeg',
  'WhatsApp Image 2026-09-28 at 11.49.26 (2).jpeg',
  'WhatsApp Image 2026-09-28 at 11.49.26 (3).jpeg',
  'WhatsApp Image 2026-09-28 at 11.49.27 (2).jpeg',
  'WhatsApp Image 2026-09-28 at 11.49.27.jpeg',
  'WhatsApp Image 2026-09-28 at 11.49.28 (1).jpeg',
  'WhatsApp Image 2026-09-28 at 11.49.28.jpeg',
  'WhatsApp Image 2026-09-28 at 11.49.27 (1).jpeg'
];

const sampleMemories = photoFiles.map((file, i) => ({
  id: i + 1,
  type: 'image',
  url: `/media/fotos/${file}`,
  text: 'Nuestro Momento'
}));

const initialPenalties = [
  // Lo que Verito debe
  { id: 1, loser: 'Verito', penalty: 'La cena bajo la luna (de ser posible antes del 21)', completed: false },
  { id: 2, loser: 'Verito', penalty: 'Wally', completed: false },
  { id: 3, loser: 'Verito', penalty: 'Partido Futsal', completed: false },
  { id: 4, loser: 'Verito', penalty: 'Ir a la óptica', completed: false },
  { id: 5, loser: 'Verito', penalty: 'Algo para llevar a mi oficina y tenerlo como el de mi nena', completed: false },
  { id: 6, loser: 'Verito', penalty: 'Darme algo (dijiste que si nos veíamos mañana viernes me lo darías)', completed: false },
  { id: 7, loser: 'Verito', penalty: 'Y lo que te pediré hoy jejeje', completed: false },
  { id: 8, loser: 'Verito', penalty: 'Viajemos', completed: false },
  { id: 9, loser: 'Verito', penalty: 'No me aceptaste la piscina', completed: false },
  
  // Lo que Yeci debe
  { id: 10, loser: 'Yeci', penalty: 'Pollo', completed: false },
  { id: 11, loser: 'Yeci', penalty: 'Pollo', completed: false },
  { id: 12, loser: 'Yeci', penalty: 'Pollo', completed: false },
  { id: 13, loser: 'Yeci', penalty: 'Penitencia que no pidió', completed: false },
  { id: 14, loser: 'Yeci', penalty: 'Penitencia que no pidió', completed: false },
  { id: 15, loser: 'Yeci', penalty: 'Un regalito para Sebas', completed: false },
  { id: 16, loser: 'Yeci', penalty: 'Un regalito para Verito', completed: false },
];

const playlist = [
  '/media/music/reik.mp3',
  '/media/music/kjarkas.mp3'
];

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('momentos');
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef(null);

  // Penalties State (Supabase Backend)
  const [penalties, setPenalties] = useState([]);

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    const { data } = await supabase.from('penitencias').select('*').order('id', { ascending: true });
    if (data) setPenalties(data);
  };

  const [newVeritoPenalty, setNewVeritoPenalty] = useState('');
  const [newYeciPenalty, setNewYeciPenalty] = useState('');

  // Carousel State
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => console.log('Autoplay prevented:', e));
    }
  }, [currentSong]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };



  useEffect(() => {
    if (isLightboxOpen || activeTab !== 'momentos') return;
    const interval = setInterval(() => {
      setCurrentPhoto(prev => (prev + 1) % sampleMemories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLightboxOpen, activeTab]);

  const handleSongEnded = () => {
    setCurrentSong(prev => (prev + 1) % playlist.length);
  };

  const addPenalty = async (loser, text, setText) => {
    if (!text.trim()) return;
    const { data } = await supabase.from('penitencias').insert({ loser, penalty: text, completed: false }).select().single();
    if (data) {
      setPenalties([...penalties, data]);
      setText('');
    }
  };

  const togglePenalty = async (id) => {
    const penalty = penalties.find(p => p.id === id);
    if (!penalty) return;
    const newStatus = !penalty.completed;
    
    // Optimistic update
    setPenalties(penalties.map(p => p.id === id ? { ...p, completed: newStatus } : p));
    
    await supabase.from('penitencias').update({ completed: newStatus }).eq('id', id);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <audio ref={audioRef} src={playlist[currentSong]} onEnded={handleSongEnded} autoPlay />

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <button onClick={() => setIsLightboxOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', background: 'transparent', border: 'none', cursor: 'pointer', padding: '1rem' }}>
              <X size={32} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <button onClick={() => setCurrentPhoto(p => (p - 1 + sampleMemories.length) % sampleMemories.length)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', padding: '1rem', cursor: 'pointer' }}>
                <ChevronLeft size={32} />
              </button>
              <motion.img 
                key={currentPhoto}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={sampleMemories[currentPhoto].url} 
                style={{ maxHeight: '80vh', maxWidth: '70vw', objectFit: 'contain', borderRadius: '1rem' }} 
              />
              <button onClick={() => setCurrentPhoto(p => (p + 1) % sampleMemories.length)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', padding: '1rem', cursor: 'pointer' }}>
                <ChevronRight size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{ width: '100%', maxWidth: '800px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Nuestro Espacio
          </span>
          <span>🫂</span>
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Music size={14} className={isPlaying ? "music-icon" : ""} /> {isPlaying ? 'Sonando...' : 'Pausado'}
            <button onClick={togglePlay} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', display: 'flex', alignItems: 'center', marginLeft: '0.2rem' }}>
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
          </div>
          <button 
            onClick={onLogout}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </motion.div>

      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('momentos')}
          className="glass-panel"
          style={{ flex: 1, padding: '1rem', cursor: 'pointer', border: activeTab === 'momentos' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: activeTab === 'momentos' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(23, 23, 23, 0.4)' }}
        >
          <ImageIcon size={20} /> Nuestros Momentos
        </button>
        <button 
          onClick={() => setActiveTab('rachas')}
          className="glass-panel"
          style={{ flex: 1, padding: '1rem', cursor: 'pointer', border: activeTab === 'rachas' ? '1px solid var(--secondary)' : '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: activeTab === 'rachas' ? 'rgba(185, 28, 28, 0.2)' : 'rgba(23, 23, 23, 0.4)' }}
        >
          <Flame size={20} color={activeTab === 'rachas' ? 'var(--primary)' : 'white'} /> Rachas y Penitencias
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '800px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'momentos' ? (
            <motion.div
              key="momentos"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}
            >
              {/* Carousel Container */}
              <div 
                className="glass-panel" 
                style={{ width: '100%', padding: '1rem', cursor: 'pointer', overflow: 'hidden' }}
                onClick={() => setIsLightboxOpen(true)}
              >
                <div style={{ position: 'relative', width: '100%', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={currentPhoto}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5 }}
                      src={sampleMemories[currentPhoto].url} 
                      style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', borderRadius: '1rem' }} 
                    />
                  </AnimatePresence>
                  <div style={{ position: 'absolute', bottom: '10px', background: 'rgba(0,0,0,0.5)', padding: '0.3rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', color: 'white' }}>
                    Toca para expandir
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="rachas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}
            >
              {/* Columna Verito */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Lo que debe Verito</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                  {penalties.filter(p => p.loser === 'Verito').map(penalty => (
                    <div key={penalty.id} onClick={() => togglePenalty(penalty.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: penalty.completed ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: penalty.completed ? 'line-through' : 'none', fontSize: '0.9rem' }}>
                        {penalty.penalty}
                      </div>
                      <div>{penalty.completed ? <CheckCircle size={18} color="#10b981" /> : <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <input type="text" value={newVeritoPenalty} onChange={(e) => setNewVeritoPenalty(e.target.value)} placeholder="Agregar nueva deuda..." className="input-field" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} />
                  <button onClick={() => addPenalty('Verito', newVeritoPenalty, setNewVeritoPenalty)} className="btn-primary" style={{ padding: '0 1rem', width: 'auto' }}><Plus size={16} /></button>
                </div>
              </div>

              {/* Columna Yeci */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Lo que debe Yeci</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                  {penalties.filter(p => p.loser === 'Yeci').map(penalty => (
                    <div key={penalty.id} onClick={() => togglePenalty(penalty.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: penalty.completed ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: penalty.completed ? 'line-through' : 'none', fontSize: '0.9rem' }}>
                        {penalty.penalty}
                      </div>
                      <div>{penalty.completed ? <CheckCircle size={18} color="#10b981" /> : <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <input type="text" value={newYeciPenalty} onChange={(e) => setNewYeciPenalty(e.target.value)} placeholder="Agregar nueva deuda..." className="input-field" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} />
                  <button onClick={() => addPenalty('Yeci', newYeciPenalty, setNewYeciPenalty)} className="btn-primary" style={{ padding: '0 1rem', width: 'auto' }}><Plus size={16} /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
