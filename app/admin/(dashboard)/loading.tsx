export default function AdminLoading() {
  return <div role="status" className="grid gap-4"><div className="h-9 w-64 animate-pulse rounded bg-surface-container" /><div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-lg bg-white" />)}</div></div>;
}

