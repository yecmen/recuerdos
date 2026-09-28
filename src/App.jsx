import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Stars from './components/Stars';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  // Default values to be changed later by the user
  const [expectedUser] = useState('verito');
  const [expectedPass] = useState('2012-2024');

  const handleLogin = (username, password) => {
    if (username.toLowerCase() === expectedUser && password === expectedPass) {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative' }}>
      <Stars />
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
