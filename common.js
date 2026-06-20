// ---------------------------
// common.js（支持侧边栏加载、语言切换、当前页面高亮）
// ---------------------------

// 读取当前语言；默认中文
function getCurrentLanguage() {
  return localStorage.getItem('language') || 'zh';
}

// 页面刚开始就把语言标记写到 <html> 上，减少闪烁
const savedLang = getCurrentLanguage();
document.documentElement.setAttribute('data-lang', savedLang);
document.documentElement.lang = savedLang === 'zh' ? 'zh-CN' : 'en';

// 应用语言到页面中所有带 data-zh / data-en 的元素
function applyLanguage(lang = getCurrentLanguage()) {
  localStorage.setItem('language', lang);
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  document.querySelectorAll('[data-zh][data-en]').forEach(el => {
    const value = lang === 'zh' ? el.dataset.zh : el.dataset.en;
    if (value == null) return;

    // <title> 比较特殊，直接改 document.title
    if (el.tagName === 'TITLE') {
      document.title = value;
      return;
    }

    // 如果文本里有 <br>，保留换行
    if (
      value.includes('<br>') ||
      value.includes('<br/>') ||
      value.includes('<br />')
    ) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });
}

// 暴露给 index.html 里的入口按钮使用
window.applyLanguage = applyLanguage;

function initFullPageLanguage() {
  applyLanguage(getCurrentLanguage());
}

window.initFullPageLanguage = initFullPageLanguage;

// 高亮当前页面对应的 sidebar 链接
function highlightCurrentPage() {
  const links = document.querySelectorAll('nav a');
  let currentPage = window.location.pathname
    .split('/')
    .pop()
    .split('?')[0]
    .split('#')[0];

  if (!currentPage || currentPage === '' || currentPage === '/') {
    currentPage = 'index.html';
  }

  if (currentPage && !currentPage.includes('.')) {
    currentPage += '.html';
  }

  links.forEach(link => {
    const href = link.getAttribute('href');
    link.classList.remove('active');

    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

// 控制 sidebar 里的语言按钮：只显示“另一种语言”的按钮
function updateSidebarLangButton() {
  const lang = getCurrentLanguage();
  const langSwitch = document.querySelector('#lang-switch');
  if (!langSwitch) return;

  const btnCN = langSwitch.querySelector('[data-lang="zh"]');
  const btnEN = langSwitch.querySelector('[data-lang="en"]');

  if (!btnCN || !btnEN) return;

  if (lang === 'zh') {
    btnCN.style.display = 'none';
    btnEN.style.display = 'block';
  } else {
    btnCN.style.display = 'block';
    btnEN.style.display = 'none';
  }

  [btnCN, btnEN].forEach(btn => {
    btn.onclick = () => {
      const newLang = btn.dataset.lang;
      applyLanguage(newLang);
      updateSidebarLangButton();
    };
  });
}

// sidebar 加载完成后统一初始化
function finishSidebarSetup() {
  initFullPageLanguage();
  highlightCurrentPage();
  updateSidebarLangButton();

  // 如果 style.css 里用 body.sidebar-ready 控制 sidebar 显示，这句很重要
  document.body.classList.add('sidebar-ready');

  // 通知 index.html：sidebar 已经加载完成
  document.dispatchEvent(new Event('sidebarLoaded'));
}

// 加载 sidebar.html
function loadSidebar() {
  const sidebarPlaceholder = document.getElementById('sidebar-placeholder');

  // 有些页面如果没有 sidebar-placeholder，也正常应用语言
  if (!sidebarPlaceholder) {
    initFullPageLanguage();
    document.body.classList.add('sidebar-ready');
    return;
  }

  fetch('sidebar.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`sidebar.html 加载失败：${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      sidebarPlaceholder.innerHTML = html;
      finishSidebarSetup();
    })
    .catch(err => {
      console.error('加载侧边栏失败:', err);
      initFullPageLanguage();
      document.body.classList.add('sidebar-ready');
    });
}

// 创建 sparkle 背景动画
function createSparkles() {
  for (let i = 0; i < 100; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.top = Math.random() * 100 + 'vh';
    sparkle.style.left = Math.random() * 100 + 'vw';
    sparkle.style.animationDelay = Math.random() * 5 + 's';
    sparkle.style.animationDuration = 1 + Math.random() * 2 + 's';
    document.body.appendChild(sparkle);
  }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  loadSidebar();
  createSparkles();
});