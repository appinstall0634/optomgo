const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔐 Генератор хэша пароля для OptomGo\n');

rl.question('Введите новый пароль: ', async (password) => {
    if (password.length < 6) {
        console.log('❌ Пароль должен содержать минимум 6 символов!');
        rl.close();
        return;
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        console.log('\n✅ Пароль успешно захэширован!');
        console.log('📋 Скопируйте эту строку в server.js:');
        console.log(`password: '${hashedPassword}'`);
        console.log('\n🔧 Замените строку в объекте ADMIN_USER');
        
    } catch (error) {
        console.error('❌ Ошибка при хэшировании:', error);
    }
    
    rl.close();
});