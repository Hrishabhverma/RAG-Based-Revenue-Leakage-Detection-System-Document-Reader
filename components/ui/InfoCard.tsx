
import React from 'react';

interface InfoCardProps {
    title: string;
    children: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => {
    return (
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex flex-col justify-between h-full">
            <h4 className="text-sm font-medium text-slate-400 mb-2">{title}</h4>
            <div className="text-center">{children}</div>
        </div>
    );
};
