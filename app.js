const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
var MySQLStore = require('express-mysql-session')(session);
const flash = require('connect-flash');
// const userRoutes = require('./routes/user/routes.js');
const blogRoutes = require('./routes/admin/blog.js')
const testimonialRoutes = require('./routes/admin/testimonial.js')
const bannerRoutes = require('./routes/admin/banner.js')
const latestNewsRoutes = require('./routes/admin/latestNews.js')
const upcomingEventsRoutes = require('./routes/admin/upcomingEvents')
const mediaRoutes = require('./routes/admin/media.js')
const findChapterRoutes = require('./routes/admin/findChapter.js')
const registeredUsersRoutes = require('./routes/admin/registeredUsers.js')
const loginRoutes = require('./routes/admin/login.js')
const eventsUsersRoutes = require('./routes/admin/eventsUsers.js')
const bodyParser = require('body-parser');
const hbs = require('hbs');
const methodOverride = require('method-override');
const port = process.env.PORT || 3005;

// const rootPath = path.join(__dirname, '../');

const app = express();

var options = {
    // host: 'localhost',
    // port: 3306,
    // user: 'root',
    // password: 'root',
    // database: 'tajurba',
    host : "sql10.freesqldatabase.com",
    user: "sql10606488",
    password: "AmHEigxuQp",
    database:"sql10606488",
    port : 3306,
};

var sessionConnection = mysql.createConnection(options);
var sessionStore = new MySQLStore({
    expiration: 10800000,
    createDatabaseTable: true,
    schema:{
        tableName: 'sessiontb1',
        columnNames: {
            session_id : 'session_id',
            expires: 'expires',
            data: 'data',
        }
    }
}, sessionConnection);

app.use(session({
    key: 'keyin',
    secret: 'iG29AC@3O0i&',
    store: sessionStore,
    resave: true,
    saveUninitialized: true
}));


app.set('view engine', 'hbs');
app.set('views', 'views');

// app.use(express.static(rootPath));
app.use(bodyParser.urlencoded({ extended: true }));

//  static things path
app.use('/static', express.static('public'));


hbs.registerPartials('views/partials');
app.use(methodOverride('_method'));



app.use(flash());

// app.use('/', userRoutes);
app.use('/admin',loginRoutes);
app.use('/admin/blogs', blogRoutes);
app.use('/admin/testimonials', testimonialRoutes);
app.use('/admin/banner', bannerRoutes);
app.use('/admin/latest-News', latestNewsRoutes);
app.use('/admin/upcoming-events', upcomingEventsRoutes);
app.use('/admin/media', mediaRoutes);
app.use('/admin/find-chapter', findChapterRoutes);
app.use('/admin/registered-users', registeredUsersRoutes);
app.use('/admin/events-users', eventsUsersRoutes);
 
 
hbs.registerHelper("incitement", function (inindex) {
    return inindex + 1
});

hbs.registerHelper('ifeq', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});

hbs.registerHelper('ifnoteq', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
});

app.listen(port, function () {
    console.log(`server started at ${port}`);
})


