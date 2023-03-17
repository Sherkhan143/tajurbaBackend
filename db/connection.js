const mysql = require('mysql');
const con = mysql.createConnection({
    // host : "localhost",
    // user : "root",
    // password : "root",
    // database : "tajurba",
    // port : 3306,
    // multipleStatements:true
    host : "85.187.128.11",
    user: "iscom_uniworld",
    password: "uniworld@admin1234",
    database:"iscom_tajurba",
    port : 3306,
    multipleStatements:true
});

con.connect((err) => {
    if(err){
     throw err;
     console.log("NOT CONNECTED");
    }

    console.log("connection created..!!");
});

module.exports.con = con;


// var pool = mysql.createPool({
//     connectionLimit:10,
//     host: "localhost",
//     user: "root",
//     password: "root",
//     database:"tajurba",
//     multipleStatements:true,
//     acquireTimeout: 1000000,
//     debug: false
//   });

//   pool.getConnection((err,connection)=> {
//     if(err)
//     throw err;
//     console.log('Database connected successfully');
//     connection.release();
//   });


//   pool.query('SELECT * FROM banners WHERE status = 1', (err, results) => {
//     if(err){
//       console.log(err)
//     }

//     else{
//       console.log(results)
//     }
//   });


// var db_config = {
//   host: 'localhost',
//   user: 'root',
//   password: 'root',
//   database: 'tajurba',
//   port: 3306,
//   multipleStatements: true
// };

// var connection;

// var handleDisconnect = () => {
//   connection = mysql.createConnection(db_config); // Recreate the connection, since
//   // the old one cannot be reused.

//   connection.connect(function (err) {              // The server is either down
//     if (err) {                                     // or restarting (takes a while sometimes).
//       console.log('error when connecting to db:', err);
//       setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
//     }                                     // to avoid a hot loop, and to allow our node script to
//   });                                     // process asynchronous requests in the meantime.
//   // If you're also serving http, display a 503 error.
//   connection.on('error', function (err) {
//     console.log('db error', err);
//     if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
//       handleDisconnect();                          // lost due to either server restart, or a
//     } else {                                      // connnection idle timeout (the wait_timeout
//       throw err;                                  // server variable configures this)
//     }
//   });
// }

// handleDisconnect();
// module.exports = pool;