/*! @ryanmorr/blunder v0.1.1 | https://github.com/ryanmorr/blunder */
"use strict";const e=window.document,t=e.documentElement,n=window.navigator,r=window.screen,o=window.performance;const i="<unknown>",c=/^\s*at\s(?:(.*?)(?=(?:\s\())\s)?\(?(?:((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/|[a-z]:\\|\\\\).*?))(?::(\d+))?(?::(\d+))?\)?\s*$/i,a=/^\s*(.*?)?(?:^|@)(?:((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle))(?::(\d+))?(?::(\d+))?\s*$/i;function s(e){return void 0===e?e=function(e){const t=new Error;return Error.captureStackTrace&&Error.captureStackTrace(t,e),t.stack}(s):e instanceof Error&&(e=e.stack),function(e){return e.split("\n").reduce(((e,t)=>{let n=t.match(c)||t.match(a);if(n){const[,t,r,o,c]=n;e.push({functionName:t||i,fileName:r,lineNumber:o?+o:null,columnNumber:c?+c:null})}return e}),[])}(e)}class u extends Error{constructor(i,c={}){super(i),Object.defineProperty(this,"name",{configurable:!0,enumerable:!1,value:this.constructor.name,writable:!0}),Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor),"string"!=typeof this.stack&&Object.defineProperty(this,"stack",{configurable:!0,enumerable:!1,value:new Error(i).stack,writable:!0}),this.detail=c,this.meta=function(){const i={datetime:(new Date).toString(),timestamp:Date.now(),userAgent:n.userAgent,url:e.location.href,referrer:e.referrer,cookie:n.cookieEnabled?e.cookie:"<disabled>",language:n.language||n.userLanguage,readyState:e.readyState,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight};return r&&r.orientation&&r.orientation.type?i.orientation=r.orientation.type:i.orientation=t.clientWidth>t.clientHeight?"landscape":"portrait",n.connection&&n.connection.effectiveType&&(i.connection=n.connection.effectiveType),o&&o.memory&&(i.memory=Math.round(o.memory.usedJSHeapSize/1048576),i.memoryPercent=Math.round(o.memory.usedJSHeapSize/o.memory.jsHeapSizeLimit*100)),i}()}get stacktrace(){return this._stacktrace||(this._stacktrace=s(this.stack)),this._stacktrace}toJSON(){return{name:this.name,message:this.message,stack:this.stack,meta:this.meta,stacktrace:this.stacktrace,detail:Object.keys(this.detail).reduce(((e,t)=>{let n=this.detail[t];const r={}.toString.call(n).slice(8,-1);return"Date"!==r&&"Function"!==r||(n=n.toString()),e[t]=n,e}),{})}}static from(e,t){const n=this;if(e instanceof n)return t&&(e.detail=Object.assign(e.detail,t)),e;if(e instanceof Error){const r=new n(e.message,t);return r.stack=e.stack,r.source=e,r}return new n(e,t)}}const d=[],m=new WeakSet;function l(e,t){const n=u.from(e,t);return m.has(n)||(m.add(n),d.slice().forEach((e=>e(n)))),n}let h=!1,f=!1,p=!1;function w(e){e.preventDefault(),l(u.from(e.error))}function k(e){e.preventDefault(),l(u.from(e.reason,{promise:e.promise}))}function b(e){e.preventDefault(),l(u.from(e.reason,{promise:e.promise}))}function g(){h&&(h=!1,window.removeEventListener("error",w)),f&&(f=!1,window.removeEventListener("unhandledrejection",k)),p&&(p=!1,window.removeEventListener("rejectionhandled",b))}exports.Exception=u,exports.attempt=function(e,t){const n=new Promise(((n,r)=>{try{n(e())}catch(e){r(u.from(e,t))}}));return n.catch(l),n},exports.dispatch=l,exports.monitor=function({error:e=!0,unhandledrejection:t=!0,rejectionhandled:n=!0}={}){return h||f||p||(e&&(h=!0,window.addEventListener("error",w,!0)),t&&(f=!0,window.addEventListener("unhandledrejection",k)),n&&(p=!0,window.addEventListener("rejectionhandled",b))),g},exports.report=function(e,t){return new Promise(((n,r)=>{const o=e=>r(u.from(e));fetch(e,{method:"POST",cache:"no-cache",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).catch(o).then((e=>e.ok?e.json():Promise.reject(u.from(e.statusText)))).then(n).catch(o)}))},exports.stacktrace=s,exports.subscribe=function(e){return d.push(e),()=>{const t=d.indexOf(e);-1!==t&&d.splice(t,1)}};
