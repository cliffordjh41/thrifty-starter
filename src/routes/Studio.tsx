import { useNavigate } from "react-router"
import StudioApp from "../studio/App"

export function Studio() {
  const navigate = useNavigate()
  return <StudioApp onBack={() => navigate("/home")} />
}
