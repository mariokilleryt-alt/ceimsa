// CEIMSA_BUILD: 20260527014952
/* eslint-env browser */

/* =========================================================
   CEIMSA LIQUID GLASS - Wix Custom Element
   Tag para Wix: ceimsa-liquid-glass
========================================================= */

/* =========================
   DISPLACEMENT UTILS
========================= */

function getDisplacementMap({ height, width, radius, depth }) {
  const safeDepth = Math.max(
    2,
    Math.min(depth, Math.floor(width / 4), Math.floor(height / 4))
  );

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
        x="${safeDepth}"
        y="${safeDepth}"
        height="${height - 2 * safeDepth}"
        width="${width - 2 * safeDepth}"
        fill="#808080"
        rx="${radius}"
        ry="${radius}"
        filter="blur(${safeDepth}px)"
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
  strength = 160,
  chromaticAberration = 4
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

/* =========================
   CUSTOM ELEMENT PARA WIX
========================= */

class CeimsaLiquidGlass extends HTMLElement {
  constructor() {
    super();
    this.clicked = false;
    this.resizeObserver = null;
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return [
      "radius",
      "depth",
      "blur",
      "strength",
      "chromatic-aberration",
      "background-color"
    ];
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
    this.setupResizeObserver();

    requestAnimationFrame(() => {
      this.updateStyles();
    });
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  attributeChangedCallback() {
    if (this.shadowRoot) {
      requestAnimationFrame(() => this.updateStyles());
    }
  }

  get radius() {
    const customRadius = parseInt(this.getAttribute("radius"), 10);
    if (!Number.isNaN(customRadius)) return customRadius;

    const rect = this.getBoundingClientRect();
    return Math.round(rect.height / 2) || 40;
  }

  get baseDepth() {
    const customDepth = parseInt(this.getAttribute("depth"), 10);
    if (!Number.isNaN(customDepth)) return customDepth;

    const rect = this.getBoundingClientRect();
    return Math.max(Math.round(rect.height * 0.22), 12);
  }

  get depth() {
    return this.clicked ? Math.round(this.baseDepth * 1.35) : this.baseDepth;
  }

  get blur() {
    return parseFloat(this.getAttribute("blur")) || 0.8;
  }

  get strength() {
    return parseInt(this.getAttribute("strength"), 10) || 180;
  }

  get chromaticAberration() {
    return parseInt(this.getAttribute("chromatic-aberration"), 10) || 5;
  }

  get backgroundColor() {
    return this.getAttribute("background-color") || "rgba(255,255,255,0.075)";
  }

  hasSVGFilterSupport() {
    const test = document.createElement("div");

    test.style.backdropFilter = "blur(1px)";
    test.style.webkitBackdropFilter = "blur(1px)";

    const supportsBackdrop =
      test.style.backdropFilter || test.style.webkitBackdropFilter;

    if (!supportsBackdrop) return false;

    const userAgent = navigator.userAgent.toLowerCase();

    const isChromium =
      /chrome|chromium|crios|edg/.test(userAgent) &&
      !/firefox|fxios/.test(userAgent);

    return isChromium;
  }

  setupResizeObserver() {
    if (!window.ResizeObserver) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.updateStyles();
    });

    this.resizeObserver.observe(this);
  }

  setupEvents() {
    const glass = this.shadowRoot.querySelector(".glass-box");
    if (!glass) return;

    glass.addEventListener("mousedown", () => {
      this.clicked = true;
      this.updateStyles();
    });

    document.addEventListener("mouseup", () => {
      if (this.clicked) {
        this.clicked = false;
        this.updateStyles();
      }
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 54px;
          position: relative;
          overflow: visible;
        }

        .glass-box {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 999px;
          cursor: default;

          background:
            radial-gradient(circle at 18% 18%, rgba(255,255,255,0.50), transparent 20%),
            radial-gradient(circle at 80% 0%, rgba(90,170,255,0.16), transparent 34%),
            linear-gradient(135deg, rgba(255,255,255,0.12), rgba(40,120,255,0.045));

          border: 1px solid rgba(220,240,255,0.55);

          box-shadow:
            inset 0 1px 2px rgba(255,255,255,0.92),
            inset 0 -18px 30px rgba(0,60,160,0.22),
            inset 18px 0 28px rgba(255,255,255,0.10),
            0 0 18px rgba(70,160,255,0.24),
            0 14px 38px rgba(0,0,0,0.30);

          transition:
            transform 0.14s ease,
            box-shadow 0.14s ease,
            background 0.14s ease;
        }

        .glass-box::before {
          content: "";
          position: absolute;
          inset: -65%;
          background:
            linear-gradient(
              115deg,
              transparent 36%,
              rgba(255,255,255,0.55) 47%,
              rgba(120,200,255,0.20) 54%,
              transparent 67%
            );
          filter: blur(13px);
          opacity: 0.80;
          animation: liquidShine 5.8s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .glass-box::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: inherit;
          background:
            linear-gradient(to bottom, rgba(255,255,255,0.38), transparent 40%),
            radial-gradient(circle at 50% 120%, rgba(0,130,255,0.30), transparent 44%);
          mix-blend-mode: screen;
          pointer-events: none;
        }

        .glass-box:active {
          transform: scale(0.985);
        }

        @keyframes liquidShine {
          from {
            transform: translateX(-42%) rotate(8deg) scale(1);
          }

          to {
            transform: translateX(36%) rotate(12deg) scale(1.08);
          }
        }
      </style>

      <div class="glass-box"></div>
    `;
  }

  updateStyles() {
    const glass = this.shadowRoot.querySelector(".glass-box");
    if (!glass) return;

    const rect = this.getBoundingClientRect();

    const width = Math.max(Math.round(rect.width), 80);
    const height = Math.max(Math.round(rect.height), 40);
    const radius = this.radius;

    glass.style.borderRadius = `${radius}px`;

    const layeredBackground = `
      radial-gradient(circle at 18% 18%, rgba(255,255,255,0.50), transparent 20%),
      radial-gradient(circle at 80% 0%, rgba(90,170,255,0.16), transparent 34%),
      linear-gradient(135deg, rgba(255,255,255,0.12), rgba(40,120,255,0.045)),
      ${this.backgroundColor}
    `;

    glass.style.background = layeredBackground;

    if (!this.hasSVGFilterSupport()) {
      glass.style.backdropFilter = `
        blur(${this.blur * 3}px)
        saturate(1.6)
        brightness(1.08)
        contrast(1.05)
      `;

      glass.style.webkitBackdropFilter = `
        blur(${this.blur * 3}px)
        saturate(1.6)
        brightness(1.08)
        contrast(1.05)
      `;

      return;
    }

    const filterUrl = getDisplacementFilter({
      height,
      width,
      radius,
      depth: this.depth,
      strength: this.strength,
      chromaticAberration: this.chromaticAberration
    });

    glass.style.backdropFilter = `
      blur(${this.blur / 2}px)
      url("${filterUrl}")
      blur(${this.blur}px)
      brightness(1.12)
      saturate(1.75)
      contrast(1.08)
    `;

    glass.style.webkitBackdropFilter = `
      blur(${this.blur / 2}px)
      url("${filterUrl}")
      blur(${this.blur}px)
      brightness(1.12)
      saturate(1.75)
      contrast(1.08)
    `;
  }
}

if (!window.customElements.get("ceimsa-liquid-glass")) {
  window.customElements.define("ceimsa-liquid-glass", CeimsaLiquidGlass);
}