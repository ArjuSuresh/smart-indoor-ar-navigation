import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onClose }) => {
    const scannerRef = useRef(null);

    useEffect(() => {
        const html5QrCode = new Html5Qrcode("qr-reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                onScanSuccess(decodedText);
                html5QrCode.stop().catch(console.error);
            },
            (errorMessage) => {
                // Ignore background scanning errors
            }
        ).catch((err) => {
            console.error("Failed to start camera:", err);
            alert("Camera permission is required to scan QR codes. Please allow access in your browser settings.");
        });

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().catch(console.error);
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Camera size={20} className="text-indigo-600" />
                        Scan Location QR
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 bg-gray-50">
                    <div id="qr-reader" className="w-full rounded-xl overflow-hidden border-2 border-dashed border-indigo-200"></div>
                    <p className="text-center text-sm text-gray-500 mt-3">
                        Point your camera at a location QR code to start navigation.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
