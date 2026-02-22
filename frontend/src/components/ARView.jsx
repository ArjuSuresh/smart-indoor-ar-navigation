import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import useOrientation from '../hooks/useOrientation';

const Arrow = ({ rotation }) => {
    const mesh = useRef();

    useFrame(() => {
        if (mesh.current) {
            // Smooth interpolation for rotation
            mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, rotation, 0.1);
        }
    });

    return (
        <group ref={mesh} position={[0, -0.5, -2]}>
            {/* Arrow Shaft */}
            <mesh position={[0, 0, 0.5]}>
                <boxGeometry args={[0.2, 0.05, 1]} />
                <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={0.5} />
            </mesh>
            {/* Arrow Head */}
            <mesh position={[0, 0, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.2, 0.5, 32]} />
                <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} />
            </mesh>
        </group>
    );
};

const ARView = ({ path, userPosition }) => {
    const { orientation, requestPermission, permissionGranted } = useOrientation();
    const [bearing, setBearing] = useState(0);
    const [isARStarted, setIsARStarted] = useState(false);
    const videoRef = useRef(null);

    const handleStartAR = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsARStarted(true);
            requestPermission();
        } catch (err) {
            console.error("Camera error:", err);
            alert("Camera access is required for AR Navigation.");
        }
    };

    // Cleanup Camera Feed on unmount
    useEffect(() => {
        return () => {
            // Cleanup stream
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Calculate desired bearing to next node
    useEffect(() => {
        if (!path || path.length < 2) return;

        // Simple 2D bearing calculation
        const current = path[0]; // Current node (should be close to user)
        const next = path[1];    // Target node

        if (!current || !next) return;

        // Calculate angle in radians
        const dx = next.x - current.x;
        const dy = next.y - current.y;

        // In typical 2D math, 0 is East. Compass 0 is North.
        // We need to map coordinate system. 
        // Assuming Graph: +y is North, +x is East. 
        // Atan2(y, x) gives angle from East counter-clockwise.
        // Compass: 0 North, 90 East, 180 South, 270 West.

        // Map atan2 to compass bearing:
        // angle = atan2(dy, dx)
        // bearing = 90 - deg(angle)

        const angle = Math.atan2(dy, dx);
        const targetBearing = (Math.PI / 2) - angle;

        setBearing(targetBearing);
    }, [path]);

    // Alpha is in degrees (0-360), bearing is radians.
    // We want to rotate the arrow so it points to 'bearing'.
    // Device rotation is 'alpha'.
    // Net rotation = bearing - (alpha * degToRad)
    const arrowRotation = bearing - (orientation.alpha * (Math.PI / 180));

    return (
        <div className="relative w-full h-full bg-black overflow-hidden">
            {/* Background Camera Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* AR Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 1.5, 0]} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Arrow rotation={arrowRotation} />
                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* Permission Button Overlays */}
            {!isARStarted ? (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white p-6">
                    <div className="bg-indigo-600 p-4 rounded-full mb-6 shadow-lg shadow-indigo-500/50">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Camera Access</h2>
                    <p className="text-center text-gray-400 mb-8 max-w-sm">
                        To navigate using Augmented Reality, we need permission to use your camera and device orientation.
                    </p>
                    <button
                        onClick={handleStartAR}
                        className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg active:scale-95 transition-transform"
                    >
                        Allow & Start AR
                    </button>
                </div>
            ) : !permissionGranted && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                    <button
                        onClick={requestPermission}
                        className="bg-white text-black px-6 py-3 rounded-full font-bold"
                    >
                        Enable AR Compass
                    </button>
                </div>
            )}
        </div>
    );
};

export default ARView;
