import React from 'react';
import { UserButton, useUser, useClerk } from '@clerk/clerk-react';
import { Search, Plus, Filter, LayoutGrid, Clock, Palette, Sparkles, Film, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LauncherPage: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState<'projects' | 'design' | 'recents'>('projects');
  const [searchQuery, setSearchQuery] = React.useState('');

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

  const workspaceItems = {
    projects: [
      { id: 1, title: 'Call of Duty: Mobile UI', creator: '@flippy_dev', date: '2h ago', ver: 'v2.1', bg: 'bg-gradient-to-br from-zinc-900 to-black', type: 'Design File', price: 'Free', isPremium: false },
      { id: 2, title: 'Cyberpunk 2077 HUD', creator: '@cyber_ghost', date: '5h ago', ver: 'v1.0', bg: 'bg-gradient-to-br from-yellow-500/10 to-transparent', type: 'Layout', price: 'Free', isPremium: false },
      { id: 3, title: 'Godot Engine Bridge', creator: '@engine_master', date: '1d ago', ver: 'v0.9', bg: 'bg-gradient-to-br from-blue-500/10 to-transparent', type: 'Sync System', price: 'Free', isPremium: false },
    ],
    design: [
      { id: 10, title: 'Neo-Figma UI Kit', creator: '@ui_pixel', date: '1d ago', ver: 'v4.2', bg: 'bg-gradient-to-br from-purple-900/40 to-black', price: '$12.00', isPremium: true, type: 'Asset Package' },
      { id: 11, title: '3D Weapon Pack', creator: '@model_pro', date: '3d ago', ver: 'v1.1', bg: 'bg-gradient-to-br from-green-900/40 to-black', price: 'Free', isPremium: false, type: 'Asset Package' },
      { id: 12, title: 'Cyber Font Family', creator: '@type_foundry', date: '4d ago', ver: 'v2.0', bg: 'bg-gradient-to-br from-red-900/40 to-black', price: '$8.00', isPremium: true, type: 'Asset Package' },
      { id: 13, title: 'Unreal Engine Materials', creator: '@shader_wiz', date: '5d ago', ver: 'v1.0', bg: 'bg-gradient-to-br from-blue-900/40 to-black', price: 'Free', isPremium: false, type: 'Asset Package' },
      { id: 14, title: 'Mobile Game Icons', creator: '@icon_smith', date: '1w ago', ver: 'v3.5', bg: 'bg-gradient-to-br from-orange-900/40 to-black', price: 'Free', isPremium: false, type: 'Asset Package' },
      { id: 15, title: 'RPG Inventory System', creator: '@logic_dev', date: '1w ago', ver: 'v2.1', bg: 'bg-gradient-to-br from-amber-900/40 to-black', price: '$24.00', isPremium: true, type: 'Asset Package' },
      { id: 16, title: 'Sci-Fi Sound FX', creator: '@audio_base', date: '2w ago', ver: 'v1.0', bg: 'bg-gradient-to-br from-cyan-900/40 to-black', price: 'Free', isPremium: false, type: 'Asset Package' },
      { id: 17, title: 'Ghibli Style Palettes', creator: '@art_flow', date: '2w ago', ver: 'v1.2', bg: 'bg-gradient-to-br from-emerald-900/40 to-black', price: 'Free', isPremium: false, type: 'Asset Package' },
      { id: 18, title: 'VFX Particle Systems', creator: '@fx_ninja', date: '3w ago', ver: 'v2.0', bg: 'bg-gradient-to-br from-pink-900/40 to-black', price: '$15.00', isPremium: true, type: 'Asset Package' },
      { id: 19, title: 'Low Poly Environment', creator: '@poly_king', date: '1m ago', ver: 'v1.0', bg: 'bg-gradient-to-br from-indigo-900/40 to-black', price: 'Free', isPremium: false, type: 'Asset Package' },
    ],
    recents: [
      { id: 20, title: 'Untitled Project 1', creator: 'You', date: '10m ago', ver: 'v0.1', bg: 'bg-white/[0.02]', type: 'Project', price: 'Free', isPremium: false },
      { id: 21, title: 'Hero Component v2', creator: 'You', date: '45m ago', ver: 'v0.5', bg: 'bg-white/[0.02]', type: 'Component', price: 'Free', isPremium: false },
      { id: 22, title: 'Sidebar Refine', creator: 'You', date: '2h ago', ver: 'v1.2', bg: 'bg-white/[0.02]', type: 'Design', price: 'Free', isPremium: false },
      { id: 23, title: 'Landing Page Mockup', creator: 'You', date: '4h ago', ver: 'v0.9', bg: 'bg-white/[0.02]', type: 'Layout', price: 'Free', isPremium: false },
      { id: 24, title: 'Color Palette Gen', creator: 'You', date: 'Yesterday', ver: 'v1.0', bg: 'bg-white/[0.02]', type: 'Resource', price: 'Free', isPremium: false },
      { id: 25, title: 'User Flow Diagram', creator: 'You', date: '2d ago', ver: 'v2.1', bg: 'bg-white/[0.02]', type: 'Flow', price: 'Free', isPremium: false },
      { id: 26, title: 'Design System V1', creator: 'You', date: '3d ago', ver: 'v1.0', bg: 'bg-white/[0.02]', type: 'System', price: 'Free', isPremium: false },
      { id: 27, title: 'Prototype A', creator: 'You', date: '1w ago', ver: 'v0.1', bg: 'bg-white/[0.02]', type: 'Prototype', price: 'Free', isPremium: false },
      { id: 28, title: 'Asset Export Test', creator: 'You', date: '1w ago', ver: 'v0.2', bg: 'bg-white/[0.02]', type: 'Export', price: 'Free', isPremium: false },
      { id: 29, title: 'Final Review', creator: 'You', date: '2w ago', ver: 'v1.0', bg: 'bg-white/[0.02]', type: 'Project', price: 'Free', isPremium: false },
    ]
  };

  const communityItems = [
    { title: 'Abstract design system', creator: '@abstract_lab', date: '2d ago', ver: '1.0', price: '$12.00', isPremium: true, bg: 'bg-gradient-to-br from-indigo-900 to-purple-800' },
    { title: 'Lines design system', creator: '@lines_design', date: '5d ago', ver: '2.4', price: 'Free', isPremium: false, bg: 'bg-gradient-to-br from-blue-900 to-indigo-800' },
    { title: 'Sprinkles design system', creator: '@sprinkles_ui', date: '1w ago', ver: '1.2', price: '$19.00', isPremium: true, bg: 'bg-gradient-to-br from-red-900 to-rose-800' },
    { title: 'Grayscale design system', creator: '@mono_master', date: '2w ago', ver: '3.0', price: 'Free', isPremium: false, bg: 'bg-gradient-to-br from-gray-900 to-slate-800' },
    { title: 'Bubbles design system', creator: '@bubbly', date: '3w ago', ver: '2.0', price: 'Free', isPremium: false, bg: 'bg-gradient-to-br from-sky-900 to-blue-800' },
    { title: 'PinkWaves design system', creator: '@pinky', date: '1m ago', ver: '3.1', price: '$5.00', isPremium: true, bg: 'bg-gradient-to-br from-pink-900 to-fuchsia-800' },
  ];

  const filteredWorkspace = workspaceItems[activeTab].filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommunity = communityItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}><LayoutGrid size={14} /> Projects</TabButton>
          <TabButton active={activeTab === 'design'} onClick={() => setActiveTab('design')}><Palette size={14} /> Design</TabButton>
          <TabButton active={activeTab === 'recents'} onClick={() => setActiveTab('recents')}><Clock size={14} /> Recents</TabButton>
        </div>

        {/* Dynamic Workspace Content */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspace.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className={`aspect-video rounded-[32px] ${item.bg} mb-4 border border-white/5 flex items-center justify-center p-8 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]`}>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-all"></div>
                  
                  {/* Glass Hover Metadata */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white/[0.02]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Version {item.ver}</div>
                    <div className="text-[10px] font-bold text-white/80">{item.date}</div>
                  </div>

                  <div className="relative z-10 text-center group-hover:scale-110 transition-transform duration-500">
                    <h4 className="text-lg font-bold tracking-tight mb-1">{item.title}</h4>
                  </div>
                  
                  {item.isPremium && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      {item.price}
                    </div>
                  )}
                </div>
                <div className="px-2 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-white/80">{item.creator}</p>
                    <p className="text-[10px] text-white/30 mt-1">{item.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects, designs or community..." 
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
            {filteredCommunity.map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className={`aspect-video rounded-[32px] ${item.bg} mb-4 border border-white/5 flex items-center justify-center p-8 relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]`}>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-all"></div>
                  
                  {/* Glass Hover Metadata */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm bg-white/[0.02]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Version {item.ver}</div>
                    <div className="text-[10px] font-bold text-white/80">Published {item.date}</div>
                  </div>

                  <div className="relative z-10 text-center group-hover:scale-110 transition-transform duration-500">
                    <h4 className="text-lg font-bold tracking-tight mb-1">{item.title}</h4>
                  </div>
                  
                  {item.isPremium ? (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      {item.price}
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                      Free
                    </div>
                  )}

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

const TabButton: React.FC<{ children: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ children, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${
      active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
    }`}
  >
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
