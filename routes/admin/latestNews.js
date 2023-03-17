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
})

const upload = multer({ storage: storage });



router.get('/', (req, res) => {

    try {
        if (req.session.loggedin) {
            mysql.query("SELECT * FROM latest_News", (err, results) => {
                if (err) {
                    console.log(err)
                }

                else {
                    res.render('admin-latest-news', { news: results, success: req.flash('success') });
                    console.log(results)
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

router.get('/add-news', (req, res) => {
    try {
        if (req.session.loggedin) {
            res.render('admin-add-news')
        }
        else {
            res.redirect('/admin')
        }
    } catch (error) {
        res.status(500).json(error);
    }

});

router.post('/add-news', upload.single('newsImg'), (req, res) => {

    const title = req.body.title;
    const desc = req.body.description;
    const status = req.body.publishBtn == null ? '0' : '1';


    console.log(title, desc, req.file.originalname, status)

    try {
        let query = "INSERT INTO latest_News(title,description,news_image,status) VALUES('" + title + "','" + desc + "','" + req.file.originalname + "', '" + status + "' )";

        mysql.query(query, (err, results) => {
            if (err) {
                console.log(err);
            }

            else {
                req.flash('success', 'News has been added successfully!')
                res.redirect('/admin/latest-news');
                console.log(results)
            }
        });

    } catch (err) {
        res.status(500).json(err);
    }

});

router.get('/delete/:id', (req, res) => {

    const id = req.params.id;

    try {
        mysql.query(`DELETE FROM latest_News WHERE id = ${id}`, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'News has been deleted successfully!')
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

    const statement = typeof (values) == 'string' ? `DELETE FROM latest_News WHERE id = ? ` : `DELETE FROM latest_News WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'News has been deleted successfully!')
                res.redirect('/admin/latest-news');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});


router.put('/multiPublish', (req, res) => {

    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE latest_News SET status = 1 WHERE id = ?` : `UPDATE latest_News SET status = 1 WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'News has been published successfully!')
                res.redirect('/admin/latest-news');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});


router.put('/multiUnPublish', (req, res) => {
    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE latest_News SET status = 0 WHERE id = ?` : `UPDATE latest_News SET status = 0 WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'News has been unpublished successfully!')
                res.redirect('/admin/latest-news');
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
        mysql.query(`SELECT * FROM latest_News WHERE id = ${id} LIMIT 1`, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                res.render('admin-update-news', { news: results })
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.put('/edit/:id', upload.single('updateNewsImg'), (req, res) => {

    const id = req.params.id;
    const title = req.body.title;
    const desc = req.body.description;
    const status = req.body.publishBtn == null ? '0' : '1';

    try {
        if (req.file == undefined) {
            var statement = `UPDATE latest_News SET title = ?, description = ?, status = ? WHERE id = ${id}`;
            var values = [title, desc, status]
        }

        else {
            var statement = `UPDATE latest_News SET title = ?, description = ?, news_image = ?, status = ? WHERE id = ${id}`;
            var values = [title, desc, req.file.originalname, status];
        }

        mysql.query(statement, values, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'News has been updated successfully!')
                res.redirect('/admin/latest-news/');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;