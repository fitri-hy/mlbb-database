document.documentElement.classList.add('dark');

  function switchTab(categorySafeId) {
    const allContents = document.querySelectorAll('.tab-content');
    allContents.forEach(content => {
      content.classList.replace('block', 'hidden');
      content.classList.remove('animate-fade-in');
    });

    const allButtons = document.querySelectorAll('.tab-button');
    allButtons.forEach(btn => {
      btn.classList.remove('active-tab');
    });

    const activeContent = document.getElementById('content-' + categorySafeId);
    if (activeContent) {
      activeContent.classList.replace('hidden', 'block');
      activeContent.classList.add('animate-fade-in');
    }

    const activeBtn = document.getElementById('tab-btn-' + categorySafeId);
    if (activeBtn) {
      activeBtn.classList.add('active-tab');
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }
  
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        menuBtn.querySelector('svg').classList.toggle('rotate-90');
    });

    function toggleDropdown(id, el) {
        const menu = document.getElementById(id);
        const allMenus = el.closest('#mobileMenu').querySelectorAll('[id$="Menu"]');
        
        allMenus.forEach(m => {
            if (m.id !== id) m.classList.add('hidden');
        });

        menu.classList.toggle('hidden');
        const icon = el.querySelector('svg');
        icon.classList.toggle('rotate-180');
    }