document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const messageEl = document.getElementById('message');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Проверяем, авторизован ли уже пользователь
    checkAuthStatus();

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showMessage('Заполните все поля!', 'error');
            return;
        }

        // Показываем загрузку
        setLoading(true);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                showMessage(data.message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Ошибка подключения к серверу!', 'error');
        } finally {
            setLoading(false);
        }
    });

    // Проверка авторизации
    async function checkAuthStatus() {
        try {
            const response = await fetch('/api/auth-status');
            const data = await response.json();
            
            if (data.isAuthenticated) {
                window.location.href = '/';
            }
        } catch (error) {
            console.log('Not authenticated');
        }
    }

    function setLoading(isLoading) {
        loginBtn.disabled = isLoading;
        
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';
        } else {
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
        }
    }

    function showMessage(message, type) {
        messageEl.textContent = message;
        messageEl.className = `message ${type} show`;
        
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 5000);
    }


});

// Функция для переключения видимости пароля
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggle = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggle.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggle.textContent = '👁️';
    }
}