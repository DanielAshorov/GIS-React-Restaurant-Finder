import './App.css';
import CloseBuy from './pages/CloseBuy';
import UserLocation from './pages/UserLocation';
import { Routes, Route } from 'react-router-dom';
function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path='/' element={<UserLocation />} />
        <Route exact path='/close-buy' element={<CloseBuy />} />
      </Routes>
    </div>
  );
}

export default App;
