import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { buildApiUrl } from './config';
import type { DesireCacheItem, DesireCachePayload } from './types';

const SECTION_THEMES: Record<string, { label: string; kicker: string; glyph: string; color: string }> = {
  perks: { label: 'Perk Injector', kicker: 'Augment lattice', glyph: 'PI', color: '#7dd3fc' },
  comfort: { label: 'Comfort Daemon', kicker: 'Lifestyle shell', glyph: 'CD', color: '#4ade80' },
  style: { label: 'Shell Mods', kicker: 'Body rig', glyph: 'SM', color: '#fb7185' },
  setup: { label: 'Rig Matrix', kicker: 'Hardware field', glyph: 'RM', color: '#f59e0b' }
};

const FALLBACK_SECTION_COLORS = ['#7dd3fc', '#c084fc', '#fb7185', '#4ade80', '#f59e0b', '#2dd4bf'];

type SortMode = 'priority' | 'price' | 'title';
type ViewMode = 'dense' | 'compact';
type DossierPlacement = 'above' | 'below' | 'center';

function normalizeSection(section: string) {
  return section?.trim() || 'Misc';
}

function humanizeLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function sectionMetaFor(section: string, index = 0) {
  const normalized = normalizeSection(section);
  const key = normalized.toLowerCase();
  const theme = SECTION_THEMES[key];

  if (theme) {
    return {
      id: normalized,
      label: theme.label,
      kicker: theme.kicker,
      glyph: theme.glyph,
      color: theme.color
    };
  }

  const words = humanizeLabel(normalized);
  const glyph = words
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();

  return {
    id: normalized,
    label: words,
    kicker: 'Archive sector',
    glyph: glyph || 'DC',
    color: FALLBACK_SECTION_COLORS[index % FALLBACK_SECTION_COLORS.length]
  };
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

function itemPrice(item: DesireCacheItem) {
  return item.effectivePrice || item.manualPrice || item.lastSeenPrice || 'Unknown';
}

function priceValue(item: DesireCacheItem) {
  const match = itemPrice(item).replace(/,/g, '').match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function itemTypeLabel(item: DesireCacheItem) {
  if (item.priority?.trim()) return item.priority;
  if (item.sale) return 'SALE';
  if (item.priceChanged) return 'SHIFT';
  return item.amazon ? 'AMAZON' : 'STASH';
}

function statusLabel(item: DesireCacheItem) {
  if (item.priority === 'HOT') return 'High signal';
  if (item.sale || item.priority === 'SALE') return 'Discount live';
  if (item.priceChanged) return 'Price shifted';
  return 'Nominal';
}

function priorityRank(item: DesireCacheItem) {
  if (item.priority === 'HOT') return 0;
  if (item.sale || item.priority === 'SALE') return 1;
  if (item.priceChanged) return 2;
  return 3;
}

function normalizeSearchValue(item: DesireCacheItem) {
  return [
    itemTitle(item),
    itemDescription(item),
    normalizeSection(item.section),
    branchLabelFor(item),
    item.source,
    item.size,
    itemTypeLabel(item)
  ]
    .join(' ')
    .toLowerCase();
}

function itemAccentClass(item: DesireCacheItem) {
  if (item.priority === 'HOT') return 'is-hot';
  if (item.sale || item.priority === 'SALE') return 'is-sale';
  if (item.priceChanged) return 'is-shift';
  return 'is-normal';
}

function sortItems(items: DesireCacheItem[], sortMode: SortMode) {
  const next = [...items];

  next.sort((a, b) => {
    if (sortMode === 'title') return itemTitle(a).localeCompare(itemTitle(b));
    if (sortMode === 'price') return priceValue(a) - priceValue(b) || itemTitle(a).localeCompare(itemTitle(b));

    const priorityDelta = priorityRank(a) - priorityRank(b);
    if (priorityDelta !== 0) return priorityDelta;
    return itemTitle(a).localeCompare(itemTitle(b));
  });

  return next;
}

function groupByBranch(items: DesireCacheItem[], sortMode: SortMode) {
  const map = new Map<string, DesireCacheItem[]>();

  for (const item of items) {
    const branch = branchLabelFor(item);
    if (!map.has(branch)) map.set(branch, []);
    map.get(branch)!.push(item);
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([branch, branchItems]) => [branch, sortItems(branchItems, sortMode)] as const);
}

function relatedItemsFor(selectedItem: DesireCacheItem | null, items: DesireCacheItem[]) {
  if (!selectedItem) return [];

  const sameBranch = items.filter(
    (item) => item.id !== selectedItem.id && branchLabelFor(item) === branchLabelFor(selectedItem)
  );

  return sortItems(sameBranch, 'priority').slice(0, 3);
}

function shortTitle(value: string, max = 44) {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

function useIsMobile(breakpoint = 980) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [breakpoint]);

  return isMobile;
}

function usePositionedDossier(active: boolean, targetRef: React.RefObject<HTMLElement | null>) {
  const [placement, setPlacement] = useState<DossierPlacement>('below');

  useEffect(() => {
    if (!active) return;

    const updatePosition = () => {
      if (!targetRef.current || typeof window === 'undefined') return;

      const targetRect = targetRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const estimatedHeight = Math.min(360, viewportHeight * 0.6);
      const margin = 18;
      const spaceAbove = targetRect.top - margin;
      const spaceBelow = viewportHeight - targetRect.bottom - margin;

      if (spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove) {
        setPlacement('below');
        return;
      }

      if (spaceAbove >= estimatedHeight) {
        setPlacement('above');
        return;
      }

      setPlacement('center');
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [active, targetRef]);

  return placement;
}

function DossierOverlay({
  item,
  branch,
  sectionColor,
  locked,
  relatedItems,
  onClose,
  onSelectRelated,
  placement,
  mobile,
  hoveredItemPos
}: {
  item: DesireCacheItem;
  branch: string;
  sectionColor: string;
  locked: boolean;
  relatedItems: DesireCacheItem[];
  onClose: () => void;
  onSelectRelated: (item: DesireCacheItem) => void;
  placement: DossierPlacement;
  mobile: boolean;
  hoveredItemPos?: { x: number; y: number };
}) {
  // Smart positioning: open TOWARD center of screen
  const getOverlayStyle = () => {
    if (!hoveredItemPos) return {};
    const { x, y } = hoveredItemPos;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const overlayWidth = 520;
    const overlayHeight = 300;
    const padding = 20;

    // Horizontal: open TOWARD center
    const center = viewportWidth / 2;
    let left = x < center ? x + padding : x - overlayWidth - padding;
    // Clamp to viewport
    if (left + overlayWidth + padding > viewportWidth) left = viewportWidth - overlayWidth - padding;
    if (left - padding < 0) left = padding;

    // Vertical: show above or below based on space
    const spaceAbove = y - padding;
    const spaceBelow = viewportHeight - y - padding;
    let top = spaceAbove > overlayHeight ? y - overlayHeight - padding : y + padding;
    if (spaceBelow > overlayHeight && spaceBelow > spaceAbove) top = y + padding;

    return { left: `${left}px`, top: `${top}px` };
  };

  return (
    <div
      className={`dossier-pop dossier-pop--${mobile ? 'mobile' : placement} ${locked ? 'is-locked' : ''}`}
      style={{
        ...(hoveredItemPos ? getOverlayStyle() : {}),
        ['--section-color' as string]: sectionColor,
      }}
    >
      <div className="dossier-pop__header">
        <div>
          <p className="detail-kicker">{sectionMetaFor(item.section).label}</p>
          <strong>{branch}</strong>
        </div>
        <button className="dossier-close" type="button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="dossier-pop__grid">
        {item.image ? <img className="dossier-pop__image glow-frame" src={item.image} alt="" /> : <div className="dossier-pop__image image-fallback large">NO PREVIEW</div>}

        <div className="dossier-pop__copy">
          <h4>{itemTitle(item)}</h4>
          <p>{itemDescription(item)}</p>

          <div className="dossier-tags">
            <span>{itemTypeLabel(item)}</span>
            <span>{item.source || 'Unknown source'}</span>
            <span>{statusLabel(item)}</span>
          </div>

          <dl>
            <div>
              <dt>Price</dt>
              <dd>{itemPrice(item)}</dd>
            </div>
            <div>
              <dt>Branch</dt>
              <dd>{branch}</dd>
            </div>
            <div>
              <dt>Last scan</dt>
              <dd>{item.lastFetchedAt || 'Unknown'}</dd>
            </div>
          </dl>

          {relatedItems.length ? (
            <div className="dossier-related">
              <span>Related pulls</span>
              <div className="dossier-related__list">
                {relatedItems.map((related) => (
                  <button key={`related-${related.id}`} type="button" onClick={() => onSelectRelated(related)}>
                    {shortTitle(itemTitle(related), 20)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {item.url ? (
            <a className="action-link purchase-link pulse-link" href={item.url} target="_blank" rel="noreferrer">
              Open item dossier
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InventoryItemNode({
  item,
  branch,
  isFocused,
  isRelated,
  isMobile,
  sectionColor,
  viewMode,
  selectedItem,
  relatedItems,
  interactiveItem,
  hoveredItemPos,
  onHover,
  onLeave,
  onSelect
}: {
  item: DesireCacheItem;
  branch: string;
  isFocused: boolean;
  isRelated: boolean | null;
  isMobile: boolean;
  sectionColor: string;
  viewMode: ViewMode;
  selectedItem: DesireCacheItem | null;
  relatedItems: DesireCacheItem[];
  interactiveItem: DesireCacheItem | null;
  hoveredItemPos?: { x: number; y: number } | undefined;
  onHover: (id: string) => void;
  onLeave: () => void;
  onSelect: (item: DesireCacheItem) => void;
}) {
  const itemRef = useRef<HTMLElement | null>(null);
  const placement = usePositionedDossier(isFocused, itemRef);

  return (
    <article
      ref={itemRef}
      className={`item-node ${itemAccentClass(item)} ${isFocused ? 'is-focused' : ''} ${isRelated ? 'is-related' : ''}`}
      onMouseEnter={() => !isMobile && onHover(item.id)}
      onMouseLeave={() => !isMobile && onLeave()}
    >
      <button className="item-node__button" type="button" onClick={() => onSelect(item)}>
        <div className="item-node__image glow-frame">
          {item.image ? <img src={item.image} alt="" loading="lazy" /> : <div className="image-fallback">NO PREVIEW</div>}
        </div>

        <div className="item-node__body">
          <div className="item-node__head">
            <p>{itemTypeLabel(item)}</p>
            <span>{item.size || 'Field'}</span>
          </div>
          <h4>{shortTitle(itemTitle(item), viewMode === 'compact' ? 30 : 40)}</h4>
          <div className="item-node__footer">
            <strong>{itemPrice(item)}</strong>
            <span>{item.source || branch}</span>
          </div>
        </div>
      </button>

      {interactiveItem?.id === item.id ? (
        <DossierOverlay
          item={item}
          branch={branch}
          sectionColor={sectionColor}
          locked={selectedItem?.id === item.id}
          relatedItems={relatedItems}
          onClose={() => onSelect(item)}
          onSelectRelated={onSelect}
          placement={placement}
          mobile={isMobile}
          hoveredItemPos={hoveredItemPos}
        />
      ) : null}
    </article>
  );
}

function App() {
  const [payload, setPayload] = useState<DesireCachePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DesireCacheItem | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('ALL');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [viewMode, setViewMode] = useState<ViewMode>('dense');
  const isMobile = useIsMobile();
  const [hoveredItemPos, setHoveredItemPos] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(buildApiUrl('/api/items'), { signal: controller.signal });
        if (!response.ok) throw new Error(`API request failed with ${response.status}`);
        const nextPayload = (await response.json()) as DesireCachePayload;
        setPayload(nextPayload);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unknown Desire Cache API failure');
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const sections = useMemo(() => {
    const base = payload?.sections?.length
      ? payload.sections
      : Array.from(new Set((payload?.items ?? []).map((item) => normalizeSection(item.section))));

    return base.map((section, index) => sectionMetaFor(section, index));
  }, [payload]);

  const filteredItems = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    return (payload?.items ?? []).filter((item) => {
      const itemSection = normalizeSection(item.section);
      if (activeSection !== 'ALL' && itemSection !== activeSection) return false;
      if (lowerQuery && !normalizeSearchValue(item).includes(lowerQuery)) return false;
      return true;
    });
  }, [payload, activeSection, query]);

  const groupedBranches = useMemo(() => groupByBranch(filteredItems, sortMode), [filteredItems, sortMode]);

  useEffect(() => {
    if (!filteredItems.length) {
      setSelectedItem(null);
      setHoveredItemId(null);
      return;
    }

    const stillVisible = selectedItem && filteredItems.some((item) => item.id === selectedItem.id);
    if (!stillVisible && !isMobile) setSelectedItem(filteredItems[0]);
    if (!stillVisible && isMobile) setSelectedItem(null);
  }, [filteredItems, selectedItem, isMobile]);

  const interactiveItem = useMemo(() => {
    if (hoveredItemId && !isMobile) {
      return filteredItems.find((item) => item.id === hoveredItemId) ?? selectedItem;
    }

    return selectedItem;
  }, [hoveredItemId, filteredItems, selectedItem, isMobile]);

  const activeSectionMeta = useMemo(() => {
    if (activeSection === 'ALL') {
      return {
        id: 'ALL',
        label: 'All Sectors',
        kicker: 'Archive overview',
        glyph: 'DC',
        color: '#7dd3fc'
      };
    }

    return sections.find((section) => section.id === activeSection) ?? sectionMetaFor(activeSection);
  }, [activeSection, sections]);

  const relatedItems = useMemo(() => relatedItemsFor(interactiveItem, filteredItems), [interactiveItem, filteredItems]);
  const highlightedItems = useMemo(() => sortItems(filteredItems, 'priority').slice(0, 5), [filteredItems]);

  const selectItem = (item: DesireCacheItem) => {
    setSelectedItem((current) => (current?.id === item.id ? null : item));
    setHoveredItemId(item.id);
  };

  return (
    <main className="app-shell inventory-theme">
      <section className="hero-panel shop-hero">
        <div className="shop-hero__copy">
          <div className="hero-badge pulse-mark">DC</div>
          <div>
            <p className="eyebrow">Desire Cache // Raider Market Sweep</p>
            <h1>Compact browse field, richer dossiers, cleaner trade lanes.</h1>
            <p className="lede">
              Inventory-first sweep with themed sectors, fast hover intel, and pop dossiers that keep the browsing field clear.
            </p>
          </div>
        </div>

        <div className="hero-readout panel-surface glow-panel">
          <span>
            <strong>{payload?.totalItems ?? 0}</strong>
            total cache objects
          </span>
          <span>
            <strong>{filteredItems.length}</strong>
            visible in sweep
          </span>
          <span>
            <strong>{groupedBranches.length}</strong>
            category lanes
          </span>
          <span>
            <strong>{error ? 'degraded' : 'nominal'}</strong>
            feed status
          </span>
        </div>
      </section>

      <section className="section-lanes panel-surface glow-panel">
        <div className="section-lanes__header">
          <div>
            <p className="eyebrow">Sector routing</p>
            <h2>Trade lanes</h2>
          </div>
          <span>{sections.length} themed sectors online</span>
        </div>

        <div className="section-lanes__track">
          <button
            className={`sector-chip sector-chip--all ${activeSection === 'ALL' ? 'is-active' : ''}`}
            type="button"
            onClick={() => setActiveSection('ALL')}
          >
            <span className="sector-chip__glyph">DC</span>
            <span className="sector-chip__copy">
              <strong>All Sectors</strong>
              <small>Archive overview</small>
            </span>
            <em>{payload?.totalItems ?? 0}</em>
          </button>

          {sections.map((section) => {
            const count = (payload?.items ?? []).filter((item) => normalizeSection(item.section) === section.id).length;
            return (
              <button
                key={section.id}
                className={`sector-chip ${activeSection === section.id ? 'is-active' : ''}`}
                style={{ ['--section-color' as string]: section.color }}
                type="button"
                onClick={() => setActiveSection(section.id)}
              >
                <span className="sector-chip__glyph">{section.glyph}</span>
                <span className="sector-chip__copy">
                  <strong>{section.label}</strong>
                  <small>{section.kicker}</small>
                </span>
                <em>{count}</em>
              </button>
            );
          })}
        </div>
      </section>

      <section className="inventory-shell panel-surface">
        <header className="inventory-toolbar">
          <div>
            <p className="eyebrow">{activeSectionMeta.kicker}</p>
            <h2>{activeSectionMeta.label}</h2>
          </div>

          <div className="toolbar-controls">
            <label className="search-shell">
              <span>Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Item, source, branch, signal" />
            </label>

            <label className="select-shell">
              <span>Sort</span>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                <option value="priority">Priority</option>
                <option value="price">Price</option>
                <option value="title">Title</option>
              </select>
            </label>

            <div className="mode-toggle glow-toggle">
              <button className={viewMode === 'dense' ? 'is-active' : ''} onClick={() => setViewMode('dense')} type="button">
                Dense
              </button>
              <button className={viewMode === 'compact' ? 'is-active' : ''} onClick={() => setViewMode('compact')} type="button">
                Compact
              </button>
            </div>
          </div>
        </header>

        {!error && highlightedItems.length ? (
          <section className="signal-bar">
            <p className="eyebrow">Signal pull</p>
            <div className="signal-bar__items">
              {highlightedItems.map((item) => (
                <button
                  key={`signal-${item.id}`}
                  className={`signal-pill ${itemAccentClass(item)} ${interactiveItem?.id === item.id ? 'is-selected' : ''}`}
                  type="button"
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      setHoveredItemId(item.id);
                      setHoveredItemPos({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onMouseLeave={() => {
                    if (!isMobile) {
                      setHoveredItemId(null);
                      setHoveredItemPos(null);
                    }
                  }}
                  onClick={() => selectItem(item)}
                >
                  <strong>{shortTitle(itemTitle(item), 24)}</strong>
                  <span>{itemPrice(item)}</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {error ? <div className="state-panel error">{error}</div> : null}

        <div className="branch-stack">
          {groupedBranches.map(([branch, items]) => (
            <section key={branch} className="branch-block">
              <header className="branch-block__header">
                <div>
                  <p className="lane-kicker">Category lane</p>
                  <h3>{branch}</h3>
                </div>
                <span>{items.length} items</span>
              </header>

              <div className={`inventory-grid ${viewMode === 'compact' ? 'is-compact' : ''}`}>
                {items.map((item) => {
                  const isFocused = interactiveItem?.id === item.id;
                  const isRelated = interactiveItem && interactiveItem.id !== item.id && branchLabelFor(interactiveItem) === branchLabelFor(item);

                  return (
                    <InventoryItemNode
                      key={item.id}
                      item={item}
                      branch={branch}
                      isFocused={isFocused}
                      isRelated={isRelated}
                      isMobile={isMobile}
                      sectionColor={activeSectionMeta.color}
                      viewMode={viewMode}
                      selectedItem={selectedItem}
                      relatedItems={relatedItems}
                      interactiveItem={interactiveItem}
                      hoveredItemPos={hoveredItemPos ?? undefined}
                      onHover={setHoveredItemId}
                      onLeave={() => setHoveredItemId(null)}
                      onSelect={selectItem}
                    />
                  );
                })}
              </div>
            </section>
          ))}

          {!error && groupedBranches.length === 0 ? <div className="state-panel">No items match this filter state.</div> : null}
        </div>
      </section>
    </main>
  );
}

export default App;
