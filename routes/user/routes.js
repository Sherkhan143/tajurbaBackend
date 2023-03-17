const express = require('express');
const router = express.Router();
const mysql = require('../../db/connection.js').con;
// const mysql = require('../../db/connection.js');
const nodeMailer = require('nodemailer');


router.get('/', (req, res) => {
    try {
        mysql.query("SELECT * FROM banners WHERE status = 1; SELECT * FROM latest_News WHERE status = 1; SELECT * FROM testimonial WHERE status = 1; SELECT id,DATE_FORMAT(event_date,'%M %d %Y')as event_date, title, event_image FROM upcoming_events WHERE status = 1; SELECT * FROM blogs WHERE status = 1", (err, results) => {
            if (err) {
                console.log(err);
            }
    
            else {
                var city = req.query.city;
                var state = req.query.state;
            
                console.log(city, state)
                if (city || state) {
                    mysql.query("SELECT *, DATE_FORMAT(chapter_date, '%d-%m-%Y') as date, DAYNAME(chapter_date) as day from find_chapters JOIN chapters_dates ON find_chapters.id = chapters_dates.chapter_id WHERE city LIKE  '%" + city + "%'", (err, cityResults) => {
                        if (err){
                            console.log(err) ;
                        }
                            
                        else {
                            if (cityResults.length < 1) {
                                mysql.query("SELECT * from find_chapters JOIN chapters_dates ON find_chapters.id = chapters_dates.chapter_id WHERE state LIKE  '%" + state + "%'", (err, stateResults) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        console.log(stateResults)
                                        res.render('index', { eventData: stateResults });
                                    }
                                });
                                console.log("cities not found")
                            }
                            else {
                                console.log(cityResults)
                                res.render('index', { eventData: cityResults, banners: results[0], news: results[1], testimonials: results[2], events: results[3], blogs: results[4] });
                            }
                        }
                    });
                }
    
                else {
                    res.render('index', { banners: results[0], news: results[1], testimonials: results[2], events: results[3], blogs: results[4] });
                    console.log(results)
                }
            }
        });
        // res.send("Wokring")
    } catch (error) {
        res.status(500).json(error);
    }
    
    // if (city || state) {
    //     mysql.query("SELECT *, DATE_FORMAT(chapter_date, '%d-%m-%Y') as date, DAYNAME(chapter_date) as day from find_chapters JOIN chapters_dates ON find_chapters.id = chapters_dates.chapter_id WHERE city LIKE  '%" + city + "%'", (err, cityResults) => {
    //         if (err) throw err;
    //         else {
    //             if (cityResults.length < 1) {
    //                 mysql.query("SELECT * from find_chapters JOIN chapters_dates ON find_chapters.id = chapters_dates.chapter_id WHERE state LIKE  '%" + state + "%'", (err, stateResults) => {
    //                     if (err) {
    //                         console.log(err);
    //                     }
    //                     else {
    //                         console.log(stateResults)
    //                         res.render('index', { eventData: stateResults });
    //                     }
    //                 });
    //                 console.log("cities not found")
    //             }
    //             else {
    //                 console.log(cityResults)
    //                 res.render('index', { eventData: cityResults });
    //             }
    //         }

    //     });
    // }

    // else{
    //     res.render('index')
    // }
});

router.get('/why-tajurba', (req, res) => {
    res.render('why-tajurba');
});

router.get('/lifeAtTajurba', (req, res) => {
    res.render('lifeAtTajurba');
});

router.get('/tajurba-history', (req, res) => {
    res.render('tajurba-history')
});

router.get('/about-us', (req, res) => {
    res.render('about-us')
});

router.get('/media', (req, res) => {
    try {
        mysql.query('SELECT * FROM media WHERE status = 1', (err, results) => {
            if (err) {
                console.log(err)
            }
    
            else {
                console.log(results);
                res.render('media', { media: results });
                // res.json(rows)
            }
        });
    } catch (error) {
        res.status(500).json(error)
    }
    
});

router.get('/media/:id', (req, res) => {

    const id = req.params.id

    try {
        mysql.query(`SELECT * FROM media WHERE id = "${id}" && status = 1 LIMIT 1 `, (err, results) => {
            if (err) {
                console.log(err);
            }
    
            else {
    
                if (results.length < 1) {
                    res.send("No media available")
                }
    
                else {
                    res.render('single-media', { media: results });
                }
    
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }

});

router.get('/news/:id', (req, res) => {

    const id = req.params.id

    try {
        mysql.query(`SELECT * FROM latest_News WHERE id = "${id}" && status = 1 LIMIT 1 `, (err, results) => {
            if (err) {
                console.log(err);
            }
    
            else {
    
                if (results.length < 1) {
                    res.send("No media available")
                }
    
                else {
                    res.render('single-news', { news: results });
                }
    
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }

});

router.get('/our-founders', (req, res) => {
    res.render('our-founders')
});
router.get('/core-team', (req, res) => {
    res.render('core-team')
});
router.get('/upcoming-events', (req, res) => {

    try {
        mysql.query("SELECT *, DAYOFMONTH(event_date) as dayOfMonth, DATE_FORMAT(event_date, '%b') as nameOfMonth FROM upcoming_events", (err, results) => {
            if (err) {
                console.log(err)
            }
    
            else {
                res.render('upcoming-events', { events: results })
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }

});



router.get('/event-participation/:id', (req, res) => {
    res.render('event-particape-form');
})
router.post('/event-participation/:id', (req, res) => {
    const event_id = req.params.id;
    const name = req.body.name;
    const email = req.body.email;
    const profession = req.body.profession;
    const phone = req.body.phone;

    console.log(event_id, name, email, profession, phone);
    // res.send("submitted")

    try {
        mysql.query(`SELECT *, DATE_FORMAT(event_date, '%Y-%m-%d') as date FROM upcoming_events WHERE id = ${event_id}`, (err, results) => {
            if (err) {
                console.log(err)
            }
            else {
    
                const title = results[0].title;
                const date = results[0].date;
    
                mysql.query("INSERT INTO events_users(name,email,profession,phone,event_name,event_date) VALUES('" + name + "', '" + email + "' , '" + profession + "' , '" + phone + "' , '" + title + "' , '" + date + "' )", (err, results) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        res.redirect('back')
                        console.log(results)
                    }
                })
                // console.log(results[0].title)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});


router.get('/past-events', (req, res) => {
    res.render('past-events')
});

router.get('/blog/:id', (req, res) => {

    const id = req.params.id;

    try {
        mysql.query(`SELECT * FROM blogs WHERE id = "${id}" && status = 1 LIMIT 1 `, (err, blogs) => {
            if (err) {
                console.log(err);
            }
    
            else {
    
                if (blogs.length < 1) {
                    res.send("No blog available")
                }
    
                mysql.query(`SELECT post_image FROM blogPosts WHERE post_id = "${id}"`, (err, postImages) => {
                    if (err) {
                        console.log(err);
                    }
    
                    else {
                        res.render('blog', { blogs, postImages });
                    }
                });
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/contact', (req, res) => {
    res.render('contact')
});
router.get('/member-program', (req, res) => {
    res.render('member-program')
});
router.get('/blogs', (req, res) => {

    try {
        mysql.query('SELECT * FROM blogs WHERE status = 1', (err, rows) => {
            if (err) {
                console.log("found error")
            }
    
            else {
                console.log(rows);
                res.render('blogs', { data: rows });
                // res.status(200).json(rows)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/findChapter', (req, res) => {

    var city = req.query.city;
    var state = req.query.state;
    // console.log(city, state)
    // console.log(req.query.searchCity)
    // mysql.query('SELECT chapter_venue from find_chapters WHERE chapter_venue LIKE  "%' + req.query.searchCity + '%"', (err, rows) => {
    //     if (err) throw err;
    // var data = [];
    // for (i = 0; i < rows.length; i++) {
    //     data.push(rows[i].country_name);
    // }

    // res.end(JSON.stringify(data));
    try {
        if (city || state) {
            mysql.query("SELECT *, DATE_FORMAT(chapter_date, '%d-%m-%Y') as date, DAYNAME(chapter_date) as day from find_chapters JOIN chapters_dates ON find_chapters.id = chapters_dates.chapter_id WHERE city LIKE  '%" + city + "%'", (err, cityResults) => {
                if (err){
                    // throw err;
                    console.log(err)
                } 
                else {
                    if (cityResults.length < 1) {
                        mysql.query("SELECT *, DATE_FORMAT(chapter_date, '%d-%m-%Y') as date, DAYNAME(chapter_date) as day from find_chapters JOIN chapters_dates ON find_chapters.id = chapters_dates.chapter_id WHERE state LIKE  '%" + state + "%'", (err, stateResults) => {
                            // mysql.query("SELECT id,title,chapter_venue, status, state, city, TIME_FORMAT(time, '%h:%i %p')as event_time from find_chapters WHERE state LIKE  '%" + state + "%', id, chapter_dates, chapter_id", (err, stateResults) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
    
                                console.log("state results ==========>", stateResults)
    
                                // if(stateResults.length < 1){
                                //     // res.render('findChapterNew', {})
                                //     res.send("No data available")
                                // }
    
                                // else{
                                //     // const stmt = `SELECT id, DATE_FORMAT(chapter_date, '%d %M %Y') as event_date, chapter_id, DAYNAME(chapter_date) as event_day FROM chapters_dates WHERE chapter_id IN ?`;
                                //     const stmt = `SELECT id, DATE_FORMAT(chapter_date, '%d %M %Y') as event_date, chapter_id, DAYNAME(chapter_date) as event_day FROM chapters_dates WHERE chapter_id IN ?`;
    
                                //     const IdValues=  [stateResults.map((item) => [item.id])];
    
                                //     console.log(IdValues)
    
                                //     mysql.query( stmt, [IdValues], (err, events) => {
                                //         if(err){
                                //             console.log(err)
                                //         }
                                //         else{
                                //             res.render('findChapterNew', { eventData: stateResults ,events : events});
                                //             // console.log("city==========> ", cityResults[0].id, "Dates========>", events);
                                //             console.log(stateResults)
                                //         }
                                //     });
                                // // console.log("state==========> ", stateResults, stateResults.map((item) => item.id));
    
    
    
                                // }
                                res.render('findChapterNew', { eventData: stateResults });
                            }
                        });
                        console.log("cities not found")
                    }
                    else {
                        // mysql.query("SELECT * from find_chapters JOIN chapters_dates ON find_chapters.id = chapters_dates.chapter_id WHERE state LIKE  '%" + city + "%'", (err, events) => {
                        //     // mysql.query(`SELECT id, DATE_FORMAT(chapter_date, '%d %M %Y') as event_date, chapter_id, DAYNAME(chapter_date) as event_day FROM chapters_dates WHERE chapter_id = ${cityResults[0].id} LIMIT 3`, (err, events) => {
                        //     if (err) {
                        //         console.log(err)
                        //     }
                        //     else {
                        //         // res.render('findChapterNew', { eventData: cityResults, eventDates : events });
                        //         // console.log("city==========> ", cityResults[0].id, "Dates========>", events);
                        console.log(cityResults)
                        res.render('findChapterNew', { eventData: cityResults });
    
                        //     }
                        // });
                    }
                }
    
            });
        }
        else {
            res.render('findChapterNew')
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// router.post('/findChapter', (req, res) => {
//     var city = req.body.city;
//     var state = req.body.state
//     console.log(city, state)
//      res.end()
// });

// router.post('/findChapter', (req, res) => {
//     var name = req.body.name;
//     var profession = req.body.profession;
//     var city = req.body.city;
//     var state = req.body.state;
//     var email = req.body.email;
//     var mobile = req.body.mobile;
//     var values = [
//        [ name, profession, city, state, email, mobile]
//     ]

//     console.log([values])

//     mysql.query('INSERT INTO chapter_visitors(name,profession,city,state,email,mobile) VALUES?', [values], (err, results) => {
//         if(err){
//             console.log(err)
//         }
//         else{
//             mysql.query(`SELECT city FROM chapter_visitors WHERE id=${results.insertId}`, (err, searchedCity) => {
//                 if(err){
//                 console.log(err)
//                 }
//                 else{
//                     mysql.query(`SELECT * FROM find_chapters WHERE chapter_venue = ${JSON.stringify(searchedCity[0].city)}`, (err, chapterData) => {
//                         if(err){
//                             console.log(err);
//                         }
//                         else{
//                             res.end('findChapter', {data : chapterData});
//                             console.log(chapterData);
//                         }
//                     })
//                     // res.end();
//                     // console.log("Got the result========>",searchedCity[0].city)
//                 }
//             })
//             // mysql.query('')
//             // res.end();
//             // console.log("insert id is here=========>",results.insertId)
//         }
//     })

//     // mysql.query(`SELECT * FROM find_chapters WHERE chapter_venue = 'Delhi'`, (err, chapterData) => {
//     //                         if(err){
//     //                             console.log(err);
//     //                         }
//     //                         else{
//     //                             res.end()
//     //                             console.log(chapterData);
//     //                         }
//     //                     })

//     // res.end()
//     // res.send({response : req.body.quote})
// })



router.post('/contact-form-process', (req, res) => {
    const name = req.body.pName;
    const email = req.body.pEmail;
    const phone = req.body.pPhone
    const message = req.body.pMessage;
    console.log(name, email, phone, message);

    let qry2 = "INSERT INTO contact_form_queries(email,name,phone,message) VALUES('" + name + "','" + email + "','" + phone + "', '" + message + "' )";

    try {
        mysql.query(qry2, (err, results) => {

            if (err) {
                console.log(err)
                // throw err;
            }
            res.redirect('/');
            console.log(results);
            console.log("Data submitted");
        });
    
        console.log("connection created..!!");
    
        // for email  start
        var transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'moin.uniworld@gmail.com',
                pass: 'spaslgiyezgzwuvp'
            }
        })
    
        var mailOptions = {
            from: 'moin.uniworld@gmail.com',
            to: 'req.body.email',
            cc: 'moin.uniworld@gmail.com',
            subject: 'Thanks for giving feedback ' + name,
            text: 'Thanks for your message ===> ' + message,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log("email send" + info.response)
            }
        });
    
        // for email end
    } catch (error) {
        res.status(500).json(error);
    }

    
});

// router.get('/contact', (req, res) => {
//     res.sendFile(rootPath + '/contact.html')
// });

router.post('/contact', (req, res) => {
    const name = req.body.pName;
    const subject = req.body.pSubject;
    // const phone = req.body.pPhone
    const message = req.body.message;
    console.log(name, subject, message)

    try {
        var transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'moin.uniworld@gmail.com',
                pass: 'spaslgiyezgzwuvp'
            }
        })
    
        var mailOptions = {
            from: 'moin.uniworld@gmail.com',
            to: 'req.body.email',
            cc: 'moin.uniworld@gmail.com',
            subject: 'Thanks for giving feedback ' + name,
            text: 'Thanks for your message ===> ' + message,
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            else {
                res.send("Thank You")
                console.log("email send" + info.response)
            }
        })
    } catch (error) {
        res.status(500).json(error);
    }

    
});


router.get('/participate-now/:id', (req, res) => {
    const eventId = req.params.id
    console.log(eventId)
    res.render('participateInChapter', { eventId: eventId })
});

router.post('/participate-now/:id', (req, res) => {

    const eventId = req.params.id;
    const name = req.body.name;
    const email = req.body.email;
    const profession = req.body.profession;
    const phone = req.body.phone;
    // console.log("fetched id =====>",eventId)

    try {
        mysql.query(`SELECT id, DATE_FORMAT(chapter_date, '%Y-%m-%d') as chapter_date, chapter_id FROM chapters_dates WHERE id = ${eventId} LIMIT 1`, (err, chapterDatesResults) => {
            if (err) {
                console.log(err)
            }
            else {
                var chapterId = chapterDatesResults[0].chapter_id;
                const event_date = chapterDatesResults[0].chapter_date;
                // console.log(newId)
                mysql.query(`SELECT * FROM find_chapters WHERE id = ${chapterId}`, (err, chapterDetails) => {
                    if (err) {
                        console.log(err)
                    }
    
                    else {
    
                        const event_title = chapterDetails[0].title;
                        // const event_date = chapterDetails[0].date;
                        const event_address = chapterDetails[0].chapter_venue;
                        const event_city = chapterDetails[0].city
    
                        console.log("user details========>", name, email, profession, phone, event_title, event_date, event_address, event_city)
    
                        const stmt = "INSERT INTO registered_users(name,email,profession,phone,event_title,event_date,event_address,city) VALUES ?";
    
                        const values = [name, email, profession, phone, event_title, event_date, event_address, event_city]
                        mysql.query("INSERT INTO registered_users(name,email,profession,phone,event_title,event_date,event_address,city) VALUES('" + name + "','" + email + "','" + profession + "','" + phone + "','" + event_title + "','" + event_date + "','" + event_address + "','" + event_city + "') ", (err, results) => {
                            if (err) {
                                console.log(err)
                            }
                            else {
                                res.redirect('/findChapter')
                                console.log(results)
                            }
                        });
    
                        // console.log(chapterDetails)
                    }
                })
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
    // res.render('participateInChapter')
});


module.exports = router;