const $ = (id) => document.getElementById(id);
const squirrel = $("squirrel"), magicBox = $("magicBox"), storyCopy = $("storyCopy"),
      storyTitle = $("storyTitle"), storyText = $("storyText"), progressBar = $("progressBar"),
      authShell = $("authShell"), loginForm = $("loginForm"), registerForm = $("registerForm"),
      loginTab = $("loginTab"), registerTab = $("registerTab"), nameInput = $("name"), emailInput = $("email"),
      passwordInput = $("password"), termsInput = $("terms"), loginEmail = $("loginEmail"),
      loginPassword = $("loginPassword"), rememberMe = $("rememberMe"), toast = $("toast"),
      musicBtn = $("musicBtn"), musicLabel = $("musicLabel");

let storyToken = 0, toastTimer = null, soundOn = false, audioContext = null, masterGain = null, ambienceTimer = null;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function setStory(title, text){ storyTitle.textContent = title; storyText.textContent = text; }
function progress(v){ progressBar.style.width = v + "%"; }

function makeLeaves(count=10){
  const layer = $("leafLayer");
  for(let i=0;i<count;i++){
    const leaf=document.createElement("i"); leaf.className="leaf";
    leaf.style.left=(Math.random()*100)+"%";
    leaf.style.setProperty("--drift",((Math.random()-.5)*180)+"px");
    leaf.style.animationDuration=(4+Math.random()*4)+"s";
    leaf.style.animationDelay=(Math.random()*.7)+"s";
    layer.appendChild(leaf); setTimeout(()=>leaf.remove(),9000);
  }
}
function resetScene(){
  storyToken++;
  authShell.classList.remove("show","success"); authShell.setAttribute("aria-hidden","true");
  storyCopy.classList.remove("hidden"); magicBox.classList.remove("show","open"); squirrel.classList.remove("walking");
  squirrel.style.left="29%"; squirrel.style.top="12%"; progress(4);
}

async function runStory(){
  const token=++storyToken;
  resetStoryOnly();
  setStory("A quiet morning...","Someone is sitting on the old roof."); progress(8); await wait(1200); if(token!==storyToken)return;
  setStory("A little visitor.","The squirrel is coming down from the roof..."); progress(19);
  squirrel.style.left=window.innerWidth<700?"31%":"32%"; squirrel.style.top=window.innerWidth<700?"24%":"25%";
  await wait(1150); if(token!==storyToken)return;
  squirrel.classList.add("walking");
  setStory("Down the path...","Something shiny is waiting near the house."); progress(34);
  squirrel.style.left=window.innerWidth<700?"66%":"70%"; squirrel.style.top=window.innerWidth<700?"60%":"61%";
  magicBox.classList.add("show"); makeLeaves(7);
  await wait(1700); if(token!==storyToken)return;
  squirrel.classList.remove("walking"); setStory("A mysterious little box...","The squirrel has found the secret."); progress(55);
  await wait(850); if(token!==storyToken)return;
  magicBox.classList.add("open"); makeLeaves(12); setStory("Welcome to Forestly ✨","The little forest door is opening for you."); progress(76);
  await wait(1050); if(token!==storyToken)return;
  storyCopy.classList.add("hidden"); authShell.classList.add("show"); authShell.setAttribute("aria-hidden","false"); progress(100);
  setTimeout(()=>loginEmail.focus(),550);
}
function resetStoryOnly(){
  storyCopy.classList.remove("hidden"); magicBox.classList.remove("show","open"); squirrel.classList.remove("walking");
  squirrel.style.left="29%"; squirrel.style.top="12%";
}
function restart(){ resetScene(); setTimeout(runStory,80); }

function showToast(msg){ clearTimeout(toastTimer); toast.textContent=msg; toast.classList.add("show"); toastTimer=setTimeout(()=>toast.classList.remove("show"),2800); }
function clearErrors(){ document.querySelectorAll(".error").forEach(x=>x.textContent=""); document.querySelectorAll("input").forEach(x=>x.classList.remove("invalid")); termsInput.parentElement.style.color=""; }
function setError(input,id,msg){ input.classList.add("invalid"); $(id).textContent=msg; }

function switchMode(mode){
  authShell.classList.remove("success"); clearErrors();
  if(mode==="register"){
    loginForm.hidden=true; registerForm.hidden=false; loginTab.classList.remove("active"); registerTab.classList.add("active");
    $("authKicker").textContent="WELCOME TO THE FOREST"; $("authTitle").textContent="Create your account"; $("authSubtitle").textContent="A quiet little place for curious people.";
    setTimeout(()=>nameInput.focus(),120);
  }else{
    registerForm.hidden=true; loginForm.hidden=false; registerTab.classList.remove("active"); loginTab.classList.add("active");
    $("authKicker").textContent="WELCOME BACK"; $("authTitle").textContent="Enter the forest"; $("authSubtitle").textContent="Sign in and continue your little forest story.";
    setTimeout(()=>loginEmail.focus(),120);
  }
}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
function validateRegister(){
  clearErrors(); let ok=true, n=nameInput.value.trim(), e=emailInput.value.trim(), p=passwordInput.value;
  if(n.length<2){setError(nameInput,"nameError","Please enter your full name.");ok=false}
  if(!validEmail(e)){setError(emailInput,"emailError","Please enter a valid email address.");ok=false}
  if(p.length<6){setError(passwordInput,"passwordError","Password must be at least 6 characters.");ok=false}
  if(!termsInput.checked){termsInput.parentElement.style.color="#c75c4d";ok=false}
  return ok;
}
function validateLogin(){
  $("loginEmailError").textContent=""; $("loginPasswordError").textContent=""; loginEmail.classList.remove("invalid"); loginPassword.classList.remove("invalid");
  let ok=true,e=loginEmail.value.trim(),p=loginPassword.value;
  if(!validEmail(e)){setError(loginEmail,"loginEmailError","Please enter a valid email address.");ok=false}
  if(!p){setError(loginPassword,"loginPasswordError","Please enter your password.");ok=false}
  return ok;
}
function getUser(){try{return JSON.parse(localStorage.getItem("forestlyUser"))||null}catch{return null}}
function saveUser(user){localStorage.setItem("forestlyUser",JSON.stringify(user));}
function escapeHtml(v){const d=document.createElement("div");d.textContent=v;return d.innerHTML}

registerForm.addEventListener("submit",e=>{
  e.preventDefault(); if(!validateRegister())return;
  const old=getUser(); const email=emailInput.value.trim().toLowerCase();
  if(old && old.email.toLowerCase()===email){setError(emailInput,"emailError","This email is already registered. Please login.");return;}
  const user={name:nameInput.value.trim(),email:emailInput.value.trim(),password:passwordInput.value}; saveUser(user);
  $("successName").textContent=user.name; $("successTitle").textContent="You're officially in."; $("successText").innerHTML=`Welcome, <strong>${escapeHtml(user.name)}</strong>. Your forest account has been created.`;
  authShell.classList.add("success"); playSuccessSound(); confetti();
});
loginForm.addEventListener("submit",e=>{
  e.preventDefault(); if(!validateLogin())return; const user=getUser();
  if(!user){showToast("No account found. Please register first.");switchMode("register");return}
  if(loginEmail.value.trim().toLowerCase()!==user.email.toLowerCase() || loginPassword.value!==user.password){setError(loginPassword,"loginPasswordError","Email or password is incorrect.");return}
  if(rememberMe.checked)localStorage.setItem("forestlyRemember","true"); else localStorage.removeItem("forestlyRemember");
  $("successName").textContent=user.name; $("successTitle").textContent="Welcome back!"; $("successText").innerHTML=`Hello, <strong>${escapeHtml(user.name)}</strong>. The forest remembers you.`;
  authShell.classList.add("success"); playSuccessSound(); confetti();
});

$("showPass").addEventListener("click",()=>{const v=passwordInput.type==="text";passwordInput.type=v?"password":"text";$("showPass").textContent=v?"Show":"Hide"});
$("loginShowPass").addEventListener("click",()=>{const v=loginPassword.type==="text";loginPassword.type=v?"password":"text";$("loginShowPass").textContent=v?"Show":"Hide"});
loginTab.addEventListener("click",()=>switchMode("login")); registerTab.addEventListener("click",()=>switchMode("register"));
$("goRegister").addEventListener("click",()=>switchMode("register")); $("goLogin").addEventListener("click",()=>switchMode("login"));
$("forgotBtn").addEventListener("click",()=>showToast("For a real app, connect this button to your password-reset service."));
$("closeBtn").addEventListener("click",()=>{authShell.classList.remove("show","success");authShell.setAttribute("aria-hidden","true");loginForm.reset();registerForm.reset();clearErrors();setTimeout(restart,300)});
$("againBtn").addEventListener("click",()=>{authShell.classList.remove("success");registerForm.reset();loginForm.reset();clearErrors();switchMode("login")});
$("replayBtn").addEventListener("click",restart);

function confetti(){
  const layer=document.createElement("div");layer.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:100";
  const colors=["#6e9c5d","#d6a657","#d97958","#6d91b5","#9b6db0"];
  for(let i=0;i<80;i++){
    const p=document.createElement("i"),x=(Math.random()-.5)*700,y=220+Math.random()*550,r=(Math.random()-.5)*900;
    p.style.cssText=`position:absolute;left:${45+Math.random()*10}%;top:${40+Math.random()*10}%;width:${5+Math.random()*5}px;height:${8+Math.random()*8}px;border-radius:2px;background:${colors[Math.floor(Math.random()*colors.length)]}`;
    p.animate([{transform:"translate(0,0) rotate(0deg)",opacity:1},{transform:`translate(${x}px,${y}px) rotate(${r}deg)`,opacity:0}],{duration:1200+Math.random()*1100,easing:"cubic-bezier(.15,.7,.25,1)",fill:"forwards"});layer.appendChild(p);
  } document.body.appendChild(layer); setTimeout(()=>layer.remove(),2600);
}

function startAudio(){
  if(soundOn)return; const A=window.AudioContext||window.webkitAudioContext;if(!A){showToast("Your browser does not support sound.");return}
  audioContext=audioContext||new A(); if(audioContext.state==="suspended")audioContext.resume(); masterGain=audioContext.createGain();masterGain.gain.value=.035;masterGain.connect(audioContext.destination);soundOn=true;musicLabel.textContent="Sound on";musicBtn.setAttribute("aria-pressed","true");playBell();ambienceTimer=setInterval(playBell,3600);
}
function stopAudio(){soundOn=false;musicLabel.textContent="Sound off";musicBtn.setAttribute("aria-pressed","false");if(ambienceTimer){clearInterval(ambienceTimer);ambienceTimer=null}if(masterGain){masterGain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.25);setTimeout(()=>{if(masterGain){masterGain.disconnect();masterGain=null}},300)}}
function playBell(){if(!soundOn||!audioContext||!masterGain)return;const o=audioContext.createOscillator(),g=audioContext.createGain();o.type="sine";o.frequency.value=[392,523.25,659.25][Math.floor(Math.random()*3)];g.gain.setValueAtTime(.0001,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.12,audioContext.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+1.2);o.connect(g);g.connect(masterGain);o.start();o.stop(audioContext.currentTime+1.25)}
function playSuccessSound(){if(!soundOn||!audioContext||!masterGain)return;[523.25,659.25,783.99].forEach((f,i)=>setTimeout(()=>{if(!soundOn)return;const o=audioContext.createOscillator(),g=audioContext.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(.0001,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.18,audioContext.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.55);o.connect(g);g.connect(masterGain);o.start();o.stop(audioContext.currentTime+.6)},i*130))}
musicBtn.addEventListener("click",()=>soundOn?stopAudio():startAudio());

function boot(){
  try{const u=getUser();if(localStorage.getItem("forestlyRemember")==="true"&&u){loginEmail.value=u.email;rememberMe.checked=true}}catch(e){}
  runStory();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
