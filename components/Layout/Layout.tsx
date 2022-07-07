import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { UserData, LiveData } from 'types/mainType';
import {
  showMenuBarState,
  showNotiBarState,
  userState,
  liveState,
  newLoginState,
} from 'utils/recoil/layout';
import { openCurrentMatchInfoState } from 'utils/recoil/match';
import { loginState } from 'utils/recoil/login';
import { errorState } from 'utils/recoil/error';
import Login from 'pages/login';
import Header from './Header';
import Footer from './Footer';
import CurrentMatchInfo from './CurrentMatchInfo';
import Modal from 'components/modal/Modal';
import InputScoreModal from 'components/modal/InputScoreModal';
import instance from 'utils/axios';
import styles from 'styles/Layout/Layout.module.scss';
import WelcomeModal from 'components/modal/WelcomeModal';

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userData, setUserData] = useRecoilState<UserData>(userState);
  const [liveData, setLiveData] = useRecoilState<LiveData>(liveState);
  const [openCurrentInfo, setOpenCurrentInfo] = useRecoilState<boolean>(
    openCurrentMatchInfoState
  );
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState);
  const [newLogin, setNewLogin] = useRecoilState(newLoginState);
  const setErrorMessage = useSetRecoilState(errorState);
  const setShowMenuBar = useSetRecoilState(showMenuBarState);
  const setShowNotiBar = useSetRecoilState(showNotiBarState);
  const router = useRouter();
  const presentPath = router.asPath;
  const token = presentPath.split('?token=')[1];

  useEffect(() => {
    if (token) localStorage.setItem('42gg-token', token);
    if (localStorage.getItem('42gg-token')) {
      setIsLoggedIn(true);
      getUserDataHandler();
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (router.asPath.includes('token')) {
      setNewLogin(true);
      router.push(`/`);
    }
  }, [token]);

  useEffect(() => {
    setShowMenuBar(false);
    setShowNotiBar(false);
  }, [presentPath]);

  useEffect(() => {
    if (userData.intraId && isLoggedIn) {
      getLiveDataHandler();
    }
  }, [presentPath, userData]);

  useEffect(() => {
    if (liveData?.event === 'match') setOpenCurrentInfo(true);
    else setOpenCurrentInfo(false);
  }, [liveData]);

  const getUserDataHandler = async () => {
    try {
      const res = await instance.get(`/pingpong/users`);
      setUserData(res?.data);
    } catch (e) {
      setErrorMessage('JB02');
    }
  };

  const getLiveDataHandler = async () => {
    try {
      const res = await instance.get(`/pingpong/users/live`);
      setLiveData(res?.data);
    } catch (e) {
      setErrorMessage('JB03');
    }
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.background}>
        {isLoggedIn ? (
          <div>
            <Header />
            {newLogin && (
              <Modal>
                <WelcomeModal />
              </Modal>
            )}
            {liveData.event === 'game' && (
              <Modal>
                <InputScoreModal />
              </Modal>
            )}
            {openCurrentInfo && <CurrentMatchInfo />}
            {presentPath !== '/match' && presentPath !== '/manual' && (
              <Link href='/match'>
                <div className={styles.buttonContainer}>
                  <a className={styles.matchingButton}>🏓</a>
                </div>
              </Link>
            )}
            {children}
            <Footer />
          </div>
        ) : (
          <>{!isLoading && <Login />}</>
        )}
      </div>
    </div>
  );
}
