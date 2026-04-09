import { useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';
import { buildApiUrl } from './config';
import type { DesireCacheItem, DesireCachePayload, SkillTreeNodeData } from './types';

const SECTION_ALIASES: Record<string, string> = {
  perks: 'Perk Injector',
  comfort: 'Comfort Daemon',
  style: 'Shell Mods',
  setup: 'Rig Matrix'
};

const SECTION_COLORS = ['#7dd3fc', '#c084fc', '#fb7185', '#4ade80', '#f59e0b', '#2dd4bf'];

function sectionLabelFor(section: string) {
  return SECTION_ALIASES[section.toLowerCase()] ?? section;
}

function branchLabelFor(item: DesireCacheItem) {
  const subsection = item.subsection?.trim();
  if (subsection) return subsection;

  const source = item.source?.trim();
  if (source) return source;

  return 'Unsorted Branch';
}

function itemTitle(item: DesireCacheItem) {
  return item.titleOverride?.trim() || item.title?.trim() || item.fetchedTitle?.trim() || 'Unknown node';
}

function itemDescription(item: DesireCacheItem) {
  return item.description?.trim() || item.fetchedDescription?.trim() || 'No dossier text yet.';
}

function buildGraph(items: DesireCacheItem[]) {
  const nodes: Node<SkillTreeNodeData>[] = [];
  const edges: Edge[] = [];

  const sectionMap = new Map<string, Map<string, DesireCacheItem[]>>();

  for (const item of items) {
    const section = item.section?.trim() || 'Misc';
    const branch = branchLabelFor(item);

    if (!sectionMap.has(section)) sectionMap.set(section, new Map());
    const branchMap = sectionMap.get(section)!;
    if (!branchMap.has(branch)) branchMap.set(branch, []);
    branchMap.get(branch)!.push(item);
  }

  Array.from(sectionMap.entries()).forEach(([section, branches], sectionIndex) => {
    const color = SECTION_COLORS[sectionIndex % SECTION_COLORS.length];
    const sectionId = `section:${section}`;
    const sectionX = sectionIndex * 420;
    const sectionY = 80 + (sectionIndex % 2) * 120;

    nodes.push({
      id: sectionId,
      position: { x: sectionX, y: sectionY },
      data: {
        item: {
          id: sectionId,
          url: '',
          title: sectionLabelFor(section),
          titleOverride: '',
          fetchedTitle: '',
          description: `${branches.size} branches`,
          fetchedDescription: '',
          image: '',
          section,
          subsection: '',
          priority: '',
          size: '',
          manualPrice: '',
          lastSeenPrice: '',
          effectivePrice: '',
          sale: false,
          saleOverride: false,
          amazon: false,
          source: '',
          status: 'section',
          hasMetadataError: false,
          metadataError: '',
          lastFetchedAt: ''
        },
        branchLabel: '',
        sectionLabel: sectionLabelFor(section)
      },
      style: {
        background: `radial-gradient(circle at top, ${color}55, #0b1020)`,
        color: '#f5f7ff',
        border: `1px solid ${color}`,
        borderRadius: '18px',
        width: 210,
        boxShadow: `0 0 30px ${color}33`
      }
    });

    Array.from(branches.entries()).forEach(([branch, branchItems], branchIndex) => {
      const branchId = `branch:${section}:${branch}`;
      const branchX = sectionX + 220 + (branchIndex % 2) * 180;
      const branchY = sectionY + branchIndex * 180 + 40;

      nodes.push({
        id: branchId,
        position: { x: branchX, y: branchY },
        data: {
          item: {
            id: branchId,
            url: '',
            title: branch,
            titleOverride: '',
            fetchedTitle: '',
            description: `${branchItems.length} nodes`,
            fetchedDescription: '',
            image: '',
            section,
            subsection: branch,
            priority: '',
            size: '',
            manualPrice: '',
            lastSeenPrice: '',
            effectivePrice: '',
            sale: false,
            saleOverride: false,
            amazon: false,
            source: '',
            status: 'branch',
            hasMetadataError: false,
            metadataError: '',
            lastFetchedAt: ''
          },
          branchLabel: branch,
          sectionLabel: sectionLabelFor(section)
        },
        style: {
          background: '#12182a',
          color: '#dbe4ff',
          border: `1px solid ${color}99`,
          borderRadius: '999px',
          width: 180,
          boxShadow: '0 10px 30px rgba(0,0,0,0.28)'
        }
      });

      edges.push({
        id: `edge:${sectionId}:${branchId}`,
        source: sectionId,
        target: branchId,
        animated: true,
        style: { stroke: color, strokeWidth: 2, opacity: 0.7 }
      });

      branchItems.forEach((item, itemIndex) => {
        const nodeId = `item:${item.id}`;
        const nodeX = branchX + 220 + (itemIndex % 3) * 170;
        const nodeY = branchY + Math.floor(itemIndex / 3) * 130 - (itemIndex % 2) * 24;

        nodes.push({
          id: nodeId,
          position: { x: nodeX, y: nodeY },
          data: {
            item,
            branchLabel: branch,
            sectionLabel: sectionLabelFor(section)
          },
          style: {
            background: '#0c1324',
            color: '#f8fbff',
            border: `1px solid ${color}66`,
            borderRadius: '16px',
            width: 160,
            padding: '8px 10px',
            boxShadow: '0 12px 28px rgba(0,0,0,0.32)'
          }
        });

        edges.push({
          id: `edge:${branchId}:${nodeId}`,
          source: branchId,
          target: nodeId,
          style: { stroke: color, strokeWidth: 1.5, opacity: 0.55 }
        });
      });
    });
  });

  return { nodes, edges };
}

function App() {
  const [payload, setPayload] = useState<DesireCachePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DesireCacheItem | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(buildApiUrl('/api/items'), { signal: controller.signal });
        if (!response.ok) throw new Error(`API request failed with ${response.status}`);
        const nextPayload = (await response.json()) as DesireCachePayload;
        setPayload(nextPayload);
        setSelectedItem(nextPayload.items[0] ?? null);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unknown Desire Cache API failure');
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const graph = useMemo(() => buildGraph(payload?.items ?? []), [payload]);

  return (
    <ReactFlowProvider>
      <main className="app-shell">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Desire Cache React Pivot</p>
            <h1>Game-space skill tree prototype</h1>
            <p className="lede">
              React Flow first, Beautiful Skill Tree available as a secondary reference, canonical data still from /api/items.
            </p>
          </div>
          <div className="stats-strip">
            <span>{payload?.totalItems ?? 0} nodes</span>
            <span>{payload?.sections.length ?? 0} sections</span>
            <span>{error ? 'feed degraded' : 'feed nominal'}</span>
          </div>
        </section>

        <section className="workspace-panel">
          <div className="flow-panel">
            {error ? (
              <div className="state-panel error">{error}</div>
            ) : (
              <ReactFlow
                nodes={graph.nodes}
                edges={graph.edges}
                fitView
                onNodeClick={(_, node) => setSelectedItem(node.data.item as DesireCacheItem)}
                minZoom={0.25}
                maxZoom={1.4}
                proOptions={{ hideAttribution: true }}
              >
                <MiniMap pannable zoomable />
                <Controls />
                <Background color="#1f2a44" gap={32} />
              </ReactFlow>
            )}
          </div>

          <aside className="detail-panel">
            {selectedItem ? (
              <>
                <p className="detail-kicker">{sectionLabelFor(selectedItem.section || 'Misc')}</p>
                <h2>{itemTitle(selectedItem)}</h2>
                <p className="detail-copy">{itemDescription(selectedItem)}</p>
                <dl>
                  <div>
                    <dt>Branch</dt>
                    <dd>{branchLabelFor(selectedItem)}</dd>
                  </div>
                  <div>
                    <dt>Price</dt>
                    <dd>{selectedItem.effectivePrice || selectedItem.manualPrice || 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>{selectedItem.source || 'Unknown'}</dd>
                  </div>
                </dl>
                {selectedItem.url ? (
                  <a className="action-link" href={selectedItem.url} target="_blank" rel="noreferrer">
                    Open item dossier
                  </a>
                ) : null}
              </>
            ) : (
              <div className="state-panel">Select a node to inspect its dossier.</div>
            )}
          </aside>
        </section>
      </main>
    </ReactFlowProvider>
  );
}

export default App;
