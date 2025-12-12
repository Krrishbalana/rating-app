export default function StarsDisplay({ value }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`text-lg ${
            s <= value ? "text-yellow-500" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
