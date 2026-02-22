import React, { useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DestinationSelector = ({ destinations, selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = destinations.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative w-full z-40">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center bg-white shadow-sm border border-gray-200 rounded-xl px-4 py-3 active:scale-[0.99] transition-all"
            >
                <div className="flex flex-col items-start gap-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Destination</span>
                    <span className="text-gray-800 font-medium truncate max-w-[200px]">
                        {selected ? selected.name : "Select a destination"}
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-80 flex flex-col"
                    >
                        <div className="p-3 border-b border-gray-100 bg-gray-50 sticky top-0">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search rooms, exits..."
                                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-1">
                            {filtered.length > 0 ? (
                                filtered.map((dest) => (
                                    <button
                                        key={dest.id}
                                        onClick={() => {
                                            onSelect(dest);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                        className={`w-full text-left px-3 py-3 rounded-lg flex items-center justify-between text-sm transition-colors ${selected?.id === dest.id
                                                ? 'bg-indigo-50 text-indigo-700 font-medium'
                                                : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <span>{dest.name}</span>
                                        {selected?.id === dest.id && <Check size={16} className="text-indigo-600" />}
                                    </button>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-400 text-sm">
                                    No locations found.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DestinationSelector;
