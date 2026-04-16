import{b as v,m as e,w as o,h as t}from"./index-CLoFyHdQ.js";import{d as g}from"./component-BqJEyUpA.js";import{t as d,i as $,a as f,b as a}from"./public-DdHrndiV.js";import{a as u}from"./api-DVHugvWC.js";import{c as w}from"./combineLatest-Dhh6hkHW.js";function y(){return n=>n.pipe(v({bufferSize:1,refCount:!1}))}const R=g(({router:n,params:b})=>{const c=b.id,r=w([u.users.get(c).pipe(d()),u.posts.byUser(c).pipe(d())]).pipe(y()),p=r.pipe(e(([s])=>s)),l=r.pipe(e(([,s])=>s)),h=r.pipe(e(([s,i])=>$(s)||$(i))),m=r.pipe(e(([s,i])=>f(s)?s.error:f(i)?i.error:null));return t`
    <section class="view">
      <button class="btn-back" @click=${()=>n.navigate("/users")}>← Back to Users</button>

      ${o(h,()=>t`<p class="status">Loading user…</p>`)}
      ${o(m.pipe(e(s=>s!==null)),()=>t`<p class="status error">${m}</p>`)}

      ${o(p.pipe(e(s=>a(s))),()=>t`
          <div class="profile-card">
            <div class="profile-avatar">
              ${p.pipe(e(s=>a(s)?s.data.name.charAt(0).toUpperCase():""))}
            </div>
            <div class="profile-info">
              <h1>${p.pipe(e(s=>a(s)?s.data.name:""))}</h1>
              <p class="user-email">${p.pipe(e(s=>a(s)?s.data.email:""))}</p>
              <p>${p.pipe(e(s=>a(s)?s.data.phone:""))}</p>
              <p>${p.pipe(e(s=>a(s)?s.data.website:""))}</p>
              <p>${p.pipe(e(s=>a(s)?s.data.company.name:""))}</p>
            </div>
          </div>
        `)}

      ${o(l.pipe(e(s=>a(s))),()=>t`
          <h2 class="section-title">Posts</h2>
          <ul class="post-list">
            ${l.pipe(e(s=>a(s)?s.data.map(i=>t`
                    <li class="post-card">
                      <h3>${i.title}</h3>
                      <p>${i.body}</p>
                    </li>
                  `):[]))}
          </ul>
        `)}
    </section>
  `});export{R as userDetailView};
