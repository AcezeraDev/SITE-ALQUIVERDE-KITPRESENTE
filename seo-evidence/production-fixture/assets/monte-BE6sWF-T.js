const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/lightScenes-DYKsGeCq.js","assets/imageSizes-CC1CmFLw.js","assets/fallback-BBI-OHJT.js","assets/kits-C1ZM7AHO.js","assets/fullScenes-BzIjomfg.js","assets/three-0cK9tT28.js","assets/kit3d-1z_nsmry.js","assets/anim-CBgaOXZs.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css              */import{d as I,i as q,a as x,_ as C,c as P,b as B}from"./whatsapp-DdmnFh01.js";import{g as d,S as f,a as A,L as O}from"./anim-CBgaOXZs.js";import{h as j,I as m}from"./kits-C1ZM7AHO.js";import{a as D,l as N}from"./bag-3fddWHcR.js";import"./imageSizes-CC1CmFLw.js";I();q();const{initBuilder:R,SOAP_KEYS:F}=await(x?C(()=>import("./lightScenes-DYKsGeCq.js"),__vite__mapDeps([0,1,2,3])):C(()=>import("./fullScenes-BzIjomfg.js"),__vite__mapDeps([4,2,1,5,6,7])));d.registerPlugin(f,A);const a=(e,s=document)=>s.querySelector(e),h=(e,s=document)=>[...s.querySelectorAll(e)],k=x||matchMedia("(prefers-reduced-motion: reduce)").matches,w=!x&&matchMedia("(hover: hover) and (pointer: fine)").matches,b={enter:"expo.out",soft:"power3.out"},g=[{n:3,extras:2},{n:6,extras:3},{n:9,extras:4}],y=j.map(e=>({key:e.img,name:e.name,line:e.line,color:e.color})),H=["essencia-morango","essencia-natal","essencia-chocolate","oleo-canela","oleo-cravo","vela","bucha"],V={vela:1.25,bucha:.8},E=H.filter(e=>m[e]?.photo).map(e=>({id:e,...m[e],height:V[e]||1.5}));let l;try{l=JSON.parse(sessionStorage.getItem("alquiverde:montagem-modo")),sessionStorage.removeItem("alquiverde:montagem-modo")}catch{}const t={size:6,picks:[],extras:[]};l&&g.some(e=>e.n===l.size)&&Array.isArray(l.picks)&&Array.isArray(l.extras)&&(t.size=l.size,t.picks=l.picks.filter(e=>y.some(s=>s.key===e)).slice(0,t.size),t.extras=l.extras.filter(e=>E.some(s=>s.id===e)).slice(0,g.find(e=>e.n===t.size).extras));addEventListener("experiencechange",()=>{try{sessionStorage.setItem("alquiverde:montagem-modo",JSON.stringify(t))}catch{}});const $=()=>g.find(e=>e.n===t.size).extras,S=e=>t.picks.filter(s=>s===e).length,M=e=>y.find(s=>s.key===e).name,T='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',X='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',z='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>',G=e=>`<span class="mk-size__dots" style="--rows:${e/3}">${"<i></i>".repeat(e)}</span>`;a("#mkPanel").innerHTML=`
  <div class="mk-step" aria-labelledby="mkS1">
    <p class="mk-step__num">01</p>
    <h2 id="mkS1">Tamanho da caixa</h2>
    <div class="mk-sizes" role="radiogroup" aria-labelledby="mkS1">
      ${g.map(e=>`
      <button type="button" class="mk-size" role="radio" aria-checked="${e.n===t.size}" data-size="${e.n}">
        ${G(e.n)}
        <span class="mk-size__n">${e.n} sabonetes</span>
        <span class="mk-size__x">+ até ${e.extras} extras</span>
      </button>`).join("")}
    </div>
  </div>

  <div class="mk-step" aria-labelledby="mkS2">
    <p class="mk-step__num">02</p>
    <h2 id="mkS2">Sabonetes</h2>
    <div class="mk-progress" aria-hidden="true"><span id="mkBar"></span></div>
    <p class="mk-need" id="mkNeed" aria-live="polite"></p>
    <ul class="mk-soaps">
      ${y.map(e=>`
      <li class="mk-soap" data-key="${e.key}" style="--ing:${e.color}">
        <img src="/soaps/${e.key}.webp" alt="" width="72" height="72" loading="lazy" decoding="async" />
        <span class="mk-soap__txt"><b>${e.name}</b><small>${e.line}</small></span>
        <span class="mk-qty">
          <button type="button" class="mk-qty__btn" data-act="minus" aria-label="Tirar um sabonete de ${e.name}">${X}</button>
          <output class="mk-qty__n" aria-label="Sabonetes de ${e.name} na caixa">0</output>
          <button type="button" class="mk-qty__btn" data-act="plus" aria-label="Pôr um sabonete de ${e.name}">${T}</button>
        </span>
      </li>`).join("")}
    </ul>
    <div class="mk-actions">
      <button type="button" class="mk-ghost" id="mkSurprise">Surpreenda-me</button>
      <button type="button" class="mk-ghost" id="mkClear">Limpar</button>
    </div>
  </div>

  <div class="mk-step" aria-labelledby="mkS3">
    <p class="mk-step__num">03</p>
    <h2 id="mkS3">Extras <small id="mkExtraCap"></small></h2>
    <ul class="mk-extras">
      ${E.map(e=>`
      <li><button type="button" class="mk-extra" aria-pressed="false" data-id="${e.id}" style="--ing:${e.color}">
        <span class="mk-extra__img"><img src="${e.photo}" alt="" loading="lazy" decoding="async" /></span>
        <span class="mk-extra__name">${e.name}</span>
        <span class="mk-extra__kind">${e.kind||""}</span>
        <span class="mk-extra__check" aria-hidden="true">${T}</span>
      </button></li>`).join("")}
    </ul>
  </div>

  <div class="mk-step mk-summary" aria-labelledby="mkS4">
    <p class="mk-step__num">04</p>
    <h2 id="mkS4">Seu kit</h2>
    <ul class="mk-list" id="mkList"></ul>
    <p class="mk-price">Preço em breve</p>
    <div class="mk-cta">
      <button type="button" class="kit__add" id="mkClose" disabled><span>Fechar a caixa</span>${z}</button>
      <div class="mk-done" id="mkDone" hidden>
        <button type="button" class="kit__add" id="mkAdd"><span>Adicionar à sacola</span>${z}</button>
        <button type="button" class="mk-ghost" id="mkReopen">Abrir de novo</button>
      </div>
    </div>
  </div>`;x&&(a(".mk-sub").textContent="Escolha a caixa, combine os sabonetes e acrescente os extras. Acompanhe cada detalhe do seu presente na prévia.");const u=R(a("#mkGL"),{reduced:k});F.forEach(e=>P(()=>u.preload([e])));function p(){const e=t.extras.map(i=>E.find(c=>c.id===i));u.update({size:t.size,soaps:t.picks,extras:e});const s=t.size-t.picks.length;a("#mkBar").style.transform=`scaleX(${t.picks.length/t.size})`,a("#mkNeed").textContent=s>0?`${t.picks.length} de ${t.size} · faltam ${s}`:`${t.size} de ${t.size} · caixa completa`,a("#mkCount").textContent=`${t.picks.length}/${t.size} sabonetes${t.extras.length?` · ${t.extras.length} extra${t.extras.length>1?"s":""}`:""}`,h(".mk-soap").forEach(i=>{const c=i.dataset.key,v=S(c);a(".mk-qty__n",i).textContent=v,i.classList.toggle("is-on",v>0),a('[data-act="minus"]',i).disabled=v===0,a('[data-act="plus"]',i).disabled=s===0}),a("#mkExtraCap").textContent=`opcional · até ${$()}`,h(".mk-extra").forEach(i=>{const c=t.extras.includes(i.dataset.id);i.setAttribute("aria-pressed",String(c)),i.disabled=!c&&t.extras.length>=$()}),h(".mk-size").forEach(i=>i.setAttribute("aria-checked",String(+i.dataset.size===t.size)));const o=[...new Set(t.picks)].map(i=>`<li><b>${S(i)} ×</b> Sabonete Vegetal de ${M(i)} <small>90 g</small></li>`),n=t.extras.map(i=>`<li><b>1 ×</b> ${m[i].name}${m[i].sub?` <small>${m[i].sub}</small>`:""}</li>`);a("#mkList").innerHTML=[`<li><b>1 ×</b> Caixa de presente para ${t.size} sabonetes</li>`,...o,...n].join("");const r=a("#mkClose");r.disabled=s>0,a("span",r).textContent=s>0?`Faltam ${s} sabonete${s>1?"s":""}`:"Fechar a caixa",L(!1)}function L(e){a("#mkClose").hidden=e,a("#mkDone").hidden=!e}a(".mk-sizes").addEventListener("click",e=>{const s=e.target.closest(".mk-size");s&&(t.size=+s.dataset.size,t.picks=t.picks.slice(0,t.size),t.extras=t.extras.slice(0,$()),p())});a(".mk-soaps").addEventListener("click",e=>{const s=e.target.closest(".mk-qty__btn");if(!s)return;const o=s.closest(".mk-soap").dataset.key;if(s.dataset.act==="plus"&&t.picks.length<t.size&&t.picks.push(o),s.dataset.act==="minus"){const n=t.picks.lastIndexOf(o);n>=0&&t.picks.splice(n,1)}p()});a("#mkSurprise").addEventListener("click",()=>{const e=y.map(s=>s.key);for(;t.picks.length<t.size;){const s=e.filter(o=>o!==t.picks[t.picks.length-1]);t.picks.push(s[Math.floor(Math.random()*s.length)])}p()});a("#mkClear").addEventListener("click",()=>{t.picks=[],p()});a(".mk-extras").addEventListener("click",e=>{const s=e.target.closest(".mk-extra");if(!s||s.disabled)return;const o=s.dataset.id;t.extras=t.extras.includes(o)?t.extras.filter(n=>n!==o):[...t.extras,o],p()});a("#mkClose").addEventListener("click",()=>{u.close(),L(!0),a("#mkAdd").focus()});a("#mkReopen").addEventListener("click",()=>{u.open(),L(!1),a("#mkClose").focus()});a("#mkAdd").addEventListener("click",()=>{const e=[...new Set(t.picks)].map(r=>`${S(r)} ${M(r)}`),s=t.extras.map(r=>m[r].name),o=D({name:`Kit Monte o seu · ${t.size} sabonetes`,variant:[e.join(" · "),s.length?`+ ${s.join(", ")}`:""].filter(Boolean).join(" "),img:u.snapshot()});a("#bagCount").textContent=o;const n=a("#mkToast");n.innerHTML=`Seu kit foi para a sacola. <a href="/?sacola">Ver sacola ${z}</a>`,n.hidden=!1,k||d.fromTo(n,{y:30,opacity:0},{y:0,opacity:1,duration:.6,ease:b.enter}),clearTimeout(n._h),n._h=setTimeout(()=>{n.hidden=!0},6e3)});a("#bagCount").textContent=N().length;p();let _=null;k||(_=new O({lerp:.09,wheelMultiplier:.95}),_.on("scroll",f.update),d.ticker.add(e=>_.raf(e*1e3)),d.ticker.lagSmoothing(0));const J=a("#header");f.create({start:"top -160",end:"max",onUpdate:e=>J.classList.toggle("is-hidden",e.direction===1)});w&&h("[data-magnetic]").forEach(e=>B(e));if(w&&!k){const e=a(".cursor"),s=a(".cursor__label"),o=d.quickTo(e,"x",{duration:.45,ease:"power3.out"}),n=d.quickTo(e,"y",{duration:.45,ease:"power3.out"});addEventListener("pointermove",r=>{o(r.clientX),n(r.clientY)},{passive:!0}),document.addEventListener("pointerover",r=>{const i=r.target.closest("[data-cursor]"),c=r.target.closest("a, button");e.classList.toggle("is-big",!!i&&!c),e.classList.toggle("is-link",!!c),i&&(s.textContent=i.dataset.cursor)})}if(!k){const e=A.create(".mk-title",{type:"words,chars",mask:"lines"});d.timeline({defaults:{ease:b.enter}}).from(e.chars,{yPercent:110,duration:1.2,stagger:.025},.1).from(".mk-head .eyebrow, .mk-sub, .mk-head .kp-crumbs",{y:16,opacity:0,duration:.8,stagger:.06,ease:b.soft},.3).from(".mk-stage",{y:40,opacity:0,duration:1.1},.4).from(".mk-step",{y:24,opacity:0,duration:.8,stagger:.08,ease:b.soft},.55)}document.fonts.ready.then(()=>f.refresh());
