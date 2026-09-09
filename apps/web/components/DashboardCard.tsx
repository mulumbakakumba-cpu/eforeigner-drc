import Link from "next/link";

type DashboardCardProps = {
  title: string;
  description: string;
  icon: string;
  href: string;
};

export default function DashboardCard({
  title,
  description,
  icon,
  href,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition duration-300"
    >
      <div className="text-5xl">{icon}</div>

      <h2 className="text-xl font-bold mt-4 text-blue-900">
        {title}
      </h2>

      <p className="text-gray-600 mt-2">
        {description}
      </p>
    </Link>
  );
}