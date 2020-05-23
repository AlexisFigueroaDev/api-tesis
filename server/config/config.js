//==================
// Port
//==================

process.env.PORT = process.env.PORT || 3000;

// =====================
// Entorno
//======================

process.env.NODE_ENV = process.env.NODE_ENV || 'desa';

// =====================
// Base de datos
//======================

let urlDB;

if (process.env.NODE_ENV === 'desa') {

    urlDB = 'mongodb://localhost:27017/docta'

} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;