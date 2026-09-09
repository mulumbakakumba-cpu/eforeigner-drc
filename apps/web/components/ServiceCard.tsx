type Props = {
  icon: string;
  title: string;
};

export default function ServiceCard({ icon, title }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:-translate-y-2 hover:shadow-2xl transition duration-300">

      <div className="text-6xl mb-5">
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-blue-900">
        {title}
      </h3>

      <p className="mt-4 text-gray-600">
        Access this immigration service online quickly and securely.
      </p>

      <button className="mt-6 bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800">
        Open
      </button>

    </div>
  );
}