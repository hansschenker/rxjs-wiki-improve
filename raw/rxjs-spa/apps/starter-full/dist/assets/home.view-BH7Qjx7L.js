import{c as a,m as i,h as n}from"./index-CLoFyHdQ.js";import{d as l}from"./component-BqJEyUpA.js";function d(o,e){switch(e.type){case"INC":return{count:o.count+1};case"DEC":return{count:o.count-1};case"RESET":return{count:0}}}const h=l(({appStore:o})=>{const e=a(d,{count:0}),c=e.select(t=>t.count),s=c.pipe(i(t=>t<0?"count negative":"count")),r=o.select(t=>t.theme);return n`
    <section class="view">
      <h1>Welcome to rxjs-spa</h1>
      <p>A full-featured SPA framework built on <strong>RxJS + TypeScript</strong>.</p>

      <div class="card">
        <h2>Counter — local MVU store</h2>
        <p class="${s}">${c}</p>
        <div class="btn-row">
          <button @click=${()=>e.dispatch({type:"DEC"})}>−</button>
          <button @click=${()=>e.dispatch({type:"RESET"})}>Reset</button>
          <button @click=${()=>e.dispatch({type:"INC"})}>+</button>
        </div>
      </div>

      <div class="card">
        <h2>Global State</h2>
        <p>Current theme: <strong>${r}</strong></p>
        <p class="hint">Use the nav bar toggle to switch themes.</p>
      </div>

      <div class="card">
        <h2>What's included</h2>
        <ul>
          <li><code>@rxjs-spa/store</code> — MVU state management</li>
          <li><code>@rxjs-spa/router</code> — Routing with lazy loading &amp; guards</li>
          <li><code>@rxjs-spa/http</code> — HTTP client with RemoteData</li>
          <li><code>@rxjs-spa/dom</code> — Reactive DOM bindings &amp; templates</li>
          <li><code>@rxjs-spa/forms</code> — Schema-validated reactive forms</li>
          <li><code>@rxjs-spa/persist</code> — localStorage persistence</li>
          <li><code>@rxjs-spa/errors</code> — Global error handling</li>
          <li><code>@rxjs-spa/core</code> — remember() / rememberWhileSubscribed()</li>
        </ul>
      </div>
    </section>
  `});export{h as homeView};
