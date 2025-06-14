const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
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

// Для Vercel - правильная настройка статических файлов
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
} else {
    app.use(express.static('public'));
}

// Конфигурация сессий
app.use(session({
    secret: process.env.SESSION_SECRET || 'optomgo-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true для HTTPS в production
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
                return res.json({ success: true, message: 'Успешный вход!' });
            }
            
            const isValidPassword = await bcrypt.compare(password, ADMIN_USER.password);
            console.log('Password valid:', isValidPassword);
            
            if (isValidPassword) {
                req.session.isAuthenticated = true;
                req.session.username = username;
                console.log('Login successful');
                return res.json({ success: true, message: 'Успешный вход!' });
            }
        }
        
        console.log('Login failed');
        return res.status(401).json({ success: false, message: 'Неверные учетные данные!' });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Ошибка сервера!' });
    }
});

// Выход
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ошибка при выходе!' });
        }
        res.json({ success: true, message: 'Успешный выход!' });
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
    console.log(`📝 Логин: ${ADMIN_USER.username}`);
    console.log(`🔑 Пароль: password123`);
    console.log(`🔒 Для смены пароля используйте: node hashPassword.js`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Остановка сервера...');
    process.exit(0);
});