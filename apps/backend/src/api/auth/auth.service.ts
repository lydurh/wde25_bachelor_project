import { and, db, eq, isNotNull, isNull, users } from '@repo/db';
import type { LoginInput, SignupInput, User } from '@repo/shared';
import { toPublicUser } from '@repo/shared';
import { locationsService } from '../locations/locations.service';
import { transporter } from '../../utils/mailer';

const verificationTokens = new Map<string, string>();
const resetPasswordTokens = new Map<string, string>();

export const authService = {
  list() {
    return db.select().from(users).where(isNull(users.user_deleted_at));
  },

  async getById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.user_pk, id))
      .limit(1);

    return user;
  },

  async signup(
    input: SignupInput,
  ): Promise<{ user: User; token: string } | null> {
    const {
      first_name,
      last_name,
      email,
      password,
      address,
      postal_code,
      city,
    } = input;
    const [existing] = await db
      .select({ pk: users.user_pk })
      .from(users)
      .where(eq(users.user_email, email))
      .limit(1);

    if (existing) {
      return null;
    }

    const location = await locationsService.create({
      location_address: address,
      location_postal_code: postal_code,
      location_city: city,
      location_country: 'Denmark',
    });

    if (!location) {
      throw new Error('Location insert failed');
    }

    const hashedPassword = await Bun.password.hash(password);

    const [row] = await db
      .insert(users)
      .values({
        user_email: email,
        user_first_name: first_name,
        user_last_name: last_name || '',
        user_password: hashedPassword,
        user_location_fk: location.location_pk,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create user');
    }

    const token = crypto.randomUUID();

    verificationTokens.set(token, row.user_pk);

    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({
      from: process.env['EMAIL_USER'] ?? '',
      to: process.env['EMAIL_USER'] ?? '',
      subject: 'Verify your account',
      html: `
<h2>Hello ${email}</h2>
 
        <p>
          Please verify your account by clicking the link below:
</p>
 
        <a href="${verificationLink}">
          Verify Account
</a>
      `,
    });

    return {
      user: toPublicUser(row),
      token,
    };
  },

  async login(input: LoginInput): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.user_email, input.email),
          isNotNull(users.user_verified_at),
          isNull(users.user_deleted_at),
        ),
      )
      .limit(1);

    if (!row) return null;

    const isValid = await Bun.password.verify(
      input.password,
      row.user_password,
    );
    if (!isValid) return null;

    return toPublicUser(row);
  },

  logout(): boolean {
    return true;
  },

  async verifyEmail(token: string): Promise<User | null> {
    const userId = verificationTokens.get(token);

    if (!userId) {
      return null;
    }

    const [updated] = await db
      .update(users)
      .set({ user_verified_at: new Date() })
      .where(and(eq(users.user_pk, userId), isNull(users.user_deleted_at)))
      .returning();

    if (!updated) {
      verificationTokens.delete(token);
      return null;
    }

    verificationTokens.delete(token);

    return toPublicUser(updated);
  },

  async forgotPassword(email: string): Promise<string | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.user_email, email),
          isNotNull(users.user_verified_at),
          isNull(users.user_deleted_at),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    const token = crypto.randomUUID();
    resetPasswordTokens.set(token, row.user_pk);

    return token;
  },

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const userId = resetPasswordTokens.get(token);

    if (!userId) {
      return false;
    }

    const hashedPassword = await Bun.password.hash(newPassword);

    const [updated] = await db
      .update(users)
      .set({
        user_password: hashedPassword,
        user_updated_at: new Date(),
      })
      .where(and(eq(users.user_pk, userId), isNull(users.user_deleted_at)))
      .returning();

    if (!updated) {
      resetPasswordTokens.delete(token);
      return false;
    }

    resetPasswordTokens.delete(token);

    return true;
  },
};
