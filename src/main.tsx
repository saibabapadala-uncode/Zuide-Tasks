import React from 'react'
import { createRoot } from 'react-dom/client'
import { setupIonicReact } from '@ionic/react'

/* Ionic core CSS — must load before any component CSS */
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

/* App theme — Tailwind + Ionic variable overrides */
import './theme/index.css'

import App from './App'

setupIonicReact({
  mode: 'md',            // Material Design base; iOS mode auto-applies on iPhone
  animated: true,
  hardwareBackButton: true,
  swipeBackEnabled: true,
  statusTap: true,
})

const container = document.getElementById('root')!
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
