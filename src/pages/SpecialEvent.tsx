import { useNavigate } from "react-router-dom";
import SpecialEventPage from "@/components/SpecialEventPage";

const SpecialEvent = () => {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate("/home");
  };

  return <SpecialEventPage onExit={handleExit} />;
};

export default SpecialEvent;