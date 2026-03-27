import { useEffect, useRef, useMemo } from 'react';
import GlobeGL from 'globe.gl';
import * as THREE from 'three';
import { getMagnitudeColor, getMagnitudeRadius, shouldPulse } from '../utils/colorScale';
import { GLOBE_LAYERS } from './LayerSwitcher';

export default function Globe({ quakes, onQuakeClick, activeLayer, plateBoundaries, showPlates, autoRotate = true }) {
  const containerRef = useRef(null);
  const globeRef = useRef(null);

  // Get the layer config
  const layerConfig = useMemo(() => {
    return GLOBE_LAYERS.find((l) => l.id === activeLayer) || GLOBE_LAYERS[0];
  }, [activeLayer]);

  // Transform quakes to globe point data
  const pointsData = useMemo(() => {
    return quakes.map((q) => ({
      lat: q.lat,
      lng: q.lng,
      size: getMagnitudeRadius(q.magnitude),
      color: getMagnitudeColor(q.magnitude),
      altitude: 0.01,
      id: q.id,
      label: `<div style="
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        padding: 10px 14px;
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        color: #f1f5f9;
        max-width: 220px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        line-height: 1.5;
      ">
        <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px; color: ${getMagnitudeColor(q.magnitude)};">
          M${q.magnitude.toFixed(1)}
        </div>
        <div style="color: #94a3b8;">${q.place}</div>
        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${q.timeAgo}</div>
      </div>`,
      quake: q,
      pulse: shouldPulse(q.magnitude),
    }));
  }, [quakes]);

  // Rings data for M6+ earthquakes
  const ringsData = useMemo(() => {
    return quakes
      .filter((q) => shouldPulse(q.magnitude))
      .map((q) => ({
        lat: q.lat,
        lng: q.lng,
        maxR: q.magnitude * 1.2,
        propagationSpeed: 2,
        repeatPeriod: 800,
        color: () => getMagnitudeColor(q.magnitude),
      }));
  }, [quakes]);

  // Plate boundary paths data
  const pathsData = useMemo(() => {
    if (!showPlates || !plateBoundaries?.paths) return [];
    return plateBoundaries.paths.map((path) => ({
      coords: path.coords,
      color: [path.color + '88', path.color + '44'], // [start, end] opacity
      stroke: 0.6,
      dashLength: 0.4,
      dashGap: 0.2,
      dashAnimateTime: 8000,
      label: `<div style="
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(12px);
        border: 1px solid ${path.color}44;
        border-radius: 8px;
        padding: 8px 12px;
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        color: ${path.color};
        max-width: 200px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      ">
        ${path.name || 'Plate Boundary'}
      </div>`,
    }));
  }, [showPlates, plateBoundaries]);

  // Initialize globe
  useEffect(() => {
    if (!containerRef.current) return;

    const globe = GlobeGL()
      .globeImageUrl(layerConfig.imageUrl)
      .bumpImageUrl(layerConfig.bumpUrl)
      .backgroundImageUrl(layerConfig.bgUrl)
      .showAtmosphere(true)
      .atmosphereColor(layerConfig.atmosphereColor)
      .atmosphereAltitude(0.18)
      // Points layer
      .pointsData([])
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude('altitude')
      .pointRadius('size')
      .pointColor('color')
      .pointLabel('label')
      .pointsMerge(false)
      .onPointClick((point) => {
        if (point?.quake && onQuakeClick) {
          onQuakeClick(point.quake);
        }
      })
      // Rings layer for M6+
      .ringsData([])
      .ringLat('lat')
      .ringLng('lng')
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod')
      .ringColor('color')
      // Paths layer for plate boundaries
      .pathsData([])
      .pathPoints('coords')
      .pathPointLat('lat')
      .pathPointLng('lng')
      .pathColor('color')
      .pathStroke('stroke')
      .pathDashLength('dashLength')
      .pathDashGap('dashGap')
      .pathDashAnimateTime('dashAnimateTime')
      .pathLabel('label')
      .pathTransitionDuration(800)
      (containerRef.current);

    // Camera settings
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.4;
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.1;

    // Custom lighting
    const scene = globe.scene();
    scene.children.forEach((child) => {
      if (child instanceof THREE.DirectionalLight) {
        child.intensity = 0.8;
      }
      if (child instanceof THREE.AmbientLight) {
        child.intensity = 0.8;
      }
    });

    // Add subtle ambient light
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.15);
    scene.add(ambientLight);

    globeRef.current = globe;

    // Handle resize
    const handleResize = () => {
      if (globeRef.current && containerRef.current) {
        globeRef.current.width(containerRef.current.clientWidth);
        globeRef.current.height(containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (globeRef.current) {
        globeRef.current._destructor?.();
      }
    };
  }, []);

  // Update globe texture when layer changes
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current
        .globeImageUrl(layerConfig.imageUrl)
        .bumpImageUrl(layerConfig.bumpUrl)
        .atmosphereColor(layerConfig.atmosphereColor);
    }
  }, [layerConfig]);

  // Update earthquake data when quakes change
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointsData(pointsData);
      globeRef.current.ringsData(ringsData);
    }
  }, [pointsData, ringsData]);

  // Update plate boundaries
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pathsData(pathsData);
    }
  }, [pathsData]);

  // Sync auto-rotation with prop
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = autoRotate;
    }
  }, [autoRotate]);

  return (
    <div
      ref={containerRef}
      className="globe-container"
      id="earthquake-globe"
    />
  );
}
