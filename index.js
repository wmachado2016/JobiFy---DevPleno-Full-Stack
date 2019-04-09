const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sqlite = require('sqlite')
const dbConection = sqlite.open(path.resolve(__dirname,'banco.sqlite'), {Promise})
const path= require('path')
const port = process.env.PORT || 3000

app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.urlencoded({extended:true}))

app.get('/',async (request, response) => { 
    const db = await dbConection
    const categoriasDb =await db.all('select * from tblcategorias')
    const vagas =await db.all('select * from tblvagas')
    const categorias = categoriasDb.map(cat => {
        return{
            ...cat,
            vagas: vagas.filter(vaga => vaga.categoria === cat.id)
        }
    })
    response.render('home', {
        categorias
    })
})

app.get('/vaga/:id', async(request, response) => { 
    const db = await dbConection
    const vaga = await db.get('select * from tblvagas where id='+request.params.id)
    response.render('vaga', {
        vaga
    })
})
app.get('/admin', (req, res) => {
    res.render('admin/home')
})

app.get('/admin/vagas', async(req, res) => {
    const db = await dbConection
    const vagas = await db.all('select * from tblvagas;')
    res.render('admin/vagas', { vagas })
})
app.get('/admin/vagas/delete/:id', async(req, res) => {
    const db = await dbConection
    await db.run('delete from tblvagas where id='+req.params.id+'')
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/nova', async(req, res) => {
    const db = await dbConection
    const categorias = await db.all('select * from tblcategorias;')
   res.render('admin/nova-vaga', {categorias})
})

app.post('/admin/vagas/nova', async (req, res) =>{
    const {titulo, descricao, categoria} = req.body
    const db = await dbConection
    await db.run(`insert into tblvagas(categoria,titulo,descricao) values(${categoria},'${titulo}','${descricao}')` )
    res.redirect('/admin/vagas')
})
//comment
app.post('/admin/vagas/editar/:id', async (req, res) =>{
    const {titulo, descricao, categoria} = req.body
    const { id} = req.params
    const db = await dbConection
    await db.run(`update tblvagas set categoria=${categoria},titulo='${titulo}',descricao='${descricao}' where id =${id}` )
    res.redirect('/admin/vagas')
})

app.get('/admin/vagas/editar/:id', async(req, res) => {
    const db = await dbConection
    const categorias = await db.all('select * from tblcategorias;')
    const vaga = await db.get('select * from tblvagas where id = '+req.params.id+';')
   res.render('admin/editar-vaga', {categorias,vaga})
})
const init = async() => {
    /*const db = await dbConection
    await db.run('create table if not exists tblcategorias (id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists tblvagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    const categoria = 'FullStack team'
    await db.run(`insert into tblcategorias(categoria) values('${categoria}')` )

    const categoria2 = 'Marketing team'
    await db.run(`insert into tblcategorias(categoria) values('${categoria2}')` )

    const vaga = 'FullStack Developer (Remote)'
    const desc = 'Vaga para fullstack developer que fez o FullStack Lab'
    await db.run(`insert into tblvagas(categoria,titulo,descricao) values(1,'${vaga}','${desc}')` )

    const vaga1 = 'Analista Digital'
    const desc1 = 'Vaga para fullstack developer que fez o FullStack Lab'
    await db.run(`insert into tblvagas(categoria,titulo,descricao) values(2,'${vaga1}','${desc1}')` )

    const vaga2 = 'Social Midia Digital'
    const desc2 = 'Vaga para fullstack developer que fez o FullStack Lab'
    await db.run(`insert into tblvagas(categoria,titulo,descricao) values(2,'${vaga2}','${desc2}')` )*/
}

init()

app.listen(port, (err) => {
    if(err){
        console.log('Erro ao conectar ao servidor.')
    }
    else{
        console.log('Servidor JobiFy conectado....')
    }
})