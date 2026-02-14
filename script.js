// ===== PIN PAGE =====
const pinSecret = "0912";
let enteredPin = "";
const pinDots = document.querySelectorAll("#pinDisplay .dot");
const pinKeys = document.querySelectorAll("#pinPage .key");
const pinUnlockBtn = document.getElementById("unlockBtn");
const backspace = document.getElementById("backspaceBtn");

function updatePinDots() {
    pinDots.forEach((dot, idx) => {
        if (idx < enteredPin.length) {
            dot.innerHTML = "❤️";
            dot.classList.add("filled");
        } else {
            dot.innerHTML = "";
            dot.classList.remove("filled");
        }
    });
    pinUnlockBtn.disabled = enteredPin.length !== pinSecret.length;
}

// handle multiple same digits
pinKeys.forEach(key => {
    key.addEventListener("click", () => {
        const val = key.textContent.trim();
        if (key === backspace) {
            enteredPin = enteredPin.slice(0, -1);
            updatePinDots();
            return;
        }
        if (enteredPin.length < pinSecret.length) {
            enteredPin += val;
            updatePinDots();
        }
    });
});

pinUnlockBtn.addEventListener("click", () => {
    if(enteredPin === pinSecret){
        showPopup("You've unlocked my love 💖<br>Now catch my heart!", () => {
            showPage("page1");
            startHeartGame();
        });
    } else {
        showPopup("How can you forget? 😢 Try again!!", () => {
            enteredPin = "";
            updatePinDots();
        });
    }
});

// ===== PAGE NAVIGATION =====
function showPage(id){
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function showPopup(msg, callback){
    const popup = document.getElementById("popupModal");
    const text = document.getElementById("popupText");
    const okBtn = document.getElementById("popupOkBtn");
    text.innerHTML = msg;
    popup.style.display = "flex";
    okBtn.onclick = ()=>{
        popup.style.display = "none";
        if(callback) callback();
    }
}

// ===== HEART GAME =====
const page1 = document.getElementById("page1");
const bucket = document.getElementById("bucket");
const fountainImg = document.getElementById("fountainImg");

let bucketX = 0;
function initBucket(){
    const bucketWidth = bucket.offsetWidth;
    bucketX = page1.offsetWidth/2 - bucketWidth/2;
    bucket.style.left = bucketX + "px";

    document.addEventListener("mousemove", e=>{
        const rect = page1.getBoundingClientRect();
        const bucketWidth = bucket.offsetWidth;

        bucketX = e.clientX - rect.left - bucketWidth / 2;
        bucketX = Math.max(0, Math.min(page1.offsetWidth - bucketWidth, bucketX));
        bucket.style.left = bucketX + "px";
    });

    // Mobile touch support
    page1.addEventListener("touchmove", e=>{
        const rect = page1.getBoundingClientRect();
        const touchX = e.touches[0].clientX - rect.left;
        const bucketWidth = bucket.offsetWidth;
        bucketX = touchX - bucketWidth / 2;
        bucketX = Math.max(0, Math.min(page1.offsetWidth - bucketWidth, bucketX));
        bucket.style.left = bucketX + "px";
        e.preventDefault();
    }, {passive:false});
}

let bigHeartCaught = false;
let bigHeartTimer;
let first10SecTimer;

// create heart
function createHeart(x, y, size=25, velocityY=2, gravity=0.1, big=false){
    const scale = page1.offsetWidth / 800; // responsive scale
    size = size * scale;

    const heart = document.createElement("div");
    heart.innerHTML="💖";
    heart.classList.add("floating-heart");
    heart.style.left = x+"px";
    heart.style.top = y+"px";
    heart.style.fontSize = size+"px";
    page1.appendChild(heart);

    const driftX = (-1 + Math.random()*2) * scale; // drift scales too
    let caught=false;

    const interval = setInterval(()=>{
        let top = parseFloat(heart.style.top);
        let left = parseFloat(heart.style.left);
        velocityY += gravity;
        heart.style.top = (top+velocityY)+"px";
        heart.style.left = (left+driftX)+"px";
        heart.style.transform = `rotate(${Math.random()*360}deg)`;

        const heartRect = heart.getBoundingClientRect();
        const bucketRect = bucket.getBoundingClientRect();
        if(!caught && heartRect.bottom>bucketRect.top &&
           heartRect.top<bucketRect.bottom &&
           heartRect.left<bucketRect.right &&
           heartRect.right>bucketRect.left){
               caught = true;
               heart.remove();

               // --- Jump effect ---
               bucket.classList.add("jump");
               setTimeout(() => {
                   bucket.classList.remove("jump");
               }, 500);

               if(big && !bigHeartCaught){
                   bigHeartCaught = true;
                   clearTimeout(first10SecTimer);
                   showHeartPopup("You caught my heart! 💖<br>Happy Valentine's Day!", ()=>showPage("page2"));
               }
               clearInterval(interval);
               return;
        }

        if(top>page1.offsetHeight+50 || left<-50 || left>page1.offsetWidth+50){
            clearInterval(interval);
            heart.remove();
        }

    },20);
}

// Small hearts from top
function createFallingHearts(count=2){
    for(let i=0;i<count;i++){
        const x=Math.random()*(page1.offsetWidth-30);
        createHeart(x,-50,12+Math.random()*12,2+Math.random()*2,0.1,false);
    }
}

// Fountain hearts
function createFountainHearts(count=1){
    if(!fountainImg) return;
    const rect=fountainImg.getBoundingClientRect();
    const parentRect=page1.getBoundingClientRect();
    const x0 = rect.left - parentRect.left + rect.width/2;
    const y0 = rect.top - parentRect.top + rect.height/2;
    for(let i=0;i<count;i++){
        const size=12+Math.random()*12;
        const velocityY=-(4+Math.random()*2);
        createHeart(x0,y0,size,velocityY,0.3,false);
    }
}

// Big heart every 7 sec from both top and fountain
function createBigHeart(){
    if(!fountainImg) return;
    const rect=fountainImg.getBoundingClientRect();
    const parentRect=page1.getBoundingClientRect();
    const x0 = rect.left - parentRect.left + rect.width/2;
    const y0 = rect.top - parentRect.top + rect.height/2;

    const scale = page1.offsetWidth / 800;

    // from fountain
    createHeart(x0,y0,50*scale,-5,0.3,true);
    // from random top
    const rx = Math.random()*(page1.offsetWidth-50*scale);
    createHeart(rx,-50,50*scale,2,0.2,true);
}

// heart popup
function showHeartPopup(msg, callback){
    const popup = document.getElementById("heartPopup");
    const text = document.getElementById("heartPopupText");
    popup.style.display = "flex";
    text.innerHTML = msg;
    setTimeout(()=>{
        popup.style.display = "none";
        if(callback) callback();
    },3000);
}

// start game
function startHeartGame(){
    initBucket();
    setInterval(()=>createFallingHearts(2),400);
    setInterval(()=>createFountainHearts(1),700);
    bigHeartTimer = setInterval(createBigHeart,7000);

    first10SecTimer = setTimeout(() => {
        if (!bigHeartCaught) {
            showHeartPopup("Tirath, try harder!!", null, 200);
        }
    }, 5000);
}

// ===== QUESTION PAGE =====
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const container = document.getElementById("questionButtons");

// Ensure container is relative
container.style.position = "relative";
container.style.height = "200px";

// Let buttons sit normally at first
noBtn.style.position = "relative";
noBtn.style.cursor = "not-allowed";

// When mouse enters No button
noBtn.addEventListener("mouseenter", () => {
    const rect = noBtn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const currentLeft = rect.left - containerRect.left;
    const currentTop = rect.top - containerRect.top;

    noBtn.style.position = "absolute";
    noBtn.style.left = currentLeft + "px";
    noBtn.style.top = currentTop + "px";

    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;

    const maxX = containerRect.width - btnWidth;
    const maxY = containerRect.height - btnHeight;

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    noBtn.style.left = randomX + "px";
    noBtn.style.top = randomY + "px";
});

// Disable clicking
noBtn.addEventListener("click", (e) => e.preventDefault());

// Yes button works
yesBtn.addEventListener("click", () => showPage("finalPage"));
