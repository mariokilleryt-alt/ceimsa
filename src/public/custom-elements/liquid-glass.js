// CEIMSA_BUILD: 20260527022018
/* eslint-env browser */

/* =========================================================
   DISPLACEMENT UTILS - ORIGINAL
========================================================= */

function getDisplacementMap({ height, width, radius, depth }) {
  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .mix { mix-blend-mode: screen; }
    </style>
    <defs>
      <linearGradient 
        id="Y" 
        x1="0" 
        x2="0" 
        y1="${Math.ceil((radius / height) * 15)}%" 
        y2="${Math.floor(100 - (radius / height) * 15)}%">
        <stop offset="0%" stop-color="#0F0" />
        <stop offset="100%" stop-color="#000" />
      </linearGradient>
      <linearGradient 
        id="X" 
        x1="${Math.ceil((radius / width) * 15)}%" 
        x2="${Math.floor(100 - (radius / width) * 15)}%"
        y1="0" 
        y2="0">
        <stop offset="0%" stop-color="#F00" />
        <stop offset="100%" stop-color="#000" />
      </linearGradient>
    </defs>

    <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
    <g filter="blur(2px)">
      <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" class="mix" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" class="mix" />
      <rect
        x="${depth}"
        y="${depth}"
        height="${height - 2 * depth}"
        width="${width - 2 * depth}"
        fill="#808080"
        rx="${radius}"
        ry="${radius}"
        filter="blur(${depth}px)"
      />
    </g>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function getDisplacementFilter({
  height,
  width,
  radius,
  depth,
  strength = 100,
  chromaticAberration = 0
}) {
  const displacementMapUrl = getDisplacementMap({
    height,
    width,
    radius,
    depth
  });

  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="displace" color-interpolation-filters="sRGB">
        <feImage
          x="0"
          y="0"
          height="${height}"
          width="${width}"
          href="${displacementMapUrl}"
          result="displacementMap"
        />

        <feDisplacementMap
          transform-origin="center"
          in="SourceGraphic"
          in2="displacementMap"
          scale="${strength + chromaticAberration * 2}"
          xChannelSelector="R"
          yChannelSelector="G"
        />

        <feColorMatrix
          type="matrix"
          values="1 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0"
          result="displacedR"
        />

        <feDisplacementMap
          in="SourceGraphic"
          in2="displacementMap"
          scale="${strength + chromaticAberration}"
          xChannelSelector="R"
          yChannelSelector="G"
        />

        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0
                  0 1 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0"
          result="displacedG"
        />

        <feDisplacementMap
          in="SourceGraphic"
          in2="displacementMap"
          scale="${strength}"
          xChannelSelector="R"
          yChannelSelector="G"
        />

        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 1 0 0
                  0 0 0 1 0"
          result="displacedB"
        />

        <feBlend in="displacedR" in2="displacedG" mode="screen" />
        <feBlend in2="displacedB" mode="screen" />
      </filter>
    </defs>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg) + "#displace";
}

window.DisplacementUtils = {
  getDisplacementMap,
  getDisplacementFilter
};

/* =========================================================
   GLASS ELEMENT - ORIGINAL ADAPTADO A WIX
   Tamaño controlado por el contenedor de Wix
========================================================= */

class GlassElement extends HTMLElement {
  constructor() {
    super();
    this.clicked = false;
    this.attachShadow({ mode: "open" });

    if (GlassElement._svgFilterSupport === undefined) {
      GlassElement._svgFilterSupport = this.detectSVGFilterSupport();
    }
  }

  detectSVGFilterSupport() {
    const testElement = document.createElement("div");
    testElement.style.backdropFilter = "blur(1px)";

    if (!testElement.style.backdropFilter) {
      return false;
    }

    const userAgent = navigator.userAgent.toLowerCase();

    const isChrome =
      /chrome|chromium|crios|edg/.test(userAgent) &&
      !/firefox|fxios/.test(userAgent);

    const isFirefox = /firefox|fxios/.test(userAgent);

    const isSafari =
      /safari/.test(userAgent) &&
      !/chrome|chromium|crios|edg/.test(userAgent);

    if (isChrome) return true;
    if (isFirefox || isSafari) return false;

    try {
      testElement.style.backdropFilter = "url(#test)";
      return testElement.style.backdropFilter.includes("url");
    } catch (e) {
      return false;
    }
  }

  get hasSVGFilterSupport() {
    return GlassElement._svgFilterSupport;
  }

  static get observedAttributes() {
    return [
      "radius",
      "depth",
      "blur",
      "strength",
      "chromatic-aberration",
      "debug",
      "background-color",
      "auto-size",
      "min-width",
      "min-height"
    ];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.setupResizeObserver();
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      this.render();
    }
  }

  setupResizeObserver() {
    if (!window.ResizeObserver) return;

    const resizeObserver = new ResizeObserver(() => {
      this.updateStyles();
    });

    resizeObserver.observe(this);
  }

  get width() {
    const rect = this.getBoundingClientRect();
    return Math.max(Math.round(rect.width), 50);
  }

  get height() {
    const rect = this.getBoundingClientRect();
    return Math.max(Math.round(rect.height), 30);
  }

  get radius() {
    const customRadius = parseInt(this.getAttribute("radius"), 10);
    if (!Number.isNaN(customRadius)) return customRadius;

    return Math.round(this.height / 2) || 20;
  }

  get baseDepth() {
    return parseInt(this.getAttribute("depth"), 10) || 5;
  }

  get blur() {
    return parseInt(this.getAttribute("blur"), 10) || 1;
  }

  get strength() {
    return parseInt(this.getAttribute("strength"), 10) || 40;
  }

  get chromaticAberration() {
    return parseInt(this.getAttribute("chromatic-aberration"), 10) || 2;
  }

  get debug() {
    return this.getAttribute("debug") === "true";
  }

  get backgroundColor() {
    return this.getAttribute("background-color") || "rgba(255, 255, 255, 0.4)";
  }

  get autoSize() {
    return this.hasAttribute("auto-size");
  }

  get minWidth() {
    return parseInt(this.getAttribute("min-width"), 10) || 0;
  }

  get minHeight() {
    return parseInt(this.getAttribute("min-height"), 10) || 0;
  }

  get depth() {
    return this.baseDepth / (this.clicked ? 0.7 : 1);
  }

  setupEventListeners() {
    const glassBox = this.shadowRoot.querySelector(".glass-box");
    if (!glassBox) return;

    glassBox.addEventListener("mousedown", () => {
      this.clicked = true;
      this.updateStyles();
    });

    glassBox.addEventListener("mouseup", () => {
      this.clicked = false;
      this.updateStyles();
    });

    glassBox.addEventListener("mouseleave", () => {
      this.clicked = false;
      this.updateStyles();
    });

    document.addEventListener("mouseup", () => {
      if (this.clicked) {
        this.clicked = false;
        this.updateStyles();
      }
    });
  }

  updateStyles() {
    const glassBox = this.shadowRoot.querySelector(".glass-box");
    if (glassBox) {
      this.applyDynamicStyles(glassBox);
    }
  }

  applyDynamicStyles(element) {
    const { getDisplacementFilter, getDisplacementMap } = window.DisplacementUtils;

    const actualWidth = Math.max(Math.round(this.width), 50);
    const actualHeight = Math.max(Math.round(this.height), 30);
    const actualRadius = this.radius;

    element.style.width = "100%";
    element.style.height = "100%";
    element.style.borderRadius = `${actualRadius}px`;

    if (this.debug) {
      element.style.background = `url("${getDisplacementMap({
        height: actualHeight,
        width: actualWidth,
        radius: actualRadius,
        depth: this.depth
      })}")`;
      element.style.boxShadow = "none";
      element.style.backdropFilter = "none";
      element.style.webkitBackdropFilter = "none";
      return;
    }

    if (!this.hasSVGFilterSupport) {
      element.style.backdropFilter = `blur(${this.blur * 2}px)`;
      element.style.webkitBackdropFilter = `blur(${this.blur * 2}px)`;
      element.style.background = this.backgroundColor;
      element.style.boxShadow =
        "1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04)";
      element.style.border = "1px solid rgba(255, 255, 255, 0.3)";
      return;
    }

    element.style.backdropFilter = `blur(${this.blur / 2}px) url('${getDisplacementFilter({
      height: actualHeight,
      width: actualWidth,
      radius: actualRadius,
      depth: this.depth,
      strength: this.strength,
      chromaticAberration: this.chromaticAberration
    })}') blur(${this.blur}px) brightness(1.1) saturate(1.5)`;

    element.style.webkitBackdropFilter = `blur(${this.blur / 2}px) url('${getDisplacementFilter({
      height: actualHeight,
      width: actualWidth,
      radius: actualRadius,
      depth: this.depth,
      strength: this.strength,
      chromaticAberration: this.chromaticAberration
    })}') blur(${this.blur}px) brightness(1.1) saturate(1.5)`;

    element.style.background = this.backgroundColor;
    element.style.boxShadow =
      "1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04)";
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-width: 1px;
          min-height: 1px;
          position: relative;
          overflow: hidden;
        }

        .glass-box {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.4);
          box-shadow:
            1px 1px 1px 0px rgba(255,255,255, 0.60) inset,
            -1px -1px 1px 0px rgba(255,255,255, 0.60) inset,
            0px 0px 16px 0px rgba(0,0,0, 0.04);
          cursor: pointer;
          transition: transform 0.1s ease;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        .glass-box:active {
          transform: scale(0.98);
        }

        .content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
          font-family: sans-serif;
          pointer-events: none;
        }
      </style>

      <div class="glass-box">
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;

    const glassBox = this.shadowRoot.querySelector(".glass-box");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.applyDynamicStyles(glassBox);
      });
    });
  }
}

if (!window.customElements.get("ceimsa-liquid-glass")) {
  window.customElements.define("ceimsa-liquid-glass", GlassElement);
}