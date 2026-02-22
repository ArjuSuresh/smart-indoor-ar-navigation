import { useState, useEffect } from 'react';

const useOrientation = () => {
    const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [error, setError] = useState(null);

    const handleOrientation = (event) => {
        // alpha: rotation around z-axis (compass direction)
        // beta: front-to-back tilt
        // gamma: left-to-right tilt
        setOrientation({
            alpha: event.alpha || 0,
            beta: event.beta || 0,
            gamma: event.gamma || 0,
        });
    };

    const requestPermission = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permissionState = await DeviceOrientationEvent.requestPermission();
                if (permissionState === 'granted') {
                    setPermissionGranted(true);
                    window.addEventListener('deviceorientation', handleOrientation);
                    return true;
                } else {
                    setError('Permission denied');
                    return false;
                }
            } catch (err) {
                setError(err.message);
                return false;
            }
        } else {
            // Non-iOS 13+ devices
            setPermissionGranted(true);
            window.addEventListener('deviceorientation', handleOrientation);
            return true;
        }
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    return { orientation, requestPermission, permissionGranted, error };
};

export default useOrientation;
