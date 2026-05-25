import { useEffect, type RefObject } from 'react';

const GOOGLE_API_KEY = import.meta.env['VITE_GOOGLE_MAPS_API_KEY'] as string;

const PLACE_AUTOCOMPLETE_OPTIONS = {
  includedRegionCodes: ['dk'],
  locationBias: { center: { lat: 55.6761, lng: 12.5683 }, radius: 50_000 },
} as const;

const PLACEHOLDER = 'Søg efter adresse...';

const MAPS_INIT_CALLBACK = '__googleMapsInitCallback';

type PlaceAutocompleteElementInstance = HTMLElement & {
  placeholder: string;
};

type GoogleMapsPlaces = {
  importLibrary(name: 'places'): Promise<{
    PlaceAutocompleteElement: new (
      options: typeof PLACE_AUTOCOMPLETE_OPTIONS,
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

async function createPlaceAutocompleteElement(): Promise<PlaceAutocompleteElementInstance> {
  const { PlaceAutocompleteElement } =
    await getGoogleMaps().importLibrary('places');

  return new PlaceAutocompleteElement(PLACE_AUTOCOMPLETE_OPTIONS);
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
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let autocomplete: PlaceAutocompleteElementInstance | null = null;
    let cancelled = false;

    const onSelect = (event: Event) => {
      void resolveAddressFromGmpSelect(event).then((address) => {
        if (address) onAddress(address);
      });
    };

    void loadGoogleMapsCore()
      .then(() => createPlaceAutocompleteElement())
      .then((element) => {
        if (cancelled || !containerRef.current) return;

        autocomplete = element;
        element.placeholder = PLACEHOLDER;
        element.style.width = '100%';
        element.addEventListener('gmp-select', onSelect);
        containerRef.current.appendChild(element);
      })
      .catch((error: unknown) => {
        console.error('Google Places autocomplete failed to load', error);
      });

    return () => {
      cancelled = true;
      autocomplete?.removeEventListener('gmp-select', onSelect);
      autocomplete?.remove();
    };
  }, [containerRef, onAddress]);
}
