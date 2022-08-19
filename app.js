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

app.get('/', async (req, res) => {
  const equipos = await Equipo.find({}).sort({posicion: 1})
  res.render('index', { equipos })
})

// HELPER
hbs.registerHelper('obtenerFondo', (equipo, equipostotales) => {
  if (equipo.posicion <= 4) {
    return "primeros " + equipostotales;
  }
  else if (equipo.posicion > equipostotales - 4) {
    return "ultimos";
  }
  return "";
})

async function scraper() {
  const $ = await request({
    uri: 'https://www.futbolargentino.com/primera-division/tabla-de-posiciones',
    transform: body => cheerio.load(body)
  })
  let newEquipo = new Equipo()
  for (let i = 0; i < $('tr td').length / 10; i++) {                        // en el for uso $('tr td')/10 porque $('tr td') devuelve todos los datos de la tabla
    newEquipo.nombre = $('tr td').eq(i * 10 + 1).find('span.d-none').text() // y como cada equipo tiene 10 datos al dividir por 10 me da la cantidad de equipos sin la nesesidad de harcodearlo
    newEquipo.posicion = $('tr td').eq(i * 10 + 0).text()
    newEquipo.escudo = $('tr td').eq(i * 10 + 1).find('.lazy').attr('data-src')
    newEquipo.partidos_jugados = $('tr td').eq(i * 10 + 2).text()
    newEquipo.ganados = $('tr td').eq(i * 10 + 3).text()
    newEquipo.empatados = $('tr td').eq(i * 10 + 4).text()
    newEquipo.perdidos = $('tr td').eq(i * 10 + 5).text()
    newEquipo.goles_favor = $('tr td').eq(i * 10 + 6).text()
    newEquipo.goles_contra = $('tr td').eq(i * 10 + 7).text()
    newEquipo.diferencia_goles = $('tr td').eq(i * 10 + 8).text()
    newEquipo.puntos = $('tr td').eq(i * 10 + 9).text()
    await Equipo.updateOne({ nombre: newEquipo.nombre }, {
      $set: {
        nombre: newEquipo.nombre,
        escudo: newEquipo.escudo,
        posicion: newEquipo.posicion,
        puntos: newEquipo.puntos,
        partidos_jugados: newEquipo.partidos_jugados,
        ganados: newEquipo.ganados,
        empatados: newEquipo.empatados,
        perdidos: newEquipo.perdidos,
        goles_favor: newEquipo.goles_favor,
        goles_contra: newEquipo.goles_contra,
        diferencia_goles: newEquipo.diferencia_goles
      }
    }, 
    { upsert: true })
  }
  //console.log(await Equipo.find()) sacar comentario para poder ver los equipos en la base de datos
}

setInterval(() => {
  scraper()
}, process.env.TIEMPO_DE_ESPERA || 10000);

const inicio = async () => {
  await mongoose.connect(process.env.MONGODB_URL)
  console.log('Conectado a la base de datos')

  const server = app.listen(puerto, () => {
    console.log('Servidor web iniciado en el puerto: ' + puerto)
  })
}

inicio()
