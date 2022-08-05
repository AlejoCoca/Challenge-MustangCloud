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

app.get('/', async(req, res)=>{
  let equipos=await Equipo.find({})
   res.render('index', {equipos})
})

async function scraper() {
  const $ = await request({
    uri: 'https://www.futbolargentino.com/primera-division/tabla-de-posiciones',
    transform: body => cheerio.load(body)
  })
  let newEquipo=new Equipo()
  for(let i=0;i<$('tr td').length/10;i++){
    for(let j=0;j<10;j++){
      switch(j){
        case 0:{
          newEquipo.posicion=$('tr td').eq(i*10+j).text()
          break
        }
        case 1:{
          newEquipo.escudo=$('tr td').eq(i*10+j).find('.lazy').attr('data-src')
          newEquipo.nombre=$('tr td').eq(i*10+j).find('span.d-none').text()
          break
        }
        case 2:{
          newEquipo.partidos_jugados=$('tr td').eq(i*10+j).text()
          break
        }
        case 3:{
          newEquipo.ganados=$('tr td').eq(i*10+j).text()
          break
        }
        case 4:{
          newEquipo.empatados=$('tr td').eq(i*10+j).text()
          break
        }
        case 5:{
          newEquipo.perdidos=$('tr td').eq(i*10+j).text()
          break
        }
        case 6:{
          newEquipo.goles_favor=$('tr td').eq(i*10+j).text()
          break
        }
        case 7:{
          newEquipo.goles_contra=$('tr td').eq(i*10+j).text()
          break
        }
        case 8:{
          newEquipo.diferencia_goles=$('tr td').eq(i*10+j).text()
          break
        }
        case 9:{
          newEquipo.puntos=$('tr td').eq(i*10+j).text()
          break
        }
      }
    }
    let equipo=await Equipo.findOne({nombre:newEquipo.nombre})
    if(equipo==undefined){
      console.log("GUARDADO")
      await newEquipo.save()
    }
    else if(equipo.nombre==newEquipo.nombre){
      console.log("ACTUALIZADO")
      await Equipo.findOneAndUpdate({nombre:newEquipo.nombre},{$set:{
        posicion:newEquipo.posicion,
        escudo:newEquipo.escudo,
        partidos_jugados:newEquipo.partidos_jugados,
        ganados:newEquipo.ganados,empatados:newEquipo.empatados,
        perdidos:newEquipo.perdidos,goles_favor:newEquipo.goles_favor,
        goles_contra:newEquipo.goles_contra,
        diferencia_goles:newEquipo.diferencia_goles,
        puntos:newEquipo.puntos
      }})
    }
    newEquipo= new Equipo({})
  }
  //console.log(await Equipo.find())
}

setInterval(()=>{
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
