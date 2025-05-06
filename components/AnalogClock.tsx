import { useEffect, useState } from 'react';

const AnalogClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondDeg = seconds * 6; // 360/60
  const minuteDeg = minutes * 6 + seconds * 0.1; // 6 deg per min + 0.1 for smoothness
  const hourDeg = (hours % 12) * 30 + minutes * 0.5; // 30 deg per hour + 0.5 per minute


  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);

  return (

    <div className="absolute top-14 right-3 w-40 h-40 rounded-full border-4 border-amber-700 bg-gradient-to-br from-amber-800 to-amber-900 shadow-lg flex items-center justify-center">
      
    {/* Numbers */}
    {numbers.map((num) => {
      const angle = (num - 3) * (Math.PI / 6); // rotate numbers correctly
      const x = Math.cos(angle) * 70;
      const y = Math.sin(angle) * 70;

      return (
        <div
          key={num}
          className="absolute text-amber-200 font-semibold text-sm"
          style={{
            transform: `translate(${x}px, ${y}px)`
          }}
        >
          {num}
        </div>
      );
    })}




      {/* center dot */}
      <div className="absolute w-2 h-2 bg-amber-200 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10" />

      {/* hour hand */}
      <div
        className="absolute w-1 h-14 bg-amber-300 origin-bottom top-6 left-1/2 -translate-x-1/2"
        style={{ transform: `rotate(${hourDeg}deg)` }}
      />

      {/* minute hand */}
      <div
        className="absolute w-0.5 h-16 bg-amber-300 origin-bottom top-4 left-1/2 -translate-x-1/2"
        style={{ transform: `rotate(${minuteDeg}deg)` }}
      />

      {/* second hand */}
      <div
        className="absolute w-0.5 h-18 bg-red-400 origin-bottom top-2 left-1/2 -translate-x-1/2"
        style={{ transform: `rotate(${secondDeg}deg)` }}
      />
    </div>
  );
};

export default AnalogClock;





