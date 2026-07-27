interface TimeDisplayProps {
  value: number;
  label: string;
  variant?: "light" | "dark";
}

const TimeDisplay = ({ value, label, variant = "light" }: TimeDisplayProps) => (
  <div>
    <span
      className={`flex h-16 w-16 items-center justify-center rounded-xl px-4 text-xl font-bold shadow-lg lg:text-3xl ${
        variant === "dark"
          ? "bg-white/10 text-white backdrop-blur-sm ring-1 ring-white/20"
          : "bg-white text-dark shadow-2"
      }`}
    >
      {value < 10 ? `0${value}` : value}
    </span>
    <span
      className={`mt-2 block text-center text-xs font-medium uppercase tracking-wider ${
        variant === "dark" ? "text-white/60" : "text-dark-3"
      }`}
    >
      {label}
    </span>
  </div>
);

export default TimeDisplay;
