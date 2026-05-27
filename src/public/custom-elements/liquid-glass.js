// CEIMSA_BUILD: 20260527023127
/* eslint-env browser */

class CeimsaGlassCardV2 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["radius", "blur", "opacity"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get radius() {
    return this.getAttribute("radius") || "24";
  }

  get blur() {
    return this.getAttribute("blur") || "18";
  }

  get opacity() {
    return this.getAttribute("opacity") || "0.26";
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
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          overflow: hidden;

          border-radius: ${this.radius}px;

          background:
            linear-gradient(
              180deg,
              rgba(255,255,255,0.22) 0%,
              rgba(255,255,255,0.08) 38%,
              rgba(70,125,210,${this.opacity}) 100%
            );

          backdrop-filter:
            blur(${this.blur}px)
            saturate(170%)
            brightness(1.12)
            contrast(1.08);

          -webkit-backdrop-filter:
            blur(${this.blur}px)
            saturate(170%)
            brightness(1.12)
            contrast(1.08);

          border: 1px solid rgba(225, 240, 255, 0.55);

          box-shadow:
            inset 0 1px 2px rgba(255,255,255,0.75),
            inset 0 -18px 30px rgba(0,55,150,0.24),
            0 0 24px rgba(80,150,255,0.24),
            0 16px 42px rgba(0,0,0,0.34);
        }

        .glass::before {
          content: "";
          position: absolute;
          top: 5%;
          left: 6%;
          width: 88%;
          height: 38%;
          border-radius: inherit;

          background:
            linear-gradient(
              180deg,
              rgba(255,255,255,0.46),
              rgba(255,255,255,0.14),
              transparent
            );

          filter: blur(2px);
          opacity: 0.78;
          pointer-events: none;
        }

        .glass::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;

          background:
            radial-gradient(
              circle at 20% 10%,
              rgba(255,255,255,0.30),
              transparent 28%
            ),
            radial-gradient(
              circle at 85% 100%,
              rgba(40,130,255,0.28),
              transparent 38%
            );

          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.10),
            inset 0 -14px 26px rgba(0,25,80,0.20);
        }
      </style>

      <div class="glass"></div>
    `;
  }
}

if (!window.customElements.get("ceimsa-glass-card-v2")) {
  window.customElements.define("ceimsa-glass-card-v2", CeimsaGlassCardV2);
}