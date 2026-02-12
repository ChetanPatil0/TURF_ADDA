// src/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../features/auth/auth.model.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user by email
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // New user – auto signup
          user = new User({
            firstName: profile.name.givenName || null,
            middleName: null,
            lastName: profile.name.familyName || null,
            email: profile.emails[0].value,
            role: 'player', // default role
            isVerifiedEmail: true,
            profileImage: profile.photos?.[0]?.value || null,
            googleId: profile.id, // optional – store for future reference
          });

          await user.save();
        } else {
          // Existing user – update profile image if missing
          if (!user.profileImage && profile.photos?.[0]?.value) {
            user.profileImage = profile.photos[0].value;
            await user.save();
          }
        }

        // Success – pass user to Passport
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user to session (store only the user ID)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session (fetch full user from DB)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ id });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;