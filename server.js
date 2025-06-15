const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const app = express();
const bcrypt = require('bcryptjs');
const expressEjsLayouts = require('express-ejs-layouts');
const PORT = process.env.PORT || 3000;

// Конфигурация пользователя (в реальном проекте лучше использовать базу данных)
const ADMIN_USER = {
    username: 'admin',
    // Пароль: 'password123' (захэшированный)
    password: '$2a$10$K8qvCw6eW6p6cGQ2kqYsKOqT3J9H9g7QD4lZ8sQ7gQ6b2p5E4N3mC'
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(expressEjsLayouts);

app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

app.use(cors({
  origin: [""],
  methods: ["POST", "GET"],
  credentials: true
}));

// Конфигурация сессий
app.use(session({
    secret: 'optomgo-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true для HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
}));

// Middleware для проверки авторизации
const requireAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return next();
    } else {
        return res.redirect('/login');
    }
};

// Маршруты

// Главная страница (защищенная)
app.get('/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Страница логина
app.get('/login', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Обработка логина
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('Login attempt:', { username, password: '***' });

    try {
        if (username === ADMIN_USER.username) {
            console.log('Username matches');
            
            // Временная проверка без хэширования для отладки
            if (password === 'password123') {
                req.session.isAuthenticated = true;
                req.session.username = username;
                console.log('Login successful (plain text)');
                return res.json({ success: true, message: 'Successful login!' });
            }
            
            const isValidPassword = await bcrypt.compare(password, ADMIN_USER.password);
            console.log('Password valid:', isValidPassword);
            
            if (isValidPassword) {
                req.session.isAuthenticated = true;
                req.session.username = username;
                console.log('Login successful');
                return res.json({ success: true, message: 'Successful login!' });
            }
        }
        
        console.log('Login failed');
        return res.status(401).json({ success: false, message: 'Incorrect credentials!' });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Server error!' });
    }
});

// Выход
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error exiting!' });
        }
        res.json({ success: true, message: 'Successful exit!' });
    });
});

// API для проверки статуса авторизации
app.get('/api/auth-status', (req, res) => {
    res.json({
        isAuthenticated: req.session && req.session.isAuthenticated,
        username: req.session ? req.session.username : null
    });
});

// Защита всех остальных маршрутов
app.use('/api/*', requireAuth);

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Остановка сервера...');
    process.exit(0);
});