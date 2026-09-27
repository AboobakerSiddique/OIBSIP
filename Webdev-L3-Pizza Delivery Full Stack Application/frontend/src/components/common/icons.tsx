import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "var(--green)",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function PizzaSliceIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" {...base} {...props}>
      <path d="M50 12 L88 82 A44 44 0 0 1 12 82 Z" />
      <circle cx="46" cy="46" r="3.5" fill="var(--green)" stroke="none" />
      <circle cx="58" cy="58" r="3.5" fill="var(--green)" stroke="none" />
      <circle cx="38" cy="64" r="3.5" fill="var(--green)" stroke="none" />
      <path d="M12 82 Q50 92 88 82" />
    </svg>
  );
}

export function TomatoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" {...base} {...props}>
      <circle cx="50" cy="58" r="32" />
      <path d="M50 26 C46 18 40 16 34 18 M50 26 C54 18 60 16 66 18 M50 26 V16" />
      <path d="M30 50 Q50 40 70 50" />
    </svg>
  );
}

export function CheeseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" {...base} {...props}>
      <path d="M12 70 L50 20 L88 70 Z" />
      <path d="M12 70 H88" />
      <circle cx="45" cy="55" r="3" fill="var(--green)" stroke="none" />
      <circle cx="60" cy="60" r="3" fill="var(--green)" stroke="none" />
    </svg>
  );
}

export function BasilIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" {...base} {...props}>
      <path d="M50 88 C50 60 50 40 50 15" />
      <path d="M50 30 C34 26 22 34 18 48 C34 52 46 46 50 30 Z" />
      <path d="M50 50 C66 46 78 54 82 68 C66 72 54 66 50 50 Z" />
    </svg>
  );
}

export function PepperoniIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" {...base} {...props}>
      <circle cx="50" cy="50" r="30" />
      <circle cx="42" cy="42" r="3" fill="var(--green)" stroke="none" />
      <circle cx="58" cy="46" r="3" fill="var(--green)" stroke="none" />
      <circle cx="46" cy="60" r="3" fill="var(--green)" stroke="none" />
      <circle cx="62" cy="60" r="3" fill="var(--green)" stroke="none" />
    </svg>
  );
}

export function SauceBottleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" {...base} {...props}>
      <path d="M40 10 h20 v10 h6 a6 6 0 0 1 6 6 v58 a6 6 0 0 1 -6 6 H34 a6 6 0 0 1 -6 -6 V26 a6 6 0 0 1 6 -6 h6 z" />
      <path d="M34 46 H66" />
    </svg>
  );
}

export function DoughBaseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" {...base} {...props}>
      <circle cx="50" cy="50" r="36" />
      <circle cx="50" cy="50" r="24" strokeDasharray="4 5" />
    </svg>
  );
}

export function OvenIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" {...base} {...props}>
      <rect x="16" y="20" width="68" height="60" rx="4" />
      <rect x="26" y="32" width="48" height="28" rx="2" />
      <circle cx="72" cy="70" r="3" fill="var(--green)" stroke="none" />
      <circle cx="60" cy="70" r="3" fill="var(--green)" stroke="none" />
    </svg>
  );
}

export function ScooterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" {...base} {...props}>
      <circle cx="26" cy="76" r="10" />
      <circle cx="74" cy="76" r="10" />
      <path d="M26 76 H50 L60 50 H78" />
      <path d="M50 76 L58 56" />
      <rect x="62" y="34" width="18" height="14" rx="2" />
    </svg>
  );
}
