//CARREGANDO MODULOS

const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const moment = require('moment')
const app = express()
const admin = require("./routes/admin")
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagens")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require('passport')
require("./config/auth")(passport)
const db = require("./config/db")

//CONFIGURAÇOES

    //Sessao
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())
    //MIddleware
    //variavel global
    app.use((req, res, next) =>{
        res.locals.success_msg = req.flash("success_msg"),
        res.locals.error_msg = req.flash("error_msg"),
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
        next();
    })


    //Body Parser
    app.use(bodyParser.urlencoded({extended:true}))
    app.use(bodyParser.json())
    //Handlebars
    app.engine('handlebars', handlebars({
        defaultLayout: 'main',
        helpers: {
            formatDate: (date) => {
                return moment(date).format('DD/MM/YYYY')
            }
        }
    }))
    app.set('view engine', 'handlebars');
    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI,  {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true})
        .then(() =>{
            console.log("Conectado ao mongo")
        }).catch((err) =>{
            console.log("Erro ao se conectar" + err)
        })
    //Public
    app.use(express.static('public'));

    app.use((req, res, next) =>{
        console.log("EU SOU UM MIDDLEWARE")
        next()
    })
//ROTAS  


    app.get('/', (req, res) =>{
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) =>{
            res.render('index', {postagens : postagens})
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/404", (req, res) =>{
        res.send("Error!!!")
    })

    app.get("/postagem/:slug", (req, res) =>{
        Postagem.findOne({slug : req.params.slug}).lean().then((postagem) =>{
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta postagem não existe!")
                res.redirect("/")
            }
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias", (req, res) =>{
        Categoria.find().lean().then((categorias) =>{
            res.render("categorias/index", {categorias : categorias})
        }).catch((erro) =>{
            req.flash("error_msg", "Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) =>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) =>{
            if(categoria){
                Postagem.find({categoria : categoria._id}).lean().then((postagens) =>{
                    res.render("categorias/postagens", {postagens : postagens, categoria : categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao redirecionar o posts!")
                res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno ao carregar essa página da categoria")
            res.redirect("/")
        })
    })

    app.get("/login", (req, res) => {
        res.render("usuarios/login")
    })

    app.use('/admin', admin)
    app.use("/usuarios", usuarios)

    //OUTROS

const PORT  = process.env.PORT || 8081
app.listen(PORT, () =>{
    console.log("Servidor Rodando!")
})
