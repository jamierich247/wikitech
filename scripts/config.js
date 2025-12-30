const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function ensureUserProfile(userId, email) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!data) {
      const username = email.split('@')[0];
      await supabase
        .from('profiles')
        .insert([{
          id: userId,
          username: username,
          bio: '',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        }]);
    }
  } catch (err) {
    console.error('Profile creation error:', err);
  }
}
