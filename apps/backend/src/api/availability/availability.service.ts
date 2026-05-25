import {
  and,
  availability,
  db,
  eq,
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
  async list() {
    const rows = await db.select().from(availability).where(notDeleted);
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
    const admin = await usersService.getAdminLocation();
    const windows = await this.listByDate(params.date);
    const booked = await appointmentsService.listByDateWithAddress(params.date);
    const sortedBooked = [...booked].sort(
      (a, b) => a.startMinutes - b.startMinutes,
    );

    // Build candidate slots from availability windows
    type Candidate = { iso: string; label: string; startMinutes: number };
    const candidates: Candidate[] = [];

    for (const window of windows) {
      const dateStr = window.availability_date.slice(0, 10);
      let start = parseMinutes(window.availability_start_time);
      const end = parseMinutes(window.availability_end_time);
      if (start >= end) continue;

      for (; start + params.serviceDuration <= end; start += SLOT_INTERVAL) {
        const h = String(Math.floor(start / 60)).padStart(2, '0');
        const m = String(start % 60).padStart(2, '0');
        candidates.push({
          iso: `${dateStr}T${h}:${m}:00`,
          label: `${h}:${m}`,
          startMinutes: start,
        });
      }
    }

    // Deduplicate by iso
    const seen = new Set<string>();
    const uniqueCandidates = candidates.filter((c) => {
      if (seen.has(c.iso)) return false;
      seen.add(c.iso);
      return true;
    });

    // Cache drive times to avoid duplicate API calls
    const driveTimeCache = new Map<string, number>();
    const getDriveTime = async (
      origin: string,
      destination: string,
    ): Promise<number> => {
      const key = `${origin}→${destination}`;
      const cached = driveTimeCache.get(key);
      if (cached !== undefined) return cached;
      const minutes = await computeDriveTime(origin, destination);
      driveTimeCache.set(key, minutes);
      return minutes;
    };

    type FeasibleSlot = {
      iso: string;
      label: string;
      reachable: boolean;
      driveMinutes: number;
    };

    const result: FeasibleSlot[] = [];

    for (const slot of uniqueCandidates) {
      const slotEnd = slot.startMinutes + params.serviceDuration;

      // Check overlap with existing appointments
      const overlaps = sortedBooked.some(
        (appt) =>
          slot.startMinutes < appt.endMinutes && slotEnd > appt.startMinutes,
      );
      if (overlaps) continue;

      // Find previous appointment (ends before this slot)
      const prev = sortedBooked
        .filter((a) => a.endMinutes <= slot.startMinutes)
        .at(-1);

      // Find next appointment (starts after this slot ends)
      const next = sortedBooked.find((a) => a.startMinutes >= slotEnd);

      let reachable = true;
      let driveMinutes = 0;

      // Can the hairdresser arrive from previous appointment (or home)?
      const originAddress = prev?.address || admin.address;
      const freeAt = prev?.endMinutes ?? 0;

      driveMinutes = await getDriveTime(originAddress, params.customerAddress);
      if (freeAt + driveMinutes > slot.startMinutes) {
        reachable = false;
      }

      // Can the hairdresser leave and reach the next appointment?
      if (reachable && next && next.address) {
        const driveToNext = await getDriveTime(
          params.customerAddress,
          next.address,
        );
        if (slotEnd + driveToNext > next.startMinutes) {
          reachable = false;
        }
      }

      result.push({
        iso: slot.iso,
        label: slot.label,
        reachable,
        driveMinutes,
      });
    }

    return result;
  },
};
