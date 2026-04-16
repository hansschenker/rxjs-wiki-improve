import{d as h,c as m,o as C,s as $,m as i,a as f,h as l,e as g}from"./index--zB0vrRm.js";import{a as E}from"./api-CwkdL2tv.js";function y(s,r){switch(r.type){case"FETCH":return{...s,loading:!0,error:null};case"FETCH_SUCCESS":return{...s,loading:!1,users:r.users};case"FETCH_ERROR":return{...s,loading:!1,error:r.error};case"SET_SEARCH":return{...s,search:r.query}}}const T={users:[],loading:!1,error:null,search:""};function b(s,r){return l`
    <li class="user-card">
      <div class="user-avatar">${s.name.charAt(0).toUpperCase()}</div>
      <div class="user-info">
        <strong class="user-name">${s.name}</strong>
        <span class="user-email">${s.email}</span>
        <span class="user-company">${s.company.name}</span>
      </div>
      <a class="user-link btn-outline" href="${r.link(`/users/${s.id}`)}">
        View profile →
      </a>
    </li>
  `}const H=h(({globalStore:s,router:r})=>{const a=m(y,T);a.actions$.pipe(C("FETCH"),$(()=>E.users.list().pipe(i(e=>({type:"FETCH_SUCCESS",users:e})),f(g,{fallback:{type:"FETCH_ERROR",error:"Failed to load users"},context:"usersView/FETCH"})))).subscribe(e=>a.dispatch(e)),a.dispatch({type:"FETCH"});const n=a.state$.pipe(i(e=>e.search.trim()?e.users.filter(t=>t.name.toLowerCase().includes(e.search.toLowerCase())):e.users)),c=a.select(e=>e.loading),o=a.select(e=>e.error),p=c.pipe(i(e=>e?"loading visible":"loading hidden")),d=o.pipe(i(e=>e?"error visible":"error hidden")),u=o.pipe(i(e=>e??""));return l`
    <section class="view users-view">
      <h1>Users</h1>
      <p>Data from <a href="https://jsonplaceholder.typicode.com" target="_blank">JSONPlaceholder</a></p>

      <div class="toolbar">
        <input 
          id="search-input" 
          type="search" 
          placeholder="Filter by name…" 
          @input=${e=>a.dispatch({type:"SET_SEARCH",query:e.target.value})}
        />
        <button id="refresh-btn" @click=${()=>a.dispatch({type:"FETCH"})}>
          Refresh
        </button>
      </div>

      <p id="error-msg" class="${d}">${u}</p>
      <p id="loading-msg" class="${p}">Loading…</p>

      <ul id="user-list" class="user-list">
        ${n.pipe(i(e=>e.map(t=>b(t,r))))}
      </ul>
    </section>
  `});export{H as usersView};
