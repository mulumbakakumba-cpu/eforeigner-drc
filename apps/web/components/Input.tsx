type InputProps = {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: InputProps) {
  return (
    <div>
      <label className="block font-semibold mb-2">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-700 outline-none"
      />
    </div>
  );
}