const squirrel=document.getElementById("squirrel"),
magicBox=document.getElementById("magicBox"),
authShell=document.getElementById("authShell"), 
storyCopy=document.getElementById("storyCopy"),
storyTitle=document.getElementById("storyTitle"),
storyText=document.getElementById("storyText"),
progressBar=document.getElementById("progressBar"),
leafLayer=document.getElementById("leafLayer"),
replayBtn=document.getElementById("replayBtn"),
musicBtn=document.getElementById("musicBtn"),
musicLabel=document.getElementById("musicLabel"),
closeBtn=document.getElementById("closeBtn"),
againBtn=document.getElementById("againBtn"),
loginForm=document.getElementById("loginForm"),
registerForm=document.getElementById("registerForm"),
loginTab=document.getElementById("loginTab"),
registerTab=document.getElementById("registerTab"),
goRegister=document.getElementById("goRegister"),
goLogin=document.getElementById("goLogin"),
loginEmail=document.getElementById("loginEmail"),
loginPassword=document.getElementById("loginPassword"),
rememberMe=document.getElementById("rememberMe"),
loginShowPass=document.getElementById("loginShowPass"),
nameInput=document.getElementById("name"),
emailInput=document.getElementById("email"),
passwordInput=document.getElementById("password"),
termsInput=document.getElementById("terms"),
showPass=document.getElementById("showPass"),
successName=document.getElementById("successName"),
successTitle=document.getElementById("successTitle"),
successText=document.getElementById("successText"),
forgotBtn=document.getElementById("forgotBtn"),
toast=document.getElementById("toast");

let timers=[],token=0,audioContext=null,masterGain=null,ambienceTimer=null,soundOn=false,toastTimer=null;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function clearTimers(){timers.forEach(clearTimeout);timers=[]}
function later(fn,ms){const id=setTimeout(fn,ms);timers.push(id);return id}
function setStory(t,p){storyTitle.textContent=t;storyText.textContent=p}
function createLeaf(){
  const l=document.createElement("i");l.className="falling-leaf";
  l.style.left=Math.random()*100+"%";l.style.animationDuration=5+Math.random()*5+"s";
  l.style.animationDelay=Math.random()*.7+"s";
  l.style.transform=`rotate(${Math.random()*90}deg) scale(${.65+Math.random()*.75})`;
  leafLayer.appendChild(l);setTimeout(()=>l.remove(),11000)
}
function leafBurst(n=9){for(let i=0;i<n;i++)later(createLeaf,i*90)}

function resetVisuals(){
  clearTimers();token++;
  squirrel.classList.remove("walking");squirrel.style.left="23%";squirrel.style.transform="translateY(-390px)";
  magicBox.classList.remove("show","open");authShell.classList.remove("show","success");
  authShell.setAttribute("aria-hidden","true");storyCopy.classList.remove("hidden");
  setStory("Something is waking up...","Follow the little visitor.");progressBar.style.width="0%";
}
async function runStory(){
  const t=++token;resetVisuals();await wait(500);if(t!==token)return;
  setStory("A little visitor is here...","Something moved in the old tree.");
  squirrel.style.transform="translateY(0)";leafBurst(5);progressBar.style.width="12%";
  await wait(1800);if(t!==token)return;
  setStory("What is that?","The squirrel spotted a mysterious box.");
  squirrel.classList.add("walking");squirrel.style.left=innerWidth<760?"46%":"52%";progressBar.style.width="29%";
  await wait(2100);if(t!==token)return;
  squirrel.classList.remove("walking");magicBox.classList.add("show");leafBurst(6);
  setStory("A mysterious box...","There might be something special inside.");progressBar.style.width="47%";
  await wait(1300);if(t!==token)return;
  squirrel.classList.add("walking");squirrel.style.left=innerWidth<760?"53%":"62%";
  setStory("Let's open it.","Curiosity wins.");progressBar.style.width="61%";
  await wait(1700);if(t!==token)return;
  squirrel.classList.remove("walking");magicBox.classList.add("open");leafBurst(10);
  setStory("Oh... hello! ✨","The box had a little surprise waiting.");progressBar.style.width="78%";
  await wait(1050);if(t!==token)return;
  storyCopy.classList.add("hidden");authShell.classList.add("show");
  authShell.setAttribute("aria-hidden","false");progressBar.style.width="100%";
  setTimeout(()=>loginEmail.focus(),550);
}
function restart(){resetVisuals();setTimeout(runStory,180)}

function showToast(message){
  clearTimeout(toastTimer);toast.textContent=message;toast.classList.add("show");
  toastTimer=setTimeout(()=>toast.classList.remove("show"),2800);
}

function clearErrors(){
  document.querySelectorAll(".error").forEach(e=>e.textContent="");
  document.querySelectorAll(".field input").forEach(e=>e.classList.remove("invalid"));
  termsInput.parentElement.style.color="";
}
function setError(input,id,msg){input.classList.add("invalid");document.getElementById(id).textContent=msg}

function switchMode(mode){
  authShell.classList.remove("success");
  clearErrors();
  if(mode==="register"){
    loginForm.hidden=true;registerForm.hidden=false;
    loginTab.classList.remove("active");registerTab.classList.add("active");
    document.getElementById("authKicker").textContent="WELCOME TO THE FOREST";
    document.getElementById("authTitle").textContent="Create your account";
    document.getElementById("authSubtitle").textContent="A quiet little place for curious people.";
    setTimeout(()=>nameInput.focus(),120);
  }else{
    registerForm.hidden=true;loginForm.hidden=false;
    registerTab.classList.remove("active");loginTab.classList.add("active");
    document.getElementById("authKicker").textContent="WELCOME BACK";
    document.getElementById("authTitle").textContent="Enter the forest";
    document.getElementById("authSubtitle").textContent="Sign in and continue your little forest story.";
    setTimeout(()=>loginEmail.focus(),120);
  }
}
function validateRegister(){
  clearErrors();let ok=true,n=nameInput.value.trim(),e=emailInput.value.trim(),p=passwordInput.value;
  if(n.length<2){setError(nameInput,"nameError","Please enter your full name.");ok=false}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){setError(emailInput,"emailError","Please enter a valid email address.");ok=false}
  if(p.length<6){setError(passwordInput,"passwordError","Password must be at least 6 characters.");ok=false}
  if(!termsInput.checked){termsInput.parentElement.style.color="#c75c4d";ok=false}
  return ok;
}
function validateLogin(){
  document.getElementById("loginEmailError").textContent="";
  document.getElementById("loginPasswordError").textContent="";
  loginEmail.classList.remove("invalid");loginPassword.classList.remove("invalid");
  let ok=true,e=loginEmail.value.trim(),p=loginPassword.value;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){setError(loginEmail,"loginEmailError","Please enter a valid email address.");ok=false}
  if(!p){setError(loginPassword,"loginPasswordError","Please enter your password.");ok=false}
  return ok;
}

function saveUser(){
  const user={name:nameInput.value.trim(),email:emailInput.value.trim(),password:passwordInput.value};
  localStorage.setItem("forestlyUser",JSON.stringify(user));
  return user;
}
function getUser(){try{return JSON.parse(localStorage.getItem("forestlyUser"))||null}catch{return null}}

registerForm.addEventListener("submit",e=>{
  e.preventDefault();if(!validateRegister())return;
  const user=saveUser();successName.textContent=user.name;
  successTitle.textContent="You're officially in.";
  successText.innerHTML=`Welcome, <strong>${escapeHtml(user.name)}</strong>. Your forest account has been created.`;
  authShell.classList.add("success");playSuccessSound();confetti();
});
loginForm.addEventListener("submit",e=>{
  e.preventDefault();if(!validateLogin())return;
  const user=getUser();
  if(!user){showToast("No account found. Please register first.");switchMode("register");return}
  if(loginEmail.value.trim().toLowerCase()!==user.email.toLowerCase()||loginPassword.value!==user.password){
    setError(loginPassword,"loginPasswordError","Email or password is incorrect.");return;
  }
  if(rememberMe.checked)localStorage.setItem("forestlyRemember","true");
  successName.textContent=user.name;
  successTitle.textContent="Welcome back!";
  successText.innerHTML=`Hello, <strong>${escapeHtml(user.name)}</strong>. The forest remembers you.`;
  authShell.classList.add("success");playSuccessSound();confetti();
});
function escapeHtml(v){const d=document.createElement("div");d.textContent=v;return d.innerHTML}

showPass.addEventListener("click",()=>{
  const v=passwordInput.type==="text";passwordInput.type=v?"password":"text";showPass.textContent=v?"Show":"Hide";
});
loginShowPass.addEventListener("click",()=>{
  const v=loginPassword.type==="text";loginPassword.type=v?"password":"text";loginShowPass.textContent=v?"Show":"Hide";
});
loginTab.addEventListener("click",()=>switchMode("login"));
registerTab.addEventListener("click",()=>switchMode("register"));
goRegister.addEventListener("click",()=>switchMode("register"));
goLogin.addEventListener("click",()=>switchMode("login"));
forgotBtn.addEventListener("click",()=>showToast("For a real app, connect this button to your password-reset system."));
closeBtn.addEventListener("click",closeRegistration);
againBtn.addEventListener("click",()=>{
  authShell.classList.remove("success");registerForm.reset();loginForm.reset();clearErrors();
  switchMode("login");setTimeout(()=>loginEmail.focus(),150);
});
replayBtn.addEventListener("click",restart);

function closeRegistration(){
  authShell.classList.remove("show","success");authShell.setAttribute("aria-hidden","true");
  loginForm.reset();registerForm.reset();clearErrors();
  setTimeout(()=>{storyCopy.classList.remove("hidden");setStory("The forest is waiting...","Replay the little story whenever you like.")},450);
}

function confetti(){
  const layer=document.createElement("div");layer.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:100";
  for(let i=0;i<85;i++){
    const p=document.createElement("i"),x=(Math.random()-.5)*700,y=250+Math.random()*500,r=(Math.random()-.5)*900;
    p.style.cssText=`position:absolute;left:${45+Math.random()*10}%;top:${43+Math.random()*8}%;width:${5+Math.random()*5}px;height:${8+Math.random()*8}px;border-radius:${Math.random()>.5?"2px":"50%"};background:${["#6e9c5d","#d6a657","#d97958","#6d91b5","#9b6db0"][Math.floor(Math.random()*5)]}`;
    p.animate([{transform:"translate(0,0) rotate(0deg)",opacity:1},{transform:`translate(${x}px,${y}px) rotate(${r}deg)`,opacity:0}],{duration:1200+Math.random()*1100,easing:"cubic-bezier(.15,.7,.25,1)",fill:"forwards"});
    layer.appendChild(p)
  }
  document.body.appendChild(layer);setTimeout(()=>layer.remove(),2600)
}
function startAudio(){
  if(soundOn)return;const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
  audioContext=audioContext||new A;if(audioContext.state==="suspended")audioContext.resume();
  masterGain=audioContext.createGain();masterGain.gain.value=.035;masterGain.connect(audioContext.destination);
  soundOn=true;musicLabel.textContent="Sound on";musicBtn.setAttribute("aria-pressed","true");playBell();ambienceTimer=setInterval(playBell,3600);
}
function stopAudio(){
  soundOn=false;musicLabel.textContent="Sound off";musicBtn.setAttribute("aria-pressed","false");
  if(ambienceTimer){clearInterval(ambienceTimer);ambienceTimer=null}
  if(masterGain){masterGain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.25);setTimeout(()=>{if(masterGain){masterGain.disconnect();masterGain=null}},300)}
}
function playBell(){
  if(!soundOn||!audioContext||!masterGain)return;
  const o=audioContext.createOscillator(),g=audioContext.createGain();o.type="sine";
  o.frequency.value=[392,523.25,659.25][Math.floor(Math.random()*3)];
  g.gain.setValueAtTime(.0001,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.12,audioContext.currentTime+.02);
  g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+1.2);o.connect(g);g.connect(masterGain);o.start();o.stop(audioContext.currentTime+1.25);
}
function playSuccessSound(){
  if(!soundOn||!audioContext||!masterGain)return;
  [523.25,659.25,783.99].forEach((f,i)=>setTimeout(()=>{
    if(!soundOn)return;const o=audioContext.createOscillator(),g=audioContext.createGain();o.type="sine";o.frequency.value=f;
    g.gain.setValueAtTime(.0001,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.18,audioContext.currentTime+.02);
    g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.55);o.connect(g);g.connect(masterGain);o.start();o.stop(audioContext.currentTime+.6)
  },i*130))
}
musicBtn.addEventListener("click",()=>soundOn?stopAudio():startAudio());
window.addEventListener("load",()=>{
  const remembered=localStorage.getItem("forestlyRemember")==="true";
  if(remembered){const u=getUser();if(u){loginEmail.value=u.email;rememberMe.checked=true}}
  runStory();
});
