# 🌍 EarthquakeGlobe

![EarthquakeGlobe Screenshot](https://raw.githubusercontent.com/novariyaz/earthquake-globe/master/public/favicon.svg) <!-- Replace with a real screenshot URL later -->

**EarthquakeGlobe** is a stunning, high-performance 3D visualization web application that plots real-time seismic events on an interactive globe. Built with React, ThreeJS, and powered by live data from the USGS (United States Geological Survey).

## ✨ Features

- **🔴 Live Real-Time Data**: Automatically fetches and updates seismic activity every 60 seconds from the official USGS earthquake feeds.
- **🌐 Interactive 3D Globe**: Built on top of `globe.gl` and `three.js`. Features smooth auto-rotation, infinite zooming, and precise coordinate plotting.
- **🎛️ Advanced Filtering**:
  - Filter by Time Range (1H, 24H, 7D).
  - Dual-thumb slider for precise Magnitude filtering (M0.0 -> M10.0).
  - Depth filtering (Shallow, Intermediate, Deep).
- **🗺️ Tectonic Plate Boundaries**: Toggle official geographical fault line maps showing divergent, convergent, and transform boundaries, overlaid globally.
- **📊 Live Statistics**: Provides calculated statistics of current filters, calculating the highest magnitude, average magnitude, event counts, and identifying regional "Hot Zones".
- **🎨 Glassmorphism Design**: Designed with pristine UI/UX utilizing beautiful glassmorphic elements, elegant typography, WCAG AA compliant contrasts, and custom micro-animations (styled using Tailwind CSS).
- **🌗 Multiple Globe Layers**: Instantly swap the globe's texture between Blue Marble, Night Lights, Terrain Topology, Dark Mode, and Water/Oceans.

## 🚀 Live Demo

[🌍 Explore the Live Earthquake Globe Application Here](https://earthquake-globe-delta.vercel.app/)

## 🛠️ Technology Stack

- **Frontend Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **3D Rendering**: [Three.js](https://threejs.org/) + [Globe.gl](https://globe.gl/)
- **Styling UI**: [Tailwind CSS v3](https://tailwindcss.com/) + Custom Vanilla CSS Variables
- **Live Data Source**: [USGS GeoJSON Feeds](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)

## 📦 Installation & Local Development

Want to run EarthquakeGlobe locally? It just takes a few seconds:

```bash
# Clone the repository
git clone https://github.com/novariyaz/earthquake-globe.git

# Navigate into the project folder
cd earthquake-globe

# Install dependencies
npm install

# Start the local development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

## 📂 Project Structure

```text
src/
├── components/          # React components
│   ├── Globe.jsx        # 3D ThreeJS/Globe mapping logic
│   ├── Sidebar.jsx      # Filter panel and UI settings
│   ├── StatsBar.jsx     # Live top dashboard counter
│   ├── LayerSwitcher.jsx# Globe texture toggling panel
│   ├── QuakePopup.jsx   # Detailed dialog when a quake is clicked
│   └── Legend.jsx       # Magnitude color scale
├── hooks/               # Custom React hooks
│   ├── useEarthquakes.js# Fetching logic against the USGS API
│   ├── useFilters.js    # Filter states and data processing
│   └── useTectonicPlates.js # Processing local tectonic dataset
├── data/                # Static data sets
│   └── tectonicPlates.js# Coordinates dictating fault lines
├── utils/               # Helpers
│   ├── formatQuake.js   # Calculation conversions
│   └── colorScale.js    # Generating standard seismic severity colors
└── index.css            # Global CSS logic & Glassmorphism classes
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/novariyaz/earthquake-globe/issues).

## 📄 License

This project is open-source and available under the terms of the [MIT License](LICENSE).
