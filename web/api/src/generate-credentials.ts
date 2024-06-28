// Don't include 0/o or 1/l to avoid confusion
const characters = 'abcdefghijkmnpqrstuvwxyz23456789';

const randomString = (length: number) => Array.from(
    { length },
    () => characters[Math.floor(Math.random() * characters.length)],
).join('');

(() => {
    const username = randomString(6);
    const password = randomString(6);

    console.log(`Username: ${username}\nPassword: ${password}`);
})();
