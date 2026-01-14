const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { findOrCreateOAuthUser } = require('../services/userService');

function configurePassport() {
    // Google OAuth Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
        }, (accessToken, refreshToken, profile, done) => {
            try {
                const user = findOrCreateOAuthUser(
                    'google',
                    profile.id,
                    profile.emails?.[0]?.value,
                    profile.displayName,
                    profile.photos?.[0]?.value
                );
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }));
    }

    // GitHub OAuth Strategy
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        passport.use(new GitHubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
            scope: ['user:email']
        }, (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const user = findOrCreateOAuthUser(
                    'github',
                    profile.id,
                    email,
                    profile.displayName || profile.username,
                    profile.photos?.[0]?.value
                );
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }));
    }

    // Serialize user for session (used during OAuth flow)
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        const { getUserById } = require('../services/userService');
        const user = getUserById(id);
        done(null, user);
    });
}

module.exports = { configurePassport };
