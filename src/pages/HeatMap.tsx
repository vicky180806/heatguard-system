import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { motion } from "framer-motion";
import { zones, getRiskColor } from "@/data/mockData";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Navigation } from "lucide-react";

const layers = ["Temperature", "Humidity", "AQI", "Vulnerability"] as const;

export default function HeatMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(["Temperature", "Vulnerability"]));
  const [manualMode, setManualMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      next.has(layer) ? next.delete(layer) : next.add(layer);
      return next;
    });
  };

  const fetchHeatmapData = async (map: L.Map) => {
    try {
      const response = await fetch("http://localhost:5000/api/heatmap/heatmap-data");
      if (response.ok) {
        const data = await response.json();
        data.forEach((point: any) => {
          const color = getRiskColor("High"); // Simple logic for now, or based on temp
          L.circleMarker([point.latitude, point.longitude], {
            radius: 10,
            color: color,
            fillColor: color,
            fillOpacity: 0.6,
            weight: 1
          }).addTo(map).bindPopup(`Temp: ${point.temperature || 'N/A'}`);
        });
      }
    } catch (err) {
      console.error("Failed to fetch heatmap data", err);
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [22.5, 78.5],
      zoom: 5,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    // Load mock data (legacy)
    zones.forEach((zone) => {
      const color = getRiskColor(zone.riskLevel);
      L.circleMarker([zone.lat, zone.lng], {
        radius: Math.max(12, zone.vulnerabilityScore / 3),
        color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 2,
      }).addTo(map).bindPopup(`<b>${zone.name}</b><br>Risk: ${zone.riskLevel}`);
    });

    // Fetch real data
    fetchHeatmapData(map);

    map.on('click', (e) => {
      if (manualMode) {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []); // Run once on mount

  // Effect to handle manual mode toggling and click listener updates
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.off('click'); // Remove old listener
    map.on('click', (e) => {
      if (manualMode) {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      }
    });
  }, [manualMode]);


  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else if (mapInstance.current) {
      markerRef.current = L.marker([lat, lng]).addTo(mapInstance.current);
    }
    toast.info(`Selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const handleAutoLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleMapClick(latitude, longitude);
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 12);
        }
        toast.success("Location detected!");
      },
      () => {
        toast.error("Unable to retrieve your location");
      }
    );
  };

  const submitLocation = async () => {
    if (!selectedLocation) {
      toast.error("Please select a location first");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to report data");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/heatmap/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          temperature: 35 + Math.random() * 10 // Simulating temp reading
        })
      });

      if (response.ok) {
        toast.success("Location report submitted!");
        setSelectedLocation(null);
        if (markerRef.current && mapInstance.current) {
          mapInstance.current.removeLayer(markerRef.current);
          markerRef.current = null;
        }
        // Refresh data
        if (mapInstance.current) fetchHeatmapData(mapInstance.current);
      } else {
        toast.error("Failed to submit report");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error submitting report");
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      {/* Report Controls */}
      <div className="absolute top-4 left-4 z-[1000]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-4 w-64 space-y-4"
        >
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Report Heat</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="mode-toggle">Manual Mode</Label>
            <Switch
              id="mode-toggle"
              checked={manualMode}
              onCheckedChange={setManualMode}
            />
          </div>

          {!manualMode ? (
            <Button onClick={handleAutoLocation} className="w-full gap-2" variant="secondary">
              <Navigation className="w-4 h-4" /> Detect Location
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground">
              Click on the map to select a location.
            </div>
          )}

          {selectedLocation && (
            <div className="text-xs bg-background/50 p-2 rounded">
              Lat: {selectedLocation.lat.toFixed(4)}<br />
              Lng: {selectedLocation.lng.toFixed(4)}
            </div>
          )}

          <Button onClick={submitLocation} className="w-full gap-2" disabled={!selectedLocation}>
            <MapPin className="w-4 h-4" /> Submit Report
          </Button>
        </motion.div>
      </div>

      {/* Layer controls */}
      <div className="absolute top-4 right-4 z-[1000]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-3 space-y-2"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Layers</p>
          {layers.map((layer) => (
            <button
              key={layer}
              onClick={() => toggleLayer(layer)}
              className={`block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeLayers.has(layer)
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {layer}
            </button>
          ))}
        </motion.div>
      </div>

      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
