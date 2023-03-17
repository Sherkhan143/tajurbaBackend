const express = require('express');
const router = express.Router();
// const mysql = require('../../db/connection.js');
const mysql = require('../../db/connection.js').con;

const multer = require('multer');
const path = require('path');

const rootPath = path.join(__dirname, '../../');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${rootPath}/public/user/images/uploaded_images`)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });


router.get('/', (req, res) => {

    try {
        if (req.session.loggedin) {
            mysql.query("SELECT id,DATE_FORMAT(event_date,'%M %d %Y')as event_date, title, event_image FROM upcoming_events ", (err, results) => {
                if (err) {
                    console.log(err)
                }

                else {
                    res.render('admin-upcoming-events', { events: results, success: req.flash('success') });
                    console.log("results===========>", results)
                }
            });
        }
        else {
            res.redirect('/admin')
        }
    } catch (error) {
        res.status(500).json(error);
    }

});

router.get('/add-event', (req, res) => {

    try {
        if (req.session.loggedin) {
            res.render('admin-add-event')
        }
        else {
            res.redirect('/admin')
        }
    } catch (error) {
        res.status(500).json(error);
    }

});

router.post('/add-event', upload.single('eventImg'), (req, res) => {

    const title = req.body.title;
    const eventDate = req.body.eventDate;
    const status = req.body.publishBtn == null ? '0' : '1';

    try {
        let query = "INSERT INTO upcoming_events(title,event_date,event_image,status) VALUES('" + title + "','" + eventDate + "','" + req.file.originalname + "', '" + status + "' )";

        mysql.query(query, (err, results) => {
            if (err) {
                console.log(err);
            }

            else {
                req.flash('success', 'Event has been added successfully!')
                res.redirect('/admin/upcoming-events');
                console.log(results)
            }
        });

    } catch (error) {
        res.status(500).json(error);
    }

});


router.get('/delete/:id', (req, res) => {

    const id = req.params.id;

    try {
        mysql.query(`DELETE FROM upcoming_events WHERE id = ${id}`, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Event has been deleted successfully!')
                res.redirect('back');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }

});

router.delete('/multiDelete', (req, res) => {

    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `DELETE FROM upcoming_events WHERE id = ? ` : `DELETE FROM upcoming_events WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Event has been deleted successfully!')
                res.redirect('/admin/upcoming-events');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }

});


router.put('/multiPublish', (req, res) => {

    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE upcoming_events SET status = 1 WHERE id = ?` : `UPDATE upcoming_events SET status = 1 WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Event has been published successfully!')
                res.redirect('/admin/upcoming-events');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }

});


router.put('/multiUnPublish', (req, res) => {
    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE upcoming_events SET status = 0 WHERE id = ?` : `UPDATE upcoming_events SET status = 0 WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Event has been unpublished successfully!')
                res.redirect('/admin/upcoming-events');
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
        mysql.query(`SELECT *, DATE_FORMAT(event_date, '%Y-%m-%d') as date FROM upcoming_events WHERE id = ${id} LIMIT 1`, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                res.render('admin-update-event', { event: results })
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }


});

router.put('/edit/:id', upload.single('updateEventImg'), (req, res) => {

    const id = req.params.id;
    const title = req.body.title;
    const eventDate = req.body.eventDate;
    const status = req.body.publishBtn == null ? '0' : '1';

    if (req.file == undefined) {
        var statement = `UPDATE upcoming_events SET title = ?, event_date = ?, status = ? WHERE id = ${id}`;
        var values = [title, eventDate, status]
    }

    else {
        var statement = `UPDATE upcoming_events SET title = ?, event_date = ?, event_image = ?, status = ? WHERE id = ${id}`;
        var values = [title, eventDate, req.file.originalname, status];
    }

    try {
        mysql.query(statement, values, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Event has been updated successfully!')
                res.redirect('/admin/upcoming-events/');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }

});


module.exports = router;