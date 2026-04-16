import{f as w,g as A,h as R,i as _,m as a,j as q,w as r,p as o,q as H}from"./index-AjhpY2AS.js";import{a as Q}from"./api-BZ9mXGFh.js";import{c as I}from"./public-CMCfNiD-.js";function x(i,n){switch(n.type){case"FETCH":return{...i,loading:!0,error:null};case"FETCH_SUCCESS":return{...i,loading:!1,product:n.product};case"FETCH_ERROR":return{...i,loading:!1,error:n.error};case"SET_QUANTITY":return{...i,selectedQuantity:Math.max(1,n.quantity)}}}const D={product:null,loading:!1,error:null,selectedQuantity:1},L=w(({router:i,cartStore:n,params:p})=>{const e=A(x,D);e.actions$.pipe(R("FETCH"),_(({productId:t})=>Q.products.get(t).pipe(a(s=>({type:"FETCH_SUCCESS",product:s})),q(H,{fallback:{type:"FETCH_ERROR",error:"Failed to load product"},context:"productDetailView/FETCH"})))).subscribe(t=>e.dispatch(t)),p.id&&e.dispatch({type:"FETCH",productId:p.id});const y=e.select(t=>t.loading),b=e.select(t=>t.product!==null),c=e.select(t=>t.product),l=e.select(t=>t.selectedQuantity),d=e.select(t=>t.error),h=d.pipe(a(t=>t!==null)),u=c.pipe(a(t=>t?.title??"")),m=c.pipe(a(t=>t?`$${t.price.toFixed(2)}`:"")),T=c.pipe(a(t=>t?.image??"")),f=c.pipe(a(t=>t?.category??"")),v=c.pipe(a(t=>t?.description??"")),$=c.pipe(a(t=>t?.rating.rate??0)),E=c.pipe(a(t=>t?.rating.count??0)),C=$.pipe(a(t=>{const s=Math.floor(t),g=t-s>=.5?1:0,k=5-s-g;return"★".repeat(s)+(g?"½":"")+"☆".repeat(k)})),S=I([c,l]).pipe(a(([t,s])=>t?`$${(t.price*s).toFixed(2)}`:""));function F(){const{product:t,selectedQuantity:s}=e.getState();t&&(n.dispatch({type:"ADD_TO_CART",product:t,quantity:s}),n.dispatch({type:"OPEN_DRAWER"}))}return o`
    <section class="view product-detail-view">
      <a href="${i.link("/")}" class="back-link">← Back to catalog</a>

      ${r(y,()=>o`<div class="loading-msg">Loading product...</div>`)}
      ${r(h,()=>o`
        <div class="error-banner">
          <p>${d.pipe(a(t=>t??""))}</p>
          <a href="${i.link("/")}" class="btn btn-primary">Back to catalog</a>
        </div>
      `)}
      ${r(b,()=>o`
        <div class="product-detail-layout">
          <div class="product-image-wrap">
            <img class="product-detail-image" src="${T}" alt="${u}" />
          </div>
          <div class="product-info">
            <span class="product-category-badge">${f}</span>
            <h1 class="product-detail-title">${u}</h1>
            <div class="product-detail-price">${m}</div>
            <div class="star-rating">
              <span class="stars">${C}</span>
              <span class="rating-text">${$} (${E} reviews)</span>
            </div>
            <p class="product-description">${v}</p>

            <div class="quantity-control">
              <button class="btn btn-outline btn-sm" @click=${()=>e.dispatch({type:"SET_QUANTITY",quantity:e.getState().selectedQuantity-1})}>-</button>
              <span class="quantity-value">${l}</span>
              <button class="btn btn-outline btn-sm" @click=${()=>e.dispatch({type:"SET_QUANTITY",quantity:e.getState().selectedQuantity+1})}>+</button>
              <span class="quantity-total">${S}</span>
            </div>

            <button class="btn btn-primary btn-lg btn-add-to-cart" @click=${F}>
              Add to Cart
            </button>
          </div>
        </div>
      `)}
    </section>
  `});export{L as productDetailView};
