// ============================================================
// VendorOnboardingNoPay.tsx  v3
// Vantaca Vendor · Vendor Onboarding Refresh (primary flow)
// Changes v3: return-visit login screens added —
//   desktop: Google/Microsoft OAuth + approve-and-auto-advance
//   mobile:  biometric (Face ID/Touch ID) + magic link fallback
//   removed: Payment Queued variant, variant toggle
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, CheckCircle, Check, ChevronRight, ChevronLeft,
  CreditCard, Mail, Zap, Landmark, Truck, Clock, DollarSign,
  Shield, Eye, EyeOff, Edit2, MapPin, Bell, Settings,
  LayoutDashboard, FileText, TrendingUp, Building2, Lock,
  HelpCircle, Users, X, Phone, Home, Star, AlertCircle,
  Smartphone, Globe, RefreshCw, ChevronDown, LogOut,
} from 'lucide-react';

// ─── Brand Tokens ─────────────────────────────────────────────
const C = {
  blue:     '#00679B', blue50:  '#E6F2F8', blue100: '#DEF0FA',
  green:    '#64B24B', green50: '#EDF6E9', green100:'#B5DBA9', green600:'#64B24B',
  darkBlue: '#153C4F',
  amber50:  '#FFFAEB', amber100:'#FDE68A', amber500:'#F79009',
  gray25:   '#FCFCFD', gray50:  '#F9FAFB', gray100: '#F2F4F7',
  gray200:  '#E4E7EC', gray300: '#D0D5DD', gray400: '#98A2B3',
  gray500:  '#667085', gray600: '#475467', gray700: '#344054',
  gray800:  '#1D2939', gray900: '#101828', white:   '#FFFFFF',
};
const Sh = {
  sm:   '0 1px 2px rgba(16,24,40,.05)',
  card: '0 1px 3px rgba(16,24,40,.10),0 1px 2px rgba(16,24,40,.06)',
  md:   '0 4px 8px rgba(16,24,40,.08),0 2px 4px rgba(16,24,40,.06)',
  lg:   '0 12px 24px rgba(16,24,40,.12),0 4px 8px rgba(16,24,40,.08)',
};

// ─── Mock Data ────────────────────────────────────────────────
const VENDOR = {
  name:        'Sierra Landscaping LLC',
  dba:         'Sierra Landscaping',
  contact:     'Marco Rivera',
  email:       'marco@sierra-landscaping.com',
  phone:       '(415) 882-3341',
  address:     '2847 Oak Grove Ave, Walnut Creek, CA 94597',
  mc:          'Pacific Coast Property Management',
  routingMask: '\u2022\u2022\u2022\u2022\u2022 0248',
  accountMask: '\u2022\u2022\u2022\u2022\u2022\u2022 9128',
  routing:     '121000248',
  account:     '4782039128',
};
// Mock USPS suggestion — always differs from the pre-filled address to guarantee demo fires
const MOCK_USPS = { street: '2847 Oak Grove Ave', city: 'Walnut Creek', state: 'CA', zip: '94598-1204' };

const ROUTING_BANKS: Record<string,string> = {
  '121000248': 'Wells Fargo Bank, N.A.',
  '021000021': 'JPMorgan Chase Bank, N.A.',
  '011000138': 'Bank of America, N.A.',
  '322271627': 'JPMorgan Chase Bank, N.A.',
  '021200339': 'Citibank, N.A.',
  '322271724': 'Citi Bank, N.A.',
  '031176110': 'Capital One, N.A.',
};

// ─── Types ───────────────────────────────────────────────────
type Screen = 'login'|'login-approve'|'payment-email'|'post-email'|'email'|'landing'|'method'|'details'|'dashboard';
type Method = 'card'|'sameday'|'ach'|'check';

// ─── Responsive hook ─────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

// ─── Shared components ───────────────────────────────────────
const Font: React.FC = () => {
  useEffect(() => {
    if (document.getElementById('mf2')) return;
    const l = document.createElement('link');
    l.id = 'mf2'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
    document.body.style.cssText = 'margin:0;padding:0;box-sizing:border-box;';
  }, []);
  return null;
};

const Logo: React.FC<{ size?:'sm'|'md'|'lg'; light?:boolean }> = ({ size='md', light }) => {
  const s = { sm:{t:14,v:24}, md:{t:18,v:30}, lg:{t:22,v:36} }[size];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
      <div style={{ width:s.v, height:s.v, borderRadius:7, background:`linear-gradient(135deg,${C.blue},${C.darkBlue})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ color:C.green, fontWeight:800, fontSize:Math.round(s.v*0.56), fontFamily:'Montserrat,sans-serif', lineHeight:1 }}>V</span>
      </div>
      <div style={{ fontFamily:'Montserrat,sans-serif' }}>
        <div style={{ fontWeight:700, fontSize:s.t, color:light?C.white:C.darkBlue, lineHeight:1.1 }}>
          Vantaca <span style={{ color:C.green }}>Vendor</span>
        </div>
        {size !== 'sm' && (
          <div style={{ fontWeight:400, fontSize:Math.round(s.t*0.62), color:light?'rgba(255,255,255,0.55)':C.gray400, letterSpacing:'0.02em', marginTop:1 }}>
            Fast Payments · Full Visibility
          </div>
        )}
      </div>
    </div>
  );
};

const TopBar: React.FC<{ children?:React.ReactNode }> = ({ children }) => (
  <div style={{ padding:'0 24px', height:54, background:C.white, borderBottom:`1px solid ${C.gray200}`, boxShadow:Sh.sm, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
    <Logo size="sm" />
    {children ?? (
      <div style={{ fontSize:12, color:C.gray400, display:'flex', alignItems:'center', gap:5, fontFamily:'Montserrat,sans-serif' }}>
        <Lock size={12} color={C.gray400} /> 256-bit encrypted
      </div>
    )}
  </div>
);

const HelpFloat: React.FC = () => (
  <div style={{ position:'fixed', bottom:20, right:20, background:C.white, borderRadius:12, padding:'9px 15px', boxShadow:Sh.md, border:`1px solid ${C.gray200}`, display:'flex', alignItems:'center', gap:8, cursor:'pointer', zIndex:200, fontFamily:'Montserrat,sans-serif', fontSize:12, color:C.gray700 }}>
    <HelpCircle size={15} color={C.blue} /> Need help? <span style={{ color:C.blue, fontWeight:600 }}>Contact support</span>
  </div>
);

const Progress: React.FC<{ step:number; total:number }> = ({ step, total }) => (
  <div style={{ marginBottom:24 }}>
    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
      <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:12, color:C.gray500, fontWeight:500 }}>Step {step} of {total}</span>
      <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:12, color:C.blue, fontWeight:600 }}>{Math.round(step/total*100)}% complete</span>
    </div>
    <div style={{ background:C.gray100, borderRadius:4, height:6 }}>
      <div style={{ background:`linear-gradient(90deg,${C.blue},${C.green})`, borderRadius:4, height:6, width:`${step/total*100}%`, transition:'width 0.5s ease' }} />
    </div>
  </div>
);

const Btn: React.FC<{ onClick:()=>void; variant?:'primary'|'green'|'ghost'; children:React.ReactNode; fullWidth?:boolean }> = ({ onClick, variant='primary', children, fullWidth }) => {
  const [hov, setHov] = useState(false);
  const bg = { primary:hov?'#005585':C.blue, green:hov?'#4D8C38':C.green, ghost:hov?C.gray100:C.white }[variant];
  const col = variant==='ghost' ? C.gray700 : C.white;
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:fullWidth?'100%':undefined, background:bg, color:col, border:variant==='ghost'?`1px solid ${C.gray300}`:'none', borderRadius:10, padding:'13px 22px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', boxShadow:variant==='ghost'?Sh.sm:Sh.md, display:'flex', alignItems:'center', justifyContent:'center', gap:9, transition:'background 0.15s' }}>
      {children}
    </button>
  );
};

// ─── Provider Icons ───────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect x="1"  y="1"  width="10" height="10" fill="#F25022"/>
    <rect x="13" y="1"  width="10" height="10" fill="#7FBA00"/>
    <rect x="1"  y="13" width="10" height="10" fill="#00A4EF"/>
    <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
  </svg>
);

const FingerprintIcon: React.FC<{ size?:number; color?:string }> = ({ size=48, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
    <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
    <path d="M2 12a10 10 0 0 1 18-6"/>
    <path d="M2 16h.01"/>
    <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
    <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
    <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
  </svg>
);

// ─── Return-Visit: Login Screen ───────────────────────────────
const LoginScreen: React.FC<{ onApproveFlow:(email:string)=>void; onDashboard:()=>void; passkeyRegistered?:boolean }> = ({ onApproveFlow, onDashboard, passkeyRegistered=false }) => {
  const w = useWindowWidth();
  const isMobile = w < 768;
  const [email, setEmail]             = useState(VENDOR.email);
  const [oauthState, setOauthState]   = useState<null|'google'|'microsoft'>(null);
  const [biometricState, setBiometric]= useState<'idle'|'scanning'|'done'>('idle');
  const [passkeyState, setPasskeyState] = useState<'idle'|'scanning'|'done'>('idle');
  const [showSMS, setShowSMS]         = useState(false);
  const [smsCode, setSmsCode]         = useState('');
  const [smsError, setSmsError]       = useState(false);

  const handleOAuth = (provider: 'google'|'microsoft') => {
    setOauthState(provider);
    setTimeout(() => { setOauthState(null); onDashboard(); }, 1800);
  };

  const handleBiometric = () => {
    setBiometric('scanning');
    setTimeout(() => { setBiometric('done'); setTimeout(onDashboard, 700); }, 1600);
  };

  const handlePasskeySignIn = () => {
    setPasskeyState('scanning');
    setTimeout(() => { setPasskeyState('done'); setTimeout(onDashboard, 600); }, 1400);
  };

  const handleSMSVerify = () => {
    if (smsCode.length === 6) { onDashboard(); }
    else { setSmsError(true); setTimeout(() => setSmsError(false), 1800); }
  };

  // ── Mobile layout ────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.blue50} 0%,${C.white} 60%)`, fontFamily:'Montserrat,sans-serif', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'0 24px', height:54, background:C.white, borderBottom:`1px solid ${C.gray200}`, boxShadow:Sh.sm, display:'flex', alignItems:'center' }}>
          <Logo size="sm"/>
        </div>

        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'28px 20px' }}>
          <div style={{ background:C.white, borderRadius:16, padding:'36px 24px', boxShadow:Sh.lg, maxWidth:400, width:'100%' }}>

            {/* Welcome back */}
            <div style={{ textAlign:'center', marginBottom:32 }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:C.blue, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:22, fontWeight:700, color:C.white, fontFamily:'Montserrat,sans-serif' }}>M</div>
              <h2 style={{ fontSize:22, fontWeight:700, color:C.darkBlue, margin:'0 0 4px', fontFamily:'Montserrat,sans-serif' }}>Welcome back</h2>
              <p style={{ fontSize:13, color:C.gray500, margin:0, fontFamily:'Montserrat,sans-serif' }}>{VENDOR.contact} · {VENDOR.name}</p>
            </div>

            {/* Biometric button */}
            {!showSMS && (
              <>
                <div style={{ textAlign:'center', marginBottom:24 }}>
                  <button onClick={handleBiometric} style={{ width:90, height:90, borderRadius:'50%', border:`2px solid ${biometricState==='done'?C.green:biometricState==='scanning'?C.blue:C.gray200}`, background: biometricState==='scanning'?C.blue50:biometricState==='done'?C.green50:C.gray50, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', margin:'0 auto', transition:'all 0.3s', boxShadow: biometricState==='scanning'?`0 0 0 8px ${C.blue50}`:biometricState==='done'?`0 0 0 8px ${C.green50}`:'none' }}>
                    {biometricState === 'done'
                      ? <Check size={40} color={C.green} strokeWidth={2.5}/>
                      : <FingerprintIcon size={44} color={biometricState==='scanning'?C.blue:C.gray400}/>}
                  </button>
                  <p style={{ fontSize:13, color: biometricState==='scanning'?C.blue:biometricState==='done'?C.green:C.gray600, margin:'14px 0 0', fontFamily:'Montserrat,sans-serif', fontWeight:600, transition:'color 0.3s' }}>
                    {biometricState==='scanning' ? 'Scanning…' : biometricState==='done' ? 'Authenticated ✓' : 'Use Face ID / Touch ID to sign in'}
                  </p>
                  {biometricState==='idle' && <p style={{ fontSize:11, color:C.gray400, margin:'4px 0 0', fontFamily:'Montserrat,sans-serif' }}>Tap the button to authenticate</p>}
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
                  <div style={{ flex:1, height:1, background:C.gray200 }}/>
                  <span style={{ fontSize:11, color:C.gray400, fontFamily:'Montserrat,sans-serif' }}>or</span>
                  <div style={{ flex:1, height:1, background:C.gray200 }}/>
                </div>

                <Btn onClick={()=>onApproveFlow(email)} variant="ghost" fullWidth>
                  <Mail size={15}/> Send me a secure link
                </Btn>

                <div style={{ textAlign:'center', marginTop:16 }}>
                  <button onClick={()=>setShowSMS(true)} style={{ background:'none', border:'none', fontSize:12, color:C.gray400, cursor:'pointer', fontFamily:'Montserrat,sans-serif', textDecoration:'underline' }}>
                    Using a new device? Verify with SMS instead
                  </button>
                </div>
              </>
            )}

            {/* SMS OTP fallback */}
            {showSMS && (
              <>
                <div style={{ background:C.blue50, border:`1px solid ${C.blue100}`, borderRadius:10, padding:'12px 15px', marginBottom:20, display:'flex', gap:10, alignItems:'flex-start' }}>
                  <Smartphone size={15} color={C.blue} style={{ flexShrink:0, marginTop:1 }}/>
                  <p style={{ fontSize:12, color:C.gray700, margin:0, lineHeight:1.6, fontFamily:'Montserrat,sans-serif' }}>We'll send a 6-digit code to the phone number on file ending in <strong>•• 3341</strong>.</p>
                </div>
                <label style={{ fontSize:12, fontWeight:600, color:C.gray700, display:'block', marginBottom:7, fontFamily:'Montserrat,sans-serif' }}>Enter 6-digit code</label>
                <input value={smsCode} onChange={e=>setSmsCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" inputMode="numeric"
                  style={{ width:'100%', border:`2px solid ${smsError?C.amber500:smsCode.length===6?C.green:C.gray300}`, borderRadius:9, padding:'12px 14px', fontSize:22, fontFamily:'monospace', textAlign:'center', letterSpacing:'0.25em', outline:'none', boxSizing:'border-box', marginBottom:14, transition:'border-color 0.2s' }}/>
                {smsError && <p style={{ fontSize:12, color:C.amber500, margin:'-8px 0 12px', fontFamily:'Montserrat,sans-serif' }}>Enter all 6 digits to continue.</p>}
                <Btn onClick={handleSMSVerify} fullWidth>Verify Code <ArrowRight size={15}/></Btn>
                <div style={{ textAlign:'center', marginTop:14 }}>
                  <button onClick={()=>setShowSMS(false)} style={{ background:'none', border:'none', fontSize:12, color:C.blue, cursor:'pointer', fontFamily:'Montserrat,sans-serif', fontWeight:600 }}>
                    ← Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <HelpFloat/>
      </div>
    );
  }

  // ── Desktop layout ───────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.blue50} 0%,${C.white} 60%)`, fontFamily:'Montserrat,sans-serif', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'0 32px', height:54, background:C.white, borderBottom:`1px solid ${C.gray200}`, boxShadow:Sh.sm, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Logo size="sm"/>
        <div style={{ fontSize:12, color:C.gray400, display:'flex', alignItems:'center', gap:5, fontFamily:'Montserrat,sans-serif' }}>
          <Lock size={12} color={C.gray400}/> 256-bit encrypted
        </div>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
        <div style={{ background:C.white, borderRadius:16, padding:'48px 44px', boxShadow:Sh.lg, maxWidth:420, width:'100%', position:'relative' }}>

          {/* OAuth loading overlay */}
          {oauthState && (
            <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.92)', borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:10, backdropFilter:'blur(2px)' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', border:`3px solid ${C.blue}`, borderTopColor:'transparent', marginBottom:18, animation:'spin 0.8s linear infinite' }}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ fontSize:14, fontWeight:600, color:C.darkBlue, margin:0, fontFamily:'Montserrat,sans-serif' }}>
                Signing you in with {oauthState === 'google' ? 'Google' : 'Microsoft'}…
              </p>
            </div>
          )}

          <div style={{ textAlign:'center', marginBottom:28 }}>
            <Logo size="md"/>
            <h2 style={{ fontSize:23, fontWeight:700, color:C.darkBlue, margin:'20px 0 4px', fontFamily:'Montserrat,sans-serif', letterSpacing:'-0.02em' }}>Welcome back</h2>
            <p style={{ fontSize:13, color:C.gray500, margin:0, fontFamily:'Montserrat,sans-serif' }}>
              {passkeyRegistered ? `${VENDOR.contact} · ${VENDOR.name}` : 'Sign in to your Vantaca Vendor account'}
            </p>
          </div>

          {/* Passkey sign-in — shown as primary when passkey registered on this device */}
          {passkeyRegistered && (
            <>
              <button onClick={handlePasskeySignIn} disabled={passkeyState !== 'idle'}
                style={{ width:'100%', background: passkeyState==='done' ? C.green : passkeyState==='scanning' ? C.blue50 : C.blue, border:`1.5px solid ${passkeyState==='done'?C.green:C.blue}`, borderRadius:10, padding:'13px 18px', fontSize:14, fontWeight:700, cursor: passkeyState!=='idle'?'default':'pointer', fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:10, color: passkeyState==='scanning'?C.blue:C.white, marginBottom:18, transition:'all 0.2s', boxShadow:Sh.sm }}>
                {passkeyState === 'done'
                  ? <><Check size={16} color={C.white} strokeWidth={3}/> Authenticated</>
                  : passkeyState === 'scanning'
                  ? <><div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${C.blue}`, borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}/> Authenticating…</>
                  : <><FingerprintIcon size={18} color={C.white}/> Sign in with Face ID, fingerprint, or PIN</>
                }
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
                <div style={{ flex:1, height:1, background:C.gray200 }}/>
                <span style={{ fontSize:11, color:C.gray400, fontFamily:'Montserrat,sans-serif' }}>or sign in another way</span>
                <div style={{ flex:1, height:1, background:C.gray200 }}/>
              </div>
            </>
          )}

          {/* OAuth buttons */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:22 }}>
            {(()=>{
              const [hovProvider, setHovProvider] = useState<string|null>(null);
              return ([
                { provider:'google'    as const, Icon:GoogleIcon,    label:'Continue with Google'    },
                { provider:'microsoft' as const, Icon:MicrosoftIcon, label:'Continue with Microsoft' },
              ].map(({ provider, Icon, label }) => {
                const hov = hovProvider === provider;
                return (
                  <button key={provider} onClick={()=>handleOAuth(provider)}
                    onMouseEnter={()=>setHovProvider(provider)} onMouseLeave={()=>setHovProvider(null)}
                    style={{ width:'100%', background:hov?C.gray50:C.white, border:`1.5px solid ${hov?C.gray300:C.gray200}`, borderRadius:10, padding:'12px 18px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:11, color:C.gray800, boxShadow:Sh.sm, transition:'all 0.15s' }}>
                    <Icon/> {label}
                  </button>
                );
              }));
            })()}
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:C.gray200 }}/>
            <span style={{ fontSize:12, color:C.gray400, fontFamily:'Montserrat,sans-serif', fontWeight:500 }}>or continue with email</span>
            <div style={{ flex:1, height:1, background:C.gray200 }}/>
          </div>

          {/* Email → approve-and-auto-advance */}
          <div style={{ marginBottom:8 }}>
            <label style={{ fontSize:12, fontWeight:600, color:C.gray700, display:'block', marginBottom:7, fontFamily:'Montserrat,sans-serif' }}>Email address</label>
            <input value={email} onChange={e=>setEmail(e.target.value)}
              style={{ width:'100%', border:`1.5px solid ${C.gray300}`, borderRadius:9, padding:'11px 14px', fontSize:14, fontFamily:'Montserrat,sans-serif', outline:'none', boxSizing:'border-box', color:C.gray900 }}
              onFocus={e=>{ e.currentTarget.style.borderColor = C.blue; }}
              onBlur={e=>{ e.currentTarget.style.borderColor = C.gray300; }}
            />
          </div>
          <Btn onClick={()=>onApproveFlow(email)} fullWidth>
            <Mail size={15}/> Send me a login link
          </Btn>

          {/* First time note */}
          <div style={{ marginTop:24, padding:'12px 14px', background:C.gray50, borderRadius:9, border:`1px solid ${C.gray100}` }}>
            <p style={{ fontSize:11, color:C.gray500, margin:0, lineHeight:1.65, fontFamily:'Montserrat,sans-serif' }}>
              <strong style={{ color:C.gray700 }}>First time here?</strong> You should have received an invite email from your management company. Use that link to get started — no login required.
            </p>
          </div>
        </div>
      </div>
      <HelpFloat/>
    </div>
  );
};

// ─── Return-Visit: Approve-and-Auto-Advance Screen ────────────
const ApproveWaitScreen: React.FC<{ email:string; onApproved:()=>void; onBack:()=>void }> = ({ email, onApproved, onBack }) => {
  const w = useWindowWidth();
  const isMobile = w < 768;
  const [dot, setDot]           = useState(0);
  const [approved, setApproved] = useState(false);
  const [resent, setResent]     = useState(false);

  // Animate the waiting dots
  useEffect(() => {
    const t = setInterval(() => setDot(d => (d+1) % 4), 500);
    return () => clearInterval(t);
  }, []);

  const handleSimulateApproval = () => {
    setApproved(true);
    setTimeout(onApproved, 900);
  };

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(160deg,${C.blue50} 0%,${C.white} 60%)`, fontFamily:'Montserrat,sans-serif', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'0 32px', height:54, background:C.white, borderBottom:`1px solid ${C.gray200}`, boxShadow:Sh.sm, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Logo size="sm"/>
        <div style={{ fontSize:12, color:C.gray400, display:'flex', alignItems:'center', gap:5, fontFamily:'Montserrat,sans-serif' }}>
          <Lock size={12} color={C.gray400}/> 256-bit encrypted
        </div>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:isMobile?'28px 20px':'40px 24px' }}>
        <div style={{ background:C.white, borderRadius:16, padding:isMobile?'36px 24px':'52px 48px', boxShadow:Sh.lg, maxWidth:460, width:'100%', textAlign:'center' }}>

          {/* Icon — switches from envelope to checkmark on approval */}
          <div style={{ width:76, height:76, borderRadius:'50%', background:approved?C.green50:C.blue50, border:`3px solid ${approved?C.green:C.blue}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', transition:'all 0.4s' }}>
            {approved
              ? <Check size={36} color={C.green} strokeWidth={2.5}/>
              : <Mail  size={34} color={C.blue}/>
            }
          </div>

          <h2 style={{ fontSize:isMobile?20:24, fontWeight:700, color:C.darkBlue, margin:'0 0 10px', letterSpacing:'-0.02em', fontFamily:'Montserrat,sans-serif' }}>
            {approved ? 'Login approved!' : 'Check your email'}
          </h2>

          {!approved ? (
            <>
              <p style={{ fontSize:14, color:C.gray600, margin:'0 0 6px', lineHeight:1.65, fontFamily:'Montserrat,sans-serif' }}>
                We sent a login approval to
              </p>
              <p style={{ fontSize:14, fontWeight:700, color:C.darkBlue, margin:'0 0 20px', fontFamily:'Montserrat,sans-serif' }}>{email}</p>
              <p style={{ fontSize:13, color:C.gray500, margin:'0 0 28px', lineHeight:1.7, fontFamily:'Montserrat,sans-serif' }}>
                Open the email and tap <strong style={{ color:C.darkBlue }}>"Approve this login"</strong> — this tab will update automatically. You do not need to come back here manually.
              </p>

              {/* How it works callout */}
              <div style={{ background:C.gray50, border:`1px solid ${C.gray100}`, borderRadius:10, padding:'14px 16px', marginBottom:28, textAlign:'left' }}>
                {[
                  { n:'1', text:'Open the email on any device — phone, laptop, or tablet' },
                  { n:'2', text:'Tap the blue "Approve this login" button' },
                  { n:'3', text:'This tab signs you in automatically — no navigation needed' },
                ].map((s,i)=>(
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:i<2?10:0 }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:C.blue, color:C.white, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'Montserrat,sans-serif' }}>{s.n}</div>
                    <span style={{ fontSize:12, color:C.gray600, lineHeight:1.55, fontFamily:'Montserrat,sans-serif', marginTop:2 }}>{s.text}</span>
                  </div>
                ))}
              </div>

              {/* Waiting indicator */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:24 }}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:C.blue, opacity: dot===i?1:dot===(i+1)%4?0.5:0.2, transition:'opacity 0.2s' }}/>
                ))}
                <span style={{ fontSize:12, color:C.gray400, marginLeft:8, fontFamily:'Montserrat,sans-serif' }}>Waiting for approval…</span>
              </div>

              {/* Demo simulate button */}
              <div style={{ background:'#FFF8E1', border:'1px solid #FFE082', borderRadius:9, padding:'12px 16px', marginBottom:20 }}>
                <p style={{ fontSize:11, color:'#78600A', margin:'0 0 10px', fontFamily:'Montserrat,sans-serif' }}>
                  <strong>DEMO ONLY</strong> — In production this advances automatically when the vendor clicks "Approve" in the email.
                </p>
                <button onClick={handleSimulateApproval}
                  style={{ background:'#F59E0B', color:C.white, border:'none', borderRadius:7, padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', gap:6, margin:'0 auto' }}>
                  <Check size={13}/> Simulate "Approve this login" tap
                </button>
              </div>

              {/* Utility links */}
              {/* NOTE: "Wrong email?" navigates back to restart the login flow with a new
                  email address. It does NOT change the email credential on an existing
                  account. Changing the login email is a sensitive action gated by PIN
                  re-entry and lives exclusively in Account Settings → Profile. */}
              <div style={{ display:'flex', justifyContent:'center', gap:20, flexWrap:'wrap' }}>
                <button onClick={handleResend} style={{ background:'none', border:'none', fontSize:12, color:resent?C.green:C.blue, cursor:'pointer', fontFamily:'Montserrat,sans-serif', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                  <RefreshCw size={13}/> {resent ? 'Sent!' : 'Resend email'}
                </button>
                <button onClick={onBack} style={{ background:'none', border:'none', fontSize:12, color:C.gray500, cursor:'pointer', fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', gap:4 }}>
                  <ChevronLeft size={13}/> Wrong email? Go back
                </button>
              </div>
            </>
          ) : (
            <p style={{ fontSize:14, color:C.gray600, margin:'0', lineHeight:1.65, fontFamily:'Montserrat,sans-serif' }}>
              Signing you in now…
            </p>
          )}
        </div>
      </div>
      <HelpFloat/>
    </div>
  );
};

// ─── Payment Notification Email (return-visit re-entry demo) ──
// This is the email a vendor receives after setup when a payment
// is processed. The "View in portal" CTA links to vendor.vantaca.com/login
// (the login screen) — this is Layer 1 of the re-entry strategy.
// All post-invite system emails follow this same pattern: portal URL
// in the header CTA and footer, never a session-scoped magic link.
const PaymentEmailScreen: React.FC<{ onViewPortal:()=>void; onPortalUrl:()=>void }> = ({ onViewPortal, onPortalUrl }) => {
  const w = useWindowWidth();
  const isMobile = w < 680;
  const [hov, setHov] = useState(false);

  const PAYMENT = {
    amount:   '$1,247.50',
    invoice:  'INV-2024-0891',
    mc:       VENDOR.mc,
    method:   'Digital Card',
    eta:      'Within 24 hours',
    date:     'April 7, 2026',
  };

  const otherEmails = [
    { from:'QuickBooks',   subj:'Invoice INV-8802 created',           time:'10:14 AM' },
    { from:'Chase Bank',   subj:'New transaction posted to account',  time:'Yesterday'},
    { from:'Sunrise HOA',  subj:'Re: April maintenance schedule',     time:'Apr 5'    },
  ];

  const EmailBody = () => (
    <div style={{ background:C.white, borderRadius:isMobile?12:'0 0 12px 12px', overflow:'hidden', boxShadow:Sh.card }}>
      {/* Dark header */}
      <div style={{ background:C.darkBlue, padding:'22px 32px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Logo size="lg" light />
      </div>

      {/* Green success stripe */}
      <div style={{ background:C.green, padding:'14px 32px', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
        <CheckCircle size={18} color={C.white} strokeWidth={2.5}/>
        <span style={{ color:C.white, fontWeight:700, fontSize:14, fontFamily:'Montserrat,sans-serif', letterSpacing:'0.01em' }}>
          A payment is on its way to you
        </span>
      </div>

      {/* Body */}
      <div style={{ padding:isMobile?'22px 18px':'30px 40px' }}>
        <p style={{ fontSize:15, color:C.gray900, margin:'0 0 16px', fontFamily:'Montserrat,sans-serif' }}>
          Hi <strong>{VENDOR.contact}</strong>,
        </p>
        <p style={{ fontSize:14, color:C.gray700, lineHeight:1.7, margin:'0 0 22px', fontFamily:'Montserrat,sans-serif' }}>
          <strong>{PAYMENT.mc}</strong> has approved a payment for your work. Here are the details:
        </p>

        {/* Payment summary card */}
        <div style={{ border:`1px solid ${C.gray200}`, borderRadius:12, overflow:'hidden', marginBottom:28 }}>
          <div style={{ background:C.gray50, padding:'11px 18px', borderBottom:`1px solid ${C.gray200}` }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.gray500, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:'Montserrat,sans-serif' }}>Payment Summary</span>
          </div>
          {[
            { label:'Amount',           val:PAYMENT.amount,  bold:true, large:true, color:C.green },
            { label:'Invoice',          val:PAYMENT.invoice, bold:false, large:false, color:C.gray900 },
            { label:'From',             val:PAYMENT.mc,      bold:false, large:false, color:C.gray900 },
            { label:'Payment method',   val:PAYMENT.method,  bold:false, large:false, color:C.gray900 },
            { label:'Estimated arrival',val:PAYMENT.eta,     bold:true,  large:false, color:C.darkBlue },
            { label:'Date approved',    val:PAYMENT.date,    bold:false, large:false, color:C.gray900 },
          ].map((r,i)=>(
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 18px', borderBottom:i<5?`1px solid ${C.gray100}`:'none', background:i===0?C.green50:'transparent' }}>
              <span style={{ fontSize:12, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>{r.label}</span>
              <span style={{ fontSize:r.large?18:13, fontWeight:r.bold?700:500, color:r.color, fontFamily:'Montserrat,sans-serif' }}>{r.val}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <button
            onClick={onViewPortal}
            onMouseEnter={()=>setHov(true)}
            onMouseLeave={()=>setHov(false)}
            style={{ background:hov?'#005585':C.blue, color:C.white, border:'none', borderRadius:10, padding:'14px 36px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', boxShadow:Sh.md, transition:'background 0.2s', display:'inline-flex', alignItems:'center', gap:10 }}>
            View payment in portal <ArrowRight size={17}/>
          </button>
          <div style={{ marginTop:9, fontSize:12, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>
            Or visit: <span style={{ color:C.blue, fontWeight:600, cursor:'pointer' }} onClick={onPortalUrl}>vendor.vantaca.com/login</span>
          </div>
        </div>

        {/* Info note */}
        <div style={{ background:C.blue50, border:`1px solid ${C.blue100}`, borderRadius:10, padding:'13px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
          <Bell size={14} color={C.blue} style={{ flexShrink:0, marginTop:1 }}/>
          <p style={{ fontSize:12, color:C.gray700, margin:0, lineHeight:1.65, fontFamily:'Montserrat,sans-serif' }}>
            You'll receive payment notifications to <strong>{VENDOR.email}</strong> for every approved invoice. To update your payment method or notification preferences, visit your portal at <span style={{ color:C.blue, fontWeight:600, cursor:'pointer' }} onClick={onPortalUrl}>vendor.vantaca.com/login</span>.
          </p>
        </div>
      </div>

      {/* Footer — stable URL always routes to login, never a magic link */}
      <div style={{ background:C.gray50, padding:'13px 32px', borderTop:`1px solid ${C.gray100}`, textAlign:'center', fontSize:11, color:C.gray400, lineHeight:1.8, fontFamily:'Montserrat,sans-serif' }}>
        © 2026 Vantaca Vendor ·{' '}
        <span style={{ color:C.blue, cursor:'pointer' }}>Privacy Policy</span> ·{' '}
        <span style={{ color:C.blue, cursor:'pointer' }}>Terms of Service</span><br/>
        Questions? Reply to this email and our support team will get back to you.<br/>
        <span style={{ color:C.blue, fontWeight:600, cursor:'pointer' }} onClick={onPortalUrl}>vendor.vantaca.com/login</span>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ minHeight:'100vh', background:'#EBEBEB', fontFamily:'Montserrat,sans-serif', padding:16 }}>
        <div style={{ background:C.white, borderRadius:'12px 12px 0 0', padding:'12px 16px', borderBottom:`1px solid ${C.gray100}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.gray900, marginBottom:3, fontFamily:'Montserrat,sans-serif' }}>Your payment from {PAYMENT.mc} is on its way</div>
          <div style={{ fontSize:11, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>From: Vantaca Vendor &lt;payments@vantacavendor.com&gt;</div>
          <div style={{ fontSize:11, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>To: {VENDOR.email}</div>
        </div>
        <EmailBody />
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#EBEBEB', fontFamily:'Montserrat,sans-serif' }}>
      {/* Mail chrome */}
      <div style={{ background:C.darkBlue, height:47, display:'flex', alignItems:'center', padding:'0 20px', gap:14 }}>
        <span style={{ color:C.white, fontWeight:700, fontSize:15, fontFamily:'Montserrat,sans-serif' }}>Mail</span>
        <div style={{ flex:1, background:'rgba(255,255,255,0.1)', borderRadius:7, height:27, display:'flex', alignItems:'center', padding:'0 12px' }}>
          <span style={{ color:'rgba(255,255,255,0.38)', fontSize:12, fontFamily:'Montserrat,sans-serif' }}>Search mail…</span>
        </div>
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 47px)' }}>
        {/* Nav */}
        <div style={{ width:168, background:C.white, borderRight:`1px solid ${C.gray200}`, padding:'12px 0', flexShrink:0 }}>
          {['Inbox (1)','Sent','Drafts','Spam','Trash'].map((item,i)=>(
            <div key={i} style={{ padding:'9px 14px', fontSize:12, color:i===0?C.blue:C.gray600, background:i===0?C.blue50:'transparent', fontWeight:i===0?700:400, cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}>{item}</div>
          ))}
        </div>

        {/* Email list */}
        <div style={{ width:270, borderRight:`1px solid ${C.gray200}`, background:C.white, overflow:'auto', flexShrink:0 }}>
          <div style={{ padding:'12px 13px', borderBottom:`2px solid ${C.green}`, background:C.green50, cursor:'pointer', borderLeft:`3px solid ${C.green}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.darkBlue, fontFamily:'Montserrat,sans-serif' }}>Vantaca Vendor</span>
              <span style={{ fontSize:11, color:C.gray400, fontFamily:'Montserrat,sans-serif' }}>9:42 AM</span>
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:C.gray900, marginBottom:3, lineHeight:1.4, fontFamily:'Montserrat,sans-serif' }}>
              Your payment from {PAYMENT.mc} is on its way
            </div>
            <div style={{ fontSize:11, color:C.gray500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'Montserrat,sans-serif' }}>
              {PAYMENT.amount} approved · {PAYMENT.invoice} · View in portal…
            </div>
          </div>
          {otherEmails.map((e,i)=>(
            <div key={i} style={{ padding:'10px 13px', borderBottom:`1px solid ${C.gray100}`, cursor:'pointer', opacity:0.58 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:12, fontWeight:600, color:C.gray800, fontFamily:'Montserrat,sans-serif' }}>{e.from}</span>
                <span style={{ fontSize:11, color:C.gray400, fontFamily:'Montserrat,sans-serif' }}>{e.time}</span>
              </div>
              <div style={{ fontSize:11, color:C.gray600, fontFamily:'Montserrat,sans-serif' }}>{e.subj}</div>
            </div>
          ))}
        </div>

        {/* Email body */}
        <div style={{ flex:1, background:'#F0F0F0', overflow:'auto', padding:'28px 36px' }}>
          <div style={{ maxWidth:580, margin:'0 auto' }}>
            <div style={{ background:C.white, borderRadius:'12px 12px 0 0', padding:'14px 24px', borderBottom:`1px solid ${C.gray100}` }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.gray900, marginBottom:5, fontFamily:'Montserrat,sans-serif' }}>
                Your payment from {PAYMENT.mc} is on its way
              </div>
              <div style={{ fontSize:12, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>From: Vantaca Vendor &lt;payments@vantacavendor.com&gt;</div>
              <div style={{ fontSize:12, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>To: {VENDOR.email}</div>
            </div>
            <EmailBody />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Post-Onboarding Portal Access Email (24-48h after setup) ─
// Sent to vendors who have completed onboarding but have no payment
// queued yet. Purpose: give them the portal link, confirm their
// setup, and invite them to review or update their preferences.
// CTA is a magic link — clicks straight into the dashboard.
const PostOnboardingEmailScreen: React.FC<{ onOpenPortal:()=>void; onPortalUrl:()=>void }> = ({ onOpenPortal, onPortalUrl }) => {
  const w = useWindowWidth();
  const isMobile = w < 680;
  const [hov, setHov] = useState(false);

  const otherEmails = [
    { from:'Vantaca Vendor', subj:'Set Up Your Vantaca Vendor Account', time:'Yesterday', read:true },
    { from:'QuickBooks',     subj:'Invoice INV-8801 is due soon',        time:'Apr 5',    read:true },
    { from:'Chase Bank',     subj:'March statement is ready',            time:'Apr 3',    read:true },
  ];

  const EmailBody = () => (
    <div style={{ background:C.white, borderRadius:isMobile?12:'0 0 12px 12px', overflow:'hidden', boxShadow:Sh.card }}>
      {/* Dark header */}
      <div style={{ background:C.darkBlue, padding:'22px 32px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Logo size="lg" light />
      </div>

      {/* Body */}
      <div style={{ padding:isMobile?'24px 18px':'32px 40px' }}>
        <p style={{ fontSize:15, color:C.gray900, margin:'0 0 14px', fontFamily:'Montserrat,sans-serif' }}>
          Hi <strong>{VENDOR.contact}</strong>,
        </p>
        <p style={{ fontSize:14, color:C.gray700, lineHeight:1.75, margin:'0 0 6px', fontFamily:'Montserrat,sans-serif' }}>
          Your Vantaca Vendor account is active and ready to receive payments. Here's a summary of what's set up:
        </p>

        {/* Account summary card */}
        <div style={{ border:`1px solid ${C.gray200}`, borderRadius:12, overflow:'hidden', margin:'20px 0 24px' }}>
          <div style={{ background:C.gray50, padding:'10px 18px', borderBottom:`1px solid ${C.gray200}` }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.gray500, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:'Montserrat,sans-serif' }}>Your Account Summary</span>
          </div>
          {[
            { label:'Business name',    val:VENDOR.name,                    icon:<Building2 size={13} color={C.gray400}/> },
            { label:'Payment method',   val:'Digital Card',                  icon:<CreditCard size={13} color={C.green}/> },
            { label:'Notifications to', val:VENDOR.email,                   icon:<Mail size={13} color={C.blue}/> },
            { label:'Covers',           val:'All management companies on Vantaca', icon:<Users size={13} color={C.blue}/> },
            { label:'Account status',   val:'Active',                        icon:<CheckCircle size={13} color={C.green}/> },
          ].map((r,i,arr)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 18px', borderBottom:i<arr.length-1?`1px solid ${C.gray100}`:'none', background:r.label==='Account status'?C.green50:'transparent' }}>
              <div style={{ flexShrink:0 }}>{r.icon}</div>
              <span style={{ fontSize:12, color:C.gray500, width:130, flexShrink:0, fontFamily:'Montserrat,sans-serif' }}>{r.label}</span>
              <span style={{ fontSize:13, fontWeight:r.label==='Account status'?700:500, color:r.label==='Account status'?C.green:C.gray900, fontFamily:'Montserrat,sans-serif' }}>{r.val}</span>
            </div>
          ))}
        </div>

        {/* What happens next */}
        <div style={{ background:C.blue50, border:`1px solid ${C.blue100}`, borderRadius:10, padding:'16px 18px', marginBottom:26 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.darkBlue, marginBottom:10, fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', gap:7 }}>
            <Clock size={13} color={C.blue}/> What happens next
          </div>
          {[
            'When Pacific Coast Property Management approves an invoice for your work, your payment will be sent automatically.',
            'You\'ll receive an email notification the moment it\'s processed — no follow-up needed on your end.',
            'Your Digital Card payment typically arrives within 24 hours of invoice approval.',
          ].map((t,i)=>(
            <div key={i} style={{ display:'flex', gap:9, alignItems:'flex-start', marginBottom:i<2?8:0 }}>
              <div style={{ width:18, height:18, borderRadius:'50%', background:C.blue, color:C.white, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, fontFamily:'Montserrat,sans-serif' }}>{i+1}</div>
              <span style={{ fontSize:13, color:C.gray700, lineHeight:1.6, fontFamily:'Montserrat,sans-serif' }}>{t}</span>
            </div>
          ))}
        </div>

        {/* CTA — magic link, goes straight to dashboard */}
        <div style={{ textAlign:'center', marginBottom:10 }}>
          <button
            onClick={onOpenPortal}
            onMouseEnter={()=>setHov(true)}
            onMouseLeave={()=>setHov(false)}
            style={{ background:hov?'#005585':C.blue, color:C.white, border:'none', borderRadius:10, padding:'14px 36px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', boxShadow:Sh.md, transition:'background 0.2s', display:'inline-flex', alignItems:'center', gap:10 }}>
            Go to My Portal <ArrowRight size={17}/>
          </button>
        </div>
        <p style={{ textAlign:'center', fontSize:12, color:C.gray400, margin:'8px 0 24px', fontFamily:'Montserrat,sans-serif' }}>
          This link signs you in automatically — no password needed.<br/>
          Or visit anytime: <span style={{ color:C.blue, fontWeight:600, cursor:'pointer' }} onClick={onPortalUrl}>vendor.vantaca.com/login</span>
        </p>

        {/* What you can do in the portal */}
        <div style={{ background:C.gray50, border:`1px solid ${C.gray100}`, borderRadius:10, padding:'16px 18px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.gray700, marginBottom:11, fontFamily:'Montserrat,sans-serif' }}>From your portal you can:</div>
          {[
            { icon:<DollarSign size={13} color={C.green}/>,   text:'View your payment history and upcoming payments' },
            { icon:<CreditCard size={13} color={C.blue}/>,    text:'Update your payment method at any time' },
            { icon:<Bell size={13} color={C.amber500}/>,      text:'Manage your notification preferences' },
            { icon:<Building2 size={13} color={C.gray500}/>,  text:'Review your business profile and billing address' },
          ].map((item,i)=>(
            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:i<3?9:0 }}>
              <div style={{ flexShrink:0, marginTop:1 }}>{item.icon}</div>
              <span style={{ fontSize:13, color:C.gray600, lineHeight:1.55, fontFamily:'Montserrat,sans-serif' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background:C.gray50, padding:'13px 32px', borderTop:`1px solid ${C.gray100}`, textAlign:'center', fontSize:11, color:C.gray400, lineHeight:1.8, fontFamily:'Montserrat,sans-serif' }}>
        © 2026 Vantaca Vendor ·{' '}
        <span style={{ color:C.blue, cursor:'pointer' }}>Privacy Policy</span> ·{' '}
        <span style={{ color:C.blue, cursor:'pointer' }}>Terms of Service</span><br/>
        Questions? Reply to this email and our support team will get back to you.<br/>
        <span style={{ color:C.gray400 }}>Your vendor portal: </span>
        <span style={{ color:C.blue, fontWeight:600, cursor:'pointer' }} onClick={onPortalUrl}>vendor.vantaca.com/login</span>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ minHeight:'100vh', background:'#EBEBEB', fontFamily:'Montserrat,sans-serif', padding:16 }}>
        <div style={{ background:C.white, borderRadius:'12px 12px 0 0', padding:'12px 16px', borderBottom:`1px solid ${C.gray100}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.gray900, marginBottom:3, fontFamily:'Montserrat,sans-serif' }}>Your Vantaca Vendor account is active</div>
          <div style={{ fontSize:11, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>From: Vantaca Vendor &lt;payments@vantacavendor.com&gt;</div>
          <div style={{ fontSize:11, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>To: {VENDOR.email}</div>
        </div>
        <EmailBody />
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#EBEBEB', fontFamily:'Montserrat,sans-serif' }}>
      {/* Mail chrome */}
      <div style={{ background:C.darkBlue, height:47, display:'flex', alignItems:'center', padding:'0 20px', gap:14 }}>
        <span style={{ color:C.white, fontWeight:700, fontSize:15, fontFamily:'Montserrat,sans-serif' }}>Mail</span>
        <div style={{ flex:1, background:'rgba(255,255,255,0.1)', borderRadius:7, height:27, display:'flex', alignItems:'center', padding:'0 12px' }}>
          <span style={{ color:'rgba(255,255,255,0.38)', fontSize:12, fontFamily:'Montserrat,sans-serif' }}>Search mail…</span>
        </div>
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 47px)' }}>
        {/* Nav */}
        <div style={{ width:168, background:C.white, borderRight:`1px solid ${C.gray200}`, padding:'12px 0', flexShrink:0 }}>
          {['Inbox (1)','Sent','Drafts','Spam','Trash'].map((item,i)=>(
            <div key={i} style={{ padding:'9px 14px', fontSize:12, color:i===0?C.blue:C.gray600, background:i===0?C.blue50:'transparent', fontWeight:i===0?700:400, cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}>{item}</div>
          ))}
        </div>

        {/* Email list — shows unread post-onboarding email at top, prior emails read/dimmed */}
        <div style={{ width:270, borderRight:`1px solid ${C.gray200}`, background:C.white, overflow:'auto', flexShrink:0 }}>
          {/* Unread — the post-onboarding portal access email */}
          <div style={{ padding:'12px 13px', borderBottom:`2px solid ${C.blue}`, background:C.blue50, cursor:'pointer', borderLeft:`3px solid ${C.blue}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.darkBlue, fontFamily:'Montserrat,sans-serif' }}>Vantaca Vendor</span>
              <span style={{ fontSize:11, color:C.gray400, fontFamily:'Montserrat,sans-serif' }}>8:05 AM</span>
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:C.gray900, marginBottom:3, lineHeight:1.4, fontFamily:'Montserrat,sans-serif' }}>Your Vantaca Vendor account is active</div>
            <div style={{ fontSize:11, color:C.gray500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'Montserrat,sans-serif' }}>Hi Marco, your account is set up and ready to receive payments…</div>
          </div>
          {/* Prior read emails */}
          {otherEmails.map((e,i)=>(
            <div key={i} style={{ padding:'10px 13px', borderBottom:`1px solid ${C.gray100}`, cursor:'pointer', opacity:0.5 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:12, fontWeight:500, color:C.gray700, fontFamily:'Montserrat,sans-serif' }}>{e.from}</span>
                <span style={{ fontSize:11, color:C.gray400, fontFamily:'Montserrat,sans-serif' }}>{e.time}</span>
              </div>
              <div style={{ fontSize:11, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>{e.subj}</div>
            </div>
          ))}
        </div>

        {/* Email body */}
        <div style={{ flex:1, background:'#F0F0F0', overflow:'auto', padding:'28px 36px' }}>
          <div style={{ maxWidth:580, margin:'0 auto' }}>
            <div style={{ background:C.white, borderRadius:'12px 12px 0 0', padding:'14px 24px', borderBottom:`1px solid ${C.gray100}` }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.gray900, marginBottom:5, fontFamily:'Montserrat,sans-serif' }}>
                Your Vantaca Vendor account is active
              </div>
              <div style={{ fontSize:12, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>From: Vantaca Vendor &lt;payments@vantacavendor.com&gt;</div>
              <div style={{ fontSize:12, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>To: {VENDOR.email}</div>
            </div>
            <EmailBody />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Screen 1: Email ──────────────────────────────────────────
const EmailScreen: React.FC<{ onNext:()=>void }> = ({ onNext }) => {
  const w = useWindowWidth();
  const isMobile = w < 680;
  const [hov, setHov] = useState(false);

  const otherEmails = [
    { from:'QuickBooks',  subj:'Invoice INV-8801 is due soon',    time:'11:30 AM' },
    { from:'Chase Bank',  subj:'March statement is ready',        time:'Yesterday'},
    { from:'Sunrise HOA', subj:'Re: March maintenance schedule',  time:'Apr 3'    },
  ];

  const EmailBody = () => (
    <div style={{ background:C.white, borderRadius:isMobile?12:'0 0 12px 12px', overflow:'hidden', boxShadow:Sh.card }}>
      {/* Dark header with logo */}
      <div style={{ background:C.darkBlue, padding:'22px 32px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Logo size="lg" light />
      </div>

      {/* Body */}
      <div style={{ padding:isMobile?'22px 18px':'30px 40px' }}>
        <p style={{ fontSize:15, color:C.gray900, margin:'0 0 12px', fontFamily:'Montserrat,sans-serif' }}>
          Hi <strong>{VENDOR.contact}</strong>,
        </p>
        <p style={{ fontSize:14, color:C.gray700, lineHeight:1.7, margin:'0 0 16px', fontFamily:'Montserrat,sans-serif' }}>
          <strong>{VENDOR.mc}</strong> uses <strong>Vantaca Vendor</strong> to process all vendor payments. To ensure your payments arrive without delay, take two minutes now to select your preferred payment method.
        </p>

        {/* Attribution signal — attributes pre-filled data to the MC */}
        <div style={{ background:C.blue50, border:`1px solid ${C.blue100}`, borderRadius:10, padding:'13px 16px', marginBottom:20 }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <div style={{ marginTop:2, flexShrink:0 }}><CheckCircle size={16} color={C.blue}/></div>
            <div style={{ fontSize:12, color:C.gray700, lineHeight:1.55, fontFamily:'Montserrat,sans-serif' }}>
              <strong>{VENDOR.mc}</strong> has provided your business details to Vantaca. To complete your setup, select your preferred payment method by clicking the button below.
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <button onClick={onNext} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
            style={{ background:hov?'#005585':C.blue, color:C.white, border:'none', borderRadius:10, padding:'15px 36px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', boxShadow:Sh.md, transition:'background 0.2s', display:'inline-flex', alignItems:'center', gap:10 }}>
            Set Up My Payment Preferences <ArrowRight size={17} />
          </button>
          <div style={{ marginTop:8, fontSize:11, color:C.gray400, fontFamily:'Montserrat,sans-serif' }}>Free · No password needed · Under 2 minutes · Change anytime</div>
        </div>

        {/* Benefits */}
        <div style={{ background:C.gray50, borderRadius:10, padding:'16px 20px', marginBottom:28, border:`1px solid ${C.gray100}` }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.gray600, marginBottom:12, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:'Montserrat,sans-serif' }}>Why set up now?</div>
          {[
            { icon:<Zap size={14} color={C.green}/>,     text:'Get paid the moment an invoice is approved — digital and bank transfer options available' },
            { icon:<Users size={14} color={C.blue}/>,    text:'One setup covers all your HOA management companies on Vantaca' },
            { icon:<Bell size={14} color={C.amber500}/>, text:'Receive real-time alerts the moment a payment is processed' },
          ].map((b,i)=>(
            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:i<2?10:0 }}>
              <div style={{ marginTop:2, flexShrink:0 }}>{b.icon}</div>
              <span style={{ fontSize:13, color:C.gray700, lineHeight:1.55, fontFamily:'Montserrat,sans-serif' }}>{b.text}</span>
            </div>
          ))}
        </div>

        {/* Step indicators */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
          {[{ n:'1', l:'Choose how\nto get paid' },{ n:'2', l:'Confirm your\ndetails' }].map((s,i)=>(
            <React.Fragment key={i}>
              <div style={{ textAlign:'center', width:110 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:C.blue, color:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, margin:'0 auto 8px', fontFamily:'Montserrat,sans-serif' }}>{s.n}</div>
                <div style={{ fontSize:11, color:C.gray600, lineHeight:1.45, fontFamily:'Montserrat,sans-serif', whiteSpace:'pre-line' }}>{s.l}</div>
              </div>
              {i===0 && <div style={{ width:40, height:2, background:C.gray200, margin:'0 8px', flexShrink:0, marginBottom:22 }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Footer */}
      {/* Footer — stable portal URL included from day one so vendors
          have a reference even before their first payment arrives.
          In production this href points to vendor.vantaca.com/login
          (the stable login page, not a session-scoped magic link). */}
      <div style={{ background:C.gray50, padding:'13px 32px', borderTop:`1px solid ${C.gray100}`, textAlign:'center', fontSize:11, color:C.gray400, lineHeight:1.8, fontFamily:'Montserrat,sans-serif' }}>
        © 2026 Vantaca Vendor ·{' '}
        <span style={{ color:C.blue, cursor:'pointer' }}>Privacy Policy</span> ·{' '}
        <span style={{ color:C.blue, cursor:'pointer' }}>Terms of Service</span><br/>
        Questions? Reply to this email and our support team will get back to you.<br/>
        <span style={{ color:C.gray400 }}>Your vendor portal: </span>
        <span style={{ color:C.blue, fontWeight:600, cursor:'pointer' }}>vendor.vantaca.com/login</span>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ minHeight:'100vh', background:'#EBEBEB', fontFamily:'Montserrat,sans-serif', padding:16 }}>
        <div style={{ background:C.white, borderRadius:'12px 12px 0 0', padding:'12px 16px', borderBottom:`1px solid ${C.gray100}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.gray900, marginBottom:3, fontFamily:'Montserrat,sans-serif' }}>Set Up Your Vantaca Vendor Account</div>
          <div style={{ fontSize:11, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>From: Vantaca Vendor &lt;payments@vantacavendor.com&gt;</div>
          <div style={{ fontSize:11, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>To: {VENDOR.email}</div>
        </div>
        <EmailBody />
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#EBEBEB', fontFamily:'Montserrat,sans-serif' }}>
      {/* Mail chrome */}
      <div style={{ background:C.darkBlue, height:47, display:'flex', alignItems:'center', padding:'0 20px', gap:14 }}>
        <span style={{ color:C.white, fontWeight:700, fontSize:15, fontFamily:'Montserrat,sans-serif' }}>Mail</span>
        <div style={{ flex:1, background:'rgba(255,255,255,0.1)', borderRadius:7, height:27, display:'flex', alignItems:'center', padding:'0 12px' }}>
          <span style={{ color:'rgba(255,255,255,0.38)', fontSize:12, fontFamily:'Montserrat,sans-serif' }}>Search mail…</span>
        </div>
      </div>

      <div style={{ display:'flex', height:'calc(100vh - 47px)' }}>
        {/* Nav */}
        <div style={{ width:168, background:C.white, borderRight:`1px solid ${C.gray200}`, padding:'12px 0', flexShrink:0 }}>
          {['Inbox (1)','Sent','Drafts','Spam','Trash'].map((item,i)=>(
            <div key={i} style={{ padding:'9px 14px', fontSize:12, color:i===0?C.blue:C.gray600, background:i===0?C.blue50:'transparent', fontWeight:i===0?700:400, cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}>{item}</div>
          ))}
        </div>

        {/* Email list */}
        <div style={{ width:270, borderRight:`1px solid ${C.gray200}`, background:C.white, overflow:'auto', flexShrink:0 }}>
          <div style={{ padding:'12px 13px', borderBottom:`2px solid ${C.blue}`, background:C.blue50, cursor:'pointer', borderLeft:`3px solid ${C.blue}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.darkBlue, fontFamily:'Montserrat,sans-serif' }}>Vantaca Vendor</span>
              <span style={{ fontSize:11, color:C.gray400, fontFamily:'Montserrat,sans-serif' }}>9:42 AM</span>
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:C.gray900, marginBottom:3, lineHeight:1.4, fontFamily:'Montserrat,sans-serif' }}>Set Up Your Vantaca Vendor Account</div>
            <div style={{ fontSize:11, color:C.gray500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'Montserrat,sans-serif' }}>Hi Marco, Pacific Coast Property Management uses Vantaca…</div>
          </div>
          {otherEmails.map((e,i)=>(
            <div key={i} style={{ padding:'10px 13px', borderBottom:`1px solid ${C.gray100}`, cursor:'pointer', opacity:0.58 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:12, fontWeight:600, color:C.gray800, fontFamily:'Montserrat,sans-serif' }}>{e.from}</span>
                <span style={{ fontSize:11, color:C.gray400, fontFamily:'Montserrat,sans-serif' }}>{e.time}</span>
              </div>
              <div style={{ fontSize:11, color:C.gray600, fontFamily:'Montserrat,sans-serif' }}>{e.subj}</div>
            </div>
          ))}
        </div>

        {/* Email body */}
        <div style={{ flex:1, background:'#F0F0F0', overflow:'auto', padding:'28px 36px' }}>
          <div style={{ maxWidth:580, margin:'0 auto' }}>
            {/* Email meta */}
            <div style={{ background:C.white, borderRadius:'12px 12px 0 0', padding:'14px 24px', borderBottom:`1px solid ${C.gray100}` }}>
              <div style={{ fontSize:15, fontWeight:700, color:C.gray900, marginBottom:4, fontFamily:'Montserrat,sans-serif' }}>Set Up Your Vantaca Vendor Account</div>
              <div style={{ fontSize:12, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>From: <strong>Vantaca Vendor</strong> &lt;payments@vantacavendor.com&gt;</div>
              <div style={{ fontSize:12, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>To: {VENDOR.email}</div>
            </div>
            <EmailBody />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Screen 2: Landing ────────────────────────────────────────
const LandingScreen: React.FC<{ onNext:()=>void }> = ({ onNext }) => {
  const w = useWindowWidth();
  const isMobile = w < 640;
  const [ready, setReady] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setReady(true),120); return()=>clearTimeout(t); },[]);

  return (
    <div style={{ minHeight:'100vh', background:`linear-gradient(150deg,${C.blue50} 0%,${C.white} 55%)`, fontFamily:'Montserrat,sans-serif', display:'flex', flexDirection:'column' }}>
      <TopBar />
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:isMobile?'24px 16px':'40px 24px' }}>
        <div style={{ background:C.white, borderRadius:16, padding:isMobile?'28px 20px':'44px 48px', boxShadow:Sh.lg, maxWidth:480, width:'100%', transform:ready?'translateY(0)':'translateY(20px)', opacity:ready?1:0, transition:'all 0.4s ease' }}>

          <h1 style={{ fontSize:isMobile?22:26, fontWeight:700, color:C.darkBlue, margin:'0 0 6px', letterSpacing:'-0.02em', fontFamily:'Montserrat,sans-serif' }}>
            Welcome, {VENDOR.contact} 👋
          </h1>
          <p style={{ fontSize:14, color:C.gray700, lineHeight:1.7, margin:'0 0 6px', fontFamily:'Montserrat,sans-serif' }}>
            <strong>{VENDOR.mc}</strong> has invited you to choose how you want to get paid for future invoices.
          </p>
          <p style={{ fontSize:13, color:C.gray500, lineHeight:1.7, margin:'0 0 20px', fontFamily:'Montserrat,sans-serif' }}>
            Set your preference once and every management company you work with on Vantaca will use it automatically — no repeat setup required.
          </p>

          {/* Attribution card — attributes pre-filled data to the MC */}
          <div style={{ background:C.blue50, border:`1px solid ${C.blue100}`, borderRadius:12, padding:'14px 17px', marginBottom:22 }}>
            <div style={{ display:'flex', gap:11, alignItems:'flex-start' }}>
              <div style={{ marginTop:2, flexShrink:0 }}><CheckCircle size={16} color={C.blue}/></div>
              <div style={{ fontSize:12, color:C.gray700, lineHeight:1.55, fontFamily:'Montserrat,sans-serif' }}>
                <strong>{VENDOR.mc}</strong> has provided your business details to Vantaca. To complete your setup, select your preferred payment method by clicking the button below.
              </div>
            </div>
          </div>

          <Btn onClick={onNext} fullWidth>
            Set Up My Payment Preferences <ArrowRight size={16} />
          </Btn>
        </div>
      </div>
      <HelpFloat />
    </div>
  );
};

// ─── Screen 3: Method Selection ───────────────────────────────
const MethodScreen: React.FC<{ onNext:(m:Method)=>void }> = ({ onNext }) => {
  const w = useWindowWidth();
  const isMobile = w < 640;
  const [sel, setSel] = useState<Method>('card');
  const [openFeeTooltip, setOpenFeeTooltip] = useState<Method|null>(null);


  const methods: {
    id:Method; icon:React.ReactNode; title:string; sub:string;
    speed:string; speedColor:string; speedBg:string;
    fee:string; feeColor:string; feeBg:string; feeInfo?:string;
    tag?:string; tagColor?:string; tagBg?:string; warning?:string;
  }[] = [
    { id:'card',    icon:<CreditCard size={20}/>, title:'Digital Card',           sub:'A virtual card is sent to your email the instant a payment is approved. Funds are available to be used immediately.',               speed:'Instant',           speedColor:C.green600, speedBg:C.green50,  fee:'Standard Processing Fee', feeColor:C.gray500,  feeBg:C.gray100, feeInfo:'This is a single-use card issued only for this invoice. It must be processed through your merchant system.', tag:'FASTEST · RECOMMENDED', tagColor:C.green600, tagBg:C.green50 },
    { id:'sameday', icon:<Zap size={20}/>,        title:'Same-Day Bank Transfer', sub:'Funds deposited directly into your bank account by the end of the same business day.',                                             speed:'Same business day', speedColor:'#7C3AED',  speedBg:'#F5F3FF',  fee:'1% fee · max $25',        feeColor:C.gray500,  feeBg:C.gray100,  tag:'Fast',                  tagColor:'#7C3AED',  tagBg:'#F5F3FF'  },
    { id:'check',   icon:<Truck size={20}/>,      title:'Paper Check',            sub:'A physical check mailed to your address on file. Subject to postal delays.',                                                       speed:'7–10 business days',speedColor:C.gray500,  speedBg:C.gray100,  fee:'No fee',                  feeColor:C.gray500,  feeBg:C.gray100, warning:'Slowest option. Postal delays may apply.' },
    { id:'ach',     icon:<Landmark size={20}/>,   title:'Standard Bank Transfer', sub:'Free ACH deposit to your bank — a reliable option that clears in a few business days.',                                           speed:'4–5 business days', speedColor:C.gray600,  speedBg:C.gray100,  fee:'No fee',                  feeColor:C.gray500,  feeBg:C.gray100 },
  ];

  return (
    <div style={{ minHeight:'100vh', background:C.gray50, fontFamily:'Montserrat,sans-serif', display:'flex', flexDirection:'column' }}>
      <TopBar />
      <div style={{ flex:1, display:'flex', justifyContent:'center', padding:isMobile?'20px 14px':'36px 24px' }}>
        <div style={{ maxWidth:580, width:'100%' }}>
          <Progress step={1} total={2} />
          <h2 style={{ fontSize:isMobile?20:23, fontWeight:700, color:C.darkBlue, margin:'0 0 6px', letterSpacing:'-0.02em', fontFamily:'Montserrat,sans-serif' }}>How would you like to get paid?</h2>
          <p style={{ fontSize:13, color:C.gray500, margin:'0 0 22px', fontFamily:'Montserrat,sans-serif' }}>This preference applies to all management company accounts on Vantaca. You can update it anytime from Settings.</p>

          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:26 }}>
            {methods.map(m => {
              const isSelected = sel===m.id;
              return (
                <div key={m.id} onClick={()=>setSel(m.id)}
                  style={{ background:C.white, borderRadius:12, border:`2px solid ${isSelected?C.blue:C.gray200}`, padding:isMobile?'13px 13px':'16px 18px', cursor:'pointer', boxShadow:isSelected?`0 0 0 3px ${C.blue50}`:Sh.sm, transition:'all 0.15s', display:'flex', alignItems:'flex-start', gap:13 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:isSelected?C.blue50:C.gray100, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:isSelected?C.blue:C.gray500, transition:'background 0.15s', marginTop:2 }}>
                    {m.icon}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:700, color:isSelected?C.darkBlue:C.gray800, fontFamily:'Montserrat,sans-serif' }}>{m.title}</span>
                      {m.tag && <span style={{ background:m.tagBg, color:m.tagColor, borderRadius:6, padding:'2px 8px', fontSize:10, fontWeight:700, fontFamily:'Montserrat,sans-serif', letterSpacing:'0.03em' }}>{m.tag}</span>}
                    </div>
                    <p style={{ fontSize:12, color:C.gray500, margin:'0 0 8px', lineHeight:1.55, fontFamily:'Montserrat,sans-serif' }}>{m.sub}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                      <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:m.speedBg, borderRadius:6, padding:'3px 9px' }}>
                        <Clock size={11} color={m.speedColor}/>
                        <span style={{ fontSize:11, fontWeight:600, color:m.speedColor, fontFamily:'Montserrat,sans-serif' }}>{m.speed}</span>
                      </div>
                      <div
                        style={{ position:'relative', display:'inline-flex', alignItems:'center' }}
                        onMouseEnter={()=>m.feeInfo ? setOpenFeeTooltip(m.id) : undefined}
                        onMouseLeave={()=>setOpenFeeTooltip(null)}>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:m.feeBg, borderRadius:6, padding:'3px 9px' }}>
                          <span style={{ fontSize:11, fontWeight:600, color:m.feeColor, fontFamily:'Montserrat,sans-serif' }}>{m.fee}</span>
                          {m.feeInfo && (
                            <div style={{ display:'inline-flex', alignItems:'center', marginLeft:2 }}>
                              <HelpCircle size={11} color={m.feeColor}/>
                            </div>
                          )}
                        </div>
                        {openFeeTooltip===m.id && m.feeInfo && (
                          <div style={{ position:'absolute', bottom:'calc(100% + 6px)', left:0, background:C.gray900, color:C.white, fontSize:11, padding:'8px 11px', borderRadius:7, width:220, zIndex:20, lineHeight:1.55, fontFamily:'Montserrat,sans-serif', boxShadow:'0 4px 12px rgba(0,0,0,0.25)' }}>
                            {m.feeInfo}
                            <div style={{ position:'absolute', top:'100%', left:14, width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:`5px solid ${C.gray900}` }}/>
                          </div>
                        )}
                      </div>
                    </div>
                    {m.warning && isSelected && (
                      <div style={{ display:'flex', gap:5, alignItems:'center', marginTop:8 }}>
                        <AlertCircle size={12} color={C.amber500}/>
                        <span style={{ fontSize:11, color:C.amber500, fontFamily:'Montserrat,sans-serif' }}>{m.warning}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${isSelected?C.blue:C.gray300}`, background:isSelected?C.blue:C.white, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:4, transition:'all 0.15s' }}>
                    {isSelected && <Check size={11} color={C.white} strokeWidth={3}/>}
                  </div>
                </div>
              );
            })}
          </div>
          <Btn onClick={()=>onNext(sel)} fullWidth>Continue <ArrowRight size={16}/></Btn>
        </div>
      </div>
      <HelpFloat />
    </div>
  );
};

// ─── Screen 4: Details (selected method only, bank lookup) ────
const DetailsScreen: React.FC<{ method:Method; onNext:()=>void; onBack:()=>void }> = ({ method, onNext, onBack }) => {
  const w = useWindowWidth();
  const isMobile = w < 640;
  const [editEmail, setEditEmail] = useState(false);
  const [emailVal,  setEmailVal]  = useState(VENDOR.email);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [editAddr, setEditAddr] = useState(false);

  // OTP identity verification gate — required before any payment field edit
  const [otpTarget, setOtpTarget]     = useState<null|'email'|'bankDetails'|'address'>(null);
  const [otpCode, setOtpCode]         = useState('');
  const [otpError, setOtpError]       = useState(false);
  const [otpVerified, setOtpVerified] = useState(false); // persists for entire session once cleared

  // Bank field edit state — routing + account open together, single save
  const [editBankDetails, setEditBankDetails] = useState(false);
  const [routingVal,      setRoutingVal]       = useState(VENDOR.routing);
  const [accountVal,      setAccountVal]       = useState(VENDOR.account);
  // Live routing lookup — resolves in real time as vendor types
  const resolvedBank = ROUTING_BANKS[routingVal] ?? (routingVal.length === 9 ? 'Routing number not found' : null);

  // USPS address validation state (MOCK_USPS is module-level)
  const [addrStreet, setAddrStreet] = useState('2847 Oak Grove Ave');
  const [addrCity,   setAddrCity]   = useState('Walnut Creek');
  const [addrState,  setAddrState]  = useState('CA');
  const [addrZip,    setAddrZip]    = useState('94597');

  // USPS modal — 'checking' shows a brief spinner before the suggestion surfaces
  const [uspsState, setUspsState] = useState<'idle'|'checking'|'suggestion'|'confirmed'>('idle');
  const [uspsChoice, setUspsChoice] = useState<'entered'|'usps'>('usps');

  // Silent background USPS check — fires on mount when method is 'check'.
  // Shows amber banner (vendor initiates modal); never interrupts automatically.
  const [silentSuggestion, setSilentSuggestion] = useState(false);
  useEffect(() => {
    if (method !== 'check') return;
    const timer = setTimeout(() => setSilentSuggestion(true), 1800);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Gate: show OTP modal if not yet verified; skip directly to edit if already cleared this session
  const requestEdit = (target: 'email'|'bankDetails'|'address') => {
    if (otpVerified) { activateEdit(target); }
    else { setOtpTarget(target); setOtpCode(''); setOtpError(false); }
  };
  const activateEdit = (target: 'email'|'bankDetails'|'address') => {
    if (target === 'email')       setEditEmail(true);
    if (target === 'bankDetails') setEditBankDetails(true);
    if (target === 'address')     setEditAddr(true);
  };
  const handleOtpVerify = () => {
    if (otpCode.length === 6) {
      setOtpVerified(true);
      const t = otpTarget!;
      setOtpTarget(null);
      activateEdit(t);
    } else {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 1800);
    }
  };

  const labels: Record<Method,string> = { card:'Digital Card', sameday:'Same-Day Bank Transfer', ach:'Standard Bank Transfer', check:'Paper Check' };

  const InfoBox: React.FC<{ bg:string; border:string; icon:React.ReactNode; title:string; body:string }> = ({ bg,border,icon,title,body }) => (
    <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:10, padding:'12px 16px', marginBottom:18, display:'flex', gap:11, alignItems:'flex-start' }}>
      <div style={{ flexShrink:0, marginTop:2 }}>{icon}</div>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:C.darkBlue, marginBottom:3, fontFamily:'Montserrat,sans-serif' }}>{title}</div>
        <div style={{ fontSize:12, color:C.gray600, lineHeight:1.6, fontFamily:'Montserrat,sans-serif' }}>{body}</div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(method) {
      case 'card': return (
        <>
          {/* Mock Visa card illustration */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
            <div style={{
              width: isMobile ? 280 : 320,
              height: isMobile ? 176 : 202,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${C.darkBlue} 0%, #1a5276 55%, #00679B 100%)`,
              boxShadow: '0 8px 24px rgba(16,24,40,0.22), 0 2px 6px rgba(16,24,40,0.14)',
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              {/* Decorative circles */}
              <div style={{ position:'absolute', top:-28, right:-28, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }}/>
              <div style={{ position:'absolute', top:20, right:20, width:72, height:72, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}/>

              {/* Top row: chip + Visa */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative', zIndex:1 }}>
                {/* EMV chip */}
                <div style={{ width:36, height:28, borderRadius:5, background:'linear-gradient(135deg,#d4a843 0%,#f0cb6a 40%,#c8952a 100%)', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }}/>
                {/* Visa wordmark */}
                <div style={{ fontSize: isMobile?20:23, fontWeight:900, color:C.white, fontFamily:'serif', letterSpacing:'0.01em', lineHeight:1, textShadow:'0 1px 2px rgba(0,0,0,0.3)', fontStyle:'italic' }}>VISA</div>
              </div>

              {/* PAN */}
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ fontSize: isMobile?15:17, fontWeight:600, color:'rgba(255,255,255,0.92)', fontFamily:'monospace', letterSpacing:'0.18em' }}>
                  •••• &nbsp;•••• &nbsp;•••• &nbsp;1234
                </div>
              </div>

              {/* Bottom row: name + expiry */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', position:'relative', zIndex:1 }}>
                <div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)', fontFamily:'Montserrat,sans-serif', letterSpacing:'0.08em', marginBottom:3, textTransform:'uppercase' }}>Card Holder</div>
                  <div style={{ fontSize: isMobile?11:12, fontWeight:700, color:C.white, fontFamily:'Montserrat,sans-serif', letterSpacing:'0.06em', textTransform:'uppercase' }}>
                    {VENDOR.contact.toUpperCase()}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.5)', fontFamily:'Montserrat,sans-serif', letterSpacing:'0.08em', marginBottom:3, textTransform:'uppercase' }}>Expires</div>
                  <div style={{ fontSize: isMobile?11:12, fontWeight:700, color:C.white, fontFamily:'Montserrat,sans-serif', letterSpacing:'0.1em' }}>••/••</div>
                </div>
              </div>
            </div>
          </div>

          <InfoBox bg={C.blue50} border={C.blue100} icon={<CreditCard size={17} color={C.blue}/>}
            title="How digital cards work"
            body="When a payment is approved, a virtual card like the one above is sent to the email below. Funds are available to be used immediately — no waiting period." />
          <p style={{ fontSize:12, color:C.gray500, margin:'0 0 8px', fontFamily:'Montserrat,sans-serif' }}>Your information is pre-filled. Verify it's correct before confirming.</p>
          <label style={{ fontSize:12, fontWeight:600, color:C.gray700, display:'block', marginBottom:6, fontFamily:'Montserrat,sans-serif' }}>Card delivery email</label>
          {editEmail
            ? <input value={emailVal} onChange={e=>setEmailVal(e.target.value)} autoFocus
                style={{ width:'100%', border:`2px solid ${C.blue}`, borderRadius:8, padding:'10px 12px', fontSize:13, fontFamily:'Montserrat,sans-serif', outline:'none', boxSizing:'border-box', marginBottom:10 }}/>
            : <div style={{ border:`1px solid ${C.gray200}`, borderRadius:8, padding:'10px 14px', background:C.gray50, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:9, minWidth:0 }}>
                  <Mail size={14} color={C.gray400}/><span style={{ fontSize:13, color:C.gray800, fontFamily:'Montserrat,sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emailVal}</span><CheckCircle size={13} color={C.green}/>
                </div>
                <button onClick={()=>requestEdit('email')} style={{ background:'none', border:'none', cursor:'pointer', color:C.blue, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:3, fontFamily:'Montserrat,sans-serif', flexShrink:0 }}>
                  <Edit2 size={12}/> Edit
                </button>
              </div>}
          {editEmail && <button onClick={()=>setEditEmail(false)} style={{ background:C.blue50, color:C.blue, border:'none', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif', marginBottom:8 }}>Save</button>}
        </>
      );
      case 'sameday':
      case 'ach': return (
        <>
          {/* ── Bank Account Preview ────────────────────────────────────── */}
          <div style={{ borderLeft:`3px solid ${C.blue}`, background:C.white, borderRadius:'0 10px 10px 0', padding:'16px 20px', marginBottom:20, boxShadow:Sh.sm }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:C.blue50, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Landmark size={20} color={C.blue}/>
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:700, color: resolvedBank && resolvedBank !== 'Routing number not found' ? C.darkBlue : C.gray400, fontFamily:'Montserrat,sans-serif', transition:'color 0.2s' }}>
                  {resolvedBank && resolvedBank !== 'Routing number not found' ? resolvedBank : 'Your Bank'}
                </div>
                <div style={{ fontSize:12, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>
                  Direct Deposit
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ flex:1, background:C.gray50, borderRadius:8, padding:'8px 12px' }}>
                <div style={{ fontSize:9, color:C.gray400, fontFamily:'Montserrat,sans-serif', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:3 }}>Routing</div>
                <div style={{ fontSize:13, fontWeight:600, color:C.gray800, fontFamily:'monospace' }}>•••••{VENDOR.routing.slice(-4)}</div>
              </div>
              <div style={{ flex:1, background:C.gray50, borderRadius:8, padding:'8px 12px' }}>
                <div style={{ fontSize:9, color:C.gray400, fontFamily:'Montserrat,sans-serif', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:3 }}>Account</div>
                <div style={{ fontSize:13, fontWeight:600, color:C.gray800, fontFamily:'monospace' }}>••••••{VENDOR.account.slice(-4)}</div>
              </div>
            </div>
          </div>

          {/* ── Trust signal + InfoBox ──────────────────────────────────── */}
          <InfoBox bg={C.green50} border={C.green100} icon={<Shield size={17} color={C.green}/>}
            title="Your bank details are pre-filled"
            body={`Pre-filled from your records with ${VENDOR.mc}. Verify they're still accurate — a single digit difference can cause a payment return.`} />

          {/* ── Routing + Account — linked edit (single Save) ──────────── */}
          {editBankDetails ? (
            <>
              <div style={{ marginBottom:13 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.gray700, display:'block', marginBottom:6, fontFamily:'Montserrat,sans-serif' }}>Routing Number</label>
                <input
                  value={routingVal}
                  onChange={e => setRoutingVal(e.target.value.replace(/\D/g,'').slice(0,9))}
                  inputMode="numeric"
                  autoFocus
                  maxLength={9}
                  placeholder="9-digit routing number"
                  style={{ width:'100%', border:`2px solid ${C.blue}`, borderRadius:8, padding:'10px 12px', fontSize:14, fontFamily:'monospace', outline:'none', boxSizing:'border-box', marginBottom:6 }}
                />
                {routingVal.length > 0 && routingVal.length < 9 && (
                  <div style={{ fontSize:12, color:C.gray400, fontFamily:'Montserrat,sans-serif', marginBottom:6 }}>Enter all 9 digits to look up your bank</div>
                )}
                {routingVal.length === 9 && resolvedBank && resolvedBank !== 'Routing number not found' && (
                  <div style={{ background:C.green50, border:`1px solid ${C.green100}`, borderRadius:8, padding:'9px 13px', marginBottom:8, display:'flex', alignItems:'center', gap:9 }}>
                    <CheckCircle size={14} color={C.green} style={{ flexShrink:0 }}/>
                    <span style={{ fontSize:13, fontWeight:600, color:C.green600, fontFamily:'Montserrat,sans-serif' }}>{resolvedBank}</span>
                  </div>
                )}
                {routingVal.length === 9 && resolvedBank === 'Routing number not found' && (
                  <div style={{ background:C.amber50, border:`1px solid ${C.amber100}`, borderRadius:8, padding:'9px 13px', marginBottom:8, display:'flex', alignItems:'center', gap:9 }}>
                    <AlertCircle size={14} color={C.amber500} style={{ flexShrink:0 }}/>
                    <span style={{ fontSize:12, color:'#92400E', fontFamily:'Montserrat,sans-serif' }}>Routing number not found. Please verify and re-enter.</span>
                  </div>
                )}
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.gray700, display:'block', marginBottom:6, fontFamily:'Montserrat,sans-serif' }}>Account Number</label>
                <input value={accountVal} onChange={e=>setAccountVal(e.target.value.replace(/\D/g,'').slice(0,17))} inputMode="numeric"
                  style={{ width:'100%', border:`2px solid ${C.blue}`, borderRadius:8, padding:'10px 12px', fontSize:14, fontFamily:'monospace', outline:'none', boxSizing:'border-box' }}/>
              </div>
              <button onClick={()=>setEditBankDetails(false)} style={{ background:C.blue, color:C.white, border:'none', borderRadius:8, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', marginBottom:4 }}>Save changes</button>
            </>
          ) : (
            <>
              <div style={{ border:`1px solid ${C.gray200}`, borderRadius:10, background:C.gray50, overflow:'hidden', marginBottom:6 }}>
                {/* Routing row */}
                <div style={{ padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${C.gray200}` }}>
                  <div>
                    <div style={{ fontSize:10, color:C.gray400, fontFamily:'Montserrat,sans-serif', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:2 }}>Routing Number</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:13, color:C.gray800, fontFamily:'monospace' }}>{showBankDetails ? routingVal : VENDOR.routingMask}</span>
                      <CheckCircle size={12} color={C.green}/>
                    </div>
                  </div>
                </div>
                {/* Account row */}
                <div style={{ padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:10, color:C.gray400, fontFamily:'Montserrat,sans-serif', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:2 }}>Account Number</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:13, color:C.gray800, fontFamily:'monospace' }}>{showBankDetails ? accountVal : VENDOR.accountMask}</span>
                      <CheckCircle size={12} color={C.green}/>
                    </div>
                  </div>
                </div>
              </div>
              {/* Combined reveal + edit row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:9 }}>
                <button onClick={()=>setShowBankDetails(!showBankDetails)} style={{ background:'none', border:'none', cursor:'pointer', color:C.gray500, fontSize:12, fontWeight:500, display:'flex', alignItems:'center', gap:4, fontFamily:'Montserrat,sans-serif', padding:'4px 0' }}>
                  {showBankDetails ? <><EyeOff size={12}/> Hide account details</> : <><Eye size={12}/> Show account details</>}
                </button>
                <button onClick={()=>requestEdit('bankDetails')} style={{ background:'none', border:'none', cursor:'pointer', color:C.blue, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4, fontFamily:'Montserrat,sans-serif', padding:'4px 0' }}>
                  <Edit2 size={12}/> Edit
                </button>
              </div>
            </>
          )}
        </>
      );
      case 'check': return (
        <>
          {/* Paper Check Mockup — Grasshopper Bank format */}
          {(() => {
            const today = new Date();
            const issued = today.toLocaleDateString('en-US',{ month:'2-digit', day:'2-digit', year:'numeric' });
            const valid  = new Date(today.setMonth(today.getMonth()+6)).toLocaleDateString('en-US',{ month:'2-digit', day:'2-digit', year:'numeric' });
            const CHECK_NAVY  = '#1B2B6B';   // text colour only
            const CHECK_STRIP = '#374151';   // security strip bg — charcoal gray, not navy
            const CHECK_BG    = '#F7F6F2';
            const MICR_ROUTING = '000000000';   // dummy — not a real routing number
            const MICR_ACCOUNT = '000000000000'; // dummy account
            return (
              <div style={{ marginBottom:20 }}>
                <div style={{ border:`2px solid #6B7280`, borderRadius:4, overflow:'hidden', background:CHECK_BG, display:'flex', flexDirection:'column' }}>

                  {/* Top security strip */}
                  <div style={{ background:CHECK_STRIP, padding:'5px 14px', textAlign:'center' }}>
                    <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.9)', fontFamily:'monospace', letterSpacing:'0.05em', textTransform:'uppercase' }}>
                      THE FACE OF THIS CHECK HAS A SECURITY VOID BACKGROUND PATTERN — DO NOT CASH IF THE VOID IS VISIBLE.
                    </span>
                  </div>

                  {/* Check body + right security strip */}
                  <div style={{ display:'flex', flex:1 }}>
                    {/* Main check area */}
                    <div style={{ flex:1, padding:'14px 18px 10px' }}>

                      {/* Row 1: Issuer | Bank | Check number */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:CHECK_NAVY, fontFamily:'Montserrat,sans-serif', maxWidth:'32%', lineHeight:1.4 }}>
                          {VENDOR.mc}
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:12, fontWeight:700, color:CHECK_NAVY, fontFamily:'Montserrat,sans-serif' }}>Grasshopper Bank</div>
                          <div style={{ fontSize:10, color:'#4A5568', fontFamily:'Montserrat,sans-serif' }}>New York, NY</div>
                        </div>
                        <div style={{ textAlign:'right', fontFamily:'Montserrat,sans-serif', lineHeight:1.7 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:CHECK_NAVY }}>5053</div>
                          <div style={{ fontSize:10, color:'#4A5568' }}>Issued on: {issued}</div>
                          <div style={{ fontSize:10, color:'#4A5568' }}>Valid until: {valid}</div>
                        </div>
                      </div>

                      {/* Row 2: PAY */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:800, color:CHECK_NAVY, fontFamily:'Montserrat,sans-serif', marginBottom:4, letterSpacing:'0.04em' }}>PAY</div>
                          <div style={{ fontSize:10.5, color:'#4A5568', fontFamily:'Montserrat,sans-serif', fontStyle:'italic' }}>Amount confirmed at payment approval</div>
                        </div>
                        <div style={{ border:`2px solid ${CHECK_NAVY}`, borderRadius:3, padding:'5px 18px', minWidth:110, textAlign:'center', background:'rgba(255,255,255,0.5)' }}>
                          <span style={{ fontSize:15, fontWeight:700, color:'#6B7280', fontFamily:'Montserrat,sans-serif' }}>$ —</span>
                        </div>
                      </div>

                      {/* Row 3: TO THE ORDER OF */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:10 }}>
                        <div>
                          <div style={{ fontSize:9, fontWeight:800, color:CHECK_NAVY, fontFamily:'Montserrat,sans-serif', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>TO THE ORDER OF</div>
                          <div style={{ fontSize:13, fontWeight:700, color:CHECK_NAVY, fontFamily:'Montserrat,sans-serif' }}>{VENDOR.name}</div>
                        </div>
                        <div style={{ textAlign:'right', borderTop:`1.5px solid #6B7280`, paddingTop:4, minWidth:160 }}>
                          <div style={{ fontSize:13, color:CHECK_NAVY, fontFamily:'Georgia,serif', fontStyle:'italic' }}>No Signature Required</div>
                        </div>
                      </div>

                      {/* Memo */}
                      <div style={{ fontSize:9.5, color:'#4A5568', fontFamily:'Montserrat,sans-serif', textAlign:'center' }}>
                        <strong>Memo:</strong> Account No: {MICR_ACCOUNT}
                      </div>
                    </div>

                    {/* Right security strip — rotated text */}
                    <div style={{ width:18, background:CHECK_STRIP, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:7, color:'rgba(255,255,255,0.7)', fontFamily:'monospace', letterSpacing:'0.04em', transform:'rotate(90deg)', whiteSpace:'nowrap' }}>
                        SECURITY FEATURES · DETAILS ON BACK
                      </span>
                    </div>
                  </div>

                  {/* Bottom security strip — two columns */}
                  <div style={{ background:CHECK_STRIP, padding:'5px 14px', display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.9)', fontFamily:'monospace', letterSpacing:'0.04em' }}>
                      THE ORIGINAL DOCUMENT HAS A REFLECTIVE WATERMARK ON THE BACK.
                    </span>
                    <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.9)', fontFamily:'monospace', letterSpacing:'0.04em' }}>
                      HOLD AT AN ANGLE TO VIEW WHEN CHECKING THE ENDORSEMENT.
                    </span>
                  </div>
                </div>

                {/* MICR line — dummy numbers only, never real bank/account data */}
                <div style={{ padding:'7px 10px 0', fontSize:12, color:'#4A5568', fontFamily:'monospace', letterSpacing:'0.15em', textAlign:'center' }}>
                  ⑆{MICR_ROUTING}⑆ &nbsp;⑈{MICR_ACCOUNT}⑈ &nbsp;0005053⑇
                </div>
              </div>
            );
          })()}

          <InfoBox bg={C.gray50} border={C.gray200} icon={<MapPin size={17} color={C.blue}/>}
            title="Your mailing address on file"
            body="Checks will be mailed to the address below. We automatically verify it against USPS records — getting this right means no delays on your first payment." />

          {/* Check Mailing Address label */}
          <label style={{ fontSize:12, fontWeight:600, color:C.gray700, display:'block', marginBottom:6, fontFamily:'Montserrat,sans-serif' }}>Check Mailing Address</label>

          {!editAddr ? (
            <>
              <div style={{ border:`1px solid ${C.gray200}`, borderRadius:10, padding:'14px 16px', background:C.gray50, marginBottom:14, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, color:C.gray700, fontFamily:'Montserrat,sans-serif' }}>
                    {uspsChoice === 'usps' && uspsState === 'confirmed'
                      ? `${MOCK_USPS.street}, ${MOCK_USPS.city}, ${MOCK_USPS.state} ${MOCK_USPS.zip}`
                      : `${addrStreet}, ${addrCity}, ${addrState} ${addrZip}`}
                  </div>
                </div>
                <button onClick={()=>requestEdit('address')} style={{ background:'none', border:'none', cursor:'pointer', color:C.blue, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:3, fontFamily:'Montserrat,sans-serif', flexShrink:0, padding:0 }}>
                  <Edit2 size={12}/> Edit
                </button>
              </div>
              {/* Silent USPS spinner — shown briefly before suggestion modal appears */}
              {uspsState === 'checking' && (
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:C.gray500, fontFamily:'Montserrat,sans-serif', marginBottom:12 }}>
                  <RefreshCw size={13} color={C.blue} style={{ animation:'spin 1s linear infinite' }}/>
                  Verifying address with USPS...
                </div>
              )}

              {/* USPS banner — appears after silent check finds a mismatch; vendor initiates modal */}
              {silentSuggestion && uspsState !== 'confirmed' && uspsState !== 'suggestion' && uspsState !== 'checking' && (
                <div style={{ background:'#FFFBEB', border:`1px solid ${C.amber100}`, borderRadius:10, padding:'12px 15px', marginBottom:14, display:'flex', gap:12, alignItems:'flex-start' }}>
                  <MapPin size={16} color={C.amber500} style={{ flexShrink:0, marginTop:1 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#92400E', marginBottom:3, fontFamily:'Montserrat,sans-serif' }}>
                      A USPS-verified address is available
                    </div>
                    <div style={{ fontSize:12, color:'#B45309', lineHeight:1.55, marginBottom:9, fontFamily:'Montserrat,sans-serif' }}>
                      We found a USPS-verified version of your address. Review it to help ensure your check is delivered on time.
                    </div>
                    <button
                      onClick={()=>setUspsState('suggestion')}
                      style={{ background:C.amber500, color:C.white, border:'none', borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', gap:6 }}
                    >
                      <MapPin size={12}/> Review USPS Suggestion
                    </button>
                  </div>
                </div>
              )}

              <button onClick={onNext} style={{ width:'100%', background:C.blue, color:C.white, border:'none', borderRadius:9, padding:'12px 16px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                <Check size={14}/> This looks right
              </button>
            </>
          ) : (
            <>
              {([
                { lbl:'Street Address', val:addrStreet, set:setAddrStreet },
                { lbl:'City',           val:addrCity,   set:setAddrCity   },
                { lbl:'State',          val:addrState,  set:setAddrState  },
                { lbl:'ZIP Code',       val:addrZip,    set:setAddrZip    },
              ]).map((f,i)=>(
                <div key={i} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:C.gray600, display:'block', marginBottom:5, fontFamily:'Montserrat,sans-serif' }}>{f.lbl}</label>
                  <input
                    value={f.val}
                    onChange={e=>f.set(e.target.value)}
                    style={{ width:'100%', border:`1px solid ${C.gray300}`, borderRadius:8, padding:'10px 12px', fontSize:14, fontFamily:'Montserrat,sans-serif', outline:'none', boxSizing:'border-box' }}
                  />
                </div>
              ))}
              <button
                onClick={()=>{
                  // Trigger inline USPS validation on save
                  setEditAddr(false);
                  setUspsState('checking');
                  setTimeout(()=>{
                    const entered = `${addrStreet}, ${addrCity}, ${addrState} ${addrZip}`;
                    const usps = `${MOCK_USPS.street}, ${MOCK_USPS.city}, ${MOCK_USPS.state} ${MOCK_USPS.zip}`;
                    if (entered.trim() !== usps.trim()) {
                      setUspsState('suggestion');
                      setUspsChoice('usps'); // default to USPS suggestion
                    } else {
                      setUspsState('confirmed');
                    }
                  }, 1400);
                }}
                style={{ background:C.blue50, color:C.blue, border:'none', borderRadius:8, padding:'8px 15px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}
              >
                Save address
              </button>
            </>
          )}
        </>
      );
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:C.gray50, fontFamily:'Montserrat,sans-serif', display:'flex', flexDirection:'column' }}>
      <TopBar />
      <div style={{ flex:1, display:'flex', justifyContent:'center', padding:isMobile?'18px 14px':'34px 24px' }}>
        <div style={{ maxWidth:560, width:'100%' }}>
          <Progress step={2} total={2} />
          <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.blue, fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:4, marginBottom:15, padding:0, fontFamily:'Montserrat,sans-serif' }}>
            <ChevronLeft size={15}/> Back
          </button>
          <h2 style={{ fontSize:isMobile?20:22, fontWeight:700, color:C.darkBlue, margin:'0 0 6px', letterSpacing:'-0.02em', fontFamily:'Montserrat,sans-serif' }}>
            Confirm your payment details
          </h2>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:C.blue50, borderRadius:7, padding:'4px 12px', border:`1px solid ${C.blue100}` }}>
              <CreditCard size={12} color={C.blue}/>
              <span style={{ fontSize:12, fontWeight:600, color:C.blue, fontFamily:'Montserrat,sans-serif' }}>{labels[method]}</span>
            </div>
            {method === 'sameday' && (
              <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:C.gray100, borderRadius:6, padding:'3px 9px' }}>
                <span style={{ fontSize:11, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>1% fee · max $25 per transaction</span>
              </div>
            )}
          </div>
          {renderContent()}
          {method !== 'check' && (
            <div style={{ marginTop:20 }}>
              <Btn onClick={onNext} variant="green" fullWidth><Check size={15}/> Confirm &amp; Complete Setup</Btn>
            </div>
          )}
        </div>
      </div>
      <HelpFloat />

      {/* ── USPS Address Suggestion Modal ──────────────────────────── */}
      {uspsState === 'suggestion' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', zIndex:601, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(3px)' }}>
          <div style={{ background:C.white, borderRadius:16, padding:'32px 28px', maxWidth:440, width:'100%', boxShadow:Sh.lg }}>

            {/* Icon */}
            <div style={{ width:52, height:52, borderRadius:'50%', background:C.blue50, border:`2px solid ${C.blue100}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <MapPin size={22} color={C.blue}/>
            </div>

            {/* Heading */}
            <h3 style={{ fontSize:17, fontWeight:700, color:C.darkBlue, margin:'0 0 8px', textAlign:'center', fontFamily:'Montserrat,sans-serif' }}>
              We found a USPS-verified address
            </h3>
            <p style={{ fontSize:12, color:C.gray500, lineHeight:1.65, textAlign:'center', margin:'0 0 22px', fontFamily:'Montserrat,sans-serif' }}>
              To ensure your check arrives on time, we recommend using the USPS standardised address below. Select the version you'd like to use.
            </p>

            {/* Radio option: USPS recommended */}
            <label style={{ display:'block', border:`2px solid ${uspsChoice==='usps' ? C.blue : C.gray200}`, borderRadius:10, padding:'14px 16px', marginBottom:10, cursor:'pointer', transition:'border-color 0.15s', background: uspsChoice==='usps' ? C.blue50 : C.white }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <input
                  type="radio"
                  name="usps-choice"
                  value="usps"
                  checked={uspsChoice==='usps'}
                  onChange={()=>setUspsChoice('usps')}
                  style={{ marginTop:3, accentColor:C.blue, width:16, height:16, flexShrink:0 }}
                />
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:C.blue, fontFamily:'Montserrat,sans-serif', textTransform:'uppercase', letterSpacing:'0.05em' }}>USPS Recommended</span>
                    <span style={{ background:C.green50, color:C.green600, fontSize:10, fontWeight:700, borderRadius:4, padding:'2px 7px', fontFamily:'Montserrat,sans-serif', border:`1px solid ${C.green100}` }}>VERIFIED</span>
                  </div>
                  <div style={{ fontSize:13, color:C.gray800, fontFamily:'Montserrat,sans-serif', lineHeight:1.5 }}>
                    {MOCK_USPS.street}<br/>
                    {MOCK_USPS.city}, {MOCK_USPS.state} {MOCK_USPS.zip}
                  </div>
                </div>
              </div>
            </label>

            {/* Radio option: what the vendor entered */}
            <label style={{ display:'block', border:`2px solid ${uspsChoice==='entered' ? C.blue : C.gray200}`, borderRadius:10, padding:'14px 16px', marginBottom:22, cursor:'pointer', transition:'border-color 0.15s', background: uspsChoice==='entered' ? C.blue50 : C.white }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <input
                  type="radio"
                  name="usps-choice"
                  value="entered"
                  checked={uspsChoice==='entered'}
                  onChange={()=>setUspsChoice('entered')}
                  style={{ marginTop:3, accentColor:C.blue, width:16, height:16, flexShrink:0 }}
                />
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.gray600, fontFamily:'Montserrat,sans-serif', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>What I entered</div>
                  <div style={{ fontSize:13, color:C.gray800, fontFamily:'Montserrat,sans-serif', lineHeight:1.5 }}>
                    {addrStreet}<br/>
                    {addrCity}, {addrState} {addrZip}
                  </div>
                </div>
              </div>
            </label>

            {/* Confirm CTA */}
            <Btn onClick={()=>{ setUspsState('confirmed'); setSilentSuggestion(false); }} variant="green" fullWidth>
              <Check size={14}/> Use This Address
            </Btn>
            <div style={{ textAlign:'center', marginTop:12 }}>
              <button
                onClick={()=>{ setEditAddr(true); setUspsState('idle'); }}
                style={{ background:'none', border:'none', fontSize:12, color:C.blue, cursor:'pointer', fontFamily:'Montserrat,sans-serif', fontWeight:600 }}
              >
                Edit address again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── OTP Identity Verification Modal ────────────────────────── */}
      {otpTarget && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(3px)' }}>
          <div style={{ background:C.white, borderRadius:16, padding:'36px 32px', maxWidth:420, width:'100%', boxShadow:Sh.lg, position:'relative' }}>

            {/* Icon */}
            <div style={{ width:56, height:56, borderRadius:'50%', background:C.blue50, border:`2px solid ${C.blue100}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
              <Lock size={24} color={C.blue}/>
            </div>

            {/* Heading */}
            <h3 style={{ fontSize:18, fontWeight:700, color:C.darkBlue, margin:'0 0 10px', textAlign:'center', fontFamily:'Montserrat,sans-serif' }}>
              Verify Your Identity
            </h3>

            {/* Security rationale — clear, professional, vendor-facing */}
            <p style={{ fontSize:13, color:C.gray600, lineHeight:1.65, textAlign:'center', margin:'0 0 6px', fontFamily:'Montserrat,sans-serif' }}>
              To protect your account, we require email verification before any changes can be made to your payment information.
            </p>
            <p style={{ fontSize:12, color:C.gray500, lineHeight:1.65, textAlign:'center', margin:'0 0 20px', fontFamily:'Montserrat,sans-serif' }}>
              Because you accessed this portal via a secure magic link, this step confirms that only you — the verified account holder — can modify sensitive payment details.
            </p>

            {/* Email badge */}
            <div style={{ background:C.blue50, border:`1px solid ${C.blue100}`, borderRadius:8, padding:'9px 14px', marginBottom:20, display:'flex', alignItems:'center', gap:9 }}>
              <Mail size={14} color={C.blue} style={{ flexShrink:0 }}/>
              <span style={{ fontSize:13, color:C.blue, fontWeight:600, fontFamily:'Montserrat,sans-serif', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {VENDOR.email}
              </span>
            </div>

            {/* OTP input */}
            <label style={{ fontSize:12, fontWeight:600, color:C.gray700, display:'block', marginBottom:7, fontFamily:'Montserrat,sans-serif' }}>
              Enter the 6-digit verification code sent to your email
            </label>
            <input
              value={otpCode}
              onChange={e=>setOtpCode(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="000000"
              inputMode="numeric"
              autoFocus
              style={{ width:'100%', border:`2px solid ${otpError ? C.amber500 : otpCode.length===6 ? C.green : C.gray300}`, borderRadius:9, padding:'12px 14px', fontSize:24, fontFamily:'monospace', textAlign:'center', letterSpacing:'0.3em', outline:'none', boxSizing:'border-box', marginBottom:6, transition:'border-color 0.2s' }}
            />
            {otpError && (
              <p style={{ fontSize:12, color:C.amber500, margin:'0 0 10px', fontFamily:'Montserrat,sans-serif' }}>
                Please enter all 6 digits to continue.
              </p>
            )}

            {/* Primary CTA */}
            <div style={{ marginBottom:14 }}>
              <Btn onClick={handleOtpVerify} variant="green" fullWidth>
                <Lock size={14}/> Verify &amp; Continue
              </Btn>
            </div>

            {/* Secondary actions */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <button
                onClick={()=>{ /* mock resend — no-op in prototype */ }}
                style={{ background:'none', border:'none', fontSize:12, color:C.blue, cursor:'pointer', fontFamily:'Montserrat,sans-serif', fontWeight:600, padding:0 }}
              >
                Didn't receive a code? Resend
              </button>
              <button
                onClick={()=>{ setOtpTarget(null); setOtpCode(''); }}
                style={{ background:'none', border:'none', fontSize:12, color:C.gray500, cursor:'pointer', fontFamily:'Montserrat,sans-serif', padding:0 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Toggle Switch ────────────────────────────────────────────
const Toggle: React.FC<{ checked:boolean; onChange:(v:boolean)=>void }> = ({ checked, onChange }) => (
  <div
    onClick={()=>onChange(!checked)}
    role="switch"
    aria-checked={checked}
    style={{
      width:44, height:24, borderRadius:12, flexShrink:0,
      background:checked ? C.green : C.gray300,
      position:'relative', cursor:'pointer',
      transition:'background 0.22s ease',
    }}
  >
    <div style={{
      position:'absolute', top:3,
      left:checked ? 23 : 3,
      width:18, height:18, borderRadius:'50%',
      background:C.white, boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
      transition:'left 0.22s ease',
    }}/>
  </div>
);

// ─── Confirm Modal (appears on top of Dashboard) ─────────────
const ConfirmModal: React.FC<{ method:Method; onClose:()=>void }> = ({ method, onClose }) => {
  const w = useWindowWidth();
  const isMobile = w < 640;
  const [ready, setReady] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setReady(true),80); return()=>clearTimeout(t); },[]);
  const labels: Record<Method,string> = { card:'Digital Card', sameday:'Same-Day Bank Transfer', ach:'Standard Bank Transfer', check:'Paper Check' };
  const isCheck = method === 'check';
  // 4-row summary: name + DBA removed (MC-provided, no verification value).
  // Address label is context-aware: paper check shows mailing address label.
  // Phone is last so the SMS card flows naturally from it.
  const rows = [
    { icon:<Home      size={13} color={C.gray400}/>, label: isCheck ? 'Check mailing address' : 'Business address', val:VENDOR.address },
    { icon:<CreditCard size={13} color={C.gray400}/>,label:'Payment method',   val:labels[method] },
    { icon:<Mail      size={13} color={C.gray400}/>, label:'Notifications',    val:VENDOR.email   },
    { icon:<Phone     size={13} color={C.gray400}/>, label:'Phone',            val:VENDOR.phone   },
  ];
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:isMobile?'16px':'24px', backdropFilter:'blur(2px)' }}>
      <div style={{ background:C.white, borderRadius:16, padding:isMobile?'28px 20px':'40px 38px', maxWidth:480, width:'100%', boxShadow:Sh.lg, transform:ready?'scale(1)':'scale(0.96)', opacity:ready?1:0, transition:'all 0.3s ease', position:'relative', maxHeight:'90vh', overflowY:'auto' }}>

        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:C.gray100, border:'none', borderRadius:'50%', width:29, height:29, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <X size={14} color={C.gray500}/>
        </button>

        <div style={{ width:62, height:62, borderRadius:'50%', background:C.green50, border:`3px solid ${C.green}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <Check size={30} color={C.green} strokeWidth={2.5}/>
        </div>

        <h2 style={{ fontSize:isMobile?20:22, fontWeight:700, color:C.darkBlue, margin:'0 0 6px', textAlign:'center', letterSpacing:'-0.02em', fontFamily:'Montserrat,sans-serif' }}>
          You're all set! 🎉
        </h2>
        <p style={{ fontSize:14, color:C.gray600, margin:'0 0 5px', textAlign:'center', lineHeight:1.65, fontFamily:'Montserrat,sans-serif' }}>
          Your payment preference has been saved as <strong>{labels[method]}</strong>.
        </p>
        <p style={{ fontSize:13, color:C.gray500, margin:'0 0 22px', textAlign:'center', lineHeight:1.65, fontFamily:'Montserrat,sans-serif' }}>
          This applies to all management companies that pay you through Vantaca — no further setup required.
        </p>

        {/* Summary */}
        <div style={{ background:C.gray50, borderRadius:12, padding:'16px', marginBottom:14 }}>
          {rows.map((r,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:i<rows.length-1?10:0 }}>
              <div style={{ flexShrink:0, marginTop:1 }}>{r.icon}</div>
              <span style={{ fontSize:12, color:C.gray500, width:112, flexShrink:0, fontFamily:'Montserrat,sans-serif' }}>{r.label}</span>
              <span style={{ fontSize:12, fontWeight:600, color:C.gray900, fontFamily:'Montserrat,sans-serif', wordBreak:'break-word' }}>{r.val}</span>
            </div>
          ))}
        </div>

        {/* SMS Opt-In Consent — feature invitation card */}
        {VENDOR.phone && (
          <div style={{
            borderRadius:12,
            border:`1.5px solid ${smsConsent ? C.green : '#86EFAC'}`,
            background: smsConsent ? '#DCFCE7' : '#F0FDF4',
            boxShadow:`0 2px 10px rgba(100,178,75,${smsConsent ? '0.22' : '0.10'})`,
            overflow:'hidden',
            marginBottom:16,
            transition:'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
          }}>
            {/* Card header strip */}
            <div style={{ background:smsConsent ? C.green : C.darkBlue, padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'background 0.25s ease' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Bell size={14} color={C.white}/>
                <span style={{ fontSize:12, fontWeight:700, color:C.white, fontFamily:'Montserrat,sans-serif', letterSpacing:'0.01em' }}>
                  Get instant payment alerts
                </span>
              </div>
              <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.75)', background:'rgba(255,255,255,0.18)', borderRadius:20, padding:'2px 8px', fontFamily:'Montserrat,sans-serif', letterSpacing:'0.03em' }}>
                RECOMMENDED
              </span>
            </div>
            {/* Card body */}
            <div style={{ padding:'12px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:10 }}>
                <span style={{ fontSize:13, color:C.gray700, fontFamily:'Montserrat,sans-serif', lineHeight:1.5 }}>
                  We'll text <strong>{VENDOR.phone}</strong> with payment confirmations, account updates, and more.
                </span>
                <Toggle checked={smsConsent} onChange={setSmsConsent}/>
              </div>
              <p style={{ fontSize:10, color:C.gray500, margin:0, lineHeight:1.65, fontFamily:'Montserrat,sans-serif' }}>
                Recurring automated SMS from Vantaca including payment alerts and promotions. Msg &amp; data rates may apply. Reply HELP for help, STOP to opt out. Consent not required for service.{' '}
                <a href="https://www.vantaca.com/privacy-policy" target="_blank" rel="noreferrer" style={{ color:C.blue, textDecoration:'underline' }}>Privacy Policy</a>
              </p>
            </div>
          </div>
        )}

        {/* One-liner footer — replaces heavy blue disclaimer box */}
        <p style={{ fontSize:11, color:C.gray400, textAlign:'center', margin:'0 0 16px', lineHeight:1.6, fontFamily:'Montserrat,sans-serif' }}>
          Business name and other details can be updated in{' '}
          <strong style={{ color:C.gray500, fontWeight:600 }}>Account Settings → Profile</strong>
        </p>

        <Btn onClick={()=>{ console.log('SMS consent:', smsConsent); onClose(); }} variant="green" fullWidth>
          <Check size={14}/> Go to My Dashboard
        </Btn>
      </div>
    </div>
  );
};

// ─── Screen 5: Dashboard (empty state + modal) ────────────────
const DashboardScreen: React.FC<{ showModal:boolean; method:Method; onCloseModal:()=>void; hasActiveSession?:boolean; passkeyRegistered?:boolean; onPasskeyRegister?:()=>void; onSignOut?:()=>void; isExistingVendor?:boolean }> = ({ showModal, method, onCloseModal, hasActiveSession=false, passkeyRegistered=false, onPasskeyRegister, onSignOut, isExistingVendor=false }) => {
  const w = useWindowWidth();
  const isMobile = w < 768;
  const [nav, setNav] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Welcome-back toast — shown for 3s when vendor returns via saved session
  const [showWelcomeBack, setShowWelcomeBack] = useState(hasActiveSession);
  useEffect(() => {
    if (!hasActiveSession) return;
    const t = setTimeout(() => setShowWelcomeBack(false), 3200);
    return () => clearTimeout(t);
  }, [hasActiveSession]);

  // Passkey setup card + mock browser dialog
  const [showPasskeyCard,  setShowPasskeyCard]  = useState(!passkeyRegistered && !hasActiveSession);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkeySetupDone, setPasskeySetupDone] = useState(false);
  const handlePasskeyCreate = () => {
    setTimeout(() => setPasskeySetupDone(true), 900);
  };

  // SMS consent modal — for existing vendors (post-CAI retroactive consent)
  const [showSmsModal,       setShowSmsModal]       = useState(isExistingVendor);
  const [smsModalConsent,    setSmsModalConsent]    = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

  // Layer 2 re-entry: first-session "save your access" banner.
  // Shown until vendor explicitly dismisses. In production, persist
  // dismissal to localStorage so it does not reappear on the same device.
  const [showAccessBanner, setShowAccessBanner] = useState(true);
  const [copied, setCopied] = useState(false);
  const PORTAL_URL = 'vendor.vantaca.com';
  const handleCopy = () => {
    navigator.clipboard.writeText('https://' + PORTAL_URL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const navItems = [
    { id:'dashboard', label:'Dashboard',        icon:<LayoutDashboard size={16}/> },
    { id:'payments',  label:'Payments',         icon:<DollarSign size={16}/>      },
    { id:'invoices',  label:'Invoices',         icon:<FileText size={16}/>        },
    { id:'account',   label:'Account Settings', icon:<Settings size={16}/>        },
  ];

  const SidebarContent = () => (
    <>
      <div style={{ padding:'18px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <Logo size="sm" light />
      </div>
      <nav style={{ padding:'8px 0', flex:1 }}>
        {navItems.map(item=>(
          <div key={item.id} onClick={()=>{ setNav(item.id); setDrawerOpen(false); }}
            style={{ padding:'10px 16px', cursor:'pointer', background:nav===item.id?'rgba(0,103,155,0.35)':'transparent', borderLeft:nav===item.id?`3px solid ${C.blue100}`:'3px solid transparent', display:'flex', alignItems:'center', gap:10, transition:'all 0.15s' }}>
            <span style={{ color:nav===item.id?C.blue100:'rgba(255,255,255,0.4)' }}>{item.icon}</span>
            <span style={{ fontSize:13, fontWeight:nav===item.id?600:400, color:nav===item.id?C.white:'rgba(255,255,255,0.5)', fontFamily:'Montserrat,sans-serif' }}>{item.label}</span>
          </div>
        ))}
      </nav>
      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:C.blue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:C.white, flexShrink:0 }}>M</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.white, fontFamily:'Montserrat,sans-serif' }}>{VENDOR.contact}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:'Montserrat,sans-serif' }}>{VENDOR.name}</div>
        </div>
        {onSignOut && (
          <button onClick={onSignOut} title="Sign out"
            style={{ background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', alignItems:'center', opacity:0.4, flexShrink:0 }}
            onMouseEnter={e=>(e.currentTarget.style.opacity='1')}
            onMouseLeave={e=>(e.currentTarget.style.opacity='0.4')}>
            <LogOut size={13} color={C.white}/>
          </button>
        )}
      </div>
    </>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.gray50, fontFamily:'Montserrat,sans-serif', display:'flex', position:'relative' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <div style={{ width:210, background:C.darkBlue, display:'flex', flexDirection:'column', flexShrink:0 }}>
          <SidebarContent />
        </div>
      )}
      {/* Mobile drawer */}
      {isMobile && drawerOpen && (
        <>
          <div onClick={()=>setDrawerOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:300 }}/>
          <div style={{ position:'fixed', top:0, left:0, bottom:0, width:218, background:C.darkBlue, zIndex:301, display:'flex', flexDirection:'column' }}>
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main */}
      <div style={{ flex:1, overflow:'auto', minWidth:0 }}>
        {/* Header */}
        <div style={{ background:C.white, padding:'0 20px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${C.gray200}`, boxShadow:Sh.sm }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {isMobile && (
              <button onClick={()=>setDrawerOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', padding:'4px 2px', display:'flex', flexDirection:'column', gap:4 }}>
                {[18,14,18].map((w,i)=><div key={i} style={{ width:w, height:2, background:C.gray600, borderRadius:1 }}/>)}
              </button>
            )}
            <div style={{ fontSize:12, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>
              Vantaca Vendor <ChevronRight size={12} style={{ verticalAlign:'middle' }}/> <strong style={{ color:C.gray900 }}>Dashboard</strong>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Bell size={16} color={C.gray400} style={{ cursor:'pointer' }}/>
            <div style={{ width:28, height:28, borderRadius:'50%', background:C.blue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:C.white, cursor:'pointer' }}>M</div>
          </div>
        </div>

        {/* ── Welcome-back toast (shown for 3s on session return) ── */}
        {showWelcomeBack && (
          <div style={{ background:C.green50, borderBottom:`1px solid ${C.green100}`, padding:isMobile?'10px 14px':'9px 24px', display:'flex', alignItems:'center', gap:10 }}>
            <CheckCircle size={15} color={C.green} style={{ flexShrink:0 }}/>
            <span style={{ fontSize:12, fontWeight:600, color:'#166534', fontFamily:'Montserrat,sans-serif', flex:1 }}>
              Welcome back, {VENDOR.contact}. You're signed in on this device.
            </span>
            <button onClick={()=>setShowWelcomeBack(false)}
              style={{ background:'none', border:'none', cursor:'pointer', padding:2, display:'flex', alignItems:'center', flexShrink:0 }}>
              <X size={13} color='#166534'/>
            </button>
          </div>
        )}

        {/* ── Save-your-access banner (Layer 2 re-entry) ── */}
        {/* Shown for the entire first session. Vendor may have arrived via
            magic link and never had a chance to note the portal URL.
            In production: dismiss state persisted to localStorage so it
            does not reappear on subsequent visits from the same device. */}
        {showAccessBanner && (
          <div style={{ background:'#FFFBEB', borderBottom:`1px solid ${C.amber100}`, padding:isMobile?'12px 14px':'11px 24px', display:'flex', alignItems:isMobile?'flex-start':'center', gap:isMobile?10:14, flexDirection:isMobile?'column':'row', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:C.amber100, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Star size={15} color={C.amber500}/>
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#92400E', fontFamily:'Montserrat,sans-serif' }}>
                  Save your portal link to return anytime
                </div>
                <div style={{ fontSize:12, color:'#B45309', fontFamily:'Montserrat,sans-serif', marginTop:2 }}>
                  Your portal address: <span style={{ fontWeight:700, letterSpacing:'0.01em' }}>{PORTAL_URL}</span>
                  <span style={{ fontWeight:400, color:'#B45309', opacity:0.75, marginLeft:8 }}>
                    {isMobile ? 'Tap "Copy" to save it.' : 'Press Ctrl+D (⌘D on Mac) to bookmark, or copy the link.'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
              <button onClick={handleCopy}
                style={{ background: copied ? C.green : C.amber500, color:C.white, border:'none', borderRadius:7, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif', display:'flex', alignItems:'center', gap:5, transition:'background 0.2s' }}>
                {copied ? <><Check size={12}/> Copied!</> : <><Globe size={12}/> Copy link</>}
              </button>
              <button onClick={() => setShowAccessBanner(false)}
                style={{ background:'none', border:`1px solid ${C.amber100}`, borderRadius:7, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                <X size={13} color='#92400E'/>
              </button>
            </div>
          </div>
        )}

        <div style={{ padding:isMobile?'14px 14px':'22px 24px' }}>
          {/* Welcome banner */}
          <div style={{ background:`linear-gradient(135deg,${C.darkBlue} 0%,${C.blue} 100%)`, borderRadius:14, padding:isMobile?'16px 16px':'20px 24px', marginBottom:18, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <div style={{ color:'rgba(255,255,255,0.58)', fontSize:12, marginBottom:3, fontFamily:'Montserrat,sans-serif' }}>Welcome to Vantaca Vendor</div>
              <div style={{ color:C.white, fontSize:isMobile?18:20, fontWeight:700, letterSpacing:'-0.02em', fontFamily:'Montserrat,sans-serif' }}>{VENDOR.contact} 👋</div>
              <div style={{ color:'rgba(255,255,255,0.58)', fontSize:12, marginTop:3, fontFamily:'Montserrat,sans-serif' }}>{VENDOR.name} · Payment preferences set</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:9, padding:'10px 14px', textAlign:'center' }}>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10, marginBottom:3, fontFamily:'Montserrat,sans-serif' }}>Payment method</div>
              <div style={{ color:C.white, fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:5, fontFamily:'Montserrat,sans-serif' }}>
                <CreditCard size={13}/> Digital Card
              </div>
            </div>
          </div>

          {/* Passkey setup card — shown after first magic-link login, once per session */}
          {showPasskeyCard && !passkeyRegistered && (
            <div style={{ background:C.blue50, border:`1px solid ${C.blue100}`, borderRadius:12, padding:isMobile?'14px 14px':'16px 18px', marginBottom:18, display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:C.white, border:`1px solid ${C.blue100}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <FingerprintIcon size={22} color={C.blue}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.darkBlue, fontFamily:'Montserrat,sans-serif' }}>Sign in faster next time</div>
                <div style={{ fontSize:12, color:C.gray600, marginTop:3, lineHeight:1.55, fontFamily:'Montserrat,sans-serif' }}>
                  Use your fingerprint, Face ID, or device PIN to skip the email link on future visits. Takes 5 seconds.
                </div>
                <div style={{ marginTop:12, display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button onClick={()=>{ setShowPasskeyModal(true); setPasskeySetupDone(false); }}
                    style={{ background:C.blue, color:C.white, border:'none', borderRadius:7, padding:'7px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}>
                    Set up passkey
                  </button>
                  <button onClick={()=>setShowPasskeyCard(false)}
                    style={{ background:'none', color:C.gray500, border:`1px solid ${C.gray200}`, borderRadius:7, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Montserrat,sans-serif' }}>
                    Maybe later
                  </button>
                </div>
              </div>
              <button onClick={()=>setShowPasskeyCard(false)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:2, flexShrink:0, marginTop:-2 }}>
                <X size={14} color={C.gray400}/>
              </button>
            </div>
          )}

          {/* KPIs */}
          <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)', gap:12, marginBottom:18 }}>
            {[
              { label:'Pending Payments', value:'—', sub:'No payments queued yet',            icon:<Clock size={15} color={C.gray400}/>, bg:C.gray100 },
              { label:'Paid This Month',  value:'—', sub:'Your first payment will show here', icon:<TrendingUp size={15} color={C.gray400}/>, bg:C.gray100 },
              { label:'Paid This Year',   value:'—', sub:'Earnings track automatically',       icon:<DollarSign size={15} color={C.gray400}/>, bg:C.gray100 },
            ].map((k,i)=>(
              <div key={i} style={{ background:C.white, borderRadius:12, padding:'15px', boxShadow:Sh.card }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:9 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.gray500, textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:'Montserrat,sans-serif' }}>{k.label}</div>
                  <div style={{ width:27, height:27, borderRadius:7, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>{k.icon}</div>
                </div>
                <div style={{ fontSize:22, fontWeight:700, color:C.gray400, letterSpacing:'-0.02em', marginBottom:3, fontFamily:'Montserrat,sans-serif' }}>{k.value}</div>
                <div style={{ fontSize:11, color:C.gray500, fontFamily:'Montserrat,sans-serif' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Payment activity — empty state */}
          <div style={{ background:C.white, borderRadius:12, boxShadow:Sh.card }}>
            <div style={{ padding:'15px 20px', borderBottom:`1px solid ${C.gray100}` }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.gray900, fontFamily:'Montserrat,sans-serif' }}>Payment Activity</div>
              <div style={{ fontSize:12, color:C.gray500, marginTop:2, fontFamily:'Montserrat,sans-serif' }}>All transactions across your accounts will appear here</div>
            </div>
            <div style={{ padding:isMobile?'32px 18px':'44px 28px', textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:C.gray100, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <DollarSign size={24} color={C.gray400}/>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:C.gray700, marginBottom:5, fontFamily:'Montserrat,sans-serif' }}>No payments yet</div>
              <div style={{ fontSize:13, color:C.gray500, lineHeight:1.65, maxWidth:340, margin:'0 auto 18px', fontFamily:'Montserrat,sans-serif' }}>
                Once a management company approves an invoice for your work, the payment will appear here automatically.
              </div>
              <div style={{ background:C.blue50, border:`1px solid ${C.blue100}`, borderRadius:9, padding:'12px 16px', maxWidth:360, margin:'0 auto', display:'flex', gap:10, alignItems:'flex-start', textAlign:'left' }}>
                <Bell size={14} color={C.blue} style={{ flexShrink:0, marginTop:1 }}/>
                <span style={{ fontSize:12, color:C.gray700, lineHeight:1.55, fontFamily:'Montserrat,sans-serif' }}>
                  We'll notify you at <strong>{VENDOR.email}</strong> the moment your first payment is processed.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showModal && <ConfirmModal method={method} onClose={onCloseModal} />}

      {/* SMS Consent Modal — existing vendor retroactive consent (post-CAI demo) */}
      {showSmsModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', zIndex:490, display:'flex', alignItems:'center', justifyContent:'center', padding:isMobile?'16px':'24px', backdropFilter:'blur(3px)' }}>
          <div style={{ background:C.white, borderRadius:20, maxWidth:420, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.25)', overflow:'hidden', fontFamily:'Montserrat,sans-serif' }}>
            {/* Hero band */}
            <div style={{ background:`linear-gradient(135deg, ${C.darkBlue} 0%, #1a4a6e 100%)`, padding:'32px 32px 28px', textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', border:'2px solid rgba(255,255,255,0.2)' }}>
                <Bell size={28} color={C.white}/>
              </div>
              <h2 style={{ fontSize:isMobile?20:22, fontWeight:800, color:C.white, margin:'0 0 8px', letterSpacing:'-0.02em', lineHeight:1.2 }}>
                Never miss a payment
              </h2>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', margin:0, lineHeight:1.6 }}>
                Get a text the moment money is on its way — before it hits your bank.
              </p>
            </div>
            {/* Body */}
            <div style={{ padding:'24px 28px 28px' }}>
              {/* Phone + toggle row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:smsModalConsent ? '#F0FDF4' : C.gray50, border:`1.5px solid ${smsModalConsent ? '#86EFAC' : C.gray200}`, borderRadius:12, padding:'14px 16px', marginBottom:20, transition:'all 0.25s ease' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:34, height:34, borderRadius:8, background:smsModalConsent ? C.green100 : C.gray200, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.25s ease' }}>
                    <Phone size={15} color={smsModalConsent ? C.green : C.gray500}/>
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:C.gray500, fontWeight:500, fontFamily:'Montserrat,sans-serif' }}>We'll send alerts to</div>
                    <div style={{ fontSize:14, fontWeight:700, color:C.gray900, fontFamily:'Montserrat,sans-serif' }}>{VENDOR.phone}</div>
                  </div>
                </div>
                <Toggle checked={smsModalConsent} onChange={setSmsModalConsent}/>
              </div>
              {/* Primary CTA — outcome-optimised */}
              <Btn variant="green" fullWidth onClick={()=>{ console.log('SMS preference saved:', smsModalConsent); setShowSmsModal(false); setShowDeclineConfirm(false); }}>
                {smsModalConsent ? <><Check size={14}/>&nbsp;Enable SMS Alerts</> : 'Remind me next time I log in'}
              </Btn>

              {/* Decline path — buried below primary, requires confirmation */}
              {!showDeclineConfirm ? (
                <button
                  onClick={()=>setShowDeclineConfirm(true)}
                  style={{ width:'100%', background:'none', border:'none', cursor:'pointer', fontSize:11, color:C.gray400, padding:'10px 0 0', fontFamily:'Montserrat,sans-serif', textDecoration:'underline', textDecorationStyle:'dotted' }}
                >
                  I'd rather not receive SMS alerts
                </button>
              ) : (
                <div style={{ marginTop:12, background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:10, padding:'12px 14px' }}>
                  <p style={{ fontSize:12, color:'#92400E', margin:'0 0 10px', lineHeight:1.5, fontFamily:'Montserrat,sans-serif' }}>
                    <strong>Are you sure?</strong> You'll miss instant payment notifications — including alerts when money is on its way to your account.
                  </p>
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      onClick={()=>setShowDeclineConfirm(false)}
                      style={{ flex:1, background:C.white, border:`1px solid ${C.gray300}`, borderRadius:8, padding:'8px', fontSize:12, fontWeight:600, cursor:'pointer', color:C.gray700, fontFamily:'Montserrat,sans-serif' }}
                    >
                      Go back
                    </button>
                    <button
                      onClick={()=>{ console.log('SMS explicitly declined'); setShowSmsModal(false); setShowDeclineConfirm(false); }}
                      style={{ flex:1, background:C.gray100, border:'none', borderRadius:8, padding:'8px', fontSize:12, fontWeight:600, cursor:'pointer', color:C.gray600, fontFamily:'Montserrat,sans-serif' }}
                    >
                      Confirm, don't ask again
                    </button>
                  </div>
                </div>
              )}

              {/* Disclosure */}
              <p style={{ fontSize:10, color:C.gray400, margin:'14px 0 0', lineHeight:1.65, textAlign:'center', fontFamily:'Montserrat,sans-serif' }}>
                Recurring automated SMS from Vantaca including payment alerts and promotions. Msg &amp; data rates may apply. Reply HELP for help, STOP to opt out. Consent not required for service.{' '}
                <a href="https://www.vantaca.com/privacy-policy" target="_blank" rel="noreferrer" style={{ color:C.blue }}>Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Passkey setup modal — mock browser dialog */}
      {showPasskeyModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 20px' }}>
          <div style={{ background:C.white, borderRadius:18, padding:'36px 28px', maxWidth:340, width:'100%', boxShadow:Sh.lg, textAlign:'center', fontFamily:'Montserrat,sans-serif' }}>
            {!passkeySetupDone ? (
              <>
                <div style={{ width:68, height:68, borderRadius:'50%', background:C.blue50, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
                  <FingerprintIcon size={36} color={C.blue}/>
                </div>
                <h3 style={{ fontSize:18, fontWeight:700, color:C.darkBlue, margin:'0 0 10px' }}>Create a passkey</h3>
                <p style={{ fontSize:13, color:C.gray500, margin:'0 0 24px', lineHeight:1.65 }}>
                  Use your fingerprint, Face ID, or device PIN to sign in instantly — no email link needed.
                </p>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={()=>setShowPasskeyModal(false)}
                    style={{ flex:1, background:C.gray100, border:'none', borderRadius:9, padding:'12px', fontSize:13, fontWeight:600, cursor:'pointer', color:C.gray700 }}>
                    Cancel
                  </button>
                  <button onClick={handlePasskeyCreate}
                    style={{ flex:1, background:C.blue, border:'none', borderRadius:9, padding:'12px', fontSize:13, fontWeight:700, cursor:'pointer', color:C.white }}>
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ width:68, height:68, borderRadius:'50%', background:C.green50, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
                  <CheckCircle size={34} color={C.green}/>
                </div>
                <h3 style={{ fontSize:18, fontWeight:700, color:C.darkBlue, margin:'0 0 10px' }}>Passkey saved!</h3>
                <p style={{ fontSize:13, color:C.gray500, margin:'0 0 24px', lineHeight:1.65 }}>
                  Next time you visit, use your Face ID, fingerprint, or PIN on the login screen — no email needed.
                </p>
                <button onClick={()=>{ setShowPasskeyModal(false); setShowPasskeyCard(false); onPasskeyRegister?.(); }}
                  style={{ width:'100%', background:C.blue, border:'none', borderRadius:9, padding:'13px', fontSize:14, fontWeight:700, cursor:'pointer', color:C.white, fontFamily:'Montserrat,sans-serif' }}>
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── App Root ─────────────────────────────────────────────────
export default function App() {
  const [screen,            setScreen]           = useState<Screen>('email');
  const [method,            setMethod]           = useState<Method>('card');
  const [showModal,         setShowModal]        = useState(false);
  const [loginEmail,        setLoginEmail]       = useState('');
  const [hasActiveSession,  setHasActiveSession] = useState(false);
  const [passkeyRegistered, setPasskeyRegistered]= useState(false);
  // Incrementing this key forces DashboardScreen to remount — needed when shortcuts
  // are clicked while already on the dashboard (React won't remount otherwise)
  const [dashboardKey,      setDashboardKey]     = useState(0);
  const [isExistingVendor,  setIsExistingVendor] = useState(false);

  const handleSignOut = () => { setHasActiveSession(false); setPasskeyRegistered(false); setIsExistingVendor(false); setScreen('login'); };

  // Nav divider helper
  const Div = () => <div style={{ width:1, background:'rgba(255,255,255,0.12)', margin:'0 2px', alignSelf:'stretch' }} />;

  // Nav button helper
  const nb = (label: string, active: boolean, onClick: ()=>void, tint?: string) => (
    <button key={label} onClick={onClick} style={{
      background: active ? (tint ?? C.blue) : 'transparent',
      color: active ? C.white : (tint ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.42)'),
      border: tint && !active ? `1px solid ${tint}33` : 'none',
      borderRadius:7, padding:'4px 9px', fontSize:11, fontWeight:600,
      cursor:'pointer', fontFamily:'Montserrat,sans-serif', transition:'all 0.15s',
    }}>{label}</button>
  );

  return (
    <>
      <Font />
      {/* Demo nav — ordered by user journey */}
      <div style={{ position:'fixed', top:0, left:'50%', transform:'translateX(-50%)', zIndex:9999, background:C.darkBlue, borderRadius:'0 0 12px 12px', padding:'5px 8px', display:'flex', gap:3, alignItems:'center', boxShadow:Sh.lg }}>

        {/* ── First-time onboarding flow ─────────────────────── */}
        {nb('Invite Email',  screen==='email',    ()=>{ setHasActiveSession(false); setPasskeyRegistered(false); setShowModal(false); setScreen('email'); })}
        {nb('Landing',       screen==='landing',  ()=>{ setShowModal(false); setScreen('landing'); })}
        {nb('Pay Method',    screen==='method',   ()=>{ setShowModal(false); setScreen('method'); })}
        {nb('Details',       screen==='details',  ()=>{ setMethod('check'); setShowModal(false); setScreen('details'); })}
        {nb('Dashboard',     screen==='dashboard' && passkeyRegistered,  ()=>{ setHasActiveSession(false); setPasskeyRegistered(true); setShowModal(false); setScreen('dashboard'); setDashboardKey(k=>k+1); })}

        <Div />

        {/* ── Return visit flow ──────────────────────────────── */}
        {nb('Login (no passkey)',    screen==='login' && !passkeyRegistered, ()=>{ setHasActiveSession(false); setPasskeyRegistered(false); setShowModal(false); setScreen('login'); })}
        {nb('Login (passkey set up)',screen==='login' && passkeyRegistered,  ()=>{ setHasActiveSession(false); setPasskeyRegistered(true);  setShowModal(false); setScreen('login'); })}
        {nb('Approve Wait',          screen==='login-approve', ()=>{ setShowModal(false); setScreen('login-approve'); })}

        <Div />

        {/* ── Follow-up emails ───────────────────────────────── */}
        {nb('Payment Email',       screen==='payment-email', ()=>{ setShowModal(false); setScreen('payment-email'); })}
        {nb('Portal Access Email', screen==='post-email',    ()=>{ setShowModal(false); setScreen('post-email'); })}

        <Div />

        {/* ── Dashboard shortcuts (force remount each click) ─── */}
        {nb('Return (Session)', false, ()=>{ setHasActiveSession(true);  setPasskeyRegistered(false); setIsExistingVendor(false); setShowModal(false); setScreen('dashboard'); setDashboardKey(k=>k+1); }, '#86efac')}
        {nb('Passkey Setup',    false, ()=>{ setHasActiveSession(false); setPasskeyRegistered(false); setIsExistingVendor(false); setShowModal(false); setScreen('dashboard'); setDashboardKey(k=>k+1); }, '#93c5fd')}

        <Div />

        {/* ── Feature flag: existing vendor SMS consent ──────── */}
        {nb('Existing Vendor', false, ()=>{ setHasActiveSession(true); setPasskeyRegistered(true); setIsExistingVendor(true); setShowModal(false); setScreen('dashboard'); setDashboardKey(k=>k+1); }, '#F79009')}

        <Div />
        <span style={{ color:'rgba(255,255,255,0.25)', fontSize:10, alignSelf:'center', paddingRight:3, fontFamily:'Montserrat,sans-serif' }}>Vendor Onboarding Refresh</span>
      </div>

      <div style={{ paddingTop:32 }}>
        {screen==='login'         && <LoginScreen
                                       onApproveFlow={email=>{ setLoginEmail(email); setScreen('login-approve'); }}
                                       onDashboard={()=>{ setHasActiveSession(false); setScreen('dashboard'); setDashboardKey(k=>k+1); }}
                                       passkeyRegistered={passkeyRegistered} />}
        {screen==='login-approve' && <ApproveWaitScreen
                                       email={loginEmail || VENDOR.email}
                                       onApproved={()=>setScreen('dashboard')}
                                       onBack={()=>setScreen('login')} />}
        {/* Payment email:
            - Button CTA  = magic link → dashboard (no login required)
            - URL text links = stable login page → Login (no passkey) screen  */}
        {screen==='payment-email' && <PaymentEmailScreen
                                       onViewPortal={()=>setScreen('dashboard')}
                                       onPortalUrl={()=>{ setPasskeyRegistered(true); setScreen('login'); }} />}
        {/* Post-onboarding portal access email (sent 24-48h after setup,
            no payment queued). Same routing split as payment email.    */}
        {screen==='post-email'    && <PostOnboardingEmailScreen
                                       onOpenPortal={()=>setScreen('dashboard')}
                                       onPortalUrl={()=>{ setPasskeyRegistered(true); setScreen('login'); }} />}
        {screen==='email'         && <EmailScreen   onNext={()=>setScreen('landing')} />}
        {screen==='landing'       && <LandingScreen onNext={()=>setScreen('method')} />}
        {screen==='method'        && <MethodScreen  onNext={m=>{ setMethod(m); setScreen('details'); }} />}
        {screen==='details'       && <DetailsScreen method={method} onNext={()=>{ setScreen('dashboard'); setShowModal(true); setDashboardKey(k=>k+1); }} onBack={()=>setScreen('method')} />}
        {screen==='dashboard'     && <DashboardScreen key={dashboardKey} showModal={showModal} method={method} onCloseModal={()=>setShowModal(false)}
                                        hasActiveSession={hasActiveSession} passkeyRegistered={passkeyRegistered}
                                        onPasskeyRegister={()=>setPasskeyRegistered(true)}
                                        onSignOut={handleSignOut}
                                        isExistingVendor={isExistingVendor} />}
      </div>
    </>
  );
}
