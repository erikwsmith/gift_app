import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import './styles.css';

import NavBar from './components/navbar_component'

function App() {
  return (
    <BrowserRouter>
      <NavBar/>    
    </BrowserRouter>    
  );
}

export default App;
