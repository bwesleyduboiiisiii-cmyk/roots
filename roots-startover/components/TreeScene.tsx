export function TreeScene() {
  const branches = [
    "M450 1500 C440 1240 430 980 450 720 C460 520 430 360 390 170",
    "M450 860 C350 720 250 620 120 520",
    "M470 820 C570 690 670 590 820 490",
    "M440 650 C370 520 330 390 280 250",
    "M470 650 C550 500 610 370 690 210"
  ];
  const roots = [
    "M450 1500 C340 1650 220 1760 80 1880",
    "M460 1500 C575 1655 700 1770 850 1900",
    "M420 1540 C350 1760 300 1980 220 2240",
    "M485 1540 C560 1760 620 2000 710 2280",
    "M450 1545 C440 1800 445 2100 420 2500"
  ];

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 2800" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      <defs>
        <linearGradient id="treeSky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#d4e4d8"/><stop offset="1" stopColor="#e8e0c8"/></linearGradient>
        <linearGradient id="treeSoil" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8b6f47"/><stop offset=".55" stopColor="#5c4530"/><stop offset="1" stopColor="#3d2e1f"/></linearGradient>
        <linearGradient id="treeBark" x1="0" x2="1"><stop offset="0" stopColor="#3f2718"/><stop offset=".5" stopColor="#7a5338"/><stop offset="1" stopColor="#4a3020"/></linearGradient>
        <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="6"/></filter>
      </defs>
      <rect width="900" height="1450" fill="url(#treeSky)"/>
      <rect y="1450" width="900" height="1350" fill="url(#treeSoil)"/>
      <g filter="url(#rough)" opacity=".93">
        <ellipse cx="450" cy="430" rx="360" ry="320" fill="#6b8e4e" opacity=".75"/>
        <ellipse cx="270" cy="470" rx="170" ry="120" fill="#7a9c5a" opacity=".75"/>
        <ellipse cx="630" cy="460" rx="190" ry="135" fill="#5f8144" opacity=".78"/>
        <ellipse cx="450" cy="250" rx="220" ry="150" fill="#8ab168" opacity=".55"/>
      </g>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {branches.map((d, i) => <path key={i} d={d} stroke="#5c3d28" strokeWidth={46 - i * 6} opacity=".88"/>)}
        <path d="M382 1510 C405 1180 405 890 395 630 C390 430 410 250 450 120 C490 250 512 430 505 640 C495 900 505 1180 535 1510 C495 1535 420 1535 382 1510Z" fill="url(#treeBark)"/>
        {Array.from({length:22}).map((_,i)=><path key={`g${i}`} d={`M${395+(i%7)*22} ${220+i*55} C${370+(i%5)*25} ${420+i*35}, ${445+(i%6)*19} ${690+i*32}, ${398+(i%8)*17} 1490`} stroke="#2f1d12" strokeWidth="2" opacity=".28"/>)}
        {roots.map((d, i) => <path key={`r${i}`} d={d} stroke="#4a3020" strokeWidth={48 - i * 5} opacity=".9"/>)}
        {Array.from({length:60}).map((_,i)=> <path key={`h${i}`} d={`M${30+(i*47)%840} ${1850+(i*61)%800} q ${i%2?35:-35} ${60+i%80} ${i%2?90:-90} ${120+i%80}`} stroke="#251811" strokeWidth="2" opacity=".4"/>)}
      </g>
      <rect y="1430" width="900" height="90" fill="#6b8e4e" opacity=".95"/>
      {Array.from({length:110}).map((_,i)=><path key={`grass${i}`} d={`M${i*9-20} 1490 q ${i%2?7:-7} -${20+i%24} ${12+i%5} 0`} stroke={i%2?"#4a6b35":"#8ab168"} strokeWidth="3" fill="none" opacity=".75"/>)}
    </svg>
  );
}
