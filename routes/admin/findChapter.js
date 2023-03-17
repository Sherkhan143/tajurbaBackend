const express = require('express');
const router = express.Router();
// const mysql = require('../../db/connection.js');
const mysql = require('../../db/connection.js').con;

// const multer = require('multer');
// const path = require('path');

// const rootPath = path.join(__dirname, '../../');


router.get('/', (req, res) => {

    try {
        if (req.session.loggedin) {
            mysql.query("SELECT id, title, chapter_venue, status, city, state, time FROM find_chapters", (err, results) => {
                if (err) {
                    console.log(err)
                }

                else {
                    res.render('admin-find-chapter', { news: results, success: req.flash('success') });
                    console.log(results)
                }
            });
        }
        else {
            res.redirect('/admin');
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/add-chapter', (req, res) => {
    if (req.session.loggedin) {
        res.render('admin-add-chapter');
    }
    else {
        res.redirect('/admin');
    }
});

router.post('/add-chapter', (req, res) => {

    const title = req.body.title;
    const venue = req.body.venue;
    const date = req.body.date;
    const city = req.body.city;
    const state = req.body.state;
    const time = req.body.time;
    const status = req.body.publishBtn == null ? '0' : '1';


    try {
        let query = "INSERT INTO find_chapters(title,chapter_venue,status,city,state,time) VALUES('" + title + "','" + venue + "','" + status + "' ,'" + city + "','" + state + "','" + time + "')";

        mysql.query(query, (err, results) => {
            if (err) {
                console.log(err);
            }

            else {

                if (typeof date == 'string') {
                    var stmt = "INSERT INTO chapters_dates(chapter_date, chapter_id) VALUES ('" + date + "','" + results.insertId + "') ";
                    // var value = [date, "12"];

                    mysql.query(stmt, (err, results) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            req.flash('success', 'Chapter has been added successfully!')
                            res.redirect('/admin/find-chapter')
                            console.log(results)
                        }
                    });
                }

                else {
                    stmt = `INSERT INTO chapters_dates(chapter_date, chapter_id) VALUES ?`;
                    value =
                        [date.map(item => {
                            const dateArray = [item];
                            dateArray.push(results.insertId);
                            return dateArray;
                        }),
                        ];

                    mysql.query(stmt, value, (err, results) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            req.flash('success', 'Chapter has been added successfully!')
                            res.redirect('/admin/find-chapter')
                            console.log(results)
                        }
                    });
                }
            }
        });

    } catch (err) {
        res.status(500).json(err);
    }

});

router.get('/delete/:id', (req, res) => {

    const id = req.params.id;

    try {
        mysql.query(`DELETE FROM find_chapters WHERE id = ${id}`, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Chapter has been deleted successfully!')
                res.redirect('back');
                console.log(results);
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});


router.delete('/multiDelete', (req, res) => {

    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `DELETE FROM find_chapters WHERE id = ? ` : `DELETE FROM find_chapters WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Chapter has been deleted successfully!')
                res.redirect('/admin/find-chapter');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});


router.put('/multiPublish', (req, res) => {

    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE find_chapters SET status = 1 WHERE id = ?` : `UPDATE find_chapters SET status = 1 WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Chapter has been published successfully!')
                res.redirect('back');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});


router.put('/multiUnPublish', (req, res) => {
    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE find_chapters SET status = 0 WHERE id = ?` : `UPDATE find_chapters SET status = 0 WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }
    
            else {
                req.flash('success', 'Chapter has been unpublished successfully!')
                res.redirect('back');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});


router.get('/edit/:id', (req, res) => {

    const id = req.params.id;

    try {
        mysql.query(`SELECT * FROM find_chapters WHERE id = ${id} LIMIT 1`, (err, results) => {
            if (err) {
                console.log(err)
            }
    
            else {
                mysql.query(`SELECT DATE_FORMAT(chapter_date, '%Y-%m-%d') as chapter_date  FROM chapters_dates WHERE chapter_id = ${id}`, (err, chapterDates) => {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        res.render('admin-update-chapter', { chapter: results, chapter_date: chapterDates })
                        console.log(chapterDates);
                    }
                })
    
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }

    
});

router.put('/edit/:id', (req, res) => {

    const id = req.params.id;
    const title = req.body.title;
    const venue = req.body.venue;
    const date = req.body.date;
    const city = req.body.city;
    const state = req.body.state;
    const time = req.body.time;
    const status = req.body.publishBtn == null ? '0' : '1';

    console.log(date)

    // if(req.file == undefined){
    var statement = `UPDATE find_chapters SET title = ? ,chapter_venue =?, status = ?, city =?, state =?, time =? WHERE id = ${id}`;
    var values = [title, venue, status, city, state, time];
    // }

    // else{
    //     var statement = `UPDATE find_chapters SET title = ?, description = ?, news_image = ?, status = ? WHERE id = ${id}`;
    //     var values = [title, desc, status];
    // }

    try {
        mysql.query(statement, values, (err, results) => {
            if (err) {
                console.log(err)
            }
            else {
                var stmt = `UPDATE chapters_dates SET chapter_date = ? WHERE id = ${id}`;
                var value = date;
    
                mysql.query(stmt, value, (err, results) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        req.flash('success', 'Chapter has been updated successfully!')
                        res.redirect('/admin/find-chapter')
                        console.log(results)
                    }
                });
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});


module.exports = router;