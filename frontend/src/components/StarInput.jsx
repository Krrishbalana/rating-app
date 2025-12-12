export default function StarInput({ value, onChange }) {
  return (
    <div className="flex items-center mb-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          type="button"
          key={s}
          onClick={() => onChange(s)}
          className={`text-3xl ${
            s <= value ? "text-yellow-500" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
