import styles from './App.module.css';
import Home from './components/Home/Home';
import PlayMulti from './components/PlayMulti/PlayMulti';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import UserProvider from './context/Providers/UserContext.provider';
import OpponentProvider from './context/Providers/OpponentContext.provider';

const router = createBrowserRouter([
  { path: '/', element: <Home />},
  { path: '/play-multiplayer/:roomId', element: <PlayMulti /> },
  { path: '*', element: <h1>404 Not Found</h1> },
]);

function App() {

  return (
    <>
    <UserProvider>
        <OpponentProvider>
            <RouterProvider router={router} />
        </OpponentProvider>
    </UserProvider>
    </>
  )
}

export default App
