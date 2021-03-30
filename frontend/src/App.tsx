import React from 'react';
import { Route, Switch } from 'react-router-dom';
import styles from './App.module.css';
import SubMain from './components/user/main/subMain/subMain';
import MemberContainer from './containers/memberContainer';
import MyPage from './components/myPage/myPage';
import StreamingListPage from './components/streamingListPage/streamingListPage';
import UserMainPage from './components/userMainPage/userMainPage';
import shelterListPage from './components/shelterListPage/shelterListPage';
import ErrorAlert, { ProtectedRouteConsumer, ProtectedRouteShelter, ProtectedRouteAdmin, ProtectedRouteToken } from './components/error/errorAlert';
import PasswordContainer from './containers/passwordContainer';
import ConfirmSignUp from './components/submain/confirmSignUp/confirmSignUp';
import { refresh, security, auth } from './service/instance';

import qs from 'qs';

function App() {

  const onClick1 = () => {
    refresh.post('oauth/token', 
      qs.stringify({ grant_type: "refresh_token", refresh_token: localStorage.getItem('refresh_token') })
    );
  }

  const onClick2 = () => {
    security.get('members/test', {
      'headers': {
        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      }
    });
  }

  return (
    <div className={styles.app}>
    <button onClick={onClick1}>요청 테스트</button>
      <button onClick={onClick2}>요청 테스트</button>
      <Switch>
        <ProtectedRouteConsumer path="/user" Component={UserMainPage} exact/>
        <ProtectedRouteShelter path="/main" Component={SubMain} exact/>
        {/* <ProtectedRouteAdmin path="/admin" Component={Admin} exact/> */}
        <Route path="/profile" component={MyPage} exact/>
        {/* <Route path="/shelter/streaming" component={Streaming} exact/> */}
        <ProtectedRouteConsumer path="/shelter" Component={shelterListPage} exact/>
        <ProtectedRouteConsumer path="/streaming" Component={StreamingListPage} exact/>
        {/* <ProtectedRouteConsumer path="/pet" Component={Pet} exact/> */}
        <Route path="/signup/:result" component={ConfirmSignUp} exact/>
        <Route path="/password/:auth" component={PasswordContainer} exact/>
        <ProtectedRouteToken path="/" Component={MemberContainer} exact/>
        <Route>
          <ErrorAlert message="잘못된 요청 입니다."/>
        </Route>
      </Switch>
    </div>
  );
}

export default App;