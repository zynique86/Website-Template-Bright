// 每次打开页面都从最顶部开始显示
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
addEventListener('load', () => window.scrollTo(0, 0));

(() => {
  // 标示当前所在页面（科目页归在「课程」下）
  const here = location.pathname.split('/').pop() || 'index.html';
  const subjectPages = ['math.html', 'english.html', 'chinese.html', 'science.html', 'exam.html', 'online.html'];
  const current = subjectPages.includes(here) ? 'courses.html' : here;
  document.querySelectorAll('.nav-links a, .nav-cta').forEach(a => {
    if (a.getAttribute('href') === current) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
  });

  // 手机版导航菜单
  const btn = document.getElementById('menuBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    btn.setAttribute('aria-expanded', false);
  }));
})();
