import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Image as ImageIcon, Flame, CheckCircle, Music, X, ChevronLeft, ChevronRight, Plus, Play, Pause, Upload, Edit2 } from 'lucide-react';
import { supabase } from '../supabase';

const playlist = [
  '/media/music/reik.mp3',
  '/media/music/kjarkas.mp3'
];

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('momentos');
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef(null);

  // Supabase Backend States
  const [penalties, setPenalties] = useState([]);
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    fetchPenalties();
    fetchFotos();
  }, []);

  const fetchPenalties = async () => {
    const { data } = await supabase.from('penitencias').select('*').order('id', { ascending: true });
    if (data) setPenalties(data);
  };

  const fetchFotos = async () => {
    const { data } = await supabase.from('fotos').select('*').order('id', { ascending: true });
    if (data) setMemories(data.map(f => ({ id: f.id, url: f.url })));
  };

  const [newVeritoPenalty, setNewVeritoPenalty] = useState('');
  const [newYeciPenalty, setNewYeciPenalty] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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
    if (isLightboxOpen || activeTab !== 'momentos' || memories.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPhoto(prev => (prev + 1) % memories.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLightboxOpen, activeTab, memories.length]);

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

  const saveEdit = async (id) => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    setPenalties(penalties.map(p => p.id === id ? { ...p, penalty: editValue } : p));
    setEditingId(null);
    await supabase.from('penitencias').update({ penalty: editValue }).eq('id', id);
  };

  const renderPenalty = (penalty) => {
    const isEditing = editingId === penalty.id;
    return (
      <div key={penalty.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={editValue} 
              onChange={e => setEditValue(e.target.value)} 
              className="input-field" 
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
              autoFocus
              onKeyDown={e => { if(e.key==='Enter') saveEdit(penalty.id) }}
            />
            <button onClick={() => saveEdit(penalty.id)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '0.4rem', padding: '0.4rem 0.6rem', cursor: 'pointer' }}><CheckCircle size={14}/></button>
            <button onClick={() => setEditingId(null)} style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.4rem', padding: '0.4rem 0.6rem', cursor: 'pointer' }}><X size={14}/></button>
          </div>
        ) : (
          <>
            <div style={{ color: penalty.completed ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: penalty.completed ? 'line-through' : 'none', fontSize: '0.9rem' }}>
              {penalty.penalty}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
              <button 
                onClick={() => togglePenalty(penalty.id)}
                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', background: penalty.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', color: penalty.completed ? '#10b981' : 'white', border: 'none', borderRadius: '0.4rem', padding: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                <CheckCircle size={14} /> {penalty.completed ? 'Completado' : 'Completar'}
              </button>
              <button 
                onClick={() => { setEditingId(penalty.id); setEditValue(penalty.penalty); }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '0.4rem', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Edit2 size={12} /> Editar
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    
    // Upload to Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, file);
    
    if (uploadError) {
      console.error(uploadError);
      alert('Error subiendo foto a Supabase');
      setIsUploading(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(fileName);
    
    // Insert URL to DB
    const { data } = await supabase.from('fotos').insert({ url: publicUrl }).select().single();
    if (data) {
      setMemories([...memories, { id: data.id, url: data.url }]);
      setCurrentPhoto(memories.length); // go to the new photo
    }
    setIsUploading(false);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <audio ref={audioRef} src={playlist[currentSong]} onEnded={handleSongEnded} autoPlay />

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && memories.length > 0 && (
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
              <button onClick={() => setCurrentPhoto(p => (p - 1 + memories.length) % memories.length)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', padding: '1rem', cursor: 'pointer' }}>
                <ChevronLeft size={32} />
              </button>
              <motion.img 
                key={currentPhoto}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={memories[currentPhoto]?.url} 
                style={{ maxHeight: '80vh', maxWidth: '70vw', objectFit: 'contain', borderRadius: '1rem' }} 
              />
              <button onClick={() => setCurrentPhoto(p => (p + 1) % memories.length)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', padding: '1rem', cursor: 'pointer' }}>
                <ChevronRight size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel responsive-header"
        style={{ width: '100%', maxWidth: '800px', padding: '1.5rem', marginBottom: '2rem' }}
      >
        <h1 className="responsive-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

      <div className="responsive-tabs" style={{ width: '100%', maxWidth: '800px', marginBottom: '2rem' }}>
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
                onClick={() => { if (memories.length > 0) setIsLightboxOpen(true) }}
              >
                <div style={{ position: 'relative', width: '100%', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <AnimatePresence mode="wait">
                    {memories.length > 0 ? (
                      <motion.img 
                        key={currentPhoto}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        src={memories[currentPhoto]?.url} 
                        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', borderRadius: '1rem' }} 
                      />
                    ) : (
                      <div style={{ color: 'var(--text-muted)' }}>Cargando fotos...</div>
                    )}
                  </AnimatePresence>
                  {memories.length > 0 && (
                    <div style={{ position: 'absolute', bottom: '10px', background: 'rgba(0,0,0,0.5)', padding: '0.3rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', color: 'white' }}>
                      Toca para expandir
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleUploadPhoto} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.8rem 1.5rem' }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    'Subiendo...'
                  ) : (
                    <>
                      <Upload size={18} /> Agregar Foto
                    </>
                  )}
                </button>
              </div>

              {/* Mensaje Especial */}
              <div 
                className="glass-panel"
                style={{ width: '100%', padding: '2rem', marginTop: '1rem', textAlign: 'center', background: 'linear-gradient(to bottom right, rgba(248, 113, 113, 0.05), rgba(23, 23, 23, 0.4))', borderLeft: '4px solid var(--primary)', borderRight: '4px solid var(--primary)' }}
              >
                <p style={{ fontStyle: 'italic', fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-main)', marginBottom: '1rem' }}>
                  "Verito, sé que a veces el camino pesa y el cansancio intenta ganar. Pero quiero que sepas algo: nunca estás sola. Mi promesa para ti no es solo de hoy, es de siempre."
                </p>
                <p style={{ fontStyle: 'italic', fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-main)', marginBottom: '1rem' }}>
                  "Estaré aquí para ser tu refugio cuando necesites descansar, tu fuerza cuando sientas que te rindes, y una sonrisa incondicional para ti y para Sebitas. Admiro profundamente la increíble mujer y madre que eres."
                </p>
                <p style={{ fontStyle: 'italic', fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--primary)', fontWeight: '600' }}>
                  "No importa lo difícil que se ponga el mundo afuera, en este espacio y en mí, siempre tendrán a alguien dispuesto a sostenerlos. No te rindas, que yo nunca me rendiré contigo."
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="rachas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="responsive-grid"
            >
              {/* Columna Verito */}
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Lo que debe Verito</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                  {penalties.filter(p => p.loser === 'Verito').map(renderPenalty)}
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
                  {penalties.filter(p => p.loser === 'Yeci').map(renderPenalty)}
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
