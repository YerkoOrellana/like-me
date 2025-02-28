const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { pool, createTable, insertPost } = require('./config/config');
const port = 3000;

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());


createTable();

// rutas

//GET
app.get('/posts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener posts' });
    }
});

//POST
app.post('/posts', async (req, res) => {
    const { titulo, url, descripcion } = req.body;
    try {
        await insertPost(titulo, url, descripcion);
        res.status(201).json({ message: 'Post creado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el post' });
    }
});

//PUT con captura de rror
app.put("/posts/:id", async (req, res) => {
    const { id } = req.params;
    const { titulo, img, descripcion } = req.body;
    
    try {
        const result = await pool.query(`
            UPDATE posts SET titulo = $1, img = $2, descripcion = $3 WHERE id = $4
        `, [titulo, img, descripcion, id]);
        
        if (result.rowCount === 0) {
            return res.status(404).send("Post no encontrado");
        }

        res.status(200).send("Post actualizado con éxito");
    } catch (error) {
        console.error('Error al actualizar el post:', error);
        res.status(500).send("Error al actualizar el post");
    }
});

//LIKE OPERATIVO
app.put("/posts/like/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes;
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).send("Post no encontrado");
        }
        res.status(200).json({ likes: result.rows[0].likes });
    } catch (error) {
        console.error('Error al agregar like al post:', error);
        res.status(500).send("Error al agregar like");
    }
});

//DELETE 
app.delete("/posts/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(`
            DELETE FROM posts WHERE id = $1
        `, [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).send("Post no encontrado");
        }

        res.status(200).send("Post eliminado con éxito");
    } catch (error) {
        console.error('Error al eliminar el post:', error);
        res.status(500).send("Error al eliminar el post");
    }
});



// archivos html
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// maneja rutas no definidas por API y servir el index.html del front
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html')); 
});


app.listen(port, () => {
    console.log(`Servidor levantado en http://localhost:${port}`);
});