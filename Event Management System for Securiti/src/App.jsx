import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';



function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
      
     
   
        <SignIn/>
        <SignUp/>

        
      </div>
    </>
  );
}

export default App;
