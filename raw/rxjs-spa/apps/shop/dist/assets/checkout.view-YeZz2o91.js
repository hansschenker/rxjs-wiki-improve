import{o as ce,e as G,r as pe,k as v,u as fe,l as he,B as me,v as ve,x as ye,s as be,m as p,S as U,y as Z,h as ge,z as W,A as Se}from"./index-AjhpY2AS.js";import{c as Q,h as Ee,t as $e,i as qe,b as Ne}from"./public-CMCfNiD-.js";function Te(i,e){return ce(function(t,r){var l=0,f=null,b=!1;t.subscribe(G(r,function(n){f||(f=G(r,void 0,function(){f=null,b&&r.complete()}),pe(i(n,l++)).subscribe(f))},function(){b=!0,!f&&r.complete()}))})}function we(i,e){return t=>t.pipe(v()).subscribe({next:r=>{i.classList.toggle(e,!!r)},error:r=>fe(r,"classToggle")})}class z{initial;validators;constructor(e,t=[]){this.initial=e,this.validators=t}clone(e){return new z(this.initial,[...this.validators,e])}validate(e){for(const t of this.validators){const r=t(e);if(r!==null)return r}return null}required(e="Required"){return this.clone(t=>t.trim().length===0?e:null)}minLength(e,t=`Min ${e} characters`){return this.clone(r=>r.length<e?t:null)}maxLength(e,t=`Max ${e} characters`){return this.clone(r=>r.length>e?t:null)}email(e="Invalid email address"){const t=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;return this.clone(r=>r.length>0&&!t.test(r)?e:null)}pattern(e,t="Invalid format"){return this.clone(r=>r.length>0&&!e.test(r)?t:null)}oneOf(e,t="Invalid option"){return this.clone(r=>e.includes(r)?null:t)}refine(e,t="Invalid"){return this.clone(r=>e(r)?null:t)}}class B{initial;validators;constructor(e,t=[]){this.initial=e,this.validators=t}clone(e){return new B(this.initial,[...this.validators,e])}validate(e){for(const t of this.validators){const r=t(e);if(r!==null)return r}return null}required(e="Required"){return this.clone(t=>isNaN(t)?e:null)}min(e,t=`Min value is ${e}`){return this.clone(r=>r<e?t:null)}max(e,t=`Max value is ${e}`){return this.clone(r=>r>e?t:null)}refine(e,t="Invalid"){return this.clone(r=>e(r)?null:t)}}class j{initial;validators;constructor(e,t=[]){this.initial=e,this.validators=t}clone(e){return new j(this.initial,[...this.validators,e])}validate(e){for(const t of this.validators){const r=t(e);if(r!==null)return r}return null}required(e="Must be checked"){return this.clone(t=>t?null:e)}refine(e,t="Invalid"){return this.clone(r=>e(r)?null:t)}}class xe{constructor(e){this.shape=e}__group=!0}function L(i){return i!==null&&typeof i=="object"&&i.__group===!0}const q={string(i=""){return new z(i)},number(i=0){return new B(i)},boolean(i=!1){return new j(i)},group(i){return new xe(i)}};function J(i){const e={};for(const t in i){const r=i[t];L(r)?e[t]=J(r.shape):e[t]=r.initial}return e}function F(i,e){const t={};for(const r in e){const l=e[r];L(l)?t[r]=F(i[r],l.shape):t[r]=l.validate(i[r])}return t}function A(i){return Object.values(i).every(e=>e!==null&&typeof e=="object"?A(e):e===null)}function R(i,e,t){if(e.length===0)return t;if(e.length===1)return{...i,[e[0]]:t};const[r,...l]=e;return{...i,[r]:R(i[r],l,t)}}function K(i){return i.split(".")}function H(i){const e={};for(const t in i){const r=i[t];L(r)?e[t]=H(r.shape):e[t]=!1}return e}function X(i){const e={};for(const t in i){const r=i[t];L(r)?e[t]=X(r.shape):e[t]=!0}return e}function Ie(i){const e=J(i),t=H(i);return(r,l)=>{switch(l.type){case"SET_VALUE":return{...r,values:{...r.values,[l.field]:l.value}};case"SET_NESTED_VALUE":{const f=K(l.path);return{...r,values:R(r.values,f,l.value)}}case"TOUCH":return{...r,touched:{...r.touched,[l.field]:!0}};case"TOUCH_NESTED":{const f=K(l.path);return{...r,touched:R(r.touched,f,!0)}}case"TOUCH_ALL":return{...r,touched:X(i)};case"RESET":return{values:{...e},touched:{...t},submitting:!1,submitted:!1};case"SUBMIT_START":return{...r,submitting:!0,submitted:!1};case"SUBMIT_END":return{...r,submitting:!1,submitted:!0};default:return r}}}function ee(i,e,t,r,l,f,b){const n=t.pipe(v((o,h)=>JSON.stringify(o)===JSON.stringify(h))),S=r.pipe(v((o,h)=>JSON.stringify(o)===JSON.stringify(h))),I=l.pipe(v((o,h)=>JSON.stringify(o)===JSON.stringify(h))),E=S.pipe(p(A),v());return{values$:n,errors$:S,touched$:I,valid$:E,field(o){const h=n.pipe(p(u=>u[o]),v()),$=i[o];let w;L($)?w=S.pipe(p(u=>{const m=u[o];return m&&typeof m=="object"?A({[o]:m})?null:"Group has errors":null}),v()):w=S.pipe(p(u=>u[o]),v());const g=I.pipe(p(u=>{const m=u[o];return typeof m=="boolean"?m:!1}),v()),k=n.pipe(p(u=>u[o]!==f[o]),v()),s=Q([w,g]).pipe(p(([u,m])=>m?u:null),v());return{value$:h,error$:w,touched$:g,dirty$:k,showError$:s}},setValue(o,h){const $=e?`${e}.${o}`:o;b({type:"SET_NESTED_VALUE",path:$,value:h})},setTouched(o){const h=e?`${e}.${o}`:o;b({type:"TOUCH_NESTED",path:h})},group(o){const h=i[o];if(!L(h))throw new Error(`Field "${o}" is not a group`);const $=h.shape,w=n.pipe(p(m=>m[o])),g=S.pipe(p(m=>m[o])),k=I.pipe(p(m=>m[o])),s=f[o],u=e?`${e}.${o}`:o;return ee($,u,w,g,k,s,b)}}}function Ce(i,e){const t=J(i),r=H(i),l={values:t,touched:r,submitting:!1,submitted:!1},f=new he,b=new me(l),n=f.asObservable(),S=Ie(i),I=f.pipe(ve(S,l),ye(l),be({bufferSize:1,refCount:!1}));I.subscribe(s=>b.next(s));function E(s){f.next(s)}function o(s){return I.pipe(p(s),v())}const h=o(s=>s.values),$=o(s=>s.touched),w=o(s=>s.submitting),g=h.pipe(p(s=>F(s,i)),v((s,u)=>JSON.stringify(s)===JSON.stringify(u))),k=g.pipe(p(A),v());return{values$:h,errors$:g,touched$:$,valid$:k,submitting$:w,actions$:n,field(s){const u=h.pipe(p(y=>y[s]),v()),m=i[s];let C;L(m)?C=g.pipe(p(y=>{const x=y[s];return x&&typeof x=="object"?A({[s]:x})?null:"Group has errors":null}),v()):C=g.pipe(p(y=>y[s]),v());const O=$.pipe(p(y=>{const x=y[s];return typeof x=="boolean"?x:!1}),v()),M=h.pipe(p(y=>y[s]!==t[s]),v()),_=Q([C,O]).pipe(p(([y,x])=>x?y:null),v());return{value$:u,error$:C,touched$:O,dirty$:M,showError$:_}},setValue(s,u){E({type:"SET_VALUE",field:s,value:u})},setTouched(s){E({type:"TOUCH",field:s})},submit(){E({type:"TOUCH_ALL"}),E({type:"SUBMIT_START"})},submitEnd(s){E({type:"SUBMIT_END",ok:s})},reset(){E({type:"RESET"})},getValues(){return b.value.values},getErrors(){return F(b.value.values,i)},isValid(){return A(this.getErrors())},group(s){const u=i[s];if(!L(u))throw new Error(`Field "${s}" is not a group`);const m=u.shape,C=h.pipe(p(y=>y[s])),O=g.pipe(p(y=>y[s])),M=$.pipe(p(y=>y[s])),_=t[s];return ee(m,s,C,O,M,_,E)}}}function N(i,e,t){const r=e.field(t),l=new U;return l.add(r.value$.subscribe(f=>{i.value!==String(f)&&(i.value=String(f))})),l.add(Z(i,"input").subscribe(()=>{e.setValue(t,i.value)})),l.add(Z(i,"blur").subscribe(()=>{e.setTouched(t)})),l}function T(i,e){return e.subscribe(t=>{i.textContent=t??"",t?i.classList.add("has-error"):i.classList.remove("has-error")})}const Le={firstName:q.string("").required("First name is required"),lastName:q.string("").required("Last name is required"),email:q.string("").required("Email is required").email("Enter a valid email"),phone:q.string(""),address:q.string("").required("Address is required").minLength(5,"Too short"),city:q.string("").required("City is required"),state:q.string("").required("State is required"),zip:q.string("").required("ZIP code is required").pattern(/^\d{5}(-\d{4})?$/,"Enter a valid ZIP"),cardNumber:q.string("").required("Card number is required").pattern(/^\d{16}$/,"16 digits required"),expiry:q.string("").required("Expiry is required").pattern(/^(0[1-9]|1[0-2])\/\d{2}$/,"Format: MM/YY"),cvv:q.string("").required("CVV is required").pattern(/^\d{3,4}$/,"3 or 4 digits")};function Ve(i){const{router:e,cartStore:t}=i,r=document.createElement("div"),l=t.getState().items,f=l.reduce((c,V)=>c+V.product.price*V.quantity,0),b=l.reduce((c,V)=>c+V.quantity,0);if(r.innerHTML=`
    <section class="view checkout-view">
      <h1>Checkout</h1>

      <div id="empty-cart-msg" class="${l.length>0?"hidden":""}">
        <p>Your cart is empty. Add some products before checking out.</p>
        <a href="${e.link("/")}" class="btn btn-primary">Continue Shopping</a>
      </div>

      <div id="checkout-content" class="${l.length===0?"hidden":""} checkout-layout">
        <div class="checkout-form-wrap">
          <div id="submit-success" class="alert alert-success hidden">
            <h2>Order Placed!</h2>
            <p>Your order has been submitted successfully.</p>
            <a href="${e.link("/")}" class="btn btn-primary">Continue Shopping</a>
          </div>
          <div id="submit-error" class="alert alert-error hidden">
            Something went wrong. Please try again.
          </div>

          <form id="checkout-form" novalidate>
            <h2>Shipping Information</h2>
            <div class="form-row">
              <div class="field-group">
                <label for="field-firstName">First Name</label>
                <input id="field-firstName" type="text" placeholder="John" />
                <span class="field-error" id="error-firstName"></span>
              </div>
              <div class="field-group">
                <label for="field-lastName">Last Name</label>
                <input id="field-lastName" type="text" placeholder="Doe" />
                <span class="field-error" id="error-lastName"></span>
              </div>
            </div>

            <div class="form-row">
              <div class="field-group">
                <label for="field-email">Email</label>
                <input id="field-email" type="email" placeholder="john@example.com" />
                <span class="field-error" id="error-email"></span>
              </div>
              <div class="field-group">
                <label for="field-phone">Phone (optional)</label>
                <input id="field-phone" type="tel" placeholder="+1 555-0123" />
                <span class="field-error" id="error-phone"></span>
              </div>
            </div>

            <div class="field-group">
              <label for="field-address">Address</label>
              <input id="field-address" type="text" placeholder="123 Main St" />
              <span class="field-error" id="error-address"></span>
            </div>

            <div class="form-row form-row-3">
              <div class="field-group">
                <label for="field-city">City</label>
                <input id="field-city" type="text" placeholder="New York" />
                <span class="field-error" id="error-city"></span>
              </div>
              <div class="field-group">
                <label for="field-state">State</label>
                <input id="field-state" type="text" placeholder="NY" />
                <span class="field-error" id="error-state"></span>
              </div>
              <div class="field-group">
                <label for="field-zip">ZIP Code</label>
                <input id="field-zip" type="text" placeholder="10001" />
                <span class="field-error" id="error-zip"></span>
              </div>
            </div>

            <h2>Payment Information</h2>
            <p class="hint">This is a demo — no real payment is processed.</p>

            <div class="field-group">
              <label for="field-cardNumber">Card Number</label>
              <input id="field-cardNumber" type="text" placeholder="4111111111111111" maxlength="16" />
              <span class="field-error" id="error-cardNumber"></span>
            </div>

            <div class="form-row">
              <div class="field-group">
                <label for="field-expiry">Expiry</label>
                <input id="field-expiry" type="text" placeholder="MM/YY" maxlength="5" />
                <span class="field-error" id="error-expiry"></span>
              </div>
              <div class="field-group">
                <label for="field-cvv">CVV</label>
                <input id="field-cvv" type="text" placeholder="123" maxlength="4" />
                <span class="field-error" id="error-cvv"></span>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" id="submit-btn" class="btn btn-primary btn-lg">Place Order</button>
              <span id="loading-indicator" class="loading-text hidden">Processing...</span>
            </div>
          </form>
        </div>

        <div class="order-summary">
          <h2>Order Summary</h2>
          <ul class="summary-items">
            ${l.map(c=>`
              <li class="summary-item">
                <span class="summary-item-name">${c.product.title.slice(0,40)}${c.product.title.length>40?"...":""}</span>
                <span class="summary-item-qty">x${c.quantity}</span>
                <span class="summary-item-price">$${(c.product.price*c.quantity).toFixed(2)}</span>
              </li>
            `).join("")}
          </ul>
          <div class="summary-row summary-total">
            <strong>Total (${b} items)</strong>
            <strong>$${f.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </section>
  `,l.length===0){const c=document.createDocumentFragment();return c.appendChild(r.firstElementChild),{fragment:c,sub:new U,strings:[],values:[]}}const n=r.querySelector("section"),S=n.querySelector("#checkout-form"),I=n.querySelector("#submit-btn"),E=n.querySelector("#loading-indicator"),o=n.querySelector("#submit-success"),h=n.querySelector("#submit-error"),$=n.querySelector("#field-firstName"),w=n.querySelector("#field-lastName"),g=n.querySelector("#field-email"),k=n.querySelector("#field-phone"),s=n.querySelector("#field-address"),u=n.querySelector("#field-city"),m=n.querySelector("#field-state"),C=n.querySelector("#field-zip"),O=n.querySelector("#field-cardNumber"),M=n.querySelector("#field-expiry"),_=n.querySelector("#field-cvv"),y=n.querySelector("#error-firstName"),x=n.querySelector("#error-lastName"),re=n.querySelector("#error-email"),te=n.querySelector("#error-phone"),ie=n.querySelector("#error-address"),se=n.querySelector("#error-city"),ne=n.querySelector("#error-state"),oe=n.querySelector("#error-zip"),le=n.querySelector("#error-cardNumber"),ae=n.querySelector("#error-expiry"),de=n.querySelector("#error-cvv"),a=Ce(Le),ue=a.actions$.pipe(ge("SUBMIT_START"),Te(()=>{if(!a.isValid())return a.submitEnd(!1),W(null);const V={...a.getValues(),items:l,total:f};return Ee.post("https://jsonplaceholder.typicode.com/posts",V).pipe($e(),p(D=>(qe(D)&&(a.submitEnd(!0),t.dispatch({type:"CLEAR_CART"})),Ne(D)&&a.submitEnd(!1),D)),Se(()=>(a.submitEnd(!1),W(null))))})),Y=document.createDocumentFragment();Y.appendChild(n);const d=new U;d.add(N($,a,"firstName")),d.add(N(w,a,"lastName")),d.add(N(g,a,"email")),d.add(N(k,a,"phone")),d.add(N(s,a,"address")),d.add(N(u,a,"city")),d.add(N(m,a,"state")),d.add(N(C,a,"zip")),d.add(N(O,a,"cardNumber")),d.add(N(M,a,"expiry")),d.add(N(_,a,"cvv")),d.add(T(y,a.field("firstName").showError$)),d.add(T(x,a.field("lastName").showError$)),d.add(T(re,a.field("email").showError$)),d.add(T(te,a.field("phone").showError$)),d.add(T(ie,a.field("address").showError$)),d.add(T(se,a.field("city").showError$)),d.add(T(ne,a.field("state").showError$)),d.add(T(oe,a.field("zip").showError$)),d.add(T(le,a.field("cardNumber").showError$)),d.add(T(ae,a.field("expiry").showError$)),d.add(T(de,a.field("cvv").showError$)),d.add(we(E,"hidden")(a.submitting$.pipe(p(c=>!c)))),d.add(a.submitting$.subscribe(c=>{I.disabled=c})),d.add(ue.subscribe()),d.add(a.actions$.subscribe(c=>{c.type==="SUBMIT_END"&&(o.classList.toggle("hidden",!c.ok),h.classList.toggle("hidden",c.ok),c.ok&&S.classList.add("hidden"))}));const P=c=>{c.preventDefault(),a.submit()};return S.addEventListener("submit",P),d.add(new U(()=>S.removeEventListener("submit",P))),{fragment:Y,sub:d,strings:[],values:[]}}export{Ve as checkoutView};
