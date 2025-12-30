let currentUser = null;

async function checkAuthStatus() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;
    updateAuthUI();
  } catch (err) {
    console.error('Auth check error:', err);
  }
}

function updateAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const createBtn = document.getElementById('createBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (currentUser) {
    loginBtn.style.display = 'none';
    createBtn.style.display = 'flex';
    logoutBtn.style.display = 'flex';
  } else {
    loginBtn.style.display = 'flex';
    createBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
}

async function logout() {
  try {
    await supabase.auth.signOut();
    currentUser = null;
    updateAuthUI();
    window.location.href = '/';
  } catch (err) {
    console.error('Logout error:', err);
    alert('Error logging out');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    updateAuthUI();
  });
});
