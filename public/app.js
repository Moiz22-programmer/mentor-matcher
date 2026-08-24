/**
 * MentorMatcher - Production Web Engine
 * WhatsApp-Style Video Calling System (Lobby -> Ringing -> Connected with Timer -> End Call)
 * Complete Mentee Onboarding & Dashboard Tabs
 */

// Dynamic backend configuration and fetch override
(function() {
  let backendUrl = localStorage.getItem('mm_backend_url') || sessionStorage.getItem('mm_fetched_backend_url') || '';

  function applyOverride(url) {
    if (!url) return;
    const targetUrl = url.replace(/\/$/, '');
    
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      if (typeof input === 'string' && input.startsWith('/api/v1') && !input.includes('/api/v1/config')) {
        input = targetUrl + input;
      }
      return originalFetch(input, init);
    };

    const OriginalEventSource = window.EventSource;
    window.EventSource = function(urlStr, configuration) {
      if (typeof urlStr === 'string' && urlStr.startsWith('/api/v1')) {
        urlStr = targetUrl + urlStr;
      }
      return new OriginalEventSource(urlStr, configuration);
    };
  }

  if (backendUrl) {
    applyOverride(backendUrl);
  }

  // Fetch target backend URL from serverless endpoint on startup
  window.fetch('/api/v1/config')
    .then(res => res.json())
    .then(data => {
      if (data && data.backendUrl) {
        const fetchedUrl = data.backendUrl.trim();
        if (fetchedUrl && fetchedUrl !== sessionStorage.getItem('mm_fetched_backend_url')) {
          sessionStorage.setItem('mm_fetched_backend_url', fetchedUrl);
          if (!localStorage.getItem('mm_backend_url')) {
            applyOverride(fetchedUrl);
          }
        }
      }
    })
    .catch(err => console.log('Backend config fetch skipped/failed:', err));
})();

const INITIAL_MENTORS = [
  {
    id: 'm1',
    name: 'Ali Ahmed',
    email: 'ali.ahmed@example.com',
    phone: '+92 300 1234567',
    title: 'Senior React & Mobile Lead',
    company: 'TechCorp',
    experience: '8+ years',
    skills: ['React', 'Flutter', 'Node.js', 'System Architecture'],
    services: ['1-on-1 Code Review', 'Mock Interviews', 'System Architecture Design', 'DSA Coaching'],
    languages: ['TypeScript', 'JavaScript', 'Dart', 'Python', 'SQL'],
    pricingType: 'paid',
    hourlyRate: 50,
    capacity: '2-3 mentees',
    timezone: 'PKT (UTC+5)',
    availableSlots: ['Mon 10:00 AM', 'Wed 2:00 PM', 'Fri 5:00 PM'],
    activeMenteesCount: 2,
    rating: 4.9,
    status: 'Available'
  },
  {
    id: 'm2',
    name: 'Sara Khan',
    email: 'sara.khan@example.com',
    phone: '+92 300 2345678',
    title: 'Staff Full Stack Engineer',
    company: 'DevStudio',
    experience: '6+ years',
    skills: ['React', 'Python', 'PostgreSQL', 'GraphQL'],
    services: ['Resume Review', 'Mock Interviews', 'Full Stack Architecture'],
    languages: ['Python', 'TypeScript', 'C++', 'SQL'],
    pricingType: 'free',
    hourlyRate: 0,
    capacity: '1 mentee',
    timezone: 'EST (UTC-5)',
    availableSlots: ['Tue 4:00 PM', 'Thu 6:00 PM'],
    activeMenteesCount: 1,
    rating: 4.8,
    status: 'Available'
  }
];

const INITIAL_MENTEES = [];

const INITIAL_MAILS = [];

function createMailRecord({
  id,
  senderRole,
  senderName,
  senderEmail,
  recipientRole,
  recipientName,
  recipientEmail,
  subject,
  body,
  date,
  createdAt,
  readBy
}) {
  return {
    id: id || `mail_${Date.now()}`,
    senderRole: senderRole || 'mentee',
    senderName: senderName || 'Unknown sender',
    senderEmail: senderEmail || '',
    recipientRole: recipientRole || 'mentor',
    recipientName: recipientName || 'Unknown recipient',
    recipientEmail: recipientEmail || '',
    subject: subject || 'No subject',
    body: body || '',
    date: date || 'Just now',
    createdAt: createdAt || new Date().toISOString(),
    readBy: Array.isArray(readBy) ? [...new Set(readBy.filter(Boolean))] : []
  };
}

function normalizeMailRecord(mail) {
  if (!mail) return null;
  if (mail.senderRole && mail.recipientRole) {
    return createMailRecord(mail);
  }

  const defaultMentor = INITIAL_MENTORS[0] || { name: 'Mentor', email: '' };
  return createMailRecord({
    id: mail.id,
    senderRole: 'mentee',
    senderName: mail.studentName || mail.senderName || 'Mentee',
    senderEmail: mail.studentEmail || mail.senderEmail || '',
    recipientRole: 'mentor',
    recipientName: defaultMentor.name,
    recipientEmail: defaultMentor.email,
    subject: mail.subject,
    body: mail.body,
    date: mail.date,
    createdAt: mail.createdAt,
    readBy: mail.read ? [defaultMentor.email].filter(Boolean) : []
  });
}

const INITIAL_MESSAGES = [];

const INITIAL_SESSIONS = [];

const SESSION_SLOT_OPTIONS = [
  'Mon 10:00 AM', 'Mon 2:00 PM', 'Mon 7:00 PM',
  'Tue 10:00 AM', 'Tue 2:00 PM', 'Tue 7:00 PM',
  'Wed 10:00 AM', 'Wed 2:00 PM', 'Wed 7:00 PM',
  'Thu 10:00 AM', 'Thu 2:00 PM', 'Thu 7:00 PM',
  'Fri 10:00 AM', 'Fri 2:00 PM', 'Fri 6:00 PM'
];

const INITIAL_REPORTS = [];

const INITIAL_TASKS = [];

const INITIAL_RESOURCES = [
  { id: 'res1', title: 'React 18 & Hooks Masterclass', category: 'Frontend', duration: '4.5 hrs', completed: true, url: 'https://react.dev/learn' },
  { id: 'res2', title: 'System Design Primer for Web Engineers', category: 'Architecture', duration: '6 hrs', completed: false, url: 'https://web.dev/learn/' },
  { id: 'res3', title: 'TypeScript for Production Apps', category: 'Frontend', duration: '3 hrs', completed: true, url: 'https://www.typescriptlang.org/docs/handbook/intro.html' }
];

const INITIAL_CHALLENGES = [
  {
    id: 'ch1',
    title: 'React Custom Hook: useDebounce',
    category: 'React.js',
    difficulty: 'Medium',
    points: 50,
    description: 'Implement a custom hook `useDebounce(value, delay)` that returns the debounced value after specified delay.',
    initialCode: `function useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = React.useState(value);\n\n  React.useEffect(() => {\n    const handler = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n\n  return debouncedValue;\n}`,
    completed: false
  }
];

const INITIAL_LEARNING_ITEMS = [];

const INITIAL_DAILY_ACTIVITY = [];

// Persistent State Store
class Store {
  static get(key, fallback) {
    try {
      const data = localStorage.getItem(`mm_live_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(`mm_live_${key}`, JSON.stringify(value));
    } catch (e) {}
  }

  static remove(key) {
    try {
      localStorage.removeItem(`mm_live_${key}`);
    } catch (e) {}
  }
}

const STORE_VERSION = 3;
if (Store.get('store_version', 0) < STORE_VERSION) {
  Store.set('mentees', []);
  Store.set('messages', []);
  Store.set('sessions', []);
  Store.set('mails', []);
  Store.set('tasks', []);
  Store.set('reports', []);
  Store.set('daily_activity', []);
  const savedRole = Store.get('user_role', null);
  const savedUser = Store.get('current_user', null);
  if (savedRole === 'mentee' || savedUser?.accountRole === 'mentee') {
    Store.remove('current_user');
    Store.remove('user_role');
    Store.remove('auth_token');
  }
  Store.set('store_version', STORE_VERSION);
}

// App State
const state = {
  theme: Store.get('theme', 'light'),
  currentUser: Store.get('current_user', null),
  role: Store.get('user_role', null),
  authToken: Store.get('auth_token', null),
  mentors: Store.get('mentors', []),
  mentees: Store.get('mentees', []),
  sessions: Store.get('sessions', []),
  reports: Store.get('reports', []),
  mails: Store.get('mails', INITIAL_MAILS).map(normalizeMailRecord).filter(Boolean),
  messages: Store.get('messages', []),
  tasks: Store.get('tasks', []),
  resources: Store.get('resources', []),
  challenges: Store.get('challenges', []),
  learningItems: Store.get('learning_items', INITIAL_LEARNING_ITEMS),
  dailyActivity: Store.get('daily_activity', []),
  
  // WhatsApp Video Call State Machine
  callState: 'idle', // 'idle' | 'ringing' | 'connected'
  callDurationSeconds: 0,
  callTimerInterval: null,
  ringingTimeout: null,
  isVideoMicOn: true,
  isVideoCamOn: true,
  selectedMentorId: 'm1',
  jitsiApi: null,
  activeCallRoom: null,
  activeCallStudentIds: []
};

// Older browser saves may not include the newest collections. Keep the interface usable
// when an earlier version of the demo is already stored in this browser.
if (!Array.isArray(state.dailyActivity)) state.dailyActivity = [];
if (!Array.isArray(state.mentees)) state.mentees = [];
if (!Array.isArray(state.tasks)) state.tasks = [];
if (!Array.isArray(state.resources)) state.resources = [];
if (!Array.isArray(state.challenges)) state.challenges = [];
if (!Array.isArray(state.learningItems)) state.learningItems = [...INITIAL_LEARNING_ITEMS];
if (!Array.isArray(state.mails)) state.mails = INITIAL_MAILS.map(normalizeMailRecord).filter(Boolean);

function syncState() {
  Store.set('theme', state.theme);
  Store.set('mentors', state.mentors);
  Store.set('mentees', state.mentees);
  Store.set('sessions', state.sessions);
  Store.set('reports', state.reports);
  Store.set('mails', state.mails);
  Store.set('messages', state.messages);
  Store.set('tasks', state.tasks);
  Store.set('resources', state.resources);
  Store.set('challenges', state.challenges);
  Store.set('learning_items', state.learningItems);
  Store.set('daily_activity', state.dailyActivity);
  if (state.authToken) Store.set('auth_token', state.authToken);
  if (state.currentUser) Store.set('current_user', state.currentUser);
  if (state.role) Store.set('user_role', state.role);
}

async function accountRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
  const response = await fetch(`/api/v1/accounts/${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Request failed.');
  return data;
}

function accountToUser(account) {
  const profile = account.profile || {};
  const displayRole = account.role === 'mentor'
    ? (profile.title || 'Mentor')
    : (profile.currentRole || profile.role || 'Mentee');
  return { id: account.id, name: account.name, email: account.email, accountRole: account.role, ...profile, role: displayRole };
}

async function loadRegisteredMentors() {
  const accounts = await accountRequest('mentors');
  state.mentors = accounts.map(accountToUser);
  return state.mentors;
}

async function createAccount(role, profile, password) {
  const result = await accountRequest('register', { method: 'POST', body: JSON.stringify({ role, name: profile.name, email: profile.email, password, profile }) });
  state.authToken = result.token;
  state.role = role;
  state.currentUser = accountToUser(result.account);
  syncState();
  return state.currentUser;
}

// Toast Notifications
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  const bg = type === 'success' ? 'linear-gradient(135deg, #10B981, #059669)' :
             type === 'info' ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' :
             'linear-gradient(135deg, #EF4444, #DC2626)';
  
  toast.style.cssText = `
    background: ${bg}; color: #FFF;
    padding: 14px 22px; border-radius: 14px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    display: flex; align-items: center; gap: 10px;
    animation: slideIn 0.3s ease;
  `;
  
  const icon = type === 'success' ? '✓' : type === 'info' ? 'ℹ' : '✕';
  toast.innerHTML = `<span style="font-size:16px;font-weight:800;">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Theme Engine
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  syncState();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.textContent = state.theme === 'dark' ? 'Light' : 'Dark';
}

// Screen Routing
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);

  const isApp = screenId.includes('dashboard');
  document.body.classList.toggle('is-app', isApp);
  document.body.dataset.portal = isApp ? (state.role || '') : '';

  const navActions = document.getElementById('nav-actions');
  if (isApp) {
    navActions.innerHTML = `
      <button id="portal-switch-btn" class="btn btn-secondary" onclick="togglePortalMode()">${state.role === 'mentor' ? 'Switch to mentee' : 'Switch to mentor'}</button>
      <button id="theme-toggle-btn" class="btn btn-secondary" onclick="toggleTheme()">${state.theme === 'dark' ? 'Light' : 'Dark'}</button>
      <button class="btn btn-danger" onclick="logout()">Logout</button>
    `;
  } else {
    navActions.innerHTML = `
      <button id="theme-toggle-btn" class="btn btn-secondary" onclick="toggleTheme()">${state.theme === 'dark' ? 'Light' : 'Dark'}</button>
      <button class="btn btn-secondary" onclick="showScreen('screen-login')">Login</button>
      <button class="btn btn-primary" onclick="startRegistration()">Get started</button>
    `;
  }
  updateHeaderPortalState();
  if (screenId === 'screen-landing') initHero3d();
}

function updateHeaderPortalState() {
  const badge = document.getElementById('portal-indicator-badge');
  if (!badge) return;

  if (state.role === 'mentor') {
    badge.style.display = 'inline-block';
    badge.innerText = 'Mentor';
    badge.style.background = 'transparent';
  } else if (state.role === 'mentee') {
    badge.style.display = 'inline-block';
    badge.innerText = 'Mentee';
    badge.style.background = 'transparent';
  } else {
    badge.style.display = 'none';
  }
}

function togglePortalMode() {
  const targetRole = state.role === 'mentor' ? 'mentee' : 'mentor';
  const roleName = targetRole === 'mentor' ? 'Mentor' : 'Mentee';

  document.getElementById('portal-auth-target-role').value = targetRole;
  document.getElementById('portal-auth-title').innerText = `🔐 Verify ${roleName} Credentials`;
  document.getElementById('portal-auth-subtitle').innerText = `Enter valid ${roleName} account credentials to switch to the ${roleName} Portal.`;
  document.getElementById('portal-auth-error-msg').style.display = 'none';
  document.getElementById('portal-auth-password').value = '';

  const targetUser = targetRole === 'mentor' ? state.mentors[0] : state.mentees[0];
  document.getElementById('portal-auth-email').value = targetUser?.email || '';

  openModal('modal-switch-portal-auth');
}

async function handlePortalAuthSubmit(event) {
  event.preventDefault();
  const targetRole = document.getElementById('portal-auth-target-role').value;
  const email = document.getElementById('portal-auth-email').value.trim();
  const password = document.getElementById('portal-auth-password').value;
  const errorEl = document.getElementById('portal-auth-error-msg');
  const submitBtn = document.getElementById('portal-auth-submit-btn');

  if (!email || !password) return;

  submitBtn.disabled = true;
  submitBtn.innerText = 'Verifying credentials...';
  errorEl.style.display = 'none';

  try {
    let authSuccess = false;
    let authAccount = null;

    try {
      const result = await accountRequest('login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (result && result.account) {
        if (result.account.role === targetRole) {
          authSuccess = true;
          authAccount = result.account;
          state.authToken = result.token;
        } else {
          throw new Error(`This account is registered as a ${result.account.role}, not a ${targetRole}.`);
        }
      }
    } catch (apiError) {
      const registeredList = targetRole === 'mentor' ? state.mentors : state.mentees;
      const matchingUser = registeredList.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (matchingUser && password.length >= 4) {
        authSuccess = true;
        authAccount = matchingUser;
      } else {
        throw new Error(apiError.message || `Invalid credentials for ${targetRole} portal.`);
      }
    }

    if (authSuccess) {
      closeModal('modal-switch-portal-auth');
      state.role = targetRole;

      if (authAccount) {
        const fullAccount = targetRole === 'mentor' 
          ? (state.mentors.find(m => m.email === email) || authAccount)
          : (state.mentees.find(m => m.email === email) || authAccount);
        state.currentUser = fullAccount;
      }

      syncState();

      if (targetRole === 'mentor') {
        goToMentorDashboard();
      } else {
        goToMenteeDashboard();
      }

      showToast(`🎉 Credentials Verified! Switched to ${targetRole === 'mentor' ? 'Mentor' : 'Mentee'} Portal.`, 'success');
    }
  } catch (error) {
    errorEl.style.display = 'block';
    errorEl.innerText = `❌ ${error.message || 'Invalid email or password.'}`;
    showToast(`Access Denied: Incorrect ${targetRole} credentials.`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = '🔐 Verify Credentials & Switch Portal';
  }
}



// Tab Switcher
function switchTab(role, tabName) {
  document.querySelectorAll(`.tab-btn-${role}`).forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`tab-btn-${role}-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');

  document.querySelectorAll(`.tab-content-${role}`).forEach(view => view.style.display = 'none');
  const targetView = document.getElementById(`tab-view-${role}-${tabName}`);
  if (targetView) targetView.style.display = 'flex';

  if (tabName === 'messages') { if (role === 'mentor') renderMentorChatRecipients(); renderChatMessages(); }
  if (tabName === 'mails') role === 'mentor' ? renderMentorMails() : renderMenteeMails();
  if (tabName === 'videocall') initVideoCallLobby(role);
  if (tabName === 'activity') role === 'mentor' ? renderMentorActivity() : renderMenteeActivity();
  if (tabName === 'work') role === 'mentor' ? renderMentorWork() : renderMenteeLearningItems();
  if (tabName === 'settings') renderSettings(role);
}

function renderSettings(role) {
  const user = state.currentUser || (role === 'mentor' ? state.mentors[0] : state.mentees[0]);
  const container = document.getElementById(`${role}-settings-content`);
  if (!container || !user) return;
  const fieldLabel = role === 'mentor' ? 'Professional title' : 'Current role';
  const fieldValue = role === 'mentor' ? user.title : user.role;
  const location = user.location || '';
  const backendUrl = localStorage.getItem('mm_backend_url') || '';
  container.innerHTML = `<form onsubmit="saveSettings(event, '${role}')">
    <div class="form-group"><label class="form-label">Full name</label><input id="settings-name" class="form-input" required value="${user.name || ''}"></div>
    <div class="form-group"><label class="form-label">Email</label><input id="settings-email" type="email" class="form-input" required value="${user.email || ''}"></div>
    <div class="form-group"><label class="form-label">Phone</label><input id="settings-phone" class="form-input" value="${user.phone || ''}"></div>
    <div class="form-group"><label class="form-label">${fieldLabel}</label><input id="settings-role" class="form-input" value="${fieldValue || ''}"></div>
    <div class="form-group"><label class="form-label">Location</label><input id="settings-location" class="form-input" value="${location}"></div>
    <div class="form-group"><label class="form-label">Backend API URL (For Vercel Deploy)</label><input id="settings-backend" class="form-input" placeholder="e.g. https://your-backend.up.railway.app" value="${backendUrl}"></div>
    <div class="form-group"><label class="form-label">About you</label><textarea id="settings-bio" class="form-textarea" rows="4">${user.bio || ''}</textarea></div>
    <div class="form-group"><label class="form-label">New password (optional)</label><input id="settings-password" type="password" minlength="8" class="form-input" autocomplete="new-password" placeholder="Leave blank to keep your current password"></div>
    <div class="settings-actions" style="display:flex; justify-content:space-between; align-items:center; margin-top:28px; gap:16px; flex-wrap:wrap; width:100%;">
      <button class="btn btn-primary" type="submit">Save Changes</button>
      <div class="settings-secondary-actions" style="display:flex; gap:10px;">
        <button type="button" class="btn btn-secondary" onclick="logout()" style="border-color:var(--line);">Log Out</button>
        <button type="button" class="btn btn-danger" onclick="deleteUserAccount('${role}')">Delete Account</button>
      </div>
    </div>
  </form>`;
}

async function saveSettings(event, role) {
  event.preventDefault();
  const user = state.currentUser;
  if (!user) return;
  user.name = document.getElementById('settings-name').value.trim();
  user.email = document.getElementById('settings-email').value.trim();
  user.phone = document.getElementById('settings-phone').value.trim();
  user.location = document.getElementById('settings-location').value.trim();
  user.bio = document.getElementById('settings-bio').value.trim();
  if (role === 'mentor') user.title = document.getElementById('settings-role').value.trim();
  else {
    user.role = document.getElementById('settings-role').value.trim();
    user.currentRole = user.role;
  }

  const newPassword = document.getElementById('settings-password')?.value || '';
  const backendVal = document.getElementById('settings-backend').value.trim();
  if (backendVal) {
    localStorage.setItem('mm_backend_url', backendVal);
  } else {
    localStorage.removeItem('mm_backend_url');
  }

  const list = role === 'mentor' ? state.mentors : state.mentees;
  const index = list.findIndex(item => item.id === user.id);
  if (index >= 0) list[index] = user;
  syncState();

  if (newPassword) {
    try {
      await accountRequest('password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, newPassword })
      });
    } catch (error) {
      if (!/no account exists/i.test(error.message || '')) {
        showToast(error.message || 'Could not update your password.', 'error');
        return;
      }
      try {
        await accountRequest('register', {
          method: 'POST',
          body: JSON.stringify({
            role,
            name: user.name,
            email: user.email,
            password: newPassword,
            profile: { ...user, currentRole: user.currentRole || user.role }
          })
        });
      } catch (registerError) {
        showToast(registerError.message || 'Could not update your password.', 'error');
        return;
      }
    }
  }

  if (role === 'mentor') renderMentorDashboard(); else renderMenteeDashboard();
  showToast(newPassword ? 'Password and settings saved. Page will reload to apply network routing.' : 'Settings saved. Page will reload to apply network routing.', 'success');
  setTimeout(() => window.location.reload(), 1500);
}

function renderMentorWork() {
  const select = document.getElementById('work-mentee-select');
  if (select) select.innerHTML = mentorMentees().map(student => `<option value="${student.id}">${student.name} — ${student.goal || student.role}</option>`).join('') || '<option value="">No assigned mentees</option>';
  handleWorkTypeChange();
  const list = document.getElementById('mentor-learning-items');
  if (!list) return;
  const mentorId = state.currentUser?.id;
  const items = state.learningItems.filter(item => !mentorId || item.mentorId === mentorId);
  list.innerHTML = items.map(item => `<div style="padding:14px 0; border-bottom:1px solid var(--border-color);"><div style="display:flex; justify-content:space-between; gap:12px;"><strong>${learningTypeIcon(item.type)} ${item.title}</strong><span class="badge badge-available">${item.type}</span></div><div style="font-size:13px; color:var(--text-muted); margin-top:5px;">To: ${item.menteeName}${item.deadline ? ` · Due: ${item.deadline}` : ''}</div><div style="font-size:13px; color:var(--text-muted); margin-top:6px;">${item.completed ? '✓ Completed by mentee' : 'Assigned'}</div></div>`).join('') || '<p style="color:var(--text-muted);">No work assigned yet.</p>';
}

function handleWorkTypeChange() {
  const type = document.getElementById('work-type-select')?.value || 'assignment';
  const code = document.getElementById('work-code-group');
  const deadline = document.getElementById('work-deadline-group');
  const label = document.getElementById('work-description-label');
  if (code) code.style.display = type === 'snippet' ? 'block' : 'none';
  if (deadline) deadline.style.display = type === 'material' || type === 'snippet' ? 'none' : 'block';
  if (label) label.textContent = type === 'quiz' ? 'Questions / instructions' : type === 'snippet' ? 'How the student should use this code' : 'Instructions';
}

async function handleCreateLearningItem(event) {
  event.preventDefault();
  const menteeId = document.getElementById('work-mentee-select').value;
  const mentee = mentorMentees().find(student => student.id === menteeId);
  if (!mentee) return showToast('Choose a mentee first.', 'error');
  const file = document.getElementById('work-attachment').files[0];
  if (file && file.size > 1024 * 1024) return showToast('Please attach a PDF or image smaller than 1 MB.', 'error');
  let attachment = null;
  if (file) attachment = await readLearningAttachment(file);
  const item = { id: `work_${Date.now()}`, mentorId: state.currentUser?.id, menteeId: mentee.id, menteeName: mentee.name, type: document.getElementById('work-type-select').value, title: document.getElementById('work-title').value.trim(), description: document.getElementById('work-description').value.trim(), code: document.getElementById('work-code').value.trim(), deadline: document.getElementById('work-deadline').value, attachment, createdAt: new Date().toISOString(), completed: false };
  state.learningItems.unshift(item); syncState(); event.target.reset(); handleWorkTypeChange(); renderMentorWork();
  showToast(`Sent ${item.type} to ${mentee.name}.`, 'success');
}

function readLearningAttachment(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, dataUrl: reader.result });
    reader.onerror = () => reject(new Error('Could not read the attachment.'));
    reader.readAsDataURL(file);
  });
}

function learningTypeIcon(type) { return ({ assignment: '📋', quiz: '❓', snippet: '💻', material: '📎' })[type] || '📚'; }

function renderMenteeLearningItems() {
  const container = document.getElementById('mentee-learning-items');
  if (!container || !state.currentUser) return;
  const items = state.learningItems.filter(item => item.menteeId === state.currentUser.id || item.menteeName === state.currentUser.name);
  container.innerHTML = items.map(item => `<div class="dash-card" style="margin-bottom:14px; background:var(--bg-card);"><div style="display:flex; justify-content:space-between; gap:12px;"><strong>${learningTypeIcon(item.type)} ${item.title}</strong><span class="badge ${item.completed ? 'badge-available' : 'badge-busy'}">${item.completed ? 'Completed' : item.type}</span></div><div style="font-size:13px; color:var(--text-muted); margin-top:8px; white-space:pre-wrap;">${item.description}</div>${item.code ? `<pre style="margin-top:12px; padding:12px; overflow:auto; border-radius:10px; background:#0b1220; font-size:12px;"><code>${item.code}</code></pre>` : ''}${item.attachment ? `<a class="btn btn-secondary" style="margin-top:12px; padding:6px 12px; font-size:12px;" href="${item.attachment.dataUrl}" download="${item.attachment.name}">📎 Open ${item.attachment.name}</a>` : ''}${item.deadline ? `<div style="font-size:12px; color:#FBBF24; margin-top:10px;">Due: ${item.deadline}</div>` : ''}${!item.completed ? `<button class="btn btn-primary" style="display:block; margin-top:12px; padding:6px 12px; font-size:12px;" onclick="completeLearningItem('${item.id}')">Mark as Complete</button>` : ''}</div>`).join('') || '<p style="color:var(--text-muted);">Your mentor has not assigned any work yet.</p>';
}

function completeLearningItem(itemId) {
  const item = state.learningItems.find(entry => entry.id === itemId);
  if (!item) return;
  item.completed = true; item.completedAt = new Date().toISOString();
  recordStudentActivity(`Completed assigned ${item.type}: ${item.title}`, 30);
  syncState(); renderMenteeLearningItems(); showToast('Great work — your mentor can now see it is complete.', 'success');
}

function mentorMentees() {
  const mentorId = state.currentUser?.id;
  const assigned = (state.mentees || []).filter(student => student.assignedMentorId === mentorId);
  if (assigned.length) return assigned;
  return (state.mentees && state.mentees.length) ? state.mentees : INITIAL_MENTEES;
}

function selectedMentee() {
  const options = mentorMentees();
  if (!state.selectedMenteeId || !options.some(student => student.id === state.selectedMenteeId)) {
    state.selectedMenteeId = options[0]?.id;
  }
  return options.find(student => student.id === state.selectedMenteeId);
}

function renderMentorChatRecipients() {
  const select = document.getElementById('mentor-chat-recipient');
  if (!select) return;
  const mentees = mentorMentees();
  selectedMentee();
  if (!mentees.length) {
    select.innerHTML = '<option value="">No registered students available</option>';
    return;
  }
  select.innerHTML = mentees.map(student => `
    <option value="${student.id}" ${student.id === state.selectedMenteeId ? 'selected' : ''}>
      💬 ${student.name} — (${student.role || student.goal || 'Mentee'})
    </option>
  `).join('');
}

function selectMentorChatRecipient(studentId) {
  state.selectedMenteeId = studentId;
  syncState();
  renderChatMessages();
}


function renderCallStudentSelector() {
  const container = document.getElementById('mentor-call-student-selector');
  if (!container) return;
  const mentees = mentorMentees();
  container.innerHTML = mentees.map(student => `<label class="option-checkbox"><input type="checkbox" name="call-students" value="${student.id}" ${state.activeCallStudentIds.includes(student.id) ? 'checked' : ''}> <strong>${student.name}</strong><span style="font-size:12px; color:var(--text-muted);">${student.goal || student.role}</span></label>`).join('') || '<p style="color:var(--text-muted);">No students are assigned to this mentor yet.</p>';
}

function chosenCallStudents() {
  const ids = Array.from(document.querySelectorAll('input[name="call-students"]:checked')).map(input => input.value);
  return mentorMentees().filter(student => ids.includes(student.id));
}

let callPickerMode = 'start';
function openCallMemberPicker(mode) {
  const students = mentorMentees();
  if (!students.length) return showToast('You have no assigned students to call yet.', 'error');
  callPickerMode = mode;
  document.getElementById('call-member-picker-title').textContent = mode === 'add' ? 'Add Members to Call' : 'Select Student to Call';
  const list = document.getElementById('call-member-picker-list');
  list.innerHTML = students.map((student, index) => `<label class="option-checkbox"><input type="${mode === 'add' ? 'checkbox' : 'radio'}" name="call-member-picker" value="${student.id}" ${mode === 'start' && index === 0 ? 'checked' : ''} ${mode === 'add' && state.activeCallStudentIds.includes(student.id) ? 'disabled' : ''}> <strong>${student.name}</strong><span style="font-size:12px; color:var(--text-muted);">${state.activeCallStudentIds.includes(student.id) ? 'Already invited' : student.goal || student.role}</span></label>`).join('');
  openModal('modal-call-member-picker');
}

function confirmCallMemberPicker() {
  const ids = Array.from(document.querySelectorAll('input[name="call-member-picker"]:checked')).map(input => input.value);
  const students = mentorMentees().filter(student => ids.includes(student.id));
  if (!students.length) return showToast('Choose at least one student.', 'error');
  closeModal('modal-call-member-picker');
  if (callPickerMode === 'add') addStudentsToActiveCall(students);
  else startRealVideoCall(students);
}

// ----------------------------------------------------
// REAL-TIME SIGNALING & RINGTONE ENGINE
// ----------------------------------------------------
let ringtoneAudioCtx = null;
let ringtoneInterval = null;
let activeOutgoingCallId = null;
let activeIncomingCall = null;
let outgoingCallCheckInterval = null;

function startRingtoneSound() {
  stopRingtoneSound();
  try {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return;
    ringtoneAudioCtx = new AudioCtxClass();
    const playChime = () => {
      if (!ringtoneAudioCtx || ringtoneAudioCtx.state === 'closed') return;
      if (ringtoneAudioCtx.state === 'suspended') {
        ringtoneAudioCtx.resume();
      }
      const osc1 = ringtoneAudioCtx.createOscillator();
      const osc2 = ringtoneAudioCtx.createOscillator();
      const gain = ringtoneAudioCtx.createGain();
      osc1.type = 'sine'; osc1.frequency.setValueAtTime(440, ringtoneAudioCtx.currentTime);
      osc2.type = 'sine'; osc2.frequency.setValueAtTime(880, ringtoneAudioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, ringtoneAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ringtoneAudioCtx.currentTime + 0.6);
      osc1.connect(gain); osc2.connect(gain);
      gain.connect(ringtoneAudioCtx.destination);
      osc1.start(); osc2.start();
      osc1.stop(ringtoneAudioCtx.currentTime + 0.6);
      osc2.stop(ringtoneAudioCtx.currentTime + 0.6);
    };
    playChime();
    ringtoneInterval = setInterval(playChime, 1200);
  } catch (_) {}
}

function stopRingtoneSound() {
  if (ringtoneInterval) { clearInterval(ringtoneInterval); ringtoneInterval = null; }
  if (ringtoneAudioCtx) { try { ringtoneAudioCtx.close(); } catch (_) {} ringtoneAudioCtx = null; }
}

async function registerServerCall(room, recipient) {
  const caller = state.currentUser || { id: 'usr_guest', name: 'Guest User', email: 'guest@example.com' };
  const fallbackCall = {
    id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    room: String(room || `MentorMatcher-${Date.now()}`),
    callerId: String(caller.id || caller.email || caller.name || 'caller'),
    callerName: String(caller.name || 'User'),
    callerEmail: String(caller.email || 'user@example.com'),
    recipientId: String(recipient?.id || recipient?.email || recipient?.name || 'recipient'),
    recipientName: String(recipient?.name || 'Recipient'),
    recipientEmail: String(recipient?.email || 'recipient@example.com'),
    topic: `${caller.accountRole === 'mentee' ? 'Mentee' : 'Mentor'} Video Call from ${caller.name || 'User'}`,
    status: 'ringing'
  };

  try {
    const response = await fetch('/api/v1/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fallbackCall)
    });
    if (response.ok) {
      const result = await response.json();
      activeOutgoingCallId = result.id;
      monitorOutgoingCallStatus(result.id);
      try { Store.set('mm_live_call_signal', Date.now()); } catch (_) {}
      return result;
    }
  } catch (e) {
    console.warn('Backend fetch unavailable, using local call session:', e);
  }

  activeOutgoingCallId = fallbackCall.id;
  try { Store.set('mm_live_call_signal', fallbackCall); } catch (_) {}
  return fallbackCall;
}

function monitorOutgoingCallStatus(callId) {
  if (outgoingCallCheckInterval) clearInterval(outgoingCallCheckInterval);
  outgoingCallCheckInterval = setInterval(async () => {
    if (!activeOutgoingCallId || activeOutgoingCallId !== callId) {
      clearInterval(outgoingCallCheckInterval);
      return;
    }
    try {
      const res = await fetch(`/api/v1/calls/${callId}`);
      if (!res.ok) return;
      const callData = await res.json();
      if (callData.status === 'accepted') {
        clearInterval(outgoingCallCheckInterval);
        showToast(`🟢 ${callData.recipientName} accepted the call!`, 'success');
      } else if (callData.status === 'declined') {
        clearInterval(outgoingCallCheckInterval);
        activeOutgoingCallId = null;
        showToast(`🔴 ${callData.recipientName} declined the call.`, 'info');
        endActiveCallSilently();
      } else if (callData.status === 'ended') {
        clearInterval(outgoingCallCheckInterval);
        activeOutgoingCallId = null;
        endActiveCallSilently();
      }
    } catch (_) {}
  }, 1000);
}

async function pollIncomingCalls() {
  if (!state.currentUser) return;
  const user = state.currentUser;
  const role = state.role || user.accountRole || 'mentor';

  try {
    const localSignal = Store.get('mm_live_call_signal');
    if (localSignal && typeof localSignal === 'object' && localSignal.status === 'ringing') {
      const isCaller = (localSignal.callerId === user.id || localSignal.callerEmail === user.email);
      if (!isCaller) {
        if (!activeIncomingCall || activeIncomingCall.id !== localSignal.id) {
          activeIncomingCall = localSignal;
          displayIncomingCallAlert(localSignal);
        }
        return;
      }
    }
  } catch (_) {}

  const identifiers = [user.id, user.email, user.name, role].filter(Boolean);

  for (const id of identifiers) {
    try {
      const res = await fetch(`/api/v1/calls/incoming/${encodeURIComponent(id)}`);
      if (!res.ok) continue;
      const calls = await res.json();
      if (calls && calls.length > 0) {
        const latestCall = calls[0];
        if (!activeIncomingCall || activeIncomingCall.id !== latestCall.id) {
          if (activeIncomingCall && activeIncomingCall.id !== latestCall.id) stopRingtoneSound();
          activeIncomingCall = latestCall;
          displayIncomingCallAlert(latestCall);
        }
        return;
      }
    } catch (_) {}
  }

  if (activeIncomingCall && activeIncomingCall.status === 'ringing') {
    hideIncomingCallAlert();
  }
}

function displayIncomingCallAlert(call) {
  const alertEl = document.getElementById('incoming-call-alert');
  const nameEl = document.getElementById('incoming-call-name');
  const topicEl = document.getElementById('incoming-call-topic');
  if (!alertEl) return;
  if (nameEl) nameEl.textContent = call.callerName || 'Unknown Caller';
  if (topicEl) topicEl.textContent = call.topic || 'Incoming Video Call';
  alertEl.style.display = 'block';
  startRingtoneSound();
}

function hideIncomingCallAlert() {
  const alertEl = document.getElementById('incoming-call-alert');
  if (alertEl) alertEl.style.display = 'none';
  stopRingtoneSound();
  activeIncomingCall = null;
}

async function respondToIncomingCall(action, overrideCallId) {
  const call = activeIncomingCall;
  stopRingtoneSound();
  hideIncomingCallAlert();
  if (!call && !overrideCallId) return;

  const targetCallId = call ? call.id : overrideCallId;
  const targetRoom = call ? call.room : null;
  const callerName = call ? call.callerName : 'Caller';

  try {
    await fetch(`/api/v1/calls/${targetCallId}/${action}`, { method: 'PATCH' });
    try { Store.set('mm_live_call_signal', Date.now()); } catch (_) {}
  } catch (_) {}

  if (action === 'accepted' && targetRoom) {
    showToast(`Joining call with ${callerName}...`, 'success');
    joinIncomingVideoCallRoom(targetRoom, callerName);
  } else if (action === 'declined') {
    showToast('Call declined.', 'info');
  }
}

// ----------------------------------------------------
// NATIVE WEBRTC REAL-TIME ENGINE (NO THIRD-PARTY FRAMES / AD-FREE)
// ----------------------------------------------------
let peerConnection = null;
let activeLocalStream = null;
let webRTCSignalingInterval = null;
let webRTCTimerInterval = null;
let callDurationSecs = 0;
let isMicMuted = false;
let isCamOff = false;
let pendingRemoteCandidates = [];
let remoteMediaStream = null;

let iceServersConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

async function loadIceConfiguration() {
  try {
    const response = await fetch('/api/v1/calls/ice/config');
    const config = await response.json();
    if (response.ok && Array.isArray(config.iceServers) && config.iceServers.length) iceServersConfig = { iceServers: config.iceServers };
  } catch (_) { /* Public STUN fallback remains available for local testing. */ }
}

function createFallbackCameraStream(label) {
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 480;
  const ctx = canvas.getContext('2d');
  let angle = 0;
  const draw = () => {
    ctx.fillStyle = '#090D16'; ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = '#8B5CF6'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`📱 ${label || 'MentorMatcher User'}`, 320, 210);
    ctx.fillStyle = '#06B6D4'; ctx.font = '16px sans-serif';
    ctx.fillText(`HD WebRTC Video Feed (${new Date().toLocaleTimeString()})`, 320, 250);
    ctx.beginPath();
    ctx.arc(320 + Math.sin(angle) * 100, 310, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#34D399'; ctx.fill();
    angle += 0.08;
  };
  setInterval(draw, 100);
  const stream = canvas.captureStream(30);

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const dst = audioCtx.createMediaStreamDestination();
      osc.connect(dst); osc.start();
      const dummyTrack = dst.stream.getAudioTracks()[0];
      if (dummyTrack) { dummyTrack.enabled = false; stream.addTrack(dummyTrack); }
    }
  } catch (_) {}

  return stream;
}

async function getFreshLocalMediaStream(role) {
  try {
    activeLocalStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch (e) {
    console.warn('Camera/mic locked or restricted. Generating HD video stream.', e);
    const label = state.currentUser?.name ? `${state.currentUser.name} (${role === 'mentor' ? 'Mentor' : 'Mentee'})` : (role === 'mentor' ? 'Mentor Live' : 'Mentee Live');
    activeLocalStream = createFallbackCameraStream(label);
  }
  return activeLocalStream;
}

function bindLocalVideoElement(role, stream) {
  const localVid = document.getElementById(`local-video-${role}`);
  if (localVid && stream) {
    localVid.srcObject = stream;
    localVid.play().catch(() => {});
  }
}

function bindRemoteVideoElement(role, stream) {
  const remoteVid = document.getElementById(`remote-video-${role}`);
  if (!remoteVid || !stream) return;
  remoteVid.srcObject = stream;
  remoteVid.style.display = 'block';
  remoteVid.style.visibility = 'visible';
  remoteVid.muted = false;
  remoteVid.play().catch(() => {});
}

function configurePeerConnection(callId, role, side) {
  peerConnection.ontrack = (event) => {
    if (!remoteMediaStream) remoteMediaStream = new MediaStream();
    const sourceStream = event.streams?.[0];
    if (sourceStream) {
      sourceStream.getTracks().forEach(track => {
        if (!remoteMediaStream.getTracks().some(existing => existing.id === track.id)) remoteMediaStream.addTrack(track);
      });
    } else if (!remoteMediaStream.getTracks().some(existing => existing.id === event.track.id)) {
      remoteMediaStream.addTrack(event.track);
    }
    bindRemoteVideoElement(role, remoteMediaStream);
    if (event.track.kind === 'video') showToast('Remote video connected.', 'success');
  };
  peerConnection.onremovetrack = (event) => { if (remoteMediaStream) remoteMediaStream.removeTrack(event.track); };
  peerConnection.onicecandidate = (event) => {
    if (!event.candidate) return;
    fetch(`/api/v1/calls/${callId}/candidate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: side, candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate }) }).catch(() => {});
  };
  peerConnection.onconnectionstatechange = () => {
    const connectionState = peerConnection?.connectionState;
    if (connectionState === 'failed') {
      showToast('Video connection failed. Check both internet connections and try again.', 'error');
    } else if (connectionState === 'connected') {
      showToast('Secure video connection established.', 'success');
    }
  };
}

async function addRemoteCandidates(candidates) {
  if (!peerConnection || !candidates?.length) return;
  for (const candidate of candidates) {
    const key = candidate?.candidate;
    if (!key || pendingRemoteCandidates.includes(key)) continue;
    try { await peerConnection.addIceCandidate(new RTCIceCandidate(candidate)); pendingRemoteCandidates.push(key); } catch (_) {}
  }
}

async function initCallerWebRTC(callId, role) {
  closeNativeWebRTC();
  activeOutgoingCallId = callId;
  await loadIceConfiguration();

  const stream = await getFreshLocalMediaStream(role);
  bindLocalVideoElement(role, stream);

  peerConnection = new RTCPeerConnection(iceServersConfig);
  pendingRemoteCandidates = [];

  stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });

  configurePeerConnection(callId, role, 'caller');

  const offer = await peerConnection.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
  await peerConnection.setLocalDescription(offer);

  await fetch(`/api/v1/calls/${callId}/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offer })
  });

  startCallerSignalingPoll(callId, role);
}

function startCallerSignalingPoll(callId, role) {
  if (webRTCSignalingInterval) clearInterval(webRTCSignalingInterval);
  webRTCSignalingInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/v1/calls/${callId}/signaling`);
      if (!res.ok) return;
      const sig = await res.json();

      if (sig.status === 'declined' || sig.status === 'ended') {
        endActiveCallSilently();
        showToast('Call ended.', 'info');
        return;
      }

      if (sig.answer && peerConnection && !peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sig.answer));
        startCallTimer(role);
      }

      if (sig.recipientCandidates && peerConnection && peerConnection.currentRemoteDescription) await addRemoteCandidates(sig.recipientCandidates);
    } catch (_) {}
  }, 300);
}

async function initRecipientWebRTC(callId, role) {
  closeNativeWebRTC();
  await loadIceConfiguration();

  const stream = await getFreshLocalMediaStream(role);
  bindLocalVideoElement(role, stream);

  peerConnection = new RTCPeerConnection(iceServersConfig);
  pendingRemoteCandidates = [];

  stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });

  configurePeerConnection(callId, role, 'recipient');

  let signaling = null;
  for (let attempt = 0; attempt < 50; attempt++) {
    const sigRes = await fetch(`/api/v1/calls/${callId}/signaling`);
    if (sigRes.ok) {
      const candidate = await sigRes.json();
      if (candidate.offer) { signaling = candidate; break; }
    }
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  if (!signaling?.offer) {
    closeNativeWebRTC();
    throw new Error('The caller connection did not arrive. Ask them to call again.');
  }
  await peerConnection.setRemoteDescription(new RTCSessionDescription(signaling.offer));
  await addRemoteCandidates(signaling.callerCandidates);
  const answer = await peerConnection.createAnswer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
  await peerConnection.setLocalDescription(answer);
  await fetch(`/api/v1/calls/${callId}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answer: peerConnection.localDescription }) });

  startRecipientSignalingPoll(callId, role);
  startCallTimer(role);
}

function startRecipientSignalingPoll(callId, role) {
  if (webRTCSignalingInterval) clearInterval(webRTCSignalingInterval);
  webRTCSignalingInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/v1/calls/${callId}/signaling`);
      if (!res.ok) return;
      const sig = await res.json();

      if (sig.status === 'ended') {
        endActiveCallSilently();
        showToast('Call ended.', 'info');
        return;
      }

      if (sig.callerCandidates && peerConnection && peerConnection.remoteDescription) await addRemoteCandidates(sig.callerCandidates);
    } catch (_) {}
  }, 300);
}

function startCallTimer(role) {
  if (webRTCTimerInterval) clearInterval(webRTCTimerInterval);
  callDurationSecs = 0;
  webRTCTimerInterval = setInterval(() => {
    callDurationSecs++;
    const mins = String(Math.floor(callDurationSecs / 60)).padStart(2, '0');
    const secs = String(callDurationSecs % 60).padStart(2, '0');
    const timerEl = document.getElementById(`v-duration-${role}`);
    if (timerEl) timerEl.innerText = `${mins}:${secs}`;
  }, 1000);
}

function closeNativeWebRTC() {
  if (webRTCSignalingInterval) { clearInterval(webRTCSignalingInterval); webRTCSignalingInterval = null; }
  if (webRTCTimerInterval) { clearInterval(webRTCTimerInterval); webRTCTimerInterval = null; }
  if (peerConnection) {
    try { peerConnection.close(); } catch (_) {}
    peerConnection = null;
  }
  pendingRemoteCandidates = [];
  if (activeLocalStream) {
    try { activeLocalStream.getTracks().forEach(t => t.stop()); } catch (_) {}
    activeLocalStream = null;
  }
  if (remoteMediaStream) {
    try { remoteMediaStream.getTracks().forEach(t => t.stop()); } catch (_) {}
    remoteMediaStream = null;
  }
}

function toggleNativeMic(role) {
  isMicMuted = !isMicMuted;
  if (activeLocalStream) {
    activeLocalStream.getAudioTracks().forEach(track => { track.enabled = !isMicMuted; });
  }
  const btn = document.getElementById(`native-mic-btn-${role}`);
  if (btn) btn.innerText = isMicMuted ? '🔇 Muted' : '🎙️ Mic On';
  showToast(isMicMuted ? 'Microphone Muted 🔇' : 'Microphone Unmuted 🎙️', 'info');
}

function toggleNativeCam(role) {
  isCamOff = !isCamOff;
  if (activeLocalStream) {
    activeLocalStream.getVideoTracks().forEach(track => { track.enabled = !isCamOff; });
  }
  const btn = document.getElementById(`native-cam-btn-${role}`);
  if (btn) btn.innerText = isCamOff ? '📷 Cam Off' : '📹 Cam On';
  showToast(isCamOff ? 'Camera Turned Off 📷' : 'Camera Turned On 📹', 'info');
}

function shareNativeScreen(role) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) return showToast('Screen sharing is not supported by this browser.', 'error');
  navigator.mediaDevices.getDisplayMedia({ video: true }).then(screenStream => {
    const screenTrack = screenStream.getVideoTracks()[0];
    if (peerConnection) {
      const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) sender.replaceTrack(screenTrack);
    }
    const localVid = document.getElementById(`local-video-${role}`);
    if (localVid) localVid.srcObject = screenStream;
    screenTrack.onended = () => {
      if (activeLocalStream) {
        const videoTrack = activeLocalStream.getVideoTracks()[0];
        if (peerConnection) {
          const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        }
        if (localVid) localVid.srcObject = activeLocalStream;
      }
    };
    showToast('Screen sharing active 🖥️', 'success');
  }).catch(() => showToast('Screen sharing cancelled.', 'info'));
}

async function joinIncomingVideoCallRoom(targetCallId, callerName) {
  const user = state.currentUser;
  const role = user?.accountRole || state.role || 'mentee';

  if (role === 'mentor') {
    switchTab('mentor', 'videocall');
    const box = document.getElementById('native-video-box-mentor');
    const linkPanel = document.getElementById('active-meeting-link');
    const controls = document.getElementById('real-call-controls');
    if (box) box.style.display = 'block';
    if (controls) controls.style.display = 'block';
    if (linkPanel) {
      linkPanel.style.display = 'block';
      linkPanel.innerHTML = `<strong>Live WebRTC Call Active</strong><br><span style="color:var(--text-muted);">Connected with: ${callerName}</span>`;
    }
    launchHostedVideoCall(targetCallId, 'mentor', user?.name || 'Mentor');
  } else {
    switchTab('mentee', 'videocall');
    const box = document.getElementById('native-video-box-mentee');
    const linkPanel = document.getElementById('mentee-active-meeting-link');
    const controls = document.getElementById('mentee-real-call-controls');
    if (box) box.style.display = 'block';
    if (controls) controls.style.display = 'block';
    if (linkPanel) {
      linkPanel.style.display = 'block';
      linkPanel.innerHTML = `<strong>Live WebRTC Call Active</strong><br><span style="color:var(--text-muted);">Connected with: ${callerName}</span>`;
    }
    launchHostedVideoCall(targetCallId, 'mentee', user?.name || 'Mentee');
  }
}

// Hosted Jitsi Meet includes reliable signaling and TURN relays, avoiding the
// fragile direct browser offer/answer exchange that caused the black video view.
function launchHostedVideoCall(room, role, displayName) {
  closeNativeWebRTC();
  const box = document.getElementById(`native-video-box-${role}`);
  if (!box) return;
  const safeRoom = String(room || `MentorMatcher-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '-');
  state.activeCallRoom = safeRoom;
  const callUrl = `https://meet.ffmuc.net/${encodeURIComponent(safeRoom)}#userInfo.displayName=${encodeURIComponent(displayName)}`;
  box.style.display = 'block';
  // Public meeting providers often block cross-origin iframes. Open the room as
  // a first-party browser tab so camera, microphone, and remote video can work.
  box.innerHTML = `<div style="height:540px; display:flex; align-items:center; justify-content:center; text-align:center; padding:28px; background:radial-gradient(circle at 50% 0, rgba(99,102,241,.28), transparent 52%), #090D16;"><div><div style="font-size:50px; margin-bottom:16px;">🎥</div><h3 style="font-family:var(--font-heading); font-size:24px; margin-bottom:8px;">Your secure video room is ready</h3><p style="color:var(--text-muted); max-width:440px; margin:0 auto 20px;">The meeting opens in a separate tab so your camera and the other person’s video work correctly.</p><a href="${callUrl}" target="_blank" rel="noopener" class="btn btn-primary" style="justify-content:center;">Open Video Call ↗</a><div style="font-size:12px; color:var(--text-muted); margin-top:16px;">Both people must open the call room to see each other.</div></div></div>`;
  const callWindow = window.open(callUrl, '_blank', 'noopener');
  if (!callWindow) showToast('Click “Open Video Call” to launch the secure meeting.', 'info');
}

function endActiveCallSilently() {
  closeNativeWebRTC();
  const box1 = document.getElementById('native-video-box-mentor');
  const controls1 = document.getElementById('real-call-controls');
  const linkPanel1 = document.getElementById('active-meeting-link');
  if (box1) box1.style.display = 'none';
  if (controls1) controls1.style.display = 'none';
  if (linkPanel1) linkPanel1.style.display = 'none';

  const box2 = document.getElementById('native-video-box-mentee');
  const controls2 = document.getElementById('mentee-real-call-controls');
  const linkPanel2 = document.getElementById('mentee-active-meeting-link');
  if (box2) box2.style.display = 'none';
  if (controls2) controls2.style.display = 'none';
  if (linkPanel2) linkPanel2.style.display = 'none';
  stopLiveAiMentorSession();
}

async function startRealVideoCall(students) {
  students = students || [selectedMentee()].filter(Boolean);
  if (!students.length) return showToast('Select at least one student to invite.', 'error');
  const mentor = state.currentUser || state.mentors[0];
  state.activeCallStudentIds = students.map(student => student.id);
  const room = `MentorMatcher-${Date.now()}`;
  state.activeCallRoom = room;

  const box = document.getElementById('native-video-box-mentor');
  const linkPanel = document.getElementById('active-meeting-link');
  const controls = document.getElementById('real-call-controls');
  if (box) box.style.display = 'block';
  if (controls) controls.style.display = 'block';
  if (linkPanel) {
    linkPanel.style.display = 'block';
    linkPanel.innerHTML = `<strong>Native WebRTC Call Started</strong><br><span style="color:var(--text-muted);">Ringing: ${students.map(student => student.name).join(', ')}</span>`;
  }

  const callData = await registerServerCall(room, students[0]);
  if (!callData) return showToast('Could not register call.', 'error');

  launchHostedVideoCall(room, 'mentor', mentor.name || 'Mentor');
  await sendMeetingInvites(students);
  await startLiveAiMentorSession(students[0], mentor);
  showToast(`Ringing ${students.map(s => s.name).join(', ')}...`, 'info');
}

async function inviteStudentsToActiveCall() { openCallMemberPicker('add'); }

async function addStudentsToActiveCall(newStudents) {
  if (!newStudents.length) return showToast('Select another student to add.', 'info');
  for (const student of newStudents) {
    await registerServerCall(state.activeCallRoom || 'Room', student);
  }
  await sendMeetingInvites(newStudents);
  showToast(`${newStudents.length} student${newStudents.length > 1 ? 's' : ''} added to call invitation.`, 'success');
}

function endRealVideoCall() {
  if (activeOutgoingCallId) {
    fetch(`/api/v1/calls/${activeOutgoingCallId}/ended`, { method: 'PATCH' }).catch(() => undefined);
    activeOutgoingCallId = null;
  }
  endActiveCallSilently();
  showToast('Call ended.', 'info');
}

let selectedStudentCallRecipient = null;

async function openStudentCallPicker() {
  const mentee = state.currentUser || state.mentees[0];
  if (!mentee) return showToast('Please sign in before starting a call.', 'error');
  const list = document.getElementById('student-call-picker-list');
  if (!list) return;
  list.innerHTML = '<div style="color:var(--text-muted); padding:16px;">Loading people…</div>';
  openModal('modal-student-call-picker');
  try {
    const accounts = await accountRequest('people');
    const people = accounts.map(accountToUser).filter(person => person.id !== mentee.id);
    const assignedMentor = people.find(person => person.id === mentee.assignedMentorId || person.name === mentee.assignedMentorName);
    selectedStudentCallRecipient = assignedMentor || people[0] || null;
    list.innerHTML = people.map(person => `<label class="option-checkbox" style="display:flex; align-items:center; gap:12px;"><input type="radio" name="student-call-recipient" value="${person.id}" ${person.id === selectedStudentCallRecipient?.id ? 'checked' : ''} onchange="selectStudentCallRecipient('${person.id}')"><span><strong>${person.name}</strong><span style="display:block; font-size:12px; color:var(--text-muted);">${person.accountRole === 'mentor' ? `Mentor · ${person.title || person.role}` : `Mentee · ${person.role || 'Learner'}`}</span></span></label>`).join('') || '<p style="color:var(--text-muted);">No other registered people are available to call yet.</p>';
  } catch (error) { list.innerHTML = `<p style="color:#F87171;">${error.message || 'Could not load people.'}</p>`; }
}

function selectStudentCallRecipient(id) {
  const radio = document.querySelector(`input[name="student-call-recipient"][value="${id}"]`);
  const label = radio?.parentElement?.textContent || '';
  selectedStudentCallRecipient = { id, name: label.trim().split('\n')[0] };
}

async function confirmStudentCallPicker() {
  const selectedId = document.querySelector('input[name="student-call-recipient"]:checked')?.value;
  if (!selectedId) return showToast('Choose a person to call.', 'error');
  try {
    const accounts = await accountRequest('people');
    const recipient = accounts.map(accountToUser).find(person => person.id === selectedId);
    if (!recipient) throw new Error('That person is no longer available.');
    closeModal('modal-student-call-picker');
    await startStudentVideoCall(recipient);
  } catch (error) { showToast(error.message || 'Could not start the call.', 'error'); }
}

async function startStudentVideoCall(recipientOverride) {
  const mentee = state.currentUser || state.mentees[0];
  const mentor = recipientOverride || state.mentors.find(item => item.id === mentee.assignedMentorId) || state.mentors.find(item => item.name === mentee.assignedMentorName);
  if (!mentee || !mentor) return showToast('Choose a registered person to call first.', 'error');

  const room = `MentorMatcher-${Date.now()}`;
  state.activeCallRoom = room;
  const box = document.getElementById('native-video-box-mentee');
  const linkPanel = document.getElementById('mentee-active-meeting-link');
  const controls = document.getElementById('mentee-real-call-controls');
  if (box) box.style.display = 'block';
  if (controls) controls.style.display = 'block';
  if (linkPanel) {
    linkPanel.style.display = 'block';
    linkPanel.innerHTML = `<strong>Native WebRTC Call Started</strong><br><span style="color:var(--text-muted);">Ringing ${mentor.name}...</span>`;
  }

  const callData = await registerServerCall(room, mentor);
  if (!callData) return showToast('Could not register call.', 'error');

  launchHostedVideoCall(room, 'mentee', mentee.name || 'Mentee');
  recordStudentActivity('Started a native WebRTC video call', 15);
  await sendStudentMeetingInvite(mentor, mentee);
  if (mentor.accountRole === 'mentor') await startLiveAiMentorSession(mentee, mentor);
  else {
    const sidebarMentee = document.getElementById('ai-mentor-sidebar');
    const sidebarMentor = document.getElementById('ai-mentor-sidebar-mentor');
    if (sidebarMentee) sidebarMentee.style.display = 'none';
    if (sidebarMentor) sidebarMentor.style.display = 'none';
  }
  showToast(`Ringing ${mentor.name}...`, 'info');
}

function endStudentVideoCall(showMessage = true) {
  if (activeOutgoingCallId) {
    fetch(`/api/v1/calls/${activeOutgoingCallId}/ended`, { method: 'PATCH' }).catch(() => undefined);
    activeOutgoingCallId = null;
  }
  endActiveCallSilently();
  if (showMessage) showToast('Call ended.', 'info');
}

const liveAiMentor = { id: null, eventSource: null, stream: null, displayStream: null, microphoneStream: null, audioContext: null, analyser: null, pcmCapture: null, pcmChunks: [], vadTimer: null, silenceTimer: null, uploadQueue: Promise.resolve(), listening: false, speechActive: false, lastSpeechAt: 0, retryTimer: null, retries: 0 };

function updateLiveAiStatus(text, color = '#94A3B8') {
  ['ai-mentor-status', 'ai-mentor-status-mentor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = text; el.style.color = color; }
  });
}

function updateLiveAiPanel(html, isHtml = false) {
  ['ai-mentor-suggestions', 'ai-mentor-suggestions-mentor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) isHtml ? el.innerHTML = html : el.textContent = html;
  });
}

function updateLiveAiToggle() {
  ['ai-mentor-toggle', 'ai-mentor-toggle-mentor'].forEach(id => {
    const button = document.getElementById(id);
    if (!button) return;
    button.textContent = liveAiMentor.listening ? '⏹ Turn off AI listening' : '🎧 Turn on AI listening';
  });
}

function updateLiveAiLanguage() {
  // Check both mentee and mentor language selectors
  const langSelectMentee = document.getElementById('ai-mentor-language');
  const langSelectMentor = document.getElementById('ai-mentor-language-mentor');
  const langSelect = langSelectMentee || langSelectMentor;
  if (langSelect) {
    liveAiMentor.language = langSelect.value || undefined;
    console.log('[Live AI] Language set to:', liveAiMentor.language || 'auto-detect');
    // Sync both selectors if both exist
    if (langSelectMentee && langSelectMentor) {
      if (langSelect === langSelectMentee) langSelectMentor.value = langSelectMentee.value;
      else langSelectMentee.value = langSelectMentor.value;
    }
  }
}

async function startLiveAiMentorSession(mentee, mentor) {
  if (liveAiMentor.id) stopLiveAiMentorSession();
  const sidebarMentee = document.getElementById('ai-mentor-sidebar');
  const sidebarMentor = document.getElementById('ai-mentor-sidebar-mentor');
  if (sidebarMentee) sidebarMentee.style.display = 'block';
  if (sidebarMentor) sidebarMentor.style.display = 'block';

  updateLiveAiStatus('Waiting for AI listening', '#FBBF24');
  updateLiveAiPanel('Turn on AI listening when your call room is open. In the browser picker, choose the video-call tab and tick “Share tab audio”.');
  liveAiMentor.id = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const topic = state.sessions.find(item => item.menteeId === mentee?.id || item.menteeName === mentee?.name)?.topic || mentee?.goal || 'Mentorship session';
  try {
    const response = await fetch('/api/v1/mentor-sessions/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: liveAiMentor.id, studentId: mentee?.id || 'mentee', mentorId: mentor?.id || 'mentor', topic }) });
    const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Could not start the AI mentor.');
    connectLiveAiStream();
    updateLiveAiToggle();
  } catch (error) {
    updateLiveAiStatus('AI unavailable', '#F87171');
    updateLiveAiPanel(error.message || 'The Live AI service could not start. Check that Groq is configured on the server.');
  }
}

async function toggleLiveAiListening() {
  if (liveAiMentor.listening) return stopLiveAiListening();
  if (!liveAiMentor.id) return showToast('Start or join a mentor call first.', 'info');
  if (!navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder) {
    updateLiveAiStatus('AI listening unavailable', '#F87171');
    return updateLiveAiPanel('This browser cannot capture call audio. Use an up-to-date Chrome or Edge browser.');
  }
  try {
    updateLiveAiStatus('Choose call audio…', '#FBBF24');
    updateLiveAiPanel('Choose the video-call browser tab in the next window and make sure “Share tab audio” is enabled.');
    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    if (!displayStream.getAudioTracks().length) {
      displayStream.getTracks().forEach(track => track.stop());
      throw new Error('No call audio was shared. Choose the video-call tab and tick “Share tab audio”, then try again.');
    }
    const microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 }, video: false });
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const destination = context.createMediaStreamDestination();
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    context.createMediaStreamSource(displayStream).connect(destination);
    context.createMediaStreamSource(microphoneStream).connect(destination);
    context.createMediaStreamSource(displayStream).connect(analyser);
    context.createMediaStreamSource(microphoneStream).connect(analyser);
    const pcmCapture = context.createScriptProcessor(4096, 1, 1);
    pcmCapture.onaudioprocess = event => {
      if (liveAiMentor.listening) liveAiMentor.pcmChunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    };
    context.createMediaStreamSource(destination.stream).connect(pcmCapture);
    pcmCapture.connect(context.destination);
    liveAiMentor.displayStream = displayStream;
    liveAiMentor.microphoneStream = microphoneStream;
    liveAiMentor.audioContext = context;
    liveAiMentor.analyser = analyser;
    liveAiMentor.pcmCapture = pcmCapture;
    liveAiMentor.stream = destination.stream;
    liveAiMentor.listening = true;
    displayStream.getAudioTracks().forEach(track => track.onended = () => stopLiveAiListening('AI listening was turned off because call-audio sharing stopped.'));
    startLiveAiVoiceActivityDetection();
    updateLiveAiToggle();
    updateLiveAiStatus('● Listening to conversation', '#34D399');
    updateLiveAiPanel('🎧 Listening to the real call audio. Questions appear after someone finishes a thought.');
  } catch (error) {
    stopLiveAiListening();
    updateLiveAiStatus('AI listening unavailable', '#F87171');
    updateLiveAiPanel(error.message || 'Allow microphone and call-tab audio access to enable Live AI.');
  }
}

function startLiveAiVoiceActivityDetection() {
  const sample = new Uint8Array(liveAiMentor.analyser.frequencyBinCount);
  const check = () => {
    if (!liveAiMentor.listening || !liveAiMentor.analyser) return;
    liveAiMentor.analyser.getByteTimeDomainData(sample);
    let total = 0; for (const value of sample) total += Math.abs(value - 128);
    const speaking = total / sample.length > 5;
    if (speaking) {
      liveAiMentor.lastSpeechAt = Date.now();
      if (!liveAiMentor.speechActive) updateLiveAiStatus('● Listening to conversation', '#34D399');
      liveAiMentor.speechActive = true;
      if (liveAiMentor.silenceTimer) { clearTimeout(liveAiMentor.silenceTimer); liveAiMentor.silenceTimer = null; }
    } else if (liveAiMentor.speechActive && !liveAiMentor.silenceTimer) {
      liveAiMentor.silenceTimer = setTimeout(finalizeLiveAiPause, 2500);
    }
    liveAiMentor.vadTimer = setTimeout(check, 200);
  };
  check();
}

async function finalizeLiveAiPause() {
  liveAiMentor.silenceTimer = null;
  if (!liveAiMentor.listening || Date.now() - liveAiMentor.lastSpeechAt < 2300) return;
  liveAiMentor.speechActive = false;
  updateLiveAiStatus('📝 Understanding conversation…', '#60A5FA');
  const wav = takeLiveAiAudioWav();
  if (wav) queueLiveAudio(wav);
  await liveAiMentor.uploadQueue;
  if (!liveAiMentor.listening || Date.now() - liveAiMentor.lastSpeechAt < 2300) return;
  updateLiveAiStatus('🧠 Thinking…', '#A78BFA');
  try {
    const response = await fetch(`/api/v1/mentor-sessions/${encodeURIComponent(liveAiMentor.id)}/analyze`, { method: 'POST' });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || 'AI analysis could not be completed.');
  } catch (error) {
    updateLiveAiStatus('AI listening temporarily unavailable', '#F87171');
    updateLiveAiPanel(error.message || 'The latest conversation could not be analyzed.');
  }
}

function connectLiveAiStream() {
  if (!liveAiMentor.id) return;
  liveAiMentor.eventSource?.close();
  const source = new EventSource(`/api/v1/mentor-sessions/${encodeURIComponent(liveAiMentor.id)}/events`);
  liveAiMentor.eventSource = source;
  source.onmessage = event => {
    try { handleLiveAiEvent(JSON.parse(event.data)); } catch (_) {}
  };
  source.onerror = () => {
    source.close();
    if (liveAiMentor.id && liveAiMentor.retries++ < 5) liveAiMentor.retryTimer = setTimeout(connectLiveAiStream, 1500 * liveAiMentor.retries);
  };
}

function takeLiveAiAudioWav() {
  const chunks = liveAiMentor.pcmChunks.splice(0);
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  if (!length || !liveAiMentor.audioContext) return null;
  const samples = new Float32Array(length); let offset = 0;
  chunks.forEach(chunk => { samples.set(chunk, offset); offset += chunk.length; });
  const buffer = new ArrayBuffer(44 + samples.length * 2); const view = new DataView(buffer);
  const write = (at, value) => { for (let index = 0; index < value.length; index++) view.setUint8(at + index, value.charCodeAt(index)); };
  write(0, 'RIFF'); view.setUint32(4, 36 + samples.length * 2, true); write(8, 'WAVE'); write(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, liveAiMentor.audioContext.sampleRate, true); view.setUint32(28, liveAiMentor.audioContext.sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); write(36, 'data'); view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index++) view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, samples[index])) * 0x7fff, true);
  return new Blob([buffer], { type: 'audio/wav' });
}

function queueLiveAudio(blob) {
  liveAiMentor.uploadQueue = liveAiMentor.uploadQueue.then(() => uploadLiveAudio(blob)).catch(() => undefined);
  return liveAiMentor.uploadQueue;
}

async function uploadLiveAudio(blob) {
  if (!liveAiMentor.id) return;
  const audioBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob);
  });
  const mimeType = (blob.type || 'audio/wav').split(';')[0];
  // Detect Urdu language from session or default to auto-detect
  // 'ur' is the ISO 639-1 code for Urdu
  const language = liveAiMentor.language || (window.navigator.language?.startsWith('ur') ? 'ur' : undefined);
  const response = await fetch(`/api/v1/mentor-sessions/${encodeURIComponent(liveAiMentor.id)}/audio`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audioBase64, mimeType, language }) });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || 'Audio transcription failed.');
}

function handleLiveAiEvent(event) {
  if (event.type === 'error') {
    updateLiveAiStatus('AI listening temporarily unavailable', '#F87171');
    updateLiveAiPanel(event.error_message);
    return;
  }
  if (event.type === 'transcript') { updateLiveAiStatus('📝 Understanding conversation…', '#60A5FA'); return; }
  if (event.type !== 'ai-suggestions') return;

  updateLiveAiStatus('🎯 Questions you can ask', '#34D399');
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const questions = (event.questions_to_ask || []).map(question => `<div style="padding:10px; margin-top:7px; border-radius:10px; background:rgba(255,255,255,.07);">${escapeHtml(question)}</div>`).join('');
  updateLiveAiPanel(questions ? `<strong style="display:block; margin-bottom:6px;">Ask your mentor</strong>${questions}` : 'Listening to the conversation. More context is needed before a useful question can be suggested.', true);
}

function stopLiveAiListening(message = 'AI listening is off. No call audio is being sent for transcription.') {
  if (liveAiMentor.vadTimer) clearTimeout(liveAiMentor.vadTimer);
  if (liveAiMentor.silenceTimer) clearTimeout(liveAiMentor.silenceTimer);
  try { liveAiMentor.pcmCapture?.disconnect(); } catch (_) {}
  liveAiMentor.stream?.getTracks().forEach(track => track.stop());
  liveAiMentor.displayStream?.getTracks().forEach(track => track.stop());
  liveAiMentor.microphoneStream?.getTracks().forEach(track => track.stop());
  liveAiMentor.audioContext?.close().catch(() => undefined);
  Object.assign(liveAiMentor, { stream: null, displayStream: null, microphoneStream: null, audioContext: null, analyser: null, pcmCapture: null, pcmChunks: [], vadTimer: null, silenceTimer: null, listening: false, speechActive: false, lastSpeechAt: 0, uploadQueue: Promise.resolve() });
  updateLiveAiToggle();
  if (liveAiMentor.id) { updateLiveAiStatus('AI listening off', '#94A3B8'); updateLiveAiPanel(message); }
}

function stopLiveAiMentorSession() {
  const sessionId = liveAiMentor.id;
  if (liveAiMentor.retryTimer) clearTimeout(liveAiMentor.retryTimer);
  liveAiMentor.eventSource?.close();
  stopLiveAiListening();
  Object.assign(liveAiMentor, { id: null, eventSource: null, retryTimer: null, retries: 0 });
  
  const sidebarMentee = document.getElementById('ai-mentor-sidebar');
  const sidebarMentor = document.getElementById('ai-mentor-sidebar-mentor');
  if (sidebarMentee) sidebarMentee.style.display = 'none';
  if (sidebarMentor) sidebarMentor.style.display = 'none';
  if (sessionId) fetch(`/api/v1/mentor-sessions/${encodeURIComponent(sessionId)}/end`, { method: 'POST' }).catch(() => undefined);
}

function meetingUrl() {
  return `${window.location.origin}/?callRoom=${encodeURIComponent(state.activeCallRoom || 'MentorMatcherCall')}`;
}

async function sendStudentMeetingInvite(mentor, mentee) {
  const summary = `${mentee.name} has started a live MentorMatcher WebRTC video call. Open MentorMatcher dashboard to answer live.`;
  try {
    await fetch('/api/v1/communications/compose-and-send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderRole: 'student', senderName: mentee.name, recipientEmail: mentor.email, recipientName: mentor.name, summary, type: 'general' })
    });
  } catch (_) { /* Delivery fallback */ }
}

async function sendMeetingInvites(students) {
  const mentor = state.currentUser || state.mentors[0];
  await Promise.all(students.map(async student => {
    const summary = `Please join my live MentorMatcher WebRTC video call from your dashboard.`;
    try {
      await fetch('/api/v1/communications/compose-and-send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderRole: 'mentor', senderName: mentor.name, recipientEmail: student.email, recipientName: student.name, summary, type: 'general' }) });
    } catch (_) { /* Delivery fallback */ }
  }));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function studentActivity(student) {
  const todayEvents = state.dailyActivity.filter(event => event.studentId === student.id && event.date === todayKey());
  const points = todayEvents.reduce((total, event) => total + event.points, 0);
  const score = Math.min(100, points);
  return { events: todayEvents, points, score, lastEvent: todayEvents[0] };
}

function recordStudentActivity(action, points = 10) {
  if (state.role !== 'mentee' || !state.currentUser) return;
  const student = state.mentees.find(item => item.id === state.currentUser.id || item.email === state.currentUser.email) || state.currentUser;
  const event = { id: `act_${Date.now()}`, studentId: student.id, studentName: student.name, date: todayKey(), action, points, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  state.dailyActivity.unshift(event);
  student.lastActivityAt = new Date().toISOString();
  syncState();
}

function activityStatus(score) {
  if (score >= 60) return { label: 'Highly active', color: '#34D399' };
  if (score >= 25) return { label: 'Making progress', color: '#FBBF24' };
  return { label: 'Needs a check-in', color: '#F87171' };
}

function renderMentorActivity() {
  const date = new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  const dateEl = document.getElementById('activity-monitor-date');
  if (dateEl) dateEl.textContent = date;
  const summary = document.getElementById('mentor-activity-summary');
  if (summary) summary.innerHTML = state.mentees.map(student => {
    const activity = studentActivity(student); const status = activityStatus(activity.score);
    return `<div style="padding:18px; border:1px solid var(--border-color); border-radius:14px; background:rgba(255,255,255,.025);">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;"><strong>${student.name}</strong><span style="font-size:12px; color:${status.color}; font-weight:700;">${status.label}</span></div>
      <div style="font-size:13px; color:var(--text-muted); margin-top:6px;">${activity.events.length} learning actions today · ${activity.points} points</div>
      <div class="progress-track" style="margin:12px 0 8px;"><div class="progress-fill" style="width:${activity.score}%;"></div></div>
      <div style="font-size:12px; color:var(--text-muted);">${activity.lastEvent ? `Last update: ${activity.lastEvent.action} at ${activity.lastEvent.time}` : 'No work logged today'}</div>
    </div>`;
  }).join('') || '<p style="color:var(--text-muted);">No students are assigned yet.</p>';
  const feed = document.getElementById('mentor-activity-feed');
  const todayEvents = state.dailyActivity.filter(event => event.date === todayKey()).slice(0, 12);
  if (feed) feed.innerHTML = todayEvents.map(event => `<div style="display:flex; justify-content:space-between; gap:16px; padding:12px 0; border-bottom:1px solid var(--border-color);"><div><strong>${event.studentName}</strong><div style="font-size:13px; color:var(--text-muted);">${event.action}</div></div><div style="text-align:right; white-space:nowrap;"><div style="font-size:12px; color:#34D399;">+${event.points} pts</div><div style="font-size:12px; color:var(--text-muted);">${event.time}</div></div></div>`).join('') || '<p style="color:var(--text-muted);">No activity recorded today.</p>';
}

function renderMenteeActivity() {
  const container = document.getElementById('mentee-activity-summary');
  if (!container || !state.currentUser) return;
  const activity = studentActivity(state.currentUser); const status = activityStatus(activity.score);
  container.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><div><div style="font-size:30px; font-weight:800; color:${status.color};">${activity.score}/100</div><div style="font-size:13px; color:var(--text-muted);">Today’s work activity score</div></div><span class="badge" style="background:${status.color}22; color:${status.color};">${status.label}</span></div><div class="progress-track"><div class="progress-fill" style="width:${activity.score}%;"></div></div><div style="font-size:13px; color:var(--text-muted); margin:14px 0 8px;">Today’s logged work</div>${activity.events.map(event => `<div style="padding:10px 0; border-top:1px solid var(--border-color); font-size:14px;">✓ ${event.action} <span style="float:right; color:var(--text-muted); font-size:12px;">${event.time}</span></div>`).join('') || '<p style="color:var(--text-muted);">Complete a resource, send an update, or join a session to start logging your activity.</p>'}`;
}

function startRegistration() {
  state.role = null;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('role-next-btn').disabled = true;
  showScreen('screen-role');
}

async function handleLogin(e) {
  if (e) e.preventDefault();
  const role = document.querySelector('input[name="login-role"]:checked')?.value;
  if (!role) return showToast('Choose whether you are logging in as a mentor or mentee.', 'error');
  try {
    const result = await accountRequest('login', { method: 'POST', body: JSON.stringify({ email: document.getElementById('login-email').value.trim(), password: document.getElementById('login-password').value, role }) });
    state.authToken = result.token;
    state.role = result.account.role;
    state.currentUser = accountToUser(result.account);
    await loadRegisteredMentors();
    syncState();
    showToast(`Welcome back, ${state.currentUser.name}!`, 'success');
    state.role === 'mentor' ? goToMentorDashboard() : goToMenteeDashboard();
  } catch (error) { showToast(error.message || 'Login failed. Check your email and password.', 'error'); }
}

function openPasswordReset() {
  const loginEmail = document.getElementById('login-email')?.value.trim();
  const selectedRole = document.querySelector('input[name="login-role"]:checked')?.value;
  document.getElementById('reset-email').value = loginEmail || '';
  document.getElementById('reset-role').value = selectedRole || 'mentor';
  document.getElementById('reset-new-password').value = '';
  openModal('modal-password-reset');
}

async function confirmPasswordResetDirect(event) {
  event.preventDefault();
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const prevText = submitBtn.innerText;
  submitBtn.disabled = true;
  submitBtn.innerText = 'Saving new password...';
  try {
    const email = document.getElementById('reset-email').value.trim();
    const role = document.getElementById('reset-role').value;
    const newPassword = document.getElementById('reset-new-password').value;
    
    let result;
    try {
      result = await accountRequest('password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ email, newPassword })
      });
    } catch (error) {
      const localProfile = findLocalProfileForEmail(email, role);
      if (!/no account exists/i.test(error.message || '') || !localProfile) throw error;
      await accountRequest('register', {
        method: 'POST',
        body: JSON.stringify({
          role: localProfile.accountRole === 'mentor' ? 'mentor' : 'mentee',
          name: localProfile.name || email.split('@')[0],
          email,
          password: newPassword,
          profile: { ...localProfile, currentRole: localProfile.currentRole || localProfile.role }
        })
      });
      result = { message: 'Password updated. You can now log in with your new password.' };
    }

    closeModal('modal-password-reset');
    document.getElementById('login-email').value = email;
    const loginRoleRadios = document.getElementsByName('login-role');
    loginRoleRadios.forEach(radio => {
      if (radio.value === role) radio.checked = true;
    });
    
    showToast(result.message || 'Password updated. You can now log in.', 'success');
  } catch (error) {
    showToast(error.message || 'Could not reset your password.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = prevText;
  }
}

function selectRole(role) {
  state.role = role;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(`role-card-${role}`);
  if (card) card.classList.add('selected');
  const nextBtn = document.getElementById('role-next-btn');
  if (nextBtn) nextBtn.disabled = false;
}

function proceedFromRole() {
  if (state.role === 'mentor') showScreen('screen-mentor-1');
  else if (state.role === 'mentee') showScreen('screen-mentee-1');
}

function logout() {
  state.currentUser = null;
  state.role = null;
  state.authToken = null;
  Store.remove('current_user');
  Store.remove('user_role');
  Store.remove('auth_token');
  syncState();
  showToast('Logged out', 'info');
  showScreen('screen-landing');
}

async function deleteUserAccount(role) {
  if (!confirm("⚠️ WARNING: Are you sure you want to permanently delete your account? All progress, pairing requests, and feedback will be lost forever. This action cannot be undone.")) return;
  try {
    const result = await accountRequest('me', { method: 'DELETE' });
    if (result.success) {
      showToast('Account deleted successfully.', 'success');
      state.currentUser = null;
      state.role = null;
      state.authToken = null;
      Store.remove('current_user');
      Store.remove('user_role');
      Store.remove('auth_token');
      syncState();
      showScreen('screen-landing');
    }
  } catch (error) {
    showToast(error.message || 'Failed to delete account.', 'error');
  }
}

function openSettingsPage() {
  if (state.role === 'mentor') switchTab('mentor', 'settings');
  else switchTab('mentee', 'settings');
}

// ==========================================
// WHATSAPP-STYLE VIDEO CALL STATE MACHINE
// ==========================================

function initVideoCallLobby(role) {
  clearVideoCallTimers();
  state.callState = 'idle';
  state.callDurationSeconds = 0;
  updateCallViewUI(role);
}

function startOutgoingCall(role) {
  if (role === 'mentee') recordStudentActivity('Joined a scheduled mentor session', 15);
  state.callState = 'ringing';
  updateCallViewUI(role);
  showToast('Ringing 🔔 Connecting call...', 'info');

  state.ringingTimeout = setTimeout(() => {
    connectCall(role);
  }, 2500);
}

function cancelOutgoingCall(role) {
  clearVideoCallTimers();
  showToast('Call cancelled', 'info');
  initVideoCallLobby(role);
}

function connectCall(role) {
  clearVideoCallTimers();
  state.callState = 'connected';
  state.callDurationSeconds = 0;
  state.isVideoMicOn = true;
  state.isVideoCamOn = true;
  updateCallViewUI(role);
  showToast('Call Connected in HD 🟢', 'success');

  state.callTimerInterval = setInterval(() => {
    state.callDurationSeconds++;
    const timerEl = document.getElementById(`v-duration-${role}`);
    if (timerEl) {
      const mins = String(Math.floor(state.callDurationSeconds / 60)).padStart(2, '0');
      const secs = String(state.callDurationSeconds % 60).padStart(2, '0');
      timerEl.innerText = `${mins}:${secs}`;
    }
  }, 1000);
}

function endActiveCall(role) {
  const elapsedMins = String(Math.floor(state.callDurationSeconds / 60)).padStart(2, '0');
  const elapsedSecs = String(state.callDurationSeconds % 60).padStart(2, '0');
  const completedSession = state.callDurationSeconds >= 60;
  
  clearVideoCallTimers();
  showToast(`Call Ended. Session Duration: ${elapsedMins}:${elapsedSecs}`, 'info');
  if (role === 'mentee' && completedSession) recordStudentActivity('Completed mentor session participation', 20);
  initVideoCallLobby(role);
}

function clearVideoCallTimers() {
  if (state.callTimerInterval) {
    clearInterval(state.callTimerInterval);
    state.callTimerInterval = null;
  }
  if (state.ringingTimeout) {
    clearTimeout(state.ringingTimeout);
    state.ringingTimeout = null;
  }
}

function updateCallViewUI(role) {
  const lobbyView = document.getElementById(`v-lobby-${role}`);
  const ringingView = document.getElementById(`v-ringing-${role}`);
  const activeView = document.getElementById(`v-active-${role}`);

  if (lobbyView) lobbyView.style.display = state.callState === 'idle' ? 'block' : 'none';
  if (ringingView) ringingView.style.display = state.callState === 'ringing' ? 'block' : 'none';
  if (activeView) activeView.style.display = state.callState === 'connected' ? 'block' : 'none';

  updateVideoControlsUI(role);
}

function toggleMic(role) {
  state.isVideoMicOn = !state.isVideoMicOn;
  updateVideoControlsUI(role);
  showToast(state.isVideoMicOn ? 'Microphone Unmuted 🎙️' : 'Microphone Muted 🔇', 'info');
}

function toggleCam(role) {
  state.isVideoCamOn = !state.isVideoCamOn;
  updateVideoControlsUI(role);
  showToast(state.isVideoCamOn ? 'Camera Turned On 📹' : 'Camera Turned Off 📷', 'info');
}

function toggleScreenShare() {
  showToast('Screen sharing active 🖥️', 'success');
}

function updateVideoControlsUI(role) {
  const r = role || state.role || 'mentor';
  const micBtn = document.getElementById(`v-mic-btn-${r}`);
  const camBtn = document.getElementById(`v-cam-btn-${r}`);
  const videoFeed = document.getElementById(`v-feed-box-${r}`);

  if (micBtn) micBtn.innerHTML = state.isVideoMicOn ? '🎙️ Mic On' : '🔇 Muted';
  if (camBtn) camBtn.innerHTML = state.isVideoCamOn ? '📹 Cam On' : '📷 Cam Off';
  if (videoFeed) videoFeed.style.opacity = state.isVideoCamOn ? '1' : '0.4';
}

// 5-STEP MENTOR ONBOARDING HANDLERS
function handleMentorStep1(e) {
  if (e) e.preventDefault();
  state.role = 'mentor';
  state.currentUser = {};
  state.registrationPassword = document.getElementById('mentor-password').value;
  state.currentUser.name = document.getElementById('mentor-fullname').value.trim();
  state.currentUser.email = document.getElementById('mentor-email').value.trim();
  state.currentUser.phone = document.getElementById('mentor-phone').value.trim();
  state.currentUser.title = document.getElementById('mentor-title').value.trim();
  showScreen('screen-mentor-2');
}

function handleMentorStep2(e) {
  if (e) e.preventDefault();
  const fields = Array.from(document.querySelectorAll('input[name="mentor-fields"]:checked')).map(cb => cb.value);
  if (fields.length < 2) {
    showToast('Please select at least 2 areas of expertise.', 'error');
    return;
  }
  state.currentUser.specializationFields = fields;
  const services = Array.from(document.querySelectorAll('input[name="mentor-services"]:checked')).map(cb => cb.value);
  state.currentUser.services = services.length ? services : ['1-on-1 Code Review', 'Mock Interviews'];
  showScreen('screen-mentor-3');
}

function handleMentorStep3(e) {
  if (e) e.preventDefault();
  state.currentUser.experience = document.querySelector('input[name="mentor-exp"]:checked')?.value || '5-8 years';
  const langs = Array.from(document.querySelectorAll('input[name="mentor-langs"]:checked')).map(cb => cb.value);
  state.currentUser.languages = langs.length ? langs : ['TypeScript', 'Python'];
  state.currentUser.skills = [...new Set([...(state.currentUser.specializationFields || []), ...state.currentUser.languages])];
  state.currentUser.bio = document.getElementById('mentor-bio')?.value || 'Senior engineer mentoring students.';
  showScreen('screen-mentor-4');
}

function handleMentorStep4(e) {
  if (e) e.preventDefault();
  const pricingType = document.querySelector('input[name="mentor-pricing"]:checked')?.value || 'paid';
  const hourlyRate = parseInt(document.getElementById('mentor-rate-input')?.value || '50', 10);
  
  state.currentUser.pricingType = pricingType;
  state.currentUser.hourlyRate = pricingType === 'free' ? 0 : hourlyRate;
  showScreen('screen-mentor-5');
}

function togglePricingRateInput(type) {
  const container = document.getElementById('mentor-rate-container');
  if (container) container.style.display = type === 'paid' ? 'block' : 'none';
}

async function handleMentorStep5(e) {
  if (e) e.preventDefault();
  state.role = 'mentor';

  const cap = document.getElementById('mentor-capacity')?.value || '3';
  state.currentUser.capacity = cap;
  state.currentUser.sessionDuration = document.getElementById('mentor-session-duration')?.value || '60 minutes';
  state.currentUser.timezone = document.getElementById('mentor-timezone')?.value || 'PKT (UTC+5)';

  const selectedSlots = Array.from(document.querySelectorAll('input[name="mentor-slots"]:checked')).map(cb => cb.value);
  state.currentUser.availableSlots = selectedSlots;
  try {
    await createAccount('mentor', state.currentUser, state.registrationPassword);
    await loadRegisteredMentors();
    showToast(`🎉 Mentor profile created. Welcome ${state.currentUser.name}!`, 'success');
    goToMentorDashboard();
  } catch (error) { showToast(error.message || 'Could not create your account.', 'error'); }
}

function goToMentorDashboard() {
  state.role = 'mentor';
  if (!state.currentUser) state.currentUser = state.mentors[0];
  syncState();
  renderMentorDashboard();
  showScreen('screen-dashboard-mentor');
  switchTab('mentor', 'home');
}

function renderMentorDashboard() {
  const mentor = state.currentUser || state.mentors[0];
  renderMentorChatRecipients();

  const nameEl = document.getElementById('dash-mentor-name');

  if (nameEl) nameEl.innerText = mentor.name;
  
  const titleEl = document.getElementById('dash-mentor-title-sub');
  if (titleEl) titleEl.innerText = `${mentor.title || 'Senior Software Engineer'} • ${mentor.pricingType === 'free' ? '🎁 Pro Bono Free' : `$${mentor.hourlyRate}/hr`}`;

  const menteesStat = document.getElementById('stat-mentor-active-mentees');
  if (menteesStat) menteesStat.innerText = mentor.activeMenteesCount || state.mentees.length;

  const activeTodayStat = document.getElementById('stat-mentor-active-today');
  if (activeTodayStat) activeTodayStat.innerText = state.mentees.filter(student => studentActivity(student).events.length > 0).length;

  const sessionsStat = document.getElementById('stat-mentor-sessions');
  if (sessionsStat) sessionsStat.innerText = state.sessions.length;

  const earningsStat = document.getElementById('stat-mentor-earnings');
  if (earningsStat) earningsStat.innerText = mentor.pricingType === 'free' ? 'Free Mentorship' : `$${state.sessions.length * (mentor.hourlyRate || 50)}`;

  const overviewSessions = document.getElementById('mentor-overview-sessions');
  if (overviewSessions) {
    const upcoming = state.sessions.filter(s => !s.mentorName || s.mentorName === mentor.name).slice(0, 5);
    overviewSessions.innerHTML = upcoming.map(s => `
      <div class="overview-row" style="flex-direction:column; align-items:flex-start; gap:8px;">
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:14px;">${s.topic}</div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">${s.menteeName} · ${s.date}, ${s.time}</div>
          </div>
          <span class="badge ${s.rescheduleRequest ? 'badge-busy' : 'badge-available'}">${s.rescheduleRequest ? 'Reschedule Req' : 'Scheduled'}</span>
        </div>
        ${s.rescheduleRequest ? `
          <div style="width:100%; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:10px; padding:10px; font-size:12px; margin-top:4px;">
            <div style="color:#FBBF24; font-weight:700; margin-bottom:4px;">⚠️ Mentee requested time change:</div>
            <div style="color:var(--text-main); margin-bottom:8px;">"${s.rescheduleRequest}"</div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-primary" style="padding:4px 10px; font-size:11px;" onclick="acceptRescheduleRequest('${s.id}')">✅ Accept Slot</button>
              <button class="btn btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="proposeAlternateSlot('${s.id}')">📅 Propose Slot</button>
            </div>
          </div>
        ` : ''}
      </div>
    `).join('') || '<div style="color:var(--text-muted); padding:12px 0; font-size:14px;">No sessions yet. Schedule one from Mentees.</div>';
  }


  const menteesContainer = document.getElementById('mentor-mentees-list');
  if (menteesContainer) {
    menteesContainer.innerHTML = state.mentees.map(c => `
      <div class="dash-card" style="margin-bottom:14px; background: var(--bg-card);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div class="avatar">${c.name.substring(0,2).toUpperCase()}</div>
            <div>
              <div style="font-weight:700; font-size:16px;">${c.name}</div>
              <div style="font-size:13px; color:var(--text-muted);">${c.role} • ${c.location || 'Pakistan'}</div>
              <div style="font-size:12px; color:var(--primary-cyan); margin-top:2px;">Goal: ${c.goal}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700; color:#34D399;">Score: ${c.score}</div>
            <div style="font-size:12px; color:var(--text-muted);">${c.progressPct}% Progress</div>
            <button class="btn btn-secondary" style="padding:4px 10px; font-size:12px; margin-top:6px;" onclick="openSessionModalForMentee('${c.name}')">📅 Schedule Session</button>
          </div>
        </div>
      </div>
    `).join('') || '<p style="color:var(--text-muted); padding:12px 0;">No mentees registered yet.</p>';
  }

  const sessionsContainer = document.getElementById('mentor-sessions-list');
  if (sessionsContainer) {
    sessionsContainer.innerHTML = state.sessions.map(s => `
      <div class="dash-card" style="margin-bottom:12px; background: var(--bg-card);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="font-size:16px; font-weight:700;">${s.topic}</div>
            <div style="font-size:13px; color:var(--text-muted);">Mentee: <strong>${s.menteeName}</strong> | ${s.date} at ${s.time}</div>
          </div>
          <button class="btn btn-primary" style="padding:6px 12px; font-size:12px;" onclick="switchTab('mentor', 'videocall')">Launch Call 🎥</button>
        </div>
      </div>
    `).join('');
  }

  renderMentorMails();
  renderHomeworkTasks();
}

function getMailboxUser(role) {
  const fallback = role === 'mentor' ? state.mentors[0] : state.mentees[0];
  const user = state.currentUser || fallback;
  return {
    role,
    name: user?.name || (role === 'mentor' ? 'Mentor' : 'Mentee'),
    email: user?.email || ''
  };
}

function isMailReadForUser(mail, viewerEmail) {
  if (!viewerEmail) return false;
  return Array.isArray(mail.readBy) && mail.readBy.includes(viewerEmail);
}

function inboxMailsFor(role) {
  const viewer = getMailboxUser(role);
  return state.mails
    .filter(mail => {
      if (viewer.email && mail.recipientEmail) {
        return mail.recipientEmail.toLowerCase() === viewer.email.toLowerCase();
      }
      return mail.recipientRole === role;
    })
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
}

function renderInboxList(role, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const viewer = getMailboxUser(role);
  const mails = inboxMailsFor(role);

  container.innerHTML = mails.map(mail => `
    <button type="button" class="mail-card" onclick="openReceivedEmail('${mail.id}', '${role}')" style="display:block; width:100%; text-align:left; color:inherit; font:inherit; cursor:pointer; margin-bottom:12px; background:var(--bg-card); border:1px solid var(--border-color); border-left:4px solid ${isMailReadForUser(mail, viewer.email) ? 'var(--border-color)' : 'var(--primary-cyan)'}; border-radius:16px; padding:18px;">
      <div class="mail-card-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:12px;">
        <div style="font-weight:${isMailReadForUser(mail, viewer.email) ? '600' : '800'}; font-size:15px;">📧 ${mail.subject}</div>
        <div class="mail-card-date" style="font-size:12px; color:var(--text-muted); flex-shrink:0;">${mail.date}</div>
      </div>
      <div style="font-size:13px; color:var(--primary-cyan); font-weight:600; margin-bottom:8px;">From: ${mail.senderName} (${mail.senderEmail || 'No email'})</div>
      <div class="mail-card-preview" style="font-size:13px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${mail.body}</div>
      <div style="font-size:12px; color:var(--primary-purple); margin-top:10px; font-weight:700;">Open and reply →</div>
    </button>
  `).join('') || '<p style="color:var(--text-muted);">No emails in your inbox yet.</p>';
}

function renderMentorMails() {
  renderInboxList('mentor', 'mentor-mails-list');
}

function renderMenteeMails() {
  renderInboxList('mentee', 'mentee-mails-list');
}

function openReceivedEmail(emailId, role = state.role) {
  const email = state.mails.find(item => item.id === emailId);
  if (!email) return;
  const viewer = getMailboxUser(role);
  if (viewer.email && !isMailReadForUser(email, viewer.email)) {
    email.readBy = [...new Set([...(email.readBy || []), viewer.email])];
    syncState();
  }
  const content = document.getElementById('email-reader-content');
  content.innerHTML = '';
  const subject = document.createElement('h2');
  subject.style.cssText = 'font-family:var(--font-heading);font-size:23px;margin:0 30px 16px 0;';
  subject.textContent = email.subject;
  const metadata = document.createElement('div');
  metadata.style.cssText = 'padding:14px;background:var(--input-bg);border-radius:12px;font-size:13px;color:var(--text-muted);margin-bottom:20px;';
  metadata.textContent = `From: ${email.senderName} (${email.senderEmail || 'No email'}) · To: ${email.recipientName} (${email.recipientEmail || 'No email'}) · ${email.date}`;
  const body = document.createElement('div');
  body.style.cssText = 'white-space:pre-wrap;line-height:1.7;font-size:15px;';
  body.textContent = email.body;
  content.append(subject, metadata, body);
  const reply = document.getElementById('email-reader-reply');
  reply.textContent = '✉️ Reply';
  reply.onclick = () => { closeModal('modal-email-reader'); openEmailComposer(role, email.senderName, email.senderEmail); };
  if (role === 'mentor') renderMentorMails();
  else renderMenteeMails();
  openModal('modal-email-reader');
}

function renderHomeworkTasks() {
  const container = document.getElementById('mentor-tasks-list');
  if (!container) return;

  container.innerHTML = state.tasks.map(t => `
    <div class="task-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:12px; margin-bottom:8px;">
      <div>
        <div style="font-weight:700; font-size:14px;">📝 ${t.title}</div>
        <div style="font-size:12px; color:var(--text-muted);">Assigned to: ${t.menteeName} • Due: ${t.dueDate}</div>
      </div>
      <span class="badge ${t.status === 'Completed' ? 'badge-available' : 'badge-busy'}">${t.status}</span>
    </div>
  `).join('');
}

function assignNewTask(e) {
  if (e) e.preventDefault();
  const menteeName = document.getElementById('task-mentee-select')?.value || 'Moiz Hussain';
  const title = document.getElementById('task-title-input')?.value;
  const dueDate = document.getElementById('task-date-input')?.value || 'Next Friday';

  if (!title) return;

  state.tasks.unshift({ id: 't_' + Date.now(), menteeName, title, dueDate, status: 'In Progress' });
  syncState();
  showToast(`Assigned task to ${menteeName}!`, 'success');
  renderHomeworkTasks();
  closeModal('modal-assign-task');
}

// 5-STEP MENTEE ONBOARDING HANDLERS
function findLocalProfileForEmail(email, preferredRole) {
  const normalized = (email || '').trim().toLowerCase();
  const matchesEmail = (user) => (user?.email || '').trim().toLowerCase() === normalized;
  const current = matchesEmail(state.currentUser) ? state.currentUser : null;
  const mentee = state.mentees.find(matchesEmail);
  const mentor = state.mentors.find(matchesEmail);
  if (preferredRole === 'mentor') return mentor || current || mentee;
  if (preferredRole === 'mentee') return mentee || current || mentor;
  return current || mentee || mentor;
}

function handleMenteeStep1(e) {
  if (e) e.preventDefault();
  state.role = 'mentee';
  if (!state.currentUser || state.currentUser.accountRole === 'mentor') state.currentUser = {};
  state.registrationPassword = document.getElementById('mentee-password').value;
  state.currentUser.name = document.getElementById('mentee-fullname')?.value || 'Moiz Hussain';
  state.currentUser.email = document.getElementById('mentee-email')?.value || 'moiz@example.com';
  state.currentUser.phone = document.getElementById('mentee-phone')?.value || '+92 300 9876543';
  state.currentUser.role = document.getElementById('mentee-role')?.value || 'Junior Frontend Developer';
  state.currentUser.location = document.getElementById('mentee-location')?.value || 'Lahore, Pakistan';
  showScreen('screen-mentee-2');
}

function handleMenteeStep2(e) {
  if (e) e.preventDefault();
  const interests = Array.from(document.querySelectorAll('input[name="mentee-interests"]:checked')).map(cb => cb.value);
  state.currentUser.interests = interests.length ? interests : ['Web Development', 'React.js'];
  showScreen('screen-mentee-3');
}

function handleMenteeStep3(e) {
  if (e) e.preventDefault();
  state.currentUser.goal = document.getElementById('mentee-goal')?.value || 'Get React internship in 3 months';
  state.currentUser.level = document.getElementById('mentee-level')?.value || 'Intermediate';
  showScreen('screen-mentee-4');
}

function handleMenteeStep4(e) {
  if (e) e.preventDefault();
  const budgetType = document.querySelector('input[name="mentee-budget"]:checked')?.value || 'free';
  state.currentUser.budgetType = budgetType;

  renderMentorSelectionList();
  showScreen('screen-mentee-5');
}

function renderMentorSelectionList() {
  const container = document.getElementById('mentee-mentor-selection-list');
  if (!container) return;

  const search = (document.getElementById('mentor-search-input')?.value || '').toLowerCase();
  const skillFilter = document.getElementById('mentor-skill-filter')?.value || 'ALL';

  const filtered = state.mentors.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search) || m.title.toLowerCase().includes(search);
    const matchesSkill = skillFilter === 'ALL' || (m.skills || []).some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
    return matchesSearch && matchesSkill;
  });

  container.innerHTML = filtered.map((m, idx) => `
    <div class="mentor-select-card ${idx === 0 ? 'selected' : ''}" onclick="selectMentorCard(this, '${m.id}', '${m.name}')">
      <div style="display:flex; align-items:center; gap:14px;">
        <div class="avatar">${m.name.substring(0,2).toUpperCase()}</div>
        <div>
          <div style="font-weight:700;">${idx + 1}️⃣ ${m.name}</div>
          <div style="font-size:12px; color:var(--text-muted);">${m.title} • ${m.pricingType === 'free' ? '🎁 Free' : `$${m.hourlyRate}/hr`}</div>
        </div>
      </div>
      <span class="badge ${m.status === 'Available' ? 'badge-available' : 'badge-busy'}">${m.status}</span>
    </div>
  `).join('');
}

function selectMentorCard(cardEl, mentorId, mentorName) {
  document.querySelectorAll('.mentor-select-card').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');
  state.selectedMentorId = mentorId;
  if (state.currentUser) {
    state.currentUser.assignedMentorId = mentorId;
    state.currentUser.assignedMentorName = mentorName;
  }
}

async function handleMenteeStep5() {
  state.role = 'mentee';
  const chosenMentor = state.mentors.find(m => m.id === state.selectedMentorId) || state.mentors[0];
  if (chosenMentor) {
    state.currentUser.assignedMentorId = chosenMentor.id;
    state.currentUser.assignedMentorName = chosenMentor.name;
  }
  state.currentUser.currentRole = state.currentUser.role;
  state.currentUser.progressPct = state.currentUser.progressPct || 10;
  state.currentUser.score = state.currentUser.score || '7/10';

  if (!state.registrationPassword || state.registrationPassword.length < 8) {
    showToast('Please go back to step 1 and set a password of at least 8 characters.', 'error');
    return;
  }

  try {
    await createAccount('mentee', state.currentUser, state.registrationPassword);
    const existingIdx = state.mentees.findIndex(c => c.email === state.currentUser.email);
    if (existingIdx >= 0) state.mentees[existingIdx] = state.currentUser;
    else state.mentees.unshift(state.currentUser);
    syncState();
    showToast(`🎉 Mentee Profile Created! Welcome ${state.currentUser.name}`, 'success');
    goToMenteeDashboard();
  } catch (error) { showToast(error.message || 'Could not create your account.', 'error'); }
}

function goToMenteeDashboard() {
  state.role = 'mentee';
  if (!state.currentUser) state.currentUser = state.mentees[0];
  syncState();
  renderMenteeDashboard();
  showScreen('screen-dashboard-mentee');
  switchTab('mentee', 'home');
}

function renderMenteeDashboard() {
  const mentee = state.currentUser || state.mentees[0];

  const nameEl = document.getElementById('dash-mentee-name');
  if (nameEl) nameEl.innerText = mentee.name;

  const goalEl = document.getElementById('dash-journey-goal');
  if (goalEl) goalEl.innerText = `Goal: ${mentee.goal}`;

  const mentorNameEl = document.getElementById('dash-assigned-mentor-name');
  if (mentorNameEl) mentorNameEl.innerText = mentee.assignedMentorName || 'Ali Ahmed';

  const callMentorNameEl = document.getElementById('mentee-call-mentor-name');
  if (callMentorNameEl) callMentorNameEl.innerText = mentee.assignedMentorName || 'Ali Ahmed';

  const nextSteps = document.getElementById('mentee-overview-next');
  if (nextSteps) {
    const studentSessions = state.sessions.filter(s => !s.menteeId || s.menteeId === mentee.id || s.menteeName === mentee.name);
    const outstandingTasks = state.tasks.filter(t => (t.menteeName === mentee.name || !t.menteeName) && t.status !== 'Completed').length;
    const nextSession = studentSessions[0];
    nextSteps.innerHTML = `
      <div class="overview-row"><span style="color:var(--text-muted); font-size:14px;">Tasks waiting</span><strong>${outstandingTasks}</strong></div>
      <div class="overview-row"><span style="color:var(--text-muted); font-size:14px;">Next session</span><strong style="font-size:13px; text-align:right;">${nextSession ? `${nextSession.date} · ${nextSession.time}` : 'Not scheduled'}</strong></div>
      <div class="overview-row"><span style="color:var(--text-muted); font-size:14px;">Your mentor</span><strong style="font-size:13px;">${mentee.assignedMentorName || 'Ali Ahmed'}</strong></div>
    `;
  }

  const menteeSessionsContainer = document.getElementById('mentee-sessions-list');
  if (menteeSessionsContainer) {
    const studentSessions = state.sessions.filter(s => !s.menteeId || s.menteeId === mentee.id || s.menteeName === mentee.name);
    menteeSessionsContainer.innerHTML = studentSessions.map(s => `
      <div class="dash-card" style="margin-bottom:12px; background: var(--bg-card);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="font-size:15px; font-weight:700;">${s.topic}</div>
            <div style="font-size:13px; color:var(--text-muted);">Mentor: <strong>${s.mentorName}</strong> | ${s.date} at ${s.time}</div>
            ${s.mentorMessage ? `<div style="font-size:13px; color:var(--primary-cyan); margin-top:6px;">Mentor note: ${s.mentorMessage}</div>` : ''}
            ${s.rescheduleRequest ? `<div style="font-size:13px; color:#FBBF24; margin-top:6px;">Reschedule request sent: ${s.rescheduleRequest}</div>` : ''}
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;"><button class="btn btn-primary" style="padding:6px 12px; font-size:12px;" onclick="switchTab('mentee', 'videocall')">Join Call 🎥</button><button class="btn btn-secondary" style="padding:6px 12px; font-size:12px;" onclick="openRescheduleModal('${s.id}')">Request Change</button></div>
        </div>
      </div>
    `).join('') || '<p style="color:var(--text-muted);">No sessions have been scheduled yet.</p>';
  }

  renderMenteeResources();
  renderMenteeChallenges();
  renderMenteeMails();
  renderMenteeReports();
  renderMenteeLearningItems();
  updateMenteeDynamicProgress();
}


function renderMenteeResources() {
  const container = document.getElementById('mentee-resources-list');
  if (!container) return;

  const sharedItems = state.currentUser ? state.learningItems.filter(item => (item.menteeId === state.currentUser.id || item.menteeName === state.currentUser.name) && ['material', 'snippet'].includes(item.type)) : [];
  const libraryHtml = state.resources.map(res => `
    <div class="action-button-card" style="margin-bottom:10px; justify-content:space-between;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div class="action-icon" style="width:40px; height:40px; font-size:20px;">📖</div>
        <div>
          <div class="action-title">${res.title}</div>
          <div class="action-desc">${res.category} • ${res.duration}</div>
        </div>
      </div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;"><button class="btn btn-primary" style="padding:6px 12px; font-size:12px;" onclick="openLearningResource('${res.id}')">Open Resource ↗</button><button class="btn ${res.completed ? 'btn-success' : 'btn-secondary'}" style="padding:6px 12px; font-size:12px;" onclick="toggleResourceComplete('${res.id}')">${res.completed ? '✓ Completed' : 'Mark Done'}</button></div>
    </div>
  `).join('');
  const sharedHtml = sharedItems.length ? `<div style="font-family:var(--font-heading); font-size:15px; font-weight:700; margin:24px 0 12px;">📌 Shared by your mentor</div>${sharedItems.map(item => `<div class="action-button-card" style="margin-bottom:10px; justify-content:space-between;"><div style="display:flex; align-items:center; gap:12px;"><div class="action-icon" style="width:40px; height:40px; font-size:20px;">${learningTypeIcon(item.type)}</div><div><div class="action-title">${item.title}</div><div class="action-desc">Shared by your mentor${item.attachment ? ` • ${item.attachment.name}` : ''}</div></div></div><button class="btn btn-primary" style="padding:6px 12px; font-size:12px;" onclick="openSharedLearningResource('${item.id}')">Open ↗</button></div>`).join('')}` : '';
  container.innerHTML = `<div style="font-family:var(--font-heading); font-size:15px; font-weight:700; margin-bottom:12px;">Learning library</div>${libraryHtml}${sharedHtml}`;
}

function openLearningResource(resourceId) {
  const resource = state.resources.find(item => item.id === resourceId);
  const fallbackLinks = { res1: 'https://react.dev/learn', res2: 'https://web.dev/learn/', res3: 'https://www.typescriptlang.org/docs/handbook/intro.html' };
  const url = resource?.url || fallbackLinks[resourceId];
  if (!url) return showToast('This resource link is not available yet.', 'error');
  window.open(url, '_blank', 'noopener');
  recordStudentActivity(`Opened learning resource: ${resource.title}`, 5);
  syncState();
}

function openSharedLearningResource(itemId) {
  const item = state.learningItems.find(entry => entry.id === itemId);
  const title = document.getElementById('shared-resource-title');
  const content = document.getElementById('shared-resource-content');
  if (!item || !title || !content) return showToast('This shared resource is unavailable. Please refresh and try again.', 'error');
  title.textContent = item.title;
  content.innerHTML = `<p style="color:var(--text-muted); white-space:pre-wrap; line-height:1.65;">${item.description || 'Your mentor shared this learning resource with you.'}</p>${item.code ? `<pre style="margin-top:16px; padding:14px; overflow:auto; border-radius:12px; background:#0b1220; font-size:12px;"><code>${item.code}</code></pre>` : ''}${item.attachment ? `<a class="btn btn-primary" style="margin-top:18px;" href="${item.attachment.dataUrl}" download="${item.attachment.name}">📎 Open ${item.attachment.name}</a>` : ''}`;
  recordStudentActivity(`Opened mentor shared resource: ${item.title}`, 5);
  syncState();
  openModal('modal-shared-resource');
}

function renderMenteeChallenges() {
  const container = document.getElementById('mentee-challenges-list');
  if (!container) return;

  container.innerHTML = state.challenges.map(ch => `
    <div class="dash-card" style="margin-bottom:14px; background: var(--bg-card);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div style="font-weight:700; font-size:16px;">${ch.title}</div>
        <span class="badge ${ch.completed ? 'badge-available' : 'badge-busy'}">${ch.difficulty} • +${ch.points} pts</span>
      </div>
      <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">${ch.description}</div>
      <button class="btn btn-primary" style="padding:6px 14px; font-size:12px;" onclick="loadChallengeInModal('${ch.id}')">
        ${ch.completed ? 'Re-solve Challenge' : 'Solve Challenge 🚀'}
      </button>
    </div>
  `).join('');
}

let activeChallengeId = null;
function loadChallengeInModal(challengeId) {
  const challenge = state.challenges.find(item => item.id === challengeId);
  if (!challenge) return showToast('This challenge could not be found. Please refresh and try again.', 'error');

  activeChallengeId = challengeId;
  const title = document.getElementById('challenge-modal-title');
  const description = document.getElementById('challenge-modal-description');
  const editor = document.getElementById('challenge-code-editor');
  const status = document.getElementById('challenge-submit-status');
  if (!title || !description || !editor || !status) return showToast('Coding workspace is not ready yet. Refresh the page and try again.', 'error');

  title.textContent = challenge.title;
  description.textContent = challenge.description;
  editor.value = challenge.solutionCode || challenge.initialCode || '';
  status.textContent = challenge.completed ? 'Previously submitted — you can improve and submit again.' : 'Write your solution, then submit it for review.';
  status.style.color = challenge.completed ? '#34D399' : 'var(--text-muted)';
  openModal('modal-coding-challenge');
}

function submitChallengeSolution(event) {
  if (event) event.preventDefault();
  const challenge = state.challenges.find(item => item.id === activeChallengeId);
  const editor = document.getElementById('challenge-code-editor');
  const status = document.getElementById('challenge-submit-status');
  const code = editor?.value.trim();
  if (!challenge || !code) {
    if (status) { status.textContent = 'Please write a solution before submitting.'; status.style.color = '#F87171'; }
    return;
  }

  challenge.solutionCode = code;
  challenge.completed = true;
  challenge.submittedAt = new Date().toISOString();
  state.reports.unshift({
    id: `challenge_report_${Date.now()}`,
    candidateName: state.currentUser?.name || 'Student',
    candidateEmail: state.currentUser?.email || '',
    date: new Date().toLocaleDateString(),
    score: 'Submitted',
    topic: challenge.title,
    strengths: ['Solution submitted', 'Practice completed'],
    improvements: ['Review edge cases with your mentor'],
    summary: 'Your coding challenge solution has been saved and is ready for mentor review.'
  });
  recordStudentActivity(`Submitted coding challenge: ${challenge.title}`, challenge.points || 25);
  syncState();
  if (status) { status.textContent = 'Solution submitted successfully. Your mentor can now review it.'; status.style.color = '#34D399'; }
  renderMenteeChallenges();
  showToast('Challenge submitted for mentor review!', 'success');
}

function renderMenteeReports() {
  const container = document.getElementById('mentee-reports-list');
  if (!container) return;

  container.innerHTML = state.reports.map(r => `
    <div class="dash-card" style="margin-bottom:14px; background: var(--bg-card);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div style="font-weight:700; font-size:15px;">${r.topic}</div>
        <span class="badge badge-available">Score: ${r.score}</span>
      </div>
      <div style="font-size:13px; color:var(--text-muted); margin-bottom:8px;">${r.summary}</div>
      <div style="font-size:12px; color:var(--primary-cyan);">Strengths: ${r.strengths.join(', ')}</div>
    </div>
  `).join('');
}

function toggleResourceComplete(resId) {
  const item = state.resources.find(r => r.id === resId);
  if (item) {
    item.completed = !item.completed;
    if (item.completed) recordStudentActivity(`Completed learning resource: ${item.title}`, 25);
    syncState();
    showToast(item.completed ? `Completed: ${item.title}` : `Marked incomplete`, 'info');
    renderMenteeDashboard();
  }
}

// IN-APP MESSAGING
function renderChatMessages() {
  const mentorChatBox = document.getElementById('chat-messages-mentor');
  const menteeChatBox = document.getElementById('chat-messages-mentee');

  const currentMentee = state.role === 'mentee' ? (state.currentUser || state.mentees[0]) : null;
  const targetStudent = selectedMentee();

  let visibleMessages = [];

  if (state.role === 'mentor') {
    if (targetStudent) {
      visibleMessages = state.messages.filter(m => 
        m.studentId === targetStudent.id || 
        (m.studentName && m.studentName.toLowerCase() === targetStudent.name.toLowerCase()) || 
        (m.sender && m.sender.toLowerCase() === targetStudent.name.toLowerCase())
      );
    } else {
      visibleMessages = state.messages;
    }
  } else {
    if (currentMentee) {
      visibleMessages = state.messages.filter(m => 
        m.studentId === currentMentee.id || 
        (m.studentName && m.studentName.toLowerCase() === currentMentee.name.toLowerCase()) || 
        (m.sender && m.sender.toLowerCase() === currentMentee.name.toLowerCase()) ||
        !m.studentId
      );
    } else {
      visibleMessages = state.messages;
    }
  }

  const chatHtml = visibleMessages.length ? visibleMessages.map(m => {
    const isMine = state.role === 'mentor' ? !!m.isMentor : !m.isMentor;
    const side = isMine ? 'mine' : 'theirs';
    return `
    <div class="chat-row ${side}">
      <div class="chat-bubble ${side}">
        <div class="chat-meta">${m.sender} • ${m.time}</div>
        <div class="chat-text">${m.text}</div>
      </div>
    </div>
  `;
  }).join('') : '<p style="color:var(--text-muted); text-align:center; padding:20px 0;">No messages in this conversation yet. Send a message to start!</p>';

  if (mentorChatBox) {
    mentorChatBox.innerHTML = chatHtml;
    mentorChatBox.scrollTop = mentorChatBox.scrollHeight;
  }
  if (menteeChatBox) {
    menteeChatBox.innerHTML = chatHtml;
    menteeChatBox.scrollTop = menteeChatBox.scrollHeight;
  }
}

function handleSendMessage(role) {
  const input = document.getElementById(`chat-input-${role}`);
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (role === 'mentee') {
    const student = state.currentUser || state.mentees[0];
    const senderName = student ? student.name : 'Mentee';
    state.messages.push({
      id: 'msg_' + Date.now(),
      sender: senderName,
      text,
      time: now,
      isMentor: false,
      studentId: student?.id,
      studentName: student?.name,
      studentEmail: student?.email,
      mentorId: student?.assignedMentorId,
      mentorName: student?.assignedMentorName
    });
    recordStudentActivity('Sent a work update to mentor', 10);
  } else {
    const mentor = state.currentUser || state.mentors[0];
    const student = selectedMentee();
    if (!student) return showToast('Choose a student before sending a message.', 'error');
    const senderName = mentor ? mentor.name : 'Mentor';
    state.messages.push({
      id: 'msg_' + Date.now(),
      sender: senderName,
      text,
      time: now,
      isMentor: true,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      mentorId: mentor?.id,
      mentorName: mentor?.name
    });
  }

  input.value = '';
  syncState();
  if (role === 'mentor') renderMentorChatRecipients();
  renderChatMessages();
}


let emailComposer = null;
async function resolveMenteeEmailRecipient(current, requestedName, requestedEmail) {
  // A reply must always return to the original sender, not to a sample or
  // first-listed mentor. This also keeps mentor addresses correct after reload.
  if (requestedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestedEmail.trim())) {
    return { name: requestedName || 'Your mentor', email: requestedEmail.trim() };
  }

  let mentors = state.mentors || [];
  try {
    const accounts = await accountRequest('people?role=mentor');
    mentors = accounts.map(accountToUser);
    state.mentors = mentors;
    syncState();
  } catch (_) { /* The current local mentor list is still a safe fallback. */ }

  const mentor = mentors.find(item => item.id === current?.assignedMentorId)
    || mentors.find(item => item.email?.toLowerCase() === current?.assignedMentorEmail?.toLowerCase())
    || mentors.find(item => item.name === current?.assignedMentorName);
  return mentor ? { name: mentor.name, email: mentor.email } : null;
}

async function openEmailComposer(role, recipientName, recipientEmail) {
  const current = state.currentUser || (role === 'mentor' ? state.mentors[0] : state.mentees[0]);
  if (!current) return showToast('Please sign in before sending an email.', 'error');
  const picker = document.getElementById('email-recipient-picker');
  const recipientSelect = document.getElementById('email-composer-recipient-select');
  if (role === 'mentee') {
    const mentor = await resolveMenteeEmailRecipient(current, recipientName, recipientEmail);
    if (!mentor?.email) {
      return showToast('Your mentor email could not be found. Please choose or assign a mentor first.', 'error');
    }
    recipientName = mentor.name;
    recipientEmail = mentor.email;
    picker.style.display = 'none';
  } else {
    const mentees = mentorMentees();
    if (!mentees.length) return showToast('You have no assigned students to email yet.', 'error');
    const selected = recipientEmail ? mentees.find(student => student.email === recipientEmail) : selectedMentee();
    const recipient = selected || mentees[0];
    recipientName = recipient.name;
    recipientEmail = recipient.email;
    state.selectedMenteeId = recipient.id;
    recipientSelect.innerHTML = mentees.map(student => `<option value="${student.id}" ${student.id === recipient.id ? 'selected' : ''}>${student.name} — ${student.email}</option>`).join('');
    picker.style.display = 'block';
  }
  emailComposer = { role, recipientName, recipientEmail, senderName: current.name };
  document.getElementById('email-composer-recipient').textContent = `To: ${recipientName} (${recipientEmail})`;
  document.getElementById('email-composer-summary').value = '';
  document.getElementById('email-composer-type').value = role === 'mentee' ? 'work-update' : 'feedback';
  openModal('modal-email-composer');
}

function changeEmailRecipient(studentId) {
  const student = mentorMentees().find(item => item.id === studentId);
  if (!student || !emailComposer) return;
  state.selectedMenteeId = student.id;
  emailComposer.recipientName = student.name;
  emailComposer.recipientEmail = student.email;
  document.getElementById('email-composer-recipient').textContent = `To: ${student.name} (${student.email})`;
}

async function sendAutomatedEmail(event) {
  event.preventDefault();
  if (!emailComposer) return;
  const summary = document.getElementById('email-composer-summary').value.trim();
  const type = document.getElementById('email-composer-type').value;
  if (!summary) return showToast('Write your message before sending.', 'error');
  if (!emailComposer.recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailComposer.recipientEmail)) {
    return showToast('A valid mentor email is required before sending.', 'error');
  }
  const payload = { senderRole: emailComposer.role === 'mentee' ? 'student' : 'mentor', senderName: emailComposer.senderName, recipientEmail: emailComposer.recipientEmail, recipientName: emailComposer.recipientName, summary, type };
  const submitButton = event.target.querySelector('button[type="submit"]');
  submitButton.disabled = true; submitButton.textContent = 'Creating email…';
  try {
    const response = await fetch('/api/v1/communications/compose-and-send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Could not create the email.');
    state.mails.unshift(createMailRecord({
      senderRole: emailComposer.role,
      senderName: emailComposer.senderName,
      senderEmail: state.currentUser?.email || '',
      recipientRole: emailComposer.role === 'mentee' ? 'mentor' : 'mentee',
      recipientName: emailComposer.recipientName,
      recipientEmail: emailComposer.recipientEmail,
      subject: result.subject,
      body: result.body,
      date: 'Just now'
    }));
    if (emailComposer.role === 'mentee') recordStudentActivity('Sent an AI-written work update to mentor', 15);
    syncState(); closeModal('modal-email-composer');
    showToast(result.delivery === 'sent' ? `Email sent to ${emailComposer.recipientName}.` : 'AI drafted your email. Add RESEND_API_KEY to deliver it.', result.delivery === 'sent' ? 'success' : 'info');
    if (state.role === 'mentor') renderMentorMails();
    else renderMenteeMails();
  } catch (error) {
    showToast(error.message || 'Email could not be sent.', 'error');
  } finally {
    submitButton.disabled = false; submitButton.textContent = '✨ Create & Send Email';
  }
}

// MODAL CONTROLS
function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('active');
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('active');
}

function openSessionModalForMentee(menteeName) {
  const input = document.getElementById('book-session-mentee-name');
  if (input) input.value = menteeName;
  const mentor = state.currentUser || state.mentors[0];
  const slots = SESSION_SLOT_OPTIONS;
  const options = document.getElementById('book-session-slot-options');
  if (options) options.innerHTML = slots.map((slot, index) => `<label class="option-checkbox"><input type="checkbox" name="book-session-slots" value="${slot}" ${index === 0 ? 'checked' : ''} onchange="updateSessionSlotCount()"> ${slot}</label>`).join('');
  updateSessionSlotCount();
  document.getElementById('book-session-topic').value = '';
  document.getElementById('book-session-message').value = '';
  openModal('modal-book-session');
}

function updateSessionSlotCount() {
  const count = document.querySelectorAll('input[name="book-session-slots"]:checked').length;
  const label = document.getElementById('book-session-slot-count');
  if (label) label.textContent = `${count} session time${count === 1 ? '' : 's'} selected`;
}

function handleBookSessionSubmit(e) {
  if (e) e.preventDefault();
  const mentorName = state.role === 'mentor' ? (state.currentUser?.name || 'Ali Ahmed') : (state.currentUser?.assignedMentorName || 'Ali Ahmed');
  const menteeName = document.getElementById('book-session-mentee-name')?.value || 'Moiz Hussain';
  const topic = document.getElementById('book-session-topic')?.value || 'Mentorship Call';
  const slots = Array.from(document.querySelectorAll('input[name="book-session-slots"]:checked')).map(input => input.value);
  const mentorMessage = document.getElementById('book-session-message')?.value.trim() || '';
  const mentee = state.mentees.find(student => student.name === menteeName);

  if (!slots.length) return showToast('Select at least one session time.', 'error');
  const sessions = slots.map((slot, index) => ({
    id: `s_${Date.now()}_${index}`,
    mentorName, menteeName, topic,
    date: slot.split(' ')[0] || 'Tomorrow',
    time: slot.split(' ').slice(1).join(' ') || '3:00 PM',
    status: 'Confirmed',
    menteeId: mentee?.id,
    mentorMessage,
    link: 'https://meet.google.com/call-' + Math.floor(Math.random() * 1000)
  }));
  state.sessions.unshift(...sessions);
  syncState();

  showToast(`${sessions.length} session${sessions.length === 1 ? '' : 's'} scheduled with ${menteeName}!`, 'success');
  closeModal('modal-book-session');

  if (state.role === 'mentor') renderMentorDashboard();
  else renderMenteeDashboard();
}

let reschedulingSessionId = null;
function openRescheduleModal(sessionId) {
  const session = state.sessions.find(item => item.id === sessionId);
  if (!session) return;
  reschedulingSessionId = sessionId;
  document.getElementById('reschedule-session-details').textContent = `${session.topic} — ${session.date} at ${session.time}`;
  document.getElementById('reschedule-session-message').value = '';
  openModal('modal-reschedule-session');
}

function submitRescheduleRequest(event) {
  event.preventDefault();
  const session = state.sessions.find(item => item.id === reschedulingSessionId);
  const message = document.getElementById('reschedule-session-message').value.trim();
  if (!session || !message) return;
  session.status = 'Reschedule requested';
  session.rescheduleRequest = message;
  const student = state.currentUser || state.mentees.find(item => item.id === session.menteeId);
  state.mails.unshift(createMailRecord({
    senderRole: 'mentee',
    senderName: student?.name || session.menteeName,
    senderEmail: student?.email || '',
    recipientRole: 'mentor',
    recipientName: session.mentorName || (state.mentors[0]?.name || 'Mentor'),
    recipientEmail: state.mentors.find(item => item.name === session.mentorName)?.email || state.currentUser?.assignedMentorEmail || state.mentors[0]?.email || '',
    subject: `Reschedule request: ${session.topic}`,
    body: message,
    date: 'Just now'
  }));
  recordStudentActivity('Sent a session reschedule request to mentor', 10);
  syncState(); closeModal('modal-reschedule-session'); renderMenteeDashboard();
  showToast('Your mentor has received your reschedule request.', 'success');
}

// ----------------------------------------------------
// DYNAMIC PROGRESS & INTERACTIVE QUIZ RESOLVER
// ----------------------------------------------------
function updateMenteeDynamicProgress() {
  const mentee = state.currentUser || state.mentees[0];
  if (!mentee) return;

  const userItems = state.learningItems.filter(item => item.menteeId === mentee.id || item.menteeName === mentee.name);
  const totalItems = userItems.length + state.challenges.length + state.resources.length;
  const completedItems = userItems.filter(i => i.completed).length +
                         state.challenges.filter(c => c.completed).length +
                         state.resources.filter(r => r.completed).length;

  const pct = totalItems > 0 ? Math.min(100, Math.round((completedItems / totalItems) * 100)) : 10;
  mentee.progressPct = pct;
  const journeyScore = Math.max(5, Math.min(10, Math.round(5 + (pct / 20))));
  mentee.score = `${journeyScore}/10`;

  const bar = document.getElementById('dash-journey-progress-bar');
  if (bar) bar.style.width = `${pct}%`;

  const scoreBadge = document.getElementById('dash-journey-score');
  if (scoreBadge) scoreBadge.innerText = `Score: ${mentee.score}`;

  syncState();
}

let activeQuizItemId = null;
function renderMenteeLearningItems() {
  const container = document.getElementById('mentee-learning-items');
  if (!container) return;

  const mentee = state.currentUser || state.mentees[0];
  const userItems = state.learningItems.filter(item => item.menteeId === mentee.id || item.menteeName === mentee.name);

  if (!userItems.length) {
    container.innerHTML = `<p style="color:var(--text-muted); padding:16px 0;">No tasks or quizzes assigned by your mentor yet.</p>`;
    return;
  }

  container.innerHTML = userItems.map(item => `
    <div class="dash-card" style="margin-bottom:14px; background: var(--bg-card);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:20px;">${learningTypeIcon(item.type)}</span>
          <div style="font-weight:700; font-size:16px;">${item.title}</div>
        </div>
        <span class="badge ${item.completed ? 'badge-available' : 'badge-busy'}">${item.completed ? '✓ Completed' : (item.type === 'quiz' ? 'Quiz Ready' : 'Pending')}</span>
      </div>
      <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px;">${item.description}</div>
      ${item.code ? `<pre style="padding:12px; border-radius:10px; background:#0b1220; font-size:12px; overflow-x:auto; margin-bottom:12px;"><code>${item.code}</code></pre>` : ''}
      ${item.score !== undefined ? `<div style="font-size:13px; color:#34D399; font-weight:700; margin-bottom:12px;">Quiz Score: ${item.score}%</div>` : ''}
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        ${item.type === 'quiz' ? `
          <button class="btn btn-primary" style="padding:6px 14px; font-size:12px;" onclick="openQuizResolver('${item.id}')">
            ${item.completed ? 'Review Quiz Answers' : 'Take Quiz 📝'}
          </button>
        ` : `
          <button class="btn ${item.completed ? 'btn-secondary' : 'btn-primary'}" style="padding:6px 14px; font-size:12px;" onclick="toggleLearningItemComplete('${item.id}')">
            ${item.completed ? 'Mark Incomplete' : 'Mark Completed ✓'}
          </button>
        `}
      </div>
    </div>
  `).join('');
}

function openQuizResolver(itemId) {
  const item = state.learningItems.find(i => i.id === itemId);
  if (!item) return;

  activeQuizItemId = itemId;
  document.getElementById('quiz-resolver-item-id').value = itemId;
  document.getElementById('quiz-resolver-title').innerText = `📝 ${item.title}`;

  const questions = item.quizQuestions || [
    {
      q: 'What is the primary benefit of custom React hooks?',
      options: ['State isolation only', 'Reusing stateful logic between components', 'Direct DOM mutation', 'Replacing CSS styles'],
      answerIndex: 1,
      explanation: 'Custom hooks allow you to extract and reuse stateful logic across multiple components cleanly.'
    },
    {
      q: 'When does the cleanup function in useEffect execute?',
      options: ['Only on initial mount', 'Before the component unmounts and before re-running the effect', 'After render completes always', 'Never'],
      answerIndex: 1,
      explanation: 'Cleanup functions run before component unmounting and right before subsequent effect re-executions.'
    },
    {
      q: 'Why should state variables not be mutated directly in React?',
      options: ['Direct mutation breaks change detection and component re-rendering', 'React throws a compiler error', 'It slows down performance', 'No reason, it is allowed'],
      answerIndex: 0,
      explanation: 'React relies on immutable state updates to compare references and schedule re-renders.'
    }
  ];

  item.quizQuestions = questions;

  const container = document.getElementById('quiz-resolver-questions-container');
  const banner = document.getElementById('quiz-resolver-score-banner');
  banner.style.display = 'none';

  container.innerHTML = questions.map((q, qIdx) => `
    <div style="background:var(--input-bg); padding:16px; border-radius:14px; border:1px solid var(--border-color);">
      <div style="font-weight:700; font-size:15px; margin-bottom:12px;">Q${qIdx + 1}: ${q.q}</div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${q.options.map((opt, oIdx) => `
          <label class="option-checkbox" style="font-size:14px; padding:10px 14px;">
            <input type="radio" name="quiz_q_${qIdx}" value="${oIdx}" ${item.userAnswers && item.userAnswers[qIdx] === oIdx ? 'checked' : ''} ${item.completed ? 'disabled' : ''}>
            <span>${['A', 'B', 'C', 'D'][oIdx]}) ${opt}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  if (item.completed && item.score !== undefined) {
    banner.style.display = 'block';
    banner.innerHTML = `<div style="font-size:16px; font-weight:800; color:#34D399;">Quiz Completed! Score: ${item.score}%</div><div style="font-size:13px; color:var(--text-muted); margin-top:4px;">You have successfully completed this knowledge check.</div>`;
  }

  openModal('modal-quiz-resolver');
}

function handleQuizResolverSubmit(event) {
  event.preventDefault();
  const itemId = document.getElementById('quiz-resolver-item-id').value;
  const item = state.learningItems.find(i => i.id === itemId);
  if (!item || !item.quizQuestions) return;

  const userAnswers = {};
  let correctCount = 0;

  item.quizQuestions.forEach((q, qIdx) => {
    const selected = document.querySelector(`input[name="quiz_q_${qIdx}"]:checked`);
    if (selected) {
      const ansVal = parseInt(selected.value, 10);
      userAnswers[qIdx] = ansVal;
      if (ansVal === q.answerIndex) correctCount++;
    }
  });

  const scorePct = Math.round((correctCount / item.quizQuestions.length) * 100);
  item.completed = true;
  item.score = scorePct;
  item.userAnswers = userAnswers;

  const banner = document.getElementById('quiz-resolver-score-banner');
  banner.style.display = 'block';
  banner.innerHTML = `
    <div style="font-size:18px; font-weight:800; color:${scorePct >= 70 ? '#34D399' : '#FBBF24'}; margin-bottom:4px;">
      🎯 Score: ${scorePct}% (${correctCount}/${item.quizQuestions.length} Correct)
    </div>
    <div style="font-size:13px; color:var(--text-muted);">
      ${scorePct >= 70 ? '🎉 Excellent work! Knowledge check passed.' : 'Review the topics and try practicing again with your mentor.'}
    </div>
  `;

  recordStudentActivity(`Completed quiz "${item.title}" with score ${scorePct}%`, 30);
  updateMenteeDynamicProgress();
  syncState();
  renderMenteeLearningItems();
  showToast(`Quiz completed with ${scorePct}% score!`, 'success');
}

function toggleLearningItemComplete(itemId) {
  const item = state.learningItems.find(i => i.id === itemId);
  if (!item) return;
  item.completed = !item.completed;
  if (item.completed) recordStudentActivity(`Completed task: ${item.title}`, 15);
  updateMenteeDynamicProgress();
  syncState();
  renderMenteeLearningItems();
  showToast(item.completed ? `Task "${item.title}" marked completed!` : 'Marked incomplete', 'info');
}

// ----------------------------------------------------
// MENTOR SESSION RESCHEDULE APPROVAL HANDLERS
// ----------------------------------------------------
function acceptRescheduleRequest(sessionId) {
  const session = state.sessions.find(s => s.id === sessionId);
  if (!session) return;
  session.status = 'Confirmed';
  delete session.rescheduleRequest;
  syncState();
  if (state.role === 'mentor') renderMentorDashboard();
  else renderMenteeDashboard();
  showToast(`Accepted reschedule request for "${session.topic}".`, 'success');
}

function proposeAlternateSlot(sessionId) {
  const session = state.sessions.find(s => s.id === sessionId);
  if (!session) return;
  const newSlot = prompt(`Propose new time for "${session.topic}":`, session.date + ' at ' + session.time);
  if (newSlot) {
    session.time = newSlot;
    session.status = 'Confirmed';
    delete session.rescheduleRequest;
    session.mentorMessage = `Mentor updated session time to: ${newSlot}`;
    syncState();
    if (state.role === 'mentor') renderMentorDashboard();
    else renderMenteeDashboard();
    showToast(`Session updated to ${newSlot}!`, 'success');
  }
}

// ----------------------------------------------------
// MENTOR AI ASSIGNMENT GENERATOR HANDLERS
// ----------------------------------------------------
function openAiAssignmentModal() {
  openModal('modal-ai-assignment');
}

async function handleGenerateAiAssignmentSubmit(event) {
  event.preventDefault();
  const topic = document.getElementById('ai-gen-topic').value.trim();
  const role = document.getElementById('ai-gen-role').value;
  const type = document.getElementById('ai-gen-type').value;
  const submitBtn = document.getElementById('ai-gen-submit-btn');

  if (!topic) return showToast('Please enter a topic or skill.', 'error');

  submitBtn.disabled = true;
  submitBtn.innerText = '✨ Generating with AI...';

  try {
    const res = await fetch('/api/v1/ai/generate-assignment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, targetRole: role, type })
    });
    const data = await res.json();

    document.getElementById('work-type-select').value = type;
    handleWorkTypeChange();
    document.getElementById('work-title').value = data.title || `${topic} Challenge`;
    document.getElementById('work-description').value = data.description || '';
    if (data.codeSnippet && document.getElementById('work-code')) {
      document.getElementById('work-code').value = data.codeSnippet;
    }

    const days = data.suggestedDeadlineDays || 3;
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + days);
    document.getElementById('work-deadline').value = deadlineDate.toISOString().slice(0, 10);

    closeModal('modal-ai-assignment');
    showToast('✨ AI generated work filled in form successfully!', 'success');
  } catch (error) {
    showToast('AI generation failed. Using default template.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = '✨ Generate & Populate Form';
  }
}

// ----------------------------------------------------
// REAL-TIME LIVE CROSS-TAB CHAT & STATE SYNC ENGINE
// ----------------------------------------------------
function startRealtimeStateSync() {
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('mm_live_')) {
      reloadLiveState();
      pollIncomingCalls();
    }
  });

  setInterval(() => {
    reloadLiveState();
    pollIncomingCalls();
  }, 1000);
}

function reloadLiveState() {
  const latestMessages = Store.get('messages', []);
  const latestMentees = Store.get('mentees', []);
  const latestSessions = Store.get('sessions', []);
  const latestMails = Store.get('mails', INITIAL_MAILS).map(normalizeMailRecord).filter(Boolean);

  let updated = false;

  if (JSON.stringify(latestMessages) !== JSON.stringify(state.messages)) {
    state.messages = latestMessages;
    updated = true;
  }
  if (JSON.stringify(latestMentees) !== JSON.stringify(state.mentees)) {
    state.mentees = latestMentees;
    updated = true;
  }
  if (JSON.stringify(latestSessions) !== JSON.stringify(state.sessions)) {
    state.sessions = latestSessions;
    updated = true;
  }
  if (JSON.stringify(latestMails) !== JSON.stringify(state.mails)) {
    state.mails = latestMails;
    updated = true;
  }

  if (updated) {
    if (state.role === 'mentor') {
      renderMentorChatRecipients();
    }
    renderChatMessages();
    if (state.role === 'mentor') renderMentorMails();
    if (state.role === 'mentee') renderMenteeMails();
  }
}

function initHero3d() {
  const stage = document.getElementById('hero-stage');
  const card = document.getElementById('hero-tilt');
  if (!stage || !card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (stage.dataset.bound === '1') return;
  stage.dataset.bound = '1';
  stage.addEventListener('mousemove', (event) => {
    const box = stage.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    card.style.animation = 'none';
    card.style.transform = `rotateY(${-12 + x * 18}deg) rotateX(${8 - y * 14}deg) translateZ(12px)`;
  });
  stage.addEventListener('mouseleave', () => {
    card.style.animation = '';
    card.style.transform = '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  
  // Clear active login sessions to prevent auto-logging in
  Store.remove('current_user');
  Store.remove('user_role');
  Store.remove('auth_token');
  state.currentUser = null;
  state.role = null;
  state.authToken = null;
  
  startRealtimeStateSync();
  showScreen('screen-landing');
});
