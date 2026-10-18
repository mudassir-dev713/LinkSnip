import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { loginSchema } from '@/schema/loginSchema';
import { dbConnect } from '@/lib/dbConnect';
import { checkRateLimit } from '@/lib/rateLimit';
import { cookies } from 'next/headers';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error(parsed.error.errors[0].message); // Send first validation error
        }
        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase().trim();

        // Brute-force guard: per-IP+email attempt window. Throws a generic
        // error so it blends in with wrong-credential failures.
        const rl = await checkRateLimit({
          identity: `login:${email}`,
          key: 'login-attempts',
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
        if (!rl.allowed) {
          throw new Error('Too many login attempts. Please try again later.');
        }

        await dbConnect();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
          throw new Error('Email or Password is Incorrect');
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email before logging in.');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error('Email or Password is Incorrect');
        }

        // Merge the anonymous session into the account: drop the anonId so
        // the dashboard only shows the user's own links after signing in.
        const cookieStore = await cookies();
        cookieStore.delete('anonId');

        // Remove sensitive info
        const { password: _, verificationToken, resetPasswordToken, __v, ...userWithoutPassword } = user.toObject();

        return userWithoutPassword;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Note: don't override `cookies.sessionToken` here — a partial override
  // drops the default cookie name and NextAuth then writes a cookie literally
  // called "undefined". NextAuth v4 defaults already set httpOnly + sameSite
  // and enable `secure` for https URLs.
  callbacks: {
    async jwt({ token, user, trigger, newSession }) {
      if (user) {
        token.user = {
          id: user._id?.toString() || user.id, // handle both Mongoose and plain object cases
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
        };
      }
      // Client-triggered refresh (useSession().update) after profile edits.
      if (trigger === 'update' && newSession?.user) {
        if (newSession.user.username) token.user.username = newSession.user.username;
        if (newSession.user.email) token.user.email = newSession.user.email;
        if (typeof newSession.user.isVerified === 'boolean') {
          token.user.isVerified = newSession.user.isVerified;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in', // optional: custom login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};
