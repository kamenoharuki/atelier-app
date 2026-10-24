// ログイン状態（Firebase Authentication）を監視する
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

// authUser: ログイン中のユーザー（未ログインなら null） / loading: 確認中かどうか
export function useAuthUser() {
  const [state, setState] = useState({
    authUser: auth.currentUser,
    loading: true,
  });

  useEffect(() => onAuthStateChanged(auth, (authUser) => setState({ authUser, loading: false })), []);

  return state;
}
