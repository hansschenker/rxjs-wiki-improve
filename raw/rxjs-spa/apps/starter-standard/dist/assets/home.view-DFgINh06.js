import{m as n,h as r}from"./index-5Q6H4mJc.js";import{d as i}from"./component-nm2Lc4kv.js";import{c as a}from"./public-DXSXWOWY.js";function d(e,t){switch(t.type){case"INC":return{count:e.count+1};case"DEC":return{count:e.count-1};case"RESET":return{count:0}}}const m=i(e=>{const t=a(d,{count:0}),c=t.select(o=>o.count),s=c.pipe(n(o=>o<0?"count negative":"count"));return r`
    <section class="view">
      <h1>Home</h1>
      <p>Welcome to the <strong>rxjs-spa</strong> standard starter template.</p>

      <div class="card">
        <h2>Counter</h2>
        <p class="${s}">${c}</p>
        <div class="btn-row">
          <button @click=${()=>t.dispatch({type:"DEC"})}>−</button>
          <button @click=${()=>t.dispatch({type:"RESET"})}>Reset</button>
          <button @click=${()=>t.dispatch({type:"INC"})}>+</button>
        </div>
      </div>

      <div class="card">
        <h2>What's included</h2>
        <ul>
          <li><code>@rxjs-spa/store</code> — MVU state management</li>
          <li><code>@rxjs-spa/router</code> — Hash-based routing with lazy loading</li>
          <li><code>@rxjs-spa/http</code> — HTTP client with RemoteData</li>
          <li><code>@rxjs-spa/dom</code> — Reactive DOM bindings &amp; templates</li>
          <li><code>@rxjs-spa/core</code> — remember() / rememberWhileSubscribed()</li>
        </ul>
      </div>
    </section>
  `});export{m as homeView};
