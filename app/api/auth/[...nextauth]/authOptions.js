import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { loginSchema } from '@/schema/loginSchema';
import { dbConnect } from '@/lib/dbConnect';
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
        await dbConnect();
        const { email, password } = parsed.data;

        const user = await User.findOne({ email });

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
        const cookieStore = await cookies();
        cookieStore.delete('anonId');
        // Remove sensitive info
        const { password: _, ...userWithoutPassword } = user.toObject();

        return userWithoutPassword;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  events: {
    async signOut() {
      // Clear cookies explicitly
      const cookies = ['next-auth.session-token', 'next-auth.csrf-token'];
      cookies.forEach((cookie) => {
        if (typeof window !== 'undefined') {
          document.cookie = `${cookie}=; Max-Age=0; path=/`;
        }
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user._id?.toString() || user.id, // handle both Mongoose and plain object cases
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
        };
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
