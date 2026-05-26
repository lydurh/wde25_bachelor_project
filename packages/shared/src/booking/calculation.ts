import { BOOKING_LOCATION_FEE_KR } from './constants';
import type { Service } from '../types/service';

export type BookingServiceLine = {
  id: string;
  title: string;
  price: string;
  quantity: number;
};

export function getCumulatedServiceDuration(services: Service[]): number {
  return services.reduce(
    (acc, service) => acc + (service.service_duration ?? 0),
    0,
  );
}

export function getCumulatedServiceDurationFromQuantities(
  services: Service[],
  quantities: Record<string, number>,
): number {
  return services.reduce((acc, service) => {
    const quantity = quantities[service.service_pk] ?? 0;
    if (quantity <= 0) return acc;
    return acc + (service.service_duration ?? 0) * quantity;
  }, 0);
}

export function buildSelectedServiceLines(
  services: Service[],
  quantities: Record<string, number>,
): BookingServiceLine[] {
  return services
    .filter((service) => (quantities[service.service_pk] ?? 0) > 0)
    .map((service) => ({
      id: service.service_pk,
      title: service.service_title,
      price: service.service_price,
      quantity: quantities[service.service_pk] ?? 0,
    }));
}

export function getLinePriceKr(line: BookingServiceLine): number {
  const unit = Number.parseFloat(line.price);
  return (Number.isFinite(unit) ? unit : 0) * line.quantity;
}

export function getTotalPriceKr(lines: BookingServiceLine[]): number {
  return lines.reduce((sum, line) => sum + getLinePriceKr(line), 0);
}

export function getBookingTotalPriceKr(
  lines: BookingServiceLine[],
  locationFeeApplies = false,
): number {
  const servicesTotal = getTotalPriceKr(lines);
  return locationFeeApplies
    ? servicesTotal + BOOKING_LOCATION_FEE_KR
    : servicesTotal;
}
