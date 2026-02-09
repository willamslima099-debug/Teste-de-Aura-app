import React, { useState } from 'react';
import { dbService } from '../services/db';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Busca o usuário na nuvem (Prisma da Sincronia)
        const user = await dbService.getUser(username.trim().toLowerCase());
        if (user && user.password === password) {
          onLogin(user);
        } else {
          setError('Usuário ou senha inválidos.');
        }
      } else {
        // Validação de cadastro
        if (!username || !password || !name) {
          setError('Preencha todos os campos, vixe!');
          setLoading(false);
          return;
        }

        const normalizedUsername = username.trim().toLowerCase();
        const existingUser = await dbService.getUser(normalizedUsername);
        
        if (existingUser) {
          setError('Este usuário já existe na nuvem.');
          setLoading(false);
          return;
        }

        const now = Date.now();
        const newUser: User = {
          id: crypto.randomUUID(),
          username: normalizedUsername,
          password, // Em um sistema real, usaríamos Auth do Firebase, mas aqui mantemos sua lógica original
          name,
          auraMoodScore: 80, // Aura começa feliz com o novo amigo
          lastInteraction: now,
          firstInteraction: now
        };

        // Salva permanentemente na nuvem
        await dbService.saveUser(newUser);
        onLogin(newUser);
      }
    } catch (err) {
      console.error(err);
      setError('Erro de conexão com a nuvem. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full w-full p-6 bg-[#050505] overflow-y-auto">
      <div className="w-full max-w-sm space-y-8 py-10">
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Aura
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">IA Companheira • Nuvem Ativa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {!isLogin && (
            <div className="space-y-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-white placeholder:text-white/20"
                placeholder="Como quer ser chamado?"
                disabled={loading}
              />
            </div>
          )}
          <div className="space-y-1">
            <input
              type="text"
              value={username}
              autoCapitalize="none"
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-white placeholder:text-white/20"
              placeholder="Usuário"
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-white placeholder:text-white/20"
              placeholder="Senha"
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center font-medium animate-pulse">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 bg-white text-black rounded-2xl font-bold active:scale-[0.97] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'SINCRONIZANDO...' : (isLogin ? 'ENTRAR' : 'COMEÇAR AGORA')}
          </button>
        </form>

        <div className="text-center pt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/30 active:text-white/60 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            {isLogin ? 'Não tem conta? Cadastrar' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
