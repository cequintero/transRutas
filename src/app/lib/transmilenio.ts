// =====================================================================
// TransRutas Bogotá — Data Layer & Dijkstra Algorithm
// =====================================================================

export interface Station {
  id: string;
  name: string;
  type: 'Portal' | 'Troncal' | 'Alimentador';
  x: number;
  y: number;
  line: 'trunk' | 'feeder';
}

export interface RouteSegment {
  code: string;
  type: 'trunk' | 'feeder' | 'transfer';
  stations: string[];
  time: number;
  duration?: number; // for transfer segments
}

export interface RouteResult {
  id: number;
  label: string;
  labelColor: string;
  labelBg: string;
  duration: number;
  transfers: number;
  congestion: string;
  congestionColor: string;
  segments: RouteSegment[];
  path: { station: string; edge: Edge | null }[];
  departure: string;
}

interface Edge {
  to: string;
  time: number;
  code: string;
  type: 'trunk' | 'feeder';
}

type AdjList = Record<string, Edge[]>;

// =====================================================================
// STATIONS — Real Transmilenio network (simplified)
// =====================================================================
export const STATIONS: Station[] = [
  // Caracas Main Trunk (north → south)
  { id: 'portal_norte', name: 'Portal Norte', type: 'Portal', x: 300, y: 30, line: 'trunk' },
  { id: 'calle_170', name: 'Calle 170', type: 'Troncal', x: 300, y: 75, line: 'trunk' },
  { id: 'calle_146', name: 'Calle 146 (Alcalá)', type: 'Troncal', x: 300, y: 115, line: 'trunk' },
  { id: 'calle_127', name: 'Calle 127', type: 'Troncal', x: 300, y: 155, line: 'trunk' },
  { id: 'calle_100', name: 'Calle 100', type: 'Troncal', x: 300, y: 200, line: 'trunk' },
  { id: 'calle_85', name: 'Calle 85', type: 'Troncal', x: 300, y: 240, line: 'trunk' },
  { id: 'calle_76', name: 'Calle 76', type: 'Troncal', x: 300, y: 270, line: 'trunk' },
  { id: 'calle_72', name: 'Calle 72', type: 'Troncal', x: 300, y: 300, line: 'trunk' },
  { id: 'calle_63', name: 'Calle 63', type: 'Troncal', x: 300, y: 340, line: 'trunk' },
  { id: 'calle_45', name: 'Calle 45', type: 'Troncal', x: 300, y: 380, line: 'trunk' },
  { id: 'av_39', name: 'Avenida 39', type: 'Troncal', x: 300, y: 410, line: 'trunk' },
  { id: 'calle_26', name: 'Calle 26', type: 'Troncal', x: 300, y: 450, line: 'trunk' },
  { id: 'av_jimenez', name: 'Av. Jiménez', type: 'Troncal', x: 300, y: 490, line: 'trunk' },
  { id: 'tercer_milenio', name: 'Tercer Milenio', type: 'Troncal', x: 300, y: 530, line: 'trunk' },
  { id: 'nqs_calle_30s', name: 'NQS Calle 30 Sur', type: 'Troncal', x: 300, y: 570, line: 'trunk' },
  { id: 'portal_sur', name: 'Portal Sur', type: 'Portal', x: 300, y: 620, line: 'trunk' },
  // Suba branch
  { id: 'portal_suba', name: 'Portal Suba', type: 'Portal', x: 100, y: 80, line: 'feeder' },
  { id: 'suba_calle_100', name: 'Suba - Calle 100', type: 'Troncal', x: 140, y: 140, line: 'trunk' },
  { id: 'suba_calle_95', name: 'Calle 95 (Suba)', type: 'Troncal', x: 180, y: 180, line: 'trunk' },
  // Calle 80 branch
  { id: 'portal_80', name: 'Portal 80', type: 'Portal', x: 100, y: 270, line: 'trunk' },
  { id: 'av_68', name: 'Avenida 68', type: 'Troncal', x: 180, y: 300, line: 'trunk' },
  // Américas branch
  { id: 'portal_americas', name: 'Portal Américas', type: 'Portal', x: 100, y: 480, line: 'trunk' },
  { id: 'banderas', name: 'Banderas', type: 'Troncal', x: 170, y: 500, line: 'trunk' },
  // Calle 26 / El Dorado
  { id: 'portal_eldorado', name: 'Portal El Dorado', type: 'Portal', x: 100, y: 400, line: 'trunk' },
  { id: 'modelia', name: 'Modelia', type: 'Troncal', x: 170, y: 420, line: 'trunk' },
  // 20 de Julio
  { id: 'portal_20julio', name: 'Portal 20 de Julio', type: 'Portal', x: 500, y: 520, line: 'trunk' },
  { id: 'country_sur', name: 'Country Sur', type: 'Troncal', x: 430, y: 510, line: 'trunk' },
  // Tunal
  { id: 'portal_tunal', name: 'Portal Tunal', type: 'Portal', x: 500, y: 620, line: 'trunk' },
  { id: 'general_santander', name: 'General Santander', type: 'Troncal', x: 430, y: 590, line: 'trunk' },
  // Usme feeder
  { id: 'usme', name: 'Usme', type: 'Alimentador', x: 520, y: 680, line: 'feeder' },
  // NQS branch
  { id: 'museo_nacional', name: 'Museo Nacional', type: 'Troncal', x: 400, y: 450, line: 'trunk' },
  { id: 'nqs_calle_45', name: 'NQS Calle 45', type: 'Troncal', x: 420, y: 380, line: 'trunk' },
  { id: 'calle_22', name: 'Calle 22', type: 'Troncal', x: 400, y: 490, line: 'trunk' },
  { id: 'ricaurte', name: 'Ricaurte', type: 'Troncal', x: 380, y: 520, line: 'trunk' },
];

// Station lookup
export const stationMap: Record<string, Station> = {};
STATIONS.forEach((s) => { stationMap[s.id] = s; });

// =====================================================================
// GRAPH EDGES — [from, to, baseTimeMinutes, routeCode, routeType]
// =====================================================================
export const EDGES: [string, string, number, string, 'trunk' | 'feeder'][] = [
  // Caracas trunk
  ['portal_norte', 'calle_170', 5, 'B13', 'trunk'],
  ['calle_170', 'calle_146', 4, 'B13', 'trunk'],
  ['calle_146', 'calle_127', 4, 'B13', 'trunk'],
  ['calle_127', 'calle_100', 5, 'B13', 'trunk'],
  ['calle_100', 'calle_85', 4, 'B13', 'trunk'],
  ['calle_85', 'calle_76', 3, 'B13', 'trunk'],
  ['calle_76', 'calle_72', 2, 'B13', 'trunk'],
  ['calle_72', 'calle_63', 4, 'B13', 'trunk'],
  ['calle_63', 'calle_45', 4, 'H13', 'trunk'],
  ['calle_45', 'av_39', 3, 'H13', 'trunk'],
  ['av_39', 'calle_26', 4, 'H13', 'trunk'],
  ['calle_26', 'av_jimenez', 3, 'H13', 'trunk'],
  ['av_jimenez', 'tercer_milenio', 3, 'K10', 'trunk'],
  ['tercer_milenio', 'nqs_calle_30s', 5, 'K10', 'trunk'],
  ['nqs_calle_30s', 'portal_sur', 6, 'K10', 'trunk'],
  // Suba
  ['portal_suba', 'suba_calle_100', 8, 'A3-2', 'feeder'],
  ['suba_calle_100', 'suba_calle_95', 4, 'C26', 'trunk'],
  ['suba_calle_95', 'calle_100', 6, 'C26', 'trunk'],
  // Calle 80
  ['portal_80', 'av_68', 7, 'D70', 'trunk'],
  ['av_68', 'calle_72', 6, 'D70', 'trunk'],
  // Américas
  ['portal_americas', 'banderas', 5, 'F14', 'trunk'],
  ['banderas', 'nqs_calle_30s', 8, 'F14', 'trunk'],
  // El Dorado
  ['portal_eldorado', 'modelia', 5, 'J24', 'trunk'],
  ['modelia', 'calle_26', 10, 'J24', 'trunk'],
  // Cross-connections
  ['calle_100', 'suba_calle_95', 6, 'C26', 'trunk'],
  ['calle_72', 'av_68', 6, 'D70', 'trunk'],
  // NQS branch
  ['calle_45', 'nqs_calle_45', 5, 'G12', 'trunk'],
  ['nqs_calle_45', 'museo_nacional', 4, 'G12', 'trunk'],
  ['museo_nacional', 'calle_22', 3, 'G12', 'trunk'],
  ['calle_22', 'ricaurte', 3, 'G12', 'trunk'],
  ['ricaurte', 'tercer_milenio', 4, 'G12', 'trunk'],
  // 20 de Julio
  ['av_jimenez', 'country_sur', 7, 'L11', 'trunk'],
  ['country_sur', 'portal_20julio', 5, 'L11', 'trunk'],
  // Tunal
  ['nqs_calle_30s', 'general_santander', 6, 'M15', 'trunk'],
  ['general_santander', 'portal_tunal', 5, 'M15', 'trunk'],
  // Usme feeder
  ['portal_tunal', 'usme', 12, 'AL-1', 'feeder'],
  // Express alternatives
  ['portal_norte', 'calle_127', 8, 'B23', 'trunk'],
  ['calle_127', 'calle_72', 10, 'B23', 'trunk'],
  ['portal_norte', 'calle_100', 12, 'B74', 'trunk'],
];

// =====================================================================
// CONGESTION HELPERS
// =====================================================================
const CONGESTION_PROFILE: Record<number, number> = {
  5: 0.5, 6: 0.8, 7: 1.5, 8: 1.4, 9: 1.1, 10: 0.8, 11: 0.7,
  12: 0.9, 13: 0.8, 14: 0.7, 15: 0.8, 16: 1.0, 17: 1.4,
  18: 1.6, 19: 1.3, 20: 1.0, 21: 0.7, 22: 0.6, 23: 0.5,
};

export function getCongestionMultiplier(hour: number): number {
  return CONGESTION_PROFILE[Math.max(5, Math.min(23, hour))] ?? 0.8;
}

export function getCongestionLevel(mult: number): string {
  if (mult >= 1.3) return 'Alta';
  if (mult >= 0.9) return 'Media';
  return 'Baja';
}

export function getCongestionColor(level: string): string {
  if (level === 'Alta') return 'var(--alert-red)';
  if (level === 'Media') return 'var(--warm-amber)';
  return 'var(--fresh-green)';
}

export function getCongestionHex(level: string): string {
  if (level === 'Alta') return '#E53935';
  if (level === 'Media') return '#F4A825';
  return '#0D9F4F';
}

// =====================================================================
// DIJKSTRA ALGORITHM
// =====================================================================
function buildAdjacency(hour: number): AdjList {
  const adj: AdjList = {};
  STATIONS.forEach((s) => { adj[s.id] = []; });
  const mult = getCongestionMultiplier(hour);

  EDGES.forEach(([from, to, baseTime, code, type]) => {
    const noise = 0.85 + Math.random() * 0.3;
    const time = Math.max(1, Math.round(baseTime * mult * noise));
    adj[from].push({ to, time, code, type });
    adj[to].push({ to: from, time, code, type });
  });

  return adj;
}

function dijkstra(
  adj: AdjList,
  start: string,
  end: string,
  weightFn: (edge: Edge, prevEdge: Edge | null) => number
) {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const edgeUsed: Record<string, Edge | null> = {};
  const visited = new Set<string>();

  STATIONS.forEach((s) => {
    dist[s.id] = Infinity;
    prev[s.id] = null;
    edgeUsed[s.id] = null;
  });
  dist[start] = 0;

  while (true) {
    let u: string | null = null;
    let best = Infinity;
    for (const sid in dist) {
      if (!visited.has(sid) && dist[sid] < best) {
        best = dist[sid];
        u = sid;
      }
    }
    if (!u || u === end) break;
    visited.add(u);

    for (const edge of adj[u]) {
      const w = weightFn(edge, edgeUsed[u]);
      const alt = dist[u] + w;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = u;
        edgeUsed[edge.to] = edge;
      }
    }
  }

  if (dist[end] === Infinity) return null;

  const path: { station: string; edge: Edge | null }[] = [];
  let cur: string | null = end;
  while (cur) {
    path.unshift({ station: cur, edge: edgeUsed[cur] });
    cur = prev[cur];
  }

  return { path, totalTime: dist[end] };
}

// =====================================================================
// FIND ROUTES — Main entry point
// =====================================================================
export function findRoutes(
  originId: string,
  destinationId: string,
  hour: number
): RouteResult[] {
  const adj = buildAdjacency(hour);
  const mult = getCongestionMultiplier(hour);

  // 3 strategies
  const fastest = dijkstra(adj, originId, destinationId, (edge) => edge.time);
  const fewestTransfers = dijkstra(adj, originId, destinationId, (edge, prevEdge) => {
    const penalty = prevEdge && prevEdge.code !== edge.code ? 15 : 0;
    return edge.time + penalty;
  });
  const lowCongestion = dijkstra(adj, originId, destinationId, (edge) => {
    const congPenalty = mult > 1.2 && edge.type === 'trunk' ? 5 : 0;
    return edge.time + congPenalty;
  });

  const strategies = [
    { result: fastest, label: '🏆 Más rápida', color: 'var(--fresh-green)', bg: 'var(--mint-wash)' },
    { result: fewestTransfers, label: '🔀 Menos transbordos', color: 'var(--transit-blue)', bg: 'var(--sky-mist)' },
    { result: lowCongestion, label: '📊 Menos congestión', color: 'var(--charcoal)', bg: 'var(--snow-white)' },
  ];

  const routes: RouteResult[] = [];
  const seen = new Set<string>();

  strategies.forEach(({ result, label, color, bg }) => {
    if (!result) return;
    const key = result.path.map((p) => p.station).join('-');
    if (seen.has(key)) return;
    seen.add(key);

    // Build segments
    const segments: RouteSegment[] = [];
    let currentCode: string | null = null;
    let segStations: string[] = [];
    let transfers = 0;

    result.path.forEach((p, i) => {
      if (i === 0) {
        segStations = [p.station];
        return;
      }
      if (p.edge && p.edge.code !== currentCode && currentCode !== null) {
        segments.push({
          code: currentCode,
          type: result.path[i - 1].edge?.type || 'trunk',
          stations: [...segStations],
          time: 0,
        });
        segments.push({
          code: '',
          type: 'transfer',
          stations: [],
          time: 0,
          duration: Math.round(2 + Math.random() * 4),
        });
        transfers++;
        segStations = [result.path[i - 1].station];
      }
      currentCode = p.edge?.code || currentCode;
      segStations.push(p.station);
    });

    if (segStations.length > 1 && currentCode) {
      segments.push({
        code: currentCode,
        type: result.path[result.path.length - 1].edge?.type || 'trunk',
        stations: segStations,
        time: 0,
      });
    }

    // Calc segment times
    segments.forEach((seg) => {
      if (seg.type === 'transfer') return;
      seg.time = seg.stations.reduce((sum, _, i) => {
        if (i === 0) return 0;
        const found = result.path.find((p) => p.station === seg.stations[i]);
        return sum + (found?.edge?.time || 3);
      }, 0);
    });

    const congLevel = getCongestionLevel(mult);

    routes.push({
      id: routes.length + 1,
      label,
      labelColor: color,
      labelBg: bg,
      duration: result.totalTime,
      transfers,
      congestion: congLevel,
      congestionColor: getCongestionColor(congLevel),
      segments,
      path: result.path,
      departure: `${hour}:${String(Math.floor(Math.random() * 50 + 5)).padStart(2, '0')}`,
    });
  });

  return routes;
}

// =====================================================================
// STATION HELPERS
// =====================================================================
export function getStationConnections(stationId: string) {
  return EDGES.filter((e) => e[0] === stationId || e[1] === stationId).map((e) => ({
    id: e[0] === stationId ? e[1] : e[0],
    name: stationMap[e[0] === stationId ? e[1] : e[0]]?.name || '',
    time: e[2],
    code: e[3],
    type: e[4],
  }));
}

export function getStationRoutes(stationId: string): string[] {
  const connections = getStationConnections(stationId);
  return [...new Set(connections.map((c) => c.code))];
}

export function filterStations(query: string): Station[] {
  if (!query) return [];
  return STATIONS.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 7);
}
