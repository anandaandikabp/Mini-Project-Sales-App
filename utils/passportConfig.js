const LocalStrategy = require('passport-local').Strategy;
const pool = require('./db');
const bcrypt = require('bcrypt');

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        pool.query(`SELECT * FROM customer WHERE email = $1`, [email], (err, results) => {
            if (err) {
                throw err
            }
            console.log(results.rows);
        

        if (results.rows.length > 0) {
            const user = results.rows[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    throw err
                }
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "password salah" });
                }
            });
        } else {
            return done(null, false, { message: "email not register" });
        }
    })
    }

    passport.use(new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        authenticateUser
    )
    )
    passport.serializeUser((user, done) => done(null, user.cus_id));

    passport.deserializeUser((cus_id, done) => {
        pool.query(`SELECT * FROM customer WHERE cus_id = $1`, [cus_id], (err, results) => {
            if (err) {
                throw err
            }
            return done(null, results.rows[0]);
        })
    })
}

module.exports = initialize