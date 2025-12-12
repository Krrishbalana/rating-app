export default function RatingBar({ stars, count, total }) {
  const percent = total ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="w-6 text-sm">{stars}★</span>

      <div className="flex-1 bg-gray-200 h-3 rounded">
        <div
          className="bg-yellow-500 h-3 rounded"
          style={{ width: `${percent}%` }}
        />
      </div>

      <span className="w-6 text-right text-sm text-gray-700">{count}</span>
    </div>
  );
}
