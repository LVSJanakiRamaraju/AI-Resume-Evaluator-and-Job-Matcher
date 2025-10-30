import { createContext, useState } from "react";

export const ResumeContext = createContext();

export function ResumeProvider({ children }) {
  const [selectedResume, setSelectedResume] = useState(null);

  return (
    <ResumeContext.Provider value={{ selectedResume, setSelectedResume }}>
      {children}
    </ResumeContext.Provider>
  );
}
