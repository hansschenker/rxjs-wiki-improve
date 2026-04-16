import{c as M,e as T,m as I,s as t,b as o,a as k,d as i,f as A}from"./binders-CpJGuPJc.js";import{o as B,d as c,m as u,f as C,S as m}from"./index-CLoFyHdQ.js";import{h as N}from"./public-DdHrndiV.js";import"./combineLatest-Dhh6hkHW.js";const P={name:t.string("").required("Name is required").minLength(2,"At least 2 characters"),email:t.string("").required("Email is required").email("Enter a valid email"),subject:t.string("").required("Subject is required").minLength(3,"At least 3 characters"),message:t.string("").required("Message is required").minLength(20,"At least 20 characters").maxLength(500,"Max 500 characters"),priority:t.string("medium").oneOf(["low","medium","high"],"Choose a valid priority")};function F(r){r.innerHTML=`
    <section class="view">
      <h1>Contact Us</h1>
      <p>Fill in the form below and we'll get back to you.</p>

      <div id="submit-success" class="alert alert-success hidden">
        Message sent! We'll be in touch soon.
      </div>
      <div id="submit-error" class="alert alert-error hidden">
        Something went wrong. Please try again.
      </div>

      <form id="contact-form" novalidate>
        <div class="field-group">
          <label for="field-name">Name</label>
          <input id="field-name" type="text" placeholder="Your name" />
          <span class="field-error" id="error-name"></span>
        </div>

        <div class="field-group">
          <label for="field-email">Email</label>
          <input id="field-email" type="email" placeholder="you@example.com" />
          <span class="field-error" id="error-email"></span>
        </div>

        <div class="field-group">
          <label for="field-subject">Subject</label>
          <input id="field-subject" type="text" placeholder="What's this about?" />
          <span class="field-error" id="error-subject"></span>
        </div>

        <div class="field-group">
          <label for="field-priority">Priority</label>
          <select id="field-priority">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
          <span class="field-error" id="error-priority"></span>
        </div>

        <div class="field-group">
          <label for="field-message">Message</label>
          <textarea id="field-message" rows="5" placeholder="Tell us more…"></textarea>
          <span class="field-error" id="error-message"></span>
          <span class="char-count" id="char-count">0 / 500</span>
        </div>

        <div class="form-actions">
          <button type="submit" id="submit-btn">Send message</button>
          <button type="button" id="reset-btn">Reset</button>
          <span id="loading-indicator" class="loading-text hidden">Sending…</span>
        </div>
      </form>
    </section>
  `;const p=r.querySelector("#field-name"),b=r.querySelector("#field-email"),f=r.querySelector("#field-subject"),h=r.querySelector("#field-message"),g=r.querySelector("#field-priority"),y=r.querySelector("#error-name"),v=r.querySelector("#error-email"),S=r.querySelector("#error-subject"),E=r.querySelector("#error-message"),q=r.querySelector("#error-priority"),w=r.querySelector("#char-count"),L=r.querySelector("#submit-btn"),a=r.querySelector("#reset-btn"),j=r.querySelector("#loading-indicator"),d=r.querySelector("#submit-success"),n=r.querySelector("#submit-error"),l=r.querySelector("#contact-form"),e=M(P),$=e.actions$.pipe(B("SUBMIT_START"),T(()=>{if(!e.isValid())return e.submitEnd(!1),c(null);const s=e.getValues();return N.post("https://jsonplaceholder.typicode.com/posts",s).pipe(u(()=>(e.submitEnd(!0),null)),C(()=>(e.submitEnd(!1),c(null))))}));return I(r,()=>[o(p,e,"name"),o(b,e,"email"),o(f,e,"subject"),o(h,e,"message"),k(g,e,"priority"),i(y,e.field("name").showError$),i(v,e.field("email").showError$),i(S,e.field("subject").showError$),i(E,e.field("message").showError$),i(q,e.field("priority").showError$),e.field("message").value$.subscribe(s=>{w.textContent=`${s.length} / 500`}),A(j,"hidden")(e.submitting$.pipe(u(s=>!s))),e.submitting$.subscribe(s=>{L.disabled=s}),$.subscribe(),e.actions$.subscribe(s=>{s.type==="SUBMIT_END"&&(d.classList.toggle("hidden",!s.ok),n.classList.toggle("hidden",s.ok),s.ok&&l.classList.add("hidden")),s.type==="RESET"&&(d.classList.add("hidden"),n.classList.add("hidden"),l.classList.remove("hidden"))}),(()=>{const s=x=>{x.preventDefault(),e.submit()};return l.addEventListener("submit",s),new m(()=>l.removeEventListener("submit",s))})(),(()=>{const s=()=>e.reset();return a.addEventListener("click",s),new m(()=>a.removeEventListener("click",s))})()])}export{F as contactView};
