import { Route, Routes } from "react-router-dom"
import Home from "./routes/Home"
import Info from "./routes/Info"

function App() {

  return (
    <Routes>
      <Route path='/' element={<Home />} />
    </Routes>
  )
}

export default App
