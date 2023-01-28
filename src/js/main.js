import '../css/style.css';
import { addHighScore, getHighScore } from './utils';
import bgmMusic from '../assets/sound/bgm.ogg';
import bomb from '../assets/sound/bomb.WAV';
import gameover from '../assets/sound/gameover.WAV';
import gunshot from '../assets/sound/gunshot.wav';
import hurt from '../assets/sound/hurt.mp3';
import miss from '../assets/sound/miss.wav';
import reload from '../assets/sound/reload.wav';

let stats = {
	score: 0,
	lives: 3,
	bullets: 8,
	canReload: true,
};
let elementPos = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
];
const RENDER_STATS = 'render-stats';
const RENDER_ELEMENT = 'render-element';
const givenTime = 3000; //IN MILISECONDS
const bgm = new Audio(bgmMusic);

//MAKE BGM LOOPING AND MAKE THE LOOP SEAMLESS
bgm.addEventListener('timeupdate', function () {
	let buffer = 0.33;
	if (this.currentTime > this.duration - buffer) {
		this.currentTime = 0;
	}
});

const randNumber = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const pickPosition = () => {
	let row = randNumber(0, 2);
	let col = randNumber(0, 2);
	while (elementPos[row][col] !== 0) {
		row = randNumber(0, 2);
		col = randNumber(0, 2);
	}
	return [row, col];
};

const removeElement = (pos) => {
	const colPos = pos % 3;
	if (pos < 3) elementPos[0][colPos] = 0;
	else if (pos < 6) elementPos[1][colPos] = 0;
	else if (pos < 9) elementPos[2][colPos] = 0;
	document.dispatchEvent(new Event(RENDER_ELEMENT));
};

const reduceLives = (value) => {
	stats.lives -= value;
};

const enemyEscape = () => {
	for (const elementPosRow of elementPos) {
		for (const elementPosCol of elementPosRow) {
			if (elementPosCol === 1) {
				return true;
			}
		}
	}
	return false;
};

const timesUp = () => {
	if (enemyEscape()) {
		const hurtSound = new Audio(hurt);
		hurtSound.play();
		reduceLives(1);
	}
	elementPos = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0],
	];
	document.dispatchEvent(new Event(RENDER_ELEMENT));
	document.dispatchEvent(new Event(RENDER_STATS));
};

const shotEnemy = (pos) => {
	if (stats.lives > 0 && stats.bullets > 0) {
		const gunSound = new Audio(gunshot);
		gunSound.play();
		removeElement(pos);
		stats.score += 10;
		stats.bullets--;
		document.dispatchEvent(new Event(RENDER_STATS));
	}
};

const shotEmptyEnemy = () => {
	if (stats.lives > 0 && stats.bullets > 0) {
		const missSound = new Audio(miss);
		missSound.play();
		stats.bullets--;
		document.dispatchEvent(new Event(RENDER_STATS));
	}
};

const shotHostage = (pos) => {
	if (stats.lives > 0 && stats.bullets > 0) {
		const hurtSound = new Audio(hurt);
		hurtSound.play();
		removeElement(pos);
		reduceLives(1);
		stats.bullets--;
		document.dispatchEvent(new Event(RENDER_STATS));
	}
};

const shotBomb = (pos) => {
	if (stats.lives > 0 && stats.bullets > 0) {
		const bombSound = new Audio(bomb);
		bombSound.play();
		removeElement(pos);
		reduceLives(3);
		stats.bullets--;
		document.dispatchEvent(new Event(RENDER_STATS));
	}
};

const reloadGuns = () => {
	if (stats.lives > 0 && stats.canReload) {
		const reloadSound = new Audio(reload);
		reloadSound.play();
		stats.canReload = false;
		stats.bullets = 0;
		const timesToReload = 2000; //IN MILISECONDS
		document.dispatchEvent(new Event(RENDER_STATS));
		setTimeout(() => {
			stats.canReload = true;
			stats.bullets = 8;
			document.dispatchEvent(new Event(RENDER_STATS));
		}, timesToReload);
	}
};

const createEnemy = (pos) => {
	const enemy = document.createElement('div');
	enemy.classList.add('enemy');
	enemy.addEventListener('click', () => {
		shotEnemy(pos);
	});
	return enemy;
};

const createEmptyEnemy = () => {
	const emptyEnemy = document.createElement('div');
	emptyEnemy.classList.add('empty');
	emptyEnemy.addEventListener('click', () => {
		shotEmptyEnemy();
	});
	return emptyEnemy;
};

const createHostage = (pos) => {
	const hostage = document.createElement('div');
	hostage.classList.add('hostage');
	hostage.addEventListener('click', () => {
		shotHostage(pos);
	});
	return hostage;
};

const createBomb = (pos) => {
	const bomb = document.createElement('div');
	bomb.classList.add('bomb');
	bomb.addEventListener('click', () => {
		shotBomb(pos);
	});
	return bomb;
};

const elementAppear = () => {
	const numberOfEnemy = randNumber(1, 5);
	for (let i = 1; i <= numberOfEnemy; i++) {
		const enemyIndex = pickPosition();
		elementPos[enemyIndex[0]][enemyIndex[1]] = 1;
	}
	const numberOfHostage = randNumber(0, 2);
	for (let i = 1; i <= numberOfHostage; i++) {
		const hostageIndex = pickPosition();
		elementPos[hostageIndex[0]][hostageIndex[1]] = 2;
	}
	const numberOfBomb = randNumber(0, 2);
	for (let i = 1; i <= numberOfBomb; i++) {
		const bombIndex = pickPosition();
		elementPos[bombIndex[0]][bombIndex[1]] = 3;
	}
	document.dispatchEvent(new Event(RENDER_ELEMENT));
	setTimeout(() => {
		timesUp();
	}, givenTime);
};

const scoreScreen = async () => {
	const container = document.createElement('div');
	container.classList.add('w-100');
	const title = document.createElement('h1');
	title.innerText = 'High Score';
	const subtitle = document.createElement('p');
	subtitle.classList.add('mb-1');
	subtitle.innerText = 'Peringkat 10 besar';
	const table = document.createElement('table');
	table.classList.add('table-score');
	table.innerHTML = `
	<tr>
		<th>Loading Data</th>
	</tr>
	`;
	getHighScore().then(scores => {
		scores.length = 10;
		table.innerHTML = `
			<tr>
				<th>No</th>
				<th>Nama</th>
				<th>Skor</th>
			</tr>
		`;
		scores.forEach((score, index) => {
			const tr = document.createElement('tr');
			tr.innerHTML = `
				<td>${index + 1}</td>
				<td>${score.name}</td>
				<td>${score.score}</td>
			`;
			table.innerHTML += tr.outerHTML;
		});
	});
	container.append(title, subtitle, table);
	const button = document.createElement('button');
	button.classList.add('button');
	button.innerText = 'Menu Utama';
	button.addEventListener('click', () => {
		toggleScreen();
		toggleScreen(startScreen());
	});
	container.appendChild(button);
	const menu = document.querySelector('.menu');
	menu.innerHTML = '';
	menu.appendChild(container);
};

const gameOverScreen = () => {
	const container = document.createElement('div');
	const title = document.createElement('h1');
	title.classList.add('start-title');
	title.innerText = 'GAME UDAHAN';
	const score = document.createElement('h3');
	score.innerText = `Skor Akhir: ${stats.score}`;
	const form = document.createElement('form');
	const nameInput = document.createElement('input');
	nameInput.classList.add('name-input');
	nameInput.setAttribute('type', 'text');
	nameInput.setAttribute('placeholder', 'Masukkan Nama Kamu');
	nameInput.setAttribute('required', '');
	nameInput.setAttribute('maxlength', '15');
	const button = document.createElement('button');
	button.classList.add('button');
	button.setAttribute('type', 'submit');
	button.innerText = 'Oke';
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		if (nameInput.value.trim().length !== 0) {
			addHighScore(nameInput.value, stats.score);
			scoreScreen();
		}
		else alert('Isi nama yang bener!');
	});
	form.append(nameInput, button);
	container.append(title, score, form);
	return container;
};

const loadingScreen = () => {
	const container = document.createElement('div');
	const title = document.createElement('h1');
	title.classList.add('loading');
	title.innerText = 'LOADING';
	container.appendChild(title);
	return container;
};

const startScreen = () => {
	const container = document.createElement('div');
	container.classList.add('start-screen');
	const title = document.createElement('h1');
	title.classList.add('start-title');
	title.innerText = 'Shoot It!';
	const copyright = document.createElement('p');
	copyright.innerHTML = 'Copyright &copy; Muhammad Rizky Fadhillah 2022';
	const startButton = document.createElement('button');
	startButton.classList.add('button');
	startButton.innerText = 'Mulai';
	startButton.addEventListener('click', () => {
		toggleScreen();
		startGame();
	});
	const scoreButton = document.createElement('button');
	scoreButton.classList.add('button');
	scoreButton.innerText = 'Cek High Score';
	scoreButton.addEventListener('click', () => {
		scoreScreen();
	});
	const socialMedia = document.createElement('div');
	socialMedia.classList.add('social-media');
	const socialMediaValue = [
		{
			icon: '<i class="fa-brands fa-github"></i>',
			url: 'https://github.com/rizfadh',
		},
		{
			icon: '<i class="fa-brands fa-linkedin"></i>',
			url: 'https://www.linkedin.com/in/rizfadh/',
		},
		{
			icon: '<i class="fa-brands fa-facebook"></i>',
			url: 'https://facebook.com/rizkyfadh46/',
		},
	];
	socialMediaValue.forEach((element) => {
		const span = document.createElement('span');
		span.innerHTML = `<a href="${element.url}" target="_blank">${element.icon}</a>`;
		socialMedia.appendChild(span);
	});
	container.append(title, startButton, scoreButton, copyright, socialMedia);
	return container;
};

const toggleScreen = (element = null) => {
	const menu = document.querySelector('.menu');
	menu.innerHTML = '';
	if (element) menu.appendChild(element);
	menu.classList.toggle('invisible');
};

const makeElementAppear = () => {
	const appear = setInterval(() => {
		if (stats.lives >= 1) {
			elementAppear();
		} else {
			//GAME OVER
			clearInterval(appear);
			toggleScreen(gameOverScreen());
			bgm.pause();
			const gameOverSound = new Audio(gameover);
			gameOverSound.play();
		}
	}, givenTime + 500);
};

const makeIcon = (amount) => {
	const icons = [];
	for (let i = 1; i <= amount; i++) {
		const icon = document.createElement('span');
		icons.push(icon);
	}
	return icons;
};

document.addEventListener(RENDER_STATS, () => {
	const score = document.querySelector('#score');
	const lives = document.querySelector('#lives');
	const bullets = document.querySelector('#bullets');
	score.innerText = stats.score;
	lives.innerText = stats.lives;
	lives.innerHTML = '';
	bullets.innerHTML = '';
	const livesElement = makeIcon(stats.lives);
	lives.append(...livesElement);
	const bulletsElement = makeIcon(stats.bullets);
	bullets.append(...bulletsElement);
});

document.addEventListener(RENDER_ELEMENT, () => {
	const elementSpot = document.querySelectorAll('.element-spot');
	elementSpot.forEach((e) => {
		e.innerHTML = '';
	});
	let index = -1;
	for (const elementPosRow of elementPos) {
		for (const elementPosCol of elementPosRow) {
			index++;
			if (elementPosCol === 1) {
				const enemy = createEnemy(index);
				elementSpot[index].appendChild(enemy);
			} else if (elementPosCol === 2) {
				const hostage = createHostage(index);
				elementSpot[index].appendChild(hostage);
			} else if (elementPosCol === 3) {
				const bomb = createBomb(index);
				elementSpot[index].appendChild(bomb);
			} else {
				const emptyEnemy = createEmptyEnemy();
				elementSpot[index].appendChild(emptyEnemy);
			}
		}
	}
});

const startGame = () => {
	bgm.currentTime = 0;
	bgm.play();
	stats = {
		score: 0,
		lives: 3,
		bullets: 8,
		canReload: true,
	};
	document.dispatchEvent(new Event(RENDER_ELEMENT));
	document.dispatchEvent(new Event(RENDER_STATS));
	const reloadButton = document.querySelector('#reload');
	reloadButton.addEventListener('click', () => {
		reloadGuns();
	});
	makeElementAppear();
};

toggleScreen(loadingScreen());

window.addEventListener('load', () => {
	toggleScreen();
	toggleScreen(startScreen());
})
