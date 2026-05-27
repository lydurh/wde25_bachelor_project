import {
  and,
  availability,
  db,
  eq,
  gte,
  type InferSelectModel,
  isNull,
} from '@repo/db';
import {
  type Availability,
  type CreateAvailabilityInput,
  parseAvailability,
  type UpdateAvailabilityInput,
} from '@repo/shared';
import { computeDriveTime } from '../../utils/routes';
import { appointmentsService } from '../appointments/appointments.service';
import { usersService } from '../users/users.service';

type AvailabilityRow = InferSelectModel<typeof availability>;

function availabilityFromRow(row: AvailabilityRow): Availability {
  return parseAvailability({
    availability_pk: row.availability_pk,
    availability_date: row.availability_date,
    availability_start_time: row.availability_start_time,
    availability_end_time: row.availability_end_time,
    availability_type: row.availability_type,
    availability_created_at: row.availability_created_at.toISOString(),
    availability_updated_at: row.availability_updated_at?.toISOString() ?? null,
    availability_deleted_at: row.availability_deleted_at?.toISOString() ?? null,
  });
}

const notDeleted = isNull(availability.availability_deleted_at);

function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export const availabilityService = {
  async list(from?: string) {
    const conditions = [notDeleted];
    if (from) {
      conditions.push(gte(availability.availability_date, from));
    }
    const rows = await db
      .select()
      .from(availability)
      .where(and(...conditions));
    return rows.map(availabilityFromRow);
  },

  async get(id: string) {
    const [row] = await db
      .select()
      .from(availability)
      .where(and(eq(availability.availability_pk, id), notDeleted))
      .limit(1);
    return row ? availabilityFromRow(row) : undefined;
  },

  async delete(id: string) {
    if (!id) {
      return undefined;
    }
    const [row] = await db
      .update(availability)
      .set({ availability_deleted_at: new Date() })
      .where(and(eq(availability.availability_pk, id), notDeleted))
      .returning();
    return row ? availabilityFromRow(row) : undefined;
  },

  async post(input: CreateAvailabilityInput) {
    const [row] = await db
      .insert(availability)
      .values({
        availability_date: input.availability_date,
        availability_start_time: input.availability_start_time,
        availability_end_time: input.availability_end_time,
        availability_type: input.availability_type ?? 'available',
      })
      .returning();

    return row ? availabilityFromRow(row) : null;
  },

  async patch(id: string, input: UpdateAvailabilityInput) {
    const [row] = await db
      .update(availability)
      .set({
        ...input,
        availability_updated_at: new Date(),
      })
      .where(and(eq(availability.availability_pk, id), notDeleted))
      .returning();

    return row ? availabilityFromRow(row) : undefined;
  },

  async listByDate(date: string) {
    const rows = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.availability_date, date),
          eq(availability.availability_type, 'available'),
          notDeleted,
        ),
      );
    return rows.map(availabilityFromRow);
  },

  async getFeasibleSlots(params: {
    date: string;
    serviceDuration: number;
    customerAddress: string;
  }) {
    const SLOT_INTERVAL = 30;
    const BUFFER_MINUTES = 10;

    const [adminResult, windows, booked] = await Promise.all([
      usersService.getAdminLocation().catch(() => null),
      this.listByDate(params.date),
      appointmentsService.listByDateWithAddress(params.date),
    ]);

    if (!adminResult) {
      return [];
    }

    const admin = adminResult;

    const sortedBooked = [...booked].sort(
      (a, b) => a.startMinutes - b.startMinutes,
    );
    type Gap = {
      fromMinutes: number;
      toMinutes: number;
      prevAddress: string;
      nextAddress: string | null;
    };

    const gaps: Gap[] = [];

    if (sortedBooked.length === 0) {
      gaps.push({
        fromMinutes: 0,
        toMinutes: 24 * 60,
        prevAddress: admin.address,
        nextAddress: null,
      });
    } else {
      gaps.push({
        fromMinutes: 0,
        toMinutes: sortedBooked[0]!.startMinutes,
        prevAddress: admin.address,
        nextAddress: sortedBooked[0]!.address || admin.address,
      });

      for (let i = 0; i < sortedBooked.length - 1; i++) {
        const current = sortedBooked[i]!;
        const next = sortedBooked[i + 1]!;
        gaps.push({
          fromMinutes: current.endMinutes,
          toMinutes: next.startMinutes,
          prevAddress: current.address || admin.address,
          nextAddress: next.address || admin.address,
        });
      }
      const last = sortedBooked[sortedBooked.length - 1]!;
      gaps.push({
        fromMinutes: last.endMinutes,
        toMinutes: 24 * 60,
        prevAddress: last.address || admin.address,
        nextAddress: null,
      });
    }

    type DrivePair = { origin: string; destination: string };
    const pairSet = new Map<string, DrivePair>();

    const pairKey = (origin: string, dest: string) => `${origin}→${dest}`;

    for (const gap of gaps) {
      const arriveKey = pairKey(gap.prevAddress, params.customerAddress);
      if (!pairSet.has(arriveKey)) {
        pairSet.set(arriveKey, {
          origin: gap.prevAddress,
          destination: params.customerAddress,
        });
      }

      if (gap.nextAddress) {
        const departKey = pairKey(params.customerAddress, gap.nextAddress);
        if (!pairSet.has(departKey)) {
          pairSet.set(departKey, {
            origin: params.customerAddress,
            destination: gap.nextAddress,
          });
        }
      }
    }

    const driveTimeCache = new Map<string, number>();
    const entries = [...pairSet.entries()];

    const results = await Promise.allSettled(
      entries.map(([, pair]) =>
        computeDriveTime(pair.origin, pair.destination),
      ),
    );

    for (let i = 0; i < entries.length; i++) {
      const key = entries[i]![0];
      const result = results[i]!;
      if (result.status === 'rejected') {
        console.warn(`Drive time failed for ${key}: ${result.reason}`);
      }
      driveTimeCache.set(
        key,
        result.status === 'fulfilled' ? result.value : 999,
      );
    }

    const getDrive = (origin: string, dest: string): number => {
      return driveTimeCache.get(pairKey(origin, dest)) ?? 999;
    };

    type FeasibleWindow = { startMinutes: number; endMinutes: number };
    const feasibleWindows: FeasibleWindow[] = [];

    for (const gap of gaps) {
      const driveFromPrev = getDrive(gap.prevAddress, params.customerAddress);
      const earliestArrival = gap.fromMinutes + driveFromPrev + BUFFER_MINUTES;

      let latestDeparture = gap.toMinutes;
      if (gap.nextAddress) {
        const driveToNext = getDrive(params.customerAddress, gap.nextAddress);
        latestDeparture = gap.toMinutes - driveToNext - BUFFER_MINUTES;
      }

      // Slot must fit: start >= earliestArrival, start + duration <= latestDeparture
      const gapFeasibleStart = earliestArrival;
      const gapFeasibleEnd = latestDeparture;

      if (gapFeasibleEnd - gapFeasibleStart < params.serviceDuration) {
        continue; // Gap too small to fit service + travel
      }

      // Intersect with each availability window
      for (const window of windows) {
        const winStart = parseMinutes(window.availability_start_time);
        const winEnd = parseMinutes(window.availability_end_time);

        const feasibleStart = Math.max(gapFeasibleStart, winStart);
        const feasibleEnd = Math.min(gapFeasibleEnd, winEnd);

        if (feasibleEnd - feasibleStart >= params.serviceDuration) {
          feasibleWindows.push({
            startMinutes: feasibleStart,
            endMinutes: feasibleEnd,
          });
        }
      }
    }

    type FeasibleSlot = {
      iso: string;
      label: string;
      reachable: boolean;
      driveMinutes: number;
    };

    const seen = new Set<string>();
    const result: FeasibleSlot[] = [];
    const dateStr = params.date.slice(0, 10);

    // Also generate ALL availability-window slots so we can mark
    // unreachable ones (keeps current UX of showing disabled slots)
    const allSlotMinutes = new Set<number>();
    const feasibleSlotMinutes = new Set<number>();

    // Collect all possible slots from availability windows
    for (const window of windows) {
      let start = parseMinutes(window.availability_start_time);
      const end = parseMinutes(window.availability_end_time);
      if (start >= end) continue;

      for (; start + params.serviceDuration <= end; start += SLOT_INTERVAL) {
        // Only include if not overlapping with existing appointments
        const slotEnd = start + params.serviceDuration;
        const overlaps = sortedBooked.some(
          (appt) => start < appt.endMinutes && slotEnd > appt.startMinutes,
        );
        if (!overlaps) {
          allSlotMinutes.add(start);
        }
      }
    }

    // Mark which slots fall within feasible windows
    for (const fw of feasibleWindows) {
      // Align to SLOT_INTERVAL grid
      let start = Math.ceil(fw.startMinutes / SLOT_INTERVAL) * SLOT_INTERVAL;
      for (
        ;
        start + params.serviceDuration <= fw.endMinutes;
        start += SLOT_INTERVAL
      ) {
        if (allSlotMinutes.has(start)) {
          feasibleSlotMinutes.add(start);
        }
      }
    }
    const firstArrivalDrive =
      gaps.length > 0
        ? getDrive(gaps[0]!.prevAddress, params.customerAddress)
        : 0;

    for (const startMin of [...allSlotMinutes].sort((a, b) => a - b)) {
      const h = String(Math.floor(startMin / 60)).padStart(2, '0');
      const m = String(startMin % 60).padStart(2, '0');
      const iso = `${dateStr}T${h}:${m}:00`;

      if (seen.has(iso)) continue;
      seen.add(iso);

      // Find which gap this slot belongs to for drive time display
      const slotEnd = startMin + params.serviceDuration;
      const gap = gaps.find(
        (g) => startMin >= g.fromMinutes && slotEnd <= g.toMinutes,
      );
      const driveMinutes = gap
        ? getDrive(gap.prevAddress, params.customerAddress)
        : firstArrivalDrive;

      result.push({
        iso,
        label: `${h}:${m}`,
        reachable: feasibleSlotMinutes.has(startMin),
        driveMinutes,
      });
    }
    return result;
  },
};
