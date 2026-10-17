export function ErrorNote({ message }: { message: string }) {
  return <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{message}</p>;
}
