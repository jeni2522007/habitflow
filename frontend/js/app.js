const API = 'https://habitflow-43vt.onrender.com/';

let habits        = [];
let selectedEmoji = '🎯';
let deleteTarget  = null;
const todayKey    = () => new Date().toISOString().slice(0, 10);

const MOTIVATIONS = {
  health:  ['Hydration is the first step to feeling great! 💧', 'Your body thanks you every sip!', 'Small habits, huge results! 🌿'],
  study:   ['Every minute of study builds your future! 📚', 'Focus mode ON! You got this! 🎯', 'Consistency beats talent. Amazing! ✨'],
  fitness: ['Your future self is cheering you on! 💪', 'Motion is medicine. Let us go! 🏃', 'You showed up — that is 80% of it!'],
  mindset: ['A calm mind is a powerful mind. 🧘', 'Breathe. You have got this.', 'Mental health is wealth! 🌸'],
  other:   ['Small steps every day. Unstoppable!', 'Progress is progress! ⭐', 'Keep the momentum! 🚀']
};

function getMotivation(cat, custom) {
  if (custom && custom.trim()) return custom;
  const arr = MOTIVATIONS[cat] || MOTIVATIONS.other;
  return arr[Math.floor(Math.random() * arr.length)];
}

// Emoji picker
const EMOJIS = ['💧','📚','🏃','🧘','😴','🥗','💪','🎯','📖','✍️','🎵','☀️','🌙','🍎','🧠'];
document.getElementById('emoji-row').innerHTML = EMOJIS.map(e =>
  `<button class="emoji-btn${e === '🎯' ? ' selected' : ''}" onclick="selectEmoji(this,'${e}')">${e}</button>`
).join('');

function selectEmoji(el, e) {
  document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  selectedEmoji = e;
}

// Load habits from backend
async function loadHabits() {
  try {
    const res  = await fetch(API);
    const json = await res.json();
    habits = json.data || [];
    render();
  } catch (err) {
    showToast('❌', 'Connection Error', 'Is the backend server running? Run: node backend/server.js');
    habits = [];
    render();
  }
}

// Add habit
async function addHabit() {
  const name = document.getElementById('h-name').value.trim();
  const time = document.getElementById('h-time').value;
  const cat  = document.getElementById('h-cat').value;
  const msg  = document.getElementById('h-msg').value.trim();

  if (!name) { showToast('⚠️', 'Missing Info', 'Please enter a habit name!'); return; }
  if (!time) { showToast('⚠️', 'Missing Info', 'Please set a reminder time!'); return; }

  try {
    const res  = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, emoji: selectedEmoji, category: cat, time, message: msg })
    });
    const json = await res.json();
    if (json.success) {
      showToast('✅', 'Habit Added!', `"${name}" tracked. Reminder at ${formatTime(time)} 🎉`);
      document.getElementById('h-name').value = '';
      document.getElementById('h-time').value = '';
      document.getElementById('h-msg').value  = '';
      await loadHabits();
    }
  } catch (err) {
    showToast('❌', 'Error', 'Could not save. Is server running?');
  }
}

// Toggle done
async function toggle(id) {
  const h = habits.find(x => x.id === id);
  if (!h) return;
  try {
    const res  = await fetch(`${API}/${id}/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: todayKey() })
    });
    const json = await res.json();
    if (json.success) {
      if (json.data.action === 'done') {
        showToast(h.emoji, 'Great Job!', `"${h.name}" done! Keep going! 💪`);
      } else {
        showToast('↩️', 'Undone', `"${h.name}" marked as not done.`);
      }
      await loadHabits();
    }
  } catch (err) {
    showToast('❌', 'Error', 'Could not update habit.');
  }
}

// Delete
function askDelete(id) { deleteTarget = id; document.getElementById('del-modal').style.display = 'flex'; }
function closeModal()   { deleteTarget = null; document.getElementById('del-modal').style.display = 'none'; }

async function confirmDelete() {
  try {
    await fetch(`${API}/${deleteTarget}`, { method: 'DELETE' });
    showToast('🗑️', 'Removed', 'Habit deleted.');
    closeModal();
    await loadHabits();
  } catch (err) { closeModal(); }
}

// Render
function render() {
  renderToday(); renderAll(); renderWeekly(); renderUpcoming(); renderStats(); renderRing();
}

function habitCard(h, showCheck = true) {
  const today = todayKey();
  const done  = (h.completedDays || []).includes(today);
  const barW  = Math.min(100, h.streak * 10);
  const catMap = { health:'Health', study:'Study', fitness:'Fitness', mindset:'Mindset', other:'Other' };
  return `
  <div class="habit-item${done ? ' done' : ''}">
    <div class="habit-emoji">${h.emoji}</div>
    <div class="habit-info">
      <div class="habit-name">${h.name}</div>
      <div class="habit-meta">
        <span class="habit-time-badge">⏰ ${formatTime(h.time)}</span>
        <span class="cat-tag cat-${h.category}">${catMap[h.category] || 'Other'}</span>
        <span>🔥 ${h.streak}d streak</span>
      </div>
    </div>
    <div class="habit-actions">
      ${showCheck ? `<div class="icon-btn check-btn" onclick="toggle(${h.id})">${done ? '↩️' : '✅'}</div>` : ''}
      <div class="icon-btn del-btn" onclick="askDelete(${h.id})">🗑️</div>
    </div>
    <div class="habit-streak-bar" style="width:${barW}%"></div>
  </div>`;
}

function renderToday() {
  const el = document.getElementById('habit-list');
  el.innerHTML = habits.length
    ? habits.map(h => habitCard(h)).join('')
    : '<div class="empty"><div class="empty-icon">🌟</div><p>No habits yet. Add your first one!</p></div>';
}

function renderAll() {
  const el = document.getElementById('all-habit-list');
  el.innerHTML = habits.length
    ? habits.map(h => habitCard(h, false)).join('')
    : '<div class="empty"><div class="empty-icon">📋</div><p>No habits yet.</p></div>';
}

function renderWeekly() {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();
  document.getElementById('week-grid').innerHTML = days.map((d, i) => {
    const dt = new Date(today); dt.setDate(today.getDate() - today.getDay() + i);
    const key = dt.toISOString().slice(0, 10);
    const isToday = i === today.getDay();
    const done = habits.filter(h => (h.completedDays || []).includes(key)).length;
    const cls = isToday ? 'today' : (done > 0 ? 'done' : 'empty');
    return `<div class="day-cell"><div class="day-name">${d}</div><div class="day-dot ${cls}">${done || ''}</div></div>`;
  }).join('');

  document.getElementById('weekly-details').innerHTML = habits.map(h => {
    const wDone = (h.completedDays || []).filter(d => (new Date() - new Date(d)) / 864e5 < 7 && (new Date() - new Date(d)) / 864e5 >= 0).length;
    const pct = Math.round(wDone / 7 * 100);
    return `<div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:5px;">
        <span>${h.emoji} ${h.name}</span>
        <span style="color:var(--muted);font-family:var(--mono)">${wDone}/7 days</span>
      </div>
      <div style="background:var(--border);border-radius:4px;height:6px;">
        <div style="background:var(--accent);height:6px;border-radius:4px;width:${pct}%"></div>
      </div>
    </div>`;
  }).join('') || '<div class="empty">No habits to show</div>';
}

function renderUpcoming() {
  const el = document.getElementById('upcoming-list');
  if (!habits.length) { el.innerHTML = '<div class="empty"><div class="empty-icon">🕐</div>Add habits to see schedule</div>'; return; }
  const now = new Date(); const today = todayKey();
  el.innerHTML = [...habits].sort((a,b) => a.time.localeCompare(b.time)).map(h => {
    const [hh,mm] = h.time.split(':').map(Number);
    const then = new Date(); then.setHours(hh,mm,0,0);
    const diff = (then - now) / 60000;
    const done = (h.completedDays || []).includes(today);
    let cls = 'later', countdown = '';
    if (done)         { cls = 'done';     countdown = '✅ done'; }
    else if (diff < 0)    { cls = 'later';    countdown = 'passed'; }
    else if (diff < 30)   { cls = 'soon';     countdown = `in ${Math.round(diff)}m`; }
    else              { cls = 'upcoming'; countdown = `in ${Math.floor(diff/60)}h ${Math.round(diff%60)}m`; }
    return `<div class="next-up">
      <div class="next-dot ${cls}"></div>
      <div class="next-info"><div class="next-name">${h.emoji} ${h.name}</div><div class="next-time">${formatTime(h.time)}</div></div>
      <div class="next-countdown">${countdown}</div>
    </div>`;
  }).join('');
}

function renderStats() {
  const today = todayKey();
  const done  = habits.filter(h => (h.completedDays||[]).includes(today)).length;
  const best  = habits.reduce((m,h) => Math.max(m,h.streak), 0);
  document.getElementById('s-done').textContent    = done;
  document.getElementById('s-total').textContent   = habits.length;
  document.getElementById('s-streak').textContent  = best;
  document.getElementById('s-pending').textContent = habits.length - done;
}

function renderRing() {
  const today = todayKey();
  const total = habits.length;
  const done  = habits.filter(h => (h.completedDays||[]).includes(today)).length;
  const pct   = total ? Math.round(done/total*100) : 0;
  document.getElementById('ring-circle').style.strokeDashoffset = 314 - (314*pct/100);
  document.getElementById('ring-pct').textContent = pct + '%';
}

function switchTab(el, tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['today','all','weekly'].forEach(t => {
    document.getElementById('tab-'+t).style.display = t===tab ? 'block' : 'none';
  });
}

// Clock + notifications
const notifiedToday = {};
function tick() {
  const now = new Date();
  const hhmm = now.toTimeString().slice(0,5);
  const today = todayKey();
  document.getElementById('clock').textContent = now.toTimeString().slice(0,8);
  habits.forEach(h => {
    const key = `${h.id}-${today}`;
    const done = (h.completedDays||[]).includes(today);
    if (h.time === hhmm && !notifiedToday[key] && !done) {
      notifiedToday[key] = true;
      const msg = getMotivation(h.category, h.message);
      showToast(h.emoji, `Time for: ${h.name}`, msg, 8000);
      if (Notification.permission === 'granted') new Notification(`⏰ ${h.name}`, { body: msg });
    }
  });
  renderUpcoming();
}
setInterval(tick, 1000);
tick();
if (Notification.permission === 'default') Notification.requestPermission();

function showToast(icon, title, msg, duration=4000) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-icon">${icon}</div>
    <div class="toast-body"><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div>
    <div class="toast-close" onclick="closeToast(this)">✕</div>`;
  c.appendChild(t);
  setTimeout(() => closeToast(t.querySelector('.toast-close')), duration);
}
function closeToast(btn) { const t=btn.closest('.toast'); t.classList.add('removing'); setTimeout(()=>t.remove(),300); }
function formatTime(t) {
  if (!t) return '';
  const [h,m] = t.split(':').map(Number);
  return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
}

loadHabits();