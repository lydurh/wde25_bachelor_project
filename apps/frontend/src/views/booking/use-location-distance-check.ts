import { useEffect } from 'react';
import type { LocationDistanceCheckResult } from '@repo/shared';
import { api } from '@/lib/api';
import type { BookingDraft } from '@/views/booking/types';

const DISTANCE_CHECK_DEBOUNCE_MS = 400;

type UseLocationDistanceCheckParams = {
  address: string | undefined;
  setDraft: (patch: Partial<BookingDraft>) => void;
};

export function useLocationDistanceCheck({
  address,
  setDraft,
}: UseLocationDistanceCheckParams) {
  useEffect(() => {
    const trimmed = address?.trim();
    if (!trimmed) {
      setDraft({
        distanceKm: undefined,
        locationFeeApplies: false,
        distanceCheckStatus: 'idle',
      });
      return;
    }

    let cancelled = false;
    setDraft({ distanceCheckStatus: 'loading' });

    const timeoutId = window.setTimeout(() => {
      void api
        .post<{ data: LocationDistanceCheckResult }>(
          '/locations/distance-check',
          { destinationAddress: trimmed },
        )
        .then(({ data }) => {
          if (cancelled) return;
          setDraft({
            distanceKm: data.distanceKm,
            locationFeeApplies: data.appliesLocationFee,
            distanceCheckStatus: 'ready',
          });
        })
        .catch((error: unknown) => {
          console.error('Distance check failed', error);
          if (cancelled) return;
          setDraft({
            distanceKm: undefined,
            locationFeeApplies: false,
            distanceCheckStatus: 'error',
          });
        });
    }, DISTANCE_CHECK_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [address, setDraft]);
}
