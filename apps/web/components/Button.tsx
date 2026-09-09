type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
};

export default function Button({
  children,
  type = "button",
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition font-semibold"
    >
      {children}
    </button>
  );
}