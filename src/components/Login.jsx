import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 2rem', textAlign: 'center' }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{ display: 'inline-block', marginBottom: '1.5rem' }}
        >
          <img 
            src="/media/fotos/anime_avatar.png" 
            alt="Cute Anime Avatar" 
            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '4px solid var(--primary)', boxShadow: '0 0 20px rgba(248, 113, 113, 0.3)' }} 
          />
        </motion.div>
        
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Nuestro Rincón</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Un espacio solo para nosotros
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Usuario</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Contraseña</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              style={{ color: '#ef4444', fontSize: '0.85rem', margin: '0' }}
            >
              Credenciales incorrectas ❤️‍🩹
            </motion.p>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '1rem' }}
          >
            Entrar
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
