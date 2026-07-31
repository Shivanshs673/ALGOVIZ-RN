import { supabase } from '../../../lib/supabase/client';

/** Deletes user-owned app data and signs out. Requires delete_account RPC in Supabase for full auth deletion. */
export async function deleteUserAccount(userId: string): Promise<void> {
  await supabase.from('study_room_messages').delete().eq('user_id', userId);
  await supabase.from('study_room_members').delete().eq('user_id', userId);
  await supabase.from('user_progress').delete().eq('user_id', userId);
  await supabase.from('user_presence').delete().eq('user_id', userId);
  await supabase.from('user_profiles').delete().eq('user_id', userId);

  const { error: rpcError } = await supabase.rpc('delete_account');
  await supabase.auth.signOut();
  if (rpcError) {
    throw new Error(
      'Your app data was removed. Deploy scripts/delete_account.sql in Supabase to enable full account deletion.',
    );
  }
}
