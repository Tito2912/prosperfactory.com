import Script from 'next/script';

const PF_LAZY_LOADER = `!function(){function e(e){return(e||"").trim()}function t(e){try{return decodeURIComponent(escape(atob(e)))}catch(t){try{return atob(e)}catch(t){return""}}}function l(){var e=(location.pathname||"/").toLowerCase();return e.startsWith("/fr")?"fr":e.startsWith("/es")?"es":e.startsWith("/de")?"de":"en"}var n=l(),o="/assets/pf-lazy/"+n+"/",a={};function r(n){if(n.dataset.pfLazyLoaded)return;var r=n.getAttribute("data-pf-lazy-src");if(!r)return;var i=document.getElementById(r);if(i){var c=i.textContent||"";if(c&&c.trim().length){var s="b64"===i.getAttribute("data-pf-encoding")?t(e(c)):c;n.innerHTML=s,n.dataset.pfLazyLoaded="1",i.remove();return}}var d=o+r+".b64";(a[d]||(a[d]=fetch(d,{cache:"force-cache"}).then(function(e){if(!e.ok)throw new Error("HTTP "+e.status);return e.text()}))).then(function(e){n.innerHTML=t(e.trim()),n.dataset.pfLazyLoaded="1"}).catch(function(){})}var i=[].slice.call(document.querySelectorAll("section[data-pf-lazy-src]"));if(i.length){if(!("IntersectionObserver"in window))return void i.forEach(r);var c=new IntersectionObserver(function(e){e.forEach(function(e){e.isIntersecting&&(r(e.target),c.unobserve(e.target))})},{rootMargin:"200px 0px",threshold:.01});i.forEach(function(e){c.observe(e)})}}();`;

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Legacy sales CSS (kept as standalone static assets). */}
      <link rel="preconnect" href="https://d3syewzhvzylbl.cloudfront.net" crossOrigin="anonymous" />
      <link rel="stylesheet" href="/assets/prosper-factory-critical.css" />
      <link rel="stylesheet" href="/assets/prosper-factory.min.css" />
      <style>{'@media only screen and (max-width:900px){.pf-mobile-hide,.sc-fKAjen .pf-mobile-hide{display:none!important}}'}</style>

      {children}
      <Script id="pf-lazy-loader" strategy="afterInteractive">
        {PF_LAZY_LOADER}
      </Script>
      <Script src="/assets/backlinks.js" strategy="afterInteractive" />
    </>
  );
}
