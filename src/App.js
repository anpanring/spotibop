import React, { useState, useEffect } from 'react';
import WebPlayback from './WebPlayback';
import Login from './Login';
import './App.css';

function App() {
  const [token, setToken] = useState(document.cookie.split('=')[1]);

  // useEffect(() => {
  //   console.log(document.cookie);
  //   if(document.cookie.includes('access_token')) {
  //     console.log(document.cookie.split('=')[1]);
  //     setToken(document.cookie.split('=')[1]);
  //   }
      

  //   // async function getToken() {
  //   //   const response = await fetch('/auth/token');
  //   //   const spotToken = await response.json();
  //   //   setToken(spotToken.access_token);
  //   // }

  //   // getToken();
    
  // }, []);

  return (
    <>
      {(token === "" ? <Login /> : <WebPlayback token={token} />)}
    </>
  )
}

export default App;
