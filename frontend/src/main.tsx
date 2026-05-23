import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Only weights actually used in the UI (400 body, 600 semibold, 700 bold for headings)
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/jetbrains-mono/400.css'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
