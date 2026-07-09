import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import PlayPage from './pages/PlayPage'
import JoinPage from './pages/JoinPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/play/:roomCode" element={<PlayPage />} />
      <Route path="/join" element={<JoinPage />} />
    </Routes>
  )
}

export default App
