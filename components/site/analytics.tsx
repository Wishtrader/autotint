'use client'

import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const YM_ID = process.env.NEXT_PUBLIC_YM_ID

export function Analytics() {
  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                page_title: document.title,
                page_location: window.location.href,
              });
            `}
          </Script>
        </>
      )}
      {YM_ID && (
        <Script id="ym-init" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
            ym(${YM_ID}, "init", {
              defer: true,
              clickmap: true,
              trackLinks: true,
              accurateTrackBounce: true,
              webvisor: true
            });
          `}
        </Script>
      )}
      {YM_ID && (
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YM_ID}`}
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
      )}
    </>
  )
}