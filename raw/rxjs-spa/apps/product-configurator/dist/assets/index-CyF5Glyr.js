(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(i){if(i.ep)return;i.ep=!0;const o=n(i);fetch(i.href,o)}})();var ve=function(e,t){return ve=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,r){n.__proto__=r}||function(n,r){for(var i in r)Object.prototype.hasOwnProperty.call(r,i)&&(n[i]=r[i])},ve(e,t)};function P(e,t){if(typeof t!="function"&&t!==null)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");ve(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}function lt(e,t,n,r){function i(o){return o instanceof n?o:new n(function(s){s(o)})}return new(n||(n=Promise))(function(o,s){function a(d){try{u(r.next(d))}catch(f){s(f)}}function c(d){try{u(r.throw(d))}catch(f){s(f)}}function u(d){d.done?o(d.value):i(d.value).then(a,c)}u((r=r.apply(e,t||[])).next())})}function Ne(e,t){var n={label:0,sent:function(){if(o[0]&1)throw o[1];return o[1]},trys:[],ops:[]},r,i,o,s=Object.create((typeof Iterator=="function"?Iterator:Object).prototype);return s.next=a(0),s.throw=a(1),s.return=a(2),typeof Symbol=="function"&&(s[Symbol.iterator]=function(){return this}),s;function a(u){return function(d){return c([u,d])}}function c(u){if(r)throw new TypeError("Generator is already executing.");for(;s&&(s=0,u[0]&&(n=0)),n;)try{if(r=1,i&&(o=u[0]&2?i.return:u[0]?i.throw||((o=i.return)&&o.call(i),0):i.next)&&!(o=o.call(i,u[1])).done)return o;switch(i=0,o&&(u=[u[0]&2,o.value]),u[0]){case 0:case 1:o=u;break;case 4:return n.label++,{value:u[1],done:!1};case 5:n.label++,i=u[1],u=[0];continue;case 7:u=n.ops.pop(),n.trys.pop();continue;default:if(o=n.trys,!(o=o.length>0&&o[o.length-1])&&(u[0]===6||u[0]===2)){n=0;continue}if(u[0]===3&&(!o||u[1]>o[0]&&u[1]<o[3])){n.label=u[1];break}if(u[0]===6&&n.label<o[1]){n.label=o[1],o=u;break}if(o&&n.label<o[2]){n.label=o[2],n.ops.push(u);break}o[2]&&n.ops.pop(),n.trys.pop();continue}u=t.call(e,n)}catch(d){u=[6,d],i=0}finally{r=o=0}if(u[0]&5)throw u[1];return{value:u[0]?u[1]:void 0,done:!0}}}function V(e){var t=typeof Symbol=="function"&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&typeof e.length=="number")return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")}function G(e,t){var n=typeof Symbol=="function"&&e[Symbol.iterator];if(!n)return e;var r=n.call(e),i,o=[],s;try{for(;(t===void 0||t-- >0)&&!(i=r.next()).done;)o.push(i.value)}catch(a){s={error:a}}finally{try{i&&!i.done&&(n=r.return)&&n.call(r)}finally{if(s)throw s.error}}return o}function Y(e,t,n){if(n||arguments.length===2)for(var r=0,i=t.length,o;r<i;r++)(o||!(r in t))&&(o||(o=Array.prototype.slice.call(t,0,r)),o[r]=t[r]);return e.concat(o||Array.prototype.slice.call(t))}function z(e){return this instanceof z?(this.v=e,this):new z(e)}function ut(e,t,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var r=n.apply(e,t||[]),i,o=[];return i=Object.create((typeof AsyncIterator=="function"?AsyncIterator:Object).prototype),a("next"),a("throw"),a("return",s),i[Symbol.asyncIterator]=function(){return this},i;function s(p){return function(y){return Promise.resolve(y).then(p,f)}}function a(p,y){r[p]&&(i[p]=function(w){return new Promise(function(C,$){o.push([p,w,C,$])>1||c(p,w)})},y&&(i[p]=y(i[p])))}function c(p,y){try{u(r[p](y))}catch(w){b(o[0][3],w)}}function u(p){p.value instanceof z?Promise.resolve(p.value.v).then(d,f):b(o[0][2],p)}function d(p){c("next",p)}function f(p){c("throw",p)}function b(p,y){p(y),o.shift(),o.length&&c(o[0][0],o[0][1])}}function dt(e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t=e[Symbol.asyncIterator],n;return t?t.call(e):(e=typeof V=="function"?V(e):e[Symbol.iterator](),n={},r("next"),r("throw"),r("return"),n[Symbol.asyncIterator]=function(){return this},n);function r(o){n[o]=e[o]&&function(s){return new Promise(function(a,c){s=e[o](s),i(a,c,s.done,s.value)})}}function i(o,s,a,c){Promise.resolve(c).then(function(u){o({value:u,done:a})},s)}}function S(e){return typeof e=="function"}function Pe(e){var t=function(r){Error.call(r),r.stack=new Error().stack},n=e(t);return n.prototype=Object.create(Error.prototype),n.prototype.constructor=n,n}var de=Pe(function(e){return function(n){e(this),this.message=n?n.length+` errors occurred during unsubscription:
`+n.map(function(r,i){return i+1+") "+r.toString()}).join(`
  `):"",this.name="UnsubscriptionError",this.errors=n}});function ae(e,t){if(e){var n=e.indexOf(t);0<=n&&e.splice(n,1)}}var W=(function(){function e(t){this.initialTeardown=t,this.closed=!1,this._parentage=null,this._finalizers=null}return e.prototype.unsubscribe=function(){var t,n,r,i,o;if(!this.closed){this.closed=!0;var s=this._parentage;if(s)if(this._parentage=null,Array.isArray(s))try{for(var a=V(s),c=a.next();!c.done;c=a.next()){var u=c.value;u.remove(this)}}catch(w){t={error:w}}finally{try{c&&!c.done&&(n=a.return)&&n.call(a)}finally{if(t)throw t.error}}else s.remove(this);var d=this.initialTeardown;if(S(d))try{d()}catch(w){o=w instanceof de?w.errors:[w]}var f=this._finalizers;if(f){this._finalizers=null;try{for(var b=V(f),p=b.next();!p.done;p=b.next()){var y=p.value;try{_e(y)}catch(w){o=o??[],w instanceof de?o=Y(Y([],G(o)),G(w.errors)):o.push(w)}}}catch(w){r={error:w}}finally{try{p&&!p.done&&(i=b.return)&&i.call(b)}finally{if(r)throw r.error}}}if(o)throw new de(o)}},e.prototype.add=function(t){var n;if(t&&t!==this)if(this.closed)_e(t);else{if(t instanceof e){if(t.closed||t._hasParent(this))return;t._addParent(this)}(this._finalizers=(n=this._finalizers)!==null&&n!==void 0?n:[]).push(t)}},e.prototype._hasParent=function(t){var n=this._parentage;return n===t||Array.isArray(n)&&n.includes(t)},e.prototype._addParent=function(t){var n=this._parentage;this._parentage=Array.isArray(n)?(n.push(t),n):n?[n,t]:t},e.prototype._removeParent=function(t){var n=this._parentage;n===t?this._parentage=null:Array.isArray(n)&&ae(n,t)},e.prototype.remove=function(t){var n=this._finalizers;n&&ae(n,t),t instanceof e&&t._removeParent(this)},e.EMPTY=(function(){var t=new e;return t.closed=!0,t})(),e})(),Re=W.EMPTY;function Me(e){return e instanceof W||e&&"closed"in e&&S(e.remove)&&S(e.add)&&S(e.unsubscribe)}function _e(e){S(e)?e():e.unsubscribe()}var ft={Promise:void 0},pt={setTimeout:function(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];return setTimeout.apply(void 0,Y([e,t],G(n)))},clearTimeout:function(e){return clearTimeout(e)},delegate:void 0};function Le(e){pt.setTimeout(function(){throw e})}function we(){}function oe(e){e()}var ye=(function(e){P(t,e);function t(n){var r=e.call(this)||this;return r.isStopped=!1,n?(r.destination=n,Me(n)&&n.add(r)):r.destination=bt,r}return t.create=function(n,r,i){return new Z(n,r,i)},t.prototype.next=function(n){this.isStopped||this._next(n)},t.prototype.error=function(n){this.isStopped||(this.isStopped=!0,this._error(n))},t.prototype.complete=function(){this.isStopped||(this.isStopped=!0,this._complete())},t.prototype.unsubscribe=function(){this.closed||(this.isStopped=!0,e.prototype.unsubscribe.call(this),this.destination=null)},t.prototype._next=function(n){this.destination.next(n)},t.prototype._error=function(n){try{this.destination.error(n)}finally{this.unsubscribe()}},t.prototype._complete=function(){try{this.destination.complete()}finally{this.unsubscribe()}},t})(W),ht=(function(){function e(t){this.partialObserver=t}return e.prototype.next=function(t){var n=this.partialObserver;if(n.next)try{n.next(t)}catch(r){ie(r)}},e.prototype.error=function(t){var n=this.partialObserver;if(n.error)try{n.error(t)}catch(r){ie(r)}else ie(t)},e.prototype.complete=function(){var t=this.partialObserver;if(t.complete)try{t.complete()}catch(n){ie(n)}},e})(),Z=(function(e){P(t,e);function t(n,r,i){var o=e.call(this)||this,s;return S(n)||!n?s={next:n??void 0,error:r??void 0,complete:i??void 0}:s=n,o.destination=new ht(s),o}return t})(ye);function ie(e){Le(e)}function vt(e){throw e}var bt={closed:!0,next:we,error:vt,complete:we},me=(function(){return typeof Symbol=="function"&&Symbol.observable||"@@observable"})();function te(e){return e}function yt(e){return e.length===0?te:e.length===1?e[0]:function(n){return e.reduce(function(r,i){return i(r)},n)}}var A=(function(){function e(t){t&&(this._subscribe=t)}return e.prototype.lift=function(t){var n=new e;return n.source=this,n.operator=t,n},e.prototype.subscribe=function(t,n,r){var i=this,o=gt(t)?t:new Z(t,n,r);return oe(function(){var s=i,a=s.operator,c=s.source;o.add(a?a.call(o,c):c?i._subscribe(o):i._trySubscribe(o))}),o},e.prototype._trySubscribe=function(t){try{return this._subscribe(t)}catch(n){t.error(n)}},e.prototype.forEach=function(t,n){var r=this;return n=Se(n),new n(function(i,o){var s=new Z({next:function(a){try{t(a)}catch(c){o(c),s.unsubscribe()}},error:o,complete:i});r.subscribe(s)})},e.prototype._subscribe=function(t){var n;return(n=this.source)===null||n===void 0?void 0:n.subscribe(t)},e.prototype[me]=function(){return this},e.prototype.pipe=function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];return yt(t)(this)},e.prototype.toPromise=function(t){var n=this;return t=Se(t),new t(function(r,i){var o;n.subscribe(function(s){return o=s},function(s){return i(s)},function(){return r(o)})})},e.create=function(t){return new e(t)},e})();function Se(e){var t;return(t=e??ft.Promise)!==null&&t!==void 0?t:Promise}function mt(e){return e&&S(e.next)&&S(e.error)&&S(e.complete)}function gt(e){return e&&e instanceof ye||mt(e)&&Me(e)}function _t(e){return S(e?.lift)}function O(e){return function(t){if(_t(t))return t.lift(function(n){try{return e(n,this)}catch(r){this.error(r)}});throw new TypeError("Unable to lift unknown Observable type")}}function k(e,t,n,r,i){return new wt(e,t,n,r,i)}var wt=(function(e){P(t,e);function t(n,r,i,o,s,a){var c=e.call(this,n)||this;return c.onFinalize=s,c.shouldUnsubscribe=a,c._next=r?function(u){try{r(u)}catch(d){n.error(d)}}:e.prototype._next,c._error=o?function(u){try{o(u)}catch(d){n.error(d)}finally{this.unsubscribe()}}:e.prototype._error,c._complete=i?function(){try{i()}catch(u){n.error(u)}finally{this.unsubscribe()}}:e.prototype._complete,c}return t.prototype.unsubscribe=function(){var n;if(!this.shouldUnsubscribe||this.shouldUnsubscribe()){var r=this.closed;e.prototype.unsubscribe.call(this),!r&&((n=this.onFinalize)===null||n===void 0||n.call(this))}},t})(ye),St=Pe(function(e){return function(){e(this),this.name="ObjectUnsubscribedError",this.message="object unsubscribed"}}),ne=(function(e){P(t,e);function t(){var n=e.call(this)||this;return n.closed=!1,n.currentObservers=null,n.observers=[],n.isStopped=!1,n.hasError=!1,n.thrownError=null,n}return t.prototype.lift=function(n){var r=new xe(this,this);return r.operator=n,r},t.prototype._throwIfClosed=function(){if(this.closed)throw new St},t.prototype.next=function(n){var r=this;oe(function(){var i,o;if(r._throwIfClosed(),!r.isStopped){r.currentObservers||(r.currentObservers=Array.from(r.observers));try{for(var s=V(r.currentObservers),a=s.next();!a.done;a=s.next()){var c=a.value;c.next(n)}}catch(u){i={error:u}}finally{try{a&&!a.done&&(o=s.return)&&o.call(s)}finally{if(i)throw i.error}}}})},t.prototype.error=function(n){var r=this;oe(function(){if(r._throwIfClosed(),!r.isStopped){r.hasError=r.isStopped=!0,r.thrownError=n;for(var i=r.observers;i.length;)i.shift().error(n)}})},t.prototype.complete=function(){var n=this;oe(function(){if(n._throwIfClosed(),!n.isStopped){n.isStopped=!0;for(var r=n.observers;r.length;)r.shift().complete()}})},t.prototype.unsubscribe=function(){this.isStopped=this.closed=!0,this.observers=this.currentObservers=null},Object.defineProperty(t.prototype,"observed",{get:function(){var n;return((n=this.observers)===null||n===void 0?void 0:n.length)>0},enumerable:!1,configurable:!0}),t.prototype._trySubscribe=function(n){return this._throwIfClosed(),e.prototype._trySubscribe.call(this,n)},t.prototype._subscribe=function(n){return this._throwIfClosed(),this._checkFinalizedStatuses(n),this._innerSubscribe(n)},t.prototype._innerSubscribe=function(n){var r=this,i=this,o=i.hasError,s=i.isStopped,a=i.observers;return o||s?Re:(this.currentObservers=null,a.push(n),new W(function(){r.currentObservers=null,ae(a,n)}))},t.prototype._checkFinalizedStatuses=function(n){var r=this,i=r.hasError,o=r.thrownError,s=r.isStopped;i?n.error(o):s&&n.complete()},t.prototype.asObservable=function(){var n=new A;return n.source=this,n},t.create=function(n,r){return new xe(n,r)},t})(A),xe=(function(e){P(t,e);function t(n,r){var i=e.call(this)||this;return i.destination=n,i.source=r,i}return t.prototype.next=function(n){var r,i;(i=(r=this.destination)===null||r===void 0?void 0:r.next)===null||i===void 0||i.call(r,n)},t.prototype.error=function(n){var r,i;(i=(r=this.destination)===null||r===void 0?void 0:r.error)===null||i===void 0||i.call(r,n)},t.prototype.complete=function(){var n,r;(r=(n=this.destination)===null||n===void 0?void 0:n.complete)===null||r===void 0||r.call(n)},t.prototype._subscribe=function(n){var r,i;return(i=(r=this.source)===null||r===void 0?void 0:r.subscribe(n))!==null&&i!==void 0?i:Re},t})(ne),De=(function(e){P(t,e);function t(n){var r=e.call(this)||this;return r._value=n,r}return Object.defineProperty(t.prototype,"value",{get:function(){return this.getValue()},enumerable:!1,configurable:!0}),t.prototype._subscribe=function(n){var r=e.prototype._subscribe.call(this,n);return!r.closed&&n.next(this._value),r},t.prototype.getValue=function(){var n=this,r=n.hasError,i=n.thrownError,o=n._value;if(r)throw i;return this._throwIfClosed(),o},t.prototype.next=function(n){e.prototype.next.call(this,this._value=n)},t})(ne),ge={now:function(){return(ge.delegate||Date).now()},delegate:void 0},xt=(function(e){P(t,e);function t(n,r,i){n===void 0&&(n=1/0),r===void 0&&(r=1/0),i===void 0&&(i=ge);var o=e.call(this)||this;return o._bufferSize=n,o._windowTime=r,o._timestampProvider=i,o._buffer=[],o._infiniteTimeWindow=!0,o._infiniteTimeWindow=r===1/0,o._bufferSize=Math.max(1,n),o._windowTime=Math.max(1,r),o}return t.prototype.next=function(n){var r=this,i=r.isStopped,o=r._buffer,s=r._infiniteTimeWindow,a=r._timestampProvider,c=r._windowTime;i||(o.push(n),!s&&o.push(a.now()+c)),this._trimBuffer(),e.prototype.next.call(this,n)},t.prototype._subscribe=function(n){this._throwIfClosed(),this._trimBuffer();for(var r=this._innerSubscribe(n),i=this,o=i._infiniteTimeWindow,s=i._buffer,a=s.slice(),c=0;c<a.length&&!n.closed;c+=o?1:2)n.next(a[c]);return this._checkFinalizedStatuses(n),r},t.prototype._trimBuffer=function(){var n=this,r=n._bufferSize,i=n._timestampProvider,o=n._buffer,s=n._infiniteTimeWindow,a=(s?1:2)*r;if(r<1/0&&a<o.length&&o.splice(0,o.length-a),!s){for(var c=i.now(),u=0,d=1;d<o.length&&o[d]<=c;d+=2)u=d;u&&o.splice(0,u+1)}},t})(ne),Ct=(function(e){P(t,e);function t(n,r){return e.call(this)||this}return t.prototype.schedule=function(n,r){return this},t})(W),Ce={setInterval:function(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];return setInterval.apply(void 0,Y([e,t],G(n)))},clearInterval:function(e){return clearInterval(e)},delegate:void 0},Et=(function(e){P(t,e);function t(n,r){var i=e.call(this,n,r)||this;return i.scheduler=n,i.work=r,i.pending=!1,i}return t.prototype.schedule=function(n,r){var i;if(r===void 0&&(r=0),this.closed)return this;this.state=n;var o=this.id,s=this.scheduler;return o!=null&&(this.id=this.recycleAsyncId(s,o,r)),this.pending=!0,this.delay=r,this.id=(i=this.id)!==null&&i!==void 0?i:this.requestAsyncId(s,this.id,r),this},t.prototype.requestAsyncId=function(n,r,i){return i===void 0&&(i=0),Ce.setInterval(n.flush.bind(n,this),i)},t.prototype.recycleAsyncId=function(n,r,i){if(i===void 0&&(i=0),i!=null&&this.delay===i&&this.pending===!1)return r;r!=null&&Ce.clearInterval(r)},t.prototype.execute=function(n,r){if(this.closed)return new Error("executing a cancelled action");this.pending=!1;var i=this._execute(n,r);if(i)return i;this.pending===!1&&this.id!=null&&(this.id=this.recycleAsyncId(this.scheduler,this.id,null))},t.prototype._execute=function(n,r){var i=!1,o;try{this.work(n)}catch(s){i=!0,o=s||new Error("Scheduled action threw falsy error")}if(i)return this.unsubscribe(),o},t.prototype.unsubscribe=function(){if(!this.closed){var n=this,r=n.id,i=n.scheduler,o=i.actions;this.work=this.state=this.scheduler=null,this.pending=!1,ae(o,this),r!=null&&(this.id=this.recycleAsyncId(i,r,null)),this.delay=null,e.prototype.unsubscribe.call(this)}},t})(Ct),Ee=(function(){function e(t,n){n===void 0&&(n=e.now),this.schedulerActionCtor=t,this.now=n}return e.prototype.schedule=function(t,n,r){return n===void 0&&(n=0),new this.schedulerActionCtor(this,t).schedule(r,n)},e.now=ge.now,e})(),At=(function(e){P(t,e);function t(n,r){r===void 0&&(r=Ee.now);var i=e.call(this,n,r)||this;return i.actions=[],i._active=!1,i}return t.prototype.flush=function(n){var r=this.actions;if(this._active){r.push(n);return}var i;this._active=!0;do if(i=n.execute(n.state,n.delay))break;while(n=r.shift());if(this._active=!1,i){for(;n=r.shift();)n.unsubscribe();throw i}},t})(Ee),It=new At(Et),$t=It,Tt=new A(function(e){return e.complete()});function kt(e){return e&&S(e.schedule)}function Fe(e){return e[e.length-1]}function Ot(e){return S(Fe(e))?e.pop():void 0}function le(e){return kt(Fe(e))?e.pop():void 0}var qe=(function(e){return e&&typeof e.length=="number"&&typeof e!="function"});function je(e){return S(e?.then)}function Be(e){return S(e[me])}function Ue(e){return Symbol.asyncIterator&&S(e?.[Symbol.asyncIterator])}function We(e){return new TypeError("You provided "+(e!==null&&typeof e=="object"?"an invalid object":"'"+e+"'")+" where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.")}function Nt(){return typeof Symbol!="function"||!Symbol.iterator?"@@iterator":Symbol.iterator}var He=Nt();function ze(e){return S(e?.[He])}function Ve(e){return ut(this,arguments,function(){var n,r,i,o;return Ne(this,function(s){switch(s.label){case 0:n=e.getReader(),s.label=1;case 1:s.trys.push([1,,9,10]),s.label=2;case 2:return[4,z(n.read())];case 3:return r=s.sent(),i=r.value,o=r.done,o?[4,z(void 0)]:[3,5];case 4:return[2,s.sent()];case 5:return[4,z(i)];case 6:return[4,s.sent()];case 7:return s.sent(),[3,2];case 8:return[3,10];case 9:return n.releaseLock(),[7];case 10:return[2]}})})}function Ge(e){return S(e?.getReader)}function j(e){if(e instanceof A)return e;if(e!=null){if(Be(e))return Pt(e);if(qe(e))return Rt(e);if(je(e))return Mt(e);if(Ue(e))return Ye(e);if(ze(e))return Lt(e);if(Ge(e))return Dt(e)}throw We(e)}function Pt(e){return new A(function(t){var n=e[me]();if(S(n.subscribe))return n.subscribe(t);throw new TypeError("Provided object does not correctly implement Symbol.observable")})}function Rt(e){return new A(function(t){for(var n=0;n<e.length&&!t.closed;n++)t.next(e[n]);t.complete()})}function Mt(e){return new A(function(t){e.then(function(n){t.closed||(t.next(n),t.complete())},function(n){return t.error(n)}).then(null,Le)})}function Lt(e){return new A(function(t){var n,r;try{for(var i=V(e),o=i.next();!o.done;o=i.next()){var s=o.value;if(t.next(s),t.closed)return}}catch(a){n={error:a}}finally{try{o&&!o.done&&(r=i.return)&&r.call(i)}finally{if(n)throw n.error}}t.complete()})}function Ye(e){return new A(function(t){Ft(e,t).catch(function(n){return t.error(n)})})}function Dt(e){return Ye(Ve(e))}function Ft(e,t){var n,r,i,o;return lt(this,void 0,void 0,function(){var s,a;return Ne(this,function(c){switch(c.label){case 0:c.trys.push([0,5,6,11]),n=dt(e),c.label=1;case 1:return[4,n.next()];case 2:if(r=c.sent(),!!r.done)return[3,4];if(s=r.value,t.next(s),t.closed)return[2];c.label=3;case 3:return[3,1];case 4:return[3,11];case 5:return a=c.sent(),i={error:a},[3,11];case 6:return c.trys.push([6,,9,10]),r&&!r.done&&(o=n.return)?[4,o.call(n)]:[3,8];case 7:c.sent(),c.label=8;case 8:return[3,10];case 9:if(i)throw i.error;return[7];case 10:return[7];case 11:return t.complete(),[2]}})})}function q(e,t,n,r,i){r===void 0&&(r=0),i===void 0&&(i=!1);var o=t.schedule(function(){n(),i?e.add(this.schedule(null,r)):this.unsubscribe()},r);if(e.add(o),!i)return o}function Ke(e,t){return t===void 0&&(t=0),O(function(n,r){n.subscribe(k(r,function(i){return q(r,e,function(){return r.next(i)},t)},function(){return q(r,e,function(){return r.complete()},t)},function(i){return q(r,e,function(){return r.error(i)},t)}))})}function Qe(e,t){return t===void 0&&(t=0),O(function(n,r){r.add(e.schedule(function(){return n.subscribe(r)},t))})}function qt(e,t){return j(e).pipe(Qe(t),Ke(t))}function jt(e,t){return j(e).pipe(Qe(t),Ke(t))}function Bt(e,t){return new A(function(n){var r=0;return t.schedule(function(){r===e.length?n.complete():(n.next(e[r++]),n.closed||this.schedule())})})}function Ut(e,t){return new A(function(n){var r;return q(n,t,function(){r=e[He](),q(n,t,function(){var i,o,s;try{i=r.next(),o=i.value,s=i.done}catch(a){n.error(a);return}s?n.complete():n.next(o)},0,!0)}),function(){return S(r?.return)&&r.return()}})}function Xe(e,t){if(!e)throw new Error("Iterable cannot be null");return new A(function(n){q(n,t,function(){var r=e[Symbol.asyncIterator]();q(n,t,function(){r.next().then(function(i){i.done?n.complete():n.next(i.value)})},0,!0)})})}function Wt(e,t){return Xe(Ve(e),t)}function Ht(e,t){if(e!=null){if(Be(e))return qt(e,t);if(qe(e))return Bt(e,t);if(je(e))return jt(e,t);if(Ue(e))return Xe(e,t);if(ze(e))return Ut(e,t);if(Ge(e))return Wt(e,t)}throw We(e)}function ue(e,t){return t?Ht(e,t):j(e)}function Q(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var n=le(e);return ue(e,n)}function J(e){return!!e&&(e instanceof A||S(e.lift)&&S(e.subscribe))}function zt(e){return e instanceof Date&&!isNaN(e)}function h(e,t){return O(function(n,r){var i=0;n.subscribe(k(r,function(o){r.next(e.call(t,o,i++))}))})}var Vt=Array.isArray;function Gt(e,t){return Vt(t)?e.apply(void 0,Y([],G(t))):e(t)}function Yt(e){return h(function(t){return Gt(e,t)})}var Kt=Array.isArray,Qt=Object.getPrototypeOf,Xt=Object.prototype,Zt=Object.keys;function Jt(e){if(e.length===1){var t=e[0];if(Kt(t))return{args:t,keys:null};if(en(t)){var n=Zt(t);return{args:n.map(function(r){return t[r]}),keys:n}}}return{args:e,keys:null}}function en(e){return e&&typeof e=="object"&&Qt(e)===Xt}function tn(e,t){return e.reduce(function(n,r,i){return n[r]=t[i],n},{})}function D(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var n=le(e),r=Ot(e),i=Jt(e),o=i.args,s=i.keys;if(o.length===0)return ue([],n);var a=new A(nn(o,n,s?function(c){return tn(s,c)}:te));return r?a.pipe(Yt(r)):a}function nn(e,t,n){return n===void 0&&(n=te),function(r){Ae(t,function(){for(var i=e.length,o=new Array(i),s=i,a=i,c=function(d){Ae(t,function(){var f=ue(e[d],t),b=!1;f.subscribe(k(r,function(p){o[d]=p,b||(b=!0,a--),a||r.next(n(o.slice()))},function(){--s||r.complete()}))},r)},u=0;u<i;u++)c(u)},r)}}function Ae(e,t,n){e?q(n,e,t):t()}function rn(e,t,n,r,i,o,s,a){var c=[],u=0,d=0,f=!1,b=function(){f&&!c.length&&!u&&t.complete()},p=function(w){return u<r?y(w):c.push(w)},y=function(w){u++;var C=!1;j(n(w,d++)).subscribe(k(t,function($){t.next($)},function(){C=!0},void 0,function(){if(C)try{u--;for(var $=function(){var B=c.shift();s||y(B)};c.length&&u<r;)$();b()}catch(B){t.error(B)}}))};return e.subscribe(k(t,p,function(){f=!0,b()})),function(){}}function Ze(e,t,n){return n===void 0&&(n=1/0),S(t)?Ze(function(r,i){return h(function(o,s){return t(r,o,i,s)})(j(e(r,i)))},n):(typeof t=="number"&&(n=t),O(function(r,i){return rn(r,i,e,n)}))}function on(e){return Ze(te,e)}function sn(){return on(1)}function Ie(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return sn()(ue(e,le(e)))}function an(e,t,n){return n===void 0&&(n=$t),new A(function(r){var i=zt(e)?+e-n.now():e;i<0&&(i=0);var o=0;return n.schedule(function(){r.closed||(r.next(o++),r.complete())},i)})}function cn(e,t){return O(function(n,r){var i=0;n.subscribe(k(r,function(o){return e.call(t,o,i++)&&r.next(o)}))})}function ln(e,t,n,r,i){return function(o,s){var a=n,c=t,u=0;o.subscribe(k(s,function(d){var f=u++;c=a?e(c,d,f):(a=!0,d),s.next(c)},i))}}function un(e){return e<=0?function(){return Tt}:O(function(t,n){var r=0;t.subscribe(k(n,function(i){++r<=e&&(n.next(i),e<=r&&n.complete())}))})}function Je(e,t){return t===void 0&&(t=te),e=e??dn,O(function(n,r){var i,o=!0;n.subscribe(k(r,function(s){var a=t(s);(o||!e(i,a))&&(o=!1,i=a,r.next(s))}))})}function dn(e,t){return e===t}function fn(e,t){return O(ln(e,t,arguments.length>=2,!0))}function pn(e){e===void 0&&(e={});var t=e.connector,n=t===void 0?function(){return new ne}:t,r=e.resetOnError,i=r===void 0?!0:r,o=e.resetOnComplete,s=o===void 0?!0:o,a=e.resetOnRefCountZero,c=a===void 0?!0:a;return function(u){var d,f,b,p=0,y=!1,w=!1,C=function(){f?.unsubscribe(),f=void 0},$=function(){C(),d=b=void 0,y=w=!1},B=function(){var U=d;$(),U?.unsubscribe()};return O(function(U,re){p++,!w&&!y&&C();var L=b=b??n();re.add(function(){p--,p===0&&!w&&!y&&(f=fe(B,c))}),L.subscribe(re),!d&&p>0&&(d=new Z({next:function(H){return L.next(H)},error:function(H){w=!0,C(),f=fe($,i,H),L.error(H)},complete:function(){y=!0,C(),f=fe($,s),L.complete()}}),j(U).subscribe(d))})(u)}}function fe(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];if(t===!0){e();return}if(t!==!1){var i=new Z({next:function(){i.unsubscribe(),e()}});return j(t.apply(void 0,Y([],G(n)))).subscribe(i)}}function hn(e,t,n){var r,i,o,s,a=!1;return e&&typeof e=="object"?(r=e.bufferSize,s=r===void 0?1/0:r,i=e.windowTime,t=i===void 0?1/0:i,o=e.refCount,a=o===void 0?!1:o,n=e.scheduler):s=e??1/0,pn({connector:function(){return new xt(s,t,n)},resetOnError:!0,resetOnComplete:!1,resetOnRefCountZero:a})}function vn(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];var n=le(e);return O(function(r,i){(n?Ie(e,r,n):Ie(e,r)).subscribe(i)})}function bn(e,t){return O(function(n,r){var i=null,o=0,s=!1,a=function(){return s&&!i&&r.complete()};n.subscribe(k(r,function(c){i?.unsubscribe();var u=0,d=o++;j(e(c,d)).subscribe(i=k(r,function(f){return r.next(t?t(c,f,d,u++):f)},function(){i=null,a()}))},function(){s=!0,a()}))})}let yn=(e,t)=>{console.warn(`[@rxjs-spa/dom] Error in ${t}:`,e)};function N(e,t){try{yn(e,t)}catch{}}function ee(e){for(const t of e){if(t.nodeType===Node.ELEMENT_NODE)return t;if(t.nodeType===Node.DOCUMENT_FRAGMENT_NODE){const n=ee(Array.from(t.childNodes));if(n)return n}}return null}function mn(e){const t=e.asObservable();return t.snapshot=()=>e.value,t}function $e(e){return e!==null&&typeof e=="object"&&"fragment"in e&&"sub"in e&&"fragment"in e&&"sub"in e&&(e.fragment instanceof DocumentFragment||e.fragment===null)}function gn(e){return e!==null&&typeof e=="object"&&e.__unsafeHtml===!0}function _n(e){return e!==null&&typeof e=="object"&&e.__conditional===!0}function wn(e){return e!==null&&typeof e=="object"&&e.__list===!0}const et="__RX_",Sn="<!--__RX_",be={ELEMENT_NODE:1,COMMENT_NODE:8},pe=new WeakMap;function xn(e){const t=pe.get(e);if(t)return t;let n="";const r=[];for(let u=0;u<e.length;u++)if(n+=e[u],u<e.length-1){const d=Cn(n);r.push(d),d==="attr"?n+=`${et}${u}__`:n+=`${Sn}${u}__-->`}const i="[A-Za-z_][\\w:-]*";if(n=n.replace(new RegExp(`\\s@(${i})=`,"g"),(u,d)=>` data-rx-event-${d}=`),n=n.replace(new RegExp(`\\s\\.(${i})=`,"g"),(u,d)=>` data-rx-prop-${d}=`),n=n.replace(new RegExp(`\\s\\?(${i})=`,"g"),(u,d)=>` data-rx-boolattr-${d}=`),typeof document>"u"||globalThis.IS_SSR){const u={templateEl:null,slots:[],paths:[],markup:n};return pe.set(e,u),u}const o=document.createElement("template");o.innerHTML=n;const s=[],a=[];tt(o.content,[],r,s,a);const c={templateEl:o,slots:s,paths:a};return pe.set(e,c),c}function Cn(e){const t=e.lastIndexOf("<");if(t===-1)return"text";const n=e.slice(t);if(n.includes(">"))return"text";const r=n.lastIndexOf("=");if(r===-1)return"text";const i=n.slice(r+1).trimStart();if(i.startsWith('"')||i.startsWith("'")){const o=i[0];return(i.slice(1).match(new RegExp(o==='"'?'"':"'","g"))||[]).length%2===0?"attr":"text"}return"attr"}function tt(e,t,n,r,i){if(e.nodeType===(typeof Node<"u"?Node.COMMENT_NODE:be.COMMENT_NODE)){const a=(e.textContent||"").match(/^__RX_(\d+)__$/);if(a){const c=parseInt(a[1],10);r.push({kind:"text",index:c}),i.push([...t])}return}if(e.nodeType===(typeof Node<"u"?Node.ELEMENT_NODE:be.ELEMENT_NODE)){const s=e,a=[];for(let c=0;c<s.attributes.length;c++){const u=s.attributes[c],d=u.name,b=u.value.match(new RegExp(`${et}(\\d+)__`));if(!b)continue;const p=parseInt(b[1],10);if(d.startsWith("data-rx-event-")){const y=d.slice(14);r.push({kind:"event",index:p,attrName:y}),i.push([...t]),a.push(d)}else if(d.startsWith("data-rx-prop-")){const y=d.slice(13);r.push({kind:"property",index:p,attrName:y}),i.push([...t]),a.push(d)}else if(d.startsWith("data-rx-boolattr-")){const y=d.slice(17);r.push({kind:"boolean-attr",index:p,attrName:y}),i.push([...t]),a.push(d)}else r.push({kind:"attribute",index:p,attrName:d}),i.push([...t]),a.push(d)}for(const c of a)s.removeAttribute(c)}const o=e.childNodes;for(let s=0;s<o.length;s++)tt(o[s],[...t,s],n,r,i)}function En(e,t){let n=e;for(const r of t){const i=n.childNodes[r];if(!i)return;n=i}return n}function An(e,t,n,r=!1){const i=new W,o=t.slots.map((s,a)=>En(e,t.paths[a]));for(let s=0;s<t.slots.length;s++){const a=t.slots[s],c=t.paths[s],u=n[a.index],d=o[s];if(!d){console.warn(`[rxjs-spa/dom] Slot ${a.kind}[${a.index}] path [${c}] could not be resolved — skipping.`,{prepared:t,fragment:e,slotIndex:s});continue}switch(a.kind){case"text":In(d,u,i,r?a.index:void 0);break;case"attribute":kn(d,a.attrName,u,i);break;case"event":On(d,a.attrName,u,i);break;case"property":Nn(d,a.attrName,u,i);break;case"boolean-attr":Pn(d,a.attrName,u,i);break}}return i}function In(e,t,n,r){const i=e.parentNode;if(!i)return;const o=()=>{if(r===void 0)return;const s=new RegExp(`^__RX_${r}__END$`);let a=e.nextSibling;const c=[];for(;a;){if(a.nodeType===(typeof Node<"u"?Node.COMMENT_NODE:be.COMMENT_NODE)&&s.test(a.textContent||"")){c.push(a);break}c.push(a),a=a.nextSibling}c.forEach(u=>i.removeChild(u))};if(_n(t))r!==void 0&&o(),$n(e,t,n);else if(wn(t))r!==void 0&&o(),Tn(e,t,n);else if($e(t))r!==void 0&&o(),i.replaceChild(t.fragment,e),n.add(t.sub);else if(gn(t)){r!==void 0&&o();const s=document.createElement("span");i.replaceChild(s,e),J(t.value)?n.add(t.value.subscribe({next:a=>{s.innerHTML=a},error:a=>N(a,"bindTextSlot/unsafeHtml")})):s.innerHTML=t.value}else if(J(t)){const s=e;let a=!1,c=null,u=[];n.add(t.subscribe({next:d=>{const f=s.parentNode;if(!f)return;!a&&r!==void 0&&(o(),a=!0),c&&(c.unsubscribe(),c=null),u.length>0&&(u.forEach(p=>p.parentNode?.removeChild(p)),u=[]);const b=s.nextSibling;if($e(d))c=d.sub,u=Array.from(d.fragment.childNodes),f.insertBefore(d.fragment,b);else{const p=document.createTextNode(String(d??""));u=[p],f.insertBefore(p,b)}},error:d=>N(d,"bindTextSlot")}))}else{r!==void 0&&o();const s=document.createTextNode(String(t??""));i.replaceChild(s,e)}}function $n(e,t,n){const r=e.parentNode;let i=[],o=null,s=null;function a(){o&&(o.unsubscribe(),o=null);for(const u of i)u.parentNode&&u.parentNode.removeChild(u);i=[]}function c(u){const d=u();o=d.sub,n.add(o);const f=Array.from(d.fragment.childNodes),b=e.nextSibling;for(const p of f)r.insertBefore(p,b);if(i=f,t.enter){const p=ee(f);p&&t.enter(p)}}n.add(t.condition$.pipe(Je()).subscribe({next:u=>{if(s&&(s.abort(),s=null),!u&&t.leave&&i.length>0){const d=i,f=o,b=new AbortController;s=b,i=[],o=null;const p=ee(d);if(p)t.leave(p).then(()=>{if(!b.signal.aborted){s=null,f&&f.unsubscribe();for(const y of d)y.parentNode&&y.parentNode.removeChild(y)}});else{f&&f.unsubscribe();for(const y of d)y.parentNode&&y.parentNode.removeChild(y);s=null}t.elseFn&&c(t.elseFn)}else{a();const d=u?t.thenFn:t.elseFn;d&&c(d)}},error:u=>N(u,"bindConditional")})),n.add(()=>{s&&s.abort();for(const u of i)u.parentNode&&u.parentNode.removeChild(u)})}function Tn(e,t,n){const r=e.parentNode,i=document.createElement("div");i.style.display="contents",r.replaceChild(i,e);const o=new Map,s=new Map;n.add(t.items$.subscribe({next:a=>{const c=new Set,u=[];for(let d=0;d<a.length;d++){const f=a[d],b=t.keyFn(f,d);c.add(b);const p=s.get(b);if(p){p.controller.abort(),s.delete(b),o.set(b,p.view),p.view.input.next(f);continue}let y=o.get(b);if(y)y.input.next(f);else{const w=new De(f),C=t.templateFn(mn(w),b);y={nodes:Array.from(C.fragment.childNodes),sub:C.sub,input:w},o.set(b,y),n.add(C.sub),u.push(b)}}for(const[d,f]of o)if(!c.has(d))if(o.delete(d),t.leave){const b=new AbortController;s.set(d,{view:f,controller:b});const p=ee(f.nodes);if(p)t.leave(p).then(()=>{if(!b.signal.aborted){s.delete(d),f.sub.unsubscribe(),f.input.complete();for(const y of f.nodes)y.parentNode&&y.parentNode.removeChild(y)}});else{s.delete(d),f.sub.unsubscribe(),f.input.complete();for(const y of f.nodes)y.parentNode&&y.parentNode.removeChild(y)}}else{f.sub.unsubscribe(),f.input.complete();for(const b of f.nodes)b.parentNode&&b.parentNode.removeChild(b)}for(let d=0;d<a.length;d++){const f=t.keyFn(a[d],d),b=o.get(f);for(const p of b.nodes)i.appendChild(p)}if(t.enter)for(const d of u){const f=o.get(d);if(f){const b=ee(f.nodes);b&&t.enter(b)}}},error:a=>N(a,"bindList")}))}function kn(e,t,n,r){J(n)?r.add(n.subscribe({next:i=>{i==null?e.removeAttribute(t):e.setAttribute(t,String(i))},error:i=>N(i,"bindAttributeSlot")})):n==null?e.removeAttribute(t):e.setAttribute(t,String(n))}function On(e,t,n,r){if(typeof n=="function"){const i=n;e.addEventListener(t,i),r.add(()=>e.removeEventListener(t,i))}}function Nn(e,t,n,r){J(n)?r.add(n.subscribe({next:i=>{e[t]=i},error:i=>N(i,"bindPropertySlot")})):e[t]=n}function Pn(e,t,n,r){J(n)?r.add(n.subscribe({next:i=>{i?e.setAttribute(t,""):e.removeAttribute(t)},error:i=>N(i,"bindBooleanAttrSlot")})):n?e.setAttribute(t,""):e.removeAttribute(t)}function x(e,...t){const n=xn(e);if(typeof document>"u"||globalThis.IS_SSR)return{fragment:null,sub:new W,strings:e,values:t};const r=n.templateEl.content.cloneNode(!0),i=An(r,n,t);return{fragment:r,sub:i,strings:e,values:t}}function F(e,t,n,r){return{__conditional:!0,condition$:e,thenFn:t,elseFn:n,enter:r?.enter,leave:r?.leave}}function M(e,t,n,r){return{__list:!0,items$:e,keyFn:t,templateFn:n,enter:r?.enter,leave:r?.leave}}function Rn(e){return t=>{const n=[],r=[],i=[],s=e(t,{onMount(a){n.push(a)},onDestroy(a){r.push(a)}});return queueMicrotask(()=>{if(!s.sub.closed)for(const a of n)try{const c=a();typeof c=="function"&&i.push(c)}catch(c){N(c,"defineComponent/onMount")}}),s.sub.add(()=>{for(const a of i)try{a()}catch(c){N(c,"defineComponent/onMount/cleanup")}for(const a of r)try{a()}catch(c){N(c,"defineComponent/onDestroy")}}),s}}function Mn(e,t){const n=new ne,r=new De(t),i=n.asObservable(),o=n.pipe(fn(e,t),vn(t),hn({bufferSize:1,refCount:!1}));return o.subscribe(s=>r.next(s)),{state$:o,actions$:i,dispatch(s){n.next(s)},select(s){return o.pipe(h(s),Je())},getState(){return r.value}}}function Ln(...e){return cn(t=>e.includes(t.type))}function Dn(e,t,n){const r=n?.storage??localStorage;try{const i=r.getItem(e);if(!i)return t;const o=JSON.parse(i);return{...t,...o}}catch{return t}}function Fn(e,t,n){const r=n?.storage??localStorage,i=n?.pick;return e.state$.subscribe(o=>{const s=i?Object.fromEntries(i.map(a=>[a,o[a]])):o;r.setItem(t,JSON.stringify(s))})}function qn(e,t,n,r){const i=r?.storage??localStorage,o=r?.version,s=`${n}.__version__`;i.getItem(s)!==String(o)&&(i.removeItem(n),i.setItem(s,String(o)));const a=Dn(n,t,r),c=Mn(e,a);return Fn(c,n,r),c}const T={name:"SoundFlow Pro",tagline:"Wireless Noise-Cancelling Headphones",basePrice:199,rating:4.7,reviewCount:124},X=[{id:"black",name:"Midnight Black",hex:"#1a1a2e",stock:"in-stock"},{id:"white",name:"Pearl White",hex:"#d4cfc8",stock:"in-stock"},{id:"gray",name:"Space Gray",hex:"#5c6370",stock:"limited",stockCount:3},{id:"navy",name:"Navy Blue",hex:"#1e3a5f",stock:"out-of-stock"}],se=[{id:"standard",name:"Standard",description:"40 mm · 30 h ANC battery",priceAdd:0},{id:"pro",name:"Pro",description:"50 mm · 50 h ANC · LDAC",priceAdd:50}],ce=[{id:"case",name:"Carrying Case",description:"Hard-shell protective case",price:29},{id:"cable",name:"3 m Braided Cable",description:"Premium 3-metre braided cable",price:15},{id:"cushions",name:"Memory Foam Cushions",description:"Ultra-soft replacement ear pads",price:19},{id:"kit",name:"Cleaning Kit",description:"6-piece audio care kit",price:12}],jn=[{id:"1",author:"Alex M.",avatar:"AM",rating:5,date:"Jan 15, 2026",title:"Best headphones I've ever owned",body:"The noise cancellation is phenomenal. I use these every day for work and they're a game-changer. Battery life easily lasts two full workdays.",verified:!0},{id:"2",author:"Sarah K.",avatar:"SK",rating:4,date:"Dec 28, 2025",title:"Great sound, slightly heavy",body:"Sound quality is outstanding, especially in Pro mode with LDAC. Slightly heavier than my previous pair but you get used to it quickly.",verified:!0},{id:"3",author:"James R.",avatar:"JR",rating:5,date:"Nov 10, 2025",title:"Worth every penny",body:"Picked up Space Gray with the carrying case — perfect travel companion. Build quality feels genuinely premium for the price.",verified:!1},{id:"4",author:"Priya N.",avatar:"PN",rating:4,date:"Oct 22, 2025",title:"Excellent ANC, great companion app",body:"The app lets you dial in custom EQ profiles and the ANC is competitive with brands costing twice as much. Highly recommend the memory foam cushion add-on.",verified:!0}],Bn=[{category:"Audio",rows:[{label:"Driver Size",standard:"40 mm dynamic",pro:"50 mm dynamic"},{label:"Frequency Response",standard:"20 – 20,000 Hz",pro:"20 – 40,000 Hz"},{label:"Codec Support",standard:"SBC, AAC",pro:"SBC, AAC, LDAC, aptX HD"},{label:"Noise Cancellation",standard:"Hybrid ANC",pro:"Adaptive ANC+"}]},{category:"Battery",rows:[{label:"Playback (ANC on)",standard:"30 hours",pro:"50 hours"},{label:"Playback (ANC off)",standard:"40 hours",pro:"65 hours"},{label:"Charge Time",standard:"2 h (USB-C)",pro:"2.5 h (USB-C)"},{label:"Fast Charge",standard:"10 min → 3 h",pro:"10 min → 5 h"}]},{category:"Connectivity",rows:[{label:"Bluetooth",standard:"5.2",pro:"5.3"},{label:"Range",standard:"Up to 10 m",pro:"Up to 15 m"},{label:"Multipoint",standard:"2 devices",pro:"4 devices"},{label:"Wired Input",standard:"3.5 mm jack",pro:"3.5 mm + USB-C audio"}]},{category:"Physical",rows:[{label:"Weight",standard:"250 g",pro:"280 g"},{label:"Foldable",standard:"Yes",pro:"Yes"},{label:"IP Rating",standard:"IPX4",pro:"IPX5"},{label:"Mic System",standard:"Dual beamforming",pro:"Quad beamforming"}]}],Te=[{label:"Hero",angle:"Front view"},{label:"Profile",angle:"Side profile"},{label:"Folded",angle:"Folded compact"},{label:"Detail",angle:"Ear cup detail"},{label:"Lifestyle",angle:"On-ear lifestyle"}];let Un=0;const Wn=()=>`ci-${++Un}`,Hn={selectedColorId:"black",selectedSizeId:"standard",selectedAddonIds:[],activeTab:"gallery",quantity:1,addedToCart:!1,activeImageIndex:0,cartItems:[]};function zn(e,t){switch(t.type){case"SELECT_COLOR":return{...e,selectedColorId:t.colorId,addedToCart:!1};case"SELECT_SIZE":return{...e,selectedSizeId:t.sizeId,addedToCart:!1};case"TOGGLE_ADDON":{const n=e.selectedAddonIds,r=n.indexOf(t.addonId);return{...e,selectedAddonIds:r===-1?[...n,t.addonId]:n.filter(i=>i!==t.addonId),addedToCart:!1}}case"SET_TAB":return{...e,activeTab:t.tab};case"INC_QTY":return{...e,quantity:Math.min(e.quantity+1,10)};case"DEC_QTY":return{...e,quantity:Math.max(e.quantity-1,1)};case"ADD_TO_CART":{const n=X.find(c=>c.id===e.selectedColorId),r=se.find(c=>c.id===e.selectedSizeId),i=e.selectedAddonIds.reduce((c,u)=>{const d=ce.find(f=>f.id===u);return c+(d?.price??0)},0),o=[e.selectedColorId,e.selectedSizeId,[...e.selectedAddonIds].sort().join(",")].join("|"),s=e.cartItems.find(c=>c.configKey===o);if(s)return{...e,addedToCart:!0,cartItems:e.cartItems.map(c=>c.id===s.id?{...c,qty:Math.min(c.qty+e.quantity,10)}:c)};const a={id:Wn(),configKey:o,colorName:n?.name??"",sizeName:r?.name??"",addonNames:e.selectedAddonIds.map(c=>ce.find(u=>u.id===c)?.name??c),qty:e.quantity,unitPrice:T.basePrice+(r?.priceAdd??0)+i};return{...e,addedToCart:!0,cartItems:[...e.cartItems,a]}}case"RESET_CART":return{...e,addedToCart:!1};case"REMOVE_FROM_CART":return{...e,cartItems:e.cartItems.filter(n=>n.id!==t.itemId)};case"UPDATE_CART_QTY":return{...e,cartItems:e.cartItems.map(n=>n.id===t.itemId?{...n,qty:Math.max(1,Math.min(n.qty+t.delta,10))}:n)};case"SET_IMAGE":return{...e,activeImageIndex:t.index}}}function he(e){const t=Math.floor(e),n=e-t>=.5?1:0,r=5-t-n,i="★".repeat(t)+(n?"½":"")+"☆".repeat(r);return x`<span class="stars" title="${e} out of 5">${i}</span>`}function ke(){return x`
    <svg class="product-svg" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14 56 C14 16 106 16 106 56"
            fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>
      <line x1="14" y1="56" x2="14" y2="68"
            stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
      <line x1="106" y1="56" x2="106" y2="68"
            stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
      <rect x="4"   y="62" width="22" height="30" rx="9" fill="currentColor"/>
      <rect x="94"  y="62" width="22" height="30" rx="9" fill="currentColor"/>
      <rect x="9"   y="67" width="12" height="20" rx="5" fill="currentColor" opacity="0.28"/>
      <rect x="99"  y="67" width="12" height="20" rx="5" fill="currentColor" opacity="0.28"/>
    </svg>
  `}function Oe(e,t){return`linear-gradient(${t}deg, ${e}ee 0%, ${e}88 55%, ${e}33 100%)`}const Vn=Rn(e=>{const t=qn(zn,Hn,"sfp:cart",{pick:["cartItems"],version:1});t.actions$.pipe(Ln("ADD_TO_CART"),bn(()=>an(2e3).pipe(un(1),h(()=>({type:"RESET_CART"}))))).subscribe(t.dispatch);const n=t.select(l=>X.find(m=>m.id===l.selectedColorId)??X[0]),r=t.select(l=>se.find(m=>m.id===l.selectedSizeId)??se[0]),i=t.select(l=>l.activeImageIndex),o=t.select(l=>l.activeTab),s=t.select(l=>l.quantity),a=t.select(l=>l.addedToCart),c=t.select(l=>l.cartItems),u=c.pipe(h(l=>l.reduce((m,g)=>m+g.qty,0))),d=c.pipe(h(l=>l.reduce((m,g)=>m+g.qty*g.unitPrice,0))),f=u.pipe(h(l=>l>0)),p=D([r,t.select(l=>l.selectedAddonIds)]).pipe(h(([l,m])=>{const g=l?.priceAdd??0,v=m.reduce((_,R)=>{const E=ce.find(K=>K.id===R);return _+(E?.price??0)},0);return T.basePrice+g+v})).pipe(h(l=>`$${l}`)),y=n.pipe(h(l=>l?l.stock==="out-of-stock"?{text:"Out of Stock",cls:"avail-out"}:l.stock==="limited"?{text:`Only ${l.stockCount} left!`,cls:"avail-limited"}:{text:"In Stock",cls:"avail-in"}:{text:"Select a color",cls:"avail-unknown"})),w=y.pipe(h(l=>l.text)),C=y.pipe(h(l=>`availability ${l.cls}`)),$=n.pipe(h(l=>!!l&&l.stock!=="out-of-stock")),B=D([a,u]).pipe(h(([l,m])=>l?"✓ Added to Cart!":m>0?`Add to Cart · ${m} in cart`:"Add to Cart")),U=D([$,a]).pipe(h(([l,m])=>m?"btn-cart btn-cart--added":l?"btn-cart":"btn-cart btn-cart--disabled")),re=D([n,i]).pipe(h(([l,m])=>{const g=l?.hex??"#6366f1",v=[135,45,90,160,120];return Oe(g,v[m%v.length])})),L=l=>o.pipe(h(m=>m===l?"tab-btn tab-btn--active":"tab-btn")),H=o.pipe(h(l=>l==="gallery")),nt=o.pipe(h(l=>l==="specs")),rt=o.pipe(h(l=>l==="reviews")),it=n.pipe(h(l=>Te.map((m,g)=>({...m,idx:g,hex:l?.hex??"#6366f1"})))),ot=()=>x`
    <div class="gallery-grid">
      ${M(it,l=>String(l.idx),l=>{const m=[135,45,90,160,120],g=l.pipe(h(_=>Oe(_.hex,m[_.idx]))),v=l.pipe(h(_=>_.angle));return x`
            <div class="gallery-grid__item">
              <div class="gallery-mock" style="background: ${g}">
                ${ke()}
              </div>
              <span class="gallery-grid__label">${v}</span>
            </div>
          `})}
    </div>
  `,st=()=>x`
    <div class="specs-panel">
      ${M(Q(Bn),l=>l.category,l=>x`
          <div class="spec-group">
            <h3 class="spec-group__title">${l.pipe(h(m=>m.category))}</h3>
            <table class="spec-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Standard</th>
                  <th>Pro</th>
                </tr>
              </thead>
              <tbody>
                ${M(l.pipe(h(m=>m.rows)),(m,g)=>String(g),m=>x`
                    <tr>
                      <td class="spec-label">${m.pipe(h(g=>g.label))}</td>
                      <td>${m.pipe(h(g=>g.standard))}</td>
                      <td>${m.pipe(h(g=>g.pro))}</td>
                    </tr>
                  `)}
              </tbody>
            </table>
          </div>
        `)}
    </div>
  `,at=()=>x`
    <div class="reviews-panel">
      <div class="reviews-summary">
        <div class="reviews-summary__score">${T.rating.toFixed(1)}</div>
        <div>
          <div class="reviews-summary__stars">${he(T.rating)}</div>
          <div class="reviews-summary__count">Based on ${T.reviewCount} reviews</div>
        </div>
      </div>
      <div class="review-list">
        ${M(Q(jn),l=>l.id,l=>{const m=l.pipe(h(I=>I.author)),g=l.pipe(h(I=>I.avatar)),v=l.pipe(h(I=>I.title)),_=l.pipe(h(I=>I.body)),R=l.pipe(h(I=>I.date)),E=l.pipe(h(I=>I.verified)),K=l.pipe(h(I=>he(I.rating)));return x`
              <div class="review-card">
                <div class="review-card__header">
                  <div class="review-avatar">${g}</div>
                  <span class="review-card__author">${m}</span>
                  ${F(E,()=>x`
                    <span class="verified-badge">✓ Verified</span>
                  `)}
                  <span class="review-card__date">${R}</span>
                </div>
                <div class="review-card__rating">${K}</div>
                <strong class="review-card__title">${v}</strong>
                <p class="review-card__body">${_}</p>
              </div>
            `})}
      </div>
    </div>
  `,ct=n.pipe(h(l=>Te.map((m,g)=>({...m,idx:g,hex:l?.hex??"#6366f1"}))));return x`
    <div class="product-page">

      <!-- ── Header ─────────────────────────────────────────────────── -->
      <header class="product-header">
        <div class="product-header__brand">
          <span class="brand-mark">◉</span>
          <span class="brand-name">SoundFlow</span>
        </div>
        <nav class="product-header__nav">
          <a href="#">Headphones</a>
          <a href="#">Earbuds</a>
          <a href="#">Accessories</a>
        </nav>
        <button class="header-cart">
          <span class="header-cart__icon">🛒</span>
          Cart
          ${F(f,()=>x`
            <span class="cart-badge">${u}</span>
          `)}
        </button>
      </header>

      <!-- ── Breadcrumb ──────────────────────────────────────────────── -->
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="#">Home</a>
        <span class="sep">›</span>
        <a href="#">Headphones</a>
        <span class="sep">›</span>
        <span class="breadcrumb__current">${T.name}</span>
      </nav>

      <!-- ── Main product section ────────────────────────────────────── -->
      <section class="product-section">

        <!-- Gallery column -->
        <div class="product-gallery">
          <!-- Main image — gradient changes with color + thumbnail selection -->
          <div class="gallery-main" style="background: ${re}">
            ${ke()}
          </div>

          <!-- Thumbnail strip -->
          <div class="gallery-thumbs">
            ${M(ct,l=>String(l.idx),l=>{const m=[135,45,90,160,120],v=D([l,i]).pipe(h(([E,K])=>E.idx===K)).pipe(h(E=>E?"thumb thumb--active":"thumb")),_=l.pipe(h(E=>`linear-gradient(${m[E.idx]}deg, ${E.hex}bb 0%, ${E.hex}44 100%)`)),R=l.pipe(h(E=>E.angle));return x`
                  <button
                    class="${v}"
                    style="background: ${_}"
                    title="${R}"
                    @click=${()=>t.dispatch({type:"SET_IMAGE",index:l.snapshot().idx})}
                  >
                    <span class="thumb-label">${l.pipe(h(E=>E.label))}</span>
                  </button>
                `})}
          </div>
        </div>

        <!-- Config column -->
        <div class="product-config">

          <!-- Title / rating -->
          <div class="product-config__top">
            <h1 class="product-title">${T.name}</h1>
            <p class="product-tagline">${T.tagline}</p>
            <div class="product-rating">
              ${he(T.rating)}
              <span class="product-rating__count"
                    @click=${()=>t.dispatch({type:"SET_TAB",tab:"reviews"})}>
                ${T.reviewCount} reviews
              </span>
            </div>
          </div>

          <!-- Live price + availability -->
          <div class="price-block">
            <span class="price-current">${p}</span>
            <span class="${C}">${w}</span>
          </div>

          <div class="config-divider"></div>

          <!-- Color picker -->
          <div class="config-section">
            <div class="config-label">
              Color: <strong>${n.pipe(h(l=>l?.name??"—"))}</strong>
            </div>
            <div class="swatch-row">
              ${M(Q(X),l=>l.id,l=>{const m=D([l,t.select(v=>v.selectedColorId)]).pipe(h(([v,_])=>{let R="swatch";return v.id===_&&(R+=" swatch--selected"),v.stock==="out-of-stock"&&(R+=" swatch--oos"),R})),g=l.pipe(h(v=>v.stock==="out-of-stock"?`${v.name} (Out of stock)`:v.stock==="limited"?`${v.name} — only ${v.stockCount} left`:v.name));return x`
                    <button
                      class="${m}"
                      style="--swatch-color: ${l.pipe(h(v=>v.hex))}"
                      title="${g}"
                      @click=${()=>{const v=l.snapshot();v.stock!=="out-of-stock"&&t.dispatch({type:"SELECT_COLOR",colorId:v.id})}}
                    ></button>
                  `})}
            </div>
          </div>

          <!-- Edition (size) -->
          <div class="config-section">
            <div class="config-label">Edition</div>
            <div class="size-row">
              ${M(Q(se),l=>l.id,l=>{const m=D([l,t.select(v=>v.selectedSizeId)]).pipe(h(([v,_])=>v.id===_?"size-btn size-btn--selected":"size-btn")),g=l.pipe(h(v=>v.priceAdd));return x`
                    <button
                      class="${m}"
                      @click=${()=>t.dispatch({type:"SELECT_SIZE",sizeId:l.snapshot().id})}
                    >
                      <span class="size-btn__name">${l.pipe(h(v=>v.name))}</span>
                      <span class="size-btn__desc">${l.pipe(h(v=>v.description))}</span>
                      ${F(g.pipe(h(v=>v>0)),()=>x`<span class="size-btn__price">+$${g}</span>`)}
                    </button>
                  `})}
            </div>
          </div>

          <!-- Add-ons -->
          <div class="config-section">
            <div class="config-label">Add-ons</div>
            <div class="addon-grid">
              ${M(Q(ce),l=>l.id,l=>{const m=D([l,t.select(v=>v.selectedAddonIds)]).pipe(h(([v,_])=>_.includes(v.id))),g=m.pipe(h(v=>v?"addon-card addon-card--checked":"addon-card"));return x`
                    <label class="${g}">
                      <input
                        type="checkbox"
                        .checked=${m}
                        @change=${()=>t.dispatch({type:"TOGGLE_ADDON",addonId:l.snapshot().id})}
                      />
                      <div class="addon-card__info">
                        <span class="addon-card__name">${l.pipe(h(v=>v.name))}</span>
                        <span class="addon-card__desc">${l.pipe(h(v=>v.description))}</span>
                      </div>
                      <span class="addon-card__price">+$${l.pipe(h(v=>v.price))}</span>
                    </label>
                  `})}
            </div>
          </div>

          <div class="config-divider"></div>

          <!-- Quantity -->
          <div class="config-section">
            <div class="config-label">Quantity</div>
            <div class="qty-stepper">
              <button class="qty-btn" @click=${()=>t.dispatch({type:"DEC_QTY"})}>−</button>
              <span class="qty-value">${s}</span>
              <button class="qty-btn" @click=${()=>t.dispatch({type:"INC_QTY"})}>+</button>
            </div>
          </div>

          <!-- CTA -->
          <div class="cta-row">
            <button
              class="${U}"
              @click=${()=>{const l=X.find(m=>m.id===t.getState().selectedColorId);l&&l.stock!=="out-of-stock"&&t.dispatch({type:"ADD_TO_CART"})}}
            >${B}</button>
            <button class="btn-wishlist">♡ Wishlist</button>
          </div>

          <!-- Mini cart summary -->
          ${F(f,()=>x`
            <div class="mini-cart">
              <div class="mini-cart__header">
                <span class="mini-cart__title">🛒 Your Cart</span>
                <span class="mini-cart__total">Total: $${d}</span>
              </div>
              <ul class="mini-cart__list">
                ${M(c,l=>l.id,l=>{const m=l.pipe(h(_=>_.addonNames.length>0)),g=l.pipe(h(_=>_.qty<=1)),v=l.pipe(h(_=>_.qty>=10));return x`
                      <li class="mini-cart__item">
                        <div class="mini-cart__item-info">
                          <span class="mini-cart__item-name">
                            ${l.pipe(h(_=>`${_.sizeName} · ${_.colorName}`))}
                          </span>
                          ${F(m,()=>x`
                            <span class="mini-cart__item-addons">
                              ${l.pipe(h(_=>_.addonNames.join(", ")))}
                            </span>
                          `)}
                        </div>
                        <div class="mini-cart__qty-ctrl">
                          <button
                            class="mini-cart__qty-btn"
                            ?disabled=${g}
                            @click=${()=>t.dispatch({type:"UPDATE_CART_QTY",itemId:l.snapshot().id,delta:-1})}
                          >−</button>
                          <span class="mini-cart__qty-val">${l.pipe(h(_=>_.qty))}</span>
                          <button
                            class="mini-cart__qty-btn"
                            ?disabled=${v}
                            @click=${()=>t.dispatch({type:"UPDATE_CART_QTY",itemId:l.snapshot().id,delta:1})}
                          >+</button>
                        </div>
                        <span class="mini-cart__item-price">
                          $${l.pipe(h(_=>_.qty*_.unitPrice))}
                        </span>
                        <button
                          class="mini-cart__remove"
                          title="Remove item"
                          @click=${()=>t.dispatch({type:"REMOVE_FROM_CART",itemId:l.snapshot().id})}
                        >✕</button>
                      </li>
                    `})}
              </ul>
            </div>
          `)}

          <!-- Trust badges -->
          <div class="product-badges">
            <span class="badge">🚚 Free shipping over $150</span>
            <span class="badge">↩ 30-day returns</span>
            <span class="badge">🔒 Secure checkout</span>
          </div>

        </div>
      </section>

      <!-- ── Tabs ────────────────────────────────────────────────────── -->
      <section class="tabs-section">
        <div class="tabs-nav">
          <button class="${L("gallery")}"
                  @click=${()=>t.dispatch({type:"SET_TAB",tab:"gallery"})}>
            Gallery
          </button>
          <button class="${L("specs")}"
                  @click=${()=>t.dispatch({type:"SET_TAB",tab:"specs"})}>
            Specifications
          </button>
          <button class="${L("reviews")}"
                  @click=${()=>t.dispatch({type:"SET_TAB",tab:"reviews"})}>
            Reviews (${T.reviewCount})
          </button>
        </div>

        <div class="tab-content">
          ${F(H,ot)}
          ${F(nt,st)}
          ${F(rt,at)}
        </div>
      </section>

    </div>
  `}),{fragment:Gn,sub:Kn}=Vn({}),Yn=document.getElementById("app");Yn.appendChild(Gn);
