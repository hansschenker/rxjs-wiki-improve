import{d as t,h as e}from"./index--zB0vrRm.js";const d=t(({router:n})=>{const o=typeof window<"u"?window.location.pathname||"/":"unknown";return e`
    <section class="view not-found-view">
      <h1>404</h1>
      <p>Page not found.</p>
      <p>The path <code id="current-path">${o}</code> does not exist.</p>
      <button id="home-btn" class="btn" @click=${()=>n.navigate("/")}>Go home</button>
    </section>
    `});export{d as notFoundView};
