import{d as a,c as i,m as l,h as u}from"./index--zB0vrRm.js";function p(e,t){switch(t.type){case"INC":return{...e,count:e.count+1,message:`Incremented to ${e.count+1}`};case"DEC":return{...e,count:e.count-1,message:`Decremented to ${e.count-1}`};case"RESET":return{count:0,message:"Counter reset."}}}const h=a(({globalStore:e})=>{const t=i(p,{count:0,message:""}),o=t.select(s=>s.count),c=t.select(s=>s.message),r=e.select(s=>s.theme),n=o.pipe(l(s=>s<0?"negative":""));return u`
    <section class="view home-view">
      <h1>Welcome to rxjs-spa</h1>
      <p>A framework built entirely on <strong>RxJS + TypeScript</strong>.</p>

      <div class="card">
        <h2>Counter — local MVU store</h2>
        <p class="counter-display">
          Count: <strong id="count-value" class="${n}">${o}</strong>
        </p>
        <div class="btn-row">
          <button @click=${()=>t.dispatch({type:"DEC"})}> − </button>
          <button @click=${()=>t.dispatch({type:"RESET"})}> Reset </button>
          <button @click=${()=>t.dispatch({type:"INC"})}> + </button>
        </div>
        <p class="count-msg">${c}</p>
      </div>

      <div class="card">
        <h2>Global store</h2>
        <p>Current theme: <strong id="theme-display">${r}</strong></p>
        <p class="hint">Use the nav bar to toggle it.</p>
      </div>

      <div class="card">
        <h2>Architecture</h2>
        <ul>
          <li><code>@rxjs-spa/store</code> — createStore / ofType / actions$</li>
          <li><code>@rxjs-spa/http</code>  — http.get/post/put/patch/delete + RemoteData</li>
          <li><code>@rxjs-spa/router</code>— hash-based router with :param matching</li>
          <li><code>@rxjs-spa/dom</code>   — sources (events, valueChanges…) + sinks (text, attr…)</li>
          <li><code>@rxjs-spa/core</code>  — remember() / rememberWhileSubscribed()</li>
        </ul>
      </div>
    </section>
    `});export{h as homeView};
