import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import API from './API'
import Homepage from './components/Homepage';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import {LoggedPage} from './components/LoggedPage';
import { useEffect, useState } from 'react';
function App() {
  const [loggedUser, setLoggedUser] = useState(null)  

  useEffect(()=>{
    const checkAuth = async () => {
      try {
        const user = await API.getUserInfo();// we have the user info here
        setLoggedUser(user);
      } catch(e) {
        setLoggedUser(null)
      }
    }

    checkAuth();
  },[])

  function setupUser(user){
    setLoggedUser(user)
  }

  const handleLogout = async () => {
    try {
        await API.logOut();
        setLoggedUser(null);
        return true;
    } catch (e) {
      /*to inform the caller that somethin went wrong*/
        return false;
    }
    // clean up everything
  };

  return (
    
    <>
    <BrowserRouter>
    
    {loggedUser === null ?
      <Routes>
        <Route path="/" element = {<Homepage />}/>
        <Route path='/login' element = {<Homepage setupUser = {setupUser} />}/>
        <Route path = "*" element ={<Navigate replace to="/"/>} />
      </Routes>:
      <Routes>
        <Route path="/"  element={<LoggedPage handleLogout = {handleLogout} user = {loggedUser}/>  }/>    
        <Route path ="/edit" element={<LoggedPage handleLogout = {handleLogout} user = {loggedUser}/>} />
        <Route path = "*" element ={<Navigate replace to="/"/>}/>
      </Routes>

        
    } 
    </BrowserRouter>      
    </>
  );
}

export default App;



