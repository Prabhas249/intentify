"use client";

import { useEffect, useRef } from "react";

export function AnimatedGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let rotation = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const drawGlobe = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.4;

      ctx.clearRect(0, 0, width, height);

      // Glow effect
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.5,
        centerX,
        centerY,
        radius * 1.5
      );
      gradient.addColorStop(0, "rgba(99, 102, 241, 0.15)");
      gradient.addColorStop(0.5, "rgba(99, 102, 241, 0.05)");
      gradient.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Globe outline
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        const y = centerY + radius * Math.sin(latRad);
        const r = radius * Math.cos(latRad);

        ctx.beginPath();
        ctx.ellipse(centerX, y, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw longitude lines (rotating)
      for (let lon = 0; lon < 180; lon += 30) {
        const lonRad = ((lon + rotation) * Math.PI) / 180;

        ctx.beginPath();
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(lonRad);
        ctx.scale(Math.cos(lonRad * 0.5) * 0.5 + 0.5, 1);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.restore();
        ctx.strokeStyle = "rgba(99, 102, 241, 0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw dots (cities/points)
      const points = [
        { lat: 28.6, lon: 77.2 },   // Delhi
        { lat: 19.07, lon: 72.87 }, // Mumbai
        { lat: 13.08, lon: 80.27 }, // Chennai
        { lat: 22.57, lon: 88.36 }, // Kolkata
        { lat: 12.97, lon: 77.59 }, // Bangalore
        { lat: 23.02, lon: 72.57 }, // Ahmedabad
        { lat: 17.38, lon: 78.48 }, // Hyderabad
        { lat: 26.91, lon: 75.78 }, // Jaipur
      ];

      points.forEach((point) => {
        const latRad = (point.lat * Math.PI) / 180;
        const lonRad = ((point.lon + rotation) * Math.PI) / 180;

        const x = centerX + radius * Math.cos(latRad) * Math.sin(lonRad);
        const y = centerY - radius * Math.sin(latRad);
        const z = Math.cos(latRad) * Math.cos(lonRad);

        if (z > -0.2) {
          const alpha = Math.max(0, z + 0.2);
          const size = 3 + alpha * 3;

          // Glow
          ctx.beginPath();
          ctx.arc(x, y, size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 102, 241, ${alpha * 0.3})`;
          ctx.fill();

          // Point
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.fill();
        }
      });

      // Draw connection arcs
      ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      rotation += 0.2;
      animationId = requestAnimationFrame(drawGlobe);
    };

    drawGlobe();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
