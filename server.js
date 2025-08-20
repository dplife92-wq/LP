const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// MIME types pour servir les fichiers correctement
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Parse l'URL
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Sécurité : empêche l'accès aux fichiers en dehors du dossier
    if (filePath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Accès refusé');
        return;
    }
    
    // Chemin complet du fichier
    const fullPath = path.join(__dirname, filePath);
    
    // Déterminer le type MIME
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Lire et servir le fichier
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Fichier non trouvé - 404
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>404 - Page non trouvée</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                text-align: center; 
                                padding: 50px; 
                                background: #f5f5f5; 
                            }
                            .error { 
                                background: white; 
                                padding: 40px; 
                                border-radius: 8px; 
                                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
                                display: inline-block; 
                            }
                            h1 { color: #ff1744; }
                            a { color: #0066cc; text-decoration: none; }
                            a:hover { text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        <div class="error">
                            <h1>404 - Page non trouvée</h1>
                            <p>Le fichier <strong>${filePath}</strong> n'existe pas.</p>
                            <p><a href="/">← Retour à l'accueil</a></p>
                        </div>
                    </body>
                    </html>
                `);
            } else {
                // Erreur serveur - 500
                console.error('Erreur serveur:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Erreur interne du serveur');
            }
        } else {
            // Succès - servir le fichier
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(data);
        }
    });
});

// Gestion des erreurs du serveur
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Erreur : Le port ${PORT} est déjà utilisé.`);
        console.log('💡 Solutions :');
        console.log(`   • Arrêtez le processus qui utilise le port ${PORT}`);
        console.log('   • Ou changez le PORT dans server.js');
        console.log(`   • Ou utilisez : npx kill-port ${PORT}`);
    } else {
        console.error('❌ Erreur serveur:', err);
    }
    process.exit(1);
});

// Démarrage du serveur
server.listen(PORT, () => {
    console.log('🚀 Serveur démarré avec succès !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 URL locale : http://localhost:${PORT}`);
    console.log(`📱 URL réseau : http://192.168.x.x:${PORT} (pour mobile)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 Fichiers servis depuis :', __dirname);
    console.log('⚡ Mode développement - Pas de cache');
    console.log('🛑 Pour arrêter : Ctrl+C');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Optionnel : ouvrir automatiquement dans le navigateur
    // const { exec } = require('child_process');
    // exec(`start http://localhost:${PORT}`); // Windows
    // exec(`open http://localhost:${PORT}`);  // macOS
    // exec(`xdg-open http://localhost:${PORT}`); // Linux
});

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur...');
    server.close(() => {
        console.log('✅ Serveur arrêté proprement.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Signal SIGTERM reçu, arrêt du serveur...');
    server.close(() => {
        console.log('✅ Serveur arrêté proprement.');
        process.exit(0);
    });
});