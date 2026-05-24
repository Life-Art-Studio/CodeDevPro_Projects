import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import useCustomerContext from '../context/CustomerContext';
import { useBeatContext } from '../context/BeatContext';
import { useNavigate } from 'react-router-dom';

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
// Component to handle map re-centering
const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 13);
    }
  }, [lat, lng, map]);
  return null;
};

const MapPage = () => {
  const { customers, updateCustomer } = useCustomerContext();
  const { addBeat } = useBeatContext();
  const navigate = useNavigate();
  const [mapCenter] = useState([20.5937, 78.9629]); // Default India center
  const [zoom] = useState(5);

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
    const name = window.prompt("Enter a name for this new beat:");
    if (name) {
      addBeat({ name, assignedCustomers: routeSequence });
      navigate('/dashboard/beats');
    }
  };

  const polylinePositions = routeSequence
    .map(id => customers.find(c => c.id === id))
    .filter(c => c && c.lat && c.lng)
    .map(c => [c.lat, c.lng]);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-slate-50 dark:bg-[#0a0c14] relative z-0 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex-1 flex flex-col relative z-0">
        {/* Top Bar for Map Actions */}
      <div className="border-b border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-[#0a0c14]/50 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:px-6 shadow-sm z-10 relative gap-3 md:gap-0 shrink-0">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Customer Map</h1>
        <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
          {/* Feature 5 and 8 buttons go here */}
          <button 
            onClick={() => {
              const newMode = !isProximityMode;
              setIsProximityMode(newMode);
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
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isProximityMode 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200'
            }`}
          >
            {isProximityMode ? 'Cancel Nearby' : 'Find Nearby'}
          </button>
          <button 
            onClick={() => {
              setIsPlanningMode(!isPlanningMode);
              if (isPlanningMode) setRouteSequence([]);
              setIsProximityMode(false);
              setIsTaggingMode(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isPlanningMode 
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
                : 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
            }`}
          >
            {isPlanningMode ? 'Cancel Route' : 'Plan Route'}
          </button>
          <button 
            onClick={() => {
              setIsTaggingMode(!isTaggingMode);
              setCustomerToTag(null);
              setIsPlanningMode(false);
              setIsProximityMode(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isTaggingMode 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200'
            }`}
          >
            {isTaggingMode ? 'Done Tagging' : 'Tag Location'}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative z-0 min-h-[300px]">
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onMapClick={handleMapClick} />
          
          {searchCenter && <RecenterAutomatically lat={searchCenter[0]} lng={searchCenter[1]} />}
          
          {searchCenter && isProximityMode && (
            <Circle 
              center={searchCenter} 
              radius={searchRadius * 1000} // km to meters
              pathOptions={{ fillColor: '#a855f7', color: '#9333ea', weight: 2, fillOpacity: 0.1 }}
            />
          )}

          {polylinePositions.length >= 2 && (
            <Polyline positions={polylinePositions} pathOptions={{ color: '#a855f7', dashArray: '10, 10', weight: 4 }} />
          )}

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
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-slate-800">{customer.name}</h3>
                      <p className="text-sm text-slate-600 mb-2">{customer.phone}</p>
                      {customer.tags && customer.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-2">
                          {customer.tags.map(tag => (
                            <span key={tag} className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase">{tag}</span>
                          ))}
                        </div>
                      )}
                      {isPlanningMode && !isSelected && (
                        <button 
                          onClick={() => handleMarkerClick(customer.id)}
                          className="w-full bg-purple-600 text-white rounded text-xs py-1 font-semibold hover:bg-purple-700"
                        >
                          Add to Route
                        </button>
                      )}
                      {isSelected && (
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">Stop {routeIndex + 1}</span>
                      )}
                    </div>
                  </Popup>
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
        <div className="w-full md:w-80 h-[50%] md:h-full border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-white/10 glass-panel shadow-xl flex flex-col animate-slide-in-right z-20 shrink-0">
          <div className="p-4 border-b border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-slate-900/50">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Proximity Search</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Search Radius</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{searchRadius} km</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={searchRadius} 
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>
            {!searchCenter && (
              <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-500/10 p-2 rounded-lg mt-4 font-semibold border border-amber-200 dark:border-amber-500/30">
                Click anywhere on the map to set search center.
              </p>
            )}
            <button 
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => setSearchCenter([position.coords.latitude, position.coords.longitude]),
                    (err) => alert("Could not access location. Please allow location permissions.")
                  );
                } else {
                  alert("Geolocation is not supported by your browser.");
                }
              }}
              className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-200/50 dark:border-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Use My Location
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {searchCenter ? (
              nearbyCustomers.length === 0 ? (
                <div className="text-center text-slate-500 text-sm mt-10">No customers found within {searchRadius}km.</div>
              ) : (
                nearbyCustomers.map(customer => (
                  <div key={customer.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-300 transition-colors shadow-sm cursor-pointer" onClick={() => navigate('/dashboard/customers', { state: { openCustomerId: customer.id } })}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{customer.name}</p>
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-500/20 px-2 py-0.5 rounded-full">
                        {customer.distance.toFixed(1)} km
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{customer.phone}</p>
                  </div>
                ))
              )
            ) : null}
          </div>
        </div>
      )}

      {/* Right Sidebar for Route Planning */}
      {isPlanningMode && (
        <div className="w-full md:w-80 h-[50%] md:h-full border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-white/10 glass-panel shadow-xl flex flex-col animate-slide-in-right z-20 shrink-0">
          <div className="p-4 border-b border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Route Sequence</h2>
            <button onClick={() => setRouteSequence([])} className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400">Clear</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {routeSequence.length === 0 ? (
              <div className="text-center text-slate-500 text-sm mt-10">
                Click markers on the map to add stops to your route.
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
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-move hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors shadow-sm"
                  >
                    <div className="w-6 h-6 shrink-0 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{customer?.name || 'Unknown'}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveFromRoute(customerId)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-slate-900/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-slate-500">Total Stops</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{routeSequence.length}</span>
            </div>
            <button 
              disabled={routeSequence.length === 0}
              onClick={handleSaveBeat}
              className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Beat
            </button>
          </div>
        </div>
      )}

      {/* Right Sidebar for Tagging Customers */}
      {isTaggingMode && (
        <div className="w-full md:w-80 h-[50%] md:h-full border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-white/10 glass-panel shadow-xl flex flex-col animate-slide-in-right z-20 shrink-0">
          <div className="p-4 border-b border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-slate-900/50">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Tag Location</h2>
            <p className="text-xs text-slate-500 mt-1">Select a customer below, then click on the map to set their location.</p>
            {customerToTag && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Now Tagging:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{customerToTag.name}</p>
                <button onClick={() => setCustomerToTag(null)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mt-1">Cancel Selection</button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {customers.map(customer => {
              const hasLocation = customer.lat && customer.lng;
              return (
                <div 
                  key={customer.id} 
                  onClick={() => setCustomerToTag(customer)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    customerToTag?.id === customer.id 
                      ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/40 dark:border-blue-500/50' 
                      : 'bg-white/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{customer.name}</p>
                      <p className="text-xs text-slate-500">{customer.phone}</p>
                    </div>
                    {hasLocation ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Has Location</span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Missing</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
