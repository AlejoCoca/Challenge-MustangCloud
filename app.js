const express = require('express')
const mongoose = require('mongoose')
const cheerio = require('cheerio')
const request = require('request-promise')
const hbs = require('hbs')
require('dotenv').config({ path: '.env' });

const app = express()
app.set('view engine', 'hbs')
app.set('views', __dirname + '/src/views')
app.use(express.static(__dirname + '/src'))

const puerto = process.env.PORT || 3000;

//aca va la coneccion a la base de datos con mongoose
var demo = {
  name : 'Rohan',
  age : 26,
  hobbies : ['Coding', 'Reading', 'Watching Movies']
}

app.get('/', (req, res)=>{
  //funcion q carga los datos de la bd
   res.render('index', {demo:demo, title : 'Home'})
})

async function init() {
  const response = await request('https://www.futbolargentino.com/primera-division/tabla-de-posiciones')
  console.log(response)
}

setInterval(()=>{
  console.log(`The queue is currently 2 long`);
  init()
}, process.env.TIEMPO_DE_ESPERA || 10000);

const inicio = async () => {
  await mongoose.connect(process.env.MONGODB_URL)
  console.log('Conectado a la base de datos')

  const server = app.listen(puerto, () => {
    console.log('Servidor web iniciado en el puerto: '+puerto)
  })
}

inicio()
