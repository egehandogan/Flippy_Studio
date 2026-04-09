import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check,
  Sparkles, 
  Zap, 
  CreditCard, 
  Loader2,
  Trophy,
  ArrowRight
} from 'lucide-react';
import Modal from '../shared/Modal';

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  color: string;
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'lite',
    name: 'Lite',
    price: '$0',
    description: 'Perfect for enthusiasts and beginners.',
    color: '#888888',
    features: [
      'Community access',
      'Limited 2D canvas tools',
      'Standard export',
      '1 Active project'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$9',
    description: 'Essential tools for budding indies.',
    color: '#0094FF',
    features: [
      'Essential engine sync',
      'Basic AI generation module',
      'Priority export rendering',
      '5 Active projects'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    description: 'Advanced features for professional devs.',
    color: '#BD00FF',
    recommended: true,
    features: [
      'Full Engine Bridge (Unity/Unreal)',
      'Advanced AI features',
      'Unlimited projects',
      'Custom brush engine'
    ]
  },
  {
    id: 'studio',
    name: 'Studio',
    price: '$49',
    description: 'The ultimate power for game teams.',
    color: '#FFD700',
    features: [
      'Team collaboration',
      'Shared asset libraries',
      'Priority SDK support',
      'Custom engine export'
    ]
  }
];

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
      <button onClick={onBack} className="text-[10px] font-bold text-white/40 hover:text-white flex items-center gap-1 mb-6">
        <ArrowRight size={12} className="rotate-180" /> Back to Plans
      </button>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="text-[10px] font-bold text-flippy-blue uppercase tracking-widest mb-1">Selected Plan</div>
            <div className="text-xl font-black text-white">{plan.name}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">{plan.price}<span className="text-xs text-white/40 font-bold">/mo</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">Card Number</label>
            <div className="relative">
              <input type="text" readOnly placeholder="4444 8888 2222 0000" className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-12 text-sm text-white/60 focus:outline-none" />
              <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">Expiry</label>
                <input type="text" readOnly placeholder="12 / 26" className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white/60" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">CVC</label>
                <input type="text" readOnly placeholder="***" className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white/60" />
             </div>
          </div>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={isProcessing}
        className="w-full h-14 bg-flippy-blue text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-[0_10px_30px_-5px_rgba(0,148,255,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Securely Processing Payment...
          </>
        ) : (
          `Unlock ${plan.name} Access`
        )}
      </button>
      <p className="text-center text-[9px] text-white/20 mt-4 leading-relaxed px-10">
        Demo payment system. No real charges will occur. By clicking the button you agree to Flippy's mock Terms of Service.
      </p>
    </div>
  );
};

const SuccessView: React.FC<{ plan: Plan; onClose: () => void }> = ({ plan, onClose }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="py-12 flex flex-col items-center justify-center text-center"
  >
    <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6 relative">
       <Trophy size={48} className="text-green-500" />
       <motion.div 
         animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
         transition={{ duration: 1.5, repeat: Infinity }}
         className="absolute inset-0 bg-green-500/20 rounded-full"
       />
    </div>
    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Welcome to the {plan.name} Era!</h3>
    <p className="text-sm text-white/40 mb-8 max-w-[280px]">Your professional account is now active. Explore the unlimited possibilities of Flippy Studio.</p>
    <button
      onClick={onClose}
      className="px-8 h-12 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
    >
      Enter the Studio
    </button>
  </motion.div>
);

const SubscriptionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'PLANS' | 'CHECKOUT' | 'SUCCESS'>('PLANS');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setView('CHECKOUT');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => { setView('PLANS'); onClose(); }} 
      title={view === 'PLANS' ? "Subscription Tiers" : "Checkout"}
      maxWidth={view === 'PLANS' ? "960px" : "480px"}
    >
      <AnimatePresence mode="wait">
        {view === 'PLANS' && (
          <motion.div 
            key="plans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            {/* Headers */}
            <div className="flex flex-col items-center text-center space-y-3">
               <div className="px-4 py-1.5 rounded-full bg-flippy-blue/10 border border-flippy-blue/20 flex items-center gap-2">
                  <Zap size={12} className="text-flippy-blue" />
                  <span className="text-[10px] font-black text-flippy-blue uppercase tracking-widest">Pricing & Plans</span>
               </div>
               <h2 className="text-3xl font-black text-white tracking-tighter">Choose Your Speed.</h2>
               <p className="text-sm text-white/40 max-w-lg">Scale your project from indie prototype to multi-team studio production with our flexible tiers.</p>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PLANS.map((plan) => (
                <div 
                  key={plan.id}
                  className={`relative flex flex-col p-6 rounded-3xl border transition-all hover:translate-y-[-4px] h-full ${
                    plan.recommended 
                      ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-flippy-purple/40 shadow-[0_20px_40px_-10px_rgba(189,0,255,0.15)]' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-flippy-purple rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-xl">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-6">
                     <div className="text-[11px] font-black uppercase tracking-widest mb-1 opacity-60" style={{ color: plan.color }}>{plan.name}</div>
                     <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{plan.price}</span>
                        <span className="text-xs text-white/30 font-bold">/mo</span>
                     </div>
                  </div>

                  <p className="text-[11px] text-white/50 leading-relaxed mb-8 h-8">{plan.description}</p>

                  <div className="space-y-3 mb-10 grow">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                           <Check size={10} className="text-white/60" />
                        </div>
                        <span className="text-[10px] font-medium text-white/70 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full h-11 rounded-2xl font-black text-[11px] transition-all flex items-center justify-center gap-2 ${
                      plan.recommended 
                        ? 'bg-flippy-purple text-white shadow-lg hover:opacity-90 active:scale-95' 
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95'
                    }`}
                  >
                    Get Started with {plan.name}
                  </button>
                </div>
              ))}
            </div>

            {/* AI Credits Section */}
            <div className="relative overflow-hidden rounded-3xl bg-flippy-blue/[0.03] border border-flippy-blue/20 p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
               <div className="absolute -left-12 -top-12 w-48 h-48 bg-flippy-blue/10 blur-[100px] rounded-full" />
               <div className="relative z-10 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-flippy-blue/10 flex items-center justify-center shrink-0 shadow-inner">
                     <Sparkles size={28} className="text-flippy-blue" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-white leading-tight">AI Compute Credits</h3>
                     <p className="text-[11px] text-white/40 max-w-sm mt-1">Usage-based credits for high-end "Make with AI" generation. Need more power? Top up instantly.</p>
                  </div>
               </div>
               <div className="relative z-10 flex items-center gap-3 w-full lg:w-auto">
                  <button className="flex-1 lg:flex-none px-6 h-12 bg-white/5 border border-white/10 text-white rounded-xl text-[11px] font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    500 Credits <span className="text-[9px] opacity-40">$4.99</span>
                  </button>
                  <button className="flex-1 lg:flex-none px-6 h-12 bg-flippy-blue text-white rounded-xl text-[11px] font-bold hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2">
                    2000 Credits <span className="text-[9px] text-white/60">$14.99</span>
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
