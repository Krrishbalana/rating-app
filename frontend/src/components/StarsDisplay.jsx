export default function StarsDisplay({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`text-sm ${
            s <= value ? "text-yellow-400" : "text-white/30"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
