// 每次打开页面都从最顶部开始显示（包括返回上一页、页面内容由脚本生成之后、以及网站被嵌在其他页面里时）
(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  const anchor = document.createElement('div');
  anchor.setAttribute('aria-hidden', 'true');
  anchor.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;';
  const toTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body && (document.body.scrollTop = 0);
  };
  const toTopAndFrame = () => {
    toTop();
    // 网站被嵌在其他页面（例如预览框）里时，也把外层滚回这个页面的顶部
    if (window.self !== window.top && anchor.isConnected) anchor.scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  toTop();
  document.addEventListener('DOMContentLoaded', () => { document.body.prepend(anchor); toTopAndFrame(); requestAnimationFrame(toTopAndFrame); });
  addEventListener('load', () => { toTopAndFrame(); setTimeout(toTop, 50); });
  addEventListener('pageshow', e => { if (e.persisted) toTopAndFrame(); });
})();

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
