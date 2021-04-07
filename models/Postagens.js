const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Postagem = new Schema({

    titulo: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    descricao:{
        type: String,
        require:  true
    },
    conteudo:{
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias"
    },
    data: {
        type: Date,
        default: Date.now
    }
})

mongoose.model("postagens", Postagem)