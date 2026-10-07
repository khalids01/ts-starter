import { useId } from "react";
import type { FlowDiagram } from "../../../../../../tutorial/shared/content";
import { isValidFlowDiagram } from "../../../../../../tutorial/shared/content";

function wrap(text: string, columns: number) {
  const lines: string[] = [];
  for (const word of text.split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last && last.length + word.length + 1 <= columns) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}
export function TutorialFlow({ diagram }: { diagram: FlowDiagram }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  if (!isValidFlowDiagram(diagram)) return null;
  const cardWidth = 232, cardHeight = 154, gap = 58, pad = 32;
  const columns = Math.max(...diagram.rows.map(row => row.length));
  const width = columns * cardWidth + (columns - 1) * gap + pad * 2;
  const height = diagram.rows.length * cardHeight + (diagram.rows.length - 1) * gap + pad * 2;
  const nodes = diagram.rows.flatMap((row, rowIndex) => row.map((node, column) => ({ ...node, row: rowIndex, x: (width - (row.length * cardWidth + (row.length - 1) * gap)) / 2 + column * (cardWidth + gap), y: pad + rowIndex * (cardHeight + gap) })));
  const summary = nodes.map(node => `${node.label}. ${node.description ?? ""}`).join(" ") + " Connections: " + diagram.edges.map(edge => `${nodes.find(node => node.id === edge.from)!.label} to ${nodes.find(node => node.id === edge.to)!.label}${edge.label ? ` (${edge.label})` : ""}`).join("; ");
  return <section className="space-y-3" aria-labelledby={`${id}-heading`}>
    <div><h2 id={`${id}-heading`} className="font-medium">{diagram.title}</h2>{diagram.description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{diagram.description}</p>}</div>
    <div className="overflow-x-auto rounded-xl border bg-muted/20 p-2" tabIndex={0} aria-label="Workflow diagram. Scroll horizontally if needed.">
      <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto block w-full" style={{ minWidth: columns > 1 ? width : 260, maxWidth: width }} role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>{diagram.title}</title><desc id={`${id}-description`}>{summary}</desc>
        <defs><marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" /></marker></defs>
        {diagram.edges.map((edge, index) => {
          const from = nodes.find(node => node.id === edge.from)!, to = nodes.find(node => node.id === edge.to)!;
          let d: string, lx: number, ly: number;
          if (from.row === to.row && from.x < to.x) {
            const x1 = from.x + cardWidth, x2 = to.x, y = from.y + cardHeight / 2;
            d = `M ${x1} ${y} L ${x2 - 4} ${y}`; lx = (x1 + x2) / 2; ly = y - 12;
          } else if (from.row < to.row) {
            const x1 = from.x + cardWidth / 2, x2 = to.x + cardWidth / 2, y1 = from.y + cardHeight, y2 = to.y, mid = (y1 + y2) / 2;
            d = `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2 - 4}`; lx = (x1 + x2) / 2; ly = mid - 7;
          } else {
            const y1 = from.y + cardHeight / 2, y2 = to.y + cardHeight / 2;
            d = `M ${from.x} ${y1} C 10 ${y1}, 10 ${y2}, ${to.x - 4} ${y2}`; lx = 16; ly = (y1 + y2) / 2;
          }
          return <g key={index}><path d={d} fill="none" stroke="var(--muted-foreground)" strokeWidth="1.6" markerEnd={`url(#${id}-arrow)`} />{edge.label && <text x={lx} y={ly} textAnchor="middle" fontSize="12" fill="var(--foreground)" paintOrder="stroke" stroke="var(--background)" strokeWidth="5" strokeLinejoin="round">{edge.label}</text>}</g>;
        })}
        {nodes.map(node => {
          const labels = wrap(node.label, 26), descriptions = wrap(node.description ?? "", 31);
          return <g key={node.id}>
            <rect x={node.x} y={node.y} width={cardWidth} height={cardHeight} rx="12" fill="var(--card)" stroke={node.kind === "decision" ? "var(--primary)" : "var(--border)"} strokeWidth={node.kind === "decision" ? 2 : 1} />
            <text x={node.x + 16} y={node.y + 23} fill="var(--muted-foreground)" fontSize="10" fontWeight="600">{node.kind === "decision" ? "CHECK" : node.kind === "success" ? "DONE" : "STEP"}</text>
            {labels.map((line, i) => <text key={i} x={node.x + 16} y={node.y + 47 + i * 18} fill="var(--foreground)" fontSize="14" fontWeight="600">{line}</text>)}
            {descriptions.map((line, i) => <text key={i} x={node.x + 16} y={node.y + 57 + labels.length * 18 + i * 15} fill="var(--muted-foreground)" fontSize="12">{line}</text>)}
          </g>;
        })}
      </svg>
    </div>
  </section>;
}
