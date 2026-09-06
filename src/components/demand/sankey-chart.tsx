"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  SankeyColumn,
  SankeyData,
  SankeyLink,
  SankeyNode,
} from "@/lib/customs/demand";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useDemandFormat } from "./format";

import { brand } from "@/theme";

const COLUMN_ACCENT: Record<SankeyColumn, string> = {
  country: brand.purple,
  chapter: brand.green,
  port: brand.blue,
  city: brand.sky,
};

const VIEW_W = 960;
const VIEW_H = 460;
const NODE_W = 12;
const PAD_Y = 8;
const PAD_X = 108;
const NODE_GAP = 6;
const HEADER_H = 22;

type LaidOutNode = SankeyNode & {
  x: number;
  y: number;
  height: number;
};

type LaidOutLink = SankeyLink & {
  path: string;
  width: number;
  sourceColor: string;
};

function layout(
  data: SankeyData
): { nodes: LaidOutNode[]; links: LaidOutLink[] } {
  const columns = data.columns;
  if (columns.length === 0 || data.nodes.length === 0) {
    return { nodes: [], links: [] };
  }

  const usableH = VIEW_H - HEADER_H - PAD_Y * 2;
  const colXs = columns.map((_, i) => {
    if (columns.length === 1) return VIEW_W / 2 - NODE_W / 2;
    const span = VIEW_W - PAD_X * 2 - NODE_W;
    return PAD_X + (span * i) / (columns.length - 1);
  });

  const byCol = new Map<SankeyColumn, SankeyNode[]>();
  for (const col of columns) byCol.set(col, []);
  for (const node of data.nodes) {
    byCol.get(node.column)?.push(node);
  }

  const laidNodes: LaidOutNode[] = [];
  const nodeMap = new Map<string, LaidOutNode>();

  columns.forEach((col, colIndex) => {
    const members = byCol.get(col) ?? [];
    const totalKg = members.reduce((acc, n) => acc + n.kg, 0);
    const gapTotal = Math.max(0, members.length - 1) * NODE_GAP;
    const scale = totalKg > 0 ? (usableH - gapTotal) / totalKg : 0;

    let y = HEADER_H + PAD_Y;
    for (const node of members) {
      const height = Math.max(node.kg * scale, 2);
      const laid: LaidOutNode = {
        ...node,
        x: colXs[colIndex],
        y,
        height,
      };
      laidNodes.push(laid);
      nodeMap.set(node.id, laid);
      y += height + NODE_GAP;
    }
  });

  // Barycenter pass to reduce crossings between adjacent columns.
  for (let pass = 0; pass < 2; pass++) {
    for (let c = 1; c < columns.length; c++) {
      const col = columns[c];
      const members = laidNodes.filter((n) => n.column === col);
      const scores = new Map<string, number>();
      for (const node of members) {
        let weighted = 0;
        let weight = 0;
        for (const link of data.links) {
          if (link.target !== node.id) continue;
          const source = nodeMap.get(link.source);
          if (!source) continue;
          weighted += (source.y + source.height / 2) * link.kg;
          weight += link.kg;
        }
        scores.set(node.id, weight > 0 ? weighted / weight : node.y);
      }
      members.sort((a, b) => {
        const aOther = a.id.endsWith(":__other__");
        const bOther = b.id.endsWith(":__other__");
        if (aOther !== bOther) return aOther ? 1 : -1;
        return (scores.get(a.id) ?? 0) - (scores.get(b.id) ?? 0);
      });
      let y = HEADER_H + PAD_Y;
      for (const node of members) {
        node.y = y;
        y += node.height + NODE_GAP;
      }
    }
  }

  const links: LaidOutLink[] = [];
  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();

  const linksBySource = [...data.links].sort((a, b) => {
    const sa = nodeMap.get(a.source);
    const sb = nodeMap.get(b.source);
    const ta = nodeMap.get(a.target);
    const tb = nodeMap.get(b.target);
    const dy =
      (sa ? sa.y + sa.height / 2 : 0) - (sb ? sb.y + sb.height / 2 : 0);
    if (dy !== 0) return dy;
    return (ta ? ta.y : 0) - (tb ? tb.y : 0);
  });

  for (const link of linksBySource) {
    const source = nodeMap.get(link.source);
    const target = nodeMap.get(link.target);
    if (!source || !target) continue;

    const sourceScale = source.kg > 0 ? source.height / source.kg : 0;
    const targetScale = target.kg > 0 ? target.height / target.kg : 0;
    const thickness = Math.max(link.kg * sourceScale, 1);

    const sy0 = source.y + (sourceOffsets.get(source.id) ?? 0);
    const ty0 = target.y + (targetOffsets.get(target.id) ?? 0);
    sourceOffsets.set(
      source.id,
      (sourceOffsets.get(source.id) ?? 0) + link.kg * sourceScale
    );
    targetOffsets.set(
      target.id,
      (targetOffsets.get(target.id) ?? 0) + link.kg * targetScale
    );

    const x0 = source.x + NODE_W;
    const x1 = target.x;
    const cx = (x0 + x1) / 2;

    const path = [
      `M${x0},${sy0}`,
      `C${cx},${sy0} ${cx},${ty0} ${x1},${ty0}`,
      `L${x1},${ty0 + thickness}`,
      `C${cx},${ty0 + thickness} ${cx},${sy0 + thickness} ${x0},${sy0 + thickness}`,
      "Z",
    ].join(" ");

    links.push({
      ...link,
      path,
      width: thickness,
      sourceColor: COLUMN_ACCENT[source.column],
    });
  }

  return { nodes: laidNodes, links };
}

function shortLabel(text: string, max = 18): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function SankeyChart({
  locale,
  data,
  flow,
  activeCode,
  onSelectCountry,
}: {
  locale: Locale;
  data: SankeyData;
  flow: "import" | "export";
  activeCode?: string | null;
  onSelectCountry?: (code: string | null) => void;
}) {
  const t = useTranslations("DemandPage");
  const fmt = useDemandFormat(locale);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hoverLink, setHoverLink] = useState<string | null>(null);

  const { nodes, links } = useMemo(() => layout(data), [data]);

  const related = useMemo(() => {
    if (!hoverId && !hoverLink) return null;
    const ids = new Set<string>();
    const linkKeys = new Set<string>();
    if (hoverId) {
      ids.add(hoverId);
      for (const link of links) {
        if (link.source === hoverId || link.target === hoverId) {
          ids.add(link.source);
          ids.add(link.target);
          linkKeys.add(`${link.source}>${link.target}`);
        }
      }
    }
    if (hoverLink) {
      linkKeys.add(hoverLink);
      const [s, tg] = hoverLink.split(">");
      ids.add(s);
      ids.add(tg);
    }
    return { ids, linkKeys };
  }, [hoverId, hoverLink, links]);

  const columnTitle = (column: SankeyColumn) => {
    switch (column) {
      case "country":
        return flow === "import"
          ? t("sankeyColCountryImport")
          : t("sankeyColCountryExport");
      case "chapter":
        return t("sankeyColChapter");
      case "port":
        return flow === "import"
          ? t("sankeyColPortImport")
          : t("sankeyColPortExport");
      case "city":
        return t("sankeyColCity");
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border border-border/80 bg-card/85 p-4 backdrop-blur-md sm:p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("sankeyTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {flow === "import"
              ? t("sankeySubtitleImport")
              : t("sankeySubtitleExport")}
          </p>
        </div>
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t("emptyState")}
        </p>
      </div>
    );
  }

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border/80 bg-card/85 p-4 backdrop-blur-md sm:p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          {t("sankeyTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {flow === "import"
            ? t("sankeySubtitleImport")
            : t("sankeySubtitleExport")}
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full min-w-[40rem]"
          role="img"
          aria-label={t("sankeyTitle")}
        >
          {data.columns.map((column, i) => {
            const x =
              data.columns.length === 1
                ? VIEW_W / 2
                : PAD_X +
                  NODE_W / 2 +
                  ((VIEW_W - PAD_X * 2 - NODE_W) * i) /
                    (data.columns.length - 1);
            return (
              <text
                key={column}
                x={x}
                y={14}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] font-medium"
              >
                {columnTitle(column)}
              </text>
            );
          })}

          {links.map((link) => {
            const key = `${link.source}>${link.target}`;
            const dimmed = related !== null && !related.linkKeys.has(key);
            return (
              <path
                key={key}
                d={link.path}
                fill={link.sourceColor}
                fillOpacity={dimmed ? 0.06 : 0.28}
                className="transition-opacity duration-150"
                onMouseEnter={() => {
                  setHoverLink(key);
                  setHoverId(null);
                }}
                onMouseLeave={() => setHoverLink(null)}
              >
                <title>
                  {`${fmt.name(nodeById.get(link.source)!.label)} → ${fmt.name(nodeById.get(link.target)!.label)}: ${fmt.weight(link.kg)}`}
                </title>
              </path>
            );
          })}

          {nodes.map((node) => {
            const isActive = Boolean(
              activeCode && node.code && node.code === activeCode
            );
            const dimmed = related !== null && !related.ids.has(node.id);
            const clickable = Boolean(onSelectCountry && node.code);
            const labelSide =
              node.column === data.columns[0] ? "left" : "right";
            const labelX =
              labelSide === "left" ? node.x - 8 : node.x + NODE_W + 8;
            const color = COLUMN_ACCENT[node.column];

            return (
              <g
                key={node.id}
                className={cn(
                  "transition-opacity duration-150",
                  dimmed && "opacity-25"
                )}
                onMouseEnter={() => {
                  setHoverId(node.id);
                  setHoverLink(null);
                }}
                onMouseLeave={() => setHoverId(null)}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_W}
                  height={node.height}
                  rx={3}
                  fill={color}
                  stroke={isActive ? "currentColor" : "transparent"}
                  strokeWidth={isActive ? 1.5 : 0}
                  className={cn(clickable && "cursor-pointer")}
                  onClick={() => {
                    if (!clickable || !node.code) return;
                    onSelectCountry?.(isActive ? null : node.code);
                  }}
                >
                  <title>
                    {`${fmt.name(node.label)}: ${fmt.weight(node.kg)}`}
                  </title>
                </rect>
                <text
                  x={labelX}
                  y={node.y + node.height / 2}
                  dy="0.35em"
                  textAnchor={labelSide === "left" ? "end" : "start"}
                  className={cn(
                    "fill-foreground text-[11px]",
                    clickable && "cursor-pointer"
                  )}
                  onClick={() => {
                    if (!clickable || !node.code) return;
                    onSelectCountry?.(isActive ? null : node.code);
                  }}
                >
                  {node.flag ? `${node.flag} ` : ""}
                  {shortLabel(fmt.name(node.label))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {(hoverId || hoverLink) && (
        <p className="text-xs text-muted-foreground">
          {hoverLink
            ? (() => {
                const [s, tg] = hoverLink.split(">");
                const source = nodeById.get(s);
                const target = nodeById.get(tg);
                const link = links.find(
                  (l) => l.source === s && l.target === tg
                );
                if (!source || !target || !link) return null;
                return t("sankeyHoverLink", {
                  source: fmt.name(source.label),
                  target: fmt.name(target.label),
                  weight: fmt.weight(link.kg),
                });
              })()
            : (() => {
                const node = nodeById.get(hoverId!);
                if (!node) return null;
                return t("sankeyHoverNode", {
                  name: fmt.name(node.label),
                  weight: fmt.weight(node.kg),
                });
              })()}
        </p>
      )}
    </section>
  );
}
