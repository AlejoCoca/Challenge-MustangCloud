const mongoose = require('mongoose')

const equipoSchema = mongoose.Schema({
    nombre: String,
    escudo: String,
    posicion: Number,
    puntos: Number,
    partidos_jugados: Number,
    ganados: Number,
    empatados: Number,
    perdidos: Number,
    goles_favor: Number,
    goles_contra: Number,
    diferencia_goles: Number
});

module.exports = mongoose.model("Equipo", equipoSchema)