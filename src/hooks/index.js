import React from "react";

export const useGapiInit = () => {
  const [init, setInit] = React.useState(window.gapiInited);
  const listenToPopstate = () => {
    const gapiInited = window.gapiInited;
    setInit(gapiInited);
  };
  React.useEffect(() => {
    window.addEventListener("popstate", listenToPopstate);
    return () => {
      window.removeEventListener("popstate", listenToPopstate);
    };
  }, []);
  return init;
};
