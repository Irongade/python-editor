import { createContext } from "react";

export const INITIAL_STATE = {
  userId: "",
  setUserId: () => {},
  skillLevel: "",
  setSkillLevel: () => {},
};

export const StateContext = createContext(INITIAL_STATE);
