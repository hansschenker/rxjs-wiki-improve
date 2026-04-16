import{c as u,o as d,s as h,m as t,a as m,h as o,e as C}from"./index-CLoFyHdQ.js";import{d as f}from"./component-BqJEyUpA.js";import{a as $}from"./api-DVHugvWC.js";import"./public-DdHrndiV.js";function E(a,s){switch(s.type){case"FETCH":return{...a,loading:!0,error:null};case"FETCH_SUCCESS":return{...a,loading:!1,users:s.users};case"FETCH_ERROR":return{...a,loading:!1,error:s.error};case"SET_SEARCH":return{...a,search:s.query}}}const y={users:[],loading:!1,error:null,search:""},g=f(({router:a})=>{const s=u(E,y);s.actions$.pipe(d("FETCH"),h(()=>$.users.list().pipe(t(e=>({type:"FETCH_SUCCESS",users:e})),m(C,{fallback:{type:"FETCH_ERROR",error:"Failed to load users"},context:"usersView/FETCH"})))).subscribe(e=>s.dispatch(e)),s.dispatch({type:"FETCH"});const i=s.state$.pipe(t(e=>{const r=e.search.trim().toLowerCase();return r?e.users.filter(p=>p.name.toLowerCase().includes(r)):e.users})),l=s.select(e=>e.loading).pipe(t(e=>e?"status visible":"status hidden")),c=s.select(e=>e.error).pipe(t(e=>e?"status error visible":"status hidden")),n=s.select(e=>e.error??"");return o`
    <section class="view">
      <h1>Users</h1>
      <p>Data from <a href="https://jsonplaceholder.typicode.com" target="_blank">JSONPlaceholder</a></p>

      <div class="toolbar">
        <input
          type="search"
          placeholder="Filter by name…"
          @input=${e=>s.dispatch({type:"SET_SEARCH",query:e.target.value})}
        />
        <button @click=${()=>s.dispatch({type:"FETCH"})}>Refresh</button>
      </div>

      <p class="${c}">${n}</p>
      <p class="${l}">Loading…</p>

      <ul class="user-list">
        ${i.pipe(t(e=>e.map(r=>o`
            <li class="user-card">
              <div class="user-avatar">${r.name.charAt(0).toUpperCase()}</div>
              <div class="user-info">
                <strong>${r.name}</strong>
                <span class="user-email">${r.email}</span>
                <span class="user-company">${r.company.name}</span>
              </div>
              <a class="btn-outline" href="${a.link(`/users/${r.id}`)}">
                View profile →
              </a>
            </li>
          `)))}
      </ul>
    </section>
  `});export{g as usersView};
