import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router'
import { store } from '@/services/store'
import { router } from '@/routes/router'
// @ts-ignore
import './App.css'

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
}

export default App
