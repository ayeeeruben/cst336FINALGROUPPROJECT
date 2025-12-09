import express from 'express';
import mysql from 'mysql2/promise';
import session from 'express-session';
import bcrypt from 'bcrypt';


const app = express();

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'cst336 csumb',
  resave: false,
  saveUninitialized: true
//   cookie: { secure: true }  //only works in web servers
}))

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "l3855uft9zao23e2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "ppqeua5ee1hdp3d3",
    password: "vup1zqenlo9pyyzd",
    database: "nw8yehtc787o17b6",
    connectionLimit: 10,
    waitForConnections: true
});
//routes
app.get('/', (req, res) => {
   res.render('login.ejs')
});

app.get('/home', isUserAuthenticated, (req, res) => {
    res.render('home.ejs');
});

app.get('/explore', async (req, res) => {
  const search = req.query.search || '';

  let sql = `SELECT * FROM cst336final`;
  let params = [];

  if (search) {
    sql += ` WHERE Paddle LIKE ?`;
    params.push(`%${search}%`);
  }

  const [rows] = await pool.query(sql, params);

  res.render('explore.ejs', { paddles: rows, search });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get('/productProfile/:id', isUserAuthenticated, async (req, res) => {
    let id = req.params.id;

    let sql = `SELECT *
               FROM cst336final
              WHERE id = ?`;
    const [rows] = await pool.query(sql, [id]);

    res.render('productProfile.ejs', { paddle: rows[0] });
});

app.get('/addPaddle', isUserAuthenticated, (req, res) => {
    res.render('addPaddle.ejs');
});

app.get('/updatePaddle/:id', isUserAuthenticated, async (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM cst336final WHERE id = ?';
  const [rows] = await pool.query(sql, [id]);

  if (!rows.length) {
    return res.status(404).send('Paddle not found for id ' + id);
  }

  res.render('updatePaddle.ejs', { paddle: rows[0] });
});

app.post('/updatePaddleProcess', isUserAuthenticated, async (req, res) => {
    const {
        id,
        paddleName,
        paddleImg,
        retailPrice,
        paddlePrice,
        surfaceMaterial,
        staticWeight,
        discountCode,
    } = req.body;
    let sql = `
        UPDATE cst336final
           SET Paddle = ?,
               \`Paddle img\` = ?,
               \`Retail Price\` = ?,
               \`Discounted Price\` = ?,
               \`Surface Material\` = ?,
               \`Static Weight\` = ?,
               \`Discount Code\` = ?
         WHERE id = ?
    `;

    await pool.query(sql, [
        paddleName,
        paddleImg,
        retailPrice,
        paddlePrice,
        surfaceMaterial,
        staticWeight,
        discountCode,
        id
    ]);

    res.redirect('/explore');
});

app.post('/addPaddleProcess', isUserAuthenticated, async (req, res) => {
  const {
    paddleName,
    paddleImg,
    retailPrice,
    paddlePrice,
    surfaceMaterial,
    staticWeight,
    discountCode,
    paddleDescription
  } = req.body;

  let sql = `
    INSERT INTO cst336final 
      (Paddle, \`Paddle img\`, \`Retail Price\`, \`Discounted Price\`, \`Surface Material\`, \`Static Weight\`, \`Discount Code\`)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  await pool.query(sql, [
    paddleName,
    paddleImg,
    retailPrice,
    paddlePrice,
    surfaceMaterial,
    staticWeight,
    discountCode,
    paddleDescription
  ]);

  res.redirect('/explore');
});


app.post('/loginProcess', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let hashedPassword = "";
    let sql = `SELECT *
               FROM users
              WHERE username = ?`;
    const [rows] = await pool.query(sql, [username]); 

    if (rows.length > 0) { //username exists in the table
      hashedPassword = rows[0].password;
    }

    const match = await bcrypt.compare(password, hashedPassword);

    if (match) {
        req.session.isUserAuthenticated = true;
        req.session.fullName = rows[0].firstName + " " + rows[0].lastName;
        res.render('home.ejs')
    } else {
        res.render('login.ejs', {"loginError": "Wrong Credentials" })
    }

});



function isUserAuthenticated(req, res, next){
 if (req.session.isUserAuthenticated) {
    next();
   } else {
    res.redirect("/");
   }
}


// app.get("/dbTest", async(req, res) => {
//    try {
//         const [rows] = await pool.query("SELECT CURDATE()");
//         res.send(rows);
//     } catch (err) {
//         console.error("Database error:", err);
//         res.status(500).send("Database error!");
//     }
// });//dbTest
app.listen(3000, ()=>{
    console.log("Express server running")
})
