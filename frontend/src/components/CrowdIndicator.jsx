import React from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CrowdIndicator = ({ density, alternativeSuggested }) => {
    if (!density) return null;

    const config = {
        Low: { color: 'bg-green-100 text-green-700 border-green-200', icon: Users, label: 'Low Crowd' },
        Medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Users, label: 'Mod. Crowd' },
        High: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, label: 'High Crowd' }
    };

    const { color, icon: Icon, label } = config[density] || config.Low;

    return (
        <div className="flex flex-col gap-2 pointer-events-none">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-sm ${color} w-fit`}
            >
                <Icon size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
            </motion.div>

            <AnimatePresence>
                {alternativeSuggested && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 border border-indigo-500 max-w-xs"
                    >
                        <div className="bg-white/20 p-1.5 rounded-full">
                            <AlertTriangle size={16} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Rerouting</span>
                            <span className="text-sm font-medium">Avoiding high traffic zones</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CrowdIndicator;
