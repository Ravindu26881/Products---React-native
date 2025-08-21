// Global coordinates storage for web geolocation
let globalCoords = null;

export const setGlobalCoords = (coords) => {
  globalCoords = coords;
  console.log('Global coords set:', coords);
};

export const getGlobalCoords = () => {
  return globalCoords;
};

export const clearGlobalCoords = () => {
  globalCoords = null;
};
