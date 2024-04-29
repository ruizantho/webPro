const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const cookieParser = require('cookie-parser');


const app = express();
const PORT = 8080;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ruiz',
    database: 'bdnodejs'
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données MySQL :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('.'));

app.use(cookieParser());

app.get('/createCookie.html', (req,res) => {
    res.cookie('cookie1', 'Mon cookie !', { maxAge: 360000 });
    res.redirect('/cookie.html')
})

app.get('/clearCookie.html', (req,res) => {
    res.clearCookie('cookie1');
    res.send('Cookie cleared !')
})

app.get('/getCookie.html', (req,res)=>{
    res.send(req.cookies);
})

const twoHours = 1000 * 60 * 60 * 2;

app.use(session({
    secret: 'secretkeyfhrpyofdk', 
    saveUninitialized: false,
    cookie : { maxAge: twoHours},
    resave: false
}));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/apropos', function(req, res) {
    res.sendFile(__dirname + '/aPropos.html')
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql = 'SELECT * FROM utilisateurs WHERE nom_utilisateur = ? AND mot_de_passe = ?';
    connection.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Erreur lors de la vérification des identifiants dans la base de données :', err);
            res.redirect('/index.html')
            return;
        }

        if (results.length > 0) {
            req.session.monNomaMoi = username;
            console.log(req.session);
            res.redirect('/annonce.html')
        } else {
            res.redirect('/index.html')
        }
    });
});

app.get('/annonce', (req, res) => {
    if (req.session.monNomaMoi != undefined) {
        const sql = 'SELECT * FROM annonce';
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Erreur lors de la récupération des annonces depuis la base de données :', err);
                res.status(500).json({ error: 'Erreur lors de la récupération des annonces.' });
                return;
            }
            res.json(results);
        });
    } else {
        res.status(401).json({error: "Non autorisé", message: "Vous devez être connecté"});
    }
});

app.post('/username', (req, res) => {
    if (req.session.monNomaMoi) {
        res.json({ username: req.session.monNomaMoi });
    } else {
        res.status(401).json({ error: "Non autorisé" });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/index.html');
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
