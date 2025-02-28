const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'likeme',
    password: 'Laxuicaa8986',
    port: 5432,
});

const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(25) NOT NULL,
                img VARCHAR(1000),
                descripcion VARCHAR(255),
                likes INT DEFAULT 0
            );
        `);
        console.log('Tabla creada ya existe');
    } catch (error) {
        console.error('Error al crear la tabla:', error);
    }
};

const insertPost = async (titulo, img, descripcion) => {
    try {
        await pool.query(`
            INSERT INTO posts (titulo, img, descripcion)
            VALUES ($1, $2, $3);
        `, [titulo, img, descripcion]);
        console.log('Post correcto');
    } catch (error) {
        console.error('error al insertar post:', error);
    }
};

module.exports = {
    pool,
    createTable,
    insertPost
};