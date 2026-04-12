import React from 'react';

const RadiantLogo = ({ className = "w-24 h-6" }) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Abstract Dots Element */}
      <div className="grid grid-cols-3 gap-0.5 mt-0.5">
        <div className="w-1 h-1 rounded-full bg-[#fbaf3f]/40"></div>
        <div className="w-1 h-1 rounded-full bg-[#fbaf3f]/60"></div>
        <div className="w-1 h-1 rounded-full bg-[#fbaf3f]"></div>
        <div className="w-1 h-1 rounded-full bg-[#fbaf3f]/60"></div>
        <div className="w-1 h-1 rounded-full bg-[#fbaf3f]"></div>
        <div className="w-1 h-1 rounded-full bg-[#fbaf3f]/60"></div>
        <div className="w-1 h-1 rounded-full bg-[#fbaf3f]"></div>
        <div className="w-1 h-1 rounded-full bg-[#fbaf3f]/60"></div>
        <div className="w-1 h-1 rounded-full bg-[#fbaf3f]/40"></div>
      </div>
      
      {/* RADIANT Text */}
      <div className="flex items-baseline font-black tracking-tighter text-[#1a4a9a]" style={{ fontSize: '100%' }}>
        <span className="text-xl">R</span>
        <span className="text-sm">ADIANT</span>
        <div className="w-1.5 h-1.5 rounded-full bg-[#fbaf3f] mb-2.5 ml-0.5"></div>
      </div>
    </div>
  );
};

export default RadiantLogo;
