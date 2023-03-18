const express = require('express');
const router = express.Router();
// const mysql = require('../../db/connection.js');
const mysql = require('../../db/connection.js').con;

const multer = require('multer');
const path = require('path');

const rootPath = path.join(__dirname, '../../');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${rootPath}/public/admin/images/uploaded_images`)
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
            mysql.query("SELECT * FROM testimonial", (err, results) => {
                if (err) {
                    console.log(err)
                }
    
                else {
                    res.render('admin-testimonial', { testimonials: results, success : req.flash('success') });
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


router.get('/add-testimonial', (req, res) => {

    try {
        if (req.session.loggedin) {
            res.render('admin-add-testimonial')
        }
        else {
            res.redirect('/admin')
        }
    } catch (error) {
        res.status(500).json(error);
    }
    
});


router.post('/add-testimonial', upload.single('profileImg'), (req, res) => {

    const name = req.body.name;
    const desc = req.body.description;
    const status = req.body.publishBtn == null ? '0' : '1';


    console.log(name, desc, req.file.originalname, status)

    try {
        let query = "INSERT INTO testimonial(name,description,profile_image,status) VALUES('" + name + "','" + desc + "','" + req.file.originalname + "', '" + status + "' )";

        mysql.query(query, (err, results) => {
            if (err) {
                console.log(err);
            }

            else {
                req.flash('success', 'Testimonial has been added successfully!')
                res.redirect('/admin/testimonials');
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
        mysql.query(`DELETE FROM testimonial WHERE id = ${id}`, (err, results) => {
            if (err) {
                console.log(err)
            }
    
            else {
                req.flash('success', 'Testimonial has been deleted successfully!')
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

    const statement = typeof (values) == 'string' ? `DELETE FROM testimonial WHERE id = ? ` : `DELETE FROM testimonial WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }
    
            else {
                req.flash('success', 'Testimonial has been deleted successfully!')
                res.redirect('/admin/testimonials');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
    
});


router.put('/multiPublish', (req, res) => {

    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE testimonial SET status = 1 WHERE id = ?` : `UPDATE testimonial SET status = 1 WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }
    
            else {
                req.flash('success', 'Testimonial has been published successfully!')
                res.redirect('/admin/testimonials');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
    
});


router.put('/multiUnPublish', (req, res) => {
    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE testimonial SET status = 0 WHERE id = ?` : `UPDATE testimonial SET status = 0 WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }
    
            else {
                req.flash('success', 'Testimonial has been unpublished successfully!')
                res.redirect('/admin/testimonials');
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
        mysql.query(`SELECT * FROM testimonial WHERE id = ${id} LIMIT 1`, (err, results) => {
            if (err) {
                console.log(err)
            }
    
            else {
                res.render('admin-update-testimonial', { testimonial: results })
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
    
});

router.put('/edit/:id', upload.single('updateProfileImg'), (req, res) => {

    const id = req.params.id;
    const name = req.body.name;
    const desc = req.body.description;
    const status = req.body.publishBtn == null ? '0' : '1';

    if (req.file == undefined) {
        var statement = `UPDATE testimonial SET name = ?, description = ?, status = ? WHERE id = ${id}`;
        var values = [name, desc, status]
    }

    else {
        var statement = `UPDATE testimonial SET name = ?, description = ?, profile_image = ?, status = ? WHERE id = ${id}`;
        var values = [name, desc, req.file.originalname, status];
    }

    try {
        mysql.query(statement, values, (err, results) => {
            if (err) {
                console.log(err)
            }
    
            else {
                req.flash('success', 'Testimonial has been updated successfully!')
                res.redirect('/admin/testimonials');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
   
});

















module.exports = router
