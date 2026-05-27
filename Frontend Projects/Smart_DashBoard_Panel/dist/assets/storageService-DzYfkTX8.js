import{r as e,t}from"./chunk-CilyBKbf.js";var n=t((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.iterator;function m(e){return typeof e!=`object`||!e?null:(e=p&&e[p]||e[`@@iterator`],typeof e==`function`?e:null)}var h={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g=Object.assign,_={};function v(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}v.prototype.isReactComponent={},v.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function y(){}y.prototype=v.prototype;function b(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}var x=b.prototype=new y;x.constructor=b,g(x,v.prototype),x.isPureReactComponent=!0;var S=Array.isArray;function C(){}var w={H:null,A:null,T:null,S:null},T=Object.prototype.hasOwnProperty;function E(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function D(e,t){return E(e.type,t,e.props)}function O(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function k(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var A=/\/+/g;function j(e,t){return typeof e==`object`&&e&&e.key!=null?k(``+e.key):t.toString(36)}function M(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(C,C):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function N(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,N(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+j(e,0):a,S(o)?(i=``,c!=null&&(i=c.replace(A,`$&/`)+`/`),N(o,r,i,``,function(e){return e})):o!=null&&(O(o)&&(o=D(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(A,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(S(e))for(var u=0;u<e.length;u++)a=e[u],s=l+j(a,u),c+=N(a,r,i,s,o);else if(u=m(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+j(a,u++),c+=N(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return N(M(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function P(e,t,n){if(e==null)return e;var r=[],i=0;return N(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function F(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var I=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},L={map:P,forEach:function(e,t,n){P(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return P(e,function(){t++}),t},toArray:function(e){return P(e,function(e){return e})||[]},only:function(e){if(!O(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=L,e.Component=v,e.Fragment=r,e.Profiler=a,e.PureComponent=b,e.StrictMode=i,e.Suspense=l,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=w,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return w.H.useMemoCache(e)}},e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=g({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!T.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return E(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)T.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return E(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=O,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:F}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=w.T,n={};w.T=n;try{var r=e(),i=w.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(C,I)}catch(e){I(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),w.T=t}},e.unstable_useCacheRefresh=function(){return w.H.useCacheRefresh()},e.use=function(e){return w.H.use(e)},e.useActionState=function(e,t,n){return w.H.useActionState(e,t,n)},e.useCallback=function(e,t){return w.H.useCallback(e,t)},e.useContext=function(e){return w.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return w.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return w.H.useEffect(e,t)},e.useEffectEvent=function(e){return w.H.useEffectEvent(e)},e.useId=function(){return w.H.useId()},e.useImperativeHandle=function(e,t,n){return w.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return w.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return w.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return w.H.useMemo(e,t)},e.useOptimistic=function(e,t){return w.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return w.H.useReducer(e,t,n)},e.useRef=function(e){return w.H.useRef(e)},e.useState=function(e){return w.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return w.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return w.H.useTransition()},e.version=`19.2.6`})),r=t(((e,t)=>{t.exports=n()})),i=e(r(),1),a={data:``},o=e=>{if(typeof window==`object`){let t=(e?e.querySelector(`#_goober`):window._goober)||Object.assign(document.createElement(`style`),{innerHTML:` `,id:`_goober`});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||a},s=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,c=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,u=(e,t)=>{let n=``,r=``,i=``;for(let a in e){let o=e[a];a[0]==`@`?a[1]==`i`?n=a+` `+o+`;`:r+=a[1]==`f`?u(o,a):a+`{`+u(o,a[1]==`k`?``:t)+`}`:typeof o==`object`?r+=u(o,t?t.replace(/([^,])+/g,e=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+` `+t:t)):a):o!=null&&(a=a[1]==`-`?a:a.replace(/[A-Z]/g,`-$&`).toLowerCase(),i+=u.p?u.p(a,o):a+`:`+o+`;`)}return n+(t&&i?t+`{`+i+`}`:i)+r},d={},f=e=>{if(typeof e==`object`){let t=``;for(let n in e)t+=n+f(e[n]);return t}return e},p=(e,t,n,r,i)=>{let a=f(e),o=d[a]||(d[a]=(e=>{let t=0,n=11;for(;t<e.length;)n=101*n+e.charCodeAt(t++)>>>0;return`go`+n})(a));if(!d[o]){let t=a===e?(e=>{let t,n,r=[{}];for(;t=s.exec(e.replace(c,``));)t[4]?r.shift():t[3]?(n=t[3].replace(l,` `).trim(),r.unshift(r[0][n]=r[0][n]||{})):r[0][t[1]]=t[2].replace(l,` `).trim();return r[0]})(e):e;d[o]=u(i?{[`@keyframes `+o]:t}:t,n?``:`.`+o)}let p=n&&d.g;return n&&(d.g=d[o]),((e,t,n,r)=>{r?t.data=t.data.replace(r,e):t.data.indexOf(e)===-1&&(t.data=n?e+t.data:t.data+e)})(d[o],t,r,p),o},m=(e,t,n)=>e.reduce((e,r,i)=>{let a=t[i];if(a&&a.call){let e=a(n),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;a=t?`.`+t:e&&typeof e==`object`?e.props?``:u(e,``):!1===e?``:e}return e+r+(a??``)},``);function h(e){let t=this||{},n=e.call?e(t.p):e;return p(n.unshift?n.raw?m(n,[].slice.call(arguments,1),t.p):n.reduce((e,n)=>Object.assign(e,n&&n.call?n(t.p):n),{}):n,o(t.target),t.g,t.o,t.k)}var g,_,v;h.bind({g:1});var y=h.bind({k:1});function b(e,t,n,r){u.p=t,g=e,_=n,v=r}function x(e,t){let n=this||{};return function(){let r=arguments;function i(a,o){let s=Object.assign({},a),c=s.className||i.className;n.p=Object.assign({theme:_&&_()},s),n.o=/go\d/.test(c),s.className=h.apply(n,r)+(c?` `+c:``),t&&(s.ref=o);let l=e;return e[0]&&(l=s.as||e,delete s.as),v&&l[0]&&v(s),g(l,s)}return t?t(i):i}}var S=e=>typeof e==`function`,C=(e,t)=>S(e)?e(t):e,w=(()=>{let e=0;return()=>(++e).toString()})(),T=(()=>{let e;return()=>{if(e===void 0&&typeof window<`u`){let t=matchMedia(`(prefers-reduced-motion: reduce)`);e=!t||t.matches}return e}})(),E=20,D=`default`,O=(e,t)=>{let{toastLimit:n}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,n)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return O(e,{type:+!!e.toasts.find(e=>e.id===r.id),toast:r});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(e=>e.id===i||i===void 0?{...e,dismissed:!0,visible:!1}:e)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let a=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+a}))}}},k=[],A={toasts:[],pausedAt:void 0,settings:{toastLimit:E}},j={},M=(e,t=D)=>{j[t]=O(j[t]||A,e),k.forEach(([e,n])=>{e===t&&n(j[t])})},N=e=>Object.keys(j).forEach(t=>M(e,t)),P=e=>Object.keys(j).find(t=>j[t].toasts.some(t=>t.id===e)),F=(e=D)=>t=>{M(t,e)},I={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},L=(e={},t=D)=>{let[n,r]=(0,i.useState)(j[t]||A),a=(0,i.useRef)(j[t]);(0,i.useEffect)(()=>(a.current!==j[t]&&r(j[t]),k.push([t,r]),()=>{let e=k.findIndex(([e])=>e===t);e>-1&&k.splice(e,1)}),[t]);let o=n.toasts.map(t=>({...e,...e[t.type],...t,removeDelay:t.removeDelay||e[t.type]?.removeDelay||e?.removeDelay,duration:t.duration||e[t.type]?.duration||e?.duration||I[t.type],style:{...e.style,...e[t.type]?.style,...t.style}}));return{...n,toasts:o}},R=(e,t=`blank`,n)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:`status`,"aria-live":`polite`},message:e,pauseDuration:0,...n,id:n?.id||w()}),z=e=>(t,n)=>{let r=R(t,e,n);return F(r.toasterId||P(r.id))({type:2,toast:r}),r.id},B=(e,t)=>z(`blank`)(e,t);B.error=z(`error`),B.success=z(`success`),B.loading=z(`loading`),B.custom=z(`custom`),B.dismiss=(e,t)=>{let n={type:3,toastId:e};t?F(t)(n):N(n)},B.dismissAll=e=>B.dismiss(void 0,e),B.remove=(e,t)=>{let n={type:4,toastId:e};t?F(t)(n):N(n)},B.removeAll=e=>B.remove(void 0,e),B.promise=(e,t,n)=>{let r=B.loading(t.loading,{...n,...n?.loading});return typeof e==`function`&&(e=e()),e.then(e=>{let i=t.success?C(t.success,e):void 0;return i?B.success(i,{id:r,...n,...n?.success}):B.dismiss(r),e}).catch(e=>{let i=t.error?C(t.error,e):void 0;i?B.error(i,{id:r,...n,...n?.error}):B.dismiss(r)}),e};var ee=1e3,te=(e,t=`default`)=>{let{toasts:n,pausedAt:r}=L(e,t),a=(0,i.useRef)(new Map).current,o=(0,i.useCallback)((e,t=ee)=>{if(a.has(e))return;let n=setTimeout(()=>{a.delete(e),s({type:4,toastId:e})},t);a.set(e,n)},[]);(0,i.useEffect)(()=>{if(r)return;let e=Date.now(),i=n.map(n=>{if(n.duration===1/0)return;let r=(n.duration||0)+n.pauseDuration-(e-n.createdAt);if(r<0){n.visible&&B.dismiss(n.id);return}return setTimeout(()=>B.dismiss(n.id,t),r)});return()=>{i.forEach(e=>e&&clearTimeout(e))}},[n,r,t]);let s=(0,i.useCallback)(F(t),[t]),c=(0,i.useCallback)(()=>{s({type:5,time:Date.now()})},[s]),l=(0,i.useCallback)((e,t)=>{s({type:1,toast:{id:e,height:t}})},[s]),u=(0,i.useCallback)(()=>{r&&s({type:6,time:Date.now()})},[r,s]),d=(0,i.useCallback)((e,t)=>{let{reverseOrder:r=!1,gutter:i=8,defaultPosition:a}=t||{},o=n.filter(t=>(t.position||a)===(e.position||a)&&t.height),s=o.findIndex(t=>t.id===e.id),c=o.filter((e,t)=>t<s&&e.visible).length;return o.filter(e=>e.visible).slice(...r?[c+1]:[0,c]).reduce((e,t)=>e+(t.height||0)+i,0)},[n]);return(0,i.useEffect)(()=>{n.forEach(e=>{if(e.dismissed)o(e.id,e.removeDelay);else{let t=a.get(e.id);t&&(clearTimeout(t),a.delete(e.id))}})},[n,o]),{toasts:n,handlers:{updateHeight:l,startPause:c,endPause:u,calculateOffset:d}}},ne=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,V=y`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,H=y`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,U=x(`div`)`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||`#ff4b4b`};
  position: relative;
  transform: rotate(45deg);

  animation: ${ne} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${V} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||`#fff`};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${H} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,W=y`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,G=x(`div`)`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||`#e0e0e0`};
  border-right-color: ${e=>e.primary||`#616161`};
  animation: ${W} 1s linear infinite;
`,K=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,q=y`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,J=x(`div`)`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||`#61d345`};
  position: relative;
  transform: rotate(45deg);

  animation: ${K} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${q} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||`#fff`};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Y=x(`div`)`
  position: absolute;
`,X=x(`div`)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,re=y`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ie=x(`div`)`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${re} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,ae=({toast:e})=>{let{icon:t,type:n,iconTheme:r}=e;return t===void 0?n===`blank`?null:i.createElement(X,null,i.createElement(G,{...r}),n!==`loading`&&i.createElement(Y,null,n===`error`?i.createElement(U,{...r}):i.createElement(J,{...r}))):typeof t==`string`?i.createElement(ie,null,t):t},oe=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,se=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,ce=`0%{opacity:0;} 100%{opacity:1;}`,le=`0%{opacity:1;} 100%{opacity:0;}`,ue=x(`div`)`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,de=x(`div`)`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,fe=(e,t)=>{let n=e.includes(`top`)?1:-1,[r,i]=T()?[ce,le]:[oe(n),se(n)];return{animation:t?`${y(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${y(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},pe=i.memo(({toast:e,position:t,style:n,children:r})=>{let a=e.height?fe(e.position||t||`top-center`,e.visible):{opacity:0},o=i.createElement(ae,{toast:e}),s=i.createElement(de,{...e.ariaProps},C(e.message,e));return i.createElement(ue,{className:e.className,style:{...a,...n,...e.style}},typeof r==`function`?r({icon:o,message:s}):i.createElement(i.Fragment,null,o,s))});b(i.createElement);var Z=({id:e,className:t,style:n,onHeightUpdate:r,children:a})=>{let o=i.useCallback(t=>{if(t){let n=()=>{let n=t.getBoundingClientRect().height;r(e,n)};n(),new MutationObserver(n).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,r]);return i.createElement(`div`,{ref:o,className:t,style:n},a)},me=(e,t)=>{let n=e.includes(`top`),r=n?{top:0}:{bottom:0},i=e.includes(`center`)?{justifyContent:`center`}:e.includes(`right`)?{justifyContent:`flex-end`}:{};return{left:0,right:0,display:`flex`,position:`absolute`,transition:T()?void 0:`all 230ms cubic-bezier(.21,1.02,.73,1)`,transform:`translateY(${t*(n?1:-1)}px)`,...r,...i}},he=h`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,Q=16,ge=({reverseOrder:e,position:t=`top-center`,toastOptions:n,gutter:r,children:a,toasterId:o,containerStyle:s,containerClassName:c})=>{let{toasts:l,handlers:u}=te(n,o);return i.createElement(`div`,{"data-rht-toaster":o||``,style:{position:`fixed`,zIndex:9999,top:Q,left:Q,right:Q,bottom:Q,pointerEvents:`none`,...s},className:c,onMouseEnter:u.startPause,onMouseLeave:u.endPause},l.map(n=>{let o=n.position||t,s=me(o,u.calculateOffset(n,{reverseOrder:e,gutter:r,defaultPosition:t}));return i.createElement(Z,{id:n.id,key:n.id,onHeightUpdate:u.updateHeight,className:n.visible?he:``,style:s},n.type===`custom`?C(n.message,n):a?a(n):i.createElement(pe,{toast:n,position:o}))}))},_e=B,ve=t((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.fragment`);function r(e,n,r){var i=null;if(r!==void 0&&(i=``+r),n.key!==void 0&&(i=``+n.key),`key`in n)for(var a in r={},n)a!==`key`&&(r[a]=n[a]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:i,ref:n===void 0?null:n,props:r}}e.Fragment=n,e.jsx=r,e.jsxs=r})),ye=t(((e,t)=>{t.exports=ve()})),$={saveUser:e=>{let t=$.getAllUsers(),n={...e,id:`USR-${Date.now()}`};return t.push(n),localStorage.setItem(`users`,JSON.stringify(t)),n},deleteUser:e=>{let t=$.getAllUsers().filter(t=>t.id!==e);localStorage.setItem(`users`,JSON.stringify(t))},getAllUsers:()=>{try{let e=localStorage.getItem(`users`);return e?JSON.parse(e):[]}catch{return[]}},getUserByEmail:e=>$.getAllUsers().find(t=>t.email===e)||null,getCurrentUser:()=>{try{let e=localStorage.getItem(`currentUser`);return e?JSON.parse(e):null}catch{return null}},setCurrentUser:e=>{e?localStorage.setItem(`currentUser`,JSON.stringify(e)):localStorage.removeItem(`currentUser`)},updateCurrentUser:e=>{let t=$.getCurrentUser();if(!t)return;let n={...t,...e};$.setCurrentUser(n);let r=$.getAllUsers().map(e=>e.id===t.id?n:e);return localStorage.setItem(`users`,JSON.stringify(r)),n},setLoginStatus:e=>{localStorage.setItem(`isLoggedIn`,e)},getLoginStatus:()=>localStorage.getItem(`isLoggedIn`)===`true`,clearAll:()=>{localStorage.removeItem(`users`),localStorage.removeItem(`currentUser`),localStorage.removeItem(`isLoggedIn`)},logout:()=>{localStorage.removeItem(`isLoggedIn`),localStorage.removeItem(`currentUser`)},getCustomers:()=>{try{return JSON.parse(localStorage.getItem(`customers`))??null}catch{return null}},saveCustomers:e=>{localStorage.setItem(`customers`,JSON.stringify(e))},deleteCustomer:e=>{let t=JSON.parse(localStorage.getItem(`customers`)).filter(t=>t.id!==e);localStorage.setItem(`customers`,JSON.stringify(t))},getOrders:()=>{try{return JSON.parse(localStorage.getItem(`orders`))??null}catch{return null}},getNextInvoiceNumber:()=>{let e=parseInt(localStorage.getItem(`invoiceCounter`)||`0`)+1;return localStorage.setItem(`invoiceCounter`,e.toString()),`INV-${String(e).padStart(4,`0`)}`},saveOrders:e=>{localStorage.setItem(`orders`,JSON.stringify(e))},clearOrders:()=>{localStorage.removeItem(`orders`)},getBeats:()=>{try{return JSON.parse(localStorage.getItem(`beats`))??null}catch{return null}},saveBeats:e=>{localStorage.setItem(`beats`,JSON.stringify(e))},getNextBeatId:()=>{let e=parseInt(localStorage.getItem(`beatCounter`)||`0`)+1;return localStorage.setItem(`beatCounter`,e.toString()),`BEAT-${String(e).padStart(3,`0`)}`},getVisits:()=>{try{return JSON.parse(localStorage.getItem(`beatVisits`))??null}catch{return null}},saveVisits:e=>{localStorage.setItem(`beatVisits`,JSON.stringify(e))},getProducts:()=>{try{return JSON.parse(localStorage.getItem(`products`))??null}catch{return null}},saveProducts:e=>{localStorage.setItem(`products`,JSON.stringify(e))}};export{r as a,_e as i,ye as n,ge as r,$ as t};