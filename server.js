const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const path = require('path');

const app = express();
const port = 3000;

// Хранение пользователей (массив для примера)
let users = [];

// Настройка сессий
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

// Настройка Nunjucks для рендеринга шаблонов .njk
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// Указание папки с публичными файлами (статическими)
app.use(express.static(path.join(__dirname, 'public')));

// Настройка для обработки данных форм (POST)
app.use(express.urlencoded({ extended: true }));

// Маршрут для главной страницы (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Загружаем index.html из папки public
});

// Маршрут для страницы логина (login.njk)
app.get('/login', (req, res) => {
    res.render('login.njk', { error: null });
});

// Обработка POST запроса на логин
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Проверка имени пользователя и пароля
    const user = users.find(user => user.username === username && user.password === password);
    
    if (user) {
        req.session.username = username; // Сохраняем имя пользователя в сессии
        res.redirect('/'); // Перенаправляем на главную страницу
    } else {
        // Если данные неверны, возвращаем страницу логина с ошибкой
        res.render('login.njk', { error: 'Неверное имя пользователя или пароль.' });
    }
});

// Маршрут для страницы регистрации (register.njk)
app.get('/register', (req, res) => {
    res.render('register.njk', { error: null });
});

// Обработка POST запроса на регистрацию
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Проверяем, не существует ли уже такого пользователя
    const userExists = users.find(user => user.username === username);

    if (userExists) {
        res.render('register.njk', { error: 'Пользователь с таким именем уже существует.' });
    } else {
        // Сохраняем нового пользователя
        users.push({ username, password });
        req.session.username = username; // Сохраняем имя пользователя в сессии
        res.redirect('/'); // Перенаправляем на главную страницу после регистрации
    }
});

// Маршрут для выхода из системы (logout)
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Обработка всех остальных страниц, таких как gallery, contact и т.д.
app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'public', `${page}.html`);

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('Страница не найдена');
        }
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}/login`);
});
