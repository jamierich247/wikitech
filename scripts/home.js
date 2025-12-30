let allPosts = [];
let sortMode = 'newest';

async function loadPosts() {
  try {
    const postsList = document.getElementById('postsList');
    postsList.innerHTML = '<div class="loading">Loading posts...</div>';

    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        views,
        created_at,
        author_id,
        profiles:author_id(username)
      `)
      .eq('published', true);

    if (sortMode === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortMode === 'popular') {
      query = query.order('views', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    allPosts = data || [];

    if (allPosts.length === 0) {
      postsList.innerHTML = '<div class="loading">No posts yet. Be the first to write!</div>';
      return;
    }

    postsList.innerHTML = allPosts.map(post => `
      <div class="post-card" onclick="goToPost('${post.slug}')">
        <div class="post-header">
          <h3>${escapeHtml(post.title)}</h3>
          <div class="post-meta">
            <span>${post.profiles?.username || 'Anonymous'}</span>
            <span>${formatDate(post.created_at)}</span>
          </div>
        </div>
        <div class="post-body">
          ${escapeHtml(post.excerpt || post.content.substring(0, 150))}...
        </div>
        <div class="post-footer">
          <span class="post-views"><i class="fas fa-eye"></i> ${post.views || 0} views</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Load posts error:', err);
    document.getElementById('postsList').innerHTML = '<div class="loading">Error loading posts</div>';
  }
}

function goToPost(slug) {
  window.location.href = `/post.html?slug=${slug}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadPosts();

  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sortMode = btn.dataset.sort;
      loadPosts();
    });
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.toLowerCase();

      searchTimeout = setTimeout(() => {
        if (query.length === 0) {
          loadPosts();
          return;
        }

        const filtered = allPosts.filter(post =>
          post.title.toLowerCase().includes(query) ||
          (post.excerpt || '').toLowerCase().includes(query) ||
          (post.profiles?.username || '').toLowerCase().includes(query)
        );

        const postsList = document.getElementById('postsList');
        if (filtered.length === 0) {
          postsList.innerHTML = '<div class="loading">No posts found</div>';
          return;
        }

        postsList.innerHTML = filtered.map(post => `
          <div class="post-card" onclick="goToPost('${post.slug}')">
            <div class="post-header">
              <h3>${escapeHtml(post.title)}</h3>
              <div class="post-meta">
                <span>${post.profiles?.username || 'Anonymous'}</span>
                <span>${formatDate(post.created_at)}</span>
              </div>
            </div>
            <div class="post-body">
              ${escapeHtml(post.excerpt || post.content.substring(0, 150))}...
            </div>
            <div class="post-footer">
              <span class="post-views"><i class="fas fa-eye"></i> ${post.views || 0} views</span>
            </div>
          </div>
        `).join('');
      }, 300);
    });
  }
});
