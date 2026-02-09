import mockWorkouts from "../data/mockWorkouts";

export default function Workouts() {
  return (
    <div className="page">
      <h1>Workouts</h1>
      <p>Mock workouts are below. Edit items in src/data/mockWorkouts.ts</p>
      <ul className="workout-list">
        {mockWorkouts.map(w => (
          <li key={w.id} className="card">
            <div className="card-title">{w.title}</div>
            <div className="card-sub">{w.date}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
