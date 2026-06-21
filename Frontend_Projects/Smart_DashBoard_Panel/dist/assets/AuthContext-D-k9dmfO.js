import{r as e,t}from"./chunk-CilyBKbf.js";import{t as n}from"./supabase-DIlZA8rj.js";var r=t((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.portal`),r=Symbol.for(`react.fragment`),i=Symbol.for(`react.strict_mode`),a=Symbol.for(`react.profiler`),o=Symbol.for(`react.consumer`),s=Symbol.for(`react.context`),c=Symbol.for(`react.forward_ref`),l=Symbol.for(`react.suspense`),u=Symbol.for(`react.memo`),d=Symbol.for(`react.lazy`),f=Symbol.for(`react.activity`),p=Symbol.iterator;function m(e){return typeof e!=`object`||!e?null:(e=p&&e[p]||e[`@@iterator`],typeof e==`function`?e:null)}var h={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g=Object.assign,_={};function v(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}v.prototype.isReactComponent={},v.prototype.setState=function(e,t){if(typeof e!=`object`&&typeof e!=`function`&&e!=null)throw Error(`takes an object of state variables to update or a function which returns an object of state variables.`);this.updater.enqueueSetState(this,e,t,`setState`)},v.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,`forceUpdate`)};function y(){}y.prototype=v.prototype;function b(e,t,n){this.props=e,this.context=t,this.refs=_,this.updater=n||h}var x=b.prototype=new y;x.constructor=b,g(x,v.prototype),x.isPureReactComponent=!0;var S=Array.isArray;function C(){}var w={H:null,A:null,T:null,S:null},T=Object.prototype.hasOwnProperty;function E(e,n,r){var i=r.ref;return{$$typeof:t,type:e,key:n,ref:i===void 0?null:i,props:r}}function D(e,t){return E(e.type,t,e.props)}function O(e){return typeof e==`object`&&!!e&&e.$$typeof===t}function k(e){var t={"=":`=0`,":":`=2`};return`$`+e.replace(/[=:]/g,function(e){return t[e]})}var A=/\/+/g;function j(e,t){return typeof e==`object`&&e&&e.key!=null?k(``+e.key):t.toString(36)}function M(e){switch(e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason;default:switch(typeof e.status==`string`?e.then(C,C):(e.status=`pending`,e.then(function(t){e.status===`pending`&&(e.status=`fulfilled`,e.value=t)},function(t){e.status===`pending`&&(e.status=`rejected`,e.reason=t)})),e.status){case`fulfilled`:return e.value;case`rejected`:throw e.reason}}throw e}function N(e,r,i,a,o){var s=typeof e;(s===`undefined`||s===`boolean`)&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case`bigint`:case`string`:case`number`:c=!0;break;case`object`:switch(e.$$typeof){case t:case n:c=!0;break;case d:return c=e._init,N(c(e._payload),r,i,a,o)}}if(c)return o=o(e),c=a===``?`.`+j(e,0):a,S(o)?(i=``,c!=null&&(i=c.replace(A,`$&/`)+`/`),N(o,r,i,``,function(e){return e})):o!=null&&(O(o)&&(o=D(o,i+(o.key==null||e&&e.key===o.key?``:(``+o.key).replace(A,`$&/`)+`/`)+c)),r.push(o)),1;c=0;var l=a===``?`.`:a+`:`;if(S(e))for(var u=0;u<e.length;u++)a=e[u],s=l+j(a,u),c+=N(a,r,i,s,o);else if(u=m(e),typeof u==`function`)for(e=u.call(e),u=0;!(a=e.next()).done;)a=a.value,s=l+j(a,u++),c+=N(a,r,i,s,o);else if(s===`object`){if(typeof e.then==`function`)return N(M(e),r,i,a,o);throw r=String(e),Error(`Objects are not valid as a React child (found: `+(r===`[object Object]`?`object with keys {`+Object.keys(e).join(`, `)+`}`:r)+`). If you meant to render a collection of children, use an array instead.`)}return c}function P(e,t,n){if(e==null)return e;var r=[],i=0;return N(e,r,``,``,function(e){return t.call(n,e,i++)}),r}function F(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var I=typeof reportError==`function`?reportError:function(e){if(typeof window==`object`&&typeof window.ErrorEvent==`function`){var t=new window.ErrorEvent(`error`,{bubbles:!0,cancelable:!0,message:typeof e==`object`&&e&&typeof e.message==`string`?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process==`object`&&typeof process.emit==`function`){process.emit(`uncaughtException`,e);return}console.error(e)},L={map:P,forEach:function(e,t,n){P(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return P(e,function(){t++}),t},toArray:function(e){return P(e,function(e){return e})||[]},only:function(e){if(!O(e))throw Error(`React.Children.only expected to receive a single React element child.`);return e}};e.Activity=f,e.Children=L,e.Component=v,e.Fragment=r,e.Profiler=a,e.PureComponent=b,e.StrictMode=i,e.Suspense=l,e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=w,e.__COMPILER_RUNTIME={__proto__:null,c:function(e){return w.H.useMemoCache(e)}},e.cache=function(e){return function(){return e.apply(null,arguments)}},e.cacheSignal=function(){return null},e.cloneElement=function(e,t,n){if(e==null)throw Error(`The argument must be a React element, but you passed `+e+`.`);var r=g({},e.props),i=e.key;if(t!=null)for(a in t.key!==void 0&&(i=``+t.key),t)!T.call(t,a)||a===`key`||a===`__self`||a===`__source`||a===`ref`&&t.ref===void 0||(r[a]=t[a]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var o=Array(a),s=0;s<a;s++)o[s]=arguments[s+2];r.children=o}return E(e.type,i,r)},e.createContext=function(e){return e={$$typeof:s,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:o,_context:e},e},e.createElement=function(e,t,n){var r,i={},a=null;if(t!=null)for(r in t.key!==void 0&&(a=``+t.key),t)T.call(t,r)&&r!==`key`&&r!==`__self`&&r!==`__source`&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];i.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return E(e,a,i)},e.createRef=function(){return{current:null}},e.forwardRef=function(e){return{$$typeof:c,render:e}},e.isValidElement=O,e.lazy=function(e){return{$$typeof:d,_payload:{_status:-1,_result:e},_init:F}},e.memo=function(e,t){return{$$typeof:u,type:e,compare:t===void 0?null:t}},e.startTransition=function(e){var t=w.T,n={};w.T=n;try{var r=e(),i=w.S;i!==null&&i(n,r),typeof r==`object`&&r&&typeof r.then==`function`&&r.then(C,I)}catch(e){I(e)}finally{t!==null&&n.types!==null&&(t.types=n.types),w.T=t}},e.unstable_useCacheRefresh=function(){return w.H.useCacheRefresh()},e.use=function(e){return w.H.use(e)},e.useActionState=function(e,t,n){return w.H.useActionState(e,t,n)},e.useCallback=function(e,t){return w.H.useCallback(e,t)},e.useContext=function(e){return w.H.useContext(e)},e.useDebugValue=function(){},e.useDeferredValue=function(e,t){return w.H.useDeferredValue(e,t)},e.useEffect=function(e,t){return w.H.useEffect(e,t)},e.useEffectEvent=function(e){return w.H.useEffectEvent(e)},e.useId=function(){return w.H.useId()},e.useImperativeHandle=function(e,t,n){return w.H.useImperativeHandle(e,t,n)},e.useInsertionEffect=function(e,t){return w.H.useInsertionEffect(e,t)},e.useLayoutEffect=function(e,t){return w.H.useLayoutEffect(e,t)},e.useMemo=function(e,t){return w.H.useMemo(e,t)},e.useOptimistic=function(e,t){return w.H.useOptimistic(e,t)},e.useReducer=function(e,t,n){return w.H.useReducer(e,t,n)},e.useRef=function(e){return w.H.useRef(e)},e.useState=function(e){return w.H.useState(e)},e.useSyncExternalStore=function(e,t,n){return w.H.useSyncExternalStore(e,t,n)},e.useTransition=function(){return w.H.useTransition()},e.version=`19.2.6`})),i=t(((e,t)=>{t.exports=r()})),a=e(i(),1),o={data:``},s=e=>{if(typeof window==`object`){let t=(e?e.querySelector(`#_goober`):window._goober)||Object.assign(document.createElement(`style`),{innerHTML:` `,id:`_goober`});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||o},c=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,l=/\/\*[^]*?\*\/|  +/g,u=/\n+/g,d=(e,t)=>{let n=``,r=``,i=``;for(let a in e){let o=e[a];a[0]==`@`?a[1]==`i`?n=a+` `+o+`;`:r+=a[1]==`f`?d(o,a):a+`{`+d(o,a[1]==`k`?``:t)+`}`:typeof o==`object`?r+=d(o,t?t.replace(/([^,])+/g,e=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+` `+t:t)):a):o!=null&&(a=a[1]==`-`?a:a.replace(/[A-Z]/g,`-$&`).toLowerCase(),i+=d.p?d.p(a,o):a+`:`+o+`;`)}return n+(t&&i?t+`{`+i+`}`:i)+r},f={},p=e=>{if(typeof e==`object`){let t=``;for(let n in e)t+=n+p(e[n]);return t}return e},m=(e,t,n,r,i)=>{let a=p(e),o=f[a]||(f[a]=(e=>{let t=0,n=11;for(;t<e.length;)n=101*n+e.charCodeAt(t++)>>>0;return`go`+n})(a));if(!f[o]){let t=a===e?(e=>{let t,n,r=[{}];for(;t=c.exec(e.replace(l,``));)t[4]?r.shift():t[3]?(n=t[3].replace(u,` `).trim(),r.unshift(r[0][n]=r[0][n]||{})):r[0][t[1]]=t[2].replace(u,` `).trim();return r[0]})(e):e;f[o]=d(i?{[`@keyframes `+o]:t}:t,n?``:`.`+o)}let s=n&&f.g;return n&&(f.g=f[o]),((e,t,n,r)=>{r?t.data=t.data.replace(r,e):t.data.indexOf(e)===-1&&(t.data=n?e+t.data:t.data+e)})(f[o],t,r,s),o},h=(e,t,n)=>e.reduce((e,r,i)=>{let a=t[i];if(a&&a.call){let e=a(n),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;a=t?`.`+t:e&&typeof e==`object`?e.props?``:d(e,``):!1===e?``:e}return e+r+(a??``)},``);function g(e){let t=this||{},n=e.call?e(t.p):e;return m(n.unshift?n.raw?h(n,[].slice.call(arguments,1),t.p):n.reduce((e,n)=>Object.assign(e,n&&n.call?n(t.p):n),{}):n,s(t.target),t.g,t.o,t.k)}var _,v,y;g.bind({g:1});var b=g.bind({k:1});function x(e,t,n,r){d.p=t,_=e,v=n,y=r}function S(e,t){let n=this||{};return function(){let r=arguments;function i(a,o){let s=Object.assign({},a),c=s.className||i.className;n.p=Object.assign({theme:v&&v()},s),n.o=/go\d/.test(c),s.className=g.apply(n,r)+(c?` `+c:``),t&&(s.ref=o);let l=e;return e[0]&&(l=s.as||e,delete s.as),y&&l[0]&&y(s),_(l,s)}return t?t(i):i}}var C=e=>typeof e==`function`,w=(e,t)=>C(e)?e(t):e,T=(()=>{let e=0;return()=>(++e).toString()})(),E=(()=>{let e;return()=>{if(e===void 0&&typeof window<`u`){let t=matchMedia(`(prefers-reduced-motion: reduce)`);e=!t||t.matches}return e}})(),D=20,O=`default`,k=(e,t)=>{let{toastLimit:n}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,n)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return k(e,{type:+!!e.toasts.find(e=>e.id===r.id),toast:r});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(e=>e.id===i||i===void 0?{...e,dismissed:!0,visible:!1}:e)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let a=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+a}))}}},A=[],j={toasts:[],pausedAt:void 0,settings:{toastLimit:D}},M={},N=(e,t=O)=>{M[t]=k(M[t]||j,e),A.forEach(([e,n])=>{e===t&&n(M[t])})},P=e=>Object.keys(M).forEach(t=>N(e,t)),F=e=>Object.keys(M).find(t=>M[t].toasts.some(t=>t.id===e)),I=(e=O)=>t=>{N(t,e)},L={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},ee=(e={},t=O)=>{let[n,r]=(0,a.useState)(M[t]||j),i=(0,a.useRef)(M[t]);(0,a.useEffect)(()=>(i.current!==M[t]&&r(M[t]),A.push([t,r]),()=>{let e=A.findIndex(([e])=>e===t);e>-1&&A.splice(e,1)}),[t]);let o=n.toasts.map(t=>({...e,...e[t.type],...t,removeDelay:t.removeDelay||e[t.type]?.removeDelay||e?.removeDelay,duration:t.duration||e[t.type]?.duration||e?.duration||L[t.type],style:{...e.style,...e[t.type]?.style,...t.style}}));return{...n,toasts:o}},te=(e,t=`blank`,n)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:`status`,"aria-live":`polite`},message:e,pauseDuration:0,...n,id:n?.id||T()}),R=e=>(t,n)=>{let r=te(t,e,n);return I(r.toasterId||F(r.id))({type:2,toast:r}),r.id},z=(e,t)=>R(`blank`)(e,t);z.error=R(`error`),z.success=R(`success`),z.loading=R(`loading`),z.custom=R(`custom`),z.dismiss=(e,t)=>{let n={type:3,toastId:e};t?I(t)(n):P(n)},z.dismissAll=e=>z.dismiss(void 0,e),z.remove=(e,t)=>{let n={type:4,toastId:e};t?I(t)(n):P(n)},z.removeAll=e=>z.remove(void 0,e),z.promise=(e,t,n)=>{let r=z.loading(t.loading,{...n,...n?.loading});return typeof e==`function`&&(e=e()),e.then(e=>{let i=t.success?w(t.success,e):void 0;return i?z.success(i,{id:r,...n,...n?.success}):z.dismiss(r),e}).catch(e=>{let i=t.error?w(t.error,e):void 0;i?z.error(i,{id:r,...n,...n?.error}):z.dismiss(r)}),e};var ne=1e3,re=(e,t=`default`)=>{let{toasts:n,pausedAt:r}=ee(e,t),i=(0,a.useRef)(new Map).current,o=(0,a.useCallback)((e,t=ne)=>{if(i.has(e))return;let n=setTimeout(()=>{i.delete(e),s({type:4,toastId:e})},t);i.set(e,n)},[]);(0,a.useEffect)(()=>{if(r)return;let e=Date.now(),i=n.map(n=>{if(n.duration===1/0)return;let r=(n.duration||0)+n.pauseDuration-(e-n.createdAt);if(r<0){n.visible&&z.dismiss(n.id);return}return setTimeout(()=>z.dismiss(n.id,t),r)});return()=>{i.forEach(e=>e&&clearTimeout(e))}},[n,r,t]);let s=(0,a.useCallback)(I(t),[t]),c=(0,a.useCallback)(()=>{s({type:5,time:Date.now()})},[s]),l=(0,a.useCallback)((e,t)=>{s({type:1,toast:{id:e,height:t}})},[s]),u=(0,a.useCallback)(()=>{r&&s({type:6,time:Date.now()})},[r,s]),d=(0,a.useCallback)((e,t)=>{let{reverseOrder:r=!1,gutter:i=8,defaultPosition:a}=t||{},o=n.filter(t=>(t.position||a)===(e.position||a)&&t.height),s=o.findIndex(t=>t.id===e.id),c=o.filter((e,t)=>t<s&&e.visible).length;return o.filter(e=>e.visible).slice(...r?[c+1]:[0,c]).reduce((e,t)=>e+(t.height||0)+i,0)},[n]);return(0,a.useEffect)(()=>{n.forEach(e=>{if(e.dismissed)o(e.id,e.removeDelay);else{let t=i.get(e.id);t&&(clearTimeout(t),i.delete(e.id))}})},[n,o]),{toasts:n,handlers:{updateHeight:l,startPause:c,endPause:u,calculateOffset:d}}},ie=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,ae=b`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,B=b`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,oe=S(`div`)`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||`#ff4b4b`};
  position: relative;
  transform: rotate(45deg);

  animation: ${ie} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${ae} 0.15s ease-out forwards;
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
    animation: ${B} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,se=b`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,V=S(`div`)`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||`#e0e0e0`};
  border-right-color: ${e=>e.primary||`#616161`};
  animation: ${se} 1s linear infinite;
`,H=b`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,U=b`
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
}`,W=S(`div`)`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||`#61d345`};
  position: relative;
  transform: rotate(45deg);

  animation: ${H} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${U} 0.2s ease-out forwards;
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
`,G=S(`div`)`
  position: absolute;
`,ce=S(`div`)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,le=b`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ue=S(`div`)`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${le} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,de=({toast:e})=>{let{icon:t,type:n,iconTheme:r}=e;return t===void 0?n===`blank`?null:a.createElement(ce,null,a.createElement(V,{...r}),n!==`loading`&&a.createElement(G,null,n===`error`?a.createElement(oe,{...r}):a.createElement(W,{...r}))):typeof t==`string`?a.createElement(ue,null,t):t},fe=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,pe=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,me=`0%{opacity:0;} 100%{opacity:1;}`,K=`0%{opacity:1;} 100%{opacity:0;}`,he=S(`div`)`
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
`,ge=S(`div`)`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,_e=(e,t)=>{let n=e.includes(`top`)?1:-1,[r,i]=E()?[me,K]:[fe(n),pe(n)];return{animation:t?`${b(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${b(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},ve=a.memo(({toast:e,position:t,style:n,children:r})=>{let i=e.height?_e(e.position||t||`top-center`,e.visible):{opacity:0},o=a.createElement(de,{toast:e}),s=a.createElement(ge,{...e.ariaProps},w(e.message,e));return a.createElement(he,{className:e.className,style:{...i,...n,...e.style}},typeof r==`function`?r({icon:o,message:s}):a.createElement(a.Fragment,null,o,s))});x(a.createElement);var ye=({id:e,className:t,style:n,onHeightUpdate:r,children:i})=>{let o=a.useCallback(t=>{if(t){let n=()=>{let n=t.getBoundingClientRect().height;r(e,n)};n(),new MutationObserver(n).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,r]);return a.createElement(`div`,{ref:o,className:t,style:n},i)},be=(e,t)=>{let n=e.includes(`top`),r=n?{top:0}:{bottom:0},i=e.includes(`center`)?{justifyContent:`center`}:e.includes(`right`)?{justifyContent:`flex-end`}:{};return{left:0,right:0,display:`flex`,position:`absolute`,transition:E()?void 0:`all 230ms cubic-bezier(.21,1.02,.73,1)`,transform:`translateY(${t*(n?1:-1)}px)`,...r,...i}},xe=g`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,q=16,Se=({reverseOrder:e,position:t=`top-center`,toastOptions:n,gutter:r,children:i,toasterId:o,containerStyle:s,containerClassName:c})=>{let{toasts:l,handlers:u}=re(n,o);return a.createElement(`div`,{"data-rht-toaster":o||``,style:{position:`fixed`,zIndex:9999,top:q,left:q,right:q,bottom:q,pointerEvents:`none`,...s},className:c,onMouseEnter:u.startPause,onMouseLeave:u.endPause},l.map(n=>{let o=n.position||t,s=be(o,u.calculateOffset(n,{reverseOrder:e,gutter:r,defaultPosition:t}));return a.createElement(ye,{id:n.id,key:n.id,onHeightUpdate:u.updateHeight,className:n.visible?xe:``,style:s},n.type===`custom`?w(n.message,n):i?i(n):a.createElement(ve,{toast:n,position:o}))}))},J=z,Ce=t((e=>{var t=Symbol.for(`react.transitional.element`),n=Symbol.for(`react.fragment`);function r(e,n,r){var i=null;if(r!==void 0&&(i=``+r),n.key!==void 0&&(i=``+n.key),`key`in n)for(var a in r={},n)a!==`key`&&(r[a]=n[a]);else r=n;return n=r.ref,{$$typeof:t,type:e,key:i,ref:n===void 0?null:n,props:r}}e.Fragment=n,e.jsx=r,e.jsxs=r})),Y=t(((e,t)=>{t.exports=Ce()})),X={login:async(e,t)=>{try{let r=e.includes(`@`)?e:`${e}@internal.smartdashboard.local`,{data:i,error:a}=await n.auth.signInWithPassword({email:r,password:t});if(a)return J.error(`Invalid email or password.`),{success:!1,error:a};let{data:o,error:s}=await n.from(`profiles`).select(`*`).eq(`id`,i.user.id).maybeSingle();return s||!o?(J.error(`User profile not found.`),await n.auth.signOut(),{success:!1}):o.status===`inactive`||o.status===`deleted`?(J.error(`Account deactivated. Please contact an admin.`),await n.auth.signOut(),{success:!1}):(await n.from(`profiles`).update({updated_at:new Date().toISOString()}).eq(`id`,i.user.id),{success:!0,user:o})}catch(e){return console.error(`Login Error:`,e),J.error(`An unexpected error occurred.`),{success:!1}}},loginWithGoogle:async()=>{try{let{data:e,error:t}=await n.auth.signInWithOAuth({provider:`google`,options:{redirectTo:window.location.origin+`/dashboard`}});t&&J.error(t.message)}catch(e){console.error(`Google Login Error:`,e),J.error(`An unexpected error occurred.`)}},signUp:async e=>{try{let{data:t,error:r}=await n.auth.signUp({email:e.email,password:e.password,options:{data:{full_name:e.name,role:e.role||`SALES`}}});return r?(J.error(r.message),{success:!1,error:r}):{success:!0,user:t.user}}catch(e){return console.error(`SignUp Error:`,e),J.error(`An unexpected error occurred.`),{success:!1}}},logout:async()=>{let{error:e}=await n.auth.signOut();e&&J.error(e.message)},deleteAccount:async e=>{if(e)try{let{error:t}=await n.from(`profiles`).update({status:`deleted`}).eq(`id`,e);if(t)throw t;await n.auth.signOut()}catch(e){console.error(`Delete Account Error:`,e),J.error(`Failed to delete account. Please contact support.`)}},resetDashboardData:async e=>{if(e)try{await n.from(`orders`).delete().eq(`owner_id`,e),await n.from(`beats`).delete().eq(`owner_id`,e),J.success(`Dashboard data has been reset to zero.`)}catch(e){console.error(`Reset Data Error:`,e),J.error(`Failed to reset data.`)}}},Z={saveUser:e=>{let t=Z.getAllUsers(),n=e.password?btoa(e.password):void 0,r={...e,id:`USR-${Date.now()}`,status:e.status||`Active`,lastLogin:null};return n&&(r.password=n),t.push(r),localStorage.setItem(`users`,JSON.stringify(t)),r},deleteUser:e=>{let t=Z.getAllUsers(),n=t.find(t=>t.id===e);if(n&&n.role===`ADMIN`&&t.filter(e=>e.role===`ADMIN`).length<=1)return console.error(`Cannot delete the last remaining ADMIN account.`),!1;let r=t.filter(t=>t.id!==e);return localStorage.setItem(`users`,JSON.stringify(r)),!0},updateUser:(e,t)=>{let n=Z.getAllUsers(),r={...t};r.password&&=btoa(r.password);let i=n.map(t=>t.id===e?{...t,...r}:t);localStorage.setItem(`users`,JSON.stringify(i));let a=Z.getCurrentUser();a&&a.id===e&&Z.setCurrentUser({...a,...r})},getAllUsers:()=>{try{let e=localStorage.getItem(`users`),t=e?JSON.parse(e):[];if(t.length===0){let e={id:`USR-ADMIN`,name:`System Admin`,email:`admin@admin.com`,password:btoa(`admin`),role:`ADMIN`,status:`Active`,lastLogin:null,mustChangePassword:!0};t.push(e),localStorage.setItem(`users`,JSON.stringify(t))}return t}catch{return[]}},getUserByEmail:e=>Z.getAllUsers().find(t=>t.email===e)||null,getCurrentUser:()=>{try{let e=localStorage.getItem(`currentUser`);return e?JSON.parse(e):null}catch{return null}},setCurrentUser:e=>{e?localStorage.setItem(`currentUser`,JSON.stringify(e)):localStorage.removeItem(`currentUser`)},updateCurrentUser:e=>{let t=Z.getCurrentUser();if(!t)return;let n={...t,...e};Z.setCurrentUser(n);let r=Z.getAllUsers().map(e=>e.id===t.id?n:e);return localStorage.setItem(`users`,JSON.stringify(r)),n},setLoginStatus:e=>{localStorage.setItem(`isLoggedIn`,e)},getLoginStatus:()=>localStorage.getItem(`isLoggedIn`)===`true`,clearAll:()=>{localStorage.removeItem(`users`),localStorage.removeItem(`currentUser`),localStorage.removeItem(`isLoggedIn`)},logout:()=>{Z.clearAll()}},Q=Y(),$=(0,a.createContext)(null),we=({children:e})=>{let[t,r]=(0,a.useState)(!1),[i,o]=(0,a.useState)(null),[s,c]=(0,a.useState)([]),[l,u]=(0,a.useState)(!0),[d,f]=(0,a.useState)(()=>localStorage.getItem(`viewAsUserId`)||null),p=e=>{e?localStorage.setItem(`viewAsUserId`,e):localStorage.removeItem(`viewAsUserId`),f(e)},[m,h]=(0,a.useState)(!1),[g,_]=(0,a.useState)(!1),[v,y]=(0,a.useState)(!1),[b,x]=(0,a.useState)(!1),S=async(e=i)=>{if(e)try{let{role:t,org_id:r,id:i}=e;if(!r){console.warn(`fetchAllUsers: No org_id found on activeUser, skipping fetch`),c([e]);return}let{data:a,error:o}=await n.from(`profiles`).select(`*`).eq(`org_id`,r).order(`created_at`,{ascending:!1});if(o)throw o;let s=a||[];console.log(`[DEBUG] Raw fetched profiles for org_id ${r}:`,a),t===`SUPER_STOCKIST`?s=s.filter(e=>e.id===i||e.parent_id===i||e.ancestor_ids&&e.ancestor_ids.includes(i)):t===`DISTRIBUTOR`?s=s.filter(e=>e.id===i||e.parent_id===i):t===`SALES`&&(s=s.filter(e=>e.id===i)),console.log(`[fetchAllUsers] Role=${t}, Fetched: ${s.length} rows`),c(s)}catch(t){console.error(`fetchAllUsers error:`,t),c(e?[e]:[])}},C=async e=>{if(!e||!e.user){r(!1),o(null),c([]),f(null),localStorage.removeItem(`viewAsUserId`),u(!1);return}try{try{let t=e.access_token.split(`.`)[1].replace(/-/g,`+`).replace(/_/g,`/`),n=decodeURIComponent(atob(t).split(``).map(function(e){return`%`+(`00`+e.charCodeAt(0).toString(16)).slice(-2)}).join(``)),r=JSON.parse(n);console.log(`[DEBUG JWT CLAIMS]:`,r),console.log(`  -> TOP-LEVEL org_id:`,r.org_id),console.log(`  -> APP_METADATA org_id:`,r.app_metadata?.org_id),console.log(`  -> TOP-LEVEL app_role:`,r.app_role)}catch{}let{data:t,error:i}=await n.from(`profiles`).select(`*`).eq(`id`,e.user.id).maybeSingle(),a=e.user.user_metadata?.full_name||e.user.user_metadata?.name||e.user.email?.split(`@`)[0]||`User`,s=t;if(e.user.id,e.user.email,{...s},!s){console.log(`No profile found. Auto-creating Admin profile for:`,e.user.email);let t=e.user.app_metadata?.org_id;if(!t){let{data:e,error:r}=await n.from(`organizations`).insert([{name:`${a}'s Organization`}]).select().single();!r&&e&&(t=e.id)}let i={id:e.user.id,username:e.user.email,full_name:a,email:e.user.email,role:`ADMIN`,status:`Active`,org_id:t||`00000000-0000-0000-0000-000000000000`},{data:c,error:l}=await n.from(`profiles`).insert([i]).select().single();if(l){console.error(`Failed to auto-create profile:`,l),J.error(`No profile found for ${e.user.email} and auto-creation failed.`),await n.auth.signOut(),r(!1),o(null),u(!1);return}s=c,J.success(`Welcome, ${a}! Your Admin account has been created.`)}let c=(s.status||``).toLowerCase();if(s.role!==`ADMIN`&&(c===`inactive`||c===`deleted`)){J.error(`Your account has been deactivated. Contact your Admin.`),await n.auth.signOut(),r(!1),o(null),u(!1);return}await n.from(`profiles`).update({updated_at:new Date().toISOString()}).eq(`id`,s.id),o(s),r(!0),await S(s),u(!1)}catch(e){console.error(`handleSession fatal error:`,e),r(!1),o(null),u(!1)}};(0,a.useEffect)(()=>{(async()=>{u(!0);let{data:{session:e}}=await n.auth.getSession();await C(e)})();let{data:{subscription:e}}=n.auth.onAuthStateChange(async(e,t)=>{e!==`INITIAL_SESSION`&&await C(t)});return()=>e?.unsubscribe()},[]);let w=async e=>{u(!0);let t=await X.login(e.username,e.password);return t?.success&&t?.user?.role===`ADMIN`?(J.error(`Admin accounts must sign in with Google.`),await n.auth.signOut(),r(!1),o(null),u(!1),!1):(u(!1),t?.success)},T=async()=>{await X.loginWithGoogle()},E=async e=>{u(!0);let t=await X.signUp(e);return u(!1),t?.success},D=async()=>{localStorage.removeItem(`viewAsUserId`),Z.logout(),await X.logout()},O=()=>{J(e=>(0,Q.jsxs)(`div`,{className:`flex flex-col gap-2`,children:[(0,Q.jsx)(`span`,{className:`font-semibold text-sm`,children:`🚨 CRITICAL WARNING: Are you sure you want to delete your account? You will lose all access.`}),(0,Q.jsxs)(`div`,{className:`flex gap-2 justify-end mt-2`,children:[(0,Q.jsx)(`button`,{onClick:async()=>{J.dismiss(e.id),u(!0),await X.deleteAccount(i?.id),y(!1),u(!1),J.success(`Account deleted.`)},className:`bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors`,children:`Delete Account`}),(0,Q.jsx)(`button`,{onClick:()=>J.dismiss(e.id),className:`bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors`,children:`Cancel`})]})]}),{duration:1/0})},k=()=>{J.error(`Dashboard reset is disabled in production.`)},A=async e=>{if(!i)return;let{data:t,error:r}=await n.from(`profiles`).update(e).eq(`id`,i.id).select().maybeSingle();if(r)throw console.error(`updateCurrentUser error:`,r),r;t&&o(t)},j=()=>h(!m),M=()=>_(!g),N=()=>y(!v),P=()=>x(!b),F=d&&s.length>0&&!s.some(e=>e.id===d)?null:d;return(0,a.useEffect)(()=>{d&&s.length>0&&(s.some(e=>e.id===d)||(f(null),localStorage.removeItem(`viewAsUserId`)))},[d,s]),(0,Q.jsx)($.Provider,{value:{isLoggedIn:t,currentUser:i,users:s,fetchAllUsers:S,isLoading:l,viewAsUserId:F,setViewAsUserId:p,handleLogin:w,handleLoginWithGoogle:T,handleLogout:D,handleSignUp:E,handleResetData:k,handleDeleteAccount:O,updateCurrentUser:A,isSidebarOpen:m,onOpenSidebarHandler:j,isProfileOpen:g,onOpenProfileHandler:M,isSettingsOpen:v,onOpenSettingsHandler:N,isNotificationsOpen:b,onOpenNotificationsHandler:P},children:e})},Te=()=>(0,a.useContext)($);export{Se as a,Y as i,Te as n,J as o,Z as r,i as s,we as t};