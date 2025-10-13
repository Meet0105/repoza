import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { connectToDatabase } from '../../../backend/mongodb';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                const client = await connectToDatabase();
                if (!client) return true; // Allow sign in even if DB fails

                const db = client.db();
                const usersCollection = db.collection('users');

                // Check if user exists
                const existingUser = await usersCollection.findOne({ email: user.email });

                if (existingUser) {
                    // Update last login
                    await usersCollection.updateOne(
                        { email: user.email },
                        {
                            $set: {
                                lastLogin: new Date(),
                                name: user.name,
                                image: user.image,
                            },
                        }
                    );
                } else {
                    // Create new user
                    await usersCollection.insertOne({
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        provider: account?.provider || 'unknown',
                        createdAt: new Date(),
                        lastLogin: new Date(),
                    });
                }

                return true;
            } catch (error) {
                console.error('Error in signIn callback:', error);
                return true; // Allow sign in even if DB operation fails
            }
        },
        async jwt({ token, user, account }) {
            // Add user info to token on first sign in
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }
            if (account) {
                token.provider = account.provider;
                // Store GitHub access token for deployments
                if (account.provider === 'github' && account.access_token) {
                    token.accessToken = account.access_token;
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Add user info to session
            if (session.user) {
                (session.user as any).id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;
                (session.user as any).provider = token.provider;
                // Add access token to session for deployments
                (session as any).accessToken = token.accessToken;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
