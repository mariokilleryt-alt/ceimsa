// CEIMSA_BUILD: 20260527022629
/* eslint-env browser */

class CeimsaGlass extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["radius", "background-color", "border-color"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get radius() {
    return this.getAttribute("radius") || "22";
  }

  get backgroundColor() {
    return this.getAttribute("background-color") || "rgba(65, 110, 190, 0.22)";
  }

  get borderColor() {
    return this.getAttribute("border-color") || "rgba(255,255,255,0.28)";
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }

        .glass {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          border-radius: ${this.radius}px;

          background:
            linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03)),
            linear-gradient(135deg, rgba(90,140,255,0.20), rgba(20,40,90,0.16)),
            ${this.backgroundColor};

          backdrop-filter: blur(18px) saturate(145%) brightness(1.08);
          -webkit-backdrop-filter: blur(18px) saturate(145%) brightness(1.08);

          border: 1px solid ${this.borderColor};

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.30),
            inset 0 -1px 0 rgba(255,255,255,0.08),
            0 10px 30px rgba(0,0,0,0.18),
            0 0 18px rgba(90,140,255,0.12);
        }

        .glass::before {
          content: "";
          position: absolute;
          left: 2%;
          top: 4%;
          width: 96%;
          height: 42%;
          border-radius: inherit;
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.24),
            rgba(255,255,255,0.07),
            transparent
          );
          pointer-events: none;
          filter: blur(2px);
        }

        .glass::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.08),
            inset 0 -12px 30px rgba(0,20,60,0.10);
        }

        .content {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
        }
      </style>

      <div class="glass">
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

if (!window.customElements.get("ceimsa-clean-glass")) {
  window.customElements.define("ceimsa-clean-glass", CeimsaGlass);
}