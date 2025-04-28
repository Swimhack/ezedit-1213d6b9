
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'grapesjs/dist/css/grapes.min.css'
import './components/editor/grapesjs-styles.css'

// Add styles for react-split gutters
import './split-styles.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
