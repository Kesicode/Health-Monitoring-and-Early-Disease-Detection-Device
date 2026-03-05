import Link from "next/link";
import { Cpu, BookOpen, ArrowRight } from "lucide-react";

const sections = [
  {
    icon: Cpu,
    title: "Device types",
    description: "Learn about the sensors and IoT devices supported by Agri Guard",
    href: "/dashboard/explore/devices",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: BookOpen,
    title: "Animal health guide",
    description: "Reference ranges and health guidelines for livestock and poultry",
    href: "/explore",
    color: "bg-green-50 text-green-600",
  },
];

export default function FarmerExplorePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Explore</h1>
        <p className="text-sm text-gray-500">Learn about devices and animal health monitoring</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map(({ icon: Icon, title, description, href, color }) => (
          <Link key={title} href={href} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-200 hover:shadow-sm transition-all group">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className="w-6 h-6" />
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">{title}</h2>
            <p className="text-sm text-gray-500 mb-3">{description}</p>
            <span className="text-sm font-medium text-green-600 group-hover:gap-2 flex items-center gap-1.5 transition-all">
              Explore <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
