import { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Globe,
  Layers,
  Users,
  Activity
} from 'lucide-react';

// --- Reusable Chart Components (SVG based for zero-dependency) ---

const AreaChart = ({ color = "text-blue-600", fill = "bg-blue-600" }) => (
  <div className="relative h-16 w-full overflow-hidden pt-2">
    <svg viewBox="0 0 100 40" className="h-full w-full preserve-3d" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" className={color} />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" className={color} />
        </linearGradient>
      </defs>
      <path
        d="M0 40 L0 25 C20 20, 40 30, 60 15 S 80 5, 100 0 L100 40 Z"
        fill="url(#areaGradient)"
        className={color}
      />
      <path
        d="M0 25 C20 20, 40 30, 60 15 S 80 5, 100 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={color}
      />
    </svg>
  </div>
);

const BarChart = ({ color = "bg-blue-600" }) => (
  <div className="flex items-end justify-between gap-1 h-16 w-full pt-2 px-2">
    {[48, 84, 60, 100, 72, 100].map((height, i) => (
      <div
        key={i}
        className={`w-1/6 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity ${color}`}
        style={{ height: `${height}%` }}
      />
    ))}
  </div>
);

const LineChart = ({ color = "text-blue-600", inverse = false }) => (
  <div className="relative h-16 w-full pt-2">
    <svg viewBox="0 0 100 40" className="h-full w-full" preserveAspectRatio="none">
      <path
        d={inverse
          ? "M0 5 C30 5, 50 35, 100 38" // Downward trend
          : "M0 35 C30 35, 50 10, 100 5" // Upward trend
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className={color}
      />
    </svg>
  </div>
);

const MixedChart = () => (
  <div className="relative h-16 w-full pt-2">
    {/* Bars */}
    <div className="absolute inset-0 flex items-end justify-between gap-2 px-2">
      {[36, 54, 42, 72, 60, 84].map((h, i) => (
        <div key={i} className="w-2 bg-slate-200 rounded-t-sm" style={{ height: `${h}%` }} />
      ))}
    </div>
    {/* Line Overlay */}
    <svg viewBox="0 0 100 40" className="absolute inset-0 h-full w-full z-10" preserveAspectRatio="none">
      <path
        d="M5 30 L20 20 L40 25 L60 10 L80 15 L95 5"
        fill="none"
        stroke="#2563eb" // Blue-600
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[
        { cx: 5, cy: 30 }, { cx: 20, cy: 20 }, { cx: 40, cy: 25 },
        { cx: 60, cy: 10 }, { cx: 80, cy: 15 }, { cx: 95, cy: 5 }
      ].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r="2" fill="#2563eb" className="stroke-white" strokeWidth="1" />
      ))}
    </svg>
  </div>
);

const RadialChart = ({ percentage, color = "text-blue-600" }) => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
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

const MetricCard = ({ title, value, subtext, trend, trendLabel, ChartComponent, icon: Icon, accentColor }) => (
  <div className="flex flex-col justify-between p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group h-full">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${accentColor}`}>
        <Icon size={20} className="text-white" strokeWidth={2.5} />
      </div>
      {trend && (
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${trend === 'up' ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-700'
          }`}>
          {trend === 'up' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
          {trendLabel}
        </div>
      )}
    </div>

    <div className="mb-6">
      <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mt-1">{title}</p>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed line-clamp-2">{subtext}</p>
    </div>

    <div className="mt-auto pt-4 border-t border-slate-50">
      {ChartComponent}
    </div>
  </div>
);

const ImpactMetrics = () => {
  const [activeTab, setActiveTab] = useState('growth');

  const tabs = [
    { id: 'growth', label: 'Growth & Revenue', icon: TrendingUp },
    { id: 'ops', label: 'Ops & Efficiency', icon: Zap },
    { id: 'scale', label: 'Scale & Reach', icon: Globe },
  ];

  const data = {
    growth: [
      {
        title: "ROAS Impact",
        value: "4.5x",
        subtext: "Maintained high return while cutting CPC by 30% via bid strategy.",
        trend: "up",
        trendLabel: "CPC -30%",
        icon: Target,
        accentColor: "bg-blue-600",
        ChartComponent: <MixedChart />
      },
      {
        title: "Revenue Expansion",
        value: "+35%",
        subtext: "Channel revenue lift from localizing products for EU, UK, and AU markets.",
        trend: "up",
        trendLabel: "3 New Regions",
        icon: TrendingUp,
        accentColor: "bg-blue-600",
        ChartComponent: <AreaChart color="text-blue-600" />
      },
      {
        title: "B2B Lead Gen",
        value: "+30%",
        subtext: "Increase in qualified leads via new analytics & dashboard implementations.",
        trend: "up",
        trendLabel: "Strong Pipeline",
        icon: Activity,
        accentColor: "bg-blue-600",
        ChartComponent: <BarChart color="bg-blue-600" />
      }
    ],
    ops: [
      {
        title: "Turnaround Time",
        value: "-60%",
        subtext: "Reduced content production time from 5 days to 2 days via new SOPs.",
        trend: "down", // Visual down is good here
        trendLabel: "5 Days → 2 Days",
        icon: Zap,
        accentColor: "bg-blue-600",
        ChartComponent: <LineChart color="text-blue-600" inverse={true} />
      },
      {
        title: "CSAT Score",
        value: "99%",
        subtext: "Achieved near-perfect satisfaction after migrating support systems.",
        trend: "up",
        trendLabel: "Top Tier",
        icon: Users,
        accentColor: "bg-blue-600",
        ChartComponent: <div className="flex justify-center py-1"><RadialChart percentage={99} /></div>
      },
      {
        title: "Cost Savings",
        value: "$50k",
        subtext: "Annual print savings via layout optimization & whitespace reduction.",
        trend: "up",
        trendLabel: "Annual",
        icon: Layers,
        accentColor: "bg-blue-600",
        ChartComponent: <BarChart color="bg-blue-600" />
      }
    ],
    scale: [
      {
        title: "Daily Active Users",
        value: "30k+",
        subtext: "Supported active audience for Science Magazine's digital app.",
        trend: "up",
        trendLabel: "Consistent",
        icon: Users,
        accentColor: "bg-blue-600",
        ChartComponent: <AreaChart color="text-blue-600" />
      },
      {
        title: "Global Reach",
        value: "88",
        subtext: "Countries managed for localization campaigns across 25 languages.",
        trend: "up",
        trendLabel: "Global",
        icon: Globe,
        accentColor: "bg-blue-600",
        ChartComponent: <BarChart color="bg-blue-600" />
      },
      {
        title: "Launch Success",
        value: "100%",
        subtext: "On-time delivery for 4 major product launches across 4 time zones.",
        trend: "up",
        trendLabel: "Zero Delays",
        icon: Target,
        accentColor: "bg-blue-600",
        ChartComponent: <div className="flex justify-center py-1"><RadialChart percentage={100} color="text-blue-600" /></div>
      }
    ]
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 font-sans text-slate-900 bg-slate-50/50 dark:bg-slate-900 dark:text-white transition-colors duration-300">

      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">By The Numbers</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Quantifiable impact across product, marketing, and operations.</p>
      </div>

      {/* Custom Tab Navigation */}
      <div className="flex justify-center mb-10">
        <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 inline-flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-slate-900 text-white shadow-md dark:bg-blue-600'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'}
                `}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
        {data[activeTab].map((item, index) => (
          <MetricCard key={index} {...item} />
        ))}
      </div>

      {/* Resume Link */}
      <div className="mt-12 text-center">
        <a
          href="#resume"
          onClick={(e) => {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('view-change', { detail: 'resume' }));
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors border-b border-transparent hover:border-slate-900 dark:hover:border-white pb-0.5"
        >
          View full resume <ArrowUpRight size={14} />
        </a>
      </div>

    </div>
  );
};

export default ImpactMetrics;
