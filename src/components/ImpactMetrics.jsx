import { useId, useState } from "react";
import {
	TrendingUp,
	ArrowUpRight,
	ArrowDownRight,
	Target,
	Zap,
	Globe,
	Layers,
	Users,
	Activity,
} from "lucide-react";

// --- Reusable Chart Components (SVG based for zero-dependency) ---

// Charts stretch to the width of their card, which is much wider on mobile
// (single column) than on desktop. `preserveAspectRatio="none"` is what makes
// the sparkline fill that width, so every stroke needs `non-scaling-stroke` to
// avoid being squashed along with the geometry, and round dots are drawn in
// HTML rather than as <circle> so they can't turn into ellipses.
const CHART_FRAME = "relative h-20 w-full pt-2 sm:h-16";

// Six evenly spaced columns: centers sit at (i + 0.5) / 6 of the plot area.
const COLUMN_CENTERS = [8.333, 25, 41.667, 58.333, 75, 91.667];

const AreaChart = ({ color = "text-blue-600" }) => {
	const gradientId = useId();

	return (
		<div className={`${CHART_FRAME} overflow-hidden`}>
			<svg
				viewBox="0 0 100 40"
				className="h-full w-full"
				preserveAspectRatio="none"
				aria-hidden="true"
				focusable="false"
			>
				<defs>
					<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
						<stop
							offset="0%"
							stopColor="currentColor"
							stopOpacity="0.3"
							className={color}
						/>
						<stop
							offset="100%"
							stopColor="currentColor"
							stopOpacity="0"
							className={color}
						/>
					</linearGradient>
				</defs>
				<path
					d="M0 40 L0 25 C20 20, 40 30, 60 15 S 80 5, 100 0 L100 40 Z"
					fill={`url(#${gradientId})`}
					className={color}
				/>
				<path
					d="M0 25 C20 20, 40 30, 60 15 S 80 5, 100 0"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					vectorEffect="non-scaling-stroke"
					className={color}
				/>
			</svg>
		</div>
	);
};

const BarChart = ({ color = "bg-blue-600" }) => (
	<div className={`${CHART_FRAME} flex items-end gap-1.5 px-2`}>
		{[48, 84, 60, 100, 72, 100].map((height, i) => (
			<div key={i} className="flex h-full flex-1 items-end">
				<div
					className={`mx-auto w-full max-w-[22px] rounded-t-sm opacity-80 transition-opacity group-hover:opacity-100 ${color}`}
					style={{ height: `${height}%` }}
				/>
			</div>
		))}
	</div>
);

const LineChart = ({ color = "text-blue-600", inverse = false }) => (
	<div className={CHART_FRAME}>
		<svg
			viewBox="0 0 100 40"
			className="h-full w-full"
			preserveAspectRatio="none"
			aria-hidden="true"
			focusable="false"
		>
			<path
				d={
					inverse
						? "M0 5 C30 5, 50 35, 100 38" // Downward trend
						: "M0 35 C30 35, 50 10, 100 5" // Upward trend
				}
				fill="none"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
				vectorEffect="non-scaling-stroke"
				className={color}
			/>
		</svg>
	</div>
);

const MixedChart = () => {
	const bars = [36, 54, 42, 72, 60, 84];
	const points = [30, 20, 25, 10, 15, 5].map((y, i) => ({
		x: COLUMN_CENTERS[i],
		y,
	}));
	const linePath = points
		.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`)
		.join(" ");

	return (
		<div className={CHART_FRAME}>
			{/* Bars — each column is full width so its centre lines up with a dot */}
			<div className="absolute inset-0 flex items-end gap-1.5 px-2">
				{bars.map((h, i) => (
					<div key={i} className="flex h-full flex-1 items-end">
						<div
							className="mx-auto w-full max-w-[10px] rounded-t-sm bg-slate-200"
							style={{ height: `${h}%` }}
						/>
					</div>
				))}
			</div>
			{/* Line + dot overlay, sharing the bars' padding box */}
			<div className="absolute inset-0 z-10 px-2">
				<div className="relative h-full w-full">
					<svg
						viewBox="0 0 100 40"
						className="h-full w-full"
						preserveAspectRatio="none"
						aria-hidden="true"
						focusable="false"
					>
						<path
							d={linePath}
							fill="none"
							stroke="#2563eb" // Blue-600
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							vectorEffect="non-scaling-stroke"
						/>
					</svg>
					{points.map((p, i) => (
						<span
							key={i}
							className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-blue-600"
							style={{ left: `${p.x}%`, top: `${(p.y / 40) * 100}%` }}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

const RadialChart = ({ percentage, color = "text-blue-600" }) => (
	<div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
		<svg
			className="h-full w-full -rotate-90 transform"
			viewBox="0 0 36 36"
			aria-hidden="true"
			focusable="false"
		>
			<path
				className="text-slate-100"
				d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
			/>
			<path
				className={color}
				d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeDasharray={`${percentage}, 100`}
				strokeLinecap="round"
			/>
		</svg>
		<span className={`absolute text-xs font-bold ${color}`}>{percentage}%</span>
	</div>
);

const MetricCard = ({
	title,
	value,
	subtext,
	trend,
	trendLabel,
	ChartComponent,
	icon: Icon,
	accentColor,
}) => (
	<div className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-blue-200 hover:shadow-lg sm:p-6">
		<div className="mb-4 flex items-start justify-between gap-3">
			<div className={`shrink-0 rounded-lg p-2 ${accentColor}`}>
				<Icon size={20} className="text-white" strokeWidth={2.5} />
			</div>
			{trend && (
				<div
					className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${
						trend === "up"
							? "bg-slate-100 text-slate-700"
							: "bg-slate-100 text-slate-700"
					}`}
				>
					{trend === "up" ? (
						<ArrowUpRight size={12} className="mr-1 shrink-0" />
					) : (
						<ArrowDownRight size={12} className="mr-1 shrink-0" />
					)}
					<span className="whitespace-nowrap">{trendLabel}</span>
				</div>
			)}
		</div>

		<div className="mb-6">
			<h3 className="text-3xl font-bold tracking-tight text-slate-900">
				{value}
			</h3>
			<p className="mt-1 text-sm font-medium tracking-wide text-slate-500 uppercase">
				{title}
			</p>
			<p className="mt-2 text-sm leading-relaxed text-slate-400 sm:line-clamp-2">
				{subtext}
			</p>
		</div>

		<div className="mt-auto border-t border-slate-50 pt-4">
			{ChartComponent}
		</div>
	</div>
);

const ImpactMetrics = () => {
	const [activeTab, setActiveTab] = useState("growth");

	const tabs = [
		{
			id: "growth",
			label: "Growth & Revenue",
			shortLabel: "Growth",
			icon: TrendingUp,
		},
		{ id: "ops", label: "Ops & Efficiency", shortLabel: "Ops", icon: Zap },
		{ id: "scale", label: "Scale & Reach", shortLabel: "Scale", icon: Globe },
	];

	const data = {
		growth: [
			{
				title: "ROAS Impact",
				value: "4.5x",
				subtext:
					"Maintained high return while cutting CPC by 30% via bid strategy.",
				trend: "up",
				trendLabel: "CPC -30%",
				icon: Target,
				accentColor: "bg-blue-600",
				ChartComponent: <MixedChart />,
			},
			{
				title: "Revenue Expansion",
				value: "+35%",
				subtext:
					"Channel revenue lift from localizing products for EU, UK, and AU markets.",
				trend: "up",
				trendLabel: "3 New Regions",
				icon: TrendingUp,
				accentColor: "bg-blue-600",
				ChartComponent: <AreaChart color="text-blue-600" />,
			},
			{
				title: "B2B Lead Gen",
				value: "+30%",
				subtext:
					"Increase in qualified leads via new analytics & dashboard implementations.",
				trend: "up",
				trendLabel: "Strong Pipeline",
				icon: Activity,
				accentColor: "bg-blue-600",
				ChartComponent: <BarChart color="bg-blue-600" />,
			},
		],
		ops: [
			{
				title: "Turnaround Time",
				value: "-60%",
				subtext:
					"Reduced content production time from 5 days to 2 days via new SOPs.",
				trend: "down", // Visual down is good here
				trendLabel: "5 Days → 2 Days",
				icon: Zap,
				accentColor: "bg-blue-600",
				ChartComponent: <LineChart color="text-blue-600" inverse={true} />,
			},
			{
				title: "CSAT Score",
				value: "99%",
				subtext:
					"Achieved near-perfect satisfaction after migrating support systems.",
				trend: "up",
				trendLabel: "Top Tier",
				icon: Users,
				accentColor: "bg-blue-600",
				ChartComponent: (
					<div className="flex h-20 items-center justify-center sm:h-16">
						<RadialChart percentage={99} />
					</div>
				),
			},
			{
				title: "Cost Savings",
				value: "$50k",
				subtext:
					"Annual print savings via layout optimization & whitespace reduction.",
				trend: "up",
				trendLabel: "Annual",
				icon: Layers,
				accentColor: "bg-blue-600",
				ChartComponent: <BarChart color="bg-blue-600" />,
			},
		],
		scale: [
			{
				title: "Daily Active Users",
				value: "30k+",
				subtext:
					"Supported active audience for Science Magazine's digital app.",
				trend: "up",
				trendLabel: "Consistent",
				icon: Users,
				accentColor: "bg-blue-600",
				ChartComponent: <AreaChart color="text-blue-600" />,
			},
			{
				title: "Global Reach",
				value: "88",
				subtext:
					"Countries managed for localization campaigns across 25 languages.",
				trend: "up",
				trendLabel: "Global",
				icon: Globe,
				accentColor: "bg-blue-600",
				ChartComponent: <BarChart color="bg-blue-600" />,
			},
			{
				title: "Launch Success",
				value: "100%",
				subtext:
					"On-time delivery for 4 major product launches across 4 time zones.",
				trend: "up",
				trendLabel: "Zero Delays",
				icon: Target,
				accentColor: "bg-blue-600",
				ChartComponent: (
					<div className="flex h-20 items-center justify-center sm:h-16">
						<RadialChart percentage={100} color="text-blue-600" />
					</div>
				),
			},
		],
	};

	return (
		<div className="mx-auto w-full max-w-6xl bg-slate-50/50 px-4 py-8 font-sans text-slate-900 transition-colors duration-300 sm:px-6 sm:py-12 dark:bg-slate-900 dark:text-white">
			{/* Header */}
			<div className="mb-8 text-center sm:mb-10">
				<h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
					By The Numbers
				</h2>
				<p className="mt-2 text-sm text-slate-500 sm:text-base dark:text-slate-400">
					Quantifiable impact across product, marketing, and operations.
				</p>
			</div>

			{/* Custom Tab Navigation */}
			<div className="mb-8 flex justify-center sm:mb-10">
				<div className="flex w-full max-w-md rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm sm:w-auto sm:max-w-none dark:border-slate-700 dark:bg-slate-800">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 sm:flex-none sm:gap-2 sm:px-5 ${
									isActive
										? "bg-slate-900 text-white shadow-md dark:bg-blue-600"
										: "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
								} `}
							>
								<Icon size={16} className="shrink-0" />
								{/* `hidden sm:inline` cannot be used here: Layout.astro inlines an
								    unconditional `.hidden { display: none }` in its critical CSS,
								    which outranks the breakpoint utility. */}
								<span className="sm:hidden">{tab.shortLabel}</span>
								<span className="max-sm:hidden">{tab.label}</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Cards Grid */}
			<div className="animate-in fade-in zoom-in grid grid-cols-1 gap-4 duration-300 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
				{(data[activeTab] || []).map((item, index) => (
					<MetricCard key={index} {...item} />
				))}
			</div>

			{/* Resume Link */}
			<div className="mt-10 text-center sm:mt-12">
				<a
					href="#resume"
					onClick={(e) => {
						e.preventDefault();
						window.dispatchEvent(
							new CustomEvent("view-change", { detail: "resume" })
						);
					}}
					className="inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900 dark:text-slate-400 dark:hover:border-white dark:hover:text-white"
				>
					View full resume <ArrowUpRight size={14} />
				</a>
			</div>
		</div>
	);
};

export default ImpactMetrics;
