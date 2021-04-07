if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://kredley:1234@cluster0.zaafn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}