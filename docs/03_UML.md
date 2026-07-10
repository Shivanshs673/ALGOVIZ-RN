# UML Diagrams

**Product:** AlgoViz+  
**Notation:** Mermaid (render in GitHub, Notion, or Mermaid Live Editor)  
**Last updated:** 2026-07-04

---

## 1. Use case diagram

```mermaid
flowchart LR
    Student((Student))
    Maintainer((Maintainer))

    subgraph Auth
        UC1[Register / Login]
        UC2[Google Sign-In]
        UC3[Reset Password]
        UC4[Logout]
    end

    subgraph Profile
        UC5[Edit Profile]
        UC6[Upload Avatar]
    end

    subgraph Learning
        UC7[Browse Algorithms]
        UC8[Play Visualization]
        UC9[Use Learn Screen]
    end

    subgraph StudyRooms
        UC10[Create Room]
        UC11[Join / Leave Room]
        UC12[Send Messages]
        UC13[View Members / Presence]
    end

    subgraph Updates
        UC14[Receive App Update]
        UC15[Publish Release]
    end

    Student --> UC1 & UC2 & UC3 & UC4
    Student --> UC5 & UC6
    Student --> UC7 & UC8 & UC9
    Student --> UC10 & UC11 & UC12 & UC13
    Student --> UC14
    Maintainer --> UC15
```

---

## 2. Package / component diagram

```mermaid
flowchart TB
    subgraph Presentation
        App[app module<br/>Screens + ViewModels]
        AuthFeat[features:auth<br/>Auth UI + VM]
    end

    subgraph DomainLayer[Domain]
        Domain[domain<br/>UseCases + Models + Repo interfaces]
    end

    subgraph DataLayer[Data]
        Data[data<br/>Repos + AlgorithmProvider]
        AuthData[features:auth data<br/>SupabaseAuthDataSource]
    end

    subgraph Core
        Network[core:network<br/>SupabaseClient]
        DS[core:datastore]
        Common[core:common]
        UI[core:ui / designsystem]
        DB[core:database]
    end

    subgraph External
        SB[(Supabase)]
        GH[GitHub Releases]
        GGL[Google Sign-In]
    end

    App --> AuthFeat
    App --> Domain
    App --> Data
    App --> Network
    App --> DS
    App --> UI
    AuthFeat --> Domain
    AuthFeat --> Network
    AuthFeat --> GGL
    Data --> Domain
    Data --> Network
    AuthData --> Network
    Network --> SB
    App --> GH
```

---

## 3. Class diagram — auth & profile (simplified)

```mermaid
classDiagram
    class AuthViewModel {
        +authState: StateFlow~AuthUiState~
        +login(email, password)
        +register(email, password)
        +signInWithGoogle(idToken)
        +logout()
    }

    class AuthRepository {
        <<interface>>
        +login()
        +register()
        +signInWithGoogle()
        +logout()
        +observeAuthState()
    }

    class AuthRepositoryImpl
    class SupabaseAuthDataSource {
        +signInWithEmail()
        +signUpWithEmail()
        +signInWithGoogleIdToken()
        +resetPasswordForEmail()
    }

    class User {
        +id: String
        +email: String
        +isEmailVerified: Boolean
    }

    class ProfileViewModel {
        +userProfile: StateFlow~UserProfile~
        +saveProfileChanges()
        +uploadAvatarFromGallery()
    }

    class ProfileRemoteDataSource {
        +getUserProfile()
        +saveUserProfile()
        +uploadProfileImage()
    }

    class UserProfile {
        +name
        +username
        +email
        +phoneNumber
        +avatarUrl
        +avatarColorIndex
    }

    class PreferencesManager {
        +profileName
        +userId
        +saveProfileName()
    }

    AuthViewModel --> AuthRepository
    AuthRepositoryImpl ..|> AuthRepository
    AuthRepositoryImpl --> SupabaseAuthDataSource
    AuthRepositoryImpl --> User
    ProfileViewModel --> ProfileRemoteDataSource
    ProfileViewModel --> PreferencesManager
    ProfileRemoteDataSource --> UserProfile
```

---

## 4. Class diagram — study rooms (simplified)

```mermaid
classDiagram
    class StudyRoomRepository {
        <<interface>>
        +observeRooms()
        +createRoom()
        +joinRoom()
        +leaveRoom()
        +sendMessage()
        +observeMessages()
        +updatePresence()
    }

    class StudyRoomRepositoryImpl
    class SupabaseStudyRoomDataSource {
        +roomsTable
        +membersTable
        +messagesTable
        +presenceTable
        +userProfilesTable
    }

    class StudyRoom {
        +id
        +name
        +category
        +createdBy
        +memberCount
        +isPrivate
        +isActive
    }

    class Message {
        +id
        +roomId
        +userId
        +content
        +type
        +timestamp
    }

    class RoomMember {
        +roomId
        +userId
        +userName
        +isOnline
        +unreadCount
    }

    class UserPresence {
        +userId
        +isOnline
        +lastSeenAt
    }

    StudyRoomRepositoryImpl ..|> StudyRoomRepository
    StudyRoomRepositoryImpl --> SupabaseStudyRoomDataSource
    StudyRoomRepositoryImpl --> StudyRoom
    StudyRoomRepositoryImpl --> Message
    StudyRoomRepositoryImpl --> RoomMember
    StudyRoomRepositoryImpl --> UserPresence
```

---

## 5. Sequence — Google Sign-In

```mermaid
sequenceDiagram
    actor User
    participant LoginScreen
    participant GoogleSignInHelper
    participant Google as Google Play Services
    participant AuthVM as AuthViewModel
    participant AuthRepo as AuthRepository
    participant SB as Supabase Auth

    User->>LoginScreen: Tap Google Sign-In
    LoginScreen->>GoogleSignInHelper: launchSignIn()
    GoogleSignInHelper->>Google: signInIntent
    Google-->>GoogleSignInHelper: Account + idToken
    GoogleSignInHelper-->>LoginScreen: Success(idToken)
    LoginScreen->>AuthVM: signInWithGoogle(idToken)
    AuthVM->>AuthRepo: signInWithGoogle(idToken)
    AuthRepo->>SB: signInWith(IDToken, Google)
    SB-->>AuthRepo: Session + User
    AuthRepo-->>AuthVM: Authenticated
    AuthVM->>AuthVM: Save userId/email to DataStore
    AuthVM-->>LoginScreen: AuthUiState.Authenticated
    LoginScreen->>LoginScreen: Navigate to main / profile edit
```

---

## 6. Sequence — send chat message

```mermaid
sequenceDiagram
    actor User
    participant ChatUI as ChatRoomScreen
    participant VM as ChatRoomViewModel
    participant UC as SendMessageUseCase
    participant Repo as StudyRoomRepository
    participant DS as SupabaseStudyRoomDataSource
    participant PG as PostgREST
    participant RT as Realtime

    User->>ChatUI: Send message
    ChatUI->>VM: sendMessage(content)
    VM->>UC: invoke(message)
    UC->>Repo: sendMessage(message)
    Repo->>DS: insert study_room_messages
    DS->>PG: INSERT
    PG-->>DS: OK
    PG->>RT: postgres_changes INSERT
    RT-->>DS: Flow emit
    DS-->>VM: New message in Flow
    VM-->>ChatUI: Update message list
```

---

## 7. Sequence — app update check

```mermaid
sequenceDiagram
    participant App as AppUpdateViewModel
    participant GH as GitHub API
    participant SB as Supabase app_config
    participant DM as DownloadManager
    participant OS as Android Package Installer

    App->>GH: GET releases/latest
    alt metadata asset present
        GH-->>App: algoviz-update.json
    else fallback
        App->>SB: select app_config id=latest_version
        SB-->>App: UpdateInfo
    end
    alt versionCode > BuildConfig.VERSION_CODE
        App-->>App: UpdateAvailable
        App->>DM: enqueue APK download
        DM-->>App: ACTION_DOWNLOAD_COMPLETE
        App->>OS: install intent (FileProvider URI)
    else
        App-->>App: UpToDate
    end
```

---

## 8. Activity — app startup

```mermaid
flowchart TD
    A[App launch] --> B[Show splash frames]
    B --> C{Auth session resolved?}
    C -->|No| C
    C -->|Yes| D{Authenticated?}
    D -->|No| E[Auth graph: Login]
    D -->|Yes| F{Profile complete?}
    F -->|No| G[profile/edit onboarding]
    F -->|Yes| H[main Home]
    G --> H
    H --> I[Start presence heartbeat]
    H --> J[Check for app update]
```

---

## 9. State machine — auth UI

```mermaid
stateDiagram-v2
    [*] --> Loading: App start
    Loading --> Unauthenticated: No session
    Loading --> Authenticated: Session restored
    Unauthenticated --> Loading: Login / Register / Google
    Loading --> Authenticated: Success
    Loading --> Unauthenticated: Failure
    Authenticated --> Unauthenticated: Logout
    Authenticated --> Loading: Transient refresh
```

---

## 10. Deployment diagram

```mermaid
flowchart TB
    subgraph Device[Android Device]
        APK[AlgoViz+ APK]
    end

    subgraph Cloud[Cloud Services]
        SB[Supabase<br/>Auth / DB / Realtime / Storage]
        GH[GitHub Releases]
        GC[Google Cloud OAuth]
    end

    subgraph CI[GitHub Actions]
        Build[CI: assembleDebug + tests]
        Rel[Release: signed APK + metadata]
    end

    Dev[Developer push] --> Build
    Dev --> Rel
    Rel --> GH
    Rel --> SB
    APK --> SB
    APK --> GH
    APK --> GC
```
