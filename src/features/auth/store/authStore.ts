import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase/client';

interface AuthStore {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  initialized: false,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      initialized: true,
    }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, initialized: true });
  },
}));
