// CEIMSA_BUILD: 20260527015140
/* eslint-env browser */

class CeimsaLiquidGlass extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
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

        .glass {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          overflow: hidden;

          background:
            radial-gradient(circle at 18% 18%, rgba(255,255,255,0.42), transparent 22%),
            radial-gradient(circle at 82% 0%, rgba(80,160,255,0.18), transparent 36%),
            linear-gradient(135deg, rgba(255,255,255,0.16), rgba(40,110,220,0.08));

          backdrop-filter:
            blur(18px)
            saturate(180%)
            brightness(1.12)
            contrast(1.08);

          -webkit-backdrop-filter:
            blur(18px)
            saturate(180%)
            brightness(1.12)
            contrast(1.08);

          border: 1px solid rgba(220,240,255,0.58);

          box-shadow:
            inset 0 1px 2px rgba(255,255,255,0.95),
            inset 0 -18px 32px rgba(0,70,180,0.26),
            inset 18px 0 30px rgba(255,255,255,0.12),
            0 0 20px rgba(80,160,255,0.30),
            0 16px 42px rgba(0,0,0,0.34);
        }

        .glass::before {
          content: "";
          position: absolute;
          inset: -65%;
          background:
            linear-gradient(
              115deg,
              transparent 34%,
              rgba(255,255,255,0.58) 46%,
              rgba(130,200,255,0.22) 54%,
              transparent 68%
            );
          filter: blur(14px);
          opacity: 0.75;
          animation: liquidMove 6s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .glass::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: inherit;

          background:
            linear-gradient(to bottom, rgba(255,255,255,0.42), transparent 38%),
            radial-gradient(circle at 50% 120%, rgba(0,130,255,0.32), transparent 45%);

          mix-blend-mode: screen;
          pointer-events: none;
        }

        @keyframes liquidMove {
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
}

if (!window.customElements.get("ceimsa-liquid-glass")) {
  window.customElements.define("ceimsa-liquid-glass", CeimsaLiquidGlass);
}