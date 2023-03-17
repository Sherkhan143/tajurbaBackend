const express = require('express');
const router = express.Router();
// const mysql = require('../../db/connection.js');
const mysql = require('../../db/connection.js').con;




router.get('/', (req, res) => {
    try {
        mysql.query("SELECT *, DATE_FORMAT(event_date, '%d-%m-%Y') as date FROM events_users", (err, results) => {
            if (err) {
                console.log(err)
            }
            else {
                res.render('admin-events-users', { users: results, success : req.flash('success')})
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
        mysql.query(`DELETE FROM events_users WHERE id = ${id}`, (err, results) => {
            if (err) {
                console.log(err)
            }
    
            else {
                req.flash('success', 'User has been deleted successfully!')
                res.redirect('back');
                console.log(results)
            }
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
