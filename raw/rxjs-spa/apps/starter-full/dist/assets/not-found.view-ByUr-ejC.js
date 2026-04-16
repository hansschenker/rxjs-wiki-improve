import{h as t}from"./index-CLoFyHdQ.js";import{d as e}from"./component-BqJEyUpA.js";const c=e(({router:o})=>{const n=typeof window<"u"?window.location.hash.slice(1)||"/":"unknown";return t`
      <section class="view">
        <h1>404</h1>
        <p>Page not found.</p>
        <p>The path <code>${n}</code> does not exist.</p>
        <button class="btn" @click=${()=>o.navigate("/")}>Go home</button>
      </section>
    `});export{c as notFoundView};
