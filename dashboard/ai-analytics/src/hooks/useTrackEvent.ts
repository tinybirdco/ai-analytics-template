type ExtendedWindow = Window &
  typeof globalThis & {
    Tinybird: {
      trackEvent: (event: string, payload: Record<string, unknown>) => void;
    };
  };

export function useTrackEvent() {
  function track(event: string, payload: Record<string, unknown>) {
    if (typeof window !== "undefined" && "Tinybird" in window) {
      (window as ExtendedWindow).Tinybird.trackEvent(event, payload);
    }
  }

  return track;
}
