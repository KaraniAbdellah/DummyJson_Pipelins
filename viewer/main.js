/**
 * Data Warehouse Table Explorer
 * Scalable single-file frontend client matching PostgreSQL schema:
 * - raw (checkouts, products, stores, promotions)
 * - staging (checkouts, products, stores, promotions)
 * - mart (revenue_by_store, sales, top_products)
 */

// --- 1. SCHEMA DEFINITION & METADATA ---
const SCHEMA_METADATA = {
  raw: {
    color: 'amber',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Landing zone directly populated by data pipelines without alterations.',
    tables: {
      stores: {
        label: 'stores',
        description: 'Store locations raw records with potential whitespace.',
        columns: ['store_id', 'store_name', 'city', 'address']
      },
      products: {
        label: 'products',
        description: 'Catalog products with brands, categories, and unit price.',
        columns: ['product_id', 'product_name', 'category', 'subcategory', 'brand', 'unit_price']
      },
      promotions: {
        label: 'promotions',
        description: 'Discount percentages assigned to active product IDs.',
        columns: ['promo_id', 'product_id', 'discount_pct']
      },
      checkouts: {
        label: 'checkouts',
        description: 'Raw point-of-sale events with duplicated & zero/negative quantity test records.',
        columns: ['order_id', 'store_id', 'pulled_at', 'product_id', 'quantity']
      }
    }
  },
  staging: {
    color: 'blue',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Cleaned, trimmed, and deduplicated records ready for business transformation.',
    tables: {
      stores: {
        label: 'stores',
        description: 'Trimmed store names and city names.',
        columns: ['store_id', 'store_name', 'city']
      },
      products: {
        label: 'products',
        description: 'Sanitized product names, trimmed categories, and verified unit price.',
        columns: ['product_id', 'product_name', 'category', 'unit_price']
      },
      promotions: {
        label: 'promotions',
        description: 'Standardized promotions catalog.',
        columns: ['product_id', 'discount_pct']
      },
      checkouts: {
        label: 'checkouts',
        description: 'Deduplicated checkouts strictly filtered by quantity > 0.',
        columns: ['order_id', 'store_id', 'pulled_at', 'product_id', 'quantity']
      }
    }
  },
  mart: {
    color: 'emerald',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Business-ready analytics marts, joined data, and calculated KPIs.',
    tables: {
      revenue_by_store: {
        label: 'revenue_by_store',
        description: 'Aggregated store gross and net revenue ordered by performance.',
        columns: ['city', 'store_name', 'revenue']
      },
      sales: {
        label: 'sales',
        description: 'Atomic line-item sales with joined unit prices, discount percent, and net amount.',
        columns: ['order_id', 'store_id', 'product_id', 'quantity', 'unit_price', 'discount_pct', 'net_amount']
      },
      top_products: {
        label: 'top_products',
        description: 'Best-selling catalog products aggregated by total units sold.',
        columns: ['product_name', 'category', 'units_sold']
      }
    }
  }
};

// --- 2. REALISTIC SEED DATA (EXACT MATCH TO USER SQL QUERIES) ---
const MOCK_DATA = {
  raw: {
    stores: [
      { store_id: 101, store_name: "  Downtown Flagship  ", city: "  Casablanca ", address: "120 Boulevard Mohammed V" },
      { store_id: 102, store_name: "Mall Plaza Central", city: "Rabat", address: "Avenue Annakhil, Hay Riad" },
      { store_id: 103, store_name: "Medina Express", city: "Marrakech", address: "Rue Yves Saint Laurent" },
      { store_id: 104, store_name: "Ocean Coast Branch  ", city: " Tangier ", address: "Boulevard Pasteur" },
      { store_id: 105, store_name: "Atlas Outlet", city: "Fes", address: "Route d'Immouzzer" }
    ],
    products: [
      { product_id: 501, product_name: "  Pro Wireless ANC Headphones ", category: " Electronics ", subcategory: "Audio", brand: "AuraTech", unit_price: 199.99 },
      { product_id: 502, product_name: "Mechanical Gaming Keyboard", category: "Electronics", subcategory: "Peripherals", brand: "ApexKey", unit_price: 89.50 },
      { product_id: 503, product_name: "  Ergonomic Office Chair ", category: " Furniture  ", subcategory: "Seating", brand: "PosturePro", unit_price: 320.00 },
      { product_id: 504, product_name: "Smart Fitness Watch V2", category: "Wearables", subcategory: "Fitness", brand: "PulseTrack", unit_price: 149.00 },
      { product_id: 505, product_name: "Organic Roast Espresso (1kg)", category: "Groceries", subcategory: "Coffee", brand: "TerraBrew", unit_price: 24.50 },
      { product_id: 506, product_name: "4K Ultra-Wide Monitor 34-inch", category: "Electronics", subcategory: "Displays", brand: "AuraTech", unit_price: 499.00 }
    ],
    promotions: [
      { promo_id: 1, product_id: 501, discount_pct: 15.00 },
      { promo_id: 2, product_id: 504, discount_pct: 10.00 },
      { promo_id: 3, product_id: 505, discount_pct: 5.00 }
    ],
    checkouts: [
      // Deliberate duplicates and raw anomalies to simulate dirty ingestion
      { order_id: "ORD-9001", store_id: 101, pulled_at: "2026-03-10 09:15:00", product_id: 501, quantity: 2 },
      { order_id: "ORD-9001", store_id: 101, pulled_at: "2026-03-10 09:15:00", product_id: 501, quantity: 2 }, // Duplicate
      { order_id: "ORD-9002", store_id: 101, pulled_at: "2026-03-10 10:20:00", product_id: 502, quantity: 1 },
      { order_id: "ORD-9003", store_id: 102, pulled_at: "2026-03-10 11:05:00", product_id: 503, quantity: 1 },
      { order_id: "ORD-9004", store_id: 103, pulled_at: "2026-03-10 12:45:00", product_id: 504, quantity: 3 },
      { order_id: "ORD-9005", store_id: 104, pulled_at: "2026-03-10 13:30:00", product_id: 505, quantity: 4 },
      { order_id: "ORD-9006", store_id: 101, pulled_at: "2026-03-10 14:10:00", product_id: 506, quantity: 1 },
      { order_id: "ORD-9007", store_id: 105, pulled_at: "2026-03-10 15:00:00", product_id: 501, quantity: 1 },
      { order_id: "ORD-9008", store_id: 102, pulled_at: "2026-03-10 15:45:00", product_id: 505, quantity: 6 },
      { order_id: "ORD-9009", store_id: 103, pulled_at: "2026-03-10 16:30:00", product_id: 502, quantity: 2 },
      { order_id: "ORD-9010", store_id: 104, pulled_at: "2026-03-10 17:15:00", product_id: 0,   quantity: 0 }, // Invalid quantity test
      { order_id: "ORD-9011", store_id: 105, pulled_at: "2026-03-10 18:00:00", product_id: 504, quantity: 2 }
    ]
  },
  staging: {},
  mart: {}
};

// Compute Staging data dynamically according to user SQL
MOCK_DATA.staging.stores = MOCK_DATA.raw.stores.map(s => ({
  store_id: s.store_id,
  store_name: s.store_name.trim(),
  city: s.city.trim()
}));

MOCK_DATA.staging.products = MOCK_DATA.raw.products.map(p => ({
  product_id: p.product_id,
  product_name: p.product_name.trim(),
  category: p.category.trim(),
  unit_price: p.unit_price
}));

MOCK_DATA.staging.promotions = MOCK_DATA.raw.promotions.map(pr => ({
  product_id: pr.product_id,
  discount_pct: pr.discount_pct
}));

// SELECT DISTINCT order_id, store_id, pulled_at, product_id, quantity FROM raw.checkouts WHERE quantity > 0
const uniqueCheckoutsMap = new Map();
MOCK_DATA.raw.checkouts.filter(c => c.quantity > 0).forEach(item => {
  const key = `${item.order_id}_${item.store_id}_${item.pulled_at}_${item.product_id}_${item.quantity}`;
  if (!uniqueCheckoutsMap.has(key)) {
    uniqueCheckoutsMap.set(key, { ...item });
  }
});
MOCK_DATA.staging.checkouts = Array.from(uniqueCheckoutsMap.values());

// Compute Marts: mart.sales
MOCK_DATA.mart.sales = MOCK_DATA.staging.checkouts.map(c => {
  const prod = MOCK_DATA.staging.products.find(p => p.product_id === c.product_id) || { unit_price: 0 };
  const promo = MOCK_DATA.staging.promotions.find(pr => pr.product_id === c.product_id);
  const discount_pct = promo ? promo.discount_pct : 0;
  const net_amount = Number((c.quantity * prod.unit_price * (1 - discount_pct / 100)).toFixed(2));

  return {
    order_id: c.order_id,
    store_id: c.store_id,
    product_id: c.product_id,
    quantity: c.quantity,
    unit_price: prod.unit_price,
    discount_pct: discount_pct,
    net_amount: net_amount
  };
});

// mart.revenue_by_store
const storeRevMap = {};
MOCK_DATA.mart.sales.forEach(sale => {
  const store = MOCK_DATA.staging.stores.find(st => st.store_id === sale.store_id);
  if (!store) return;
  const key = `${store.city}_${store.store_name}`;
  if (!storeRevMap[key]) {
    storeRevMap[key] = { city: store.city, store_name: store.store_name, revenue: 0 };
  }
  storeRevMap[key].revenue += sale.net_amount;
});
MOCK_DATA.mart.revenue_by_store = Object.values(storeRevMap)
  .map(item => ({ ...item, revenue: Number(item.revenue.toFixed(2)) }))
  .sort((a, b) => b.revenue - a.revenue);

// mart.top_products
const topProdMap = {};
MOCK_DATA.mart.sales.forEach(sale => {
  const prod = MOCK_DATA.staging.products.find(p => p.product_id === sale.product_id);
  if (!prod) return;
  const key = `${prod.product_name}_${prod.category}`;
  if (!topProdMap[key]) {
    topProdMap[key] = { product_name: prod.product_name, category: prod.category, units_sold: 0 };
  }
  topProdMap[key].units_sold += sale.quantity;
});
MOCK_DATA.mart.top_products = Object.values(topProdMap)
  .sort((a, b) => b.units_sold - a.units_sold);

// --- 3. APPLICATION STATE ---
const state = {
  activeSchema: 'mart',
  activeTable: 'revenue_by_store',
  searchTerm: '',
  page: 1,
  pageSize: 25,
  dataSourceMode: 'mock', // 'mock' or 'api'
  apiBaseUrl: 'http://localhost:5000/api',
  cachedRawData: [],
  filteredData: [],
  isLoading: false
};

// --- 4. CORE CONTROLLER FUNCTIONS ---

/**
 * Change the active schema tab ('raw', 'staging', 'mart')
 */
function selectSchema(schemaName) {
  if (state.activeSchema === schemaName) return;
  state.activeSchema = schemaName;

  // Pick the first table of this schema
  const tables = Object.keys(SCHEMA_METADATA[schemaName].tables);
  state.activeTable = tables[0];
  state.page = 1;
  state.searchTerm = '';
  document.getElementById('filter-input').value = '';

  updateSchemaTabsUI();
  renderTableChips();
  loadCurrentTable();
}

/**
 * Change table inside active schema
 */
function selectTable(tableName) {
  if (state.activeTable === tableName) return;
  state.activeTable = tableName;
  state.page = 1;
  state.searchTerm = '';
  document.getElementById('filter-input').value = '';

  renderTableChips();
  loadCurrentTable();
}

/**
 * Fetch or retrieve data based on current mode
 */
async function loadCurrentTable() {
  setLoading(true);
  const { activeSchema, activeTable, dataSourceMode, apiBaseUrl } = state;
  const meta = SCHEMA_METADATA[activeSchema].tables[activeTable];

  // Update table title, badges and schema tags
  document.getElementById('current-table-title').innerText = activeTable;
  document.getElementById('badge-schema-name').innerText = activeSchema;
  document.getElementById('current-table-desc').innerText = meta.description || 'Database relation';
  document.getElementById('current-layer-stat').innerText = activeSchema.toUpperCase();

  const badgeElem = document.getElementById('badge-schema-name');
  badgeElem.className = `font-mono text-xs uppercase px-2 py-0.5 rounded font-bold border ${SCHEMA_METADATA[activeSchema].badgeClass}`;

  try {
    if (dataSourceMode === 'api') {
      const url = `${apiBaseUrl}/data/${activeSchema}/${activeTable}`;
      document.getElementById('data-latency-hint').innerText = `Fetched from ${url}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      state.cachedRawData = Array.isArray(data) ? data : (data.rows || []);
    } else {
      // Mock mode
      document.getElementById('data-latency-hint').innerText = 'Local In-Memory Cache';
      state.cachedRawData = MOCK_DATA[activeSchema]?.[activeTable] || [];
    }

    applyFilteringAndPagination();
  } catch (err) {
    console.error('Fetch error:', err);
    renderErrorNotification(`Could not fetch data from ${activeSchema}.${activeTable}: ${err.message}`);
    state.cachedRawData = [];
    applyFilteringAndPagination();
  } finally {
    setLoading(false);
  }
}

/**
 * Filter data by search query and paginate
 */
function applyFilteringAndPagination() {
  const query = state.searchTerm.toLowerCase().trim();

  if (!query) {
    state.filteredData = [...state.cachedRawData];
  } else {
    state.filteredData = state.cachedRawData.filter(row => {
      return Object.values(row).some(val =>
        String(val !== null && val !== undefined ? val : '').toLowerCase().includes(query)
      );
    });
  }

  // Update stats
  document.getElementById('stat-total-rows').innerText = state.cachedRawData.length;
  document.getElementById('stat-filtered-rows').innerText = state.filteredData.length;

  const columns = state.cachedRawData.length > 0
    ? Object.keys(state.cachedRawData[0])
    : (SCHEMA_METADATA[state.activeSchema]?.tables[state.activeTable]?.columns || []);
  document.getElementById('stat-total-cols').innerText = columns.length;

  renderTableHeaders(columns);
  renderTableBody(columns);
  renderPagination();
}

/**
 * Render dynamic headers with clean sorting hints
 */
function renderTableHeaders(columns) {
  const thead = document.getElementById('table-head');
  if (columns.length === 0) {
    thead.innerHTML = '';
    return;
  }

  let html = '<tr>';
  html += '<th class="py-3 px-4 w-12 text-slate-400 font-mono text-[11px] text-center">#</th>';
  columns.forEach(col => {
    html += `
      <th class="py-3 px-4 font-mono text-[11px] font-semibold tracking-wider text-slate-700">
        <div class="flex items-center space-x-1">
          <span>${escapeHTML(col)}</span>
        </div>
      </th>
    `;
  });
  html += '</tr>';
  thead.innerHTML = html;
}

/**
 * Render paginated rows into table body
 */
function renderTableBody(columns) {
  const tbody = document.getElementById('table-body');
  const emptyState = document.getElementById('empty-state');
  const tableGrid = document.getElementById('data-grid');

  if (state.filteredData.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    tableGrid.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  tableGrid.classList.remove('hidden');

  const startIndex = (state.page - 1) * state.pageSize;
  const pageRows = state.filteredData.slice(startIndex, startIndex + state.pageSize);

  let html = '';
  pageRows.forEach((row, i) => {
    const rowNum = startIndex + i + 1;
    html += `<tr class="hover:bg-sky-50/50 transition-colors">`;
    html += `<td class="py-2.5 px-4 text-center text-slate-400 text-[11px] font-mono">${rowNum}</td>`;

    columns.forEach(col => {
      let val = row[col];
      let displayVal = val;
      let cellStyle = "py-2.5 px-4 text-slate-700 text-xs";

      if (val === null || val === undefined) {
        displayVal = '<span class="text-slate-300 italic">null</span>';
      } else if (typeof val === 'number') {
        cellStyle += " font-mono";
        // Format currencies/percentages nicely
        if (col.includes('revenue') || col.includes('net_amount') || col.includes('unit_price')) {
          displayVal = `<span class="text-emerald-700 font-medium">$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
        } else if (col.includes('discount_pct')) {
          displayVal = val > 0 ? `<span class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">${val}%</span>` : `<span class="text-slate-400">0%</span>`;
        }
      } else if (typeof val === 'string' && (val.startsWith('ORD-') || col.endsWith('_id'))) {
        displayVal = `<span class="font-mono text-slate-900 font-medium">${escapeHTML(val)}</span>`;
      } else {
        displayVal = escapeHTML(String(val));
      }

      html += `<td class="${cellStyle}">${displayVal}</td>`;
    });

    html += `</tr>`;
  });

  tbody.innerHTML = html;
}

/**
 * Pagination Controls
 */
function renderPagination() {
  const total = state.filteredData.length;
  const totalPages = Math.ceil(total / state.pageSize) || 1;

  if (state.page > totalPages) state.page = totalPages;

  const startIndex = total === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
  const endIndex = Math.min(state.page * state.pageSize, total);

  document.getElementById('pagination-info').innerText = `Showing ${startIndex} to ${endIndex} of ${total} entries`;

  document.getElementById('btn-prev').disabled = state.page <= 1;
  document.getElementById('btn-next').disabled = state.page >= totalPages;

  // Render quick page number buttons
  const pageContainer = document.getElementById('page-numbers');
  let pagesHtml = '';

  for (let p = 1; p <= totalPages; p++) {
    if (totalPages > 7 && Math.abs(p - state.page) > 2 && p !== 1 && p !== totalPages) {
      if (p === 2 || p === totalPages - 1) pagesHtml += `<span class="px-1 text-slate-400">...</span>`;
      continue;
    }
    const isActive = p === state.page;
    pagesHtml += `
      <button onclick="setPage(${p})" class="w-7 h-7 flex items-center justify-center rounded text-xs font-mono font-medium transition-colors ${
        isActive ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
      }">
        ${p}
      </button>
    `;
  }
  pageContainer.innerHTML = pagesHtml;
}

function goToPage(dir) {
  if (dir === 'prev' && state.page > 1) {
    state.page--;
  } else if (dir === 'next') {
    const totalPages = Math.ceil(state.filteredData.length / state.pageSize);
    if (state.page < totalPages) state.page++;
  }
  applyFilteringAndPagination();
}

function setPage(pageNum) {
  state.page = pageNum;
  applyFilteringAndPagination();
}

function changePageSize(e) {
  state.pageSize = parseInt(e.target.value, 10);
  state.page = 1;
  applyFilteringAndPagination();
}

function onSearchChange(e) {
  state.searchTerm = e.target.value;
  state.page = 1;
  applyFilteringAndPagination();
}

/**
 * Refresh current table data with spin animation
 */
function refreshData() {
  const icon = document.getElementById('refresh-icon');
  icon.classList.add('animate-spin');
  loadCurrentTable().finally(() => {
    setTimeout(() => icon.classList.remove('animate-spin'), 400);
  });
}

/**
 * CSV Exporter
 */
function exportCurrentTableCSV() {
  if (state.filteredData.length === 0) return;
  const cols = Object.keys(state.filteredData[0]);

  const csvRows = [
    cols.join(','),
    ...state.filteredData.map(row =>
      cols.map(c => {
        let v = row[c] === null || row[c] === undefined ? '' : String(row[c]);
        v = v.replace(/"/g, '""');
        return `"${v}"`;
      }).join(',')
    )
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `${state.activeSchema}_${state.activeTable}_export.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// --- 5. UI VIEW HELPERS ---

function updateSchemaTabsUI() {
  ['raw', 'staging', 'mart'].forEach(schema => {
    const tab = document.getElementById(`tab-${schema}`);
    if (schema === state.activeSchema) {
      tab.classList.add('text-sky-600', 'border-sky-600');
      tab.classList.remove('text-slate-500', 'border-transparent');
    } else {
      tab.classList.remove('text-sky-600', 'border-sky-600');
      tab.classList.add('text-slate-500', 'border-transparent');
    }
  });
}

function renderTableChips() {
  const container = document.getElementById('table-chips');
  const currentSchema = SCHEMA_METADATA[state.activeSchema];
  const tables = Object.keys(currentSchema.tables);

  let html = '';
  tables.forEach(tableName => {
    const isSelected = tableName === state.activeTable;
    if (isSelected) {
      html += `
        <button onclick="selectTable('${tableName}')" class="px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-slate-900 text-white shadow-xs flex items-center space-x-1.5">
          <span>${tableName}</span>
        </button>
      `;
    } else {
      html += `
        <button onclick="selectTable('${tableName}')" class="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
          <span>${tableName}</span>
        </button>
      `;
    }
  });

  container.innerHTML = html;
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  const loader = document.getElementById('table-loader');
  if (isLoading) {
    loader.classList.remove('hidden');
  } else {
    loader.classList.add('hidden');
  }
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderErrorNotification(msg) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-rose-600 text-white px-4 py-3 rounded-xl shadow-lg text-xs font-medium z-50 flex items-center gap-2 animate-bounce';
  toast.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4"></i> <span>${escapeHTML(msg)}</span>`;
  document.body.appendChild(toast);
  if (window.lucide) lucide.createIcons();
  setTimeout(() => toast.remove(), 4000);
}

// --- 6. DATASOURCE MODAL & SETTINGS ---

function setDataSourceMode(mode) {
  state.dataSourceMode = mode;
  updateConfigModalUI();
}

function updateConfigModalUI() {
  const isMock = state.dataSourceMode === 'mock';
  const mockBtn = document.getElementById('mode-btn-mock');
  const apiBtn = document.getElementById('mode-btn-api');
  const apiFields = document.getElementById('api-config-fields');

  if (isMock) {
    mockBtn.className = 'p-2.5 rounded-lg border-2 border-sky-600 bg-sky-50/50 text-left';
    apiBtn.className = 'p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 text-left';
    apiFields.classList.add('hidden');
  } else {
    apiBtn.className = 'p-2.5 rounded-lg border-2 border-sky-600 bg-sky-50/50 text-left';
    mockBtn.className = 'p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 text-left';
    apiFields.classList.remove('hidden');
  }
}

function saveDataSourceConfig() {
  const apiInput = document.getElementById('api-base-url').value.trim();
  if (apiInput) state.apiBaseUrl = apiInput;

  const pillText = document.getElementById('connection-mode-text');
  const pill = document.getElementById('connection-status-pill');

  if (state.dataSourceMode === 'mock') {
    pillText.innerText = 'Mock Mode';
    pill.className = 'flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer';
  } else {
    pillText.innerText = 'API Connected';
    pill.className = 'flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 cursor-pointer';
  }

  toggleConfigModal();
  loadCurrentTable();
}

// --- 7. APPLICATION BOOTSTRAP ---
window.addEventListener('DOMContentLoaded', () => {
  updateSchemaTabsUI();
  renderTableChips();
  loadCurrentTable();
});
