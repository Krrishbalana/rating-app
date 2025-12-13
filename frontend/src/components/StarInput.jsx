export default function StarInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 mb-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          type="button"
          key={s}
          onClick={() => onChange(s)}
          className={`text-2xl transition-all duration-200 ease-out ${
            s <= value
              ? "text-yellow-400 hover:scale-[1.05]"
              : "text-white/30 hover:text-white/60"
          } focus:outline-none`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
