// アプリの入口。ログイン状態に応じて表示する画面を切り替える
//   Firebase 未設定 → SetupScreen
//   確認中 → LoadingScreen / 未ログイン → LoginScreen
//   プロフィール未作成 → OnboardingScreen / それ以外 → AtelierApp（本体）
import AtelierApp from './AtelierApp';
import LoadErrorScreen from './screens/LoadErrorScreen';
import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SetupScreen from './screens/SetupScreen';
import { isFirebaseConfigured } from './firebase/config';
import { useUserDoc } from './hooks/useAtelier';
import { useAuthUser } from './hooks/useAuthUser';

export default function App() {
  if (!isFirebaseConfigured) return <SetupScreen />;
  return <AuthGate />;
}

function AuthGate() {
  const { authUser, loading } = useAuthUser();
  const { data: user, loading: userLoading, error: userError } = useUserDoc(authUser?.uid ?? null);

  if (loading || (authUser && userLoading)) return <LoadingScreen />;
  if (!authUser) return <LoginScreen />;
  // 読み取りに失敗したときに初回設定へ進むと、既存ユーザーでもプロフィールを作り直そうとしてしまう
  if (userError) return <LoadErrorScreen />;
  if (!user) return <OnboardingScreen uid={authUser.uid} defaultName={authUser.displayName ?? ''} />;

  return <AtelierApp key={authUser.uid} authUser={authUser} user={user} />;
}
