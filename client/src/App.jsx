import './App.css';
import { Routes, Route } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import Dashboard from './Components/Dashboard';
import Leaderboard from './Components/Leaderboard';
import DSA from './Components/DSA';
import MockTest from './Components/MockTest/MockTest';
import SignUp from './Components/SignUp';
import SignIn from './Components/SignIn';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/dsa/*" element={<DSA />} />
        <Route path="/mocktests/*" element={<MockTest />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
