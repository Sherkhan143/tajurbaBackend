const express = require('express');
const router = express.Router();
const mysql = require('../../db/connection.js').con;
// const mysql = require('../../db/connection.js');
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
            mysql.query("SELECT * FROM banners", (err, results) => {
                if (err) {
                    console.log(err)
                }

                else {
                    res.render('admin-banner', { banners: results, success: req.flash('success') });
                    console.log(results)
                }
            });
        }
        else {
            res.redirect('/admin')
        }
    } catch (error) {
        res.status(500).json(error)
    }


});


router.get('/add-banner', (req, res) => {
    try {
        if (req.session.loggedin) {
            res.render('admin-add-banner')
        }
        else {
            res.redirect('/admin')
        }
    } catch (error) {
        res.status(500).json(error)
    }

});

router.post('/add-banner', upload.single('bannerImage'), (req, res) => {
    const title1 = req.body.title1;
    const title2 = req.body.title2;
    const title3 = req.body.title3;
    const title4 = req.body.title4;
    const status = req.body.publishBtn == null ? '0' : '1';


    console.log(title1, title2, title3, title4, status)

    try {
        let query = "INSERT INTO banners(title_1,title_2,title_3,title_4,banner_image,status) VALUES('" + title1 + "','" + title2 + "','" + title3 + "','" + title4 + "','" + req.file.originalname + "', '" + status + "' )";

        mysql.query(query, (err, results) => {
            if (err) {
                console.log(err);
            }

            else {
                req.flash('success', 'Banner has been added successfully!')
                res.redirect('/admin/banner');
                console.log(results)
            }
        });

    } catch (err) {
        res.send(err);
    }
});

router.get('/delete/:id', (req, res) => {

    const id = req.params.id;
    try {
        mysql.query(`DELETE FROM banners WHERE id = ${id}`, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Banner has been deleted successfully!')
                res.redirect('back');
                console.log(results)
            }
        });

    } catch (error) {
        res.status(500).json(error)
    }

});

router.delete('/multiDelete', (req, res) => {

    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `DELETE FROM banners WHERE id = ? ` : `DELETE FROM banners WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Banner has been deleted successfully!')
                res.redirect('/admin/banner');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error)
    }
});


router.put('/multiPublish', (req, res) => {

    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE banners SET status = 1 WHERE id = ?` : `UPDATE banners SET status = 1 WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Banner has been published successfully!')
                res.redirect('/admin/banner');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error)
    }
});


router.put('/multiUnPublish', (req, res) => {
    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE banners SET status = 0 WHERE id = ?` : `UPDATE banners SET status = 0 WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Banner has been unpublished successfully!')
                res.redirect('/admin/banner');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error)
    }
});

router.get('/edit/:id', (req, res) => {

    const id = req.params.id;

    try {
        mysql.query(`SELECT * FROM banners WHERE id = ${id} LIMIT 1`, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                // req.flash('success', 'Banner has been updated successfully!')
                res.render('admin-update-banner', { banner: results })
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error)
    }
});

router.put('/edit/:id', upload.single('updateBannerImage'), (req, res) => {

    const id = req.params.id;
    const title1 = req.body.title1;
    const title2 = req.body.title2;
    const title3 = req.body.title3;
    const title4 = req.body.title4;
    const status = req.body.publishBtn == null ? '0' : '1';

    try {
        if (req.file == undefined) {
            var statement = `UPDATE banners SET title_1 = ?, title_2 = ?, title_3 = ?, title_4 = ?, status = ? WHERE id = ${id}`;
            var values = [title1, title2, title3, title4, status]
        }

        else {
            var statement = `UPDATE banners SET title_1 = ?, title_2 = ?, title_3 = ?, title_4 = ?, banner_image = ?, status = ? WHERE id = ${id}`;
            var values = [title1, title2, title3, title4, req.file.originalname, status];
        }

        mysql.query(statement, values, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Banner has been updated successfully!')
                res.redirect('/admin/banner/');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error)
    }
});






module.exports = router