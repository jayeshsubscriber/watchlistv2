(function () {
  var fabColumns = document.getElementById('fab-columns');
  var listScrollWrap = document.getElementById('list-scroll-wrap');
  var listMultiStocks = document.getElementById('list-multi-stocks');
  var listMulti = document.getElementById('list-multi');
  var collapseBtn = document.getElementById('multi-col-collapse-btn');
  var collapseFoBtn = document.getElementById('multi-col-collapse-fo-btn');
  var blockStocks = document.querySelector('.list-multi-block--stocks');
  var blockFo = document.querySelector('.list-multi-block--fo');
  var chips = document.querySelectorAll('.tabs-wrap .chip');

  if (!listScrollWrap) return;

  function setMultiColumn(active) {
    listScrollWrap.classList.toggle('layout-multi', active);
    if (listMultiStocks) listMultiStocks.hidden = !active;
    if (listMulti) listMulti.hidden = !active;
    if (fabColumns) {
      fabColumns.classList.toggle('fab-active', active);
      fabColumns.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
    if (!active) renderStandardViewList();
  }

  // Default to multi-column layout on load/refresh
  setMultiColumn(true);

  function setActiveTab(tabId) {
    chips.forEach(function (c) {
      c.classList.toggle('chip-active', c.getAttribute('data-tab') === tabId);
    });
    listScrollWrap.classList.remove('tab-nifty50', 'tab-swing', 'tab-intraday', 'tab-options_trader', 'tab-investor');
    if (tabId === 'nifty50') {
      listScrollWrap.classList.add('tab-nifty50');
    } else if (tabId === 'swing' || tabId === 'intraday' || tabId === 'options_trader' || tabId === 'investor') {
      listScrollWrap.classList.add('tab-' + tabId);
      currentPersonaId = tabId;
      renderPersonaTable(tabId);
    } else {
      listScrollWrap.classList.add('tab-nifty50');
    }
    if (!listScrollWrap.classList.contains('layout-multi') && (tabId === 'swing' || tabId === 'intraday' || tabId === 'options_trader' || tabId === 'investor')) renderStandardViewList();
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var tabId = chip.getAttribute('data-tab');
      if (tabId) setActiveTab(tabId);
    });
  });

  if (fabColumns) {
    fabColumns.addEventListener('click', function () {
      var active = listScrollWrap.classList.contains('layout-multi');
      setMultiColumn(!active);
    });
  }

  function setupCollapse(btn, block) {
    if (!btn || !block) return;
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      block.classList.toggle('list-multi-block--collapsed', expanded);
      btn.setAttribute('aria-label', expanded ? 'Expand list' : 'Collapse list');
    });
  }

  setupCollapse(collapseBtn, blockStocks);
  setupCollapse(collapseFoBtn, blockFo);

  /* Bottom sheet: open from three-dot menu, close on overlay */
  var fabMore = document.getElementById('fab-more');
  var overlay = document.getElementById('bottomsheet-overlay');
  var bottomsheet = document.getElementById('bottomsheet');

  function openBottomsheet() {
    if (overlay) {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    }
    if (bottomsheet) {
      bottomsheet.classList.add('is-open');
      bottomsheet.setAttribute('aria-hidden', 'false');
    }
  }

  function closeBottomsheet() {
    if (overlay) {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    }
    if (bottomsheet) {
      bottomsheet.classList.remove('is-open');
      bottomsheet.setAttribute('aria-hidden', 'true');
    }
  }

  if (fabMore && overlay && bottomsheet) {
    fabMore.addEventListener('click', openBottomsheet);
    overlay.addEventListener('click', closeBottomsheet);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeBottomsheet();
    });
    bottomsheet.querySelectorAll('.bottomsheet-row').forEach(function (row) {
      row.addEventListener('click', function () {
        closeBottomsheet();
        /* data-action on row: manage-watchlists | manage-stocks | watchlist-preferences */
        if (row.getAttribute('data-action') === 'watchlist-preferences') {
          openPrefs();
        } else if (row.getAttribute('data-action') === 'manage-stocks') {
          openEditWatchlist();
        }
      });
    });
  }

  /* Edit watchlist (Manage stocks in list) */
  var editWlOverlay = document.getElementById('edit-wl-overlay');
  var editWlPanel = document.getElementById('edit-wl-panel');
  var editWlBack = document.getElementById('edit-wl-back');
  var editWlList = document.getElementById('edit-wl-list');
  var editWlSelectAllCb = document.getElementById('edit-wl-select-all-cb');
  var editWlSelectAllText = document.getElementById('edit-wl-select-all-text');
  var editWlDelete = document.getElementById('edit-wl-delete');
  var editWlSave = document.getElementById('edit-wl-save');

  var EDIT_WL_STORAGE_KEY = 'watchlistEditItems';
  var DEFAULT_EDIT_ITEMS = [
    { id: '1', symbol: 'RELIANCE', exchange: 'NSE EQ' },
    { id: '2', symbol: 'TATASTEEL', exchange: 'NSE EQ' },
    { id: '3', symbol: 'HDFCBANK', exchange: 'NSE EQ' },
    { id: '4', symbol: 'INFY', exchange: 'NSE EQ' },
    { id: '5', symbol: 'NIFTY 25550 CE', exchange: 'NFO 26 FEB 26' },
    { id: '6', symbol: 'BANKNIFTY 59500 PE', exchange: 'NFO 10 FEB 26' },
    { id: '7', symbol: 'NIFTY 25800 PE', exchange: 'NFO 10 FEB 26' },
    { id: '8', symbol: 'SENSEX 83200 CE', exchange: 'NFO 11 FEB 25' }
  ];

  function getEditWlItems() {
    try {
      var raw = localStorage.getItem(EDIT_WL_STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_EDIT_ITEMS.slice();
  }

  function setEditWlItems(items) {
    try {
      localStorage.setItem(EDIT_WL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }

  function renderEditWlList(items) {
    if (!editWlList) return;
    editWlList.innerHTML = '';
    items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'edit-wl-item';
      li.draggable = true;
      li.setAttribute('data-id', item.id);
      li.innerHTML =
        '<input type="checkbox" class="edit-wl-checkbox edit-wl-item-cb" data-id="' + item.id + '" />' +
        '<div class="edit-wl-item-content">' +
          '<div class="edit-wl-heading-combo">' +
            '<span class="edit-wl-item-label">' + (item.symbol || '').replace(/</g, '&lt;') + '</span>' +
            '<span class="edit-wl-item-sub">' + (item.exchange || '').replace(/</g, '&lt;') + '</span>' +
          '</div>' +
        '</div>' +
        '<span class="edit-wl-drag-handle" aria-label="Drag to reorder" role="button">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' +
        '</span>';
      editWlList.appendChild(li);
    });
    setupEditWlItemListeners();
    updateEditWlSelectAll();
    updateEditWlButtons();
  }

  function getEditWlItemsFromDOM() {
    if (!editWlList) return [];
    var items = [];
    editWlList.querySelectorAll('.edit-wl-item').forEach(function (li) {
      var id = li.getAttribute('data-id');
      var label = li.querySelector('.edit-wl-item-label');
      var sub = li.querySelector('.edit-wl-item-sub');
      if (id && label) {
        items.push({
          id: id,
          symbol: label.textContent || '',
          exchange: sub ? sub.textContent || '' : ''
        });
      }
    });
    return items;
  }

  function getEditWlSelectedCount() {
    if (!editWlList) return 0;
    var n = 0;
    editWlList.querySelectorAll('.edit-wl-item-cb:checked').forEach(function () { n++; });
    return n;
  }

  function updateEditWlSelectAll() {
    if (!editWlList || !editWlSelectAllCb || !editWlSelectAllText) return;
    var total = editWlList.querySelectorAll('.edit-wl-item').length;
    var selected = getEditWlSelectedCount();
    editWlSelectAllCb.checked = total > 0 && selected === total;
    editWlSelectAllCb.indeterminate = selected > 0 && selected < total;
    editWlSelectAllText.textContent = 'Select all (' + selected + '/' + total + ')';
  }

  function updateEditWlButtons() {
    var n = getEditWlSelectedCount();
    if (editWlDelete) editWlDelete.disabled = n === 0;
  }

  function setupEditWlItemListeners() {
    if (!editWlList) return;
    editWlList.querySelectorAll('.edit-wl-item-cb').forEach(function (cb) {
      cb.addEventListener('change', function () {
        updateEditWlSelectAll();
        updateEditWlButtons();
      });
    });
    var draggedLi = null;
    editWlList.querySelectorAll('.edit-wl-item').forEach(function (li) {
      li.addEventListener('dragstart', function (e) {
        draggedLi = li;
        e.dataTransfer.setData('text/plain', li.getAttribute('data-id'));
        e.dataTransfer.effectAllowed = 'move';
        li.classList.add('dragging');
      });
      li.addEventListener('dragend', function () {
        li.classList.remove('dragging');
        draggedLi = null;
      });
      li.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      li.addEventListener('drop', function (e) {
        e.preventDefault();
        if (draggedLi && draggedLi !== li) {
          var rect = li.getBoundingClientRect();
          var mid = rect.top + rect.height / 2;
          if (e.clientY < mid) {
            editWlList.insertBefore(draggedLi, li);
          } else {
            editWlList.insertBefore(draggedLi, li.nextElementSibling);
          }
        }
      });
    });
  }

  function openEditWatchlist() {
    if (editWlOverlay) {
      editWlOverlay.classList.add('is-open');
      editWlOverlay.setAttribute('aria-hidden', 'false');
    }
    if (editWlPanel) {
      editWlPanel.classList.add('is-open');
      editWlPanel.setAttribute('aria-hidden', 'false');
      var items = getEditWlItems();
      renderEditWlList(items);
    }
  }

  function closeEditWatchlist() {
    if (editWlOverlay) {
      editWlOverlay.classList.remove('is-open');
      editWlOverlay.setAttribute('aria-hidden', 'true');
    }
    if (editWlPanel) {
      editWlPanel.classList.remove('is-open');
      editWlPanel.setAttribute('aria-hidden', 'true');
    }
  }

  if (editWlPanel && editWlOverlay) {
    if (editWlBack) editWlBack.addEventListener('click', closeEditWatchlist);
    editWlOverlay.addEventListener('click', closeEditWatchlist);
    if (editWlSelectAllCb) {
      editWlSelectAllCb.addEventListener('change', function () {
        if (!editWlList) return;
        var check = editWlSelectAllCb.checked;
        editWlList.querySelectorAll('.edit-wl-item-cb').forEach(function (cb) {
          cb.checked = check;
        });
        updateEditWlSelectAll();
        updateEditWlButtons();
      });
    }
    if (editWlDelete) {
      editWlDelete.addEventListener('click', function () {
        if (!editWlList) return;
        var toRemove = [];
        editWlList.querySelectorAll('.edit-wl-item-cb:checked').forEach(function (cb) {
          toRemove.push(cb.closest('.edit-wl-item'));
        });
        toRemove.forEach(function (li) {
          if (li && li.parentNode) li.remove();
        });
        updateEditWlSelectAll();
        updateEditWlButtons();
      });
    }
    if (editWlSave) {
      editWlSave.addEventListener('click', function () {
        var items = getEditWlItemsFromDOM();
        setEditWlItems(items);
        closeEditWatchlist();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && editWlPanel.classList.contains('is-open')) closeEditWatchlist();
    });
  }

  /* Watchlist Preferences modal */
  var prefsOverlay = document.getElementById('prefs-overlay');
  var prefsPanel = document.getElementById('prefs-panel');
  var prefsClose = document.getElementById('prefs-close');
  var prefsDone = document.getElementById('prefs-done');
  var prefsLayoutStandard = document.getElementById('prefs-layout-standard');
  var prefsLayoutMulti = document.getElementById('prefs-layout-multi');
  var prefsEditColumnsCta = document.getElementById('prefs-edit-columns-cta');
  var prefsColumnsOverlay = document.getElementById('prefs-columns-overlay');
  var prefsColumnsSheet = document.getElementById('prefs-columns-sheet');
  var prefsColumnsList = document.getElementById('prefs-columns-list');
  var prefsPersonasSheet = document.getElementById('prefs-personas-sheet');
  var prefsColumnsDone = document.getElementById('prefs-columns-done');

  var COLUMNS_OPTIONS = [
    { id: 'price', label: 'Price' },
    { id: 'pct_change', label: '% Change' },
    { id: 'day_range', label: 'Day Range' },
    { id: 'open', label: 'Open' },
    { id: 'high', label: 'High' },
    { id: 'low', label: 'Low' },
    { id: 'return_1w', label: '1 W Return' },
    { id: 'return_1m', label: '1 M Return' },
    { id: 'range_52w', label: '52W Range' },
    { id: 'volume', label: 'Volume' },
    { id: 'volume_10d_avg', label: 'Volume 10D Average' },
    { id: 'volume_30d_avg', label: 'Volume 30D Average' },
    { id: 'pct_turnover', label: '% Turnover' },
    { id: 'pct_1w_turnover', label: '% 1 W Turnover' },
    { id: 'market_cap', label: 'Market Cap' },
    { id: 'pe_ttm', label: 'PE (TTM)' },
    { id: 'dividend_yield', label: 'Div Yield' },
    { id: 'oi', label: 'OI' },
    { id: 'oi_change', label: 'OI Change' },
    { id: 'pcr', label: 'PCR' },
    { id: 'vwap', label: 'VWAP' },
    { id: 'rsi', label: 'RSI' },
    { id: 'iv', label: 'IV' },
    { id: 'bid', label: 'Bid' },
    { id: 'ask', label: 'Ask' }
  ];

  var PERSONA_COLUMNS = {
    options_trader: ['oi', 'oi_change', 'pcr', 'iv', 'day_range', 'bid', 'ask'],
    short_term_equity: ['pct_change', 'return_1w', 'return_1m', 'rsi', 'volume', 'vwap', 'day_range'],
    intraday: ['pct_change', 'day_range', 'open', 'high', 'low', 'volume', 'vwap', 'bid', 'ask'],
    long_term: ['pe_ttm', 'market_cap', 'rsi', 'range_52w', 'dividend_yield']
  };

  var PERSONA_TAB_TO_COLUMNS = {
    swing: 'short_term_equity',
    intraday: 'intraday',
    options_trader: 'options_trader',
    investor: 'long_term'
  };

  var SCRIP_FULL_NAMES = {
    RELIANCE: 'Reliance Industries',
    TATASTEEL: 'Tata Steel',
    HDFCBANK: 'HDFC Bank',
    INFY: 'Infosys',
    ICICIBANK: 'ICICI Bank',
    SBIN: 'State Bank of India',
    BHARTIARTL: 'Bharti Airtel',
    ITC: 'ITC',
    LT: 'Larsen & Toubro',
    KOTAKBANK: 'Kotak Mahindra Bank',
    ASIANPAINT: 'Asian Paints',
    HINDUNILVR: 'Hindustan Unilever'
  };

  /* Allowed signal types: Dividend, Earnings announced, O=H, Volume spike, Long Buildup, Price breakout. Only selected stocks have signals. */
  var PERSONA_ROW_DATA = [
    { scrip: 'RELIANCE', sub: 'NSE EQ', price: '2,412.50', pct: '+1.20%', green: true, signals: ['Dividend', 'O=H'], day_range: '2390–2430', open: '2,398', high: '2,425', low: '2,385', return_1w: '+0.8%', return_1m: '+2.1%', range_52w: '2510/2180', volume: '12.5L', vwap: '2,408', rsi: '58', pe_ttm: '22.5', market_cap: '16.2L Cr', dividend_yield: '0.4%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '2,411', ask: '2,413' },
    { scrip: 'TATASTEEL', sub: 'NSE EQ', price: '139.70', pct: '-2.07%', green: false, signals: ['Volume spike'], day_range: '138–142', open: '141', high: '142', low: '138', return_1w: '-1.2%', return_1m: '-4.0%', range_52w: '155/98', volume: '28.1L', vwap: '139.5', rsi: '42', pe_ttm: '5.8', market_cap: '1.7L Cr', dividend_yield: '2.1%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '139.65', ask: '139.75' },
    { scrip: 'HDFCBANK', sub: 'NSE EQ', price: '1,658.20', pct: '+0.81%', green: true, signals: ['Dividend'], day_range: '1645–1665', open: '1,652', high: '1,662', low: '1,648', return_1w: '+0.5%', return_1m: '+1.8%', range_52w: '1720/1580', volume: '8.2L', vwap: '1,656', rsi: '52', pe_ttm: '18.2', market_cap: '12.1L Cr', dividend_yield: '1.0%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '1,657', ask: '1,659' },
    { scrip: 'INFY', sub: 'NSE EQ', price: '1,489.00', pct: '-0.50%', green: false, signals: ['Earnings announced'], day_range: '1482–1495', open: '1,492', high: '1,496', low: '1,485', return_1w: '-0.3%', return_1m: '+0.5%', range_52w: '1620/1380', volume: '6.1L', vwap: '1,488', rsi: '48', pe_ttm: '24.0', market_cap: '6.2L Cr', dividend_yield: '2.8%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '1,488', ask: '1,490' },
    { scrip: 'ICICIBANK', sub: 'NSE EQ', price: '1,128.45', pct: '+1.85%', green: true, signals: ['O=H', 'Price breakout', 'Volume spike'], day_range: '1115–1132', open: '1,118', high: '1,132', low: '1,115', return_1w: '+2.1%', return_1m: '+4.2%', range_52w: '1180/980', volume: '15.2L', vwap: '1,125', rsi: '62', pe_ttm: '19.5', market_cap: '7.8L Cr', dividend_yield: '0.9%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '1,127', ask: '1,130' },
    { scrip: 'SBIN', sub: 'NSE EQ', price: '825.30', pct: '-0.95%', green: false, day_range: '822–835', open: '832', high: '836', low: '820', return_1w: '-1.5%', return_1m: '+0.8%', range_52w: '890/750', volume: '22.1L', vwap: '828', rsi: '38', pe_ttm: '8.2', market_cap: '7.3L Cr', dividend_yield: '1.8%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '824', ask: '827' },
    { scrip: 'BHARTIARTL', sub: 'NSE EQ', price: '1,385.60', pct: '+2.20%', green: true, signals: ['Long Buildup', 'Dividend'], day_range: '1360–1395', open: '1,358', high: '1,398', low: '1,355', return_1w: '+3.0%', return_1m: '+6.5%', range_52w: '1420/1180', volume: '5.8L', vwap: '1,378', rsi: '68', pe_ttm: '42.0', market_cap: '8.1L Cr', dividend_yield: '0.3%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '1,384', ask: '1,387' },
    { scrip: 'ITC', sub: 'NSE EQ', price: '478.90', pct: '+0.42%', green: true, day_range: '475–482', open: '476', high: '483', low: '474', return_1w: '+0.6%', return_1m: '+1.2%', range_52w: '520/420', volume: '12.1L', vwap: '477', rsi: '55', pe_ttm: '22.8', market_cap: '5.9L Cr', dividend_yield: '3.2%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '478', ask: '480' },
    { scrip: 'LT', sub: 'NSE EQ', price: '3,245.00', pct: '-1.10%', green: false, day_range: '3220–3280', open: '3,280', high: '3,285', low: '3,218', return_1w: '-2.0%', return_1m: '-0.5%', range_52w: '3580/3100', volume: '2.1L', vwap: '3,255', rsi: '45', pe_ttm: '28.5', market_cap: '9.2L Cr', dividend_yield: '0.5%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '3,242', ask: '3,248' },
    { scrip: 'KOTAKBANK', sub: 'NSE EQ', price: '1,785.40', pct: '+0.95%', green: true, signals: ['Volume spike', 'O=H'], day_range: '1770–1792', open: '1,772', high: '1,795', low: '1,768', return_1w: '+1.2%', return_1m: '+2.8%', range_52w: '1850/1680', volume: '4.5L', vwap: '1,782', rsi: '72', pe_ttm: '16.2', market_cap: '3.5L Cr', dividend_yield: '0.6%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '1,784', ask: '1,787' },
    { scrip: 'ASIANPAINT', sub: 'NSE EQ', price: '2,845.00', pct: '+1.50%', green: true, signals: ['Dividend', 'Price breakout'], day_range: '2810–2860', open: '2,802', high: '2,862', low: '2,798', return_1w: '+2.2%', return_1m: '+5.0%', range_52w: '2920/2580', volume: '1.2L', vwap: '2,838', rsi: '65', pe_ttm: '48.0', market_cap: '2.7L Cr', dividend_yield: '0.8%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '2,843', ask: '2,847' },
    { scrip: 'HINDUNILVR', sub: 'NSE EQ', price: '2,512.80', pct: '-0.30%', green: false, day_range: '2505–2525', open: '2,518', high: '2,528', low: '2,502', return_1w: '-0.5%', return_1m: '+1.0%', range_52w: '2680/2380', volume: '1.8L', vwap: '2,510', rsi: '42', pe_ttm: '52.0', market_cap: '5.9L Cr', dividend_yield: '1.2%', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '2,511', ask: '2,515' },
    { scrip: 'NIFTY 25550 CE', sub: 'NFO 26 FEB 26', price: '349.50', pct: '-27.71%', green: false, day_range: '340–360', open: '358', high: '362', low: '338', return_1w: '-2.1%', return_1m: '-8.0%', range_52w: '380/320', volume: '—', vwap: '352', rsi: '42', pe_ttm: '—', market_cap: '—', dividend_yield: '—', oi: '1.2L', oi_change: '+5.2%', pcr: '1.05', iv: '18.2%', bid: '348', ask: '351' },
    { scrip: 'BANKNIFTY 59500 PE', sub: 'NFO 10 FEB 26', price: '400.90', pct: '+11.45%', green: true, day_range: '385–410', open: '378', high: '412', low: '375', return_1w: '+3.2%', return_1m: '+12%', range_52w: '420/350', volume: '—', vwap: '398', rsi: '58', pe_ttm: '—', market_cap: '—', dividend_yield: '—', oi: '85K', oi_change: '-2.1%', pcr: '0.92', iv: '22.5%', bid: '399', ask: '403' },
    { scrip: 'NIFTY 25800 PE', sub: 'NFO 10 FEB 26', price: '275.45', pct: '-14.89%', green: false, day_range: '268–285', open: '288', high: '290', low: '272', return_1w: '-1.5%', return_1m: '-6.0%', range_52w: '310/260', volume: '—', vwap: '278', rsi: '35', pe_ttm: '—', market_cap: '—', dividend_yield: '—', oi: '2.1L', oi_change: '+8.5%', pcr: '1.12', iv: '16.8%', bid: '274', ask: '277' },
    { scrip: 'SENSEX 83200 CE', sub: 'NFO 11 FEB 25', price: '31.20', pct: '+22.83%', green: true, day_range: '28–34', open: '26', high: '32', low: '25', return_1w: '+5.0%', return_1m: '+18%', range_52w: '35/22', volume: '—', vwap: '29', rsi: '61', pe_ttm: '—', market_cap: '—', dividend_yield: '—', oi: '45K', oi_change: '-3.2%', pcr: '0.98', iv: '14.2%', bid: '30.5', ask: '31.8' },
    { scrip: 'NIFTY 25550 CE', sub: 'NFO 26 FEB 26', price: '4.20', pct: '-30.58%', green: false, day_range: '3.8–4.8', open: '5.2', high: '5.5', low: '4.0', return_1w: '-8.2%', return_1m: '-25%', range_52w: '6.5/3.1', volume: '—', vwap: '4.5', rsi: '28', pe_ttm: '—', market_cap: '—', dividend_yield: '—', oi: '3.5L', oi_change: '+12%', pcr: '1.08', iv: '28.5%', bid: '4.15', ask: '4.25' },
    { scrip: 'BANKNIFTY 59500 PE', sub: 'NFO 10 FEB 26', price: '10.97', pct: '+24.39%', green: true, day_range: '10–12', open: '9.2', high: '11.5', low: '8.8', return_1w: '+4.1%', return_1m: '+15%', range_52w: '12/8', volume: '—', vwap: '10.5', rsi: '55', pe_ttm: '—', market_cap: '—', dividend_yield: '—', oi: '1.8L', oi_change: '-5.0%', pcr: '0.95', iv: '20.1%', bid: '10.85', ask: '11.10' },
    { scrip: 'NIFTY 25800 PE', sub: 'NFO 10 FEB 26', price: '324.80', pct: '-21.92%', green: false, day_range: '318–332', open: '338', high: '340', low: '320', return_1w: '-4.0%', return_1m: '-12%', range_52w: '380/300', volume: '—', vwap: '328', rsi: '38', pe_ttm: '—', market_cap: '—', dividend_yield: '—', oi: '95K', oi_change: '+6.5%', pcr: '1.02', iv: '17.5%', bid: '323', ask: '327' },
    { scrip: 'SENSEX 83200 CE', sub: 'NFO 11 FEB 25', price: '139.70', pct: '+19.11%', green: true, day_range: '132–145', open: '128', high: '142', low: '125', return_1w: '+6.2%', return_1m: '+22%', range_52w: '155/98', volume: '—', vwap: '135', rsi: '52', pe_ttm: '—', market_cap: '—', dividend_yield: '—', oi: '62K', oi_change: '-4.2%', pcr: '1.01', iv: '15.8%', bid: '138', ask: '141' },
    { scrip: 'FINNIFTY 27700 CE', sub: 'NFO 26 FEB 26', price: '9,590.00', pct: '-4.20%', green: false, day_range: '9520–9680', open: '9,680', high: '9,700', low: '9,550', return_1w: '-0.8%', return_1m: '-2.5%', range_52w: '10200/9100', volume: '—', vwap: '9,600', rsi: '45', pe_ttm: '25.0', market_cap: '—', dividend_yield: '—', oi: '—', oi_change: '—', pcr: '—', iv: '—', bid: '9,585', ask: '9,595' }
  ];

  function getColumnsForPersona(personaId) {
    var key = PERSONA_TAB_TO_COLUMNS[personaId];
    var personaCols = (key && PERSONA_COLUMNS[key]) ? PERSONA_COLUMNS[key] : [];
    var base = ['price', 'pct_change'];
    var rest = personaCols.filter(function (c) { return c !== 'price' && c !== 'pct_change'; });
    return base.concat(rest);
  }

  function getSignalDisplay(signals) {
    if (!signals || !signals.length) return '';
    if (signals.length === 1) return signals[0];
    return signals[0] + ' + ' + signals.length;
  }

  function getSignalDisplayParts(signals) {
    if (!signals || !signals.length) return null;
    return { name: signals[0], count: signals.length };
  }

  function getDisplayScrip(row, isInvestor) {
    if (isInvestor && row.scrip && SCRIP_FULL_NAMES[row.scrip]) return SCRIP_FULL_NAMES[row.scrip];
    return row.scrip || '';
  }

  function isOptionsScrip(row) {
    return (row.sub || '').trim().indexOf('NFO') === 0;
  }

  function getDisplaySubtext(row, isInvestor) {
    if (isOptionsScrip(row)) return row.sub || '';
    if (!isInvestor) return row.sub || '';
    var exchange = (row.sub || '').split(/\s+/)[0] || '—';
    var signalText = getSignalDisplay(row.signals);
    if (!signalText) return exchange;
    return exchange + ' • ' + signalText;
  }

  function getDisplaySubtextHtml(row) {
    if (isOptionsScrip(row)) return (row.sub || '').replace(/</g, '&lt;');
    var exchange = (row.sub || '').split(/\s+/)[0] || '—';
    var signalHtml = buildSignalHtml(getSignalDisplayParts(row.signals));
    if (!signalHtml) return (exchange || '—').replace(/</g, '&lt;');
    return (exchange + ' • ') + signalHtml;
  }

  function getDisplaySubtextScripOnly(row) {
    if (isOptionsScrip(row)) return (row.sub || '').replace(/</g, '&lt;');
    var exchange = (row.sub || '').split(/\s+/)[0] || '—';
    return exchange;
  }

  function buildSignalHtml(parts) {
    if (!parts) return '';
    var nameEscaped = (parts.name || '').replace(/</g, '&lt;');
    if (parts.count <= 1) {
      return '<span class="list-row-signal list-row-signal-tag">' + nameEscaped + '</span>';
    }
    return '<span class="list-row-signal list-row-signal-wrap">' +
      '<span class="list-row-signal-tag">' + nameEscaped + '</span>' +
      '<span class="list-row-signal-circle" aria-label="' + parts.count + ' more">+' + parts.count + '</span>' +
    '</span>';
  }

  function renderStandardViewList() {
    var ul = document.getElementById('list-standard-list');
    if (!ul) return;
    ul.innerHTML = '';
    var isInvestor = currentPersonaId === 'investor';
    PERSONA_ROW_DATA.forEach(function (row, i) {
      if (i > 0) {
        var div = document.createElement('li');
        div.className = 'divider-h';
        ul.appendChild(div);
      }
      var li = document.createElement('li');
      li.className = 'row';
      var displayScrip = getDisplayScrip(row, isInvestor).replace(/</g, '&lt;');
      var displaySub = isInvestor ? getDisplaySubtextHtml(row) : (getDisplaySubtext(row, isInvestor).replace(/</g, '&lt;'));
      var signalParts = getSignalDisplayParts(row.signals);
      var symbolLine = isInvestor
        ? '<span class="heading-label">' + displayScrip + '</span>'
        : '<div class="list-row-symbol-signals">' +
            '<span class="heading-label">' + (row.scrip || '').replace(/</g, '&lt;') + '</span>' +
            buildSignalHtml(signalParts) +
          '</div>';
      li.innerHTML =
        '<div class="heading-combo">' +
          '<div class="content">' +
            '<div class="wrapper-container">' +
              symbolLine +
              '<span class="sub-heading">' + displaySub + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ltp-delta">' +
          '<div class="content">' +
            '<span class="ltp ' + (row.green ? 'green' : 'red') + '">' + (row.price || '').replace(/</g, '&lt;') + '</span>' +
            '<span class="sub-heading-1 gray">' + (row.pct || '').replace(/</g, '&lt;') + '</span>' +
          '</div>' +
        '</div>';
      ul.appendChild(li);
    });
  }

  var currentPersonaId = 'intraday';

  function renderPersonaTable(personaId) {
    currentPersonaId = personaId;
    var headerEl = document.getElementById('list-persona-header');
    var innerEl = document.getElementById('list-persona-inner');
    if (!headerEl || !innerEl) return;
    var cols = getColumnsForPersona(personaId);
    var idToLabel = {};
    COLUMNS_OPTIONS.forEach(function (c) { idToLabel[c.id] = c.label; });
    headerEl.innerHTML = '';
    var scripSpan = document.createElement('span');
    scripSpan.className = 'list-header-cell list-header-scrip';
    scripSpan.textContent = 'Scrip';
    headerEl.appendChild(scripSpan);
    cols.forEach(function (colId) {
      var span = document.createElement('span');
      span.className = colId === 'price' ? 'list-header-cell list-header-num list-header-price' : 'list-header-cell list-header-num';
      span.textContent = idToLabel[colId] || colId;
      headerEl.appendChild(span);
    });
    var sigHeader = document.createElement('span');
    sigHeader.className = 'list-header-cell list-multi-cell--signals-col';
    sigHeader.textContent = 'Signals';
    headerEl.appendChild(sigHeader);
    innerEl.innerHTML = '';
    var isInvestor = (personaId === 'investor');
    PERSONA_ROW_DATA.forEach(function (row) {
      var rowDiv = document.createElement('div');
      rowDiv.className = 'list-multi-row';
      var scripCell = document.createElement('span');
      scripCell.className = 'list-multi-cell list-multi-cell--scrip';
      var scripText = (getDisplayScrip(row, isInvestor) || '').replace(/</g, '&lt;');
      var subContent = isInvestor ? getDisplaySubtextScripOnly(row) : ((getDisplaySubtext(row, isInvestor) || '').replace(/</g, '&lt;'));
      scripCell.innerHTML = '<strong>' + scripText + '</strong><span class="list-multi-sub">' + subContent + '</span>';
      rowDiv.appendChild(scripCell);
      cols.forEach(function (colId) {
        var val = row[colId];
        if (val === undefined) val = '—';
        var span = document.createElement('span');
        span.className = 'list-multi-cell list-multi-cell--num';
        if (colId === 'price') span.classList.add('list-multi-cell--price');
        if (colId === 'price' || colId === 'pct_change') span.classList.add(row.green ? 'list-multi-cell--green' : 'list-multi-cell--red');
        span.textContent = val;
        rowDiv.appendChild(span);
      });
      var sigCell = document.createElement('span');
      sigCell.className = 'list-multi-cell list-multi-cell--signals-col';
      var parts = getSignalDisplayParts(row.signals);
      if (parts) {
        sigCell.innerHTML = buildSignalHtml(parts);
      } else {
        sigCell.textContent = '—';
      }
      rowDiv.appendChild(sigCell);
      innerEl.appendChild(rowDiv);
    });
  }

  function getColumnOrderFromStorage() {
    try {
      var raw = localStorage.getItem('watchlistColumnOrder');
      if (raw) {
        var order = JSON.parse(raw);
        if (Array.isArray(order) && order.length >= 2) return order;
      }
    } catch (e) {}
    return COLUMNS_OPTIONS.map(function (c) { return c.id; });
  }

  function getSelectedColumnsFromStorage() {
    try {
      var raw = localStorage.getItem('watchlistColumns');
      if (raw) {
        var cols = JSON.parse(raw);
        if (Array.isArray(cols)) return cols;
      }
    } catch (e) {}
    return ['price', 'pct_change'];
  }

  function renderPrefsColumnsList() {
    if (!prefsColumnsList) return;
    var order = getColumnOrderFromStorage();
    var selected = getSelectedColumnsFromStorage();
    var idToLabel = {};
    COLUMNS_OPTIONS.forEach(function (c) { idToLabel[c.id] = c.label; });
    prefsColumnsList.innerHTML = '';
    order.forEach(function (colId) {
      var label = idToLabel[colId] || colId;
      var isFixed = colId === 'price' || colId === 'pct_change';
      var li = document.createElement('li');
      li.className = 'prefs-col-row' + (isFixed ? ' prefs-col-row--fixed' : '');
      li.setAttribute('data-column', colId);
      if (!isFixed) li.draggable = true;
      li.innerHTML =
        '<input type="checkbox" class="prefs-col-checkbox" data-column="' + colId + '" ' +
          (selected.indexOf(colId) !== -1 ? 'checked' : '') + (isFixed ? ' disabled' : '') + ' />' +
        '<div class="prefs-col-label-wrap"><span class="prefs-col-label">' + (label || '').replace(/</g, '&lt;') + '</span></div>' +
        '<span class="prefs-col-drag" aria-label="Drag to reorder">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' +
        '</span>';
      prefsColumnsList.appendChild(li);
    });
    setupPrefsColumnsDrag();
  }

  if (prefsColumnsList) {
    prefsColumnsList.addEventListener('change', function (e) {
      if (e.target && e.target.classList && e.target.classList.contains('prefs-col-checkbox')) {
        moveSelectedColumnsToTop();
      }
    });
  }

  function getColumnOrderFromSheet() {
    if (!prefsColumnsList) return [];
    var out = [];
    prefsColumnsList.querySelectorAll('.prefs-col-row').forEach(function (li) {
      var col = li.getAttribute('data-column');
      if (col) out.push(col);
    });
    return out;
  }

  function getSelectedColumnsFromSheet() {
    if (!prefsColumnsList) return [];
    var out = [];
    prefsColumnsList.querySelectorAll('.prefs-col-row').forEach(function (li) {
      var cb = li.querySelector('.prefs-col-checkbox');
      if (cb && (cb.disabled || cb.checked)) out.push(li.getAttribute('data-column'));
    });
    return out;
  }

  function setupPrefsColumnsDrag() {
    if (!prefsColumnsList) return;
    var draggedLi = null;
    prefsColumnsList.querySelectorAll('.prefs-col-row').forEach(function (li) {
      if (li.classList.contains('prefs-col-row--fixed')) return;
      li.addEventListener('dragstart', function (e) {
        draggedLi = li;
        e.dataTransfer.setData('text/plain', li.getAttribute('data-column'));
        e.dataTransfer.effectAllowed = 'move';
        li.classList.add('dragging');
      });
      li.addEventListener('dragend', function () {
        li.classList.remove('dragging');
        draggedLi = null;
      });
      li.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      li.addEventListener('drop', function (e) {
        e.preventDefault();
        if (draggedLi && draggedLi !== li) {
          var rect = li.getBoundingClientRect();
          var mid = rect.top + rect.height / 2;
          if (e.clientY < mid) {
            prefsColumnsList.insertBefore(draggedLi, li);
          } else {
            prefsColumnsList.insertBefore(draggedLi, li.nextElementSibling);
          }
        }
      });
    });
  }

  function openColumnsSheet() {
    if (prefsColumnsOverlay) {
      prefsColumnsOverlay.classList.add('is-open');
      prefsColumnsOverlay.setAttribute('aria-hidden', 'false');
    }
    if (prefsColumnsSheet) {
      prefsColumnsSheet.classList.add('is-open');
      prefsColumnsSheet.setAttribute('aria-hidden', 'false');
      renderPrefsColumnsList();
      if (prefsPersonasSheet) {
        prefsPersonasSheet.querySelectorAll('.prefs-persona').forEach(function (p) { p.classList.remove('is-active'); });
      }
    }
  }

  function closeColumnsSheet() {
    if (prefsColumnsOverlay) {
      prefsColumnsOverlay.classList.remove('is-open');
      prefsColumnsOverlay.setAttribute('aria-hidden', 'true');
    }
    if (prefsColumnsSheet) {
      prefsColumnsSheet.classList.remove('is-open');
      prefsColumnsSheet.setAttribute('aria-hidden', 'true');
    }
  }

  function applyPersonaToSheet(personaId) {
    var cols = PERSONA_COLUMNS[personaId];
    if (!cols || !prefsColumnsList) return;
    prefsColumnsList.querySelectorAll('.prefs-col-checkbox').forEach(function (cb) {
      if (cb.disabled) return;
      cb.checked = cols.indexOf(cb.getAttribute('data-column')) !== -1;
    });
    if (prefsPersonasSheet) {
      prefsPersonasSheet.querySelectorAll('.prefs-persona').forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-persona') === personaId);
      });
    }
    moveSelectedColumnsToTop();
  }

  function moveSelectedColumnsToTop() {
    if (!prefsColumnsList) return;
    var rows = [].slice.call(prefsColumnsList.querySelectorAll('.prefs-col-row'));
    var fixed = [];
    var selected = [];
    var unselected = [];
    rows.forEach(function (li) {
      var col = li.getAttribute('data-column');
      var cb = li.querySelector('.prefs-col-checkbox');
      var isChecked = cb && (cb.disabled || cb.checked);
      if (col === 'price' || col === 'pct_change') {
        fixed.push(li);
      } else if (isChecked) {
        selected.push(li);
      } else {
        unselected.push(li);
      }
    });
    fixed.concat(selected, unselected).forEach(function (li) {
      prefsColumnsList.appendChild(li);
    });
  }

  function openPrefs() {
    if (prefsOverlay) {
      prefsOverlay.classList.add('is-open');
      prefsOverlay.setAttribute('aria-hidden', 'false');
    }
    if (prefsPanel) {
      prefsPanel.classList.add('is-open');
      prefsPanel.setAttribute('aria-hidden', 'false');
      var isMulti = listScrollWrap && listScrollWrap.classList.contains('layout-multi');
      if (prefsLayoutStandard) prefsLayoutStandard.checked = !isMulti;
      if (prefsLayoutMulti) prefsLayoutMulti.checked = isMulti;
      updateEditColumnsCtaVisibility();
      loadTagPrefs();
    }
  }

  function updateEditColumnsCtaVisibility() {
    if (prefsEditColumnsCta) {
      prefsEditColumnsCta.hidden = !(prefsLayoutMulti && prefsLayoutMulti.checked);
    }
  }

  function loadTagPrefs() {
    if (!prefsPanel) return;
    var stored = {};
    try {
      var raw = localStorage.getItem('watchlistTagPrefs');
      if (raw) stored = JSON.parse(raw);
    } catch (e) {}
    var defaults = { market_events: true, price_signals: true, momentum_technical_signals: true, derivatives: true };
    prefsPanel.querySelectorAll('.prefs-tags-cb').forEach(function (cb) {
      var key = cb.getAttribute('data-tag');
      if (key) cb.checked = stored[key] !== undefined ? stored[key] : defaults[key];
    });
  }

  function saveTagPrefs() {
    if (!prefsPanel) return;
    var prefs = {};
    prefsPanel.querySelectorAll('.prefs-tags-cb').forEach(function (cb) {
      var key = cb.getAttribute('data-tag');
      if (key) prefs[key] = cb.checked;
    });
    try {
      localStorage.setItem('watchlistTagPrefs', JSON.stringify(prefs));
    } catch (e) {}
  }

  function closePrefs() {
    closeColumnsSheet();
    if (prefsOverlay) {
      prefsOverlay.classList.remove('is-open');
      prefsOverlay.setAttribute('aria-hidden', 'true');
    }
    if (prefsPanel) {
      prefsPanel.classList.remove('is-open');
      prefsPanel.setAttribute('aria-hidden', 'true');
    }
  }

  if (prefsPanel && prefsOverlay) {
    if (prefsClose) prefsClose.addEventListener('click', closePrefs);
    if (prefsOverlay) prefsOverlay.addEventListener('click', closePrefs);
    if (prefsDone) {
      prefsDone.addEventListener('click', function () {
        var useMulti = prefsLayoutMulti && prefsLayoutMulti.checked;
        setMultiColumn(useMulti);
        try {
          if (prefsColumnsList) {
            localStorage.setItem('watchlistColumnOrder', JSON.stringify(getColumnOrderFromSheet()));
            localStorage.setItem('watchlistColumns', JSON.stringify(getSelectedColumnsFromSheet()));
          }
          saveTagPrefs();
        } catch (e) {}
        closePrefs();
      });
    }
    if (prefsLayoutStandard) {
      prefsLayoutStandard.addEventListener('change', function () {
        closeColumnsSheet();
        updateEditColumnsCtaVisibility();
      });
    }
    if (prefsLayoutMulti) {
      prefsLayoutMulti.addEventListener('change', function () {
        updateEditColumnsCtaVisibility();
      });
    }
    if (prefsEditColumnsCta) {
      prefsEditColumnsCta.addEventListener('click', function () {
        openColumnsSheet();
      });
    }
    if (prefsPersonasSheet) {
      prefsPersonasSheet.querySelectorAll('.prefs-persona').forEach(function (btn) {
        btn.addEventListener('click', function () {
          applyPersonaToSheet(btn.getAttribute('data-persona'));
        });
      });
    }
    if (prefsColumnsDone) {
      prefsColumnsDone.addEventListener('click', function () {
        try {
          localStorage.setItem('watchlistColumnOrder', JSON.stringify(getColumnOrderFromSheet()));
          localStorage.setItem('watchlistColumns', JSON.stringify(getSelectedColumnsFromSheet()));
        } catch (e) {}
        closeColumnsSheet();
      });
    }
    if (prefsColumnsOverlay) prefsColumnsOverlay.addEventListener('click', closeColumnsSheet);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (prefsColumnsSheet && prefsColumnsSheet.classList.contains('is-open')) closeColumnsSheet();
      else if (prefsPanel && prefsPanel.classList.contains('is-open')) closePrefs();
    });
  }

  setActiveTab('intraday');
})();
