import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Only weights actually used in the UI (400 body, 600 semibold, 700 bold for headings)
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/jetbrains-mono/400.css'
import './index.css'
import { init } from '@dadaia/analytics-sdk'

// T-AN-D-02: Initialise analytics SDK at app startup.
// VITE_ANALYTICS_ENDPOINT is injected per-environment (stage/prod) by CI/CD.
// If not set, the SDK silently no-ops — it never throws.
init({
  site_id: 'portifolio',
  endpoint: import.meta.env.VITE_ANALYTICS_ENDPOINT ?? '',
})

createRoot(document.getElementById("root")!).render(<App />);
