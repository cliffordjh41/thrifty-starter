import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import "./index.css"
import { ThemeProvider } from "./theme-context"
import { Landing } from "./routes/Landing"
import { Layout } from "./routes/Layout"
import { Home } from "./routes/Home"
import { Studio } from "./routes/Studio"
import { Columns } from "./routes/Columns"

// Routes:
//   /         Landing — name + "enter" link into the shell.
//   /home     Layout shell (left nav · center body · right news/assistant).
//             The nav links out to the two full-viewport demos below.
//   /studio   The studio design tool — full viewport, sibling to the shell
//             (it has its own three-column chrome, so it can't nest inside it).
//   /columns  The slidable-column + toolbar demo over the Blueprint canvas —
//             full viewport, sibling to the shell.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/columns" element={<Columns />} />
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
