import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import QRScanner from './components/QRScanner';
import DestinationSelector from './components/DestinationSelector';
import CrowdIndicator from './components/CrowdIndicator';
import ARView from './components/ARView';
import api, { endpoints } from './api';
import { MapPin, Navigation, AlertTriangle, ScanLine, X } from 'lucide-react';

const MOCK_DESTINATIONS = [
    { id: 'n_therm', name: 'Thermal Engineering Lab II', type: 'room' },
    { id: 'n_mach', name: 'Machine Tools Lab II', type: 'room' },
    { id: 'n_mech_fac', name: 'Mech Faculty Room', type: 'room' },
    { id: 'n_mhod', name: 'Mech HOD', type: 'room' },
    { id: 'n_leca', name: 'Lecture Hall A', type: 'room' },
    { id: 'n_lecb', name: 'Lecture Hall B', type: 'room' },
    { id: 'n_lecc', name: 'Lecture Hall C', type: 'room' },
    { id: 'n_lecd', name: 'Lecture Hall D', type: 'room' },
    { id: 'n_fc', name: 'Faculty Center', type: 'room' },
    { id: 'n_facroom', name: 'Faculty Room', type: 'room' },
    { id: 'n_ahod', name: 'AI HOD', type: 'room' },
    { id: 'n_gt', name: 'Girls Toilet', type: 'amenity' },
    { id: 'n_bt1', name: 'Boys Toilet 1', type: 'amenity' },
    { id: 'n_bt2', name: 'Boys Toilet 2', type: 'amenity' },
    { id: 'n_lstairs', name: 'Left Stairs', type: 'transit' },
    { id: 'n_rstairs', name: 'Right Stairs', type: 'transit' },
    { id: 'n_stairs_p', name: 'Main Stairs (Right Block)', type: 'transit' }
];

const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
);

const HomePage = ({ onStartNavigation, onEmergency }) => {
    const [showScanner, setShowScanner] = useState(false);
    const [selectedDest, setSelectedDest] = useState(null);
    const [startNode, setStartNode] = useState(null); // { nodeId, position, message }

    const handleScan = async (qrData) => {
        try {
            const res = await api.get(endpoints.qr(qrData));
            setStartNode(res.data);
            setShowScanner(false);
            alert(`Located: ${res.data.message}`);
        } catch (err) {
            alert("Invalid QR Code or Location not found");
            setShowScanner(false);
        }
    };

    const handleNavigate = () => {
        if (selectedDest && startNode) {
            onStartNavigation(startNode.nodeId, selectedDest.id);
        } else if (selectedDest) {
            // Allow selecting optimized entrance if no start node
            onStartNavigation(null, selectedDest.id);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 pb-20 overflow-y-auto">
            <header className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Where to?</h1>
                        <p className="text-gray-500 text-sm">Find your way indoors instantly.</p>
                    </div>
                    <button
                        onClick={() => onEmergency(startNode?.nodeId)}
                        className="bg-red-50 text-red-600 p-3 rounded-full hover:bg-red-100 transition-colors shadow-sm border border-red-100"
                        title="Emergency Mode"
                    >
                        <AlertTriangle size={24} />
                    </button>
                </div>

                <DestinationSelector
                    destinations={MOCK_DESTINATIONS}
                    selected={selectedDest}
                    onSelect={setSelectedDest}
                />
            </header>

            <main className="flex-1 p-6 flex flex-col gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className={`p-3 rounded-full ${startNode ? 'bg-green-100' : 'bg-indigo-50'}`}>
                        <MapPin className={startNode ? 'text-green-600' : 'text-indigo-600'} size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase">Current Location</p>
                        <p className="font-medium text-gray-900 truncate">
                            {startNode ? startNode.message : "Not Localized"}
                        </p>
                    </div>
                    {!startNode && (
                        <button
                            onClick={() => setShowScanner(true)}
                            className="text-indigo-600 text-sm font-semibold hover:underline"
                        >
                            Scan
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setShowScanner(true)}
                        className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-all text-gray-700 hover:border-indigo-200 hover:text-indigo-600 group"
                    >
                        <ScanLine size={32} className="group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Scan QR</span>
                    </button>

                    <button
                        onClick={handleNavigate}
                        disabled={!selectedDest}
                        className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl shadow-lg shadow-indigo-200/50 transition-all ${selectedDest
                            ? 'bg-indigo-600 text-white active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Navigation size={32} className={selectedDest ? "animate-pulse" : ""} />
                        <span className="font-medium">Navigate</span>
                    </button>
                </div>
            </main>

            {showScanner && (
                <QRScanner
                    onScanSuccess={handleScan}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
};

const NavigationPage = ({ path, isEmergency, onEndNavigation }) => {
    const [crowdLevel, setCrowdLevel] = useState('Low');

    // Example Instruction Logic
    const nextNode = path && path.length > 1 ? path[1] : null;

    useEffect(() => {
        const interval = setInterval(() => {
            const levels = ['Low', 'Low', 'Medium', 'High'];
            setCrowdLevel(levels[Math.floor(Math.random() * levels.length)]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-screen bg-black overflow-hidden">
            <ARView path={path} />

            <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-20 flex justify-between items-start pointer-events-none">
                <button
                    onClick={onEndNavigation}
                    className="pointer-events-auto bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-white active:scale-95 transition-all"
                >
                    <X className="w-6 h-6 text-gray-700" />
                </button>

                <div className="flex flex-col items-end gap-2">
                    {isEmergency && (
                        <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-pulse shadow-lg shadow-red-500/50 flex items-center gap-2">
                            <AlertTriangle size={18} />
                            EVACUATION
                        </div>
                    )}
                    <CrowdIndicator density={crowdLevel} alternativeSuggested={crowdLevel === 'High'} />
                </div>
            </div>

            <div className="absolute bottom-8 left-4 right-4 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-white/50 z-20 pointer-events-auto flex items-center gap-4 animate-in slide-in-from-bottom duration-500">
                <div className={`p-4 rounded-xl ${isEmergency ? 'bg-red-100' : 'bg-indigo-100'}`}>
                    <Navigation className={isEmergency ? 'text-red-600' : 'text-indigo-600'} size={32} />
                </div>
                <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">Next Instruction</p>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {nextNode ? `Head towards ${nextNode.name || 'next point'}` : "You have arrived!"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        {path ? `${(path.length - 1) * 10}m remaining` : "0m remaining"}
                    </p>
                </div>
            </div>
        </div>
    );
};

const AppRoutes = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [navigationState, setNavigationState] = useState({
        path: null,
        isEmergency: false
    });

    const startNavigation = async (startId, endId) => {
        setIsLoading(true);
        try {
            // POST /api/navigate
            const payload = { endNodeId: endId };
            if (startId) payload.startNodeId = startId;

            const res = await api.post(endpoints.navigate, payload);

            setNavigationState({
                path: res.data.path,
                isEmergency: false
            });
            navigate('/navigate');
        } catch (err) {
            alert("Navigation Error: " + (err.response?.data?.error || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const startEmergency = async (currentLocationId) => {
        if (!confirm("Activate Emergency Evacuation Mode?")) return;

        setIsLoading(true);
        try {
            const payload = {
                isEmergency: true,
                startNodeId: currentLocationId || 'shopA' // Fallback for demo
            };

            const res = await api.post(endpoints.navigate, payload);

            setNavigationState({
                path: res.data.path,
                isEmergency: true
            });
            navigate('/navigate');
        } catch (err) {
            alert("Emergency Failed: " + (err.response?.data?.error || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const showNavbar = !location.pathname.includes('/navigate');

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            {isLoading && <LoadingOverlay />}

            <div className="flex-1 relative">
                <Routes>
                    <Route path="/" element={
                        <HomePage
                            onStartNavigation={startNavigation}
                            onEmergency={startEmergency}
                        />
                    } />
                    <Route path="/scan" element={
                        <HomePage
                            onStartNavigation={startNavigation}
                            onEmergency={startEmergency}
                        />
                    } />
                    <Route path="/navigate" element={
                        <NavigationPage
                            path={navigationState.path}
                            isEmergency={navigationState.isEmergency}
                            onEndNavigation={() => navigate('/')}
                        />
                    } />
                </Routes>
            </div>

            {showNavbar && <Navbar />}
        </div>
    );
};

const App = () => (
    <BrowserRouter>
        <AppRoutes />
    </BrowserRouter>
);

export default App;
