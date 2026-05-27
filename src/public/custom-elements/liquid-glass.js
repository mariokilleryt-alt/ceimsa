/* eslint-env browser */

class CeimsaLiquidGlass extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 70px;
        }

        .glass {
          width: 100%;
          height: 100%;
          min-height: 70px;
          border-radius: 999px;
          background: rgba(80, 160, 255, 0.35);
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow:
            inset 0 2px 4px rgba(255,255,255,0.8),
            inset 0 -18px 30px rgba(0,80,200,0.45),
            0 0 30px rgba(80,160,255,0.7);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
        }
      </style>

      <div class="glass"></div>
    `;
  }
}

if (!window.customElements.get("ceimsa-liquid-glass")) {
  window.customElements.define("ceimsa-liquid-glass", CeimsaLiquidGlass);
}