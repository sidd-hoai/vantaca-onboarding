// ============================================================
// VendorOnboardingPrototype.tsx
// Vantaca Vendor — Redesigned Onboarding Flow
// ============================================================
//
// SETUP — Option A: StackBlitz (no install, fastest)
//   1. Go to https://stackblitz.com/fork/react-ts
//   2. Delete src/App.tsx content and paste this entire file
//   3. In the StackBlitz sidebar, click "Add dependency"
//      and add: lucide-react  (version 0.263.1)
//   4. Preview renders instantly in the right panel
//   5. Share the StackBlitz URL with your team
//
// SETUP — Option B: Local (Node.js required)
//   1. npx create-react-app vantaca-onboarding --template typescript
//   2. cd vantaca-onboarding
//   3. npm install lucide-react@0.263.1
//   4. Replace src/App.tsx with this file
//   5. npm start  →  opens at http://localhost:3000
//
// SETUP — Option C: Share via Vercel (public link)
//   1. Push to any GitHub/Bitbucket repo
//   2. Connect repo to vercel.com (free)
//   3. Deploy → share the generated URL
//
// NAVIGATION
//   A floating nav bar at the top lets you jump between any
//   screen for demo purposes. In production this is removed.
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  ArrowRight, CheckCircle, Check, ChevronRight, ChevronLeft,
  CreditCard, Mail, Zap, Landmark, Truck, Clock, DollarSign,
  Shield, Eye, EyeOff, Edit2, MapPin, Bell, Settings,
  LayoutDashboard, FileText, TrendingUp, Building2, Lock,
  HelpCircle, X,
} from 'lucide-react';

// ─── Brand Tokens (Vantaca) ──────────────────────────────────
const C = {
  blue:      '#00679B',
  blue50:    '#E6F2F8',
  blue100:   '#DEF0FA',
  green:     '#64B24B',
  green50:   '#EDF6E9',
  green100:  '#B5DBA9',
  green600:  '#64B24B',
  darkBlue:  '#153C4F',
  amber50:   '#FFFAEB',
  amber500:  '#F79009',
  red50:     '#FEF3F2',
  red600:    '#D92D20',
  gray25:    '#FCFCFD',
  gray50:    '#F9FAFB',
  gray100:   '#F2F4F7',
  gray200:   '#E4E7EC',
  gray300:   '#D0D5DD',
  gray400:   '#98A2B3',
  gray500:   '#667085',
  gray600:   '#475467',
  gray700:   '#344054',
  gray800:   '#1D2939',
  gray900:   '#101828',
  white:     '#FFFFFF',
};
const Sh = {
  sm:   '0 1px 2px rgba(16,24,40,.05)',
  card: '0 1px 3px rgba(16,24,40,.10), 0 1px 2px rgba(16,24,40,.06)',
  md:   '0 4px 8px rgba(16,24,40,.08), 0 2px 4px rgba(16,24,40,.06)',
  lg:   '0 12px 24px rgba(16,24,40,.12), 0 4px 8px rgba(16,24,40,.08)',
};

// ─── Mock Data ───────────────────────────────────────────────
const VENDOR = {
  name:        'Sierra Landscaping LLC',
  contact:     'Marco Rivera',
  email:       'marco@sierra-landscaping.com',
  phone:       '(415) 882-3341',
  address:     '2847 Oak Grove Ave, Walnut Creek, CA 94597',
  mc:          'Pacific Coast Property Management',
  pending:     '$4,320',
  routingMask: '•••••• 1234',
  accountMask: '•••••••• 5678',
  routing:     '121000248',
  account:     '4782039128',
};
const PAYMENTS = [
  { id:'INV-8841', date:'Apr 5, 2026',  desc:'Monthly Grounds – Sunrise HOA',       amount:'$2,340', status:'Paid'       },
  { id:'INV-8802', date:'Mar 28, 2026', desc:'Spring Cleanup – Hillside Commons',    amount:'$1,180', status:'Paid'       },
  { id:'INV-8779', date:'Mar 15, 2026', desc:'Irrigation Repair – Oakview Terrace', amount:'$890',   status:'Processing' },
  { id:'INV-8744', date:'Mar 1, 2026',  desc:'Monthly Grounds – Sunrise HOA',       amount:'$2,340', status:'Paid'       },
];

// ─── Types ───────────────────────────────────────────────────
type Screen  = 'email'|'landing'|'method'|'details'|'confirm'|'dashboard';
type Method  = 'card'|'sameday'|'ach'|'check';

// ─── Shared Components ───────────────────────────────────────
const Font: React.FC = () => {
  useEffect(() => {
    if (document.getElementById('montserrat-font')) return;
    const l = document.createElement('link');
    l.id   = 'montserrat-font';
    l.rel  = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
    document.body.style.cssText = 'margin:0;padding:0;box-sizing:border-box;';
  }, []);
  return null;
};

const Logo: React.FC<{ size?: 'sm'|'md'|'lg' }> = ({ size = 'md' }) => {
  const s = { sm:{t:15,v:24}, md:{t:19,v:30}, lg:{t:24,v:38} }[size];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:s.v, height:s.v, borderRadius:7, background:`linear-gradient(135deg,${C.blue},${C.darkBlue})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:Sh.sm }}>
        <span style={{ color:C.green, fontWeight:800, fontSize:s.v*0.58, fontFamily:'Montserrat,sans-serif', lineHeight:1 }}>V</span>
      </div>
      <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:s.t, color:C.darkBlue, lineHeight:1.15 }}>
        Vantaca <span style={{ color:C.blue }}>Vendor</span>
        {size !== 'sm' && <div style={{ fontWeight:400, fontSize:s.t*0.62, color:C.gray400, letterSpacing:'0.02em' }}>Fast Payments · Full Visibility</div>}
      </div>
    </div>
  );
};

const TopBar: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ padding:'0 32px', height:56, background:C.white, borderBottom:`1px solid ${C.gray200}`, boxShadow:Sh.sm, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
    <Logo size="sm" />
    {children || (
      <div style={{ fontSize:12, color:C.gray400, display:'flex', alignItems:'center', gap:5 }}>
        <Lock size={13} color={C.gray400} /> Secured · 256-bit encryption
      </div>
    )}
  </div>
);

const HelpFloat: React.FC = () => (
  <div style={{ position:'fixed', bottom:24, right:24, background:C.white, borderRadius:12, padding:'10px 16px', boxShadow:Sh.md, border:`1px solid ${C.gray200}`, display:'flex', alignItems:'center', gap:8, cursor:'pointer', zIndex:100, fontFamily:'Montserrat,sans-serif', fontSize:13, color:C.gray700 }}>
    <HelpCircle size={16} color={C.blue} />
    Need help? <strong style={{ color:C.blue }}>1-800-826-8224</strong>
  </div>
);

const Progress: React.FC<{ step:number; total:number }> = ({ step, total }) => (
  <div style={{ marginBottom:28 }}>
    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
      <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:12, color:C.gray500, fontWeight:500 }}>Step {step} of {total}</span>
      <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:12, color:C.blue, fontWeight:600 }}>{Math.round(step/total*100)}% complete</span>
    </div>
    <div style={{ background:C.gray100, borderRadius:4, height:6 }}>
      <div style={{ background:`linear-gradient(90deg,${C.blue},${C.green})`, borderRadius:4, height:6, width:`${step/total*100}%`, transition:'width 0.5s ease' }} />
    </div>
  </div>
);

const StatusBadge: React.FC<{ status:string }> = ({ status }) => {
  const m: Record<string,{bg:string;color:string}> = {
    Paid:       { bg:C.green50,  color:C.green600 },
    Processing: { bg:C.blue50,   color:C.blue      },
    Scheduled:  { bg:C.amber50,  color:C.amber500  },
    Pending:    { bg:C.gray100,  color:C.gray600   },
  };
  const s = m[status] || m.Pending;
  return <span style={{ background:s.bg, color:s.color, borderRadius:6, padding:'2px 10px', fontSize:12, fontWeight:600, fontFamily:'Montserrat,sans-serif', whiteSpace:'nowrap' }}>{status}</span>;
};

const Btn: React.FC<{ onClick:()=>void; variant?:'primary'|'green'|'ghost'; children:React.ReactNode; fullWidth?:boolean }> = ({ onClick, variant='primary', children, fullWidth }) => {
  const [hov, setHov] = useState(false);
  const bg = { primary: hov?'#005585':C.blue, green: hov?'#4D8C38':C.green, ghost: hov?C.gray100:C.white }[variant];
  const col = variant === 'ghost' ? C.gray700 : C.white;
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:fullWidth?'100%':undefined, background:bg, color:col, border:variant==='ghost'?`1px solid ${C.gray300}`:'none', borderRadius:10, padding:'14px 24px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', boxShadow:variant==='ghost'?Sh.sm:Sh.md, display:'flex', alignItems:'center', justifyContent:'center', gap:9, transition:'background 0.15s' }}>
      {children}
    </button>
  );
};

// ─── Screen 1: Email Simulation ──────────────────────────────
const EmailScreen: React.FC<{ onNext:()=>void }> = ({ onNext }) => {
  const [hov, setHov] = useState(false);
  const otherEmails = [
    { from:'QuickBooks',  subj:'Your invoice INV-8801 is due soon',     time:'11:30 AM' },
    { from:'Chase Bank',  subj:'Account statement for March is ready',  time:'Yesterday'},
    { from:'Sunrise HOA', subj:'Re: March maintenance schedule',         time:'Apr 3'    },
  ];
  return (
    <div style={{ minHeight:'100vh', background:'#EBEBEB', fontFamily:'Montserrat,sans-serif' }}>
      {/* Mail chrome */}
      <div style={{ background:C.darkBlue, height:50, display:'flex', alignItems:'center', padding:'0 20px', gap:14 }}>
        <span style={{ color:C.white, fontWeight:700, fontSize:16 }}>Mail</span>
        <div style={{ flex:1, background:'rgba(255,255,255,0.12)', borderRadius:7, height:28, display:'flex', alignItems:'center', padding:'0 12px' }}>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>Search mail…</span>
        </div>
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 50px)' }}>
        {/* Nav sidebar */}
        <div style={{ width:180, background:C.white, borderRight:`1px solid ${C.gray200}`, padding:'12px 0', flexShrink:0 }}>
          {['Inbox (1)','Sent','Drafts','Spam','Trash'].map((item,i)=>(
            <div key={i} style={{ padding:'9px 16px', fontSize:13, color:i===0?C.blue:C.gray600, background:i===0?C.blue50:'transparent', fontWeight:i===0?700:400, cursor:'pointer' }}>{item}</div>
          ))}
        </div>

        {/* Email list */}
        <div style={{ width:300, borderRight:`1px solid ${C.gray200}`, background:C.white, overflow:'auto', flexShrink:0 }}>
          <div style={{ padding:'10px 14px', borderBottom:`2px solid ${C.blue}`, background:C.blue50, cursor:'pointer' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
              <span style={{ fontSize:13, fontWeight:700, color:C.darkBlue }}>Vantaca Vendor</span>
              <span style={{ fontSize:11, color:C.gray400 }}>2:14 PM</span>
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:C.gray900, marginBottom:3 }}>You have payments waiting — setup takes under 2 minutes</div>
            <div style={{ fontSize:12, color:C.gray500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Hi Marco, Pacific Coast Property Management is moving payments…</div>
          </div>
          {otherEmails.map((e,i)=>(
            <div key={i} style={{ padding:'12px 14px', borderBottom:`1px solid ${C.gray100}`, cursor:'pointer', opacity:0.65 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:13, fontWeight:600, color:C.gray800 }}>{e.from}</span>
                <span style={{ fontSize:11, color:C.gray400 }}>{e.time}</span>
              </div>
              <div style={{ fontSize:12, color:C.gray600 }}>{e.subj}</div>
            </div>
          ))}
        </div>

        {/* Email body */}
        <div style={{ flex:1, background:'#F0F0F0', overflow:'auto', padding:'28px 48px' }}>
          <div style={{ maxWidth:560, margin:'0 auto' }}>
            {/* Email meta */}
            <div style={{ background:C.white, borderRadius:'12px 12px 0 0', padding:'18px 28px', borderBottom:`1px solid ${C.gray100}` }}>
              <div style={{ fontSize:17, fontWeight:700, color:C.gray900, marginBottom:6 }}>You have payments waiting — setup takes under 2 minutes</div>
              <div style={{ fontSize:12, color:C.gray500 }}>From: <strong>Vantaca Vendor</strong> &lt;payments@vantacavendor.com&gt;</div>
              <div style={{ fontSize:12, color:C.gray500 }}>To: {VENDOR.email}</div>
            </div>

            {/* Email body card */}
            <div style={{ background:C.white, borderRadius:'0 0 12px 12px', boxShadow:Sh.card, overflow:'hidden' }}>
              <div style={{ background:C.darkBlue, padding:'28px 40px', textAlign:'center' }}>
                <Logo size="lg" />
              </div>

              <div style={{ padding:'32px 40px' }}>
                <p style={{ fontSize:16, color:C.gray900, marginBottom:14 }}>Hi <strong>{VENDOR.contact}</strong>,</p>
                <p style={{ fontSize:15, color:C.gray700, lineHeight:1.65, marginBottom:10 }}>
                  <strong>{VENDOR.mc}</strong> is moving payments to Vantaca Vendor — a secure portal that connects directly to their property management system.
                </p>
                <p style={{ fontSize:15, color:C.gray700, lineHeight:1.65, marginBottom:32 }}>
                  Get paid faster. Setup takes <strong>under 2 minutes</strong>. No password needed.
                </p>

                {/* CTA */}
                <div style={{ textAlign:'center', marginBottom:28 }}>
                  <button onClick={onNext} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
                    style={{ background:hov?'#005585':C.blue, color:C.white, border:'none', borderRadius:10, padding:'16px 44px', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', boxShadow:Sh.md, transition:'background 0.2s', display:'inline-flex', alignItems:'center', gap:10 }}>
                    Set Up Your Payments <ArrowRight size={18} />
                  </button>
                  <div style={{ marginTop:9, fontSize:12, color:C.gray400 }}>Free · No password needed · Under 2 minutes</div>
                </div>

                {/* Benefits */}
                <div style={{ background:C.gray50, borderRadius:10, padding:'18px 22px', marginBottom:24 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.gray700, marginBottom:12, textTransform:'uppercase', letterSpacing:'0.06em' }}>What you get</div>
                  {[
                    { icon:<Zap size={15} color={C.green}/>,    text:'Faster payments — digital card, same-day ACH, or direct deposit' },
                    { icon:<Eye size={15} color={C.blue}/>,     text:'Invoice visibility — see exactly which invoice each payment covers' },
                    { icon:<Bell size={15} color={C.amber500}/>, text:'Real-time alerts — know the moment a payment is approved' },
                  ].map((b,i)=>(
                    <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:i<2?10:0 }}>
                      <div style={{ marginTop:1, flexShrink:0 }}>{b.icon}</div>
                      <span style={{ fontSize:13, color:C.gray700, lineHeight:1.5 }}>{b.text}</span>
                    </div>
                  ))}
                </div>

                {/* 2 steps */}
                <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:0 }}>
                  {[{n:'1',l:'Choose how to get paid'},{n:'2',l:'Confirm your details'}].map((s,i)=>(
                    <React.Fragment key={i}>
                      <div style={{ textAlign:'center', width:130 }}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:C.blue, color:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, margin:'0 auto 6px' }}>{s.n}</div>
                        <div style={{ fontSize:12, color:C.gray600 }}>{s.l}</div>
                      </div>
                      {i===0 && <div style={{ width:36, height:2, background:C.gray200, flexShrink:0, margin:'0 4px' }} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div style={{ background:C.gray50, padding:'14px 40px', borderTop:`1px solid ${C.gray200}`, textAlign:'center', fontSize:11, color:C.gray400, lineHeight:1.7 }}>
                © 2026 Vantaca Vendor ·{' '}
                <span style={{ color:C.blue, cursor:'pointer' }}>Privacy Policy</span> ·{' '}
                <span style={{ color:C.blue, cursor:'pointer' }}>Terms of Service</span><br />
                Questions? Reply to this email or call <strong>1-800-826-8224</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Screen 2: Magic Link Landing ────────────────────────────
const LandingScreen: React.FC<{ onNext:()=>void }> = ({ onNext }) => {
  const [ready, setReady] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setReady(true),120); return()=>clearTimeout(t); },[]);
  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(150deg,${C.blue50} 0%,${C.white} 55%)`, fontFamily:'Montserrat,sans-serif', display:'flex', flexDirection:'column' }}>
      <TopBar />
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
        <div style={{ background:C.white, borderRadius:16, padding:'48px', boxShadow:Sh.lg, maxWidth:480, width:'100%', transform:ready?'translateY(0)':'translateY(20px)', opacity:ready?1:0, transition:'all 0.4s ease' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.green50, borderRadius:8, padding:'7px 14px', marginBottom:28, border:`1px solid ${C.green100}` }}>
            <CheckCircle size={15} color={C.green} />
            <span style={{ fontSize:13, fontWeight:600, color:C.green600 }}>Email Verified</span>
          </div>
          <h1 style={{ fontSize:27, fontWeight:700, color:C.darkBlue, marginBottom:10, letterSpacing:'-0.02em', margin:'0 0 10px' }}>Welcome, {VENDOR.contact} 👋</h1>
          <p style={{ fontSize:15, color:C.gray600, lineHeight:1.65, margin:'0 0 8px' }}>You're all set — <strong>no password needed.</strong> Let's get you paid.</p>
          <p style={{ fontSize:13, color:C.gray500, lineHeight:1.65, margin:'0 0 32px' }}>
            <strong>{VENDOR.mc}</strong> has payments ready for <strong>{VENDOR.name}</strong>. Choose how you'd like to receive them — takes about 90 seconds.
          </p>
          <div style={{ background:C.blue50, border:`1px solid ${C.blue100}`, borderRadius:12, padding:'16px 20px', marginBottom:32, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:C.blue, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <DollarSign size={20} color={C.white} />
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:700, color:C.blue, letterSpacing:'-0.02em' }}>{VENDOR.pending}</div>
              <div style={{ fontSize:12, color:C.gray600 }}>in payments waiting for you</div>
            </div>
          </div>
          <Btn onClick={onNext} fullWidth>Get Started <ArrowRight size={17} /></Btn>
          <div style={{ textAlign:'center', marginTop:14, fontSize:12, color:C.gray400 }}>Next time you log in, we'll send a secure link to your email. No password to remember.</div>
        </div>
      </div>
      <HelpFloat />
    </div>
  );
};

// ─── Screen 3: Payment Method ─────────────────────────────────
const MethodScreen: React.FC<{ onNext:(m:Method)=>void }> = ({ onNext }) => {
  const [sel, setSel] = useState<Method>('card');
  const methods: { id:Method; icon:React.ReactNode; title:string; sub:string; time:string; tag?:string; tagColor?:string; tagBg?:string }[] = [
    { id:'card',    icon:<CreditCard size={21}/>, title:'Digital Card',           sub:'Get paid instantly — we email your card when a payment is approved', time:'Instant',            tag:'RECOMMENDED', tagColor:C.green600, tagBg:C.green50 },
    { id:'sameday', icon:<Zap size={21}/>,        title:'Same-Day Bank Transfer', sub:'Money in your bank account by end of business day',                 time:'Same business day',  tag:'Small fee',    tagColor:C.amber500, tagBg:C.amber50  },
    { id:'ach',     icon:<Landmark size={21}/>,   title:'Direct Bank Transfer',   sub:'Standard ACH transfer directly to your bank — free',               time:'3–5 business days'  },
    { id:'check',   icon:<Truck size={21}/>,      title:'Paper Check',            sub:'Physical check mailed to your address on file — free',             time:'7–10 business days' },
  ];
  return (
    <div style={{ minHeight:'100vh', background:C.gray50, fontFamily:'Montserrat,sans-serif', display:'flex', flexDirection:'column' }}>
      <TopBar />
      <div style={{ flex:1, display:'flex', justifyContent:'center', padding:'40px 24px' }}>
        <div style={{ maxWidth:560, width:'100%' }}>
          <Progress step={1} total={2} />
          <h2 style={{ fontSize:24, fontWeight:700, color:C.darkBlue, margin:'0 0 8px', letterSpacing:'-0.02em' }}>How would you like to get paid?</h2>
          <p style={{ fontSize:14, color:C.gray500, margin:'0 0 28px' }}>You can change this anytime from your account settings.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
            {methods.map(m=>(
              <div key={m.id} onClick={()=>setSel(m.id)}
                style={{ background:C.white, borderRadius:12, border:`2px solid ${sel===m.id?C.blue:C.gray200}`, padding:'18px 20px', cursor:'pointer', boxShadow:sel===m.id?`0 0 0 3px ${C.blue50}`:Sh.sm, transition:'all 0.15s', display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ width:44, height:44, borderRadius:10, background:sel===m.id?C.blue50:C.gray100, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.15s', color:sel===m.id?C.blue:C.gray500 }}>
                  {m.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                    <span style={{ fontSize:15, fontWeight:600, color:sel===m.id?C.darkBlue:C.gray800 }}>{m.title}</span>
                    {m.tag && <span style={{ background:m.tagBg, color:m.tagColor, borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:700 }}>{m.tag}</span>}
                  </div>
                  <div style={{ fontSize:13, color:C.gray500, marginBottom:4 }}>{m.sub}</div>
                  <div style={{ fontSize:12, color:C.gray400, display:'flex', alignItems:'center', gap:4 }}><Clock size={12}/> {m.time}</div>
                </div>
                <div style={{ width:22, height:22, borderRadius:'50%', border:`2px solid ${sel===m.id?C.blue:C.gray300}`, background:sel===m.id?C.blue:C.white, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                  {sel===m.id && <Check size={12} color={C.white} strokeWidth={3}/>}
                </div>
              </div>
            ))}
          </div>
          <Btn onClick={()=>onNext(sel)} fullWidth>Continue <ArrowRight size={17}/></Btn>
        </div>
      </div>
      <HelpFloat />
    </div>
  );
};

// ─── Screen 4: Payment Details ────────────────────────────────
const DetailsScreen: React.FC<{ method:Method; onNext:()=>void; onBack:()=>void }> = ({ method, onNext, onBack }) => {
  const [editEmail, setEditEmail] = useState(false);
  const [emailVal, setEmailVal]   = useState(VENDOR.email);
  const [showR, setShowR]         = useState(false);
  const [showA, setShowA]         = useState(false);
  const [editAddr, setEditAddr]   = useState(false);

  const InfoBox: React.FC<{ bg:string; border:string; icon:React.ReactNode; title:string; body:string }> = ({ bg,border,icon,title,body }) => (
    <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:12, padding:'14px 18px', marginBottom:22, display:'flex', gap:12, alignItems:'flex-start' }}>
      <div style={{ flexShrink:0, marginTop:2 }}>{icon}</div>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:C.darkBlue, marginBottom:4 }}>{title}</div>
        <div style={{ fontSize:13, color:C.gray600, lineHeight:1.6 }}>{body}</div>
      </div>
    </div>
  );

  const renderTab = () => {
    switch(method) {
      case 'card': return (
        <>
          <InfoBox bg={C.blue50} border={C.blue100} icon={<CreditCard size={18} color={C.blue}/>}
            title="How digital cards work"
            body="When a payment is approved, we email a virtual card to the address below. Use it instantly online or add it to Apple/Google Pay." />
          <label style={{ fontSize:13, fontWeight:600, color:C.gray700, display:'block', marginBottom:8 }}>Card delivery email</label>
          {editEmail
            ? <input value={emailVal} onChange={e=>setEmailVal(e.target.value)} autoFocus
                style={{ width:'100%', border:`2px solid ${C.blue}`, borderRadius:8, padding:'11px 13px', fontSize:14, fontFamily:'Montserrat,sans-serif', outline:'none', boxSizing:'border-box', marginBottom:10 }}/>
            : <div style={{ border:`1px solid ${C.gray200}`, borderRadius:8, padding:'11px 14px', background:C.gray50, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <Mail size={15} color={C.gray400}/><span style={{ fontSize:14, color:C.gray800 }}>{emailVal}</span><CheckCircle size={14} color={C.green}/>
                </div>
                <button onClick={()=>setEditEmail(true)} style={{ background:'none', border:'none', cursor:'pointer', color:C.blue, fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:4, fontFamily:'Montserrat,sans-serif' }}>
                  <Edit2 size={13}/> Edit
                </button>
              </div>}
          {editEmail && <button onClick={()=>setEditEmail(false)} style={{ background:C.blue50, color:C.blue, border:'none', borderRadius:8, padding:'7px 14px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif', marginBottom:8 }}>Save</button>}
        </>
      );
      case 'sameday':
      case 'ach': return (
        <>
          <InfoBox bg={C.green50} border={C.green100} icon={<Shield size={18} color={C.green}/>}
            title="Your bank details are pre-filled"
            body="We've loaded the details on file. Verify they're correct before continuing. All data is encrypted with bank-level security." />
          {[
            { label:'Routing Number', mask:VENDOR.routingMask, real:VENDOR.routing,  show:showR, toggle:()=>setShowR(!showR) },
            { label:'Account Number', mask:VENDOR.accountMask, real:VENDOR.account,  show:showA, toggle:()=>setShowA(!showA) },
          ].map((f,i)=>(
            <div key={i} style={{ marginBottom:14 }}>
              <label style={{ fontSize:13, fontWeight:600, color:C.gray700, display:'block', marginBottom:7 }}>{f.label}</label>
              <div style={{ border:`1px solid ${C.gray200}`, borderRadius:8, padding:'11px 14px', background:C.gray50, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                  <Landmark size={15} color={C.gray400}/>
                  <span style={{ fontSize:14, color:C.gray800, fontFamily:'monospace' }}>{f.show?f.real:f.mask}</span>
                  <CheckCircle size={14} color={C.green}/>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={f.toggle} style={{ background:'none', border:'none', cursor:'pointer', color:C.gray400 }}>
                    {f.show?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                  <button style={{ background:'none', border:'none', cursor:'pointer', color:C.blue, fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:3, fontFamily:'Montserrat,sans-serif' }}>
                    <Edit2 size={13}/> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
          {method==='sameday' && <div style={{ background:C.amber50, border:`1px solid #FDE68A`, borderRadius:8, padding:'9px 14px', fontSize:12, color:C.amber500, marginTop:4 }}>Same-day transfers carry a small fee (1.25%, max $25 per transaction).</div>}
        </>
      );
      case 'check': return (
        <>
          <InfoBox bg={C.gray50} border={C.gray200} icon={<MapPin size={18} color={C.blue}/>}
            title="Your mailing address on file"
            body="Checks will be mailed to the address below. Make sure it's correct — changes take effect for the next payment cycle." />
          {!editAddr
            ? <>
                <div style={{ border:`1px solid ${C.gray200}`, borderRadius:10, padding:'16px 18px', background:C.gray50, marginBottom:18 }}>
                  <div style={{ fontSize:15, fontWeight:600, color:C.gray900, marginBottom:4 }}>{VENDOR.name}</div>
                  <div style={{ fontSize:14, color:C.gray600 }}>{VENDOR.address}</div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={onNext} style={{ flex:1, background:C.blue, color:C.white, border:'none', borderRadius:9, padding:'13px 18px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                    <Check size={15}/> This looks right
                  </button>
                  <button onClick={()=>setEditAddr(true)} style={{ background:C.white, color:C.gray700, border:`1px solid ${C.gray300}`, borderRadius:9, padding:'13px 16px', fontSize:14, cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}>
                    Edit
                  </button>
                </div>
              </>
            : <>
                {['Street Address','City','State','ZIP'].map((lbl,i)=>(
                  <div key={i} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:C.gray600, display:'block', marginBottom:5 }}>{lbl}</label>
                    <input style={{ width:'100%', border:`1px solid ${C.gray300}`, borderRadius:8, padding:'10px 12px', fontSize:14, fontFamily:'Montserrat,sans-serif', outline:'none', boxSizing:'border-box' }}/>
                  </div>
                ))}
                <button onClick={()=>setEditAddr(false)} style={{ background:C.blue50, color:C.blue, border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}>Save address</button>
              </>}
        </>
      );
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:C.gray50, fontFamily:'Montserrat,sans-serif', display:'flex', flexDirection:'column' }}>
      <TopBar />
      <div style={{ flex:1, display:'flex', justifyContent:'center', padding:'40px 24px' }}>
        <div style={{ maxWidth:560, width:'100%' }}>
          <Progress step={2} total={2} />
          <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.blue, fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:4, marginBottom:18, padding:0, fontFamily:'Montserrat,sans-serif' }}>
            <ChevronLeft size={16}/> Back
          </button>
          <h2 style={{ fontSize:24, fontWeight:700, color:C.darkBlue, margin:'0 0 7px', letterSpacing:'-0.02em' }}>Confirm your payment details</h2>
          <p style={{ fontSize:14, color:C.gray500, margin:'0 0 24px' }}>Your information is pre-filled. Just verify it's correct.</p>

          {renderTab()}

          {method !== 'check' && (
            <div style={{ marginTop:24 }}>
              <Btn onClick={onNext} variant="green" fullWidth><Check size={17}/> Confirm &amp; Finish</Btn>
            </div>
          )}
        </div>
      </div>
      <HelpFloat />
    </div>
  );
};

// ─── Screen 5: Confirmation ───────────────────────────────────
const ConfirmScreen: React.FC<{ method:Method; onNext:()=>void }> = ({ method, onNext }) => {
  const [ready, setReady] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setReady(true),120); return()=>clearTimeout(t); },[]);
  const labels: Record<Method,string> = { card:'Digital Card', sameday:'Same-Day Bank Transfer', ach:'Direct Bank Transfer', check:'Paper Check' };
  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(150deg,${C.green50} 0%,${C.white} 50%)`, fontFamily:'Montserrat,sans-serif', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'0 32px', height:56, background:C.white, borderBottom:`1px solid ${C.gray200}`, boxShadow:Sh.sm, display:'flex', alignItems:'center' }}>
        <Logo size="sm"/>
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
        <div style={{ background:C.white, borderRadius:16, padding:'52px 48px', boxShadow:Sh.lg, maxWidth:460, width:'100%', textAlign:'center', transform:ready?'scale(1)':'scale(0.95)', opacity:ready?1:0, transition:'all 0.4s ease' }}>
          <div style={{ width:76, height:76, borderRadius:'50%', background:C.green50, border:`3px solid ${C.green}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px' }}>
            <Check size={38} color={C.green} strokeWidth={2.5}/>
          </div>
          <h1 style={{ fontSize:27, fontWeight:700, color:C.darkBlue, margin:'0 0 10px', letterSpacing:'-0.02em' }}>You're all set! 🎉</h1>
          <p style={{ fontSize:15, color:C.gray600, margin:'0 0 8px', lineHeight:1.65 }}>
            Your payment preference is saved as <strong>{labels[method]}</strong>.
          </p>
          <p style={{ fontSize:13, color:C.gray500, margin:'0 0 28px', lineHeight:1.65 }}>
            This applies to all management companies that pay you through Vantaca. You can change it anytime from your account settings.
          </p>
          <div style={{ background:C.gray50, borderRadius:12, padding:'20px', marginBottom:32, textAlign:'left' }}>
            {[
              { icon:<Building2 size={14} color={C.gray400}/>, label:'Business',         val:VENDOR.name     },
              { icon:<CreditCard size={14} color={C.gray400}/>, label:'Payment method',  val:labels[method]  },
              { icon:<Mail size={14} color={C.gray400}/>,       label:'Notifications',   val:VENDOR.email    },
            ].map((r,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:i<2?11:0 }}>
                {r.icon}
                <span style={{ fontSize:13, color:C.gray500, width:115, flexShrink:0 }}>{r.label}</span>
                <span style={{ fontSize:13, fontWeight:600, color:C.gray900 }}>{r.val}</span>
              </div>
            ))}
          </div>
          <Btn onClick={onNext} fullWidth>Go to My Dashboard <ArrowRight size={17}/></Btn>
        </div>
      </div>
    </div>
  );
};

// ─── Screen 6: Dashboard ──────────────────────────────────────
const DashboardScreen: React.FC = () => {
  const [nav, setNav] = useState('dashboard');
  const navItems = [
    { id:'dashboard', label:'Dashboard',       icon:<LayoutDashboard size={17}/> },
    { id:'payments',  label:'Payments',        icon:<DollarSign size={17}/>      },
    { id:'invoices',  label:'Invoices',        icon:<FileText size={17}/>        },
    { id:'account',   label:'Account Settings',icon:<Settings size={17}/>        },
  ];
  const kpis = [
    { label:'Pending Payments', value:'$4,320', sub:'2 invoices awaiting approval', icon:<Clock size={17} color={C.amber500}/>, iconBg:'#FEF0C7' },
    { label:'Paid This Month',  value:'$8,120', sub:'+18% vs last month',            icon:<TrendingUp size={17} color={C.green}/>, iconBg:C.green100 },
    { label:'Paid This Year',   value:'$31,440',sub:'Across 4 management companies', icon:<DollarSign size={17} color={C.blue}/>, iconBg:C.blue100  },
  ];
  return (
    <div style={{ minHeight:'100vh', background:C.gray50, fontFamily:'Montserrat,sans-serif', display:'flex' }}>
      {/* Sidebar */}
      <div style={{ width:220, background:C.darkBlue, display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'22px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:6, background:C.blue, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:C.green, fontWeight:800, fontSize:15, fontFamily:'Montserrat,sans-serif' }}>V</span>
            </div>
            <div>
              <div style={{ color:C.white, fontWeight:700, fontSize:14, fontFamily:'Montserrat,sans-serif' }}>Vantaca Vendor</div>
              <div style={{ color:'rgba(255,255,255,0.35)', fontSize:10 }}>Vendor Portal</div>
            </div>
          </div>
        </div>
        <nav style={{ padding:'10px 0', flex:1 }}>
          {navItems.map(item=>(
            <div key={item.id} onClick={()=>setNav(item.id)}
              style={{ padding:'10px 18px', cursor:'pointer', background:nav===item.id?'rgba(0,103,155,0.35)':'transparent', borderLeft:nav===item.id?`3px solid ${C.blue100}`:'3px solid transparent', display:'flex', alignItems:'center', gap:10, transition:'all 0.15s' }}>
              <span style={{ color:nav===item.id?C.blue100:'rgba(255,255,255,0.45)' }}>{item.icon}</span>
              <span style={{ fontSize:13, fontWeight:nav===item.id?600:400, color:nav===item.id?C.white:'rgba(255,255,255,0.5)', fontFamily:'Montserrat,sans-serif' }}>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:C.blue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:C.white, flexShrink:0 }}>M</div>
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:C.white, fontFamily:'Montserrat,sans-serif' }}>{VENDOR.contact}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{VENDOR.name}</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:'auto' }}>
        <div style={{ background:C.white, padding:'0 28px', height:54, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${C.gray200}`, boxShadow:Sh.sm }}>
          <div style={{ fontSize:13, color:C.gray500 }}>Vantaca Vendor <ChevronRight size={13} style={{ verticalAlign:'middle' }}/> <strong style={{ color:C.gray900 }}>Dashboard</strong></div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <Bell size={17} color={C.gray400} style={{ cursor:'pointer' }}/>
            <div style={{ width:30, height:30, borderRadius:'50%', background:C.blue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:C.white, cursor:'pointer' }}>M</div>
          </div>
        </div>

        <div style={{ padding:'28px' }}>
          {/* Welcome banner */}
          <div style={{ background:`linear-gradient(135deg,${C.darkBlue} 0%,${C.blue} 100%)`, borderRadius:14, padding:'22px 26px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ color:'rgba(255,255,255,0.65)', fontSize:13, marginBottom:4 }}>Welcome back</div>
              <div style={{ color:C.white, fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>{VENDOR.contact} 👋</div>
              <div style={{ color:'rgba(255,255,255,0.65)', fontSize:13, marginTop:4 }}>{VENDOR.name} · Account active</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'12px 18px', textAlign:'center' }}>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, marginBottom:4 }}>Payment method</div>
              <div style={{ color:C.white, fontWeight:700, fontSize:14, display:'flex', alignItems:'center', gap:6 }}>
                <CreditCard size={15}/> Digital Card
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
            {kpis.map((k,i)=>(
              <div key={i} style={{ background:C.white, borderRadius:12, padding:'18px', boxShadow:Sh.card }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.gray500, textTransform:'uppercase', letterSpacing:'0.05em' }}>{k.label}</div>
                  <div style={{ width:30, height:30, borderRadius:8, background:k.iconBg, display:'flex', alignItems:'center', justifyContent:'center' }}>{k.icon}</div>
                </div>
                <div style={{ fontSize:24, fontWeight:700, color:C.gray900, letterSpacing:'-0.025em', marginBottom:3 }}>{k.value}</div>
                <div style={{ fontSize:12, color:C.gray500 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Payments table */}
          <div style={{ background:C.white, borderRadius:12, boxShadow:Sh.card }}>
            <div style={{ padding:'18px 22px', borderBottom:`1px solid ${C.gray100}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:C.gray900 }}>Recent Payments</div>
                <div style={{ fontSize:12, color:C.gray500, marginTop:2 }}>All payment activity across your accounts</div>
              </div>
              <button style={{ background:C.blue50, color:C.blue, border:'none', borderRadius:8, padding:'7px 13px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}>View All</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'110px 1fr 100px 110px 100px', padding:'9px 22px', gap:14, borderBottom:`1px solid ${C.gray100}` }}>
              {['Invoice','Description','Amount','Status','Date'].map((col,i)=>(
                <div key={i} style={{ fontSize:11, fontWeight:700, color:C.gray400, textTransform:'uppercase', letterSpacing:'0.05em', textAlign:i>=2?'right':'left' }}>{col}</div>
              ))}
            </div>
            {PAYMENTS.map((p,i)=>(
              <div key={i}
                style={{ display:'grid', gridTemplateColumns:'110px 1fr 100px 110px 100px', padding:'13px 22px', gap:14, borderBottom:i<PAYMENTS.length-1?`1px solid ${C.gray100}`:'none', cursor:'pointer', transition:'background 0.1s' }}
                onMouseEnter={e=>(e.currentTarget.style.background=C.gray25)}
                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                <div style={{ fontSize:13, fontWeight:600, color:C.blue }}>{p.id}</div>
                <div style={{ fontSize:13, color:C.gray700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.desc}</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.gray900, textAlign:'right', whiteSpace:'nowrap' }}>{p.amount}</div>
                <div style={{ textAlign:'right' }}><StatusBadge status={p.status}/></div>
                <div style={{ fontSize:12, color:C.gray500, textAlign:'right' }}>{p.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── App Root ─────────────────────────────────────────────────
export default function App() {
  const [screen,  setScreen]  = useState<Screen>('email');
  const [method,  setMethod]  = useState<Method>('card');
  const screens: [Screen, string][] = [
    ['email',    'Email'     ],
    ['landing',  'Landing'   ],
    ['method',   'Pay Method'],
    ['details',  'Details'   ],
    ['confirm',  'Confirmed' ],
    ['dashboard','Dashboard' ],
  ];
  return (
    <>
      <Font />
      {/* Demo navigator */}
      <div style={{ position:'fixed', top:12, left:'50%', transform:'translateX(-50%)', background:'rgba(21,60,79,0.93)', borderRadius:10, padding:'5px 7px', display:'flex', gap:3, zIndex:9999, boxShadow:Sh.md, backdropFilter:'blur(8px)' }}>
        {screens.map(([s,label])=>(
          <button key={s} onClick={()=>setScreen(s)}
            style={{ background:screen===s?C.blue:'transparent', color:screen===s?C.white:'rgba(255,255,255,0.5)', border:'none', borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:screen===s?700:500, cursor:'pointer', fontFamily:'Montserrat,sans-serif', whiteSpace:'nowrap', transition:'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {screen==='email'    && <EmailScreen   onNext={()=>setScreen('landing')}/>}
      {screen==='landing'  && <LandingScreen onNext={()=>setScreen('method')}/>}
      {screen==='method'   && <MethodScreen  onNext={m=>{setMethod(m);setScreen('details');}}/>}
      {screen==='details'  && <DetailsScreen method={method} onNext={()=>setScreen('confirm')} onBack={()=>setScreen('method')}/>}
      {screen==='confirm'  && <ConfirmScreen method={method} onNext={()=>setScreen('dashboard')}/>}
      {screen==='dashboard'&& <DashboardScreen/>}
    </>
  );
}
