import{c as q,e as I,m as L,s as l,b as u,d as c,f as T}from"./binders-CpJGuPJc.js";import{o as $,d as m,m as p,f as x,S as P}from"./index-CLoFyHdQ.js";import{a as U}from"./api-DVHugvWC.js";import{A}from"./public-DdHrndiV.js";import"./combineLatest-Dhh6hkHW.js";const C={username:l.string("").required("Username is required").minLength(2,"At least 2 characters"),password:l.string("").required("Password is required")};function _(s,n,f){s.innerHTML=`
    <section class="view login-view">
      <h1>Sign In</h1>
      <p>Sign in to access protected pages.</p>
      <p class="hint">Demo credentials: <code>emilys</code> / <code>emilyspass</code></p>

      <div id="login-error" class="alert alert-error hidden"></div>

      <form id="login-form" novalidate>
        <div class="field-group">
          <label for="field-username">Username</label>
          <input id="field-username" type="text" placeholder="emilys" autocomplete="username" />
          <span class="field-error" id="error-username"></span>
        </div>

        <div class="field-group">
          <label for="field-password">Password</label>
          <input id="field-password" type="password" placeholder="Password" autocomplete="current-password" />
          <span class="field-error" id="error-password"></span>
        </div>

        <div class="form-actions">
          <button type="submit" id="submit-btn">Sign In</button>
          <span id="loading-indicator" class="loading-text hidden">Signing in…</span>
        </div>
      </form>
    </section>
  `;const g=s.querySelector("#field-username"),b=s.querySelector("#field-password"),w=s.querySelector("#error-username"),h=s.querySelector("#error-password"),t=s.querySelector("#login-error"),y=s.querySelector("#submit-btn"),S=s.querySelector("#loading-indicator"),d=s.querySelector("#login-form"),e=q(C),v=e.actions$.pipe($("SUBMIT_START"),I(()=>{if(!e.isValid())return e.submitEnd(!1),m(null);const{username:r,password:o}=e.getValues();return U.auth.login({username:r,password:o}).pipe(p(i=>{const a={id:i.id,username:i.username,email:i.email,token:i.accessToken};n.dispatch({type:"LOGIN_SUCCESS",user:a}),e.submitEnd(!0);const E=n.getState().redirectPath??"/";return f.navigate(E),null}),x(i=>{const a=i instanceof A&&i.status===400?"Invalid credentials. Try emilys / emilyspass":"Login failed — please try again.";return t.textContent=a,t.classList.remove("hidden"),e.submitEnd(!1),m(null)}))}));return L(s,()=>[u(g,e,"username"),u(b,e,"password"),c(w,e.field("username").showError$),c(h,e.field("password").showError$),e.values$.subscribe(()=>t.classList.add("hidden")),T(S,"hidden")(e.submitting$.pipe(p(r=>!r))),e.submitting$.subscribe(r=>{y.disabled=r}),v.subscribe(),(()=>{const r=o=>{o.preventDefault(),e.submit()};return d.addEventListener("submit",r),new P(()=>d.removeEventListener("submit",r))})()])}export{_ as loginView};
