import{f as g,m as i,w as d,p as e,n as k}from"./index-AjhpY2AS.js";const T=g(({router:p,cartStore:n})=>{const o=n.select(t=>t.items),l=o.pipe(i(t=>t.length===0)),u=o.pipe(i(t=>t.length>0)),r=n.select(t=>t.items.reduce((a,c)=>a+c.product.price*c.quantity,0)),m=n.select(t=>t.items.reduce((a,c)=>a+c.quantity,0));return e`
    <section class="view cart-view">
      <h1>Shopping Cart</h1>

      ${d(l,()=>e`
        <div class="empty-cart">
          <p>Your cart is empty.</p>
          <a href="${p.link("/")}" class="btn btn-primary">Continue Shopping</a>
        </div>
      `)}

      ${d(u,()=>e`
        <div class="cart-layout">
          <div class="cart-items">
            ${k(o,t=>String(t.product.id),t=>{const a=t.pipe(i(s=>s.product.title)),c=t.pipe(i(s=>s.product.image)),h=t.pipe(i(s=>s.product.category)),y=t.pipe(i(s=>"$"+s.product.price.toFixed(2)+" each")),$=t.pipe(i(s=>String(s.quantity))),b=t.pipe(i(s=>"$"+(s.product.price*s.quantity).toFixed(2))),v=t.pipe(i(s=>p.link("/product/"+s.product.id)));return e`
                <div class="cart-item">
                  <img class="cart-item-img" src="${c}" alt="${a}" />
                  <div class="cart-item-details">
                    <h3 class="cart-item-title">
                      <a href="${v}">${a}</a>
                    </h3>
                    <span class="cart-item-category">${h}</span>
                    <span class="cart-item-unit-price">${y}</span>
                  </div>
                  <div class="cart-item-actions">
                    <div class="quantity-control">
                      <button class="btn btn-outline btn-sm"
                        @click=${()=>{const s=t.snapshot();n.dispatch({type:"UPDATE_QUANTITY",productId:s.product.id,quantity:s.quantity-1})}}>
                        -
                      </button>
                      <span class="quantity-value">${$}</span>
                      <button class="btn btn-outline btn-sm"
                        @click=${()=>{const s=t.snapshot();n.dispatch({type:"UPDATE_QUANTITY",productId:s.product.id,quantity:s.quantity+1})}}>
                        +
                      </button>
                    </div>
                    <span class="cart-item-total">${b}</span>
                    <button class="btn btn-danger btn-sm"
                      @click=${()=>n.dispatch({type:"REMOVE_FROM_CART",productId:t.snapshot().product.id})}>
                      Remove
                    </button>
                  </div>
                </div>
              `})}
          </div>

          <div class="cart-summary">
            <h2>Order Summary</h2>
            <div class="summary-row">
              <span>Items (${m})</span>
              <span>$${r.pipe(i(t=>t.toFixed(2)))}</span>
            </div>
            <div class="summary-row summary-total">
              <strong>Total</strong>
              <strong>$${r.pipe(i(t=>t.toFixed(2)))}</strong>
            </div>
            <a href="${p.link("/checkout")}" class="btn btn-primary btn-lg cart-checkout-btn">
              Proceed to Checkout
            </a>
            <a href="${p.link("/")}" class="btn btn-outline continue-shopping">
              Continue Shopping
            </a>
          </div>
        </div>
      `)}
    </section>
  `});export{T as cartView};
