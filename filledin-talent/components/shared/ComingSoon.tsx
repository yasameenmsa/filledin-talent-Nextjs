'use client';

import React from 'react';
import { Rocket, Clock, Construction } from 'lucide-react';

interface ComingSoonProps {
    title?: string;
    description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
    title = 'Coming Soon',
    description = 'We are working hard to bring you this feature. Stay tuned!'
}) => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
            <div className="relative mb-8">
                {/* Background glow */}
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>

                {/* Icon container */}
                <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-slate-100 transform transition-transform hover:scale-110 duration-500">
                    <Rocket className="w-16 h-16 text-blue-600" strokeWidth={1.5} />

                    {/* Floating badge */}
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Construction className="w-3 h-3" />
                        <span>WIP</span>
                    </div>
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                {title}
            </h1>

            <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed mb-10">
                {description}
            </p>

            {/* Decorative elements */}
            <div className="flex gap-4 opacity-50">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-300"></div>
            </div>
        </div>
    );
};

export default ComingSoon;
