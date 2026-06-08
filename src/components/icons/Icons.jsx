// Lightweight inline SVG icon set — zero dependencies, themeable via currentColor.

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ size = 20, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export const LogoMark = ({ size = 22, ...p }) => (
  <Svg size={size} {...p}>
    <rect x="3" y="3" width="8" height="8" rx="2.4" />
    <rect x="13" y="3" width="8" height="8" rx="2.4" />
    <rect x="3" y="13" width="8" height="8" rx="2.4" />
    <path d="M14 17.5h6M17 14.5v6" />
  </Svg>
);

export const GridIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.6" />
    <rect x="14" y="3" width="7" height="7" rx="1.6" />
    <rect x="3" y="14" width="7" height="7" rx="1.6" />
    <rect x="14" y="14" width="7" height="7" rx="1.6" />
  </Svg>
);

export const BoxIcon = (p) => (
  <Svg {...p}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </Svg>
);

export const TransferIcon = (p) => (
  <Svg {...p}>
    <path d="M7 7h13l-3-3M17 17H4l3 3" />
  </Svg>
);

export const SparkIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3l1.6 4.8L18 9.4l-4.4 1.6L12 16l-1.6-5L6 9.4l4.4-1.6L12 3Z" />
    <path d="M19 14l.7 2.1L22 17l-2.3.9L19 20l-.7-2.1L16 17l2.3-.9L19 14Z" />
  </Svg>
);

export const SettingsIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

export const BellIcon = (p) => (
  <Svg {...p}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const StoreIcon = (p) => (
  <Svg {...p}>
    <path d="M3 9 4.5 4h15L21 9M4 9v11h16V9M4 9h16" />
    <path d="M9 20v-5h6v5" />
  </Svg>
);

export const AlertIcon = (p) => (
  <Svg {...p}>
    <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Svg>
);

export const HeartPulseIcon = (p) => (
  <Svg {...p}>
    <path d="M20.8 5.6a5.5 5.5 0 0 0-9-1.8L12 4l-.2-.2a5.5 5.5 0 0 0-9 1.8c-1 2.6.3 5.1 2 6.9l7.2 7 7.2-7c1.7-1.8 3-4.3 1.9-6.9Z" />
    <path d="M3.5 12.5H8l1.5-3 2 5 1.5-2h4" />
  </Svg>
);

export const ArrowRightIcon = ({ size = 16, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const TrendUpIcon = ({ size = 14, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M3 17 9 11l4 4 8-8M15 4h6v6" />
  </Svg>
);

export const TrendDownIcon = ({ size = 14, ...p }) => (
  <Svg size={size} {...p}>
    <path d="M3 7l6 6 4-4 8 8M15 20h6v-6" />
  </Svg>
);

export const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </Svg>
);

export const ChartBarsIcon = (p) => (
  <Svg {...p}>
    <path d="M3 21h18" />
    <rect x="5" y="11" width="3.4" height="7" rx="1" />
    <rect x="10.3" y="6" width="3.4" height="12" rx="1" />
    <rect x="15.6" y="14" width="3.4" height="4" rx="1" />
  </Svg>
);

export const ListIcon = (p) => (
  <Svg {...p}>
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </Svg>
);

export const ChatIcon = (p) => (
  <Svg {...p}>
    <path d="M21 11.5a8 8 0 0 1-11.6 7.1L3 21l1.4-4.4A8 8 0 1 1 21 11.5Z" />
    <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
  </Svg>
);

export const BuildingIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h6v6H9z" />
  </Svg>
);

export const ShieldIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3 5 6v5c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);
