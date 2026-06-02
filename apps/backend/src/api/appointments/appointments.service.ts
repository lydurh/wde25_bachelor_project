import {
  and,
  appointments,
  appointmentServices,
  db,
  eq,
  type InferSelectModel,
  isNull,
  locations,
  ne,
  users,
} from '@repo/db';
import {
  type Appointment,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
  type SendConfirmationEmailInput,
  parseAppointment,
} from '@repo/shared';
import {
  getMailFrom,
  isMockEmailTransport,
  resolveMailRecipient,
  transporter,
} from '../../utils/mailer';

type AppointmentRow = InferSelectModel<typeof appointments>;

/*
  DB row → API shape: `parseAppointment` (Zod) expects wire strings for date/time
  (e.g. YYYY-MM-DD, HH:MM / HH:MM:SS). Drizzle/postgres often already give strings
  for `date` / `time`, but they can come through as `Date` depending on driver
  settings, so we must not call `.toISOString()` blindly (strings have no such
  method). These helpers normalize either form before validation. Timestamps
  below are handled separately because they are reliably `Date` in this schema.
*/
function toWireDate(value: string | Date): string {
  if (typeof value === 'string') {
    return value;
  }
  return value.toISOString().slice(0, 10);
}

function toWireTime(value: string | Date): string {
  if (typeof value === 'string') {
    return value;
  }
  return value.toISOString().slice(11, 19);
}

function appointmentFromRow(row: AppointmentRow): Appointment {
  return parseAppointment({
    appointment_pk: row.appointment_pk,
    appointment_user_fk: row.appointment_user_fk,
    location_fk: row.location_fk,
    appointment_time: toWireTime(row.appointment_time),
    appointment_date: toWireDate(row.appointment_date),
    appointment_notes: row.appointment_notes,
    appointment_duration: row.appointment_duration,
    appointment_total_price: row.appointment_total_price,
    appointment_status: row.appointment_status,
    appointment_created_at: row.appointment_created_at.toISOString(),
    appointment_updated_at: row.appointment_updated_at?.toISOString() ?? null,
    appointment_deleted_at: row.appointment_deleted_at?.toISOString() ?? null,
  });
}

const notDeleted = isNull(appointments.appointment_deleted_at);

export const appointmentsService = {
  async list() {
    const rows = await db.select().from(appointments).where(notDeleted);
    return rows.map(appointmentFromRow);
  },

  async get(id: string) {
    const [row] = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.appointment_pk, id), notDeleted))
      .limit(1);
    return row ? appointmentFromRow(row) : undefined;
  },

  async delete(id: string) {
    if (!id) {
      return undefined;
    }
    const [row] = await db
      .update(appointments)
      .set({ appointment_deleted_at: new Date() })
      .where(and(eq(appointments.appointment_pk, id), notDeleted))
      .returning();
    return row ? appointmentFromRow(row) : undefined;
  },

  async post(input: CreateAppointmentInput) {
    const [row] = await db
      .insert(appointments)
      .values({
        appointment_user_fk: input.appointment_user_fk,
        location_fk: input.location_fk,
        appointment_time: input.appointment_time,
        appointment_date: input.appointment_date,
        appointment_notes: input.appointment_notes,
        appointment_duration: input.appointment_duration,
        appointment_total_price: input.appointment_total_price,
      })
      .returning();

    if (!row) return null;

    if (input.services.length > 0) {
      await db.insert(appointmentServices).values(
        input.services.map((s) => ({
          appointment_fk: row.appointment_pk,
          service_fk: s.service_fk,
          quantity: s.quantity,
        })),
      );
    }

    return appointmentFromRow(row);
  },

  async patch(id: string, input: UpdateAppointmentInput) {
    const [row] = await db
      .update(appointments)
      .set({
        ...input,
        appointment_updated_at: new Date(),
      })
      .where(and(eq(appointments.appointment_pk, id), notDeleted))
      .returning();

    return row ? appointmentFromRow(row) : undefined;
  },

  async listByDateWithAddress(date: string) {
    const rows = await db
      .select({
        time: appointments.appointment_time,
        duration: appointments.appointment_duration,
        address: locations.location_address,
      })
      .from(appointments)
      .leftJoin(locations, eq(appointments.location_fk, locations.location_pk))
      .where(
        and(
          eq(appointments.appointment_date, date),
          notDeleted,
          ne(appointments.appointment_status, 'cancelled'),
        ),
      );

    return rows.map((row) => {
      const time = typeof row.time === 'string' ? row.time : '';
      const [h, m] = time.split(':').map(Number);
      const startMinutes = (h ?? 0) * 60 + (m ?? 0);
      return {
        startMinutes,
        endMinutes: startMinutes + (row.duration ?? 0),
        address: row.address ?? '',
      };
    });
  },

  async sendConfirmationEmail(input: SendConfirmationEmailInput) {
    const [appointment] = await db
      .select({ appointment_user_fk: appointments.appointment_user_fk })
      .from(appointments)
      .where(
        and(eq(appointments.appointment_pk, input.appointment_pk), notDeleted),
      )
      .limit(1);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const [user] = await db
      .select({
        user_first_name: users.user_first_name,
        user_email: users.user_email,
      })
      .from(users)
      .where(eq(users.user_pk, appointment.appointment_user_fk))
      .limit(1);

    const recipientEmail = input.user_email ?? user?.user_email;
    const recipientName = user?.user_first_name?.trim() || 'kunde';

    if (!recipientEmail) {
      throw new Error('No email address found for appointment user');
    }

    // Format date and time
    const [year, month, day] = input.appointment_date.split('-');
    const dateString = `${day}. ${getMonthName(parseInt(month ?? '1', 10))} ${year}`;
    const timeString = input.appointment_time.slice(0, 5);

    const mailTo = resolveMailRecipient(recipientEmail);
    const emailContent = `
<h2>Hej ${recipientName}</h2>
<p>Tak for din booking d. ${dateString} kl. ${timeString}.</p>
  Da jeg ikke har mulighed for hårvask, bedes du møde op med nyvasket hår.<br />
  <br />
  Du kan aflyse din tid senest 24 timer før. Ved senere aflysning kan der forekomme et betalingsgebyr.
</p>
    `;

    try {
      await transporter.sendMail({
        from: getMailFrom(),
        to: mailTo,
        subject: 'Bekræftelse på din frisørbooking',
        html: emailContent,
      });
      if (isMockEmailTransport) {
        console.warn(`[email] Booking confirmation sent to ${recipientEmail}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn('Failed to send confirmation email:', error.message);
      }
      throw error;
    }
  },
};

function getMonthName(monthNumber: number): string {
  const months = [
    'januar',
    'februar',
    'marts',
    'april',
    'maj',
    'juni',
    'juli',
    'august',
    'september',
    'oktober',
    'november',
    'december',
  ];
  return months[monthNumber - 1] ?? 'januar';
}
