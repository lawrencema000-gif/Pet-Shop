import { cn } from "@/lib/utils";

interface SpecsTableProps {
  specifications: Record<string, string>;
}

export default function SpecsTable({ specifications }: SpecsTableProps) {
  const entries = Object.entries(specifications);

  if (entries.length === 0) {
    return (
      <p className="text-muted text-sm">No specifications available.</p>
    );
  }

  return (
    <div className="border border-border rounded-premium overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value], i) => (
            <tr key={key} className={cn(i % 2 === 0 && "bg-surface")}>
              <td className="px-4 py-3 font-medium text-foreground w-1/3">
                {key}
              </td>
              <td className="px-4 py-3 text-muted">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
