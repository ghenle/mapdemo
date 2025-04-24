const UD = 'undefined';
const F = window.frameElement;

if ( typeof F!==UD && F!==null ) {
  const styleAttrs = ['data-svg-css', 'data-svg-target'];
  const cMap       = new WeakMap();
  const mMap       = new WeakMap();
  const tMap       = new WeakMap();
  const animClass  = 'animate';
  const minStroke  = 0.05;
  const maxStroke  = 1;
  const minZoom    = 1;
  const maxZoom    = 50;

  const M = {
    SA: (s,c) => (c ?? document).querySelectorAll(s),
    AS: (e, o) => {
      for(let i in o) {
        e.setAttribute(i, o[i]);
      }
    },
    TE: (a, e, l) => {
      let t = M.SA(e);
      let s = (typeof a !== 'number' && a == 1)
        ? false
        : a;

      t.forEach((b) => {
        if (s !== false) {
          let x = b.getAttribute('x');
          let y = b.getAttribute('y');
          b.setAttribute('transform-origin', `${x} ${y}`);
          b.setAttribute('transform', `scale(${s})`);
        } else {
          b.removeAttribute('transform-origin');
          b.removeAttribute('transform');
        }
      });

      if (s !== false) {
        console.log(`${l}: scale ${s}`);
      } else {
        console.log('zoomTo scale: cleared');
      }
    },
    SE: (a, e) => {
      switch(typeof a) {
        case 'object':
          a.forEach((o) => {
            M.SA(`${e}[class*="${o.geoid}"]`).forEach(x=> x.setAttribute('style', o.style));
          });
        break;
        default:
          let t = M.SA(e);

          console.log(`style element ${e} style ${a}`);

          t.forEach((b) => {
            b.setAttribute('style', a);
          });
      }
    },
    UF: (e) => {
      FB = {
        w: F.scrollWidth,
        h: F.scrollHeight
      };

      console.log(`update frame ${e.type}`);
    },
    U: (ov) => {
      try {
        let c = F.getAttribute('data-svg-css');
        let t = F.getAttribute('data-svg-target');

        if ( reset!==null && t!==null && t!=='' ) {
          let j = JSON.parse(t);

          M.SA('path[class*=main]').forEach(x=> x.setAttribute('style', reset));
          M.SA(`path[class*="${j.geoid}"]`).forEach(x=> x.setAttribute('style', j.style));
        } else if( c!==null && ov != c ) {
          M.SA('path[class*=main]').forEach((x)=> {x.removeAttribute('style')});
          M.SA('link').forEach(x=> x.setAttribute('href', ''));

          if ( c.match(/^http/ig) !== null ) {
            M.SA('link').forEach(x=> x.setAttribute('href', c));
          } else {
            M.SA('path[class*=main]').forEach(x=> x.setAttribute('style', c));
          }
        }
      } catch (error) {
        console.log('ERROR: ' + error.message)
      }
    },
    O: new MutationObserver((ml, ob) => {
      ml.forEach((m) => {
        switch(m.type){
          case 'childList':
          break;
          case 'attributes':
            if ( styleAttrs.includes(m.attributeName) ) {
              M.U(m.oldValue);
            }
          break;
          case 'characterData':
          break;
        }
      });
    })
  }

  const S  = document.querySelector('svg');
  const P  = M.SA('path');
  const G  = M.SA('g');
  const XY = S.getAttribute('viewBox').split(' ').slice(-2).map(parseFloat);

  let FB = {
    w: F.scrollWidth,
    h: F.scrollHeight
  };

  let reset  = null;

  screen.orientation.addEventListener('change', M.UF);

  window.addEventListener('mousedown', (e) => {
    let wE = new CustomEvent('svgMouseDown', {
      bubbles: true,
      detail: {
        event: () => e
      }
    });

    F.dispatchEvent(wE);
  });
  window.addEventListener('mousemove', (e) => {
    let wE = new CustomEvent('svgMouseMove', {
      bubbles: true,
      detail: {
        event: () => e
      }
    });

    F.dispatchEvent(wE);
  });
  window.addEventListener('mouseup', (e) => {
    let wE = new CustomEvent('svgMouseUp', {
      bubbles: true,
      detail: {
        event: () => e
      }
    });

    F.dispatchEvent(wE);
  });
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    let wE = new CustomEvent('svgWheel', {
      bubbles: true,
      detail: {
        event: () => e
      }
    });

    F.dispatchEvent(wE);
  }, {passive: false});

  F.addEventListener('resize', M.UF);

  F.addEventListener('animate', (e) => {
    S.classList.toggle(animClass, e.detail);
  });

  F.addEventListener('load', (a) => {
    reset = F.getAttribute('data-svg-css');

    let l = [];
    let m = [];
    let tf = {
      d: Math.min(FB.w / XY[0], FB.h / XY[1]),
      s: 1,
      i: 1,
      x: 0,
      y: 0
    }

    G.forEach((b) => {
      let g = b.getAttribute('data-geoid');
      let s = b.querySelectorAll('*|Seq');

      m[g] = [];

      l.push({
        geoid: g,
        name:  b.querySelector('text').textContent
      });

      s.forEach((c) => {
        let p = c.querySelectorAll('*|li');
        let q = c.getAttribute('*|label');

        m[g][q] = [];

        p.forEach((d) => {
          let k = d.getAttribute('*|Property');
          let v = d.getAttribute('*|value');

          m[g][q][k] = v;
        });
      });
    });

    l.sort((c, d) => c.name.localeCompare(d.name, 'en', { numeric: true }));

    cMap.set(F, l);
    mMap.set(F, m);
    tMap.set(F, tf);

    let e = new CustomEvent('svgGeoCatalog', {
      bubbles: true,
      detail: {
        iframe: () => F,
        svg:    () => S,
        list:   () => l,
        meta:   () => m,
        sMin:   () => minStroke,
        sMax:   () => maxStroke,
        zMin:   () => minZoom,
        zMax:   () => maxZoom,
        cMap:   () => cMap,
        mMap:   () => mMap,
        tMap:   () => tMap
      }
    });

    console.log('dispatch svgGeoCatalog');
    F.dispatchEvent(e);
  });

  F.addEventListener('setFontSize', (a) => {
    let t = M.SA('text');
    let s = (typeof a.detail === 'number')
      ? a.detail + 'px'
      : a.detail;

    t.forEach((b) => {
      b.style.fontSize = s;
    });

    console.log(`receive setFontSize ${s} ${t.length}`);
  });

  F.addEventListener('scaleText', (a) => {
    M.TE(a.detail, 'text', 'scaleText');
    console.log(`receive scaleText`);
  });

  F.addEventListener('styleText', (a) => {
    M.SE(a.detail, 'text');
    console.log(`receive styleText`);
  });

  F.addEventListener('stylePaths', (a) => {
    M.SE(a.detail, 'path');
    console.log('receive stylePaths');
  });

  F.addEventListener('orientationchange', (a) => {
    M.SE(a.detail, 'path');
    console.log('receive stylePaths');
  });

  F.addEventListener('zoomTo', (a) => {
    console.log('receive zoomTo');

    let geoid  = a.detail.geoid();
    let zoomed = a.detail.zoomed();

    let tf = tMap.get(F);

    if (zoomed) {
      let g = S.querySelector(`g[data-geoid="${geoid}"]`);
      let tB  = {};
      let tC  = {};

      g.getAttribute('data-BND').split(' ').map(function(e, i){
        tB[this[i]] = parseFloat(e);
      }, ['X','x','Y','y']);

      g.getAttribute('data-COM').split(' ').map(function(e, i){
        tC[this[i]] = parseFloat(e);
      }, ['x','y','d']);

      tf.s = Math.min( XY[0] / (tB.X - tB.x), XY[1] / (tB.Y - tB.y) );
      if (tf.s > maxZoom) {
        tf.s = maxZoom;
      }
      //tf.i = 1/(tf.s - tf.d);
      /**
       * 0.2  1/zMax
       * x  1/tMap.s
       * 1  1/1
       **/
      tf.i = minStroke + (1 - minStroke)/(1-1/maxZoom) * (1/tf.s - 1/maxZoom);

      let w = XY[0] / 2;
      let h = XY[1] / 2;

      tf.x = (w - tC.x) * tf.d;
      tf.y = (h - tC.y) * tf.d;

      S.setAttribute('transform', `scale(${tf.s}) translate(${tf.x}, ${tf.y})`);
      M.TE(tf.i, 'text', 'zoomTo');
    } else {
      tf.s = 1;
      tf.i = 1;
      tf.x = 0;
      tf.y = 0;

      S.setAttribute('transform', '');
      M.TE(tf.i, 'text', 'zoomTo');
    }

    tMap.set(F, tf);

    let eZ = new CustomEvent('zoomDone', {
      bubbles: true,
      detail: {
        iframe: () => F,
        tMap:   () => tMap
      }
    });

    console.log(`dispatch zoomDone ${tf.s}`);
    F.dispatchEvent(eZ);
  });

  F.addEventListener('zoomXY', (a) => {
    console.log('receive zoomXY');

    let tf     = tMap.get(F);
    let zoomIn = a.detail.zoomIn();
    let wheelD = a.detail.wheelDelta();
    let tfso   = tf.s;

    if ( typeof zoomIn === 'boolean' ) {
      tf.s = zoomIn ? tf.s - 1 : tf.s + 1;
    }

    if ( typeof wheelD === 'number' ) {
      tf.s += wheelD;
    }

    if (tf.s > maxZoom) {
      tf.s = maxZoom;
    }
    if (tf.s < minZoom) {
      tf.s = minZoom;
    }

    if (tfso === minZoom && tf.s === minZoom ) {
      tf.x = tf.y = 0;
    }

    /**
     * minStroke  1/maxZoom
     * tf.i =     1/tf.s
     * maxStroke  1/minZoom
     **/
    tf.i = minStroke + (maxStroke - minStroke)/(1/minZoom-1/maxZoom) * (1/tf.s - 1/maxZoom);

    S.setAttribute('transform', `scale(${tf.s}) translate(${tf.x}, ${tf.y})`);
    M.TE(tf.i, 'text', 'zoomXY');

    tMap.set(F, tf);

    let eZ = new CustomEvent('zoomDone', {
      bubbles: true,
      detail: {
        iframe: () => F,
        tMap:   () => tMap
      }
    });

    console.log(`dispatch zoomDone ${tf.s}`);
    F.dispatchEvent(eZ);
  });

  P.forEach((a) => {
    a.addEventListener('click', (b) => {
      let g = b.target.getAttribute('data-geoid');
      let e = new CustomEvent('svgPathClick', {
        bubbles: true,
        detail: {
          iframe: () => F,
          svg:    () => S,
          geoid:  () => g
        }
      });

      console.log('dispatch svgPathClick ' + g);
      F.dispatchEvent(e);
    });
  });

  G.forEach((a) => {
    a.addEventListener('mouseenter', (b) => {
      S.appendChild(b.target);
      let g = b.target.getAttribute('data-geoid');
      let e = new CustomEvent('svgMouseEnter', {
        bubbles: true,
        detail: {
          iframe: () => F,
          svg:    () => S,
          geoid:  () => g
        }
      });

      b.target.querySelector('text').setAttribute('display', 'auto');
      F.dispatchEvent(e);
    });

    a.addEventListener('mouseleave', (b) => {
      let g = b.target.getAttribute('data-geoid');
      let e = new CustomEvent('svgMouseLeave', {
        bubbles: true,
        detail: {
          iframe: () => F,
          svg:    () => S,
          geoid:  () => g
        }
      });

      b.target.querySelector('text').setAttribute('display', 'none');
      F.dispatchEvent(e);
    });
    
    a.addEventListener('contextmenu', (b) => {
      let g = b.target.getAttribute('data-geoid');
      let e = new CustomEvent('svgContextmenu', {
        bubbles: true,
        detail: {
          iframe: () => F,
          svg:    () => S,
          geoid:  () => g,
          event:  () => b
        }
      });

      F.dispatchEvent(e);
    });

    a.addEventListener('dblclick', (b) => {
      let g = b.target.getAttribute('data-geoid');
      let e = new CustomEvent('svgblclick', {
        bubbles: true,
        detail: {
          iframe: () => F,
          svg:    () => S,
          geoid:  () => g,
          event:  () => b
        }
      });

      F.dispatchEvent(e);
    });
  });

  M.O.observe(
    F,
    {attributes:true, attributeOldValue:true}
  );

  M.U('');
}