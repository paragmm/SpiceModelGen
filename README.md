# SPICE Model Generator

> **Datasheet → SPICE Model** with Auto Gummel‑Poon Engine

A complete browser-based tool to generate SPICE Gummel-Poon BJT models from transistor datasheet parameters. No server required — runs entirely in the browser.

---

## Features

- **Auto Gummel-Poon Calculation** — Enter datasheet values, auto-calculate all 26+ SPICE parameters
- **Built-in Presets** — BC847B, BC857B, 2N3904, 2N3906, BC547B, TIP41C
- **Model Library** — Save/load models to browser localStorage
- **JSON Import/Export** — Share your library as JSON files
- **Download .lib** — Export single models or the entire library as `.lib` files
- **Custom Parameters** — Add any extra SPICE parameters (XCJC, CJS, FC, etc.)
- **Dark Theme** — Premium dark UI with micro-animations
- **Responsive Design** — Works on desktop, tablet, and mobile

---

## Project Structure

```
SpiceModelGen/
├── index.html              # Main application entry point
├── README.md               # This file
│
├── css/                    # Stylesheets (modular)
│   ├── variables.css       # Design tokens & CSS custom properties
│   ├── base.css            # Reset, layout, header, footer
│   ├── components.css      # Cards, buttons, badges, toasts
│   ├── forms.css           # Inputs, selects, parameter rows
│   ├── output.css          # Output area styling
│   ├── library.css         # Library modal & card grid
│   ├── modal.css           # Modal overlay & dialog
│   ├── responsive.css      # Breakpoints for mobile/tablet
│   └── animations.css      # Keyframes & micro-animations
│
├── js/                     # JavaScript modules
│   ├── presets.js          # Built-in transistor preset data
│   ├── engine.js           # SPICE model generation engine
│   ├── library.js          # Library manager (localStorage + JSON)
│   ├── ui.js               # UI utilities (toast, collapse, particles)
│   └── app.js              # Main controller (event bindings)
│
├── library/                # JSON-based model library
│   └── sample_library.json # Pre-built sample models (importable)
│
└── .agent/                 # Reference files
    └── SpiceModel.html     # Original single-file prototype
```

---

## Getting Started (New Local Backend)

Because the application now saves library files directly to your local file system, you must start the local Node.js server to use it.

### 1. Install Dependencies
Ensure you have [Node.js](https://nodejs.org/) installed. Open your terminal in the project directory and run:
```bash
npm install
```
*(This installs `express` and `cors` required for the local server).*

### 2. Start the Server
Run the following command to start the backend API:
```bash
node server.js
```

### 3. Open the App
Once the server is running, open your web browser and navigate to:
**http://localhost:3000**

*(Note: Do not open `index.html` directly from your file system anymore, as the local server handles routing and file saving).*

---

## Library Management

- **Save**: Click "Save to Library" to persist the current model
- **Load**: Select from the "My Library" dropdown or open the Library modal
- **Import JSON**: Import a `.json` library file (e.g., `library/sample_library.json`)
- **Export JSON**: Export your entire library as a shareable `.json` file
- **Download .lib**: Export as SPICE-compatible `.lib` format

---

## Technology Stack

- **HTML5** — Semantic markup
- **CSS3** — Modular vanilla CSS with custom properties
- **JavaScript** — Modular vanilla JS (IIFE pattern)
- **jQuery 3.7** — DOM manipulation & event handling (CDN)
- **Font Awesome 6** — Icon library (CDN)
- **Google Fonts** — Inter + JetBrains Mono (CDN)

---

## License

MIT — Built for engineers & hobbyists.
