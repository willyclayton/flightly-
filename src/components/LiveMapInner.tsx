"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { LivePosition } from "@/lib/types";
import { interpolateGreatCircle } from "@/lib/geo";
import "leaflet/dist/leaflet.css";

function planeIcon(heading = 0) {
  return L.divIcon({
    className: "",
    html: `<div style="transform:rotate(${heading}deg);font-size:22px;color:#fff;filter:drop-shadow(0 0 10px rgba(10,132,255,.7));">✈</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitBounds({
  points,
}: {
  points: Array<[number, number]>;
}) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(points, { padding: [36, 36] });
  }, [map, points]);
  return null;
}

export default function LiveMapInner({
  origin,
  dest,
  position,
  traffic,
}: {
  origin: { lat: number; lon: number; label: string };
  dest: { lat: number; lon: number; label: string };
  position: LivePosition | null;
  traffic: LivePosition[];
}) {
  const route = useMemo(() => {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= 32; i++) {
      const p = interpolateGreatCircle(
        origin.lat,
        origin.lon,
        dest.lat,
        dest.lon,
        i / 32,
      );
      pts.push([p.lat, p.lon]);
    }
    return pts;
  }, [origin, dest]);

  const boundsPts: Array<[number, number]> = [
    [origin.lat, origin.lon],
    [dest.lat, dest.lon],
    ...(position ? ([[position.lat, position.lon]] as Array<[number, number]>) : []),
  ];

  return (
    <MapContainer
      center={[origin.lat, origin.lon]}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        attribution='Tiles &copy; Esri'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
      />
      <FitBounds points={boundsPts} />
      <Polyline positions={route} pathOptions={{ color: "#0A84FF", weight: 2.5, opacity: 0.9 }} />
      <CircleMarker
        center={[origin.lat, origin.lon]}
        radius={5}
        pathOptions={{ color: "#ffffff", fillColor: "#0A84FF", fillOpacity: 1 }}
      >
        <Popup>{origin.label}</Popup>
      </CircleMarker>
      <CircleMarker
        center={[dest.lat, dest.lon]}
        radius={5}
        pathOptions={{ color: "#ffffff", fillColor: "#8E8E96", fillOpacity: 1 }}
      >
        <Popup>{dest.label}</Popup>
      </CircleMarker>
      {traffic.map((t, i) => (
        <CircleMarker
          key={`${t.lat}-${t.lon}-${i}`}
          center={[t.lat, t.lon]}
          radius={2}
          pathOptions={{ color: "#5c7390", fillOpacity: 0.6 }}
        />
      ))}
      {position && (
        <Marker
          position={[position.lat, position.lon]}
          icon={planeIcon(position.heading ?? 0)}
        >
          <Popup>
            {position.source}
            {position.altitudeFt != null ? ` · ${position.altitudeFt} ft` : ""}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
