type StateStore = {
  mediaUrl: string | null;
  detectedVideo: boolean | null;
  observerTimeout: ReturnType<typeof setTimeout> | null;
  lastUrl: string;
  isPolling: boolean;
};

let state: StateStore = {
  mediaUrl: null,
  detectedVideo: null,
  observerTimeout: null,
  lastUrl: "",
  isPolling: false,
};

export function getState() {
  return { ...state };
}

export function setState(partial: Partial<StateStore>) {
  const newState = { ...getState(), ...partial };
  state = newState;
}
