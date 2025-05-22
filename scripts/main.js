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

function sendMessage() {
  const inputField = document.getElementById("user-input");
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML += `<div class='you'>${userMessage}</div>`;
  inputField.value = "";

  debounceKaiResponse(userMessage);
  scrollToBottom();
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const debounceKaiResponse = debounce((userMessage) => {
  const chatBox = document.getElementById("chat-box");
  const kaiReply = getKaiResponse(userMessage);
  chatBox.innerHTML += `<div class='kai'>${kaiReply}</div>`;
  scrollToBottom();
}, 1500);

document.addEventListener("keyup", function (event) {
  if (event.code === "Enter") {
    sendMessage();
  }
  const inpElem = document.getElementById("user-input");
  const sendBtn = document.getElementById("btn_send");
  if (inpElem.value != "") {
    sendBtn.style.display = "block";
  }
  if (event.code === "Backspace") {
    if (inpElem.value === "") {
      sendBtn.style.display = "none";
    }
  }
});

const animSearchPlaceholder = document.getElementById("user-input");
// console.log(animSearchPlaceholder.placeholder)

const words = [
  "привет|",
  "кто ты|",
  "анекдот|",
  "погода|",
  "время|",
  "я устал|",
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

function setViewportHeight() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
window.addEventListener("resize", setViewportHeight);
window.addEventListener("orientationchange", setViewportHeight); // для поворота дисп.
setViewportHeight(); // start
