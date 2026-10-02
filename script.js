(() => {
  "use strict";
  const $=s=>document.querySelector(s);
  const app=$("#app"), squirrel=$("#squirrel"), box=$("#box"), overlay=$("#overlay");
  const title=$("#sceneTitle"), text=$("#sceneText"), progress=$("#progress");
  const login=$("#login"), register=$("#register"), success=$("#success"), toast=$("#toast");
  let timers=[], sound=false, audio;

  const later=(fn,ms)=>{const t=setTimeout(fn,ms);timers.push(t);};
  function clear(){timers.forEach(clearTimeout);timers=[];}
  function beep(f=500,d=.12){
    if(!sound)return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      const o=audio.createOscillator(),g=audio.createGain();
      o.frequency.value=f;o.type="sine";g.gain.value=.05;o.connect(g).connect(audio.destination);
      o.start();o.stop(audio.currentTime+d);
    }catch(e){}
  }
  function toastMsg(m){toast.textContent=m;toast.classList.add("show");later(()=>toast.classList.remove("show"),2500);}
  function tab(mode){
    document.querySelectorAll(".tab,[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===mode));
    login.classList.toggle("active",mode==="login");register.classList.toggle("active",mode==="register");
    $("#authHeading").textContent=mode==="login"?"Welcome back.":"Make your account.";
    $("#authSub").textContent=mode==="login"?"Sign in and continue your journey.":"Register once, then come back whenever you like.";
  }
  function openAuth(){
    overlay.classList.add("show");overlay.setAttribute("aria-hidden","false");beep(700,.16);later(()=>beep(900,.15),120);
  }
  function closeAuth(){overlay.classList.remove("show");overlay.setAttribute("aria-hidden","true");success.classList.remove("show");login.style.display="";register.style.display="";tab("login");}
  function replay(){
    clear();closeAuth();box.classList.remove("open");
    squirrel.style.left="50%";squirrel.style.top="19%";squirrel.style.transform="translateX(-50%) scale(1)";
    title.textContent="A quiet house in the woods…";text.textContent="A little squirrel is sitting on the old roof.";progress.style.width="0%";
    later(()=>{title.textContent="Down from the roof…";text.textContent="The little visitor is coming down.";progress.style.width="22%";beep(360)},1000);
    later(()=>{squirrel.style.left="58%";squirrel.style.top="38%";squirrel.style.transform="translateX(-50%) scale(.9)";title.textContent="A little journey…";text.textContent="The squirrel is walking toward the box.";progress.style.width="45%";beep(460)},2400);
    later(()=>{squirrel.style.left="73%";squirrel.style.top="67%";squirrel.style.transform="translateX(-50%) scale(.68)";title.textContent="The mysterious box…";text.textContent="Something inside is waiting.";progress.style.width="70%";beep(540)},4200);
    later(()=>{box.classList.add("open");title.textContent="The box opens…";text.textContent="Welcome to the little house.";progress.style.width="88%";beep(700,.2)},5600);
    later(()=>{progress.style.width="100%";openAuth()},6500);
  }

  document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>tab(b.dataset.tab)));
  document.querySelectorAll("[data-pass]").forEach(b=>b.addEventListener("click",()=>{const i=$("#"+b.dataset.pass);i.type=i.type==="password"?"text":"password";b.textContent=i.type==="password"?"SHOW":"HIDE"}));
  $("#sound").addEventListener("click",()=>{sound=!sound;$("#sound").textContent=sound?"♫":"♪";beep(500)});
  $("#replay").addEventListener("click",replay);
  $("#close").addEventListener("click",closeAuth);
  $("#forgot").addEventListener("click",()=>toastMsg("Password recovery is not connected in this demo."));
  login.addEventListener("submit",e=>{
    e.preventDefault();
    const email=$("#email").value.trim().toLowerCase(), pass=$("#password").value, saved=JSON.parse(localStorage.getItem("forestlyUser")||"null");
    if(!email||!pass)return toastMsg("Please enter email and password.");
    if(!saved)return toastMsg("No account found. Register first.");
    if(saved.email!==email||saved.password!==pass)return toastMsg("Email or password is incorrect.");
    if($("#remember").checked)localStorage.setItem("forestlyRemember",email);
    $("#successTitle").textContent="Welcome, "+saved.name.split(" ")[0]+"!";
    $("#successText").textContent="You have successfully entered the little house.";
    login.style.display="none";register.style.display="none";success.classList.add("show");beep(700);later(()=>beep(900),120);
  });
  register.addEventListener("submit",e=>{
    e.preventDefault();
    const name=$("#name").value.trim(),email=$("#regEmail").value.trim().toLowerCase(),pass=$("#regPassword").value,saved=JSON.parse(localStorage.getItem("forestlyUser")||"null");
    if(!name||!email||!pass)return toastMsg("Please complete every field.");
    if(!/^\S+@\S+\.\S+$/.test(email))return toastMsg("Please enter a valid email.");
    if(pass.length<6)return toastMsg("Password needs 6+ characters.");
    if(!$("#terms").checked)return toastMsg("Please accept the demo terms.");
    if(saved&&saved.email===email)return toastMsg("This email is already registered.");
    localStorage.setItem("forestlyUser",JSON.stringify({name,email,password:pass}));
    $("#successTitle").textContent="Account created!";
    $("#successText").textContent="Your account is ready. You can now enter the house.";
    login.style.display="none";register.style.display="none";success.classList.add("show");beep(700);later(()=>beep(900),120);
  });
  $("#continue").addEventListener("click",()=>{success.classList.remove("show");login.style.display="";register.style.display="";tab("login");$("#email").value=localStorage.getItem("forestlyRemember")||$("#regEmail").value||"";});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAuth()});
  window.addEventListener("load",replay);
})();
