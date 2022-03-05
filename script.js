const section = document.querySelector("section");
let currentCat ={};

let infoCard = document.createElement("div");
infoCard.className = "infoCard";
document.body.appendChild(infoCard);
let wrapper = document.createElement("div");
wrapper.className = "info-wrapper";
infoCard.appendChild(wrapper);

let addCatCard = document.querySelector('.addCatCard');
let addCatForm = addCatCard.querySelector('.addCat');
let cancelAddButton = addCatCard.querySelector('.cancel');
let editCatCard = document.querySelector('.editCatCard');
let editCatForm = editCatCard.querySelector('.editCat');
let cancelEditButton = editCatCard.querySelector('.cancel');

buttonUpdate = document.querySelector(".button__update");
buttonAddNewCat = document.querySelector(".button__add");

const authForm = document.querySelector(".authorization");
const authInput = authForm.querySelector(".authorization__input");



// ф-я записи в локальное хранилище

function setLocalStorage(key, data) {
	localStorage.setItem(key, JSON.stringify(data));
}

// ф-я запроса данных из локального хранилища

function getLocalStorage(key) {
	return JSON.parse(localStorage.getItem(key));
}

// ф-я проверки наличия куки, т.е. авторизации

function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
	  "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? true : false;
}

// ф-я обновления локального хранилища

function updateData() {
	if (getCookie('User')) {
		localStorage.clear();
		section.innerHTML = "";
		getCards();
	} else {
			alert("Пожалуйста, пройдите авторизацию");
		}	
}

// ф-я открытия окна с информацией о котике

function showInfo(data) {
	currentCat = data;
	infoCard.classList.add("active");
	wrapper.innerHTML = `
		  <img class="infoCard-img" src="${data.img_link}" alt="${data.name}">
		  <div class="info">
				<h2>${data.name}</h2>
				<h3>Полных лет: ${data.age}</h3>
				<p>${data.description}</p>
		  </div>
		  <button type="button" class="button__main infoCard-edit">Редактировать</button>
		  <button type="button" class="button__main infoCard-delete">Удалить</button>
		  <button type="button" class="infoCard-close" onclick="closeInfo()"></button>
		  `;
	buttonDeleteCat = infoCard.querySelector('.infoCard-delete');
	buttonDeleteCat.addEventListener('click', deleteCat);
	
	buttonEditCat = infoCard.querySelector('.infoCard-edit');
	buttonEditCat.addEventListener('click', openEditCatCard);
}
	
// ф-я закрытия окна с информацией о котике
	
function closeInfo() {
infoCard.classList.remove("active");
}
	
// ф-я получения данных для создания карточек

function getCards() {
	if(getLocalStorage('Cats')?.length) {
		createCards(getLocalStorage('Cats'));
	} else {
			api.getAllCats()
					.then(dataCats => {
						if (dataCats.message === "ok") {
							setLocalStorage('Cats', dataCats.data);
							createCards(dataCats.data);
							console.log('Я беру данные с сервера');
						}
					})
					.catch(err => {
						console.log(err);
					})
	}
}

// ф-я создания карточек с котиками
	
function createCards(data) {
	for (let i of data) {
		let card = document.createElement("div");
		card.className = "card";
		card.innerHTML = `
		<div class="card-img" style="background-image: url(${i["img_link"]})"></div>
		<h3>${i["name"]}</h3>`;
		section.append(card);
		let rate = document.createElement("div");
		rate.className = "rate";
		for (let j=1; j<=i["rate"]; j++) {
			rate.innerHTML += `<img class="rate-img" src="img/cat-fill.svg" alt="Rate">`;
		}
		for (let k=i["rate"]+1; k<=10; k++) {
			rate.innerHTML += `<img class="rate-img" src="img/cat-stroke.svg" alt="Rate">`;
		}
		card.append(rate);
		let heart = document.createElement("div");
		heart.className = "favourite";
		if (i["favourite"]) {
			heart.innerHTML = `<img class="heart-img" src="img/heart-fill.png" alt="favourite">`;
		} else {
			heart.innerHTML = `<img class="heart-img" src="img/heart-stroke.png" alt="favourite">`;
		}
		card.append(heart);
		card.addEventListener("click", function() {
			showInfo(i);
		})
	}
}

// ф-я открытия формы для добавления котика

function openAddCatCard() {
	if (getCookie('User')) {
		addCatCard.classList.add("active");
	} else {
		alert("Пожалуйста, пройдите авторизацию");
	}
}

// ф-я открытия формы для изменения котика

function openEditCatCard() {
		closeInfo();
		editCatCard.classList.add("active");
		editCatCard.scrollIntoView();
		document.getElementById('editCat_name').value = currentCat.name;
		document.getElementById('editCat_img_link').value = currentCat.img_link;
		document.getElementById('editCat_rate').value = currentCat.rate;
		document.getElementById('editCat_age').value = currentCat.age;
		document.getElementById('editCat_favourite').value = currentCat.favourite;
		document.getElementById('editCat_description').value = currentCat.description;
}

// ф-я удаления котика с предварительным уведомлением об удалении

function deleteCat() {
	const access = confirm('Вы действительно хотите удалить');

    if(access){
		api.deleteCat(currentCat.id)
		.then(updateData);
		closeInfo();
	 }
}



// запись куки при авторизации

authForm.addEventListener("submit", (e) => {
	e.preventDefault();
	if (authInput.value.trim() !== "") {
		document.cookie = `User=${authInput.value}; secure; samesite=lax`;
		authInput.value = "";
		location.reload();
	} else {
		alert('Введите данные перед сохранением');
	}
})

// обновление локального хранилища

buttonUpdate.addEventListener('click', updateData);

// создание карточек с котиками при наличии авторизации

if (getCookie('User')) {
	getCards();
}

// отправка на сервер изменений котика, обновление хранилища, закрытие формы

editCatForm.addEventListener('submit', (e) => {
	e.preventDefault();
	let body = {};
	body[document.getElementById('editCat_name').name] = document.getElementById('editCat_name').value;
	body[document.getElementById('editCat_img_link').name] = document.getElementById('editCat_img_link').value;
	body[document.getElementById('editCat_rate').name] = document.getElementById('editCat_rate').value;
	body[document.getElementById('editCat_age').name] = document.getElementById('editCat_age').value;
	body[document.getElementById('editCat_favourite').name] = document.getElementById('editCat_favourite').value;
	body[document.getElementById('editCat_description').name] = document.getElementById('editCat_description').value;

	api.updateCat(currentCat.id, body)
	.then(updateData);

	editCatCard.classList.remove("active");
})

// отмена изменения котика

cancelEditButton.addEventListener('click', () => editCatCard.classList.remove("active"));

// открытие формы добавления котика

buttonAddNewCat.addEventListener('click', openAddCatCard);

// отправка на сервер нового котика, обновление хранилища, закрытие формы

addCatForm.addEventListener('submit', (e) => {
	e.preventDefault();
	let body = {};
	body[document.getElementById('addCat_id').name] = document.getElementById('addCat_id').value;
	body[document.getElementById('addCat_name').name] = document.getElementById('addCat_name').value;
	body[document.getElementById('addCat_img_link').name] = document.getElementById('addCat_img_link').value;
	body[document.getElementById('addCat_rate').name] = document.getElementById('addCat_rate').value;
	body[document.getElementById('addCat_age').name] = document.getElementById('addCat_age').value;
	body[document.getElementById('addCat_favourite').name] = document.getElementById('addCat_favourite').value;
	body[document.getElementById('addCat_description').name] = document.getElementById('addCat_description').value;

	api.addCat(body)
	.then(updateData);

	addCatCard.classList.remove("active");
})

// отмена добавления котика

cancelAddButton.addEventListener('click', () => addCatCard.classList.remove("active"));
