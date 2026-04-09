import React from 'react';
import { UserButton, useUser, useClerk } from '@clerk/clerk-react';
import { Search, Plus, Filter, LayoutGrid, Clock, Palette, Sparkles, Film, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LauncherPage: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const appCards = [
    { 
      id: 'studio', 
      title: 'Flippy Studio', 
      desc: 'Design to Engine canvas. Sync to Unity, Unreal and Godot.', 
      icon: <LayoutGrid className="text-flippy-blue" />,
      action: () => navigate('/studio')
    },
    { 
      id: 'ai', 
      title: 'AI Studio', 
      desc: 'Full integrate train AI model system. Powered by Flippy Diffusion.', 
      icon: <Sparkles className="text-flippy-purple" />,
      action: () => {}
    },
    { 
      id: 'animapy', 
      title: 'Animapy', 
      desc: 'Timeline animation editor for sprites and UI elements.', 
      icon: <Film className="text-pink-500" />,
      action: () => {}
    }
  ];

  const communityItems = [
    { title: 'Abstract design system', creator: 'Abstract 1.0', bg: 'bg-gradient-to-br from-indigo-900 to-purple-800' },
    { title: 'Lines design system', creator: 'Lines design system', bg: 'bg-gradient-to-br from-blue-900 to-indigo-800' },
    { title: 'Sprinkles design system', creator: 'Sprinkles Design System', bg: 'bg-gradient-to-br from-red-900 to-rose-800' },
    { title: 'Grayscale design system', creator: 'Grayscale Design System', bg: 'bg-gradient-to-br from-gray-900 to-slate-800' },
    { title: 'Bubbles design system', creator: 'Bubbles design system 2.0', bg: 'bg-gradient-to-br from-sky-900 to-blue-800' },
    { title: 'PinkWaves design system', creator: 'PinkWaves 3.0', bg: 'bg-gradient-to-br from-pink-900 to-fuchsia-800' },
  ];

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden font-sans text-white">
      {/* Sidebar Apps */}
      <aside className="w-[300px] border-r border-white/5 flex flex-col p-8 space-y-12">
        <div className="flex items-center gap-3">
          <FlippyLogo />
          <span className="text-xl font-bold tracking-tight">Flippy</span>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          {appCards.map(app => (
            <div key={app.id} className="group p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer">
              <div className="mb-4">{app.icon}</div>
              <h3 className="text-sm font-bold mb-2">{app.title}</h3>
              <p className="text-[11px] text-white/40 leading-relaxed mb-4">{app.desc}</p>
              <button 
                onClick={app.action}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-flippy-blue rounded-xl text-[10px] font-bold transition-all group-hover:bg-flippy-blue"
              >
                <Plus size={12} />
                New Design File
              </button>
            </div>
          ))}
        </div>
        
        {/* Sign Out Placeholder */}
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-3 p-4 bg-white/5 hover:bg-red-500/20 rounded-2xl text-xs text-white/40 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut size={16} />
          Sign Out of Account
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="flex justify-between items-start mb-12">
          <div>
            <p className="text-xs text-white/30 mb-2">Good Morning, {user?.firstName || 'Developer'}</p>
            <h1 className="text-2xl font-bold tracking-tight">What would you like to open in Flippy?</h1>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>

        {/* Workspace Hub */}
        <div className="flex items-center gap-2 mb-12">
          <TabButton active><LayoutGrid size={14} /> Projects</TabButton>
          <TabButton><Palette size={14} /> Design</TabButton>
          <TabButton><Clock size={14} /> Recents</TabButton>
        </div>

        {/* Community Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Community</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search everything in community" 
                  className="w-80 h-10 bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 text-xs focus:outline-none focus:border-flippy-blue/40"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <FilterChip label="All products" />
            <FilterChip label="All resources" />
            <FilterChip label="Paid + Free" />
            <FilterChip label="All creators" />
            <div className="flex-1"></div>
            <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase font-bold tracking-widest bg-white/5 px-4 py-2 rounded-lg">
              Trending <Filter size={10} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityItems.map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className={`aspect-video rounded-[32px] ${item.bg} mb-4 border border-white/5 flex items-center justify-center p-8 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                  <div className="relative z-10 text-center">
                    <h4 className="text-lg font-bold tracking-tight mb-1">{item.title}</h4>
                  </div>
                  <div className="absolute top-4 left-4 p-2 bg-white/10 backdrop-blur-md rounded-full">
                    <Sparkles size={12} />
                  </div>
                </div>
                <div className="px-2">
                  <p className="text-xs font-bold text-white/80">{item.creator}</p>
                  <p className="text-[10px] text-white/30 mt-1">Design System</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const TabButton: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <button className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${
    active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
  }`}>
    {children}
  </button>
);

const FilterChip: React.FC<{ label: string }> = ({ label }) => (
  <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/60 hover:text-white transition-all">
    {label}
  </button>
);

const FlippyLogo = () => (
  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M7 6C5.34315 6 4 7.34315 4 9V15C4 16.6569 5.34315 18 7 18H17C18.6569 18 20 16.6569 20 15V13H15V15H7V9H18V6H7Z" fill="black"/>
    </svg>
  </div>
);

export default LauncherPage;
