import{p as C,b as O,f as h,O as S,g as k,i as E,j as A,k as y,d as F,c as w,o as H,s as R,m as i,a as T,h as g,e as P}from"./index--zB0vrRm.js";import{a as $}from"./api-CwkdL2tv.js";var j=Array.isArray,U=Object.getPrototypeOf,I=Object.prototype,L=Object.keys;function V(s){if(s.length===1){var r=s[0];if(j(r))return{args:r,keys:null};if(x(r)){var t=L(r);return{args:t.map(function(a){return r[a]}),keys:t}}}return{args:s,keys:null}}function x(s){return s&&typeof s=="object"&&U(s)===I}function D(s,r){return s.reduce(function(t,a,o){return t[a]=r[o],t},{})}function M(){for(var s=[],r=0;r<arguments.length;r++)s[r]=arguments[r];var t=C(s),a=O(s),o=V(s),n=o.args,l=o.keys;if(n.length===0)return h([],t);var p=new S(J(n,t,l?function(c){return D(l,c)}:y));return a?p.pipe(k(a)):p}function J(s,r,t){return t===void 0&&(t=y),function(a){m(r,function(){for(var o=s.length,n=new Array(o),l=o,p=o,c=function(f){m(r,function(){var v=h(s[f],r),e=!1;v.subscribe(A(a,function(d){n[f]=d,e||(e=!0,p--),p||a.next(t(n.slice()))},function(){--l||a.complete()}))},a)},u=0;u<o;u++)c(u)},a)}}function m(s,r,t){s?E(t,s,r):r()}function K(s,r){switch(r.type){case"FETCH":return{...s,loading:!0,error:null};case"FETCH_SUCCESS":return{...s,loading:!1,user:r.user,posts:r.posts};case"FETCH_ERROR":return{...s,loading:!1,error:r.error}}}const N={user:null,posts:[],loading:!1,error:null},z=F(({router:s,params:r})=>{const{id:t}=r,a=w(K,N);a.actions$.pipe(H("FETCH"),R(({userId:e})=>M([$.users.get(e),$.posts.byUser(e)]).pipe(i(([d,b])=>({type:"FETCH_SUCCESS",user:d,posts:b})),T(P,{fallback:{type:"FETCH_ERROR",error:"Failed to load user details"},context:"userDetailView/FETCH"})))).subscribe(e=>a.dispatch(e)),t&&a.dispatch({type:"FETCH",userId:t});const o=a.select(e=>e.user!==null),n=a.select(e=>e.user),l=a.select(e=>e.posts),p=a.select(e=>e.loading),c=a.select(e=>e.error),u=p.pipe(i(e=>e?"loading visible":"loading hidden")),f=c.pipe(i(e=>e?"error visible":"error hidden")),v=o.pipe(i(e=>e?"visible":"hidden"));return g`
    <section class="view user-detail-view">
      <p><a id="back-link" href="${s.link("/users")}" class="back-link">← All users</a></p>

      <div id="loading-msg" class="${u}">Loading…</div>
      <div id="error-msg"   class="${f}">${c.pipe(i(e=>e??""))}</div>

      <!-- Profile Card -->
      <div id="profile-card" class="card profile-card ${v}">
        <div class="profile-header">
          <div class="profile-avatar">
            ${n.pipe(i(e=>e?.name.charAt(0).toUpperCase()??""))}
          </div>
          <div>
            <h1 id="user-name">${n.pipe(i(e=>e?.name??""))}</h1>
            <p id="user-username" class="muted">${n.pipe(i(e=>e?`@${e.username}`:""))}</p>
          </div>
        </div>
        <div class="profile-meta">
          <span>✉ <span>${n.pipe(i(e=>e?.email??""))}</span></span>
          <span>📞 <span>${n.pipe(i(e=>e?.phone??""))}</span></span>
          <span>🌐 <a href="${n.pipe(i(e=>e?`https://${e.website}`:""))}" target="_blank">
            ${n.pipe(i(e=>e?.website??""))}
          </a></span>
          <span>🏢 <span>${n.pipe(i(e=>e?.company.name??""))}</span></span>
          <span>📍 <span>${n.pipe(i(e=>e?`${e.address.street}, ${e.address.city}`:""))}</span></span>
        </div>
      </div>

      <!-- Posts Section -->
      <div id="posts-section" class="${v}">
        <h2>Posts</h2>
        <ul id="post-list" class="post-list">
          ${l.pipe(i(e=>e.map(d=>g`
              <li class="post-item">
                <strong class="post-title">${d.title}</strong>
                <p class="post-body">${d.body}</p>
              </li>
            `)))}
        </ul>
      </div>
    </section>
  `});export{z as userDetailView};
