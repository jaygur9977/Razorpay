// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//   Zap, Bot, Search, Stethoscope, Target, 
//   Activity, Eye, Shield, FileCheck, 
//   CreditCard, ShoppingCart, FileText, 
//   RefreshCw, Mic, Handshake,
//   Play, Trash2, ChevronRight,
//   IndianRupee, CheckCircle, XCircle,
//   Rocket, ChevronDown, ArrowLeft
// } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const SandboxSimulator = () => {
//   const navigate = useNavigate();
//   const [isRunning, setIsRunning] = useState(false);
//   const [agentLogs, setAgentLogs] = useState([]);
//   const [activeAgents, setActiveAgents] = useState({});
//   const [stats, setStats] = useState({
//     totalDetected: 0,
//     recovered: 0,
//     recoveryAmount: 0,
//     inProgress: 0,
//   });
//   const [selectedEvent, setSelectedEvent] = useState('payment_failure');
//   const [selectedPersona, setSelectedPersona] = useState('regular');
//   const [amount, setAmount] = useState(5000);
//   const [speed, setSpeed] = useState(1);
//   const [showEventPanel, setShowEventPanel] = useState(true);
//   const logRef = useRef(null);

//   const eventTypes = [
//     { id: 'payment_failure', label: 'Payment Failure', icon: CreditCard, emoji: '💳' },
//     { id: 'checkout_abandonment', label: 'Checkout Drop', icon: ShoppingCart, emoji: '🛒' },
//     { id: 'invoice_overdue', label: 'Invoice Overdue', icon: FileText, emoji: '📄' },
//     { id: 'subscription_failure', label: 'Subscription', icon: RefreshCw, emoji: '🔄' },
//     { id: 'voice_recovery', label: 'Voice Recovery', icon: Mic, emoji: '📞' },
//     { id: 'promise_to_pay', label: 'Promise to Pay', icon: Handshake, emoji: '🤝' },
//   ];

//   const personas = [
//     { id: 'regular', label: 'Regular Customer', emoji: '👤' },
//     { id: 'new', label: 'New Customer', emoji: '🆕' },
//     { id: 'vip', label: 'VIP Customer', emoji: '👑' },
//     { id: 'enterprise', label: 'Enterprise B2B', emoji: '🏢' },
//     { id: 'chronic_late_payer', label: 'Chronic Late', emoji: '⏰' },
//     { id: 'price_sensitive', label: 'Price Sensitive', emoji: '💸' },
//   ];

//   const agentConfigs = {
//     detection: { label: 'Detection', icon: Search, color: '#06b6d4' },
//     diagnosis: { label: 'Diagnosis', icon: Stethoscope, color: '#8b5cf6' },
//     priority: { label: 'Priority', icon: Target, color: '#f59e0b' },
//     decision: { label: 'Decision', icon: Zap, color: '#ec4899' },
//     execution: { label: 'Execution', icon: Bot, color: '#10b981' },
//     monitor: { label: 'Monitor', icon: Eye, color: '#a855f7' },
//     escalation: { label: 'Escalation', icon: Shield, color: '#ef4444' },
//     audit: { label: 'Audit', icon: FileCheck, color: '#94a3b8' },
//   };

//   const addLog = (agent, message, type = 'info') => {
//     const timestamp = new Date().toLocaleTimeString('en-IN', { 
//       hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' 
//     });
    
//     setAgentLogs(prev => [...prev, { 
//       id: Date.now() + Math.random(), timestamp, agent, message, type 
//     }]);
//     setActiveAgents(prev => ({ ...prev, [agent]: true }));
    
//     setTimeout(() => {
//       setActiveAgents(prev => ({ ...prev, [agent]: false }));
//     }, 2000 / speed);
//   };

//   const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms / speed));

//   const runSimulation = async (eventType, persona, customAmount) => {
//     if (isRunning) return;
//     setIsRunning(true);
//     setAgentLogs([]);
//     setStats({ totalDetected: 0, recovered: 0, recoveryAmount: 0, inProgress: 0 });

//     const finalAmount = customAmount || amount;
    
//     try {
//       addLog('detection', `Scanning transaction stream...`, 'processing');
//       await sleep(1200);
//       addLog('detection', `Revenue at risk found: ${eventType.replace('_', ' ')}`, 'detected');
//       addLog('detection', `Amount: ₹${finalAmount.toLocaleString()} | Customer: ${personas.find(p => p.id === persona)?.label}`, 'info');
//       setStats(prev => ({ ...prev, totalDetected: prev.totalDetected + 1 }));
//       await sleep(800);

//       addLog('diagnosis', `Analyzing root cause...`, 'processing');
//       await sleep(1500);
//       addLog('diagnosis', `Root cause identified. Confidence: 92%`, 'diagnosed');
//       await sleep(600);

//       addLog('priority', `Calculating Expected Net Recovery Value...`, 'processing');
//       await sleep(1200);
//       const enrv = finalAmount * 0.85;
//       addLog('priority', `ENRV: ₹${Math.floor(enrv).toLocaleString()} | Priority: HIGH`, 'prioritized');
//       setStats(prev => ({ ...prev, inProgress: prev.inProgress + 1 }));
//       await sleep(600);

//       addLog('decision', `Selecting best recovery action...`, 'processing');
//       await sleep(1500);
//       addLog('decision', `Action: Auto Retry + WhatsApp fallback`, 'decision');
//       await sleep(600);

//       if (finalAmount > 10000) {
//         addLog('escalation', `High-value case. Escalation required.`, 'warning');
//         await sleep(1500);
//         addLog('escalation', `✅ Ops Manager approved`, 'success');
//         await sleep(600);
//       }

//       addLog('execution', `Executing recovery action...`, 'processing');
//       await sleep(2000);
//       addLog('execution', `✅ Payment recovered: ₹${finalAmount.toLocaleString()}`, 'success');
//       setStats(prev => ({ 
//         ...prev, 
//         recovered: prev.recovered + 1, 
//         recoveryAmount: prev.recoveryAmount + finalAmount,
//         inProgress: prev.inProgress - 1 
//       }));
//       await sleep(800);

//       addLog('monitor', `Updating case status...`, 'processing');
//       await sleep(800);
//       addLog('monitor', `Case marked as RECOVERED`, 'success');
//       await sleep(500);

//       addLog('audit', `Logging to audit trail...`, 'processing');
//       await sleep(1000);
//       addLog('audit', `✅ Audit complete. Fully compliant.`, 'success');
      
//     } catch (error) {
//       addLog('monitor', `Error: ${error.message}`, 'error');
//     } finally {
//       setIsRunning(false);
//     }
//   };

//   const runBatch = async () => {
//     if (isRunning) return;
//     const events = [
//       { type: 'payment_failure', amount: 5000 },
//       { type: 'checkout_abandonment', amount: 25000 },
//       { type: 'invoice_overdue', amount: 50000 },
//       { type: 'subscription_failure', amount: 999 },
//     ];
    
//     for (const event of events) {
//       await runSimulation(event.type, 'regular', event.amount);
//       await sleep(3000);
//     }
//   };

//   const clearLogs = () => {
//     setAgentLogs([]);
//     setStats({ totalDetected: 0, recovered: 0, recoveryAmount: 0, inProgress: 0 });
//   };

//   useEffect(() => {
//     if (logRef.current) {
//       logRef.current.scrollTop = logRef.current.scrollHeight;
//     }
//   }, [agentLogs]);

//   return (
//     <div className="min-h-screen bg-[#0a0a0f]">
//       {/* Header */}
//       <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10">
//         <div className="max-w-[1600px] mx-auto px-6 py-5">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => navigate('/login')}
//                 className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
//               >
//                 <ArrowLeft className="w-5 h-5 text-white/60" />
//               </button>
//               <div>
//                 <h1 className="text-2xl font-bold flex items-center gap-3">
//                   <span className="text-3xl">🎮</span>
//                   RevArb Sandbox
//                 </h1>
//                 <p className="text-sm text-white/50 mt-1">Interactive Revenue Recovery Simulator</p>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-4">
//               <span className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
//                 <span className="relative flex h-2 w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
//                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
//                 </span>
//                 <span className="text-xs font-medium text-emerald-400">LIVE</span>
//               </span>
//               <button
//                 onClick={() => navigate('/dashboard/merchant')}
//                 className="btn-secondary text-sm"
//               >
//                 View Dashboard
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-[1600px] mx-auto px-6 py-8">
//         {/* Stats Row */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
//           {[
//             { label: 'Detected', value: stats.totalDetected, icon: Search, color: 'text-cyan-400' },
//             { label: 'In Progress', value: stats.inProgress, icon: Activity, color: 'text-indigo-400' },
//             { label: 'Recovered', value: stats.recovered, icon: CheckCircle, color: 'text-emerald-400' },
//             { label: 'Amount', value: `₹${(stats.recoveryAmount / 1000).toFixed(1)}K`, icon: IndianRupee, color: 'text-green-400' },
//           ].map((stat, i) => {
//             const Icon = stat.icon;
//             return (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: i * 0.1 }}
//                 className="glass-card p-6 text-center"
//               >
//                 <Icon className={`w-7 h-7 mx-auto mb-3 ${stat.color}`} />
//                 <p className="text-3xl font-bold font-display">{stat.value}</p>
//                 <p className="text-sm text-white/50 mt-1">{stat.label}</p>
//               </motion.div>
//             );
//           })}
//         </div>

//         {/* Main Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Panel - Controls */}
//           <div className="lg:col-span-1">
//             <div className="glass-card p-8 lg:sticky lg:top-24">
//               <h2 className="text-lg font-semibold mb-8 flex items-center gap-2">
//                 <Zap className="w-5 h-5 text-amber-400" />
//                 Event Configuration
//               </h2>

//               {/* Event Type */}
//               <div className="mb-8">
//                 <label className="text-sm font-medium text-white/60 block mb-4">
//                   Select Event Type
//                 </label>
//                 <div className="grid grid-cols-2 gap-3">
//                   {eventTypes.map((event) => {
//                     const Icon = event.icon;
//                     return (
//                       <button
//                         key={event.id}
//                         onClick={() => setSelectedEvent(event.id)}
//                         className={`p-4 rounded-xl border text-center transition-all duration-300 ${
//                           selectedEvent === event.id
//                             ? 'bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
//                             : 'bg-white/5 border-white/10 hover:bg-white/10'
//                         }`}
//                       >
//                         <span className="text-2xl mb-2 block">{event.emoji}</span>
//                         <span className={`text-xs font-medium ${selectedEvent === event.id ? 'text-white' : 'text-white/60'}`}>
//                           {event.label}
//                         </span>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Persona */}
//               <div className="mb-8">
//                 <label className="text-sm font-medium text-white/60 block mb-4">
//                   Customer Persona
//                 </label>
//                 <select
//                   value={selectedPersona}
//                   onChange={(e) => setSelectedPersona(e.target.value)}
//                   className="select-primary"
//                 >
//                   {personas.map((persona) => (
//                     <option key={persona.id} value={persona.id}>
//                       {persona.emoji} {persona.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Amount */}
//               <div className="mb-8">
//                 <label className="text-sm font-medium text-white/60 block mb-4">
//                   Transaction Amount
//                 </label>
//                 <div className="flex items-center gap-4">
//                   <span className="text-2xl font-bold gradient-text-green whitespace-nowrap">
//                     ₹{amount.toLocaleString()}
//                   </span>
//                   <input
//                     type="range"
//                     min="100"
//                     max="100000"
//                     step="100"
//                     value={amount}
//                     onChange={(e) => setAmount(Number(e.target.value))}
//                     className="flex-1 accent-indigo-500 cursor-pointer"
//                   />
//                 </div>
//               </div>

//               {/* Speed */}
//               <div className="mb-10">
//                 <label className="text-sm font-medium text-white/60 block mb-4">
//                   Simulation Speed: <span className="text-white">{speed}x</span>
//                 </label>
//                 <input
//                   type="range"
//                   min="1"
//                   max="5"
//                   step="0.5"
//                   value={speed}
//                   onChange={(e) => setSpeed(Number(e.target.value))}
//                   className="w-full accent-purple-500 cursor-pointer"
//                 />
//               </div>

//               {/* Buttons */}
//               <div className="space-y-4">
//                 <button
//                   onClick={() => runSimulation(selectedEvent, selectedPersona)}
//                   disabled={isRunning}
//                   className="btn-primary w-full py-4 text-base"
//                 >
//                   {isRunning ? (
//                     <>
//                       <div className="spinner" />
//                       Running...
//                     </>
//                   ) : (
//                     <>
//                       <Play className="w-5 h-5" />
//                       Trigger Single Event
//                     </>
//                   )}
//                 </button>
                
//                 <button
//                   onClick={runBatch}
//                   disabled={isRunning}
//                   className="btn-success w-full py-4 text-base"
//                 >
//                   <Rocket className="w-5 h-5" />
//                   Run Batch (4 Events)
//                 </button>
                
//                 <button
//                   onClick={clearLogs}
//                   className="btn-secondary w-full py-4"
//                 >
//                   <Trash2 className="w-5 h-5" />
//                   Clear All Logs
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Right Panel - Agent Logs */}
//           <div className="lg:col-span-2">
//             <div className="glass-card p-8">
//               {/* Agent Status Bar */}
//               <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
//                 <h2 className="text-lg font-semibold flex items-center gap-2">
//                   <Bot className="w-5 h-5 text-green-400" />
//                   Live Agent Activity
//                 </h2>
//                 <div className="flex gap-3">
//                   {Object.entries(agentConfigs).map(([key, config]) => {
//                     const Icon = config.icon;
//                     const isActive = activeAgents[key];
//                     return (
//                       <div
//                         key={key}
//                         className={`p-3 rounded-xl transition-all duration-300 ${
//                           isActive ? 'bg-white/15 scale-110' : 'bg-white/5 opacity-40'
//                         }`}
//                         title={`${config.label} Agent`}
//                       >
//                         <Icon className="w-5 h-5" style={{ color: config.color }} />
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Logs Container */}
//               <div
//                 ref={logRef}
//                 className="h-[600px] overflow-y-auto space-y-4 pr-2"
//               >
//                 {agentLogs.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center h-full text-white/30">
//                     <Bot className="w-24 h-24 mb-6 opacity-30" />
//                     <p className="text-xl font-medium">No activity yet</p>
//                     <p className="text-sm mt-2">Trigger an event to see agents in action</p>
//                   </div>
//                 ) : (
//                   <AnimatePresence>
//                     {agentLogs.map((log) => {
//                       const config = agentConfigs[log.agent];
//                       const Icon = config?.icon || Bot;
                      
//                       return (
//                         <motion.div
//                           key={log.id}
//                           initial={{ opacity: 0, x: -30 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           exit={{ opacity: 0, x: 30 }}
//                           transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
//                           className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10"
//                         >
//                           <div
//                             className="p-3 rounded-xl shrink-0"
//                             style={{ 
//                               background: `${config?.color}15`,
//                               border: `1px solid ${config?.color}30`
//                             }}
//                           >
//                             <Icon className="w-5 h-5" style={{ color: config?.color }} />
//                           </div>
                          
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-center gap-3 mb-2">
//                               <span className="text-sm font-semibold" style={{ color: config?.color }}>
//                                 {config?.label} Agent
//                               </span>
//                               <span className="text-xs text-white/30 font-mono">
//                                 {log.timestamp}
//                               </span>
//                             </div>
//                             <p className={`text-base leading-relaxed ${
//                               log.type === 'success' ? 'text-emerald-400' :
//                               log.type === 'error' ? 'text-red-400' :
//                               log.type === 'warning' ? 'text-amber-400' :
//                               log.type === 'processing' ? 'text-white/70' :
//                               'text-white/90'
//                             }`}>
//                               {log.message}
//                             </p>
//                           </div>
                          
//                           {log.type === 'success' && (
//                             <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
//                           )}
//                         </motion.div>
//                       );
//                     })}
//                   </AnimatePresence>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default SandboxSimulator;




import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Bot, Search, Stethoscope, Target, 
  Activity, Eye, Shield, FileCheck, 
  CreditCard, ShoppingCart, FileText, 
  RefreshCw, Mic, Handshake,
  Play, Trash2, ChevronRight,
  IndianRupee, CheckCircle, XCircle,
  ChevronDown, ArrowLeft,
  Cpu, Database, GitBranch, Terminal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  runSingleSimulation, 
  getCaseById,
  getAgentLogs,
  listenToAgentUpdates,
  listenToRecoveryProgress,
  connectSocket
} from '../services/api';

const SandboxSimulator = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [activeAgents, setActiveAgents] = useState({});
  const [stats, setStats] = useState({
    totalDetected: 0,
    recovered: 0,
    recoveryAmount: 0,
    inProgress: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState('payment_failure');
  const [selectedPersona, setSelectedPersona] = useState('regular');
  const [amount, setAmount] = useState(5000);
  const [simulationOutcome, setSimulationOutcome] = useState('success');
  const [speed, setSpeed] = useState(1);
  const [socketConnected, setSocketConnected] = useState(false);
  const logRef = useRef(null);

  // Connect socket
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    if (user.role) {
      const socket = connectSocket(user._id || 'demo', user.role || 'demo_tester');
      setSocketConnected(true);
      
      // Listen to agent updates
      const unsubscribeAgent = listenToAgentUpdates((data) => {
        setActiveAgents(prev => ({ ...prev, [data.agent]: true }));
        setTimeout(() => {
          setActiveAgents(prev => ({ ...prev, [data.agent]: false }));
        }, 2000);
      });

      // Listen to recovery progress
      const unsubscribeProgress = listenToRecoveryProgress((data) => {
        console.log('Recovery progress:', data);
      });

      return () => {
        unsubscribeAgent();
        unsubscribeProgress();
        socket.disconnect();
      };
    }
  }, []);

  const eventTypes = [
    { id: 'payment_failure', label: 'Payment Failure', icon: CreditCard, emoji: '💳' },
    { id: 'checkout_abandonment', label: 'Checkout Drop', icon: ShoppingCart, emoji: '🛒' },
    { id: 'invoice_overdue', label: 'Invoice Overdue', icon: FileText, emoji: '📄' },
    { id: 'subscription_failure', label: 'Subscription', icon: RefreshCw, emoji: '🔄' },
    { id: 'voice_recovery', label: 'Voice Recovery', icon: Mic, emoji: '📞' },
    { id: 'promise_to_pay', label: 'Promise to Pay', icon: Handshake, emoji: '🤝' },
  ];

  const personas = [
    { id: 'regular', label: 'Regular Customer', emoji: '👤' },
    { id: 'new', label: 'New Customer', emoji: '🆕' },
    { id: 'vip', label: 'VIP Customer', emoji: '👑' },
    { id: 'enterprise', label: 'Enterprise B2B', emoji: '🏢' },
    { id: 'chronic_late_payer', label: 'Chronic Late', emoji: '⏰' },
    { id: 'price_sensitive', label: 'Price Sensitive', emoji: '💸' },
  ];

  const agentConfigs = {
    detection: { label: 'Detection', icon: Search, color: '#06b6d4' },
    diagnosis: { label: 'Diagnosis', icon: Stethoscope, color: '#8b5cf6' },
    priority: { label: 'Priority', icon: Target, color: '#f59e0b' },
    decision: { label: 'Decision', icon: Zap, color: '#ec4899' },
    execution: { label: 'Execution', icon: Bot, color: '#10b981' },
    monitor: { label: 'Monitor', icon: Eye, color: '#a855f7' },
    escalation: { label: 'Escalation', icon: Shield, color: '#ef4444' },
    audit: { label: 'Audit', icon: FileCheck, color: '#94a3b8' },
  };

  const runSingleEvent = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setAgentLogs([]);
    setStats({ totalDetected: 0, recovered: 0, recoveryAmount: 0, inProgress: 0 });

    try {
      // Call real API
      const response = await runSingleSimulation({
        eventType: selectedEvent,
        amount,
        persona: selectedPersona,
        customerName: JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}').name,
        outcome: simulationOutcome,
      });

      if (response.success) {
        const workflowCase = response.data.case;
        setStats(prev => ({
          ...prev,
          totalDetected: 1,
          recovered: workflowCase.status === 'recovered' ? 1 : 0,
          recoveryAmount: workflowCase.execution?.amountRecovered || 0,
          inProgress: response.data.awaitingApproval ? 0 : workflowCase.status === 'recovered' ? 0 : 1,
        }));

        const pollWorkflow = async () => {
          const [caseResponse, logsResponse] = await Promise.all([
            getCaseById(workflowCase._id),
            getAgentLogs({ limit: 100, case: workflowCase._id }),
          ]);
          setAgentLogs(logsResponse.data);
          const currentCase = caseResponse.data;
          setStats((previous) => ({
            ...previous,
            recovered: currentCase.status === 'recovered' ? 1 : 0,
            recoveryAmount: currentCase.execution?.amountRecovered || 0,
            inProgress: ['detected', 'diagnosed', 'prioritized', 'decided', 'executing', 'escalated'].includes(currentCase.status) ? 1 : 0,
          }));
          return currentCase.status;
        };

        let status = await pollWorkflow();
        let attempts = 0;
        while (['detected', 'diagnosed', 'prioritized', 'decided', 'executing'].includes(status) && attempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          status = await pollWorkflow();
          attempts += 1;
        }

      }
    } catch (error) {
      console.error('Simulation error:', error);
      setAgentLogs([{ agent: 'system', message: error.message || 'Simulation request failed', type: 'error' }]);
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => {
    setAgentLogs([]);
    setStats({ totalDetected: 0, recovered: 0, recoveryAmount: 0, inProgress: 0 });
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [agentLogs]);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/dashboard/merchant')}
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎮 RevArb Sandbox
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                Interactive Revenue Recovery Simulator
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Socket Status */}
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              background: socketConnected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: socketConnected ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
              color: socketConnected ? '#34d399' : '#f87171',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: socketConnected ? '#34d399' : '#f87171',
                animation: 'pulse 2s infinite',
              }} />
              {socketConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px' }}>
        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Detected', value: stats.totalDetected, icon: Search, color: '#06b6d4' },
            { label: 'In Progress', value: stats.inProgress, icon: Activity, color: '#818cf8' },
            { label: 'Recovered', value: stats.recovered, icon: CheckCircle, color: '#34d399' },
            { label: 'Amount', value: `₹${stats.recoveryAmount.toLocaleString()}`, icon: IndianRupee, color: '#fbbf24' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card"
                style={{ padding: '24px', textAlign: 'center' }}
              >
                <Icon className="w-7 h-7 mx-auto mb-8" style={{ color: stat.color }} />
                <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{stat.value}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '32px',
        }}>
          {/* Left Panel - Controls */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              ⚡ Event Configuration
            </h2>

            {/* Event Type */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', display: 'block' }}>
                Select Event Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {eventTypes.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event.id)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: selectedEvent === event.id ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                      background: selectedEvent === event.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{event.emoji}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: selectedEvent === event.id ? 'white' : 'rgba(255,255,255,0.6)' }}>
                      {event.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Persona */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', display: 'block' }}>
                Customer Persona
              </label>
              <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="select-primary"
              >
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.emoji} {persona.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', display: 'block' }}>
                Transaction Amount: <span style={{ color: '#34d399', fontWeight: 'bold' }}>₹{amount.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="100"
                max="100000"
                step="100"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#6366f1' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', display: 'block' }}>
                Simulated payment result
              </label>
              <select value={simulationOutcome} onChange={(e) => setSimulationOutcome(e.target.value)} className="select-primary">
                <option value="success">Success</option>
                <option value="fallback_success">Primary fails, WhatsApp fallback succeeds</option>
                <option value="failure">Failure</option>
                <option value="pending">Pending external result</option>
              </select>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={runSingleEvent}
                disabled={isRunning}
                className="btn-primary"
                style={{ width: '100%', padding: '16px' }}
              >
                {isRunning ? (
                  <>
                    <div className="spinner" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Trigger Event
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/agent-workbench')}
                className="btn-secondary"
                style={{ width: '100%', padding: '16px' }}
              >
                <Bot className="w-5 h-5" />
                Open Agent Reasoning Workbench
              </button>
              <button
                onClick={clearLogs}
                className="btn-secondary"
                style={{ width: '100%', padding: '16px' }}
              >
                <Trash2 className="w-5 h-5" />
                Clear Logs
              </button>
            </div>
          </div>

          {/* Right Panel - Logs */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                🤖 Live Agent Activity
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.entries(agentConfigs).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <div
                      key={key}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: activeAgents[key] ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                        transition: 'all 0.3s ease',
                      }}
                      title={config.label}
                    >
                      <Icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              ref={logRef}
              style={{
                height: '500px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {agentLogs.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: '100px' }}>
                  <Bot style={{ width: '80px', height: '80px', margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '18px' }}>No activity yet</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Trigger an event to see agents in action</p>
                </div>
              ) : (
                agentLogs.map((log) => {
                  const config = agentConfigs[log.agent];
                  const Icon = config?.icon || Bot;
                  
                  return (
                    <div
                      key={log._id || log.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: `${config?.color}15`,
                        border: `1px solid ${config?.color}30`,
                      }}>
                        <Icon className="w-5 h-5" style={{ color: config?.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: config?.color }}>
                            {config?.label} Agent
                          </span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                            {new Date(log.createdAt || Date.now()).toLocaleTimeString()}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                          {log.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default SandboxSimulator;