import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Sparkles, 
  Zap, 
  CreditCard, 
  Loader2,
  Trophy,
  ArrowRight,
  Monitor,
  Cpu,
  Globe,
  Users,
  Layers,
  ZapOff
} from 'lucide-react';
import Modal from '../shared/Modal';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: { icon: React.ReactNode; text: string }[];
  color: string;
  accent: string;
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'lite',
    name: 'Lite',
    price: 0,
    description: 'Perfect for enthusiasts and beginners.',
    color: '#888888',
    accent: 'rgba(136, 136, 136, 0.2)',
    features: [
      { icon: <Globe size={14} />, text: 'Community access' },
      { icon: <Monitor size={14} />, text: 'Limited 2D canvas tools' },
      { icon: <ZapOff size={14} />, text: 'Standard export' },
      { icon: <Layers size={14} />, text: '1 Active project' }
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    description: 'Essential tools for budding indies.',
    color: '#0094FF',
    accent: 'rgba(0, 148, 255, 0.2)',
    features: [
      { icon: <Cpu size={14} />, text: 'Essential engine sync' },
      { icon: <Sparkles size={14} />, text: 'Basic AI module' },
      { icon: <Zap size={14} />, text: 'Priority export' },
      { icon: <Layers size={14} />, text: '5 Active projects' }
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    description: 'Advanced features for professional devs.',
    color: '#BD00FF',
    accent: 'rgba(189, 0, 255, 0.2)',
    recommended: true,
    features: [
      { icon: <Monitor size={14} />, text: 'Full Engine Bridge' },
      { icon: <Sparkles size={14} />, text: 'Advanced AI features' },
      { icon: <Layers size={14} />, text: 'Unlimited projects' },
      { icon: <Cpu size={14} />, text: 'Custom brush engine' }
    ]
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 49,
    description: 'The ultimate power for game teams.',
    color: '#FFD700',
    accent: 'rgba(255, 215, 0, 0.2)',
    features: [
      { icon: <Users size={14} />, text: 'Team collaboration' },
      { icon: <Layers size={14} />, text: 'Shared asset libraries' },
      { icon: <Cpu size={14} />, text: 'Priority SDK support' },
      { icon: <Globe size={14} />, text: 'Custom engine export' }
    ]
  }
];

const NumberRoll: React.FC<{ value: number }> = ({ value }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="inline-block"
    >
      ${value}
    </motion.span>
  </AnimatePresence>
);

const CheckoutView: React.FC<{ plan: Plan; onBack: () => void; onComplete: () => void }> = ({ plan, onBack, onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onComplete();
    }, 4000);
  };

  return (
    <div className="py-2">
      <button onClick={onBack} className="text-[10px] font-bold text-white/40 hover:text-white flex items-center gap-1 mb-6 transition-colors">
        <ArrowRight size={12} className="rotate-180" /> Back to Plans
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-[10px] font-bold text-flippy-blue uppercase tracking-widest mb-1">Secure Checkout</div>
            <div className="text-xl font-black text-white">{plan.name} Access</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">${plan.price}<span className="text-xs text-white/40 font-bold">/mo</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">Card Number</label>
            <div className="relative">
              <input type="text" readOnly placeholder="•••• •••• •••• 4242" className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-12 text-sm text-white/60 focus:outline-none" />
              <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">Expiry</label>
                <input type="text" readOnly placeholder="MM / YY" className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white/60" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">CVC</label>
                <input type="text" readOnly placeholder="•••" className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white/60" />
             </div>
          </div>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={isProcessing}
        className="w-full h-14 bg-white text-black rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Authenticating...
          </>
        ) : (
          `Complete ${plan.name} Upgrade`
        )}
      </button>
    </div>
  );
};

const SuccessView: React.FC<{ plan: Plan; onClose: () => void }> = ({ plan, onClose }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="py-12 flex flex-col items-center justify-center text-center"
  >
    <div className="w-24 h-24 rounded-full bg-flippy-blue/10 border border-flippy-blue/20 flex items-center justify-center mb-6 relative">
       <Trophy size={48} className="text-flippy-blue" />
       <motion.div 
         animate={{ scale: [1, 2], opacity: [0.5, 0] }}
         transition={{ duration: 2, repeat: Infinity }}
         className="absolute inset-0 bg-flippy-blue/20 rounded-full"
       />
    </div>
    <h3 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase italic">Phase Connected.</h3>
    <p className="text-sm text-white/40 mb-8 max-w-[280px]">Your {plan.name} subscription is now active. The engine is ready.</p>
    <button
      onClick={onClose}
      className="px-8 h-12 bg-flippy-blue text-white rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all"
    >
      Initialize Workspace
    </button>
  </motion.div>
);

const SubscriptionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'PLANS' | 'CHECKOUT' | 'SUCCESS'>('PLANS');
  const [selectedId, setSelectedId] = useState('pro');

  const selectedPlan = useMemo(() => PLANS.find(p => p.id === selectedId) || PLANS[2], [selectedId]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => { setView('PLANS'); onClose(); }} 
      title={view === 'PLANS' ? "Module Selection" : "Payment Gate"}
      maxWidth={view === 'PLANS' ? "880px" : "480px"}
    >
      <AnimatePresence mode="wait">
        {view === 'PLANS' && (
          <motion.div 
            key="plans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full"
          >
            {/* Modular Header & Switcher */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
               <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Subscription.</h2>
                  <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] mt-2">Elevate your production workflow.</p>
               </div>

               {/* Fluid Switcher */}
               <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl relative">
                  {PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedId(plan.id)}
                      className={`relative z-10 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                        selectedId === plan.id ? 'text-white' : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      {plan.name}
                      {selectedId === plan.id && (
                        <motion.div
                          layoutId="activePlan"
                          className="absolute inset-0 bg-white/[0.08] rounded-xl border border-white/5 shadow-xl"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  ))}
               </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 min-h-[380px]">
               {/* Left: Price & CTA (Modular Block) */}
               <div className="lg:col-span-5 flex flex-col justify-center">
                  <div className="relative mb-2">
                     <AnimatePresence mode="wait">
                        <motion.div
                           key={selectedPlan.id}
                           initial={{ x: -20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           exit={{ x: 20, opacity: 0 }}
                           className="text-[10px] font-black uppercase tracking-[0.3em] mb-4"
                           style={{ color: selectedPlan.color }}
                        >
                           {selectedPlan.recommended ? 'Recommended Tier' : 'Available Module'}
                        </motion.div>
                     </AnimatePresence>
                     <div className="flex items-baseline gap-2">
                        <span className="text-7xl font-black text-white tracking-tighter">
                          <NumberRoll value={selectedPlan.price} />
                        </span>
                        <span className="text-lg font-bold text-white/20 uppercase">/mo</span>
                     </div>
                  </div>

                  <p className="text-sm text-white/40 mb-10 max-w-xs">{selectedPlan.description}</p>

                  <button
                    onClick={() => setView('CHECKOUT')}
                    className="group relative w-full h-14 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                      style={{ backgroundColor: selectedPlan.color }}
                    />
                    Get Started Now
                  </button>
               </div>

               {/* Right: Feature Bento Matrix */}
               <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                  <AnimatePresence mode="wait">
                     <motion.div
                        key={selectedPlan.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="col-span-2 grid grid-cols-2 gap-4"
                     >
                        {selectedPlan.features.map((feature, i) => (
                           <div 
                             key={i}
                             className="group bg-white/[0.02] border border-white/5 rounded-3xl p-5 transition-all hover:bg-white/[0.04] hover:border-white/10"
                           >
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors"
                                style={{ backgroundColor: selectedPlan.accent, color: selectedPlan.color }}
                              >
                                 {feature.icon}
                              </div>
                              <div className="text-[11px] font-bold text-white/80 leading-tight uppercase tracking-wide">
                                 {feature.text}
                              </div>
                              <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Check size={8} className="text-flippy-blue" />
                                 <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Included</span>
                              </div>
                           </div>
                        ))}
                     </motion.div>
                  </AnimatePresence>
               </div>
            </div>

            {/* Integrated AI Credits Bottom Bar */}
            <div className="mt-12 p-1.5 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col sm:flex-row items-center justify-between">
               <div className="flex items-center gap-4 pl-6 py-4">
                  <div className="w-10 h-10 rounded-xl bg-flippy-blue/10 flex items-center justify-center text-flippy-blue">
                     <Sparkles size={18} />
                  </div>
                  <div>
                     <h4 className="text-[11px] font-black text-white uppercase tracking-widest">AI Compute Credits</h4>
                     <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.1em] mt-0.5">Need more generation power? top up instantly.</p>
                  </div>
               </div>
               <div className="flex items-center gap-1.5 pr-1.5 pb-1.5 sm:pb-0">
                  <button className="h-11 px-6 bg-white/[0.03] border border-white/5 text-[9px] font-black text-white hover:bg-white/10 rounded-2xl transition-all uppercase tracking-widest">
                    500 Credits <span className="opacity-30 ml-2">$4.99</span>
                  </button>
                  <button className="h-11 px-6 bg-flippy-blue text-white shadow-lg text-[9px] font-black rounded-2xl transition-all hover:brightness-110 uppercase tracking-widest">
                    2000 Credits <span className="text-white/60 ml-2">$14.99</span>
                  </button>
               </div>
            </div>
          </motion.div>
        )}

        {view === 'CHECKOUT' && selectedPlan && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CheckoutView 
              plan={selectedPlan} 
              onBack={() => setView('PLANS')} 
              onComplete={() => setView('SUCCESS')} 
            />
          </motion.div>
        )}

        {view === 'SUCCESS' && selectedPlan && (
          <SuccessView plan={selectedPlan} onClose={() => { setView('PLANS'); onClose(); }} />
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default SubscriptionModal;
