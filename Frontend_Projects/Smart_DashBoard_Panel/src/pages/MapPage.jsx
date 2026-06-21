import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMapEvents, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import useCustomerContext from '../context/CustomerContext';
import { useBeatContext } from '../context/BeatContext';
import { useNavigate } from 'react-router-dom';
import CreateBeatModal from '../components/Beats/CreateBeatModal';
import { useAuth } from '../context/AuthContext';
import { MapPin, Route, Crosshair, X, Search, Navigation } from 'lucide-react';
import { useSupplyChainContext } from '../context/SupplyChainContext';

// Fix for default marker icons in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Premium custom CSS DivIcons for Super Stockist and Distributor
const superStockistDivIcon = L.divIcon({
  className: 'custom-ss-marker',
  html: `<div class="w-8 h-8 rounded-full bg-purple-600 border-2 border-white flex items-center justify-center shadow-lg text-white font-extrabold text-[10px] transform hover:scale-110 transition-transform">SS</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const distributorDivIcon = L.divIcon({
  className: 'custom-db-marker',
  html: `<div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-lg text-white font-extrabold text-[10px] transform hover:scale-110 transition-transform">DB</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Haversine formula to calculate distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Component to handle map clicks
const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => onMapClick(e.latlng)
  });
  return null;
};
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 13);
    }
  }, [lat, lng, map]);
  return null;
};

// Component to handle proximity radius fitting
const AutoFitCircle = ({ center, radius }) => {
  const map = useMap();
  useEffect(() => {
    if (center && radius) {
      // radius is in km. Create a bounds from the center and radius.
      const latDiff = radius / 111; // 1 deg lat is approx 111km
      const lngDiff = radius / (111 * Math.cos(center[0] * Math.PI / 180));
      const bounds = [
        [center[0] - latDiff, center[1] - lngDiff],
        [center[0] + latDiff, center[1] + lngDiff]
      ];
      map.flyToBounds(bounds, { animate: true, duration: 1 });
    }
  }, [center, radius, map]);
  return <Circle center={center} radius={radius * 1000} pathOptions={{ fillColor: '#4f46e5', color: '#4338ca', weight: 2, fillOpacity: 0.1 }} />;
};

const DEFAULT_MAP_CENTER = [20.5937, 78.9629];
const DEFAULT_MAP_ZOOM = 5;

const MapPage = () => {
  const { customers, updateCustomer, isLoading: customersLoading } = useCustomerContext();
  const { addBeat, isLoading: beatsLoading } = useBeatContext();
  const { currentUser } = useAuth();
  const { superStockists, distributors, isLoading: supplyLoading } = useSupplyChainContext();
  const navigate = useNavigate();

  const [isPlanningMode, setIsPlanningMode] = useState(false);
  const isPlanningModeRef = useRef(isPlanningMode);
  useEffect(() => { isPlanningModeRef.current = isPlanningMode; }, [isPlanningMode]);

  const [routeSequence, setRouteSequence] = useState([]);

  // Proximity Search State
  const [isProximityMode, setIsProximityMode] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10);
  const [searchCenter, setSearchCenter] = useState(null);

  // Tag Location State
  const [isTaggingMode, setIsTaggingMode] = useState(false);
  const [customerToTag, setCustomerToTag] = useState(null);

  // Modals & Search
  const [isCreateBeatModalOpen, setIsCreateBeatModalOpen] = useState(false);
  const [routeSearchQuery, setRouteSearchQuery] = useState("");

  // Mobile Sheet State
  const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState(false);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchEnd = (e) => {
    if (!touchStartY.current) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    if (diff > 50) {
      setIsMobileSheetExpanded(true); // Swipe up
    } else if (diff < -50) {
      setIsMobileSheetExpanded(false); // Swipe down
    }
    touchStartY.current = null;
  };

  const handleMapClick = (latlng) => {
    if (isProximityMode) {
      setSearchCenter([latlng.lat, latlng.lng]);
    } else if (isTaggingMode && customerToTag) {
      updateCustomer({ ...customerToTag, lat: latlng.lat, lng: latlng.lng });
      setCustomerToTag(null); // Deselect after tagging
    }
  };

  const nearbyCustomers = React.useMemo(() => {
    if (!searchCenter) return [];
    return customers.filter(c => {
      if (!c.lat || !c.lng) return false;
      const dist = calculateDistance(searchCenter[0], searchCenter[1], c.lat, c.lng);
      return dist <= searchRadius;
    }).map(c => ({
      ...c,
      distance: calculateDistance(searchCenter[0], searchCenter[1], c.lat, c.lng)
    })).sort((a, b) => a.distance - b.distance);
  }, [searchCenter, searchRadius, customers]);

  const handleMarkerClick = (customerId) => {
    if (isPlanningModeRef.current) {
      setRouteSequence(prev => {
        if (!prev.includes(customerId)) {
          return [...prev, customerId];
        }
        return prev;
      });
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('dragIndex', index);
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = Number(e.dataTransfer.getData('dragIndex'));
    if (dragIndex === dropIndex || isNaN(dragIndex)) return;
    const newSeq = [...routeSequence];
    const [dragged] = newSeq.splice(dragIndex, 1);
    newSeq.splice(dropIndex, 0, dragged);
    setRouteSequence(newSeq);
  };

  const handleRemoveFromRoute = (customerId) => {
    setRouteSequence(routeSequence.filter(id => id !== customerId));
  };

  const handleSaveBeat = () => {
    setIsCreateBeatModalOpen(true);
  };

  const availableForRoute = customers.filter(c => 
    !routeSequence.includes(c.id) && 
    ((c.name || '').toLowerCase().includes((routeSearchQuery || '').toLowerCase()) || (c.phone || '').includes(routeSearchQuery))
  );

  const polylinePositions = routeSequence
    .map(id => customers.find(c => c.id === id))
    .filter(c => c && c.lat && c.lng)
    .map(c => [c.lat, c.lng]);

  const isLoading = customersLoading || beatsLoading || supplyLoading;

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0f1117] transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-zinc-50 dark:bg-[#0f1117] relative z-0 animate-in fade-in duration-300 overflow-hidden">
      <div className="flex-1 flex flex-col relative z-0">
        {/* Top Bar for Map Actions */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1d27] flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-6 shadow-sm z-10 relative gap-3 md:gap-0 shrink-0">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-500" /> Customer Map
        </h1>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
          {/* Feature 5 and 8 buttons go here */}
          <button 
            onClick={() => {
              const newMode = !isProximityMode;
              setIsProximityMode(newMode);
              setIsMobileSheetExpanded(false);
              if (newMode) {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => setSearchCenter([position.coords.latitude, position.coords.longitude]),
                    (err) => console.log("Geolocation error:", err)
                  );
                }
              } else {
                setSearchCenter(null);
              }
              setIsPlanningMode(false);
              setIsTaggingMode(false);
            }}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
              isProximityMode 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            {isProximityMode ? 'Cancel Nearby' : 'Find Nearby'}
          </button>
          {currentUser?.role !== 'ADMIN' && (
            <>
              <button 
                onClick={() => {
                  setIsPlanningMode(!isPlanningMode);
                  if (!isPlanningMode) setRouteSequence([]);
                  setIsMobileSheetExpanded(false);
                  setIsProximityMode(false);
                  setIsTaggingMode(false);
                }}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                  isPlanningMode 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
                    : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100'
                }`}
              >
                <Route className="w-4 h-4" />
                {isPlanningMode ? 'Cancel Route' : 'Plan Route'}
              </button>
              <button 
                onClick={() => {
                  setIsTaggingMode(!isTaggingMode);
                  setCustomerToTag(null);
                  setIsMobileSheetExpanded(false);
                  setIsPlanningMode(false);
                  setIsProximityMode(false);
                }}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                  isTaggingMode 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {isTaggingMode ? 'Done Tagging' : 'Tag Location'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative z-0 min-h-[150px] md:min-h-[300px]">
        <style>{`
          .leaflet-top, .leaflet-bottom {
            z-index: 10 !important;
          }
        `}</style>
        <MapContainer center={DEFAULT_MAP_CENTER} zoom={DEFAULT_MAP_ZOOM} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onMapClick={handleMapClick} />
          
          {searchCenter && <RecenterAutomatically lat={searchCenter[0]} lng={searchCenter[1]} />}
          
          {searchCenter && isProximityMode && (
            <AutoFitCircle center={searchCenter} radius={searchRadius} />
          )}

          {polylinePositions.length >= 2 && (
            <Polyline positions={polylinePositions} pathOptions={{ color: '#4f46e5', dashArray: '10, 10', weight: 4 }} />
          )}

          {/* Plot Super Stockists */}
          {superStockists.map(ss => {
            if (ss.lat && ss.lng) {
              return (
                <Marker 
                  key={ss.id} 
                  position={[ss.lat, ss.lng]} 
                  icon={superStockistDivIcon}
                >
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-purple-700">{ss.name}</h3>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Super Stockist</p>
                      <p className="text-xs text-zinc-600 mt-1">Region: {ss.state}</p>
                      <p className="text-xs text-zinc-600 font-medium">Phone: {ss.contactPhone}</p>
                      <p className="text-xs text-zinc-600 font-medium">Email: {ss.email}</p>
                      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2 space-y-1">
                        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400"><span>Total Billed:</span><span className="font-bold text-zinc-950 dark:text-zinc-100">₹{ss.totalBilled?.toLocaleString()}</span></div>
                        <div className="flex justify-between text-xs text-amber-600"><span>Outstanding:</span><span className="font-bold">₹{ss.outstandingBalance?.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}

          {/* Plot Distributors & Mapped Polylines */}
          {distributors.map(db => {
            if (db.lat && db.lng) {
              const parentSS = superStockists.find(ss => ss.id === db.superStockistId);
              const ssPosition = parentSS && parentSS.lat && parentSS.lng ? [parentSS.lat, parentSS.lng] : null;

              return (
                <React.Fragment key={db.id}>
                  <Marker 
                    position={[db.lat, db.lng]} 
                    icon={distributorDivIcon}
                  >
                    <Popup>
                      <div className="p-1">
                        <h3 className="font-bold text-blue-600">{db.name}</h3>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Distributor ({db.district})</p>
                        <p className="text-xs text-zinc-600 mt-1">Parent SS: {parentSS ? parentSS.name : "None"}</p>
                        <p className="text-xs text-zinc-600">Phone: {db.contactPhone}</p>
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Faint dashed connecting polyline to parent Super Stockist */}
                  {ssPosition && (
                    <Polyline 
                      positions={[[db.lat, db.lng], ssPosition]} 
                      pathOptions={{ color: '#8b5cf6', dashArray: '5, 5', weight: 2, opacity: 0.6 }} 
                    />
                  )}
                </React.Fragment>
              );
            }
            return null;
          })}

          {customers.map(customer => {
            // Only render if customer has valid lat/lng
            if (customer.lat && customer.lng) {
              const routeIndex = routeSequence.indexOf(customer.id);
              const isSelected = routeIndex !== -1;

              return (
                <Marker 
                  key={customer.id} 
                  position={[customer.lat, customer.lng]}
                  eventHandlers={{
                    click: () => handleMarkerClick(customer.id)
                  }}
                >
                  {!isPlanningMode && (
                    <Popup>
                      <div className="p-1">
                        <h3 className="font-bold text-zinc-900">{customer.name}</h3>
                        <p className="text-sm text-zinc-600 mb-2">{customer.phone}</p>
                        {customer.tags && customer.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-2">
                            {customer.tags.map(tag => (
                              <span key={tag} className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Popup>
                  )}
                  {isPlanningMode && isSelected && (
                    <Tooltip permanent direction="top" className="bg-indigo-100 text-indigo-700 font-bold border-0 shadow-md">
                      Stop {routeIndex + 1}
                    </Tooltip>
                  )}
                </Marker>
              );
            }
            return null;
          })}

          {isTaggingMode && customerToTag && customerToTag.lat && customerToTag.lng && (
            <Circle 
              center={[customerToTag.lat, customerToTag.lng]} 
              radius={500} 
              pathOptions={{ fillColor: '#3b82f6', color: '#2563eb', weight: 2, fillOpacity: 0.2 }}
            />
          )}
        </MapContainer>
      </div>
      </div>

      {/* Right Sidebar for Proximity Search */}
      {isProximityMode && (
        <div className={`w-full flex-none ${isMobileSheetExpanded ? 'h-[60vh]' : 'h-[200px]'} md:relative md:w-80 md:h-full border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1d27] shadow-lg md:shadow-none flex flex-col z-20 shrink-0 rounded-t-3xl md:rounded-none transition-all duration-300 animate-slide-up-fade`}>
          <div 
            className="w-full flex justify-center py-3 md:hidden cursor-pointer min-h-[44px] items-center"
            onClick={() => setIsMobileSheetExpanded(!isMobileSheetExpanded)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
          </div>
          <div className="p-4 pt-0 md:pt-4 border-b border-zinc-200 dark:border-zinc-800 bg-transparent">
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-indigo-500" /> Proximity Search
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">Search Radius</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{searchRadius} km</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={searchRadius} 
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 min-h-[44px]"
              />
            </div>
            {!searchCenter && (
              <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl mt-4 font-semibold border border-amber-200 dark:border-amber-500/30">
                Click anywhere on the map to set search center.
              </p>
            )}
            <button 
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => setSearchCenter([position.coords.latitude, position.coords.longitude]),
                    (err) => toast.error("Could not access location. Please allow location permissions.")
                  );
                } else {
                  toast.error("Geolocation is not supported by your browser.");
                }
              }}
              className="mt-4 w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700 min-h-[44px]"
            >
              <Navigation className="w-4 h-4" />
              Use My Location
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {searchCenter ? (
              nearbyCustomers.length === 0 ? (
                <div className="text-center text-zinc-500 text-sm mt-10">No customers found within {searchRadius}km.</div>
              ) : (
                nearbyCustomers.map(customer => (
                  <div key={customer.id} className="p-4 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors shadow-sm cursor-pointer" onClick={() => navigate('/dashboard/customers', { state: { openCustomerId: customer.id } })}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{customer.name}</p>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">
                        {customer.distance.toFixed(1)} km
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">{customer.phone}</p>
                  </div>
                ))
              )
            ) : null}
          </div>
        </div>
      )}

      {/* Right Sidebar for Route Planning */}
      {isPlanningMode && (
        <div className={`w-full flex-none ${isMobileSheetExpanded ? 'h-[60vh]' : 'h-[200px]'} md:relative md:w-80 md:h-full border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1d27] shadow-lg md:shadow-none flex flex-col z-20 shrink-0 rounded-t-3xl md:rounded-none transition-all duration-300 animate-slide-up-fade`}>
          <div 
            className="w-full flex justify-center py-3 md:hidden cursor-pointer min-h-[44px] items-center"
            onClick={() => setIsMobileSheetExpanded(!isMobileSheetExpanded)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
          </div>
          <div className="p-4 pt-0 md:pt-4 border-b border-zinc-200 dark:border-zinc-800 bg-transparent flex justify-between items-center">
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Route className="w-4 h-4 text-indigo-500" /> Route Sequence
            </h2>
            <button onClick={() => setRouteSequence([])} className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 min-h-[44px] min-w-[44px] flex items-center justify-center">Clear</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
            <div className="space-y-2 flex-1">
              {routeSequence.length === 0 ? (
                <div className="text-center text-zinc-500 text-sm mt-4">
                  Click markers on the map or search below to add stops.
                </div>
              ) : (
                routeSequence.map((customerId, index) => {
                  const customer = customers.find(c => c.id === customerId);
                  return (
                    <div 
                      key={customerId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, index)}
                      className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl cursor-move hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors shadow-sm"
                    >
                      <div className="w-6 h-6 shrink-0 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold text-xs border border-indigo-200 dark:border-indigo-500/30">
                        {index + 1}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{customer?.name || 'Unknown'}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromRoute(customerId)}
                        className="text-zinc-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />
            <div className="flex flex-col gap-3 min-h-[120px]">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Available Customers</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or phone..." 
                  value={routeSearchQuery}
                  onChange={(e) => setRouteSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white min-h-[44px]"
                />
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar h-32 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 bg-zinc-50 dark:bg-[#0f1117]">
                {availableForRoute.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => setRouteSequence([...routeSequence, c.id])}
                    className="text-left px-3 py-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-colors text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex justify-between min-h-[44px] items-center"
                  >
                    <span className="truncate pr-2">+ {c.name}</span>
                    {!c.lat && <span className="text-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 px-1.5 py-0.5 rounded font-bold whitespace-nowrap shrink-0">No Map</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1d27]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-zinc-500">Total Stops</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{routeSequence.length}</span>
            </div>
            <button 
              disabled={routeSequence.length === 0}
              onClick={handleSaveBeat}
              className="w-full py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              Save as Beat
            </button>
          </div>
        </div>
      )}

      {/* Right Sidebar for Tagging Customers */}
      {isTaggingMode && (
        <div className={`w-full flex-none ${isMobileSheetExpanded ? 'h-[60vh]' : 'h-[200px]'} md:relative md:w-80 md:h-full border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1d27] shadow-lg md:shadow-none flex flex-col z-20 shrink-0 rounded-t-3xl md:rounded-none transition-all duration-300 animate-slide-up-fade`}>
          <div 
            className="w-full flex justify-center py-3 md:hidden cursor-pointer min-h-[44px] items-center"
            onClick={() => setIsMobileSheetExpanded(!isMobileSheetExpanded)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
          </div>
          <div className="p-4 pt-0 md:pt-4 border-b border-zinc-200 dark:border-zinc-800 bg-transparent">
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-500" /> Tag Location
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Select a customer below, then click on the map to set their location.</p>
            {customerToTag && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Now Tagging:</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{customerToTag.name}</p>
                <button onClick={() => setCustomerToTag(null)} className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mt-2 flex items-center gap-1 min-h-[32px]">
                  <X className="w-3 h-3" /> Cancel Selection
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {customers.map(customer => {
              const hasLocation = customer.lat && customer.lng;
              return (
                <div 
                  key={customer.id} 
                  onClick={() => setCustomerToTag(customer)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                    customerToTag?.id === customer.id 
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500/50' 
                      : 'bg-white border-zinc-200 dark:bg-[#1a1d27] dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{customer.name}</p>
                      <p className="text-xs text-zinc-500">{customer.phone}</p>
                    </div>
                    {hasLocation ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 px-2 py-0.5 rounded-md">Has Location</span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 px-2 py-0.5 rounded-md">Missing</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <CreateBeatModal 
        isOpen={isCreateBeatModalOpen}
        onClose={() => setIsCreateBeatModalOpen(false)}
        onSubmit={(beatData) => {
          addBeat({ ...beatData, assignedCustomers: routeSequence });
          navigate('/dashboard/beats');
        }}
      />
    </div>
  );
};

export default MapPage;
