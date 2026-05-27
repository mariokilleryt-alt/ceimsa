// CEIMSA_BUILD: 20260527022818
/* eslint-env browser */

class BaseCeimsaGlass extends HTMLElement {
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
          min-width: 40px;
          min-height: 40px;
          position: relative;
          overflow: visible;
        }

        .glass {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          border-radius: 22px;

          background:
            linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06)),
            linear-gradient(135deg, rgba(80,145,255,0.34), rgba(5,25,70,0.28));

          backdrop-filter: blur(18px) saturate(170%) brightness(1.12);
          -webkit-backdrop-filter: blur(18px) saturate(170%) brightness(1.12);

          border: 1px solid rgba(230,245,255,0.62);

          box-shadow:
            inset 0 1px 2px rgba(255,255,255,0.75),
            inset 0 -14px 28px rgba(0,60,160,0.24),
            0 0 24px rgba(80,160,255,0.32),
            0 16px 40px rgba(0,0,0,0.32);
        }

        .glass::before {
          content: "";
          position: absolute;
          left: 4%;
          top: 5%;
          width: 92%;
          height: 38%;
          border-radius: inherit;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.42),
            rgba(255,255,255,0.10),
            transparent
          );
          filter: blur(2px);
          pointer-events: none;
        }

        .glass::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.10),
            inset 0 -18px 32px rgba(0,20,70,0.18);
        }
      </style>

      <div class="glass"></div>
    `;
  }
}

class CeimsaCleanGlass extends BaseCeimsaGlass {}
class CeimsaLiquidGlass extends BaseCeimsaGlass {}

if (!window.customElements.get("ceimsa-clean-glass")) {
  window.customElements.define("ceimsa-clean-glass", CeimsaCleanGlass);
}

if (!window.customElements.get("ceimsa-liquid-glass")) {
  window.customElements.define("ceimsa-liquid-glass", CeimsaLiquidGlass);
}