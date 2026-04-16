import{h as t}from"./index-5Q6H4mJc.js";import{d as e}from"./component-nm2Lc4kv.js";const r=e(o=>t`
    <section class="view">
      <h1>About</h1>
      <div class="card">
        <p>
          <strong>rxjs-spa</strong> is a lightweight SPA framework built
          entirely on RxJS and TypeScript.
        </p>
        <p>
          It follows the <strong>MVU</strong> (Model-View-Update) architecture:
          actions flow through a reducer to produce state, and views
          reactively bind to state via Observables.
        </p>
        <h3>Core Concepts</h3>
        <ul>
          <li><strong>Store</strong> — dispatch actions, reduce state, select slices</li>
          <li><strong>Effects</strong> — side effects via <code>actions$.pipe(ofType(...))</code></li>
          <li><strong>Router</strong> — hash or history mode, with params and guards</li>
          <li><strong>Templates</strong> — <code>html</code> tagged templates with reactive bindings</li>
        </ul>
      </div>
    </section>
  `);export{r as aboutView};
