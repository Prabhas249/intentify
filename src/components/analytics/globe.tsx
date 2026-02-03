"use client";

import createGlobe, { COBEOptions } from "cobe";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [0.4, 0.4, 0.45],
  markerColor: [0.349, 0.851, 0.804], // sky-400 in RGB
  glowColor: [0.29, 0.24, 0.69], // violet-600 glow
  markers: [],
};

// Major city coordinates for markers
const CITY_COORDS: Record<string, [number, number]> = {
  // India
  "Mumbai": [19.076, 72.8777],
  "Delhi": [28.7041, 77.1025],
  "Bangalore": [12.9716, 77.5946],
  "Bengaluru": [12.9716, 77.5946],
  "Chennai": [13.0827, 80.2707],
  "Kolkata": [22.5726, 88.3639],
  "Hyderabad": [17.385, 78.4867],
  "Pune": [18.5204, 73.8567],
  "Ahmedabad": [23.0225, 72.5714],
  "Jaipur": [26.9124, 75.7873],
  // International
  "New York": [40.7128, -74.006],
  "London": [51.5074, -0.1278],
  "Tokyo": [35.6762, 139.6503],
  "Singapore": [1.3521, 103.8198],
  "Dubai": [25.2048, 55.2708],
  "Sydney": [-33.8688, 151.2093],
  "San Francisco": [37.7749, -122.4194],
  "Los Angeles": [34.0522, -118.2437],
  "Paris": [48.8566, 2.3522],
  "Berlin": [52.52, 13.405],
  "Toronto": [43.6532, -79.3832],
  "São Paulo": [-23.5505, -46.6333],
  "Mexico City": [19.4326, -99.1332],
  "Beijing": [39.9042, 116.4074],
  "Shanghai": [31.2304, 121.4737],
  "Hong Kong": [22.3193, 114.1694],
  "Seoul": [37.5665, 126.978],
  "Bangkok": [13.7563, 100.5018],
  "Jakarta": [-6.2088, 106.8456],
  "Manila": [14.5995, 120.9842],
  "Cairo": [30.0444, 31.2357],
  "Lagos": [6.5244, 3.3792],
  "Nairobi": [-1.2921, 36.8219],
  "Cape Town": [-33.9249, 18.4241],
  "Moscow": [55.7558, 37.6173],
  "Amsterdam": [52.3676, 4.9041],
  "Dublin": [53.3498, -6.2603],
};

// Country center coordinates
const COUNTRY_COORDS: Record<string, [number, number]> = {
  "India": [20.5937, 78.9629],
  "United States": [37.0902, -95.7129],
  "USA": [37.0902, -95.7129],
  "United Kingdom": [55.3781, -3.436],
  "UK": [55.3781, -3.436],
  "Canada": [56.1304, -106.3468],
  "Australia": [-25.2744, 133.7751],
  "Germany": [51.1657, 10.4515],
  "France": [46.2276, 2.2137],
  "Japan": [36.2048, 138.2529],
  "China": [35.8617, 104.1954],
  "Brazil": [-14.235, -51.9253],
  "Singapore": [1.3521, 103.8198],
  "UAE": [23.4241, 53.8478],
  "Netherlands": [52.1326, 5.2913],
  "South Korea": [35.9078, 127.7669],
  "Indonesia": [-0.7893, 113.9213],
  "Mexico": [23.6345, -102.5528],
  "Spain": [40.4637, -3.7492],
  "Italy": [41.8719, 12.5674],
};

interface GlobeProps {
  className?: string;
  cities?: { name: string; count: number }[];
  countries?: { name: string; count: number }[];
}

export function Globe({ className, cities = [], countries = [] }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const rotationRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);

  // Build markers from cities and countries data
  const markers = useCallback(() => {
    const result: { location: [number, number]; size: number }[] = [];
    const maxCount = Math.max(
      ...cities.map((c) => c.count),
      ...countries.map((c) => c.count),
      1
    );

    // Add city markers
    cities.forEach((city) => {
      const coords = CITY_COORDS[city.name];
      if (coords) {
        result.push({
          location: coords,
          size: 0.03 + (city.count / maxCount) * 0.08,
        });
      }
    });

    // Add country markers if no cities
    if (result.length === 0) {
      countries.forEach((country) => {
        const coords = COUNTRY_COORDS[country.name];
        if (coords) {
          result.push({
            location: coords,
            size: 0.04 + (country.count / maxCount) * 0.1,
          });
        }
      });
    }

    // Default markers for visual appeal if no data
    if (result.length === 0) {
      return [
        { location: [20.5937, 78.9629] as [number, number], size: 0.06 }, // India
        { location: [37.0902, -95.7129] as [number, number], size: 0.04 }, // USA
        { location: [51.5074, -0.1278] as [number, number], size: 0.04 }, // London
      ];
    }

    return result;
  }, [cities, countries]);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      rotationRef.current = delta / 200;
    }
  };

  useEffect(() => {
    // Fade in effect
    const timeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let phi = 0;
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      ...GLOBE_CONFIG,
      width: width * 2,
      height: width * 2,
      markers: markers(),
      onRender: (state) => {
        // Auto rotation when not interacting
        if (!pointerInteracting.current) {
          phi += 0.003;
        }
        state.phi = phi + rotationRef.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [markers]);

  return (
    <div
      className={cn(
        "relative aspect-square w-full max-w-[500px] mx-auto transition-opacity duration-1000",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none z-10" />

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500/10 via-violet-500/10 to-sky-500/10 blur-3xl scale-110 animate-pulse" />

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab"
        onPointerDown={(e) => updatePointerInteraction(e.clientX - pointerInteractionMovement.current)}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
    </div>
  );
}
