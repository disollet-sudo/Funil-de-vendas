import React, { useEffect, useRef, useState } from "react";
import { Lead, StatusFunil } from "../types";
import { getLeadStatus, formatPhone } from "../utils";
import { MapPin, Info, Users, AlertCircle, RefreshCw } from "lucide-react";

interface ProspectMapProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  currentTime: string;
}

export default function ProspectMap({ leads, onSelectLead, currentTime }: ProspectMapProps) {
  const mapContainerId = "leaflet-prospect-map";
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 1. Setup global window bridge so Leaflet popups can trigger React state
  useEffect(() => {
    (window as any).viewLeadFromMapBridge = (leadId: string) => {
      const selected = leads.find((l) => l.id === leadId);
      if (selected) {
        onSelectLead(selected);
      }
    };

    return () => {
      delete (window as any).viewLeadFromMapBridge;
    };
  }, [leads, onSelectLead]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    const L = (window as any).L;
    if (!L) {
      // If Leaflet didn't load from CDN fast enough, wait and retry
      const timer = setTimeout(() => {
        setMapLoaded((prev) => !prev);
      }, 500);
      return () => clearTimeout(timer);
    }

    // If a map instance is already bound, remove it cleanly to avoid re-init error
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Determine Map bounds based on leads' coordinates, or fallback to South East Brazil
    const validCoords = leads.map(l => [l.latLng.lat, l.latLng.lng]);
    const centerPoint: [number, number] = validCoords.length > 0 
      ? [-20.0, -48.0] // Centered generally in Brazil
      : [-23.5505, -46.6333]; // Sao Paulo

    const map = L.map(mapContainerId, {
      zoomControl: true,
      fadeAnimation: true,
      markerZoomAnimation: true
    }).setView(centerPoint, 5);

    mapRef.current = map;

    // Use a clean, elegant OpenStreetMap CartoDB Positron style (beautiful, high-contrast greyscale map that looks incredibly premium and dashboard-ready!)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19
    }).addTo(map);

    // Render Markers for each Lead
    leads.forEach((lead) => {
      const status = getLeadStatus(lead, currentTime);
      
      // Determine glowing color theme based on stage / urgency status
      let markerColor = "bg-blue-500 ring-blue-100";
      let statusLabel = "Ativo";

      if (status === "red") {
        markerColor = "bg-rose-500 ring-rose-200";
        statusLabel = "Atrasado";
      } else if (status === "yellow") {
        markerColor = "bg-amber-500 ring-amber-200";
        statusLabel = "Contatar Hoje";
      } else if (lead.statusFunil === StatusFunil.CLIENTE_GANHO) {
        markerColor = "bg-emerald-500 ring-emerald-200";
        statusLabel = "Cliente Ganho";
      } else if (lead.statusFunil === StatusFunil.PERDIDO) {
        markerColor = "bg-slate-500 ring-slate-100";
        statusLabel = "Perdido";
      }

      // Beautiful customized pulsing vector marker
      const pulseHtml = `
        <div class="map-marker-pulse rounded-full h-5 w-5 ${markerColor} flex items-center justify-center shadow-lg" style="background-color: currentColor;">
          <div class="h-2 w-2 rounded-full bg-white"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pulseHtml,
        className: `custom-marker-div text-${status === "red" ? "rose" : status === "yellow" ? "amber" : lead.statusFunil === StatusFunil.CLIENTE_GANHO ? "emerald" : lead.statusFunil === StatusFunil.PERDIDO ? "slate" : "blue"}-500`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Prepare rich HTML popup inside the map
      const popupHtml = `
        <div class="p-2 min-w-[200px] text-slate-150 space-y-1.5 font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
            <span class="text-[10px] font-bold uppercase text-slate-400">${lead.statusFunil}</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
              status === "red" ? "bg-rose-950/50 text-rose-300 border border-rose-900/30" :
              status === "yellow" ? "bg-amber-950/50 text-amber-300 border border-amber-900/30" :
              lead.statusFunil === StatusFunil.CLIENTE_GANHO ? "bg-emerald-950/50 text-emerald-300 border border-emerald-900/30" : "bg-slate-800 text-slate-300 border border-slate-750"
            }">${statusLabel}</span>
          </div>
          <div>
            <h4 class="font-bold text-sm text-white leading-tight">${lead.nome}</h4>
            <p class="text-[11px] text-slate-400 leading-normal mt-0.5">${lead.razaoSocial}</p>
          </div>
          <div class="text-[11px] text-slate-300 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin text-slate-500"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${lead.municipio_uf}</span>
          </div>
          <div class="pt-2 border-t border-slate-800 flex justify-end">
            <button 
              onclick="window.viewLeadFromMapBridge('${lead.id}')"
              style="font-family: inherit;"
              class="w-full text-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Abrir Ficha Comercial
            </button>
          </div>
        </div>
      `;

      // Mount marker
      L.marker([lead.latLng.lat, lead.latLng.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml, { closeButton: false, offset: L.point(0, -6) });
    });

    // Auto-adjust fitbounds if multiple leads exist
    if (validCoords.length > 1) {
      try {
        map.fitBounds(validCoords, { padding: [50, 50] });
      } catch (err) {
        console.error("Error fitting bounds:", err);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leads, currentTime, mapLoaded]);

  // Handle manual map recalculate sizes
  const handleRecalculate = () => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
    }
  };

  return (
    <div className="space-y-4">
      {/* Visual map guidance info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 items-start text-xs text-slate-300 max-w-2xl">
          <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Densidade Geográfica de Prospecção:</span> Este mapa renderiza todos os seus prospects com base em suas localizações corporativas reais. A cor indica a urgência do follow-up. Clique em qualquer marcador para ver informações rápidas e iniciar ações.
          </div>
        </div>

        <button 
          onClick={handleRecalculate}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          title="Recalcular dimensões do mapa"
        >
          <RefreshCw size={12} />
          Centralizar Mapa
        </button>
      </div>

      {/* Map Element */}
      <div className="relative bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden min-h-[500px]">
        {/* Render Leaflet Container */}
        <div 
          id={mapContainerId} 
          className="absolute inset-0 z-0 h-full w-full"
        />

        {/* Legend Panel */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-850 shadow-lg text-[10px] space-y-2 max-w-[180px]">
          <h5 className="font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1 border-b border-slate-800 pb-1">
            <Users size={12} className="text-blue-400" />
            Legenda do Funil
          </h5>
          <div className="space-y-1.5 font-medium text-slate-300">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-rose-950/40 inline-block" />
              <span>Atrasado / Urgente</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-950/40 inline-block" />
              <span>Contatar Hoje</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-950/40 inline-block" />
              <span>Cliente Ganho</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-950/40 inline-block" />
              <span>Novo / Em Progresso</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-500 ring-4 ring-slate-950/40 inline-block" />
              <span>Perdido / Descartado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
