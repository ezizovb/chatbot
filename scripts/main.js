let kaiData = [];
fetch("scripts/kai_chatbot_base.json")
  .then((response) => response.json())
  .then((data) => (kaiData = data))
  .catch((error) => {
    console.error("database error", error);
    const elem = document.querySelector("footer");
    elem.style.boxShadow = "0 0 10px red";
    const inpBlock = document.getElementById("user-input");
    inpBlock.placeholder = "database error";
    inpBlock.style.color = "red";
    const spanElements = document.querySelector("span");
    spanElements.style.color = "red";
  });

function scrollToBottom() {
  const chatBox = document.getElementById("chat-box");
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 100);
}

function getKaiResponse(message) {
  const input = message.toLowerCase();
  const collator = new Intl.Collator("ru", { sensitivity: "base" });

  for (let pair of kaiData) {
    for (let keyword of pair.keywords) {
      if (collator.compare(input, keyword) === 0 || input.includes(keyword)) {
        if (Array.isArray(pair.reply)) {
          const randIndex = Math.floor(Math.random() * pair.reply.length);
          return pair.reply[randIndex];
        }
        return pair.reply;
      }
    }
  }

  return `<div class="errText">Бот в стадии разработки. Подробно...
     напиши: help</div>`;
}

function markdownToHTML(text) {
  return text
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
}

function appendMessage(className, message) {
  const chatBox = document.getElementById("chat-box");
  const htmlMessage = markdownToHTML(message);
  chatBox.innerHTML += `<div class='${className}'>${htmlMessage}</div>`;
}

function saveHistory() {
  const chatBox = document.getElementById("chat-box");
  localStorage.setItem("kai-chat-history", chatBox.innerHTML);
}

function loadHistory() {
  const saved = localStorage.getItem("kai-chat-history");
  if (saved) {
    document.getElementById("chat-box").innerHTML = saved;
  }
}

function sendMessage() {
  const inputField = document.getElementById("user-input");
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  appendMessage("you", userMessage);
  inputField.value = "";

  function debounceKaiReply() {
    const kaiReply = getKaiResponse(userMessage);
    appendMessage("kai", kaiReply);
    scrollToBottom();
  }
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout); // сбрасываем предыдущий таймер
      timeout = setTimeout(() => func.apply(this, args), wait); // запускаем новый
    };
  }
  const optimizedSearch = debounce(debounceKaiReply, 1500);
  saveHistory();
  scrollToBottom();
  optimizedSearch();
}

function toggleTheme() {
  const app = document.getElementById("app");
  const themeBtn = document.querySelector(".theme_btn");

  if (app.classList.contains("dark")) {
    app.classList.remove("dark");
    app.classList.add("light");
    themeBtn.innerHTML = "Dark mode";

    localStorage.setItem("kai-theme", "light");
  } else {
    app.classList.remove("light");
    app.classList.add("dark");
    themeBtn.innerHTML = "Light mode";

    localStorage.setItem("kai-theme", "dark");
  }
}

function clearHistory() {
  //   if (confirm("Точно очистить чат?")) {
  localStorage.removeItem("kai-chat-history");
  document.getElementById("chat-box").innerHTML = "";
  //   }
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem("kai-theme");
  const app = document.getElementById("app");

  if (savedTheme === "light") {
    app.classList.remove("dark");
    app.classList.add("light");
  } else {
    app.classList.remove("light");
    app.classList.add("dark");
  }
}

/*-------------------------------------*/

/*-------------------------------------*/

document.addEventListener("keyup", function (event) {
  if (event.code === "Enter") {
    sendMessage();
  }
  const inpElem = document.getElementById("user-input");
  const sendBtn = document.querySelector(".send");
  if (inpElem.value != "") {
    sendBtn.style.display = "block";
  }
  if (event.code === "Backspace") {
    if (inpElem.value === "") {
      sendBtn.style.display = "none";
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  applySavedTheme();
  loadHistory();
  scrollToBottom();
});

document.getElementById("user-input").addEventListener("focus", () => {
  setTimeout(scrollToBottom, 300);
});

function setViewportHeight() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
window.addEventListener("resize", setViewportHeight);
window.addEventListener("orientationchange", setViewportHeight); // для поворота дисп.
setViewportHeight(); // start

const animSearchPlaceholder = document.getElementById("user-input");
// console.log(animSearchPlaceholder.placeholder)

const words = [
  "привет|",
  "как дела|",
  "кто ты|",
  "погода|",
  "время|",
  "что умеешь|",
];
let currentWordIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;
let blinkCursor = document.createElement("span");
blinkCursor.classList.add("blinking-cursor");
animSearchPlaceholder.appendChild(blinkCursor);
function type() {
  const currentWord = words[currentWordIndex];
  if (isDeleting) {
    currentCharIndex--;
    animSearchPlaceholder.placeholder = currentWord.substring(
      0,
      currentCharIndex
    );
  } else {
    currentCharIndex++;
    animSearchPlaceholder.placeholder = currentWord.substring(
      0,
      currentCharIndex
    );
  }
  if (!isDeleting && currentCharIndex === currentWord.length) {
    isDeleting = true;
    setTimeout(type, 500); // pause before deleting
  } else if (isDeleting && currentCharIndex === 0) {
    isDeleting = false;
    currentWordIndex = (currentWordIndex + 1) % words.length;
    setTimeout(type, 500); // pause before typing next word
  } else {
    setTimeout(type, isDeleting ? 100 : 200);
  }
}
type();

// -----------------------------------------------
// dropdown — это кнопка/элемент, по которому мы кликаем, чтобы открыть список языков
const dropdown = document.querySelector(".dropdown");
// menu — сам выпадающий список языков
const menu = document.querySelector(".dropdown-content");
// langBtns — все кнопки, которые отвечают за смену языка
const langBtns = document.querySelectorAll(".btns");
// флаг: открыто ли меню или нет (true — открыто, false — закрыто)
let isMenuOpen = false;

// ===================== Функция для переключения меню =====================
// Срабатывает при клике на dropdown (если экран маленький, как на телефоне)
function toggleMenu(event) {
  if (window.innerWidth <= 768) {
    // Только для мобильных устройств
    event.stopPropagation(); // Останавливаем всплытие, чтобы меню не закрылось сразу
    isMenuOpen = !isMenuOpen; // Меняем значение флага на противоположное
    // Показываем или скрываем меню в зависимости от текущего состояния
    menu.style.display = isMenuOpen ? "block" : "none";
  }
}

// ===================== Функция для закрытия меню =====================
function closeMenu() {
  if (window.innerWidth <= 768 && isMenuOpen) {
    // Только на мобилках и если меню открыто
    isMenuOpen = false;
    menu.style.display = "none"; // Прячем меню
  }
}

// Клик по кнопке меню — запускаем toggleMenu
dropdown.addEventListener("click", toggleMenu);

// Клик вне меню — закрываем его
document.addEventListener("click", (event) => {
  if (!dropdown.contains(event.target)) {
    closeMenu();
  }
});

// ===================== Обработка кнопок смены языка =====================
langBtns.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.stopPropagation(); // Чтобы меню не схлопнулось до смены языка
    const lang = event.target.dataset.lang; // Получаем язык из data-lang кнопки
    localStorage.setItem("language", lang); // Сохраняем язык в памяти браузера
    // toggleTheme(); // Вызываем функцию, которая применяет язык
    closeMenu(); // И закрываем меню
  });
});
