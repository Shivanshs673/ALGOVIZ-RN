# Code Logic Index — AlgoViz+ React Native

Implementation guidance lives in the markdown files below. The Expo Router app under `app/` + `src/` is the live codebase.

---

## Actual docs on disk (consolidated)

```
docs/code/
├── 01_types/
│   ├── algorithm.types.md
│   └── other.types.md
├── 02_algorithms/
│   ├── registry.md
│   ├── sorting_engine.md
│   └── other_engines.md          ← graph, tree, DP, greedy, backtracking, string
├── 03_visualization/
│   ├── visualization_store.md
│   └── visualization_ui.md
├── 04_study_rooms/
│   └── study_rooms.md
├── 05_learn_concepts/
│   └── learn_concepts.md
├── 06_profile/
│   └── profile_progress.md
├── 07_auth/
│   └── auth.md
└── 08_home_navigation/
    └── home_navigation.md
```

Also see:

- `docs/08_SUPABASE_SETUP.md` — schema, RLS, storage, OAuth
- `docs/07_API_BACKEND_AUTH_STORAGE.md` — backend contracts
- `docs/01_PRD.md` … `docs/06_SYSTEM_DESIGN.md` — product & architecture

---

## Live app map

| Feature | Primary paths |
|---------|---------------|
| Auth | `app/(auth)/*`, `src/features/auth/*`, `src/lib/supabase/client.ts` |
| Tabs | `app/(tabs)/*` |
| Visualization | `app/algorithm/[id].tsx`, `src/features/visualization/**` |
| Study rooms | `app/(tabs)/study-rooms.tsx`, `app/study-room/[id].tsx`, `src/features/study-rooms/**` |
| Learn | `app/(tabs)/learn.tsx`, `app/concept/[id].tsx`, `src/features/learn/**` |
| Profile / Progress | `app/(tabs)/profile.tsx`, `app/(tabs)/progress.tsx`, `src/features/progress/**` |

---

## How to Use

1. Configure `.env` from `.env.example` (Supabase URL + anon key)
2. Run the SQL in `docs/08_SUPABASE_SETUP.md` in the Supabase SQL Editor
3. `npx expo start`

## Dependencies

See root `package.json`. Core stack: Expo Router 57, Supabase JS, Zustand, TanStack Query, react-native-svg, Reanimated.
