const { Console } = require('console')
const  express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagens")
const Postagem = mongoose.model("postagens")
const {eAdmin}= require("../helpers/eAdmin")


router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) =>{
    res.send("Página de post")
})

router.get("/categorias", eAdmin, (req, res) =>{
    Categoria.find().lean().then((categorias) => {
        res.render("admin/categorias", {categorias, categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as Categorias")
        res.redirect("/admin")
    })
    
})

router.get('/categorias/add', eAdmin, (req, res) =>{
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", eAdmin, (req,res) =>{

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slub inválido"})
    }

    console.log(req.body);
    if(req.body.nome.length <= 2){
        erros.push({texto : "Nome da categoria é muito pequeno"})
    }


    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() =>{
            req.flash("success_msg", "Categoria salvo com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            console.log("Erro para salvar a categoria" + err)
            req.flash("error_msg", "Erro ao salvar a categoria")
        })
    }
    
})


router.get("/categoria/edit/:id", eAdmin, (req, res) =>{
    Categoria.findOne({
        _id : req.params.id
    }).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria : categoria})
    }).catch((err) =>{
        req.flash("error_msg", "Esta categoria nao existe")
        res.redirect("/admin/categorias")
    })
})


router.post("/categoria/edit", eAdmin, (req, res) =>{
    Categoria.findById({_id : req.body.id}).then((categoria) => {
        
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        console.log("entrou aqui")
        categoria.save().then(() =>{
            
            req.flash("success_msg", "Categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) =>{
            console.log("erro  1 aqui")
            req.flash("error_msg", "Houve um erro interno ao salvar a ediçao da categoria")
            res.redirect("/admin/categorias")
        })
    }).catch((err) =>{
        console.log("erro aqui")
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect("/admin/categorias")
    })
})


router.post("/categorias/deletar", eAdmin, (req, res) =>{
    Categoria.remove({_id : req.body.id}).lean().then(() =>{
        req.flash("success_msg", "Categoria Deletado com Sucesso")
        res.redirect("/admin/categorias")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})

//------------------------------------Postagens--------------------------------------

router.get("/postagens", eAdmin, (req, res) =>{
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) =>{
        res.render("admin/postagens", {postagens : postagens})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao postar a postagem")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", eAdmin, (req,res) =>{
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
    
})

router.post("/postagens/nova", eAdmin, (req, res) =>{

    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagens", {erros, erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            slug: req.body.slug,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() =>{
            req.flash("success_msg","Postagem criada com sucesso" )
            res.redirect("/admin/postagens")
        }).catch((erro) =>{
            req.flash("error_msg", "Houve um erro ao salvar a postagem")
            res.redirect("/admin/postagens")
        })
    }
}) 


router.get("/postagens/edit/:id", eAdmin, (req,res) =>{

    Postagem.findOne({_id : req.params.id}).lean().then(postagem => {
        Categoria.find().lean().then((categorias) =>{
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })
})


router.post("/postagem/edit", eAdmin, (req,res) =>{
    Postagem.findOne({_id: req.body.id}).then((postagem) =>{
        postagem.titulo = req.body.titulo
        postagem.slub = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.data = new Date
        postagem.categoria = req.body.categoria
    
        postagem.save().then(() =>{
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) =>{
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao salvar essa edição")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", eAdmin, (req,res) =>{
    Postagem.remove({_id : req.params.id}).lean().then(() =>{
        req.flash("success_msg", "Postagem removida com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar essa postagem")
        res.redirect("/admin/postagens")
    })
} )


module.exports = router