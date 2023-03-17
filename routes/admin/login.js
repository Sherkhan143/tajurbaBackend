const express = require('express');
const router = express.Router();
// const mysql = require('../../db/connection.js');
const mysql = require('../../db/connection.js').con;
// const session = require('express-session');
const path = require('path');


const app = express();

router.get('/', (req, res) => {

    try {
        if (req.session.loggedin) {

            mysql.query("SELECT COUNT(id) as numOfBlogs from blogs", (err, results) => {
                if(err){
                    console.log(err);
                }
                else{
                    console.log("blogs number============>",results);
                    res.render('admin');
                }
            });
        }
        else{
            res.render('admin-login');
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/dashboard', (request, response) => {

    try {
        if (request.session.loggedin) {
            const blogs = "SELECT COUNT(id) as numOfBlogs from blogs";
            const testimonial = "SELECT COUNT(id) as numOftestimonial from testimonial";
            const banner = "SELECT COUNT(id) as numOfbanner from banners";
            const latestNews = "SELECT COUNT(id) as numOfLatestNews from latest_News";
            const upcomingEvent = "SELECT COUNT(id) as numOfUpcomingEvent from upcoming_events";
            const media = "SELECT COUNT(id) as numOfMedia from media";
            const findChapter = "SELECT COUNT(id) as numOfFindChapter from find_chapters";
            const registeredUser = "SELECT COUNT(id) as numOfRegisteredUser from registered_users";
            const eventUser = "SELECT COUNT(id) as numOfEventUser from events_users";
    
            mysql.query(`${blogs}; ${testimonial}; ${banner}; ${latestNews}; ${upcomingEvent}; ${media}; ${findChapter}; ${registeredUser}; ${eventUser};`, (err, results) => {
                if(err){
                    console.log(err);
                }
                else{
                   var output =  {
                    blogNum : results[0][0].numOfBlogs,
                    testiNum : results[1][0].numOftestimonial,
                    bannerNum : results[2][0].numOfbanner,
                    latestNewsNum : results[3][0].numOfLatestNews,
                    upcomingEventNum : results[4][0].numOfUpcomingEvent,
                    mediaNum : results[5][0].numOfMedia,
                    findChapterNum : results[6][0].numOfFindChapter,
                    registeredUserNum : results[7][0].numOfRegisteredUser,
                    eventUserNum : results[8][0].numOfEventUser,
                }
                    console.log("blogs number============>",output);
                    console.log("blogs number============>",results);
                    response.render('admin', {dataCount : output})
                }
            })
        } else {
            // 	// Not logged in
            response.redirect('/admin');
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/auth', (request, response) => {

    let email = request.body.email;
    let password = request.body.password;

    console.log(email, password);

    try {
        if (email && password) {
            // Execute SQL query that'll select the account from the database based on the specified username and password
            mysql.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password], function (error, results) {
                // If there is an issue with the query, output the error
                if (error){
                    // throw error;
                    console.log(error)
                } 
                // If the account exists
                if (results.length > 0) {
                    // Authenticate the user
                    request.session.loggedin = true;
                    request.session.email = email;
                    // Redirect to home page
                    response.redirect('/admin/dashboard');
                } else {
                    response.render('admin-login');
                }
                response.end();
            });
        } else {
            response.send('<alert>Please enter Username and Password!</alert>');
            response.end();
        }
    } catch (error) {
        res.status(500).json(error);
    }
});


router.get('/logout', (req, res) => {

    try {
        req.session.destroy(function(err) {
            // cannot access session here
            if(err){
            res.redirect('/admin')
            }
            res.redirect('/admin')
          });
    } catch (error) {
        res.status(500).json(error);
    }
    
});




module.exports = router;