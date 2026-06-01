

// ---------------------------
// common.js（支持侧边栏语言切换）
// ---------------------------

// 提前在 HTML 上标记语言，避免闪烁
const savedLang = localStorage.getItem('language') || 'zh';
document.documentElement.setAttribute('data-lang', savedLang);


// 初始化侧边栏语言
function initSidebarLanguage() {
  const lang = localStorage.getItem('language') || 'zh';
  const sidebarElements = document.querySelectorAll('#sidebar [data-zh]');
  
  sidebarElements.forEach(el => {
    const zh = el.dataset.zh;
    const en = el.dataset.en;
    if (zh && en) {
      el.textContent = lang === 'zh' ? zh : en;
    }
  });

  // 显示/隐藏 sidebar 底部单一语言按钮（如果你用 updateSidebarLangButton 控制的话，可不用此处处理）
  // updateSidebarLangButton(); // 如果需要，可以在这里调用（可选）

  // 初始化侧边栏语言完成，解除隐藏（消除闪烁）
  document.body.classList.add('sidebar-ready');
}


// 初始化页面内容语言
function initPageContentLanguage() {
  const lang = localStorage.getItem('language') || 'zh';
  const contentElements = document.querySelectorAll('main [data-zh], [data-zh]:not(#sidebar *)');
  
  contentElements.forEach(el => {
    const zh = el.dataset.zh;
    const en = el.dataset.en;
    if (zh && en) {
      if (zh.includes('<br>') || en.includes('<br>')) {
        el.innerHTML = lang === 'zh' ? zh : en;
      } else {
        el.textContent = lang === 'zh' ? zh : en;
      }
    }
  });
}

// 初始化完整页面语言
function initFullPageLanguage() {
  initSidebarLanguage();
  initPageContentLanguage();
}

// 高亮当前页面
function highlightCurrentPage() {
  const links = document.querySelectorAll('nav a');
  let currentPage = window.location.pathname.split('/').pop().split('?')[0].split('#')[0];
  
  // 处理各种情况
  if (!currentPage || currentPage === '' || currentPage === '/') {
    currentPage = 'index.html';
  }
  
  // 确保有 .html 扩展名
  if (currentPage && !currentPage.includes('.')) {
    currentPage += '.html';
  }
  
  console.log('当前页面:', currentPage);
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    // 移除可能存在的 active 类
    link.classList.remove('active');
    
    // 检查是否匹配当前页面
    if (href === currentPage) {
      link.classList.add('active');
      console.log('高亮链接:', href);
    }
  });
}

// ---------------------------
// 侧边栏语言按钮（只显示一个）
// ---------------------------
function updateSidebarLangButton() {
  const lang = localStorage.getItem('language') || 'zh';
  const langSwitch = document.querySelector('#lang-switch');
  if (!langSwitch) return;

  const btnCN = langSwitch.querySelector('[data-lang="zh"]');
  const btnEN = langSwitch.querySelector('[data-lang="en"]');

  // 当前语言按钮隐藏，另一语言按钮显示
  if (lang === 'zh') {
    btnCN.style.display = 'none';
    btnEN.style.display = 'block';
  } else {
    btnCN.style.display = 'block';
    btnEN.style.display = 'none';
  }

  // 点击切换语言
  [btnCN, btnEN].forEach(btn => {
    btn.onclick = () => {
      const newLang = btn.dataset.lang;
      localStorage.setItem('language', newLang);
      initFullPageLanguage();
      updateSidebarLangButton();
    };
  });
}

// ---------------------------
// 页面加载完成
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  // 加载 sidebar
  fetch('sidebar.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('sidebar-placeholder').innerHTML = html;

      setTimeout(() => {
        initFullPageLanguage();
        highlightCurrentPage();
        updateSidebarLangButton();
      }, 100);
    })
    .catch(err => {
      console.error('加载侧边栏失败:', err);
      initPageContentLanguage();
    });

  // sparkle 动画
  for (let i = 0; i < 100; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.top = Math.random() * 100 + 'vh';
    sparkle.style.left = Math.random() * 100 + 'vw';
    sparkle.style.animationDelay = Math.random() * 5 + 's';
    sparkle.style.animationDuration = 1 + Math.random() * 2 + 's';
    document.body.appendChild(sparkle);
  }
});
