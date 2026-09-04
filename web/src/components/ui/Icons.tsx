import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, className, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
    ...rest,
  };
}

export function IconPin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

export function IconAtv(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="17.5" cy="16.5" r="2.5" />
      <path d="M4 16.5h2M16 16.5h2M9 16.5h6" />
      <path d="M8 16.5 9.5 11h5L17 16.5" />
      <path d="M10 11V8.5h4.5L16 11" />
    </svg>
  );
}

export function IconRoute(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 7.5c2.5 0 3.5 2 5 4s2.5 4 5 4" />
    </svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M18 13.5A7 7 0 1 1 10.5 6 5.5 5.5 0 0 0 18 13.5Z" />
      <path d="M16.2 5.2v0M18.5 7.8v0" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 19 6.5v5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5v-5L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconTrees(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 20V12M12 20V9M16 20v-6" />
      <path d="m8 12-3 0 3-5 3 5H8Z" />
      <path d="m12 9-3.5 0L12 3.5 15.5 9H12Z" />
      <path d="m16 14-2.5 0 2.5-4 2.5 4H16Z" />
    </svg>
  );
}

export function IconEngine(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="9" width="12" height="8" rx="1.5" />
      <path d="M17 12h2.5v3H17M8 9V7h5v2M10 17v2M14 17v2" />
    </svg>
  );
}

export function IconHouse(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m4 11 8-7 8 7" />
      <path d="M6 10.5V20h12v-9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 1.8" />
    </svg>
  );
}

export function IconHelmet(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 14c0-4.5 3.2-8 7-8s7 3.5 7 8v2.5c0 1-.5 2-1.5 2.6L16 20H8l-1.5-.9C5.5 18.5 5 17.5 5 16.5V14Z" />
      <path d="M6.5 13h11" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="16" cy="9" r="2" />
      <path d="M4.5 18c.8-3 2.6-4.5 4.5-4.5S12.5 15 13.2 17.5" />
      <path d="M13.5 18c.6-2.2 2-3.5 4-3.5s3.4 1.4 4 3.5" />
    </svg>
  );
}

export function IconStar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m12 3.5 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 17.2l.9-5L4.8 8.7l5-.7L12 3.5Z" />
    </svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="6" width="16" height="14" rx="1.5" />
      <path d="M4 10h16M8 4v4M16 4v4" />
    </svg>
  );
}

export function IconId(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="6" width="17" height="12" rx="1.5" />
      <circle cx="8.5" cy="12" r="2" />
      <path d="M12.5 10.5h5M12.5 13.5h4" />
    </svg>
  );
}

export function IconGrad(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m3 10 9-4 9 4-9 4-9-4Z" />
      <path d="M7 12.5v3.5c2 1.5 8 1.5 10 0v-3.5M21 10v5" />
    </svg>
  );
}

export function IconList(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 7h11M9 12h11M9 17h11M5 7h.01M5 12h.01M5 17h.01" />
    </svg>
  );
}

export function IconCloud(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 17h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.5A3.5 3.5 0 0 0 8 17Z" />
      <path d="m9.5 19 .8 1.5M12 19.5v1.8M14.5 19l.8 1.5" />
    </svg>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8.5h14.5A1.5 1.5 0 0 1 20 10v8.5A1.5 1.5 0 0 1 18.5 20H5.5A1.5 1.5 0 0 1 4 18.5v-10Z" />
      <path d="M4 8.5 16 5l2.5 3.5M16 14.5h2" />
    </svg>
  );
}

export function IconWrench(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14.5 6.5a3.5 3.5 0 0 0-4.7 4.7L4 17l3 3 5.8-5.8a3.5 3.5 0 0 0 4.7-4.7L15 12l-2.5-2.5 2-3Z" />
    </svg>
  );
}

export function IconWhatsApp(props: IconProps) {
  return (
    <svg {...base({ ...props, strokeWidth: 1.4 })}>
      <path d="M12 4.5a7.5 7.5 0 0 0-6.5 11.2L5 19.5l4-1.1A7.5 7.5 0 1 0 12 4.5Z" />
      <path d="M9.2 10.2c.3-.4.5-.4.7-.4h.5c.2 0 .4 0 .5.4l.6 1.5c.1.2 0 .4-.1.5l-.4.4c-.1.1-.2.3 0 .5.3.4.8.9 1.4 1.2.4.2.6.2.8 0l.5-.5c.2-.2.4-.1.6 0l1.3.7c.2.1.3.3.2.5-.2.6-1 1.2-1.6 1.2h-.3c-.4 0-1-.2-2-.8-1.2-.7-2.1-1.8-2.5-2.5-.3-.5-.5-1-.5-1.4 0-.4.3-1 .8-1.3Z" />
    </svg>
  );
}

export function IconTelegram(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 5 3.5 11.5l4.8 1.8L10 19l2.7-3.3L18 17.5 20 5Z" />
      <path d="m8.3 13.3 8.7-5.5" />
    </svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 4.5h2.5l1 3.5-1.8 1.2a11 11 0 0 0 5.1 5.1l1.2-1.8 3.5 1V18a1.5 1.5 0 0 1-1.5 1.5A14.5 14.5 0 0 1 4.5 8 1.5 1.5 0 0 1 6 6.5H8V4.5Z" />
    </svg>
  );
}

export function IconCamera(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 8.5h3l1.2-2h6.6l1.2 2H19.5A1.5 1.5 0 0 1 21 10v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5V10a1.5 1.5 0 0 1 1.5-1.5Z" />
      <circle cx="12" cy="14" r="3.2" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5.5 12.5 4 4 9-9" />
    </svg>
  );
}

export function IconFuel(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 20V6.5A1.5 1.5 0 0 1 7.5 5h6A1.5 1.5 0 0 1 15 6.5V20" />
      <path d="M5 20h12M15 10h1.5a2 2 0 0 1 2 2v4.5a1.5 1.5 0 0 0 3 0V9.5L19 7" />
    </svg>
  );
}

export function IconFire(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 20c3.5 0 5.5-2.4 5.5-5.5 0-2.2-1.2-3.6-2.3-4.6-.3 1.4-1.1 2.2-1.1 2.2S15 7.5 12 4c0 0-1.8 2.8-1.8 5.2 0 0-1.5-1-2.4-2.6C7 8.2 6.5 10 6.5 12c0 3.6 2.2 8 5.5 8Z" />
    </svg>
  );
}
