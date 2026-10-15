/* ==========================================================
   科目页 / 预约页 / 报名页 / 师资页逻辑
   <body data-subject="math">   科目页（含「预约试听」与「直接报名」两个流程）
   <body data-mode="enroll">    报名总入口；没有 data-mode 时为试听预约总入口
   <body data-page="teachers">  师资页
   网址参数：?mode=trial|enroll  ?level=primary|secondary  ?t=老师id
   记录保存在浏览器 localStorage（接后端时替换 loadRecords / saveRecords）。
   ========================================================== */
(() => {
  const S = window.SITE;
  const E = S.enroll;
  const app = document.getElementById('app');
  const params = new URLSearchParams(location.search);
  // 把科目里的老师引用展开成完整资料（老师资料集中在 SITE.teachers）
  S.subjects.forEach(s => { s.teachers = s.teachers.map(r => ({ ...S.teachers[r.id], id: r.id, slots: r.slots })); });
  const subject = S.subjects.find(s => s.id === document.body.dataset.subject);
  const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const KEY = 'brightpoint-bookings';

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const loadRecords = () => { try { return (JSON.parse(localStorage.getItem(KEY)) || []).map(r => ({ type: 'trial', ...r })); } catch { return []; } };
  const saveRecords = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} };
  const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nice = s => { const d = new Date(s + 'T00:00'); return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`; };
  const money = n => `${S.currency}${Math.round(n).toLocaleString()}`;
  const subj = id => S.subjects.find(s => s.id === id);
  const phoneOk = v => /^[+\d][\d\s-]{6,}$/.test(v);

  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- 我的预约与报名 ---------- */
  function renderMyRecords() {
    const box = document.getElementById('myBookings');
    if (!box) return;
    const today = ymd(new Date());
    const list = loadRecords().filter(r => r.type === 'enroll' || r.date >= today);
    box.innerHTML = list.length ? list.map(r => {
      const s = subj(r.subject) || { name: r.subject, icon: '📘', color: 'bg-white' };
      const detail = r.type === 'enroll'
        ? `每${WEEK[r.day]} ${r.time} · ${nice(r.start)} 开课 · ${esc(r.student)}（${esc(r.grade)}）`
        : `${nice(r.date)} ${r.time} · ${esc(r.student)}（${esc(S.levels[r.level].name)}）`;
      return `<div class="booking-row">
        <span class="booking-icon ${s.color}">${s.icon}</span>
        <div><span class="kind ${r.type === 'enroll' ? 'bg-pink' : 'bg-mint'}">${r.type === 'enroll' ? '报名' : '试听'}</span>
          <strong>${esc(s.name)} · ${esc(r.teacherName)}</strong><br><span>${detail}</span></div>
        <button class="btn btn-sm btn-white" data-cancel="${r.id}" data-type="${r.type}">取消</button>
      </div>`;
    }).join('') : '<p class="muted">还没有预约或报名记录。</p>';
    box.querySelectorAll('[data-cancel]').forEach(btn => btn.addEventListener('click', () => {
      const isEnroll = btn.dataset.type === 'enroll';
      if (!confirm(isEnroll ? '确定取消这项报名吗？' : '确定取消这堂试听课吗？')) return;
      saveRecords(loadRecords().filter(r => r.id !== btn.dataset.cancel));
      renderMyRecords();
      if (window.__rerender) window.__rerender();
      toast(isEnroll ? '已取消报名' : '已取消预约');
    }));
  }

  const myRecordsSection = `
    <section class="section" id="my">
      <div class="section-head"><span class="tag bg-orange">我的记录</span><h2>我的试听与报名</h2></div>
      <div class="box bg-white" id="myBookings"></div>
    </section>`;

  const subjectLink = (s, mode) => {
    const q = new URLSearchParams();
    if (mode === 'enroll') q.set('mode', 'enroll');
    if (params.get('level')) q.set('level', params.get('level'));
    return s.page + (q.toString() ? '?' + q : '');
  };
  const otherSubjects = (current, mode) => `
    <section class="section section-alt">
      <div class="section-head"><span class="tag bg-yellow">${current ? '更多课程' : '第一步'}</span>
        <h2>${current ? '也看看其他科目' : mode === 'enroll' ? '选择要报名的科目' : '选择想试听的科目'}</h2></div>
      <div class="grid-3">
        ${S.subjects.filter(s => s !== current).map(s => `
          <a class="box ${s.color} link-card" href="${subjectLink(s, mode)}">
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
          <article class="box bg-white profile ${params.get('t') === id ? 'picked' : ''}" id="${id}">
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
                ${teaches.map(s => `<a class="btn btn-sm btn-white" href="${s.page}?t=${id}">${s.name}：试听 / 报名 →</a>`).join('')}
              </div>
            </div>
          </article>`;
        }).join('')}
      </section>`;
    return;
  }

  /* ---------- 课程总览页 ---------- */
  const page = document.body.dataset.page;
  if (page === 'courses') {
    app.innerHTML = `
      <section class="page-hero">
        <nav class="crumbs"><a href="index.html">首页</a> / <span>课程</span></nav>
        <span class="tag bg-yellow">全部课程</span>
        <h1>每一科，都有<mark>专人</mark>带。</h1>
        <p class="lead">小学、中学全科辅导，每班最多 ${E.classSize} 人。点进科目可以看详情、选老师，预约试听或直接报名。</p>
      </section>
      <section class="section course-list">
        ${S.subjects.map(s => `
          <article class="box ${s.color} course-card">
            <div class="course-top">
              <div class="icon">${s.icon}</div>
              <div><h2>${s.name}</h2><p>${s.tagline}</p></div>
            </div>
            <ul class="pill-list">${s.highlights.map(h => `<li>✓ ${h}</li>`).join('')}</ul>
            <p class="course-meta"><strong>${s.price ? `${money(s.price)}${s.unit}` : `${money(S.levels.primary.price)} 起${S.levels.primary.unit}`}</strong> · 老师：${s.teachers.map(t => t.name).join('、')}</p>
            <div class="course-actions">
              <a class="btn btn-dark" href="${s.page}?mode=enroll">立即报名</a>
              <a class="btn btn-white" href="${s.page}">预约试听</a>
              <a class="btn btn-white" href="${s.page}">课程详情 →</a>
            </div>
          </article>`).join('')}
      </section>`;
    return;
  }

  /* ---------- 收费页 ---------- */
  if (page === 'pricing') {
    const exam = S.subjects.find(s => s.price);
    const plan = (name, price, unit, items, links, hot) => `
      <article class="box ${hot ? 'bg-yellow plan-hot' : 'bg-white'} plan">
        ${hot ? '<span class="badge bg-pink">最多家长选择</span>' : ''}
        <h3>${name}</h3>
        <p class="price">${money(price)}<small>${unit}</small></p>
        <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
        <div class="plan-btns">${links}</div>
      </article>`;
    app.innerHTML = `
      <section class="page-hero">
        <nav class="crumbs"><a href="index.html">首页</a> / <span>收费</span></nav>
        <span class="tag bg-blue">收费</span>
        <h1>学费<mark>透明</mark>，没有隐藏收费。</h1>
        <p class="lead">第一堂试听课免费。正式报名时收取一次性报名费 ${money(E.registrationFee)}，之后按所选缴费方式缴付学费。</p>
      </section>
      <section class="section">
        <div class="grid-3 pricing">
          ${plan('小学班', S.levels.primary.price, S.levels.primary.unit, ['每周 1 堂，每堂 1.5 小时', `每班最多 ${E.classSize} 人`, '每月学习报告'],
            '<a class="btn btn-dark" href="enroll.html?level=primary">立即报名</a><a class="btn btn-white" href="book.html?level=primary">预约试听</a>')}
          ${plan('中学班', S.levels.secondary.price, S.levels.secondary.unit, ['每周 1 堂，每堂 2 小时', `每班最多 ${E.classSize} 人`, '每月学习报告', '课后答疑群'],
            '<a class="btn btn-dark" href="enroll.html?level=secondary">立即报名</a><a class="btn btn-white" href="book.html?level=secondary">预约试听</a>', true)}
          ${exam ? plan(exam.name, exam.price, exam.unit, exam.highlights.slice(0, 3),
            `<a class="btn btn-dark" href="${exam.page}?mode=enroll">立即报名</a><a class="btn btn-white" href="${exam.page}">预约试听</a>`) : ''}
        </div>
      </section>
      <section class="section section-alt">
        <div class="section-head"><span class="tag bg-mint">缴费方式</span><h2>预缴越久，越划算。</h2></div>
        <div class="grid-3">
          ${E.plans.map((p, i) => `
            <article class="box ${['bg-white', 'bg-mint', 'bg-pink'][i % 3]}">
              <h3>${p.name}</h3>
              <p>小学班 ${money(S.levels.primary.price * p.months * (1 - p.discount))} / 中学班 ${money(S.levels.secondary.price * p.months * (1 - p.discount))}<br>（每次缴 ${p.months} 个月）</p>
            </article>`).join('')}
        </div>
        <p class="muted fee-note">报名费 ${money(E.registrationFee)}（一次性）。${esc(E.terms)}</p>
      </section>`;
    return;
  }

  /* ---------- 我的记录页 ---------- */
  if (page === 'records') {
    app.innerHTML = `
      <section class="page-hero">
        <nav class="crumbs"><a href="index.html">首页</a> / <span>我的记录</span></nav>
        <span class="tag bg-orange">我的记录</span>
        <h1>我的试听与<mark>报名</mark></h1>
        <p class="lead">在这台设备上预约的试听课和报名记录都在这里，可以随时取消。</p>
        <div class="hero-actions"><a class="btn btn-pink" href="enroll.html">立即报名 →</a><a class="btn btn-white" href="book.html">预约试听</a></div>
      </section>
      <section class="section records-only"><div class="box bg-white" id="myBookings"></div></section>`;
    renderMyRecords();
    return;
  }

  /* ---------- 无科目：试听 / 报名总入口 ---------- */
  if (!subject) {
    const enroll = document.body.dataset.mode === 'enroll';
    app.innerHTML = enroll ? `
      <section class="page-hero">
        <span class="tag bg-pink">✦ 立即报名</span>
        <h1>直接<mark>报名</mark>上课</h1>
        <p class="lead">已经决定了？选科目、老师和固定上课时段，填好资料就完成报名。想先体验一下，可以<a class="text-link" href="book.html">预约免费试听</a>。</p>
      </section>
      ${otherSubjects(null, 'enroll')}
      ${myRecordsSection}` : `
      <section class="page-hero">
        <span class="tag bg-mint">✦ 免费试听</span>
        <h1>预约一堂<mark>免费</mark>试听课</h1>
        <p class="lead">先选科目，再选老师和时间，不到一分钟。已经决定上课的话，可以<a class="text-link" href="enroll.html">直接报名</a>。</p>
      </section>
      ${otherSubjects(null, 'trial')}
      ${myRecordsSection}`;
    renderMyRecords();
    return;
  }

  /* ---------- 科目页 ---------- */
  document.title = `${subject.name} · ${S.name}`;
  const isExam = !!subject.price;
  const monthly = lv => subject.price || S.levels[lv].price;

  const state = {
    mode: params.get('mode') === 'enroll' ? 'enroll' : 'trial',
    level: subject.levels.includes(params.get('level')) ? params.get('level') : subject.levels[0],
    teacher: subject.teachers.find(t => t.id === params.get('t')) || null,
    date: null, time: null,           // 试听：日期 + 时间
    slot: null, start: null,          // 报名：固定时段 {day, time} + 开课日期
    plan: E.plans[0].id
  };

  app.innerHTML = `
    <section class="page-hero">
      <nav class="crumbs"><a href="index.html">首页</a> / <a href="courses.html">课程</a> / <span>${subject.name}</span></nav>
      <div class="subject-head">
        <div class="icon icon-lg ${subject.color}">${subject.icon}</div>
        <div>
          <h1>${subject.name}</h1>
          <p class="lead">${subject.tagline}</p>
        </div>
      </div>
      <ul class="pill-list">${subject.highlights.map(h => `<li>✓ ${h}</li>`).join('')}</ul>
    </section>

    <div class="mode-tabs" id="book" role="tablist">
      <button type="button" role="tab" class="mode-tab" data-mode="trial"><span>🎟️</span><strong>预约免费试听</strong><small>先上一堂体验课</small></button>
      <button type="button" role="tab" class="mode-tab" data-mode="enroll"><span>📝</span><strong>直接报名</strong><small>选定固定时段开始上课</small></button>
    </div>

    <section class="section booking">
      <div class="booking-steps" id="steps"></div>
      <aside class="box summary" id="summary"></aside>
    </section>

    ${myRecordsSection}
    ${otherSubjects(subject, state.mode)}`;

  const $ = id => document.getElementById(id);
  const records = () => loadRecords().filter(r => r.subject === subject.id);

  // 试听：未来有课的日期
  function upcomingDates(t) {
    const out = [], d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 21 && out.length < 8; i++) {
      const x = new Date(d); x.setDate(d.getDate() + i);
      if (t.slots[x.getDay()]) out.push(ymd(x));
    }
    return out;
  }
  const trialTaken = (t, date, time) => records().some(r => r.type === 'trial' && r.teacher === t.id && r.date === date && r.time === time);

  // 报名：固定时段与名额（示范用：已有学生数按时段固定生成）
  const weeklySlots = t => [1, 2, 3, 4, 5, 6, 0].flatMap(day => (t.slots[day] || []).map(time => ({ day, time })));
  const seeded = (t, s) => [...`${subject.id}${t.id}${s.day}${s.time}`].reduce((a, c) => a + c.charCodeAt(0), 0) % 5 + 3;
  const seatsLeft = (t, s) => E.classSize - seeded(t, s) - records().filter(r => r.type === 'enroll' && r.teacher === t.id && r.day === s.day && r.time === s.time).length;
  function startDates(day) {
    const out = [], d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 1; out.length < 4; i++) {
      const x = new Date(d); x.setDate(d.getDate() + i);
      if (x.getDay() === day) out.push(ymd(x));
    }
    return out;
  }
  function fees() {
    if (isExam) return { tuition: subject.price, label: `冲刺班学费（1 期）`, discount: 0, reg: E.registrationFee };
    const p = E.plans.find(x => x.id === state.plan);
    const tuition = monthly(state.level) * p.months;
    return { tuition, label: `学费 ${money(monthly(state.level))} × ${p.months} 个月`, discount: tuition * p.discount, reg: E.registrationFee };
  }

  const stepBox = (n, color, title, body, extra = '') =>
    `<div class="box bg-white step" ${extra}><h3><span class="num ${color}">${n}</span>${title}</h3>${body}</div>`;

  function buildSteps() {
    const enroll = state.mode === 'enroll';
    const common = stepBox(1, 'bg-yellow', '选择年级', '<div class="chips" id="levelChips"></div>')
                 + stepBox(2, 'bg-pink', '选择老师', '<div class="teacher-grid" id="teacherList"></div>');
    if (!enroll) {
      $('steps').innerHTML = common
        + stepBox(3, 'bg-mint', '选择试听日期', '<div class="chips date-chips" id="dateChips"></div>')
        + stepBox(4, 'bg-blue', '选择时间', '<div class="chips" id="timeChips"></div>')
        + `<form class="box bg-white step" id="infoForm" novalidate>
            <h3><span class="num bg-orange">5</span>填写资料</h3>
            <div class="fields">
              <label>学生姓名<input name="student" required placeholder="例如：王小明"></label>
              <label>家长电话<input name="phone" type="tel" required placeholder="例如：012-345 6789"></label>
              <label class="full">备注（选填）<textarea name="note" rows="3" placeholder="孩子目前的学习情况、想加强的部分…"></textarea></label>
            </div>
          </form>`;
    } else {
      $('steps').innerHTML = common
        + stepBox(3, 'bg-mint', '选择固定上课时段', '<p class="muted step-note">每周同一时间上课，每班最多 ' + E.classSize + ' 人。</p><div class="chips" id="slotChips"></div>')
        + stepBox(4, 'bg-blue', '选择开课日期', '<div class="chips date-chips" id="startChips"></div>')
        + `<form class="box bg-white step" id="infoForm" novalidate>
            <h3><span class="num bg-orange">5</span>学生与家长资料</h3>
            <div class="fields">
              <label>学生姓名<input name="student" required placeholder="例如：王小明"></label>
              <label>就读年级<select name="grade" required></select></label>
              <label>就读学校（选填）<input name="school" placeholder="例如：育才小学"></label>
              <label>家长姓名<input name="parent" required placeholder="例如：王太太"></label>
              <label>家长电话<input name="phone" type="tel" required placeholder="例如：012-345 6789"></label>
              <label>电邮（选填）<input name="email" type="email" placeholder="用于接收收据"></label>
              <label class="full">备注（选填）<textarea name="note" rows="2" placeholder="过敏、特殊需要、想加强的部分…"></textarea></label>
            </div>
          </form>`
        + (isExam ? '' : stepBox(6, 'bg-yellow', '选择缴费方式', '<div class="plan-options" id="planChips"></div>'));
      fillGrades();
    }
    try { const ph = localStorage.getItem('brightpoint-phone'); if (ph) $('infoForm').phone.value = ph; } catch {}
  }

  function fillGrades() {
    const sel = $('infoForm')?.grade;
    if (!sel) return;
    const keep = sel.value;
    sel.innerHTML = '<option value="">请选择</option>' + S.levels[state.level].grades.map(g => `<option ${g === keep ? 'selected' : ''}>${g}</option>`).join('');
  }

  function render() {
    const enroll = state.mode === 'enroll';
    document.querySelectorAll('.mode-tab').forEach(b => {
      const on = b.dataset.mode === state.mode;
      b.classList.toggle('on', on); b.setAttribute('aria-selected', on);
    });

    $('levelChips').innerHTML = subject.levels.map(lv =>
      `<button type="button" class="chip ${state.level === lv ? 'on' : ''}" data-level="${lv}">${S.levels[lv].name}</button>`).join('');

    $('teacherList').innerHTML = subject.teachers.map(t => `
      <div class="teacher-wrap">
        <button type="button" class="teacher ${state.teacher === t ? 'on' : ''}" data-teacher="${t.id}">
          <span class="teacher-face">${t.emoji}</span>
          <span><strong>${t.name}</strong><small>${t.title} · ${t.years} 年教龄</small><em>${t.bio}</em>
            <span class="mini-quals"><span>🎓 ${t.education[0]}</span>${t.certs.map(c => `<span>📜 ${c}</span>`).join('')}</span></span>
        </button>
        <a class="quals-link" href="teachers.html?t=${t.id}">查看完整资质 →</a>
      </div>`).join('');

    if (!enroll) renderTrial(); else renderEnroll();
  }
  window.__rerender = render;

  function renderTrial() {
    $('dateChips').innerHTML = !state.teacher ? '<p class="muted">请先选择老师</p>'
      : upcomingDates(state.teacher).map(d => {
          const dt = new Date(d + 'T00:00');
          return `<button type="button" class="chip date ${state.date === d ? 'on' : ''}" data-date="${d}">
            <small>${WEEK[dt.getDay()]}</small><strong>${dt.getDate()}</strong><small>${dt.getMonth() + 1}月</small></button>`;
        }).join('');

    if (!state.date) {
      $('timeChips').innerHTML = `<p class="muted">${state.teacher ? '请先选择日期' : '请先选择老师和日期'}</p>`;
    } else {
      const day = new Date(state.date + 'T00:00').getDay();
      $('timeChips').innerHTML = state.teacher.slots[day].map(tm => {
        const full = trialTaken(state.teacher, state.date, tm);
        return `<button type="button" class="chip ${state.time === tm ? 'on' : ''}" data-time="${tm}" ${full ? 'disabled' : ''}>${tm}${full ? ' · 已约' : ''}</button>`;
      }).join('');
    }

    const ready = state.teacher && state.date && state.time;
    $('summary').className = 'box summary bg-yellow';
    $('summary').innerHTML = `
      <h3>试听预约摘要</h3>
      <dl>
        <dt>科目</dt><dd>${subject.icon} ${subject.name}</dd>
        <dt>年级</dt><dd>${S.levels[state.level].name}</dd>
        <dt>老师</dt><dd>${state.teacher ? state.teacher.name : '—'}</dd>
        <dt>日期</dt><dd>${state.date ? nice(state.date) : '—'}</dd>
        <dt>时间</dt><dd>${state.time || '—'}</dd>
      </dl>
      <p class="price">免费</p>
      <p class="muted">满意再报名，正式学费 ${money(monthly(state.level))}${isExam ? subject.unit : S.levels[state.level].unit}。</p>
      <button class="btn btn-dark btn-block" id="confirmBtn" ${ready ? '' : 'disabled'}>${ready ? '确认预约试听' : '请完成以上选择'}</button>`;
    $('confirmBtn').addEventListener('click', confirmTrial);
  }

  function renderEnroll() {
    $('slotChips').innerHTML = !state.teacher ? '<p class="muted">请先选择老师</p>'
      : weeklySlots(state.teacher).map(s => {
          const left = seatsLeft(state.teacher, s);
          const on = state.slot && state.slot.day === s.day && state.slot.time === s.time;
          return `<button type="button" class="chip slot ${on ? 'on' : ''}" data-day="${s.day}" data-slot-time="${s.time}" ${left <= 0 ? 'disabled' : ''}>
            <strong>每${WEEK[s.day]} ${s.time}</strong><small>${left <= 0 ? '已满' : `剩 ${left} 位`}</small></button>`;
        }).join('');

    $('startChips').innerHTML = !state.slot ? `<p class="muted">${state.teacher ? '请先选择上课时段' : '请先选择老师和时段'}</p>`
      : startDates(state.slot.day).map(d => {
          const dt = new Date(d + 'T00:00');
          return `<button type="button" class="chip date ${state.start === d ? 'on' : ''}" data-start="${d}">
            <small>${WEEK[dt.getDay()]}</small><strong>${dt.getDate()}</strong><small>${dt.getMonth() + 1}月</small></button>`;
        }).join('');

    if ($('planChips')) {
      $('planChips').innerHTML = E.plans.map(p => `
        <button type="button" class="plan-option ${state.plan === p.id ? 'on' : ''}" data-plan="${p.id}">
          <strong>${p.name}</strong><small>${money(monthly(state.level) * p.months * (1 - p.discount))} / ${p.months} 个月</small></button>`).join('');
    }

    const f = fees();
    const total = f.tuition - f.discount + f.reg;
    const ready = state.teacher && state.slot && state.start;
    $('summary').className = 'box summary bg-pink';
    $('summary').innerHTML = `
      <h3>报名摘要</h3>
      <dl>
        <dt>科目</dt><dd>${subject.icon} ${subject.name}</dd>
        <dt>年级</dt><dd>${S.levels[state.level].name}</dd>
        <dt>老师</dt><dd>${state.teacher ? state.teacher.name : '—'}</dd>
        <dt>时段</dt><dd>${state.slot ? `每${WEEK[state.slot.day]} ${state.slot.time}` : '—'}</dd>
        <dt>开课</dt><dd>${state.start ? nice(state.start) : '—'}</dd>
      </dl>
      <div class="fee-lines">
        <div><span>${f.label}</span><span>${money(f.tuition)}</span></div>
        ${f.discount ? `<div><span>预缴优惠</span><span>−${money(f.discount)}</span></div>` : ''}
        <div><span>报名费（一次性）</span><span>${money(f.reg)}</span></div>
        <div class="fee-total"><span>应缴合计</span><span>${money(total)}</span></div>
      </div>
      <label class="agree"><input type="checkbox" id="agree"> 我已阅读并同意<a href="#" id="termsLink">报名须知</a></label>
      <button class="btn btn-dark btn-block" id="confirmBtn" ${ready ? '' : 'disabled'}>${ready ? '确认报名' : '请完成以上选择'}</button>`;
    $('confirmBtn').addEventListener('click', confirmEnroll);
    $('termsLink').addEventListener('click', e => { e.preventDefault(); showModal('📋', '报名须知', `<p>${esc(E.terms)}</p>`, '<button class="btn btn-dark" data-close>我知道了</button>'); });
  }

  function setMode(mode) {
    if (mode === state.mode) return;
    state.mode = mode;
    state.date = state.time = state.slot = state.start = null;
    const q = new URLSearchParams(location.search);
    mode === 'enroll' ? q.set('mode', 'enroll') : q.delete('mode');
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
    document.querySelectorAll('a.link-card').forEach(a => {
      const u = new URL(a.href);
      mode === 'enroll' ? u.searchParams.set('mode', 'enroll') : u.searchParams.delete('mode');
      a.href = u.href;
    });
    buildSteps(); render();
  }

  app.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || b.disabled) return;
    if (b.classList.contains('mode-tab')) setMode(b.dataset.mode);
    else if (b.dataset.level) { state.level = b.dataset.level; fillGrades(); render(); }
    else if (b.dataset.teacher) {
      state.teacher = subject.teachers.find(t => t.id === b.dataset.teacher);
      state.date = state.time = state.slot = state.start = null; render();
      ($('dateChips') || $('slotChips')).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    else if (b.dataset.date) { state.date = b.dataset.date; state.time = null; render(); }
    else if (b.dataset.time) { state.time = b.dataset.time; render(); }
    else if (b.dataset.day) { state.slot = { day: +b.dataset.day, time: b.dataset.slotTime }; state.start = null; render(); }
    else if (b.dataset.start) { state.start = b.dataset.start; render(); }
    else if (b.dataset.plan) { state.plan = b.dataset.plan; render(); }
  });

  // 必填检查：返回第一个错误信息，同时标红
  function check(form, rules) {
    let msg = null;
    for (const [name, ok, text] of rules) {
      const bad = !ok(form[name].value.trim());
      form[name].classList.toggle('invalid', bad);
      if (bad && !msg) msg = text;
    }
    if (msg) { toast(msg); form.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return !msg;
  }
  const filled = v => !!v;

  function afterSave(record) {
    document.querySelector('.toast')?.classList.remove('show');
    // 提交成功后清空所有选择和填写的资料，回到初始状态
    try { localStorage.removeItem('brightpoint-phone'); } catch {}
    state.level = subject.levels[0];
    state.teacher = null;
    state.date = state.time = state.slot = state.start = null;
    state.plan = E.plans[0].id;
    buildSteps(); render(); renderMyRecords();
  }

  function confirmTrial() {
    const form = $('infoForm');
    if (!check(form, [['student', filled, '请填写学生姓名'], ['phone', phoneOk, '请填写正确的家长电话']])) return;
    if (trialTaken(state.teacher, state.date, state.time)) { toast('这个时段刚被预约了，请换一个时间'); render(); return; }
    const r = {
      type: 'trial', id: Date.now().toString(36), subject: subject.id, level: state.level,
      teacher: state.teacher.id, teacherName: state.teacher.name,
      date: state.date, time: state.time,
      student: form.student.value.trim(), phone: form.phone.value.trim(), note: form.note.value.trim()
    };
    saveRecords([...loadRecords(), r]);
    const msg = `您好，我想确认试听课预约：${subject.name}（${S.levels[r.level].name}），${r.teacherName}，${nice(r.date)} ${r.time}，学生：${r.student}，电话：${r.phone}`;
    showModal('🎉', '试听预约成功！',
      `<p><strong>${subject.name} · ${esc(r.teacherName)}</strong><br>${nice(r.date)} ${r.time}<br>学生：${esc(r.student)}</p>
       <p class="muted">我们会在一个工作日内致电 ${esc(r.phone)} 确认。</p>`,
      `<a class="btn btn-pink" target="_blank" rel="noopener" href="https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}">WhatsApp 确认</a>
       <button class="btn btn-white" data-close>完成</button>`);
    afterSave(r);
  }

  function confirmEnroll() {
    const form = $('infoForm');
    if (!check(form, [
      ['student', filled, '请填写学生姓名'], ['grade', filled, '请选择就读年级'],
      ['parent', filled, '请填写家长姓名'], ['phone', phoneOk, '请填写正确的家长电话'],
      ['email', v => !v || /^\S+@\S+\.\S+$/.test(v), '电邮格式不正确']
    ])) return;
    if (!$('agree').checked) { toast('请先阅读并同意报名须知'); $('agree').closest('label').classList.add('shake'); setTimeout(() => $('agree').closest('label')?.classList.remove('shake'), 500); return; }
    if (seatsLeft(state.teacher, state.slot) <= 0) { toast('这个时段刚好满了，请换一个时段'); render(); return; }

    const f = fees();
    const total = f.tuition - f.discount + f.reg;
    const plan = isExam ? '按期缴费' : E.plans.find(p => p.id === state.plan).name;
    const r = {
      type: 'enroll', id: Date.now().toString(36), no: 'BP' + String(Date.now()).slice(-6),
      subject: subject.id, level: state.level, teacher: state.teacher.id, teacherName: state.teacher.name,
      day: state.slot.day, time: state.slot.time, start: state.start, plan, total,
      student: form.student.value.trim(), grade: form.grade.value, school: form.school.value.trim(),
      parent: form.parent.value.trim(), phone: form.phone.value.trim(), email: form.email.value.trim(), note: form.note.value.trim()
    };
    saveRecords([...loadRecords(), r]);
    const msg = `您好，我已在网站报名：报名编号 ${r.no}，${subject.name}（${r.grade}），${r.teacherName}，每${WEEK[r.day]} ${r.time}，${nice(r.start)} 开课，学生：${r.student}，家长：${r.parent}，电话：${r.phone}，应缴：${money(total)}（${plan}）`;
    showModal('🎓', '报名成功！',
      `<p class="enroll-no">报名编号 <strong>${r.no}</strong></p>
       <p><strong>${subject.name} · ${esc(r.teacherName)}</strong><br>每${WEEK[r.day]} ${r.time} · ${nice(r.start)} 开课<br>学生：${esc(r.student)}（${esc(r.grade)}）</p>
       <p>应缴合计 <strong>${money(total)}</strong>（${plan}）</p>
       <p class="muted">我们会在一个工作日内致电 ${esc(r.phone)}，确认班级并告知缴费方式。</p>`,
      `<a class="btn btn-pink" target="_blank" rel="noopener" href="https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}">WhatsApp 发送报名资料</a>
       <button class="btn btn-white" data-close>完成</button>`);
    afterSave(r);
  }

  function showModal(icon, title, body, actions) {
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `
      <div class="box bg-white modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="icon icon-lg bg-mint">${icon}</div>
        <h2 id="modalTitle">${title}</h2>
        ${body}
        <div class="modal-actions">${actions}</div>
      </div>`;
    document.body.appendChild(m);
    const close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    m.querySelector('[data-close]').focus();
  }

  buildSteps();
  render();
  renderMyRecords();
})();
