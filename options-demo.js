(function () {
  var panels = document.querySelectorAll('.demo-panel');
  var chips = document.querySelectorAll('.demo-chip');
  var tabs = document.querySelectorAll('.demo-tab');
  var tabPanels = document.querySelectorAll('.demo-tab-panel');
  var collapseHeads = document.querySelectorAll('.demo-collapse-head');

  function showPanel(option) {
    panels.forEach(function (p) {
      var match = p.id === 'panel-' + option;
      p.setAttribute('aria-hidden', !match);
    });
    chips.forEach(function (c) {
      c.setAttribute('aria-pressed', c.getAttribute('data-option') === option ? 'true' : 'false');
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      showPanel(chip.getAttribute('data-option'));
    });
  });

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabName = tab.getAttribute('data-tab');
      tabs.forEach(function (t) {
        t.classList.toggle('demo-tab-active', t.getAttribute('data-tab') === tabName);
      });
      tabPanels.forEach(function (p) {
        var isMatch = p.id === 'tab-' + tabName;
        p.classList.toggle('demo-tab-panel--hidden', !isMatch);
      });
    });
  });

  collapseHeads.forEach(function (head) {
    head.addEventListener('click', function () {
      var collapse = head.closest('.demo-collapse');
      var body = collapse && collapse.querySelector('.demo-collapse-body');
      var path = head.querySelector('.demo-collapse-icon path');
      if (!body) return;
      var isOpen = !body.classList.contains('demo-collapse-body--closed');
      body.classList.toggle('demo-collapse-body--closed', isOpen);
      head.classList.toggle('demo-collapse-head--open', !isOpen);
      head.setAttribute('aria-expanded', !isOpen);
      if (path) {
        path.setAttribute('d', isOpen ? 'M6 9l6 6 6-6' : 'M18 15l-6-6-6 6');
      }
    });
  });
})();
