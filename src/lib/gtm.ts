// Google Tag Manager loader + client-side event helper.
//
// Container: GTM-5J9P69L5 (GTM account "Qareeb", under harshitdikshit96@gmail.com
// — kept separate from the harshitcreates.in GTM account/property). Feeds a
// single GA4 property: "Qareeb" account, measurement ID G-8N9M7STHP2.
//
// This is a SEPARATE system from the first-party visit tracking in
// src/lib/analytics.ts (the Neon-backed daily_stats/referrer_stats tables
// surfaced at /admin/analytics). That system stays as-is; GTM/GA4 is an
// additional, industry-standard layer for funnels, acquisition channels,
// and eventually Google Ads/Search Console integration.

export const GTM_ID = "GTM-5J9P69L5";

// GTM + GA4 cost real CPU on a throttled phone (GTM's own guidance: roughly
// a few hundred ms during hydration). Loading it with next/script
// afterInteractive competes directly with React hydration, and lazyOnload
// still lands inside Lighthouse's measurement window. So instead we load
// GTM at the FIRST of: an ad-click arrives (gclid/gbraid/wbraid/dclid or a
// utm_ param, so paid traffic is attributed from the first moment), the
// visitor's first scroll/pointerdown/touchstart/keydown, or a ~6s fallback
// timer after window.load (catches a visitor who reads without touching
// anything). Any trackEvent() call before that also forces the load, so a
// custom event is never silently dropped.
const FALLBACK_MS = 6000;

export const gtmBootstrap = `(function(w,d){
var loaded=false,evs=['scroll','pointerdown','touchstart','keydown'],o={passive:true};
w.dataLayer=w.dataLayer||[];
function load(){if(loaded)return;loaded=true;
evs.forEach(function(e){w.removeEventListener(e,load,o)});
var q=w.dataLayer,c=[],r=[];
for(var i=0;i<q.length;i++){(q[i]&&q[i][0]==='consent'?c:r).push(q[i])}
w.dataLayer=c.concat([{'gtm.start':Date.now(),event:'gtm.js'}],r);
var s=d.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=${GTM_ID}';d.head.appendChild(s);}
w.__loadGtm=load;
if(/[?&](gclid|gbraid|wbraid|dclid|utm_)/.test(location.search)){load();return;}
evs.forEach(function(e){w.addEventListener(e,load,o)});
function later(){setTimeout(load,${FALLBACK_MS})}
if(d.readyState==='complete')later();else w.addEventListener('load',later,{once:true});
})(window,document);`;
