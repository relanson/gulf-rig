export const PROJECT_TYPES = [
  {
    value: "construction",
    label: "Construction",
    color: "#d97706",
    tailwind: "bg-amber-500",
    light: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    cardGradient: "from-amber-500 via-orange-600 to-red-700",
  },
  {
    value: "pre_commissioning",
    label: "Pre-Commissioning & Commissioning",
    color: "#0284c7",
    tailwind: "bg-sky-500",
    light: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    cardGradient: "from-sky-500 via-blue-600 to-indigo-700",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    color: "#059669",
    tailwind: "bg-emerald-500",
    light: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cardGradient: "from-emerald-500 via-teal-600 to-cyan-700",
  },
  {
    value: "shutdown",
    label: "Shutdown",
    color: "#dc2626",
    tailwind: "bg-red-500",
    light: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700 border-red-200",
    cardGradient: "from-red-500 via-rose-600 to-pink-700",
  },
  {
    value: "other",
    label: "Other",
    color: "#6B7280",
    tailwind: "bg-gray-500",
    light: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    cardGradient: "from-gray-500 via-slate-600 to-zinc-700",
  },
] as const;

export const INDUSTRIES = [
  { value: "oil_plant",      label: "Oil Plant"      },
  { value: "gas_plant",      label: "Gas Plant"      },
  { value: "refinery",       label: "Refinery"       },
  { value: "petrochemical",  label: "Petrochemical"  },
  { value: "power_plant",    label: "Power Plant"    },
  { value: "fertilizer",     label: "Fertilizer"     },
  { value: "iron_steel",     label: "Iron & Steel"   },
  { value: "other",          label: "Other"          },
] as const;

export function getIndustryLabel(value: string | null | undefined, customIndustry?: string | null) {
  if (!value) return null;
  if (value === "other" && customIndustry) return customIndustry;
  return INDUSTRIES.find((i) => i.value === value)?.label ?? value;
}

export const CURRENCIES = [
  { value: "USD", label: "USD $",    symbol: "$"   },
  { value: "EUR", label: "EUR €",    symbol: "€"   },
  { value: "GBP", label: "GBP £",    symbol: "£"   },
  { value: "AED", label: "AED د.إ",  symbol: "AED" },
  { value: "SAR", label: "SAR ﷼",   symbol: "SAR" },
  { value: "QAR", label: "QAR ﷼",   symbol: "QAR" },
  { value: "KWD", label: "KWD د.ك", symbol: "KWD" },
  { value: "OMR", label: "OMR ﷼",   symbol: "OMR" },
  { value: "BHD", label: "BHD .د.ب",symbol: "BHD" },
  { value: "INR", label: "INR ₹",    symbol: "₹"   },
  { value: "CAD", label: "CAD $",    symbol: "CA$" },
  { value: "AUD", label: "AUD $",    symbol: "AU$" },
  { value: "NOK", label: "NOK kr",   symbol: "kr"  },
] as const;

// Beautiful ocean-blue gradients for text-only cards
export const CARD_GRADIENTS = [
  "from-sky-500 via-blue-600 to-indigo-700",
  "from-cyan-500 via-sky-600 to-blue-800",
  "from-blue-500 via-sky-600 to-cyan-700",
  "from-teal-500 via-cyan-600 to-sky-700",
  "from-sky-600 via-blue-700 to-slate-700",
  "from-indigo-500 via-blue-600 to-sky-700",
];

const EMPTY_TYPE = {
  value: "", label: "", color: "#9CA3AF",
  tailwind: "", light: "", border: "", text: "", badge: "",
  cardGradient: "from-slate-400 via-gray-500 to-zinc-600",
} as const;

export function getProjectType(value: string) {
  if (!value) return EMPTY_TYPE;
  return PROJECT_TYPES.find((p) => p.value === value) ?? EMPTY_TYPE;
}

/** Returns the display label — null when no project type selected */
export function getProjectLabel(value: string, customProjectType?: string | null): string | null {
  if (!value) return null;
  if (value === "other" && customProjectType) return customProjectType;
  const found = PROJECT_TYPES.find((p) => p.value === value);
  return found ? found.label : null;
}

export function getGradient(index: number) {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
}
