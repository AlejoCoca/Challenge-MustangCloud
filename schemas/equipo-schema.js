import mongoose from "mongoose";

const equipoSchema = mongoose.Schema({
    nombre: String,
    escudo: String,
    posicion: Integer,
    puntos: Integer,
    partidos_jugados: Integer,
    ganados: Integer,
    empatados: Integer,
    perdidos: Integer,
    goles_favor: Integer,
    goles_contra: Integer,
    diferencia_goles: Integer
});

const equipoModel = mongoose.model("Equipo", equipoSchema);

export default equipoModel;