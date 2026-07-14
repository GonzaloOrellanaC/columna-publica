import { NavigateFunction } from "react-router-dom";

export const goHomeOrBack = (navigate: NavigateFunction) => {
  // If the browser history has more than 1 entry, assume we have a previous page
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate("/");
  }
};
