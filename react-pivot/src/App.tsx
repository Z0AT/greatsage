import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { buildApiUrl } from './config';
import type { DesireCacheItem, DesireCachePayload } from './types';

const SECTION_ALIASES: Record<string, string> = {
  perks: 'Perk Injector',
  comfort: 'Comfort Daemon',
  style: 'Shell Mods',
  setup: 'Rig Matrix'
};

const SECTION_COLORS = ['#7dd3fc', '#c084fc', '#fb7185', '#4ade80', '#f59e0b', '#2dd4bf'];

type SortMode = 'priority' | 'price' | 'title';
type ViewMode = 'compact' | 'featured';

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

function normalizeSection(section: string) {
  return section?.trim() || 'Misc';
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

  return sortItems(sameBranch, 'priority').slice(0, 4);
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

function App() {
  const [payload, setPayload] = useState<DesireCachePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DesireCacheItem | null>(null);
  const [activeSection, setActiveSection] = useState<string>('ALL');
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [viewMode, setViewMode] = useState<ViewMode>('featured');
  const [mobileDossierOpen, setMobileDossierOpen] = useState(false);
  const isMobile = useIsMobile();
  const mobileDossierRef = useRef<HTMLElement | null>(null);

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

  const sections = useMemo(() => {
    const base = payload?.sections?.length ? payload.sections : Array.from(new Set((payload?.items ?? []).map((item) => normalizeSection(item.section))));
    return base.map((section, index) => ({
      id: section,
      label: sectionLabelFor(section),
      color: SECTION_COLORS[index % SECTION_COLORS.length]
    }));
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
  const relatedItems = useMemo(() => relatedItemsFor(selectedItem, filteredItems), [selectedItem, filteredItems]);

  const activeSectionMeta = useMemo(() => {
    if (activeSection === 'ALL') {
      return {
        label: 'All Sectors',
        color: '#7dd3fc'
      };
    }

    return sections.find((section) => section.id === activeSection) ?? {
      label: sectionLabelFor(activeSection),
      color: '#7dd3fc'
    };
  }, [activeSection, sections]);

  const featuredItems = useMemo(() => sortItems(filteredItems, 'priority').slice(0, 4), [filteredItems]);

  const selectItem = (item: DesireCacheItem) => {
    setSelectedItem(item);
    if (isMobile) {
      setMobileDossierOpen(true);
      setTimeout(() => {
        mobileDossierRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  return (
    <main className="app-shell inventory-theme">
      <section className="hero-panel shop-hero">
        <div className="shop-hero__portrait">
          <div className="portrait-shell glow-shell">
            <div className="portrait-mark pulse-mark">DC</div>
            <div className="portrait-copy">
              <p className="eyebrow">Desire Cache // Trade Deck</p>
              <h1>Inventory-first browse pass</h1>
              <p className="lede">
                Denser item scan, stronger hierarchy, richer glow, and a dossier-led shopping flow that behaves properly on a phone.
              </p>
            </div>
          </div>
        </div>

        <div className="shop-hero__stats">
          <span>{payload?.totalItems ?? 0} total</span>
          <span>{filteredItems.length} visible</span>
          <span>{groupedBranches.length} lanes</span>
          <span>{error ? 'feed degraded' : 'feed nominal'}</span>
        </div>
      </section>

      {isMobile && selectedItem ? (
        <button className="mobile-dossier-toggle panel-surface" type="button" onClick={() => setMobileDossierOpen((open) => !open)}>
          <div>
            <p className="eyebrow">Selected item</p>
            <strong>{itemTitle(selectedItem)}</strong>
          </div>
          <span>{mobileDossierOpen ? 'Hide dossier' : 'Show dossier'}</span>
        </button>
      ) : null}

      <section className="shop-shell">
        <aside className="section-rail panel-surface">
          <div className="rail-header">
            <p className="eyebrow">Sections</p>
            <strong>Browse rails</strong>
          </div>

          <button
            className={`rail-button ${activeSection === 'ALL' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('ALL')}
            type="button"
          >
            <span>All Sectors</span>
            <small>{payload?.totalItems ?? 0}</small>
          </button>

          {sections.map((section) => {
            const count = (payload?.items ?? []).filter((item) => normalizeSection(item.section) === section.id).length;
            return (
              <button
                key={section.id}
                className={`rail-button ${activeSection === section.id ? 'is-active' : ''}`}
                style={{ ['--section-color' as string]: section.color }}
                onClick={() => setActiveSection(section.id)}
                type="button"
              >
                <span>{section.label}</span>
                <small>{count}</small>
              </button>
            );
          })}
        </aside>

        <section className="inventory-panel panel-surface">
          <header className="inventory-toolbar">
            <div>
              <p className="eyebrow">{activeSectionMeta.label}</p>
              <h2>Trade inventory</h2>
            </div>

            <div className="toolbar-controls">
              <label className="search-shell">
                <span>Search</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an item, source, or lane" />
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
                <button className={viewMode === 'featured' ? 'is-active' : ''} onClick={() => setViewMode('featured')} type="button">
                  Featured
                </button>
                <button className={viewMode === 'compact' ? 'is-active' : ''} onClick={() => setViewMode('compact')} type="button">
                  Compact
                </button>
              </div>
            </div>
          </header>

          {error ? <div className="state-panel error">{error}</div> : null}

          {!error && featuredItems.length ? (
            <section className="featured-strip glow-panel">
              <header className="featured-strip__header">
                <div>
                  <p className="lane-kicker">Priority pull</p>
                  <h3>Signal items</h3>
                </div>
                <span>{featuredItems.length} highlighted</span>
              </header>
              <div className="featured-grid">
                {featuredItems.map((item) => (
                  <button
                    key={`featured-${item.id}`}
                    className={`featured-card ${itemAccentClass(item)} ${selectedItem?.id === item.id ? 'is-selected' : ''}`}
                    onClick={() => selectItem(item)}
                    onMouseEnter={() => !isMobile && setSelectedItem(item)}
                    type="button"
                  >
                    <div className="featured-card__image glow-frame">
                      {item.image ? <img src={item.image} alt="" loading="lazy" /> : <div className="image-fallback">NO PREVIEW</div>}
                    </div>
                    <div className="featured-card__body">
                      <p>{itemTypeLabel(item)}</p>
                      <h4>{itemTitle(item)}</h4>
                      <strong>{itemPrice(item)}</strong>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <div className="lane-stack">
            {groupedBranches.map(([branch, items]) => (
              <section key={branch} className="lane-panel">
                <header className="lane-header">
                  <div>
                    <p className="lane-kicker">Lane</p>
                    <h3>{branch}</h3>
                  </div>
                  <span>{items.length} items</span>
                </header>

                <div className={`inventory-grid ${viewMode === 'compact' ? 'is-compact' : ''}`}>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className={`item-card ${itemAccentClass(item)} ${selectedItem?.id === item.id ? 'is-selected' : ''}`}
                      onClick={() => selectItem(item)}
                      onMouseEnter={() => !isMobile && setSelectedItem(item)}
                      type="button"
                    >
                      <div className="item-card__image glow-frame">
                        {item.image ? <img src={item.image} alt="" loading="lazy" /> : <div className="image-fallback">NO PREVIEW</div>}
                      </div>

                      <div className="item-card__body">
                        <div className="item-card__head">
                          <p>{itemTypeLabel(item)}</p>
                          <span>{item.size || branch}</span>
                        </div>
                        <h4>{itemTitle(item)}</h4>
                        <div className="item-card__footer">
                          <strong>{itemPrice(item)}</strong>
                          <span>{item.source || 'Unknown source'}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}

            {!error && groupedBranches.length === 0 ? <div className="state-panel">No items match this filter state.</div> : null}
          </div>
        </section>

        <aside
          ref={mobileDossierRef}
          className={`detail-panel panel-surface dossier-panel ${isMobile && mobileDossierOpen ? 'is-mobile-open' : ''}`}
          style={{ ['--section-color' as string]: activeSectionMeta.color }}
        >
          {selectedItem ? (
            <>
              <div className="dossier-header">
                <p className="detail-kicker">{sectionLabelFor(selectedItem.section || 'Misc')}</p>
                <span>{branchLabelFor(selectedItem)}</span>
              </div>

              <h2>{itemTitle(selectedItem)}</h2>
              <p className="detail-copy">{itemDescription(selectedItem)}</p>

              {selectedItem.image ? <img className="detail-image glow-frame" src={selectedItem.image} alt="" /> : <div className="detail-image image-fallback large">NO PREVIEW</div>}

              <div className="dossier-tags">
                <span>{itemTypeLabel(selectedItem)}</span>
                <span>{selectedItem.source || 'Unknown source'}</span>
                <span>{selectedItem.size || branchLabelFor(selectedItem)}</span>
              </div>

              <dl>
                <div>
                  <dt>Price</dt>
                  <dd>{itemPrice(selectedItem)}</dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>{selectedItem.source || 'Unknown'}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{itemTypeLabel(selectedItem)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{statusLabel(selectedItem)}</dd>
                </div>
              </dl>

              {relatedItems.length ? (
                <section className="related-panel glow-panel">
                  <header className="related-panel__header">
                    <div>
                      <p className="lane-kicker">Same lane</p>
                      <strong>Related pulls</strong>
                    </div>
                    <span>{relatedItems.length} related</span>
                  </header>
                  <div className="related-list">
                    {relatedItems.map((item) => (
                      <button key={`related-${item.id}`} type="button" className="related-item" onClick={() => selectItem(item)}>
                        <strong>{itemTitle(item)}</strong>
                        <span>{itemPrice(item)}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="purchase-shell">
                <div className="purchase-shell__stepper glow-panel">
                  <button type="button">−</button>
                  <strong>x1</strong>
                  <button type="button">+</button>
                </div>
                {selectedItem.url ? (
                  <a className="action-link purchase-link pulse-link" href={selectedItem.url} target="_blank" rel="noreferrer">
                    Open item dossier
                  </a>
                ) : (
                  <button className="action-link purchase-link is-disabled" type="button">
                    Dossier unavailable
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="state-panel">Select an item to inspect its dossier.</div>
          )}
        </aside>
      </section>
    </main>
  );
}

export default App;
