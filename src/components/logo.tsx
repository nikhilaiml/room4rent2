import { cn } from '@/lib/utils';

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 60"
    className={cn("w-auto h-10", className)}
    {...props}
  >
    <defs>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
          .logo-text { font-family: 'Caveat', cursive; fill: hsl(var(--primary)); font-size: 28px; }
        `}
      </style>
    </defs>
    
    {/* Icon */}
    <g transform="translate(10, 0) scale(0.8)">
      {/* Circles */}
      <circle cx="30" cy="25" r="18" fill="hsl(var(--primary))" opacity="0.7" />
      <circle cx="50" cy="20" r="15" fill="#FDB813" opacity="0.7" />
      <circle cx="20" cy="35" r="20" fill="#8A2BE2" opacity="0.6" />
      <circle cx="65" cy="30" r="8" fill="#4169E1" opacity="0.8" />
       <circle cx="10" cy="15" r="5" fill="hsl(var(--primary))" opacity="0.9" />

      {/* Houses */}
      <g fill="hsl(var(--foreground))">
        <path d="M20 30 L20 50 L35 50 L35 38 L45 30 L20 30 Z" />
        <path d="M40 25 L40 50 L55 50 L55 35 L60 35 L60 28 L40 25 Z" />
        {/* Windows */}
        <g fill="white">
            <rect x="23" y="33" width="3" height="3" />
            <rect x="29" y="33" width="3" height="3" />
            <rect x="23" y="38" width="3" height="3" />
            <rect x="29" y="38" width="3" height="3" />
            <rect x="43" y="30" width="3" height="3" />
            <rect x="49" y="30" width="3" height="3" />
            <rect x="43" y="35" width="3" height="3" />
            <rect x="49" y="35" width="3" height="3" />
        </g>
         <rect x="26" y="45" width="6" height="5" fill="#333" />
      </g>
    </g>
    
    {/* Text */}
    <text x="80" y="38" className="logo-text">room4rent</text>
  </svg>
);
