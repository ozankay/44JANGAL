/* 44JANGAL App: Firebase statt Claude-Speicher. Stellt window.claude mit derselben Schnittstelle bereit. */
(function(){
 window.FB_APP=1;
 var CFG={apiKey:"AIzaSyAUo0oIpLpxI5vTXLF3Xjc_r6qGqmmkjfA",authDomain:"jangal-d9db4.firebaseapp.com",projectId:"jangal-d9db4",storageBucket:"jangal-d9db4.firebasestorage.app",messagingSenderId:"1044437987766",appId:"1:1044437987766:web:fde515d2e5bba340509117"};
 var ok=typeof firebase!=='undefined';var auth=null,fs=null;
 if(ok){try{firebase.initializeApp(CFG);auth=firebase.auth();fs=firebase.firestore();try{fs.settings({ignoreUndefinedProperties:true,merge:true})}catch(e){}try{fs.enablePersistence({synchronizeTabs:true}).catch(function(){})}catch(e){}}catch(e){ok=false}}
 var resolveUser,decided=false;var userP=new Promise(function(r){resolveUser=r});
 function decide(u){if(decided)return;decided=true;hideLogin();resolveUser(u||null)}
 window.FB_WAIT=userP;
 function skipped(){try{return localStorage.getItem('44j_noacc')==='1'}catch(e){return false}}
 window.FB={auth:auth,user:null,offline:false};
 // Pfade der Claude-Version auf Firebase abbilden
 function mapPath(p){var m=p.match(/^data\/users\/([^\/]+)\/(save|ping)$/);if(m)return{path:'saves/'+m[1],ping:m[2]==='ping'};return{path:p}}
 function docRef(p){var mp=mapPath(p),r=fs.doc(mp.path);return{
  get:function(){return r.get().then(function(s){return{exists:s.exists,id:s.id,data:function(){return s.data()}}})},
  set:function(o){return mp.ping?r.set({ping:Date.now()},{merge:true}):r.set(o)},
  delete:function(){return mp.ping?Promise.resolve():r.delete()}}}
 var db={doc:docRef,collection:function(c){return{doc:function(id){return docRef(c+'/'+id)},onSnapshot:function(cb,err){return fs.collection(c).onSnapshot(function(s){cb({docs:s.docs.map(function(d){return{id:d.id,exists:d.exists,data:function(){return d.data()}}})})},err||function(){})}}}};
 window.claude={use:function(k){return userP.then(function(u){if(!u)return null;if(k==='db')return db;if(k==='user')return{id:function(){return Promise.resolve(u.uid)},can:function(){return Promise.resolve(true)},canEdit:function(){return Promise.resolve(true)},email:u.email};return null})}};
 // ---------- Login-Fenster ----------
 var box=null;
 function css(){var s=document.createElement('style');s.textContent='#fblog{position:fixed;inset:0;z-index:9999;background:radial-gradient(circle at 50% 20%,#2a1d12,#08090b 70%);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Rubik,system-ui,sans-serif;color:#ececef}#fblog .b{width:min(380px,100%);background:#1c1e23;border:1px solid #363a46;border-radius:18px;padding:20px;box-shadow:0 20px 60px #000a}#fblog h1{font-family:"Press Start 2P",monospace;font-size:20px;color:#ffe27a;text-align:center;margin:4px 0 6px;text-shadow:3px 3px 0 #000}#fblog p{color:#9aa0ab;font-size:13px;text-align:center;margin:0 0 14px;line-height:1.45}#fblog input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:12px;border:1px solid #363a46;background:#262932;color:#ececef;font-size:16px;margin-bottom:10px}#fblog button{width:100%;padding:13px;border-radius:12px;border:0;font-size:15px;font-weight:800;margin-top:6px;cursor:pointer}#fblog .pri{background:#f5c542;color:#111}#fblog .sec{background:#262932;color:#ececef;border:1px solid #363a46}#fblog .lnk{background:none;color:#9ec4ff;font-weight:600;font-size:13px;padding:8px}#fblog .err{color:#ff8a8a;font-size:13px;min-height:18px;text-align:center;margin:4px 0}#fblog .ok{color:#9fe0ae}';document.head.appendChild(s)}
 var ERR={'auth/invalid-email':'Die E-Mail-Adresse stimmt nicht.','auth/user-not-found':'Kein Konto mit dieser E-Mail.','auth/wrong-password':'Falsches Passwort.','auth/invalid-credential':'E-Mail oder Passwort falsch.','auth/invalid-login-credentials':'E-Mail oder Passwort falsch.','auth/email-already-in-use':'Für diese E-Mail gibt es schon ein Konto. Einfach einloggen.','auth/weak-password':'Passwort zu kurz (mindestens 6 Zeichen).','auth/too-many-requests':'Zu viele Versuche. Warte kurz.','auth/network-request-failed':'Kein Internet. Versuch es nochmal oder spiel ohne Konto.','auth/missing-password':'Passwort fehlt.'};
 function msg(t,good){var e=document.getElementById('fberr');if(e){e.textContent=t||'';e.className='err'+(good?' ok':'')}}
 function busyBtn(on){var bs=box?box.querySelectorAll('button'):[];for(var i=0;i<bs.length;i++)bs[i].disabled=on}
 function showLogin(){if(box||decided)return;if(!document.body){document.addEventListener('DOMContentLoaded',showLogin);return}css();box=document.createElement('div');box.id='fblog';
  box.innerHTML='<div class="b"><h1>44JANGAL</h1><p>Logg dich ein, damit dein Spielstand in der Cloud liegt, auf jedem Gerät weitergeht und du in der Crew mitspielst.</p><input id="fbmail" type="email" autocomplete="email" placeholder="E-Mail"><input id="fbpw" type="password" autocomplete="current-password" placeholder="Passwort (mind. 6 Zeichen)"><div id="fberr" class="err"></div><button class="pri" id="fbin">Einloggen</button><button class="sec" id="fbup">Neues Konto erstellen</button><button class="lnk" id="fbforgot">Passwort vergessen?</button><button class="lnk" id="fbskip" style="color:#9aa0ab">Ohne Konto spielen (nur auf diesem Gerät)</button></div>';
  document.body.appendChild(box);
  var mail=function(){return document.getElementById('fbmail').value.trim()},pw=function(){return document.getElementById('fbpw').value};
  document.getElementById('fbin').onclick=function(){msg('');busyBtn(true);auth.signInWithEmailAndPassword(mail(),pw()).catch(function(e){busyBtn(false);msg(ERR[e.code]||('Fehler: '+(e.code||e.message)))})};
  document.getElementById('fbup').onclick=function(){msg('');busyBtn(true);auth.createUserWithEmailAndPassword(mail(),pw()).catch(function(e){busyBtn(false);msg(ERR[e.code]||('Fehler: '+(e.code||e.message)))})};
  document.getElementById('fbforgot').onclick=function(){if(!mail()){msg('Erst E-Mail oben eintragen.');return}auth.sendPasswordResetEmail(mail()).then(function(){msg('Mail zum Zurücksetzen ist unterwegs. Schau auch im Spam.',true)}).catch(function(e){msg(ERR[e.code]||'Hat nicht geklappt.')})};
  document.getElementById('fbskip').onclick=function(){try{localStorage.setItem('44j_noacc','1')}catch(e){}decide(null)}}
 function hideLogin(){if(box){box.remove();box=null}}
 if(!ok){decide(null)}else{
  auth.onAuthStateChanged(function(u){window.FB.user=u;if(u){try{localStorage.removeItem('44j_noacc')}catch(e){}decide(u)}else if(!decided){if(skipped())decide(null);else showLogin()}});
  setTimeout(function(){if(!decided&&!box){if(skipped())decide(null);else showLogin()}},6000)}
 // ---------- Konto im Menü ----------
 window.fbLogout=function(){if(!auth)return;var go=function(){try{S=null}catch(e){}try{localStorage.removeItem('44jangal_save_v1');localStorage.removeItem('44j_noacc')}catch(e){}auth.signOut().then(function(){location.reload()})};
  try{if(typeof cloudFlush==='function'&&typeof CLOUD!=='undefined'&&CLOUD.ready){CLOUD.dirty=true;cloudFlush().then(go,go);return}}catch(e){}go()};
 window.fbLogin=function(){try{localStorage.removeItem('44j_noacc')}catch(e){}location.reload()};
})();
