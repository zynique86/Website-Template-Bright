/* ==========================================================
   科目页 / 预约页逻辑
   <body data-subject="math"> 决定显示哪个科目；没有 data-subject 时显示科目选择。
   支持网址参数：?level=primary|secondary  ?t=老师id
   预约记录保存在浏览器 localStorage（接后端时替换 saveBooking / loadBookings）。
   ========================================================== */
(() => {
  const S = window.SITE;
  const app = document.getElementById('app');
  const params = new URLSearchParams(location.search);
  // 把科目里的老师引用展开成完整资料（老师资料集中在 SITE.teachers）
  S.subjects.forEach(s => { s.teachers = s.teachers.map(r => ({ ...S.teachers[r.id], id: r.id, slots: r.slots })); });
  const subject = S.subjects.find(s => s.id === document.body.dataset.subject);
  const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const KEY = 'brightpoint-bookings';

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const loadBookings = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const saveBookings = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} };
  const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nice = s => { const d = new Date(s + 'T00:00'); return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`; };
  const subj = id => S.subjects.find(s => s.id === id);

  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- 我的预约 ---------- */
  function renderMyBookings() {
    const box = document.getElementById('myBookings');
    if (!box) return;
    const list = loadBookings().filter(b => b.date >= ymd(new Date()));
    box.innerHTML = list.length ? list.map(b => {
      const s = subj(b.subject) || { name: b.subject, icon: '📘', color: 'bg-white' };
      return `<div class="booking-row">
        <span class="booking-icon ${s.color}">${s.icon}</span>
        <div><strong>${esc(s.name)} · ${esc(b.teacherName)}</strong><br>
          <span>${nice(b.date)} ${b.time} · ${esc(b.student)}（${esc(S.levels[b.level].name)}）</span></div>
        <button class="btn btn-sm btn-white" data-cancel="${b.id}">取消</button>
      </div>`;
    }).join('') : '<p class="muted">还没有预约。选好老师和时间，就会出现在这里。</p>';
    box.querySelectorAll('[data-cancel]').forEach(btn => btn.addEventListener('click', () => {
      if (!confirm('确定取消这堂试听课吗？')) return;
      saveBookings(loadBookings().filter(b => b.id !== btn.dataset.cancel));
      renderMyBookings();
      if (window.__rerender) window.__rerender();
      toast('已取消预约');
    }));
  }

  const myBookingsSection = `
    <section class="section" id="my">
      <div class="section-head"><span class="tag bg-orange">我的预约</span><h2>已预约的试听课</h2></div>
      <div class="box bg-white" id="myBookings"></div>
    </section>`;

  const otherSubjects = current => `
    <section class="section section-alt">
      <div class="section-head"><span class="tag bg-yellow">更多课程</span><h2>${current ? '也看看其他科目' : '选择想试听的科目'}</h2></div>
      <div class="grid-3">
        ${S.subjects.filter(s => s !== current).map(s => `
          <a class="box ${s.color} link-card" href="${s.page}${location.search.includes('level=') ? '?level=' + params.get('level') : ''}">
            <div class="icon">${s.icon}</div><h3>${s.name} →</h3><p>${s.tagline}</p>
          </a>`).join('')}
      </div>
    </section>`;

  /* ---------- 师资页 ---------- */
  const qualList = (label, icon, items) => items && items.length
    ? `<div class="qual"><h4>${icon} ${label}</h4><ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>` : '';

  if (document.body.dataset.page === 'teachers') {
    app.innerHTML = `
      <section class="page-hero">
        <nav class="crumbs"><a href="index.html">首页</a> / <span>师资</span></nav>
        <span class="tag bg-pink">师资团队</span>
        <h1>认识我们的<mark>老师</mark></h1>
        <p class="lead">每位老师都经过学历、教学资格和试教三重审核。以下是他们的学历、证书和教学成绩。</p>
      </section>
      <section class="section teacher-profiles">
        ${Object.entries(S.teachers).map(([id, t]) => {
          const teaches = S.subjects.filter(s => s.teachers.some(x => x.id === id));
          return `
          <article class="box bg-white profile" id="${id}">
            <div class="profile-head ${t.color}">
              <span class="teacher-face">${t.emoji}</span>
              <div><h2>${esc(t.name)}</h2><span class="tag bg-white">${esc(t.title)} · ${t.years} 年教龄</span></div>
            </div>
            <div class="profile-body">
              <p>${esc(t.bio)}</p>
              <div class="quals">
                ${qualList('学历', '🎓', t.education)}
                ${qualList('证书与资格', '📜', t.certs)}
                ${qualList('教学成绩', '🏆', t.achievements)}
              </div>
              <div class="profile-actions">
                ${teaches.map(s => `<a class="btn btn-sm btn-white" href="${s.page}?t=${id}">预约${s.name} →</a>`).join('')}
              </div>
            </div>
          </article>`;
        }).join('')}
      </section>`;
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
    return;
  }

  /* ---------- 无科目：预约总入口 ---------- */
  if (!subject) {
    app.innerHTML = `
      <section class="page-hero">
        <span class="tag bg-mint">✦ 免费试听</span>
        <h1>预约一堂<mark>免费</mark>试听课</h1>
        <p class="lead">先选科目，再选老师和时间。整个过程不到一分钟。</p>
      </section>
      ${otherSubjects(null)}
      ${myBookingsSection}`;
    renderMyBookings();
    return;
  }

  /* ---------- 科目页 ---------- */
  document.title = `${subject.name} · ${S.name}`;
  const priceOf = lv => subject.price ? `${S.currency}${subject.price}<small>${subject.unit}</small>`
                                      : `${S.currency}${S.levels[lv].price}<small>${S.levels[lv].unit}</small>`;

  const state = {
    level: subject.levels.includes(params.get('level')) ? params.get('level') : subject.levels[0],
    teacher: subject.teachers.find(t => t.id === params.get('t')) || null,
    date: null, time: null
  };

  app.innerHTML = `
    <section class="page-hero">
      <nav class="crumbs"><a href="index.html">首页</a> / <a href="index.html#features">课程</a> / <span>${subject.name}</span></nav>
      <div class="subject-head">
        <div class="icon icon-lg ${subject.color}">${subject.icon}</div>
        <div>
          <h1>${subject.name}</h1>
          <p class="lead">${subject.tagline}</p>
        </div>
      </div>
      <ul class="pill-list">${subject.highlights.map(h => `<li>✓ ${h}</li>`).join('')}</ul>
    </section>

    <section class="section booking" id="book">
      <div class="booking-steps">
        <div class="box bg-white step">
          <h3><span class="num bg-yellow">1</span>选择年级</h3>
          <div class="chips" id="levelChips"></div>
        </div>
        <div class="box bg-white step">
          <h3><span class="num bg-pink">2</span>选择老师</h3>
          <div class="teacher-grid" id="teacherList"></div>
        </div>
        <div class="box bg-white step">
          <h3><span class="num bg-mint">3</span>选择日期</h3>
          <div class="chips date-chips" id="dateChips"></div>
        </div>
        <div class="box bg-white step">
          <h3><span class="num bg-blue">4</span>选择时间</h3>
          <div class="chips" id="timeChips"></div>
        </div>
        <form class="box bg-white step" id="infoForm" novalidate>
          <h3><span class="num bg-orange">5</span>填写资料</h3>
          <div class="fields">
            <label>学生姓名<input name="student" required placeholder="例如：王小明"></label>
            <label>家长电话<input name="phone" type="tel" required placeholder="例如：012-345 6789"></label>
            <label class="full">备注（选填）<textarea name="note" rows="3" placeholder="孩子目前的学习情况、想加强的部分…"></textarea></label>
          </div>
        </form>
      </div>

      <aside class="box bg-yellow summary" id="summary"></aside>
    </section>

    ${myBookingsSection}
    ${otherSubjects(subject)}`;

  const $ = id => document.getElementById(id);

  function upcomingDates(t) {
    const out = [], d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 21 && out.length < 8; i++) {
      const x = new Date(d); x.setDate(d.getDate() + i);
      if (t.slots[x.getDay()]) out.push(ymd(x));
    }
    return out;
  }
  const taken = (t, date, time) => loadBookings().some(b => b.subject === subject.id && b.teacher === t.id && b.date === date && b.time === time);

  function render() {
    $('levelChips').innerHTML = subject.levels.map(lv =>
      `<button type="button" class="chip ${state.level === lv ? 'on' : ''}" data-level="${lv}">${S.levels[lv].name}</button>`).join('');

    $('teacherList').innerHTML = subject.teachers.map(t => `
      <div class="teacher-wrap">
        <button type="button" class="teacher ${state.teacher === t ? 'on' : ''}" data-teacher="${t.id}">
          <span class="teacher-face">${t.emoji}</span>
          <span><strong>${t.name}</strong><small>${t.title} · ${t.years} 年教龄</small><em>${t.bio}</em>
            <span class="mini-quals"><span>🎓 ${t.education[0]}</span>${t.certs.map(c => `<span>📜 ${c}</span>`).join('')}</span></span>
        </button>
        <a class="quals-link" href="teachers.html#${t.id}">查看完整资质 →</a>
      </div>`).join('');

    if (!state.teacher) {
      $('dateChips').innerHTML = '<p class="muted">请先选择老师</p>';
    } else {
      $('dateChips').innerHTML = upcomingDates(state.teacher).map(d => {
        const dt = new Date(d + 'T00:00');
        return `<button type="button" class="chip date ${state.date === d ? 'on' : ''}" data-date="${d}">
          <small>${WEEK[dt.getDay()]}</small><strong>${dt.getDate()}</strong><small>${dt.getMonth() + 1}月</small></button>`;
      }).join('');
    }

    if (!state.date) {
      $('timeChips').innerHTML = `<p class="muted">${state.teacher ? '请先选择日期' : '请先选择老师和日期'}</p>`;
    } else {
      const day = new Date(state.date + 'T00:00').getDay();
      $('timeChips').innerHTML = state.teacher.slots[day].map(tm => {
        const full = taken(state.teacher, state.date, tm);
        return `<button type="button" class="chip ${state.time === tm ? 'on' : ''}" data-time="${tm}" ${full ? 'disabled' : ''}>${tm}${full ? ' · 已约' : ''}</button>`;
      }).join('');
    }

    const ready = state.teacher && state.date && state.time;
    $('summary').innerHTML = `
      <h3>预约摘要</h3>
      <dl>
        <dt>科目</dt><dd>${subject.icon} ${subject.name}</dd>
        <dt>年级</dt><dd>${S.levels[state.level].name}</dd>
        <dt>老师</dt><dd>${state.teacher ? state.teacher.name : '—'}</dd>
        <dt>日期</dt><dd>${state.date ? nice(state.date) : '—'}</dd>
        <dt>时间</dt><dd>${state.time || '—'}</dd>
      </dl>
      <p class="price">${priceOf(state.level)}</p>
      <p class="muted">第一堂试听课免费，满意再报名。</p>
      <button class="btn btn-dark btn-block" id="confirmBtn" ${ready ? '' : 'disabled'}>${ready ? '确认预约' : '请完成以上选择'}</button>`;
    $('confirmBtn').addEventListener('click', confirmBooking);
  }
  window.__rerender = render;

  app.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    if (b.dataset.level) { state.level = b.dataset.level; render(); }
    else if (b.dataset.teacher) {
      state.teacher = subject.teachers.find(t => t.id === b.dataset.teacher);
      state.date = state.time = null; render();
      $('dateChips').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    else if (b.dataset.date) { state.date = b.dataset.date; state.time = null; render(); }
    else if (b.dataset.time) { state.time = b.dataset.time; render(); }
  });

  function confirmBooking() {
    const form = $('infoForm');
    const student = form.student.value.trim();
    const phone = form.phone.value.trim();
    form.student.classList.toggle('invalid', !student);
    const phoneOk = /^[+\d][\d\s-]{6,}$/.test(phone);
    form.phone.classList.toggle('invalid', !phoneOk);
    if (!student || !phoneOk) {
      toast(!student ? '请填写学生姓名' : '请填写正确的家长电话');
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (taken(state.teacher, state.date, state.time)) { toast('这个时段刚被预约了，请换一个时间'); render(); return; }

    const booking = {
      id: Date.now().toString(36), subject: subject.id, level: state.level,
      teacher: state.teacher.id, teacherName: state.teacher.name,
      date: state.date, time: state.time, student, phone, note: form.note.value.trim()
    };
    saveBookings([...loadBookings(), booking]);
    document.querySelector('.toast')?.classList.remove('show');
    showDone(booking);
    form.reset();
    form.phone.value = booking.phone;
    try { localStorage.setItem('brightpoint-phone', booking.phone); } catch {}
    state.date = state.time = null;
    render(); renderMyBookings();
  }

  function showDone(b) {
    const msg = `您好，我想确认试听课预约：${subject.name}（${S.levels[b.level].name}），${b.teacherName}，${nice(b.date)} ${b.time}，学生：${b.student}，电话：${b.phone}`;
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `
      <div class="box bg-white modal-card" role="dialog" aria-modal="true" aria-labelledby="doneTitle">
        <div class="icon icon-lg bg-mint">🎉</div>
        <h2 id="doneTitle">预约成功！</h2>
        <p><strong>${subject.name} · ${esc(b.teacherName)}</strong><br>${nice(b.date)} ${b.time}<br>学生：${esc(b.student)}</p>
        <p class="muted">我们会在一个工作日内致电 ${esc(b.phone)} 确认。</p>
        <div class="modal-actions">
          <a class="btn btn-pink" target="_blank" rel="noopener" href="https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}">WhatsApp 确认</a>
          <button class="btn btn-white" data-close>完成</button>
        </div>
      </div>`;
    document.body.appendChild(m);
    const close = () => m.remove();
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
    m.querySelector('[data-close]').focus();
  }

  render();
  renderMyBookings();
  try { const ph = localStorage.getItem('brightpoint-phone'); if (ph) $('infoForm').phone.value = ph; } catch {}
  if (state.teacher || params.has('level')) document.getElementById('book').scrollIntoView();
})();
