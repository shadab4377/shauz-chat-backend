// const {v4:uuidv4} = require('uuid');
// const { User } = require('./User.js');
// const bcrypt = require('bcrypt');

// function configure(passport,LocalStrategy) {
//     console.log('Configuring Passport...');
//     passport.use(
//         new LocalStrategy(async (username, password, done) => {
//           try {
//             console.log('Authenticating user...');
//             const user = await User.findOne({ username });
//             if (!user) return done(null, false, { message: 'Incorrect username.' });
      
//             const isPasswordValid = await bcrypt.compare(password, user.password);
//             if (!isPasswordValid) return done(null, false, { message: 'Incorrect password.' });
      
//             return done(null, user);
//           } catch (err) {
//             return done(err);
//           }
//         })
//       );
      
//   }

// function setSessionManagement(app,session){
//     console.log('Setting up session management...');
// app.use(
//     session({
//       secret: uuidv4(), // Replace with a long random string
//       resave: false,
//       saveUninitialized: false,
//     })
//   );
// }

// function setUpSession(app,passport){
//     console.log('Setting up session...');
// app.use(passport.session());

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id, (err, user) => {
//     done(err, user);
//   });
// });
// app.use((req, res, next) => {
//     console.log('Received request:', req.method, req.url);
//     next();
//   });
// }

// module.exports = { setSessionManagement,setUpSession,configure};