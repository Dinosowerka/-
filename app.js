/**
 * app.js — ПОКОЛЕНИЕ Community Stats
 * localStorage-based data store for 3 clubs: sport, english, reading
 * No backend required.
 */

/* ================================================================
   STORE — localStorage abstraction
   ================================================================ */
const Store = (function () {

  const KEYS = {
    sport:   'pokolenie_sport',
    english: 'pokolenie_english',
    reading: 'pokolenie_reading',
  };

  /** Return the full data object for a club. */
  function get(clubId) {
    try {
      const raw = localStorage.getItem(KEYS[clubId]);
      return raw ? JSON.parse(raw) : { members: [], logs: [] };
    } catch (e) {
      return { members: [], logs: [] };
    }
  }

  /** Persist the full data object for a club. */
  function save(clubId, data) {
    try {
      localStorage.setItem(KEYS[clubId], JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  }

  /** Generate a simple unique ID. */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /**
   * Add a new member to a club.
   * Returns false if a member with the same name already exists.
   */
  function addMember(clubId, name) {
    const data = get(clubId);
    const normalized = name.trim();
    if (!normalized) return false;

    const exists = data.members.some(
      m => m.name.toLowerCase() === normalized.toLowerCase()
    );
    if (exists) return false;

    data.members.push({
      id:       uid(),
      name:     normalized,
      sessions: 0,
      score:    0,
      streak:   0,
      lastDate: null,
      joinedAt: new Date().toISOString(),
    });
    save(clubId, data);
    return true;
  }

  /**
   * Remove a member and all associated logs.
   */
  function removeMember(clubId, memberId) {
    const data = get(clubId);
    data.members = data.members.filter(m => m.id !== memberId);
    data.logs    = (data.logs || []).filter(l => l.memberId !== memberId);
    save(clubId, data);
  }

  /**
   * Log an activity for a member.
   * type: 'attendance' | 'completion' | 'bonus'
   * points: number
   * note: string (optional)
   */
  function logActivity(clubId, memberId, type, points, note) {
    const data   = get(clubId);
    const member = data.members.find(m => m.id === memberId);
    if (!member) return false;

    const today = todayStr();

    // Update member stats
    member.score    = (member.score    || 0) + points;
    member.sessions = (member.sessions || 0) + (type === 'attendance' ? 1 : 0);

    // Streak logic: increment if today or consecutive day
    if (member.lastDate !== today) {
      const yesterday = yesterdayStr();
      if (member.lastDate === yesterday) {
        member.streak = (member.streak || 0) + 1;
      } else if (member.lastDate === null || member.lastDate < yesterday) {
        // Streak broken or first activity
        member.streak = 1;
      }
      member.lastDate = today;
    }

    // Append log entry
    if (!data.logs) data.logs = [];
    data.logs.push({
      id:         uid(),
      memberId:   memberId,
      memberName: member.name,
      type:       type,
      points:     points,
      note:       note || '',
      date:       new Date().toISOString(),
    });

    save(clubId, data);
    return true;
  }

  /** Return today as YYYY-MM-DD string (local time). */
  function todayStr() {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
  }

  /** Return yesterday as YYYY-MM-DD string. */
  function yesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
  }

  /** Get aggregate stats for a single club. */
  function getClubStats(clubId) {
    const data = get(clubId);
    const members = data.members || [];
    return {
      memberCount: members.length,
      totalScore:  members.reduce((s, m) => s + (m.score    || 0), 0),
      totalSessions: members.reduce((s, m) => s + (m.sessions || 0), 0),
      maxStreak:   members.reduce((mx, m) => Math.max(mx, m.streak || 0), 0),
    };
  }

  /** Get aggregate stats across all clubs. */
  function getGlobalStats() {
    const clubs = Object.keys(KEYS);
    return clubs.reduce((acc, clubId) => {
      const s = getClubStats(clubId);
      acc.memberCount   += s.memberCount;
      acc.totalScore    += s.totalScore;
      acc.totalSessions += s.totalSessions;
      acc.maxStreak      = Math.max(acc.maxStreak, s.maxStreak);
      return acc;
    }, { memberCount: 0, totalScore: 0, totalSessions: 0, maxStreak: 0 });
  }

  /** Export all data as a JSON string (for backup). */
  function exportAll() {
    const out = {};
    Object.keys(KEYS).forEach(k => { out[k] = get(k); });
    return JSON.stringify(out, null, 2);
  }

  /** Import data from a JSON string (from backup). */
  function importAll(jsonStr) {
    const obj = JSON.parse(jsonStr);
    Object.keys(KEYS).forEach(k => {
      if (obj[k]) save(k, obj[k]);
    });
  }

  /** Clear all data for all clubs. */
  function clearAll() {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  }

  // Public API
  return {
    get,
    save,
    addMember,
    removeMember,
    logActivity,
    getClubStats,
    getGlobalStats,
    exportAll,
    importAll,
    clearAll,
  };
})();


/* ================================================================
   TOAST NOTIFICATION
   ================================================================ */
let _toastTimer = null;

function showToast(message, icon) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = `<span>${icon || '✅'}</span> ${message}`;
  el.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}


/* ================================================================
   SEED DATA (runs once on first load)
   ================================================================ */
(function seedDemoData() {
  // Only seed if all clubs are empty
  const allEmpty = ['sport', 'english', 'reading'].every(id => {
    const d = Store.get(id);
    return (d.members || []).length === 0;
  });
  if (!allEmpty) return;

  // Sport
  Store.addMember('sport', 'Алексей Морозов');
  Store.addMember('sport', 'Екатерина Власова');
  Store.addMember('sport', 'Игорь Петров');
  Store.logActivity('sport', Store.get('sport').members[0].id, 'attendance', 5, 'Утренняя пробежка');
  Store.logActivity('sport', Store.get('sport').members[0].id, 'completion', 15, 'Выполнил программу на неделю');
  Store.logActivity('sport', Store.get('sport').members[1].id, 'attendance', 5, 'Тренажёрный зал');
  Store.logActivity('sport', Store.get('sport').members[2].id, 'bonus', 10, 'Помог организовать тренировку');

  // English
  Store.addMember('english', 'Мария Кузнецова');
  Store.addMember('english', 'Дмитрий Смирнов');
  Store.addMember('english', 'Анна Сидорова');
  Store.logActivity('english', Store.get('english').members[0].id, 'attendance', 5, 'Разговорный клуб');
  Store.logActivity('english', Store.get('english').members[0].id, 'completion', 20, 'Закончила уровень B1');
  Store.logActivity('english', Store.get('english').members[1].id, 'attendance', 5, 'Грамматика');

  // Reading
  Store.addMember('reading', 'Наталья Белова');
  Store.addMember('reading', 'Сергей Волков');
  Store.addMember('reading', 'Ольга Новикова');
  Store.logActivity('reading', Store.get('reading').members[0].id, 'attendance', 5, 'Обсуждение книги');
  Store.logActivity('reading', Store.get('reading').members[0].id, 'completion', 20, 'Прочитала «Мастер и Маргарита»');
  Store.logActivity('reading', Store.get('reading').members[1].id, 'attendance', 5, 'Встреча книжного клуба');
  Store.logActivity('reading', Store.get('reading').members[2].id, 'bonus', 10, 'Написала рецензию');
})();
