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

var multipleUpload = upload.fields([{ name: 'featureImage', maxCount: 1 }, { name: 'thumbnails', maxCount: 1 }, { name: 'postImages', maxCount: 10 }]);


router.get('/', (req, res) => {

    try {
        if (req.session.loggedin) {
            mysql.query(`SELECT * FROM blogs`, (err, blogs) => {
                if (err) {
                    console.log(err)
                }

                else {
                    res.render('admin-blogs', { blogs: blogs, success: req.flash('success') });
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

router.get('/add-blog', (req, res) => {

    try {
        if (req.session.loggedin) {
            res.render('admin-add-blog')
        }
        else {
            res.redirect('/admin')
        }
    } catch (error) {
        res.status(500).json(error)
    }
});

router.post('/add-blog', multipleUpload, (req, res) => {

    const title = req.body.title;
    const metaDesc = req.body.metadesc;
    const metaKeywords = req.body.metakeywords;
    const details = req.body.details;
    const cat_id = req.body.categoryid;
    const posting_date = req.body.postingdate;
    const status = req.body.publishBtn == null ? '0' : '1';

    try {

        let qry2 = "INSERT INTO blogs(title,meta_description,meta_keywords,blog_detail,category_id,feature_image,thumbnail_image,created_at,  status) VALUES('" + title + "','" + metaDesc + "','" + metaKeywords + "', '" + details + "', '" + cat_id + "' , '" + req.files.featureImage[0].originalname + "' ,  '" + req.files.thumbnails[0].originalname + "' , '" + posting_date + "', '" + status + "' )";


        mysql.query(qry2, (err, results) => {
            if (err) {
                console.log(err);
            }

            else {
                let stmt = `INSERT INTO blogPosts(post_image, post_id) VALUES ?`;
                let value =
                    [req.files.postImages.map(item => {
                        const postArray = [item.originalname];
                        postArray.push(results.insertId);
                        return postArray;
                    }),
                    ]

                mysql.query(stmt, value, (err, results) => {
                    if (err) {
                        console.log(err);

                    }
                    else {
                        req.flash('success', 'Blog has been added successfully!')
                        res.redirect('/admin/blogs');
                        console.log(results)
                    }
                });
            }


        });

    } catch (err) {
        res.status(500).json(err)
    }

});


router.get('/delete/:id', (req, res) => {

    const id = req.params.id;

    try {
        mysql.query(`DELETE FROM blogs WHERE id = ${id}`, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Blog has been deleted');
                res.redirect('/admin/blogs');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error)
    }



});

router.post('/multiDelete', (req, res) => {

    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `DELETE FROM blogs WHERE id = ? ` : `DELETE FROM blogs WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Blog has been deleted successfully!');
                res.redirect('/admin/blogs');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error)
    }
});



router.post('/multiPublish', (req, res) => {

    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE blogs SET status = 1 WHERE id = ?` : `UPDATE blogs SET status = 1  WHERE id IN ?`;

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Blog has been published successfully!');
                res.redirect('/admin/blogs');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error)
    }
});


router.post('/multiUnPublish', (req, res) => {
    var values = typeof (req.body.checkbox) == 'string' ? req.body.checkbox : [req.body.checkbox];

    const statement = typeof (values) == 'string' ? `UPDATE blogs SET status = 0 WHERE id = ?` : `UPDATE blogs SET status = 0 WHERE id IN ?`;
    console.log(values)

    try {
        mysql.query(statement, [values], (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Blog has been unpublished successfully!');
                res.redirect('/admin/blogs');
                console.log(results);
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/edit/:id', (req, res) => {

    const id = req.params.id;

    try {
        mysql.query(`SELECT * FROM blogs WHERE id = ${id} LIMIT 1 ; SELECT * FROM blogPosts WHERE post_id = ${id}`, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                req.flash('success', 'Blog has been updated successfully!');
                res.render('admin-update-blog', { blogs: results[0], postImages: results[1] })
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.put('/edit/:id', multipleUpload, (req, res) => {

    const id = req.params.id;
    const title = req.body.title;
    const metaDesc = req.body.metadesc;
    const metaKeywords = req.body.metakeywords;
    const details = req.body.details;
    const cat_id = req.body.categoryid;
    const posting_date = req.body.postingdate;
    const status = req.body.publishBtn == null ? '0' : '1';

    // console.log("req.files ========> ", req.files['featureImage']);

    try {
        if (req.files['featureImage'] == undefined && req.files['thumbnails'] == undefined) {
            var statement = `UPDATE blogs SET title = ?, meta_description = ?, meta_keywords = ?, blog_detail = ?,category_id = ?, created_at = ?, status = ? WHERE id= ?`;

            var values = [title, metaDesc, metaKeywords, details, cat_id, posting_date, status, id]
        }

        else if (req.files['featureImage'] == undefined && req.files['thumbnails'] !== undefined) {
            var statement = `UPDATE blogs SET title = ?, meta_description = ?, meta_keywords = ?, blog_detail = ?,category_id = ?, thumbnail_image = ?, created_at = ?, status = ? WHERE id= ?`;

            var values = [title, metaDesc, metaKeywords, details, cat_id, req.files.thumbnails[0].originalname, posting_date, status, id];
        }
        else if (req.files['featureImage'] !== undefined && req.files['thumbnails'] == undefined) {
            var statement = `UPDATE blogs SET title = ?, meta_description = ?, meta_keywords = ?, blog_detail = ?,category_id = ?,feature_image = ?, created_at = ?, status = ? WHERE id= ?`;

            var values = [title, metaDesc, metaKeywords, details, cat_id, req.files.featureImage[0].originalname, posting_date, status, id];
        }

        else {
            var statement = `UPDATE blogs SET title = ?, meta_description = ?, meta_keywords = ?, blog_detail = ?, category_id = ?, feature_image = ?, thumbnail_image = ?, created_at = ?, status = ? WHERE id= ?`;

            var values = [title, metaDesc, metaKeywords, details, cat_id, req.files.featureImage[0].originalname, req.files.thumbnails[0].originalname, posting_date, status, id]
        }

        mysql.query(statement, values, (err, results) => {
            if (err) {
                console.log(err)
            }
            else {
                if (req.files['postImages'] == undefined) {
                    res.redirect('/admin/blogs');
                    console.log(results)
                }

                else {
                    let stmt = `INSERT INTO blogPosts(post_image, post_id) VALUES ?`;
                    let value =
                        [req.files.postImages.map(item => {
                            const postArray = [item.originalname];
                            postArray.push(id);
                            return postArray;
                        }),
                        ]

                    mysql.query(stmt, value, (err, results) => {
                        if (err) {
                            console.log(err);

                        }
                        else {
                            req.flash('success', 'blog has been deleted successfully!');
                            res.redirect('/admin/blogs');
                            console.log(results)
                        }
                    });
                }
            }
        });
    }

    catch (error) {
        res.status(500).json(error);
    }

});

router.get('/delete/post-image/:id', (req, res) => {
    const id = req.params.id;
    let stmt = `DELETE from blogPosts WHERE id = ${id}`;

    try {
        mysql.query(stmt, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                res.redirect('back')
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/update/post-image/:id', (req, res) => {
    const id = req.params.id;

    let stmt = `SELECT * FROM blogPosts WHERE id = ${id} LIMIT 1`;

    try {
        mysql.query(stmt, (err, results) => {
            if (err) {
                console.log(err)
            }

            else {
                res.render('admin-update-post-image', { postImageData: results })
                console.log("get results=======>", results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});


router.put('/update/post-image/:id', upload.single('updateSinglePostImage'), (req, res) => {
    const id = req.params.id;

    console.log(req.file.originalname)
    const stmt = `UPDATE blogPosts SET post_image = ? WHERE id = ?`;
    const value = [req.file.originalname, id];

    try {
        mysql.query(stmt, value, (err, results) => {
            if (err) {
                console.log(err);
            }

            else {
                res.redirect('back');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router