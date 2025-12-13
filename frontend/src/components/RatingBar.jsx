export default function RatingBar({ stars, count, total }) {
  const percent = total ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="w-8 text-sm font-medium text-white/70">{stars}★</span>

      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-2 rounded-full bg-yellow-400 transition-all duration-200 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <span className="w-8 text-right text-sm text-white/40">{count}</span>
    </div>
  );
}
