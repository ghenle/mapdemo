const UD = 'undefined';
const F = window.frameElement;

if ( typeof F!==UD && F!==null ) {
  const S = document.querySelector('svg');
  const R = document.querySelector('g.reset > rect');
  const I = document.querySelector('g.in > rect');
  const O = document.querySelector('g.out > rect');
  const P = document.querySelector('g.position');

  const sElm = P.querySelector('rect.slide');
  const cMin = parseInt(P.getAttribute('data-min'), 10);
  const cMax = parseInt(P.getAttribute('data-max'), 10);
  
  const setSlide = (p) => {
    if( p < 0 || p > 1 ) {
      return false;
    }

    let y = cMin + (cMax - cMin) * p;
    
    sElm.setAttribute('y', y);
  }
  
  R.addEventListener('click', (a)=>{
    let e = new CustomEvent('controlReset', {
      bubbles: true,
      detail: {
        iframe: () => F
      }
    });
    F.dispatchEvent(e);

    setSlide(1);
  });
  I.addEventListener('click', (a)=>{
    let e = new CustomEvent('controlIn', {
      bubbles: true,
      detail: {
        iframe: () => F
      }
    });
    F.dispatchEvent(e);    
  });
  O.addEventListener('click', (a)=>{
    let e = new CustomEvent('controlOut', {
      bubbles: true,
      detail: {
        iframe: () => F
      }
    });
    F.dispatchEvent(e);    
  });
  
  F.addEventListener('load', (a) => {
    let e = new CustomEvent('controlLoad', {
      bubbles: true,
      detail: {
        iframe: () => F,
        slide:  () => sElm,
        cMin:   () => cMin,
        cMax:   () => cMax
      }
    });
    F.dispatchEvent(e);    
  });
  F.addEventListener('setSlide', (a) => {
    //console.log(`setSlide: ${a.detail}`)
    setSlide(a.detail);
  });
}