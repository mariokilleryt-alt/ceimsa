// CEIMSA_BUILD: 20260527020212
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
      <rect
        x="0"
        y="0"
        height="${height}"
        width="${width}"
        fill="url(#Y)"
        class="mix"
      />
      <rect
        x="0"
        y="0"
        height="${height}"
        width="${width}"
        fill="url(#X)"
        class="mix"
      />
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

    if (isChrome) {
      return true;
    }

    if (isFirefox || isSafari) {
      return false;
    }

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
      "width",
      "height",
      "radius",
      "depth",
      "blur",
      "strength",
      "chromatic-aberration",
      "debug",
      "background-color",
      "responsive",
      "base-width",
      "base-height",
      "auto-size",
      "min-width",
      "min-height"
    ];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.setupResponsive();

    if (this.autoSize) {
      this.setupAutoSizeObserver();
    }
  }

  setupAutoSizeObserver() {
    const observer = new MutationObserver(() => {
      setTimeout(() => this.updateStyles(), 0);
    });

    observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true
    });

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        this.updateStyles();
      });

      resizeObserver.observe(this.shadowRoot.querySelector(".glass-box"));
    }
  }

  setupResponsive() {
    if (this.hasAttribute("responsive")) {
      this.updateResponsiveSize();
      window.addEventListener("resize", () => this.updateResponsiveSize());
    }
  }

  updateResponsiveSize() {
    const baseWidth =
      parseInt(this.getAttribute("base-width") || this.getAttribute("width")) ||
      200;

    const baseHeight =
      parseInt(this.getAttribute("base-height") || this.getAttribute("height")) ||
      200;

    const viewport = window.innerWidth;
    let scale = 1;

    if (viewport < 480) {
      scale = 0.6;
    } else if (viewport < 768) {
      scale = 0.8;
    } else if (viewport < 1024) {
      scale = 0.9;
    }

    const newWidth = Math.round(baseWidth * scale);
    const newHeight = Math.round(baseHeight * scale);

    if (newWidth !== this.width || newHeight !== this.height) {
      this.setAttribute("width", newWidth);
      this.setAttribute("height", newHeight);
    }
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      this.render();
    }
  }

  get width() {
    const attrWidth = parseInt(this.getAttribute("width"));
    if (!Number.isNaN(attrWidth)) return attrWidth;

    const rect = this.getBoundingClientRect();
    return Math.round(rect.width) || 200;
  }

  get height() {
    const attrHeight = parseInt(this.getAttribute("height"));
    if (!Number.isNaN(attrHeight)) return attrHeight;

    const rect = this.getBoundingClientRect();
    return Math.round(rect.height) || 200;
  }

  get radius() {
    return parseInt(this.getAttribute("radius")) || Math.round(this.height / 2) || 50;
  }

  get baseDepth() {
    return parseInt(this.getAttribute("depth")) || 5;
  }

  get blur() {
    return parseInt(this.getAttribute("blur")) || 1;
  }

  get strength() {
    return parseInt(this.getAttribute("strength")) || 40;
  }

  get chromaticAberration() {
    return parseInt(this.getAttribute("chromatic-aberration")) || 2;
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
    return parseInt(this.getAttribute("min-width")) || 0;
  }

  get minHeight() {
    return parseInt(this.getAttribute("min-height")) || 0;
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
    const { getDisplacementFilter, getDisplacementMap } =
      window.DisplacementUtils;

    element.style.borderRadius = `${this.radius}px`;

    if (this.autoSize) {
      element.style.backdropFilter = "none";
      element.style.background = "rgba(255, 255, 255, 0.4)";

      element.offsetWidth;
      element.offsetHeight;

      const rect = element.getBoundingClientRect();

      let actualWidth = Math.ceil(rect.width);
      let actualHeight = Math.ceil(rect.height);

      if (actualWidth === 0 || actualHeight === 0) {
        requestAnimationFrame(() => this.updateStyles());
        return;
      }

      actualWidth = Math.max(actualWidth, this.minWidth);
      actualHeight = Math.max(actualHeight, this.minHeight);

      actualWidth = Math.max(actualWidth, 50);
      actualHeight = Math.max(actualHeight, 30);

      if (this.debug) {
        element.style.background = `url("${getDisplacementMap({
          height: actualHeight,
          width: actualWidth,
          radius: this.radius,
          depth: this.depth
        })}")`;
        element.style.boxShadow = "none";
        element.style.backdropFilter = "none";
      } else if (!this.hasSVGFilterSupport) {
        element.style.backdropFilter = `blur(${this.blur * 2}px)`;
        element.style.background = this.backgroundColor;
        element.style.boxShadow =
          "1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04)";
        element.style.border = "1px solid rgba(255, 255, 255, 0.3)";
      } else {
        element.style.backdropFilter = `blur(${this.blur / 2}px) url('${getDisplacementFilter({
          height: actualHeight,
          width: actualWidth,
          radius: this.radius,
          depth: this.depth,
          strength: this.strength,
          chromaticAberration: this.chromaticAberration
        })}') blur(${this.blur}px) brightness(1.1) saturate(1.5)`;

        element.style.background = this.backgroundColor;
        element.style.boxShadow =
          "1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04)";
      }
    } else {
      element.style.height = `${this.height}px`;
      element.style.width = `${this.width}px`;

      if (this.debug) {
        element.style.background = `url("${getDisplacementMap({
          height: this.height,
          width: this.width,
          radius: this.radius,
          depth: this.depth
        })}")`;
        element.style.boxShadow = "none";
        element.style.backdropFilter = "none";
      } else if (!this.hasSVGFilterSupport) {
        element.style.backdropFilter = `blur(${this.blur * 2}px)`;
        element.style.background = this.backgroundColor;
        element.style.boxShadow =
          "1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04)";
        element.style.border = "1px solid rgba(255, 255, 255, 0.3)";
      } else {
        element.style.backdropFilter = `blur(${this.blur / 2}px) url('${getDisplacementFilter({
          height: this.height,
          width: this.width,
          radius: this.radius,
          depth: this.depth,
          strength: this.strength,
          chromaticAberration: this.chromaticAberration
        })}') blur(${this.blur}px) brightness(1.1) saturate(1.5)`;

        element.style.background = this.backgroundColor;
        element.style.boxShadow =
          "1px 1px 1px 0px rgba(255,255,255, 0.60) inset, -1px -1px 1px 0px rgba(255,255,255, 0.60) inset, 0px 0px 16px 0px rgba(0,0,0, 0.04)";
      }
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${this.autoSize ? "inline-block" : "block"};
          width: 100%;
          height: 100%;
          min-height: 30px;
          position: relative;
          overflow: visible;
        }

        .glass-box {
          background: rgba(255, 255, 255, 0.4);
          box-shadow:
            1px 1px 1px 0px rgba(255,255,255, 0.60) inset,
            -1px -1px 1px 0px rgba(255,255,255, 0.60) inset,
            0px 0px 16px 0px rgba(0,0,0, 0.04);
          cursor: pointer;
          transition: transform 0.1s ease;
          position: relative;
          overflow: hidden;
          ${this.autoSize ? `display: inline-block; width: fit-content; min-width: ${this.minWidth}px; min-height: ${this.minHeight}px;` : ""}
        }

        .glass-box:active {
          transform: scale(0.98);
        }

        .content {
          ${this.autoSize ? "" : "width: 100%; height: 100%;"}
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
          font-family: sans-serif;
          ${this.autoSize ? "padding: var(--glass-padding, 16px 24px);" : ""}
        }
      </style>

      <div class="glass-box">
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;

    const glassBox = this.shadowRoot.querySelector(".glass-box");

    if (this.autoSize) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.applyDynamicStyles(glassBox);
        });
      });
    } else {
      this.applyDynamicStyles(glassBox);
    }
  }
}

if (!window.customElements.get("ceimsa-liquid-glass")) {
  window.customElements.define("ceimsa-liquid-glass", GlassElement);
}