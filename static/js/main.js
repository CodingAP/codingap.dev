// ~~~~~~~~ generate circles in background for bigger displays ~~~~~~~~
const circleContainer = document.querySelector('#circle-container');

const circleCount = 10 * Math.max(2, Math.round(document.body.clientHeight / 500));
for (let i = 0; i < circleCount; i++) {
    // create circle with randomized position
    // make each half go to side
    const circle = document.createElement('div');
    const x = Math.random() * 90;
    const y = Math.random() * 100;
    const alpha = Math.random() * 0.5 + 0.25;
    const size = Math.random() * 60 + 40;

    circle.className = 'circle';

    // position circles
    circle.style.left = `${x}%`;
    circle.style.top = `calc(${y}% - 100px)`;
    circle.style.width = `${size}px`;
    circle.style.backgroundColor = `rgba(42, 65, 88, ${alpha})`;

    circleContainer.appendChild(circle);
};

// ~~~~~~~~ handle dynamic navbar ~~~~~~~~
const navbar = document.querySelector('.navbar');
const mobileMenu = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('#menu');
const hamburger = document.querySelector('#hamburger');

// populate mobile menu with the same links as desktop menu
mobileMenu.innerHTML = navLinks.innerHTML;

hamburger.addEventListener('click', () => {
    // place menu right below navbar
    mobileMenu.classList.toggle('open');
    mobileMenu.style.top = `${navbar.clientHeight}px`;
});