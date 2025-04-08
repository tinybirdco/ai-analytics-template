type ExtendedWindow = Window &
  typeof globalThis & {
    Tinybird: {
      trackEvent: (event: string, payload: Record<string, unknown>) => void;
    };
  };

export function useTrackEvent() {
  function track(event: string, payload: Record<string, unknown>) {
    if (typeof window !== "undefined" && "Tinybird" in window) {
      try {
        (window as ExtendedWindow).Tinybird.trackEvent(event, payload);
      } catch (error) {
        console.error("Error tracking event:", error);
      }
    }
  }

  return track;
}
