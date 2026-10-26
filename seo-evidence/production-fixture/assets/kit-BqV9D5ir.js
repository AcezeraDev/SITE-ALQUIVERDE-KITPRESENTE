const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/lightScenes-DYKsGeCq.js","assets/imageSizes-CC1CmFLw.js","assets/fallback-BBI-OHJT.js","assets/kits-C1ZM7AHO.js","assets/fullScenes-BzIjomfg.js","assets/three-0cK9tT28.js","assets/kit3d-1z_nsmry.js","assets/anim-CBgaOXZs.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */import{a as R,_ as G,d as ee,i as te,m as ae,b as se,t as oe,l as ie,c as re}from"./whatsapp-DdmnFh01.js";import{a as ne,s as D}from"./imageSizes-CC1CmFLw.js";import{c as F,v as B,I as A,K as q,d as le,e as X,b as Y,s as J,k as ce,S as P,g as U}from"./kits-C1ZM7AHO.js";import{g as u,S as O,a as Z,L as de}from"./anim-CBgaOXZs.js";function pe(t){const g={bottle:'<path d="M27 4h10v7l5 7v38a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V18l5-7z"/><path d="M22 28h20M22 46h20"/><path d="M32 33c-3 4-4 6-2 8s5 0 4-3z"/>',vial:'<rect x="25" y="4" width="14" height="11" rx="2"/><path d="M23 15h18v40a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5z"/><path d="M23 30h18v15H23z"/><path d="M28 37.5h8"/>',candle:'<path d="M16 26h32l-2.5 30a5 5 0 0 1-5 4.6H23.5a5 5 0 0 1-5-4.6z"/><path d="M32 26v-6"/><path d="M32 6c-4.5 5-4.5 9 0 11 4.5-2 4.5-6 0-11z"/><path d="M19 42h26"/>',cup:'<path d="M15 12h34l-3.5 43a5 5 0 0 1-5 4.6H23.5a5 5 0 0 1-5-4.6z"/><path d="m32 24 2 5 5 .5-4 3.3 1.3 5-4.3-2.8-4.3 2.8 1.3-5-4-3.3 5-.5z"/><path d="M19 46h26"/>',loofah:'<rect x="12" y="8" width="40" height="50" rx="16"/><path d="M18 18c6 4 22 4 28 0M16 28c8 4 24 4 32 0M16 38c8 4 24 4 32 0M18 48c6 4 22 4 28 0M24 10c-3 14-3 34 0 46M40 10c3 14 3 34 0 46"/>',plug:'<rect x="20" y="16" width="34" height="40" rx="6"/><path d="M20 26h-8v20h8"/><path d="M12 31H5M12 41H5"/><path d="M28 30h18M28 40h18"/><path d="M37 16c-3-5-3-8 0-11 3 3 3 6 0 11z"/>',soap:'<rect x="8" y="20" width="48" height="28" rx="9"/><path d="M8 40c10 4 38 4 48 0"/><path d="M18 30h16M18 35h10"/>',box:'<path d="M8 22h48v34H8z"/><path d="M6 14h52v8H6zM32 14v42"/><path d="M32 14c-6-10-16-8-14-2 1 3 8 3 14 2zm0 0c6-10 16-8 14-2-1 3-8 3-14 2z"/>'},f=o=>`<svg viewBox="0 0 64 64" aria-hidden="true" class="kp-icon"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${g[o]}</g></svg>`,M='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>',E=o=>String(o).padStart(2,"0"),L=(o,s)=>o?o===1?`Vem 1 sabonete, de uma das ${s} variedades abaixo.`:`Vêm ${o} sabonetes diferentes, entre as ${s} variedades abaixo.`:"";function I(o){const s=[];for(const r of t.contents)if(!r.pool)if(r.key)s.push({id:r.key,qty:r.qty,name:r.label,sub:r.weight,key:r.key,color:P[r.key].color});else if(r.soaps){const h={};o.soaps.forEach(n=>{h[n]=(h[n]||0)+1}),Object.entries(h).forEach(([n,_])=>s.push({id:n,qty:_,key:n,color:P[n].color,name:_>1?`Sabonetes Vegetais de ${P[n].name}`:`Sabonete Vegetal de ${P[n].name}`,sub:_>1?"90 g cada":"90 g"}))}else{const h=A[r.item];s.push({id:r.item,qty:r.qty,name:h.name,sub:h.sci||h.sub||"",icon:h.icon,color:h.color})}return s.push({id:"caixa",qty:1,name:t.box.label,sub:"Embalagem para presente",icon:"box",color:t.tone}),s}const j=t?Object.fromEntries(F(t).map(o=>[o.key,o])):{};function K(o){return o.key?{text:j[o.key].text,notes:j[o.key].notes}:o.id==="caixa"?{text:"Chega montada à mão e pronta para presentear. É só escrever o cartão.",notes:["Pronta para presente"]}:{text:A[o.id].text,notes:A[o.id].notes}}function w(o){return I(o).map((s,r)=>{const h=K(s),n=!s.key&&A[s.id]?.photo,_=s.key?`<img src="/soaps/${s.key}.webp" alt="" width="96" height="96" loading="lazy" decoding="async" />`:n?`<img src="${n}" alt="" loading="lazy" decoding="async" />`:f(s.icon);return`
    <li class="kp-item" data-id="${s.id}" style="--ing:${s.color}">
      <button type="button" class="kp-item__head" aria-expanded="false" aria-controls="kpd-${s.id}" id="kph-${s.id}">
        <span class="kp-item__num">${E(r+1)}</span>
        <span class="kp-item__thumb">${_}</span>
        <span class="kp-item__text"><b>${s.qty>1?`${s.qty} × `:""}${s.name}</b><small>${s.sub}</small></span>
        <span class="kp-item__plus" aria-hidden="true"></span>
      </button>
      <div class="kp-item__detail" id="kpd-${s.id}" role="region" aria-labelledby="kph-${s.id}" hidden>
        <p>${h.text}</p>
        <ul class="kp-notes">${h.notes.map(p=>`<li>${p}</li>`).join("")}</ul>
      </div>
    </li>`}).join("")}function C(o){if(!o.hotspots)return"";const s=I(o).map(r=>r.id);return Object.entries(o.hotspots).map(([r,[h,n]])=>{const _=I(o).find(p=>p.id===r);return`<button type="button" class="kp-hot" data-id="${r}" style="left:${h*100}%;top:${n*100}%" aria-label="${_.name}"><span>${s.indexOf(r)+1}</span></button>`}).join("")}function V(o){const s=[],r=B(t).length===1,h=p=>B(t)[0].soaps.filter(l=>l===p).length,n=t.contents.some(p=>p.pool),_=p=>({id:p.key,kind:"soap",qty:r&&!n?h(p.key):1,name:P[p.key].name,color:P[p.key].color,kicker:n?"Pode vir no kit · 90 g":"Sabonete vegetal · 90 g",line:p.sci,text:p.text,notes:p.notes,inVariants:p.inVariants});for(const p of t.contents)if(p.item){const l=A[p.item];s.push({id:p.item,kind:"item",qty:p.qty,name:l.name,color:l.color,icon:l.icon,photo:l.photo,model:l.model,kicker:[l.kind,l.sub].filter(Boolean).join(" · "),line:l.sci||"",text:l.text,notes:l.notes})}else if(p.key){const l=o.find(T=>T.key===p.key);l&&!s.some(T=>T.id===l.key)&&s.push(_(l))}else p.soaps&&o.forEach(l=>{s.some(T=>T.id===l.key)||s.push(_(l))});return s}function z(o=0,s=!1){const r=B(t).map((e,i)=>{if(!s)return e;const c=q.find(k=>k.id===t.kitId)?.variants[i]?.front;return c?{...e,img:`/kits/${c}.webp`}:e}),h=Math.min(Math.max(0,Math.trunc(Number(o))||0),r.length-1),n=r[h],_=[...new Set(r.map(e=>e.model).filter(Boolean))],p=F(t),l=V(p),T=le(t),S=Object.values(X).filter(e=>e.slug!==t.slug),N=t.closing.split(" "),H=`
  <section class="kp-hero" aria-labelledby="kpTitle">
    <nav class="kp-crumbs" aria-label="Você está em">
      <a href="/">Kits de Natal</a><span aria-hidden="true">/</span><span aria-current="page" id="kpCrumb">${n.title||t.name}</span>
    </nav>
    <div class="kp-hero__grid">
      <div class="kp-hero__visual" data-cursor="girar">
        <div class="kp-hero__plinth" aria-hidden="true"></div>
        <div class="kit__tilt kp-hero__tilt">
          <img class="kp-hero__img" src="${n.img}" alt="${n.title||t.name}" decoding="async" fetchpriority="high" />
          <span class="kit__glare" aria-hidden="true"></span>
        </div>
        <div class="kit__shadow" aria-hidden="true"></div>
        ${_.map(e=>`<canvas class="kp-hero__gl" data-model="${e}" role="img" aria-label="${t.name} em 3D. Arraste ou use as setas para girar." hidden></canvas>`).join("")}
      </div>
      <div class="kp-hero__info">
        <p class="eyebrow kp-in">Kit de Natal 2026</p>
        <h1 id="kpTitle" class="kp-title">${n.title||t.name}</h1>
        <p class="kp-hero__sub kp-in">${t.subtitle}</p>
        <p class="kp-hero__tag kp-in">${n.tag||t.tagline}</p>
        ${r.length>1?`<div class="variants kp-in" role="radiogroup" aria-label="${r[0].title?"Escolha o kit":"Combinação de sabonetes"}">${r.map((e,i)=>`<button type="button" role="radio" class="variant" aria-checked="${i===h}" data-v="${i}">${e.label}</button>`).join("")}</div>`:`<p class="variant-fixed kp-in">${n.label}</p>`}
        <ul class="kp-facts kp-in" aria-label="Resumo do kit">${t.facts.map(e=>`<li>${e}</li>`).join("")}</ul>
        <div class="kp-buy kp-in">
          <p class="kp-price">${Y(q.find(e=>e.id===t.kitId),q.find(e=>e.id===t.kitId)?.variants[h])}</p>
          <a class="kit__add" id="kpShop" href="${J(q.find(e=>e.id===t.kitId),q.find(e=>e.id===t.kitId)?.variants[h])}"><span>Quero presentear</span>${M}</a>
          <a class="text-link" href="#caixa">Ver o que vem na caixa</a>
        </div>
      </div>
    </div>
  </section>

  <section class="kp-intro" aria-label="Sobre o kit">
    <div class="kp-wrap">
      <p class="kp-intro__lead">${t.intro[0]}</p>
      <p class="kp-intro__more">${t.intro[1]}</p>
    </div>
  </section>

  <section class="kp-box" id="caixa" aria-labelledby="boxTitle">
    <div class="section-head">
      <p class="eyebrow">O que vem na caixa</p>
      <h2 id="boxTitle" class="reveal-title">Abra a caixa, <em>item por item.</em></h2>
      <p class="section-sub">${t.totals?`${t.totals.units} sabonetes · ${t.totals.weight} no total. `:""}Toque em cada item para conhecer.${n.hotspots?" Os números na foto mostram onde cada um está.":""}</p>
    </div>
    <div class="kp-box__grid">
      <figure class="kp-box__photo">
        <div class="kp-box__frame">
          <div class="kp-box__pic">
            <img src="${n.open||n.img}" alt="Caixa aberta do ${n.title||`${t.name}: ${n.label}`}" loading="lazy" decoding="async" />
            <div class="kp-hotspots">${C(n)}</div>
          </div>
        </div>
        <figcaption>${t.box.label} · ${n.label}</figcaption>
      </figure>
      <ol class="kp-list" id="kpList">${w(n)}</ol>
    </div>
  </section>

  ${t.video?`  <section class="kp-video" aria-labelledby="videoTitle">
    <div class="kp-wrap kp-video__grid">
      <div class="kp-video__copy">
        <p class="eyebrow">Feito à mão</p>
        <h2 id="videoTitle" class="reveal-title">Veja a caixa <em>sendo montada.</em></h2>
        <p class="kp-video__p">Cada sabonete, cada vidrinho e a bucha vão para o lugar certo, um por um, antes de a tampa fechar e o laço ser dado.</p>
      </div>
      <div class="kp-video__frame">
        <video class="kp-video__video" controls playsinline preload="none" poster="${t.video.poster}" aria-label="Vídeo da montagem de um kit AlquiVerde">
          <source src="${t.video.src}" type="video/mp4" />
        </video>
      </div>
    </div>
  </section>`:""}

  <section class="kp-soaps" aria-labelledby="soapsTitle">
    <div class="section-head">
      <p class="eyebrow">Tudo o que vem no kit</p>
      <h2 id="soapsTitle" class="reveal-title">Conheça cada <em>item.</em></h2>
      <p class="section-sub">${L(t.contents.find(e=>e.pool)?.pool,p.length)||`${l.length} itens, um por um.`} ${s?"Fotos e detalhes para conhecer o seu presente.":"Os sabonetes estão em 3D: dá para arrastar e girar."}</p>
    </div>
    <div class="kp-soaps__layout">
      <div class="soap-stage kp-stage" style="--stage:${l[0].color}">
        <span class="soap-stage__halo" aria-hidden="true"></span>
        <canvas class="soap-stage__gl kp-layer" id="kpSoapGL" data-layer="soap" role="img" aria-label="Sabonete em 3D. Arraste ou use as setas do teclado para girar."></canvas>
        ${l.filter(e=>e.model).map(e=>`<canvas class="soap-stage__gl kp-layer" data-layer="${e.id}" data-model="${e.model}" role="img" aria-label="${e.name} em 3D. Arraste ou use as setas para girar." hidden></canvas>`).join("")}
        <img class="kp-stage__photo kp-layer" data-layer="photo" alt="" decoding="async" hidden />
        <div class="kp-stage__flat kp-layer" data-layer="flat" aria-hidden="true" hidden></div>
        <div class="soap-stage__info" aria-live="polite">
          <p class="soap-stage__kicker" id="kpStageKicker">${l[0].kicker}</p>
          <p class="soap-stage__name" id="kpSoapName">${l[0].name}</p>
          <p class="soap-stage__line" id="kpSoapSci">${l[0].line}</p>
        </div>
        <p class="soap-stage__hint" aria-hidden="true"><span>↻</span> arraste para girar</p>
      </div>
      <div class="kp-soaps__list">
        ${l.map((e,i)=>`
        <article class="kp-soap" data-key="${e.id}" data-kind="${e.kind}" style="--ing:${e.color}" aria-labelledby="piece-${e.id}">
          <p class="kp-soap__num">${E(i+1)} / ${E(l.length)} · ${e.kicker}</p>
          <h3 id="piece-${e.id}">${e.qty>1?`${e.qty} × `:""}${e.name}</h3>
          ${e.line?`<p class="kp-soap__sci">${e.line}</p>`:""}
          <p class="kp-soap__text">${e.text}</p>
          <ul class="kp-notes">${e.notes.map(a=>`<li>${a}</li>`).join("")}</ul>
          ${e.inVariants?.length?`<p class="kp-soap__in">Vem ${r[0].title?"no":"na combinação"} ${e.inVariants.join(" e ")}</p>`:""}
        </article>`).join("")}
      </div>
    </div>
  </section>

  <section class="kp-gift" aria-labelledby="giftTitle">
    <div class="kp-wrap kp-gift__grid">
      <div class="kp-gift__photo"><img src="/photos/celebracao.webp" alt="" loading="lazy" decoding="async" /></div>
      <div>
        <p class="eyebrow eyebrow--light">Para quem</p>
        <h2 id="giftTitle" class="reveal-title">${t.giftTitle}</h2>
        ${t.gift.map(e=>`<p class="kp-gift__p">${e}</p>`).join("")}
        <ul class="kp-chips" aria-label="Ideal para">${t.giftFor.map(e=>`<li>${e}</li>`).join("")}</ul>
      </div>
    </div>
  </section>

  <section class="kp-howto" aria-label="Modo de uso e cuidados">
    <div class="kp-wrap kp-howto__grid">
      <div>
        <p class="eyebrow">Modo de uso</p>
        <h2 class="kp-h2s">Como usar <em>os produtos</em></h2>
        <p class="kp-howto__use">${t.use}</p>
      </div>
      <div>
        <p class="eyebrow">Cuidados</p>
        <ul class="kp-care">${T.map(e=>`<li>${e}</li>`).join("")}</ul>
        <p class="kp-disclaimer">Cosméticos para limpeza e cuidado da pele. Complementam a sua rotina e não substituem avaliação dermatológica.</p>
      </div>
    </div>
  </section>

  <section class="kp-reveal" aria-label="${t.closing}">
    <div class="kp-reveal__sticky">
      <p class="kp-reveal__text" aria-hidden="true">${N.map(e=>`<span class="kp-w"><span class="kp-w__ghost">${e}</span><span class="kp-w__ink">${e}</span></span>`).join(" ")}</p>
    </div>
  </section>

  <section class="kp-more" aria-labelledby="moreTitle">
    <div class="section-head">
      <p class="eyebrow">Conheça também</p>
      <h2 id="moreTitle" class="reveal-title">Outros <em>abraços.</em></h2>
    </div>
    <div class="kp-more__grid">
      ${S.map(e=>{const i=q.find(a=>a.id===e.kitId);return`
      <a class="kp-card" href="${ce(e.slug)}" style="--tone:${e.tone};--kbg:${e.bg};--kink:${e.ink}">
        <span class="kp-card__img"><img src="${i?`/kits/${i.variants[0].front}.webp`:e.box.img}" alt="" loading="lazy" decoding="async" /></span>
        <span class="kp-card__name">${e.name}</span>
        <span class="kp-card__tag">${e.tagline}</span>
        <span class="kp-card__go">Ver o kit ${M}</span>
      </a>`}).join("")}
    </div>
  </section>`;return{html:ne(H),variants:r,vi:h}}return{render:z,listHTML:w,hotspotsHTML:C,piecesOf:V,icon:f}}const{initKitViewer:me,initSoapStage:he,initModelViewer:ke}=await(R?G(()=>import("./lightScenes-DYKsGeCq.js"),__vite__mapDeps([0,1,2,3])):G(()=>import("./fullScenes-BzIjomfg.js"),__vite__mapDeps([4,2,1,5,6,7])));u.registerPlugin(O,Z);const y={enter:"expo.out",soft:"power3.out",exit:"power3.in",inOut:"power3.inOut"},m=(t,g=document)=>g.querySelector(t),b=(t,g=document)=>[...g.querySelectorAll(t)],x=R||matchMedia("(prefers-reduced-motion: reduce)").matches,Q=!R&&matchMedia("(hover: hover) and (pointer: fine)").matches,W=new URLSearchParams(location.search),ue=document.querySelector("#kitRoot")?.dataset.slug||W.get("k"),v=X[ue],{render:ge,listHTML:fe,hotspotsHTML:ve,piecesOf:_e,icon:be}=v?pe(v):{};function ye(){const{html:t,variants:g,vi:f}=ge(W.get("v"),R),M=m("#kitRoot");(!M.dataset.rendered||f!==0||R)&&(M.innerHTML=t),M.dataset.rendered||(document.title=U(v).title,m('meta[name="description"]').content=U(v).description),v.draft&&(m("#footNote").textContent="Conceito interativo · texto deste kit em revisão"),document.documentElement.style.setProperty("--tone",v.tone),document.documentElement.style.setProperty("--kbg",v.bg),document.documentElement.style.setProperty("--kink",v.ink),ee(),te(),$e(g,f)}function $e(t,g){let f=null;x||(f=new de({lerp:.09,wheelMultiplier:.95}),f.on("scroll",O.update),u.ticker.add(e=>f.raf(e*1e3)),u.ticker.lagSmoothing(0)),b('a[href^="#"]').forEach(e=>e.addEventListener("click",i=>{const a=m(e.getAttribute("href"));a&&(i.preventDefault(),f?f.scrollTo(a,{offset:-70,duration:1.4}):a.scrollIntoView())}));const M=m("#header");O.create({start:"top -160",end:"max",onUpdate:e=>M.classList.toggle("is-hidden",e.direction===1)}),b(".magic-card").forEach(ae),Q&&b("[data-magnetic]").forEach(e=>se(e));const E=m(".kp-hero__visual");oe(E,{max:9});const L={},I=m(".kp-hero__badge");function j(e){if(b(".kp-hero__gl").forEach(a=>{const c=a.dataset.model===e.model;a.hidden=!c,c&&!L[e.model]?L[e.model]=me(a,e.model,{reduced:x}):c&&L[e.model].replayIntro()}),I&&(I.hidden=!e.model||L[e.model]?.available===!1),E.classList.remove("is-3d"),!e.model||L[e.model]?.available===!1)return;const i=new Image;i.onload=()=>setTimeout(()=>{t[K]===e&&E.classList.add("is-3d")},250),i.src=`/kit3d/${e.model}-front.webp`}let K=g;j(t[g]);const w=m("#kpList"),C=m(".kp-hotspots");function V(e,{scroll:i=!1}={}){b(".kp-item",w).forEach(a=>{const c=a.dataset.id===e&&a.querySelector("[aria-expanded]").getAttribute("aria-expanded")!=="true",k=a.querySelector(".kp-item__head"),d=a.querySelector(".kp-item__detail");k.setAttribute("aria-expanded",String(c)),a.classList.toggle("is-open",c),c?(d.hidden=!1,x||u.fromTo(d,{height:0,opacity:0},{height:"auto",opacity:1,duration:.5,ease:y.enter,clearProps:"height"}),i&&f?f.scrollTo(a,{offset:-140,duration:1}):i&&a.scrollIntoView({block:"nearest"})):d.hidden||(x?d.hidden=!0:u.to(d,{height:0,opacity:0,duration:.32,ease:y.exit,onComplete:()=>{d.hidden=!0,u.set(d,{clearProps:"all"})}}))}),b(".kp-hot",C).forEach(a=>a.classList.toggle("is-on",a.dataset.id===e&&w.querySelector(`[data-id="${e}"]`)?.classList.contains("is-open")))}w.addEventListener("click",e=>{const i=e.target.closest(".kp-item__head");i&&V(i.closest(".kp-item").dataset.id)}),C.addEventListener("click",e=>{const i=e.target.closest(".kp-hot");i&&V(i.dataset.id,{scroll:!0})});const z=e=>b(".kp-hot",C).forEach(i=>i.classList.toggle("is-hover",i.dataset.id===e));w.addEventListener("pointerover",e=>z(e.target.closest(".kp-item")?.dataset.id)),w.addEventListener("pointerleave",()=>z(null)),w.addEventListener("focusin",e=>z(e.target.closest(".kp-item")?.dataset.id));const o=m(".kp-box__pic img"),s=()=>o.naturalWidth&&o.parentElement.style.setProperty("--ar",o.naturalWidth/o.naturalHeight);o.addEventListener("load",s),s(),b(".variant[data-v]").forEach(e=>e.addEventListener("click",()=>{const i=+e.dataset.v,a=t[i];K=i;const c=q.find($=>$.id===v.kitId);m("#kpShop").href=J(c,c?.variants[i]),m(".kp-price").textContent=Y(c,c?.variants[i]),b(".variant[data-v]").forEach($=>$.setAttribute("aria-checked",String($===e)));const k=m(".kp-hero__img");D(k,a.img),k.alt=a.title||`${v.name}: ${a.label}`,x||u.fromTo(k,{opacity:0,y:14},{opacity:1,y:0,duration:.7,ease:y.enter,overwrite:!0}),j(a),D(o,a.open||a.img),o.alt=`Caixa aberta do ${a.title||`${v.name}: ${a.label}`}`,a.title&&(m("#kpTitle").textContent=a.title,m("#kpCrumb").textContent=a.title,m(".kp-hero__tag").textContent=a.tag),m(".kp-box__photo figcaption").textContent=`${v.box.label} · ${a.label}`,C.innerHTML=ve(a),w.innerHTML=fe(a);const d=new URL(location.href);d.searchParams.set("v",i),history.replaceState(null,"",d)}));const r=m(".kp-stage"),h=m('.kp-soap[data-kind="soap"]'),n=ie(m(".kp-soaps"),()=>{const e=he(m("#kpSoapGL"),{initial:h?h.dataset.key:"aroeira",reduced:x});return b('.kp-soap[data-kind="soap"]').forEach(i=>re(()=>e.preload([i.dataset.key]))),e}),_=Object.fromEntries(_e(F(v)).map(e=>[e.id,e]));let p=!1,l=!1;const T=()=>{n&&(x?n.renderOnce():p&&l?n.start():n.stop())};O.create({trigger:".kp-soaps",start:"top bottom",end:"bottom top",onToggle:e=>{p=e.isActive,T()}});const S=b(".kp-soap");let N=null;const H=()=>{const e=innerHeight*.6,i=S.find(d=>{const $=d.getBoundingClientRect();return $.top<=e&&$.bottom>e})||(S[0].getBoundingClientRect().top>e?S[0]:S[S.length-1]),a=i.dataset.key;if(a===N)return;N=a;const c=_[a],k=c.kind==="soap"?"soap":c.model?a:c.photo?"photo":"flat";if(c.model){const d=m(`canvas[data-layer="${a}"]`,r);d._viewer||(d._viewer=ke(d,c.model,{reduced:x}))}if(c.kind==="soap"&&n?.show(a),k==="flat"&&(m(".kp-stage__flat").innerHTML=be(c.icon)),k==="photo"){const d=m(".kp-stage__photo");D(d,c.photo),d.alt=c.name}b(".kp-layer",r).forEach(d=>{const $=d.dataset.layer===k;d.id==="kpSoapGL"?d.classList.toggle("is-off",!$):d.hidden=!$}),l=k==="soap",T(),r.classList.toggle("is-flat",k==="flat"||k==="photo"),r.style.setProperty("--stage",c.color),m("#kpStageKicker").textContent=c.kicker,m("#kpSoapName").textContent=c.name,m("#kpSoapSci").textContent=c.line,S.forEach(d=>d.classList.toggle("is-active",d===i)),x||u.fromTo(r.querySelector(`[data-layer="${k}"]`),{opacity:0,scale:.96},{opacity:1,scale:1,duration:.6,ease:y.enter,overwrite:!0,clearProps:"transform,opacity"})};if(S.forEach(e=>O.create({trigger:e,start:"top 60%",end:"bottom 60%",onToggle:H})),O.addEventListener("refresh",H),H(),Q&&!x){const e=m(".cursor"),i=m(".cursor__label"),a=u.quickTo(e,"x",{duration:.45,ease:"power3.out"}),c=u.quickTo(e,"y",{duration:.45,ease:"power3.out"});addEventListener("pointermove",k=>{a(k.clientX),c(k.clientY)},{passive:!0}),document.addEventListener("pointerover",k=>{const d=k.target.closest("[data-cursor]"),$=k.target.closest("a, button, summary");e.classList.toggle("is-big",!!d&&!$),e.classList.toggle("is-link",!!$),d&&(i.textContent=d.dataset.cursor)})}xe()}function xe(){const t=m(".kp-curtain");if(x){t.remove();return}t.remove(),b(".reveal-title").forEach(g=>{const f=Z.create(g,{type:"words",mask:"words"});u.from(f.words,{yPercent:110,duration:1.1,ease:y.enter,stagger:.06,scrollTrigger:{trigger:g,start:"top 85%"}})}),u.from(".kp-intro__lead",{y:40,opacity:0,duration:1.2,ease:y.enter,scrollTrigger:{trigger:".kp-intro",start:"top 80%"}}),u.from(".kp-intro__more",{y:30,opacity:0,duration:1,delay:.15,ease:y.enter,scrollTrigger:{trigger:".kp-intro",start:"top 80%"}}),u.from(".kp-box__frame",{clipPath:"inset(0 50% 0 50% round 24px)",duration:1.3,ease:y.inOut,scrollTrigger:{trigger:".kp-box__grid",start:"top 75%"}}),u.from(".kp-hot",{scale:0,opacity:0,duration:.6,stagger:.08,delay:.8,ease:y.enter,scrollTrigger:{trigger:".kp-box__grid",start:"top 75%"}}),u.from(".kp-item",{y:16,opacity:0,duration:.6,stagger:.06,ease:y.soft,scrollTrigger:{trigger:"#kpList",start:"top 80%"}}),b(".kp-soap").forEach(g=>u.from(g.children,{y:24,opacity:0,duration:.8,stagger:.06,ease:y.soft,scrollTrigger:{trigger:g,start:"top 80%"}})),u.from(".kp-gift__photo img",{scale:1.15,duration:2,ease:y.enter,scrollTrigger:{trigger:".kp-gift",start:"top 75%"}}),u.from(".kp-chips li",{y:10,opacity:0,duration:.5,stagger:.05,ease:y.soft,scrollTrigger:{trigger:".kp-chips",start:"top 90%"}}),u.from(".kp-card",{y:40,opacity:0,duration:.9,stagger:.08,ease:y.soft,scrollTrigger:{trigger:".kp-more__grid",start:"top 85%"}}),u.to(".kp-w__ink",{opacity:1,stagger:.5,ease:"none",scrollTrigger:{trigger:".kp-reveal",start:"top top",end:"bottom bottom",scrub:!0}}),document.fonts.ready.then(()=>O.refresh())}if(!v&&W.has("k"))location.replace("/404.html");else if(v)try{ye()}catch(t){throw document.querySelector(".kp-curtain")?.remove(),t}
