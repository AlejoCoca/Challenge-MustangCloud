const express = require('express')
const mongoose = require('mongoose')
const cheerio = require('cheerio')
const request = require('request-promise')
const hbs = require('hbs')
const Equipo = require('./schemas/equipo-schema')
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

async function scraper() {
  const $ = await request({
    uri: 'https://www.futbolargentino.com/primera-division/tabla-de-posiciones',
    transform: body => cheerio.load(body)
  })

  let ndato = 0
  let newEquipo=new Equipo()
  Equipo.find
  $('tr td').each(async (i, elem) =>{
    if(ndato==10){
      let equipo = await Equipo.find({nombre:newEquipo.nombre})
      if(!equipo){
        console.log(newEquipo)
        await newEquipo.save()
      }
      newEquipo= new Equipo()
      ndato=0
    }
    switch(ndato){
      case 0:{
        newEquipo.posicion=$(elem).text()
        break
      }
      case 1:{
        newEquipo.escudo=$(elem).find('.lazy').attr('data-src')
        newEquipo.nombre=$(elem).find('span.d-none').text()
        break
      }
      case 2:{
        newEquipo.partidos_jugados=$(elem).text()
        break
      }
      case 3:{
        newEquipo.ganados=$(elem).text()
        break
      }
      case 4:{
        newEquipo.empatados=$(elem).text()
        break
      }
      case 5:{
        newEquipo.perdidos=$(elem).text()
        break
      }
      case 6:{
        newEquipo.goles_favor=$(elem).text()
        break
      }
      case 7:{
        newEquipo.goles_contra=$(elem).text()
        break
      }
      case 8:{
        newEquipo.diferencia_goles=$(elem).text()
        break
      }
      case 9:{
        newEquipo.puntos=$(elem).text()
        break
      }
    }
    ndato++
  })
}

setInterval(()=>{
  console.log(`The queue is currently 2 long`);
  scraper()
}, process.env.TIEMPO_DE_ESPERA || 10000);

const inicio = async () => {
  await mongoose.connect(process.env.MONGODB_URL)
  console.log('Conectado a la base de datos')

  const server = app.listen(puerto, () => {
    console.log('Servidor web iniciado en el puerto: '+puerto)
  })
}

inicio()
