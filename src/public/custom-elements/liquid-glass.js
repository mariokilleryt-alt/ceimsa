/* eslint-env browser */

function getDisplacementMap({ width, height, radius, depth }) {
  const safeDepth = Math.min(depth, Math.floor(height / 3), Math.floor(width / 3));

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>.mix{mix-blend-mode:screen;}</style>

    <defs>
      <linearGradient id="x" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f00"/>
        <stop offset="50%" stop-color="#808080"/>
        <stop offset="100%" stop-color="#000"/>
      </linearGradient>

      <linearGradient id="y" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f0"/>
        <stop offset="50%" stop-color="#808080"/>
        <stop offset="100%" stop-color="#000"/>
      </linearGradient>
    </defs>

    <rect width="${width}" height="${height}" fill="#808080"/>
    <g filter="blur(${safeDepth}px)">
      <rect width="${width}" height="${height}" fill="url(#x)" class="mix"/>
      <rect width="${width}" height="${height}" fill="url(#y)" class="mix"/>

      <rect
        x="${safeDepth}"
        y="${safeDepth}"
        width="${width - safeDepth * 2}"
        height="${height - safeDepth * 2}"
        rx="${radius}"
        ry="${radius}"
        fill="#808080"
      />
    </g>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function getDisplacementFilter({ width, height, radius, depth, strength }) {
  const map = getDisplacementMap({ width, height, radius, depth });

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="liquid" color-interpolation-filters="sRGB">
        <feImage href="${map}" x="0" y="0" width="${width}" height="${height}" result="map"/>
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale="${strength}"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg) + "#liquid";
}

class CeimsaLiquidGlass extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.resizeObserver = null;
  }

  connectedCallback() {
    this.render();

    this.resizeObserver = new ResizeObserver(() => {
      this.updateLiquid();
    });

    this.resizeObserver.observe(this);

    requestAnimationFrame(() => {
      this.updateLiquid();
    });
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 60px;
          position: relative;
          overflow: visible;
        }

        .glass {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 999px;

          background:
            radial-gradient(circle at 18% 18%, rgba(255,255,255,0.65), transparent 18%),
            radial-gradient(circle at 82% 0%, rgba(80,170,255,0.35), transparent 35%),
            linear-gradient(135deg, rgba(255,255,255,0.18), rgba(40,120,255,0.12));

          border: 1px solid rgba(210,235,255,0.7);

          box-shadow:
            inset 0 2px 4px rgba(255,255,255,0.85),
            inset 0 -22px 35px rgba(0,80,200,0.32),
            inset 20px 0 35px rgba(255,255,255,0.12),
            0 0 28px rgba(70,160,255,0.5),
            0 18px 50px rgba(0,0,0,0.35);
        }

        .glass::before {
          content: "";
          position: absolute;
          inset: -70%;
          background:
            linear-gradient(
              115deg,
              transparent 35%,
              rgba(255,255,255,0.55) 47%,
              rgba(120,200,255,0.28) 54%,
              transparent 68%
            );
          filter: blur(14px);
          opacity: 0.85;
          animation: shine 5s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .glass::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: inherit;
          background:
            linear-gradient(to bottom, rgba(255,255,255,0.45), transparent 38%),
            radial-gradient(circle at 50% 115%, rgba(0,140,255,0.5), transparent 42%);
          mix-blend-mode: screen;
          pointer-events: none;
        }

        @keyframes shine {
          from {
            transform: translateX(-40%) rotate(8deg) scale(1);
          }

          to {
            transform: translateX(35%) rotate(12deg) scale(1.08);
          }
        }
      </style>

      <div class="glass"></div>
    `;
  }

  updateLiquid() {
    const glass = this.shadowRoot.querySelector(".glass");
    if (!glass) return;

    const rect = this.getBoundingClientRect();

    const width = Math.max(Math.round(rect.width), 100);
    const height = Math.max(Math.round(rect.height), 50);

    const radius = Math.round(height / 2);
    const depth = Math.max(Math.round(height * 0.16), 8);
    const strength = Math.max(Math.round(width * 0.045), 35);

    const filter = getDisplacementFilter({
      width,
      height,
      radius,
      depth,
      strength
    });

    glass.style.borderRadius = `${radius}px`;

    glass.style.backdropFilter = `
      blur(2px)
      url("${filter}")
      blur(3px)
      brightness(1.12)
      saturate(1.8)
      contrast(1.08)
    `;

    glass.style.webkitBackdropFilter = `
      blur(2px)
      url("${filter}")
      blur(3px)
      brightness(1.12)
      saturate(1.8)
      contrast(1.08)
    `;
  }
}

if (!window.customElements.get("ceimsa-liquid-glass")) {
  window.customElements.define("ceimsa-liquid-glass", CeimsaLiquidGlass);
}