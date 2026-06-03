import { useEffect, useRef, type RefObject } from 'react';

const GOOGLE_API_KEY = import.meta.env['VITE_GOOGLE_MAPS_API_KEY'] as string;

/** Copenhagen — fallback when admin origin coordinates are unavailable */
const DEFAULT_LOCATION_BIAS = {
  lat: 55.6761,
  lng: 12.5683,
} as const;

const LOCATION_BIAS_RADIUS_METERS = 50_000;

type PlaceAutocompleteOptions = {
  includedRegionCodes: ['dk'];
  locationBias: {
    center: { lat: number; lng: number };
    radius: number;
  };
};

function buildPlaceAutocompleteOptions(center: {
  lat: number;
  lng: number;
}): PlaceAutocompleteOptions {
  return {
    includedRegionCodes: ['dk'],
    locationBias: { center, radius: LOCATION_BIAS_RADIUS_METERS },
  };
}

const PLACEHOLDER = 'Søg efter adresse...';

const MAPS_INIT_CALLBACK = '__googleMapsInitCallback';

type PlaceAutocompleteElementInstance = HTMLElement & {
  placeholder: string;
  value: string;
};

type GoogleMapsPlaces = {
  importLibrary(name: 'places'): Promise<{
    PlaceAutocompleteElement: new (
      options: PlaceAutocompleteOptions,
    ) => PlaceAutocompleteElementInstance;
  }>;
};

type GmpSelectEvent = Event & {
  placePrediction?: {
    toPlace(): {
      formattedAddress?: string;
      fetchFields(options: { fields: string[] }): Promise<void>;
    };
  };
};

function getGoogleMaps(): GoogleMapsPlaces {
  const maps = (
    globalThis as typeof globalThis & {
      google?: { maps: GoogleMapsPlaces };
    }
  ).google?.maps;

  if (!maps) {
    throw new Error('Google Maps is not loaded');
  }

  return maps;
}

let mapsCorePromise: Promise<void> | null = null;

function loadGoogleMapsCore(): Promise<void> {
  if (mapsCorePromise) return mapsCorePromise;

  try {
    getGoogleMaps();
    mapsCorePromise = Promise.resolve();
    return mapsCorePromise;
  } catch {
    // Maps not loaded yet — inject script below.
  }

  mapsCorePromise = new Promise((resolve, reject) => {
    const win = globalThis as typeof globalThis & {
      [MAPS_INIT_CALLBACK]?: () => void;
    };

    win[MAPS_INIT_CALLBACK] = () => {
      delete win[MAPS_INIT_CALLBACK];
      resolve();
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&loading=async&callback=${MAPS_INIT_CALLBACK}&v=weekly`;
    script.async = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });

  return mapsCorePromise;
}

async function createPlaceAutocompleteElement(
  options: PlaceAutocompleteOptions,
): Promise<PlaceAutocompleteElementInstance> {
  const { PlaceAutocompleteElement } =
    await getGoogleMaps().importLibrary('places');

  return new PlaceAutocompleteElement(options);
}

async function resolveAddressFromGmpSelect(
  event: Event,
): Promise<string | undefined> {
  const { placePrediction } = event as GmpSelectEvent;
  if (!placePrediction) return undefined;

  const place = placePrediction.toPlace();
  await place.fetchFields({ fields: ['formattedAddress'] });
  return place.formattedAddress;
}

export function usePlaceAutocomplete(
  containerRef: RefObject<HTMLDivElement | null>,
  onAddress: (address: string) => void,
  options?: {
    enabled?: boolean;
    initialAddress?: string;
    locationBiasCenter?: { lat: number; lng: number } | null;
  },
): void {
  const enabled = options?.enabled ?? true;
  const initialAddress = options?.initialAddress;
  const locationBiasCenter = options?.locationBiasCenter;

  const elementRef = useRef<PlaceAutocompleteElementInstance | null>(null);
  const initialAddressRef = useRef(initialAddress);
  initialAddressRef.current = initialAddress;

  useEffect(() => {
    if (!enabled) return;

    const biasCenter = locationBiasCenter ?? DEFAULT_LOCATION_BIAS;
    const autocompleteOptions = buildPlaceAutocompleteOptions(biasCenter);

    let autocomplete: PlaceAutocompleteElementInstance | null = null;
    let cancelled = false;
    let retryFrameId = 0;

    const onSelect = (event: Event) => {
      void resolveAddressFromGmpSelect(event).then((address) => {
        if (address) onAddress(address);
      });
    };

    const mountElement = (element: PlaceAutocompleteElementInstance) => {
      const tryAppend = () => {
        if (cancelled) return;

        const container = containerRef.current;
        if (!container) {
          retryFrameId = requestAnimationFrame(tryAppend);
          return;
        }

        autocomplete = element;
        elementRef.current = element;
        element.placeholder = PLACEHOLDER;
        element.style.width = '100%';
        element.style.display = 'block';
        element.style.setProperty('color-scheme', 'light');
        element.style.setProperty('background-color', '#ffffff');
        element.style.setProperty('border', '1px solid #e5e3e3');
        element.style.setProperty('border-radius', '9999px');
        element.style.setProperty('min-height', '2.25rem');

        if (initialAddressRef.current) {
          element.value = initialAddressRef.current;
        }

        element.addEventListener('gmp-select', onSelect);
        container.appendChild(element);
      };

      tryAppend();
    };

    void loadGoogleMapsCore()
      .then(() => createPlaceAutocompleteElement(autocompleteOptions))
      .then((element) => {
        if (cancelled) return;
        mountElement(element);
      })
      .catch((error: unknown) => {
        console.error('Google Places autocomplete failed to load', error);
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(retryFrameId);
      elementRef.current = null;
      autocomplete?.removeEventListener('gmp-select', onSelect);
      autocomplete?.remove();
    };
  }, [containerRef, onAddress, enabled, locationBiasCenter]);

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current;
    if (!element || !initialAddress) return;

    element.value = initialAddress;
  }, [initialAddress, enabled]);
}
