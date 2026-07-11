const o=e=>{if(typeof e!="number"||isNaN(e))return 0;const t=e%1;let r;return t<.45?r=0:t<.9?r=.5:r=1,Math.floor(e)+r},a=e=>o(e).toFixed(2);export{a,o as r};
