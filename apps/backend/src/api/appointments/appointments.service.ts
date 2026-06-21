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
  services,
  users,
  asc,
} from '@repo/db';
import {
  type Appointment,
  type AppointmentLocation,
  type AppointmentServiceLine,
  type AppointmentWithServices,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
  type SendConfirmationEmailInput,
  parseAppointment,
} from '@repo/shared';
import {
  getMailFrom,
  isMockEmailTransport,
  resolveMailRecipient,
  sendMail,
} from '../../utils/mailer';

type AppointmentRow = InferSelectModel<typeof appointments>;
type AppointmentCanceller = 'admin' | 'client';

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
  });
}

const notDeleted = isNull(appointments.appointment_deleted_at);

async function fetchServicesByUserId(
  userId: string,
): Promise<Map<string, AppointmentServiceLine[]>> {
  const byAppointment = new Map<string, AppointmentServiceLine[]>();

  const rows = await db
    .select({
      appointment_fk: appointmentServices.appointment_fk,
      quantity: appointmentServices.quantity,
      service_pk: services.service_pk,
      service_title: services.service_title,
      service_description: services.service_description,
      service_duration: services.service_duration,
      service_price: services.service_price,
    })
    .from(appointmentServices)
    .innerJoin(
      appointments,
      eq(appointmentServices.appointment_fk, appointments.appointment_pk),
    )
    .innerJoin(
      services,
      eq(appointmentServices.service_fk, services.service_pk),
    )
    .where(
      and(
        eq(appointments.appointment_user_fk, userId),
        notDeleted,
        isNull(services.service_deleted_at),
      ),
    );

  for (const row of rows) {
    const line: AppointmentServiceLine = {
      service_fk: row.service_pk,
      quantity: row.quantity,
      service_title: row.service_title,
      service_description: row.service_description,
      service_duration: row.service_duration,
      service_price: String(row.service_price),
    };
    const existing = byAppointment.get(row.appointment_fk) ?? [];
    existing.push(line);
    byAppointment.set(row.appointment_fk, existing);
  }

  return byAppointment;
}

function locationFromJoin(row: {
  location_pk: string | null;
  location_address: string | null;
  location_postal_code: string | null;
  location_city: string | null;
  location_country: string | null;
}): AppointmentLocation | null {
  if (!row.location_pk || !row.location_address || !row.location_city) {
    return null;
  }

  return {
    location_pk: row.location_pk,
    location_address: row.location_address,
    location_postal_code: row.location_postal_code,
    location_city: row.location_city,
    location_country: row.location_country,
  };
}

export const appointmentsService = {
  async list() {
    const rows = await db.select().from(appointments).where(notDeleted);
    return rows.map(appointmentFromRow);
  },

  async listByUserId(id: string): Promise<AppointmentWithServices[]> {
    const rows = await db
      .select({
        appointment: appointments,
        location_pk: locations.location_pk,
        location_address: locations.location_address,
        location_postal_code: locations.location_postal_code,
        location_city: locations.location_city,
        location_country: locations.location_country,
      })
      .from(appointments)
      .leftJoin(
        locations,
        and(
          eq(appointments.location_fk, locations.location_pk),
          isNull(locations.location_deleted_at),
        ),
      )
      .where(and(eq(appointments.appointment_user_fk, id), notDeleted))
      .orderBy(
        asc(appointments.appointment_date),
        asc(appointments.appointment_time),
      );
    const servicesByAppointment = await fetchServicesByUserId(id);
    return rows.map((row) => ({
      ...appointmentFromRow(row.appointment),
      services: servicesByAppointment.get(row.appointment.appointment_pk) ?? [],
      location: locationFromJoin(row),
    }));
  },

  async get(id: string): Promise<AppointmentWithServices | undefined> {
    const [row] = await db
      .select({
        appointment: appointments,
        location_pk: locations.location_pk,
        location_address: locations.location_address,
        location_postal_code: locations.location_postal_code,
        location_city: locations.location_city,
        location_country: locations.location_country,
      })
      .from(appointments)
      .leftJoin(
        locations,
        and(
          eq(appointments.location_fk, locations.location_pk),
          isNull(locations.location_deleted_at),
        ),
      )
      .where(and(eq(appointments.appointment_pk, id), notDeleted))
      .limit(1);

    if (!row) return undefined;

    const [serviceRows] = await Promise.all([
      db
        .select({
          quantity: appointmentServices.quantity,
          service_fk: services.service_pk,
          service_title: services.service_title,
          service_description: services.service_description,
          service_duration: services.service_duration,
          service_price: services.service_price,
        })
        .from(appointmentServices)
        .innerJoin(
          services,
          eq(appointmentServices.service_fk, services.service_pk),
        )
        .where(
          and(
            eq(appointmentServices.appointment_fk, id),
            isNull(services.service_deleted_at),
          ),
        ),
    ]);

    const serviceLines: AppointmentServiceLine[] = serviceRows.map((s) => ({
      service_fk: s.service_fk,
      quantity: s.quantity,
      service_title: s.service_title,
      service_description: s.service_description,
      service_duration: s.service_duration,
      service_price: String(s.service_price),
    }));

    return {
      ...appointmentFromRow(row.appointment),
      services: serviceLines,
      location: locationFromJoin(row),
    };
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
        appointment_status: 'confirmed',
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

  async patch(
    id: string,
    input: UpdateAppointmentInput,
    cancelledBy: AppointmentCanceller = 'client',
  ) {
    const updateData = {
      ...input,
      appointment_updated_at: new Date(),
      ...(input.appointment_status === 'cancelled'
        ? { appointment_deleted_at: new Date() }
        : {}),
    };

    const [row] = await db
      .update(appointments)
      .set(updateData)
      .where(and(eq(appointments.appointment_pk, id), notDeleted))
      .returning();

    if (!row) {
      return undefined;
    }

    if (input.appointment_status === 'cancelled') {
      try {
        await sendAppointmentCancellationEmail(row, cancelledBy);
      } catch (error) {
        if (error instanceof Error) {
          console.warn('Failed to send cancellation email:', error.message);
        }
      }
    }

    return appointmentFromRow(row);
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
      await sendMail({
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

function formatAppointmentDateString(date: string | Date): string {
  const wireDate = toWireDate(date);
  const [year, month, day] = wireDate.split('-');
  return `${day}. ${getMonthName(parseInt(month ?? '1', 10))} ${year}`;
}

async function getAdminRecipientEmail(): Promise<string | null> {
  const [admin] = await db
    .select({ user_email: users.user_email })
    .from(users)
    .where(and(eq(users.user_role, 'admin'), isNull(users.user_deleted_at)))
    .limit(1);

  return admin?.user_email ?? null;
}

async function getAppointmentUserEmailAndName(
  userId: string,
): Promise<{ email: string | null; name: string }> {
  const [user] = await db
    .select({
      user_first_name: users.user_first_name,
      user_last_name: users.user_last_name,
      user_email: users.user_email,
    })
    .from(users)
    .where(eq(users.user_pk, userId))
    .limit(1);

  const name = user?.user_first_name?.trim()
    ? `${user.user_first_name} ${user.user_last_name ?? ''}`.trim()
    : 'kunde';

  return { email: user?.user_email ?? null, name };
}

async function sendAppointmentCancellationEmail(
  appointment: AppointmentRow,
  cancelledBy: AppointmentCanceller,
): Promise<void> {
  const dateString = formatAppointmentDateString(appointment.appointment_date);
  const timeString = toWireTime(appointment.appointment_time).slice(0, 5);

  if (cancelledBy === 'admin') {
    const { email, name } = await getAppointmentUserEmailAndName(
      appointment.appointment_user_fk,
    );

    if (!email) {
      console.warn(
        'Appointment cancellation email skipped: user email not found',
      );
      return;
    }

    const mailTo = resolveMailRecipient(email);
    const emailContent = `
<h2>Hej ${name}</h2>
<p>Your appointment on ${dateString} at ${timeString} has been cancelled.</p>
<p>Please book a new appointment at a different time.</p>
`;

    await sendMail({
      from: getMailFrom(),
      to: mailTo,
      subject: 'Your appointment has been cancelled',
      html: emailContent,
    });

    if (isMockEmailTransport) {
      console.warn(`[email] Cancellation notice sent to client ${email}`);
    }
    return;
  }

  const adminEmail = await getAdminRecipientEmail();
  if (!adminEmail) {
    console.warn(
      'Appointment cancellation email skipped: admin email not found',
    );
    return;
  }

  const { name } = await getAppointmentUserEmailAndName(
    appointment.appointment_user_fk,
  );
  const mailTo = resolveMailRecipient(adminEmail);
  const emailContent = `
<h2>Hi</h2>
<p>The appointment for ${name} on ${dateString} at ${timeString} has been cancelled by the client.</p>
`;

  await sendMail({
    from: getMailFrom(),
    to: mailTo,
    subject: 'Appointment cancelled',
    html: emailContent,
  });

  if (isMockEmailTransport) {
    console.warn(`[email] Cancellation notice sent to admin ${adminEmail}`);
  }
}
