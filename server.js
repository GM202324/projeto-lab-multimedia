// server.js (CORRIGIDO)
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); 

// Ficheiros de Dados
const USERS_FILE = 'users.json';
const TRACKING_FILE = 'tracking.json';
const SUBSCRIPTIONS_FILE = 'subscriptions.json';
const CONTACTS_FILE = 'contacts.json';

// --- FUNÇÃO DE AJUDA PARA LER JSON COM SEGURANÇA ---
// Esta função evita que o servidor vá abaixo se o ficheiro estiver vazio
function readJsonFile(filename) {
    try {
        if (!fs.existsSync(filename)) {
            fs.writeFileSync(filename, '[]'); // Cria se não existir
            return [];
        }
        const data = fs.readFileSync(filename, 'utf8');
        // Se o ficheiro estiver vazio, retorna array vazio em vez de dar erro
        return data.trim() === '' ? [] : JSON.parse(data);
    } catch (err) {
        console.error(`Erro ao ler ${filename}:`, err.message);
        // Se houver erro (JSON mal formatado), reinicia o ficheiro
        fs.writeFileSync(filename, '[]'); 
        return [];
    }
}

// Inicializar ficheiros na arranque
[USERS_FILE, TRACKING_FILE, SUBSCRIPTIONS_FILE, CONTACTS_FILE].forEach(file => {
    readJsonFile(file); // Isto garante que são criados corretamente
});

// --- ROTAS ---

app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    const users = readJsonFile(USERS_FILE); // Usa a nova função segura

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email já registado.' });
    }

    users.push({ name, email, password, date: new Date().toISOString() });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    
    console.log(`[REGISTO] Novo utilizador: ${name}`);
    res.json({ success: true, message: 'Conta criada com sucesso!' });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = readJsonFile(USERS_FILE);
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({ success: true, message: `Bem-vindo, ${user.name}!`, user: { name: user.name, email: user.email } });
    } else {
        res.status(401).json({ success: false, message: 'Dados incorretos.' });
    }
});

app.post('/api/track', (req, res) => {
    const tracks = readJsonFile(TRACKING_FILE);
    tracks.push({ 
        ...req.body, 
        timestamp: new Date().toISOString(), 
        ip: req.ip 
    });
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(tracks, null, 2));
    res.json({ success: true });
});

app.post('/api/subscribe', (req, res) => {
    const subs = readJsonFile(SUBSCRIPTIONS_FILE);
    if (!subs.find(s => s.email === req.body.email)) {
        subs.push({ email: req.body.email, date: new Date().toISOString() });
        fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2));
    }
    res.json({ success: true });
});

app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    const contacts = readJsonFile(CONTACTS_FILE);
    
    contacts.push({ 
        name, email, subject, message, 
        date: new Date().toISOString(),
        status: 'received' 
    });
    
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
    console.log(`[CONTACTO] Mensagem de: ${name}`);
    res.json({ success: true, message: 'Mensagem enviada!' });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor seguro a correr em http://localhost:${PORT}`);
});