/* ================== CONFIG POWER AUTOMATE ================== */
const FLOW_URL = "TON_URL_POWER_AUTOMATE";
const FLOW_API_KEY = "";

/* ================== UI ================== */

const smileys = ["😊","🙂","😐","🙁","😡","❌"];
const labels  = ["Très bon","Bon","Moyen","Insuffisant","Mauvais","Non applicable"];

const selectMetier = document.getElementById("selectMetier");
const questionsList = document.getElementById("questionsList");

const champChantier = document.getElementById("chantier");
const selectOuvrier = document.getElementById("ouvrierSelect");
const inputNaissance = document.getElementById("dateNaissance");
const inputQualif = document.getElementById("qualification");
const inputEntree = document.getElementById("dateEntree");
const inputDateEval = document.getElementById("dateEvaluation");
const inputInitial = document.getElementById("initialEval");

/* ================== SECURE INPUT ================== */

function getVal(id){
 const el=document.getElementById(id);
 return el?el.value.trim():"";
}

function getCheck(id){
 const el=document.getElementById(id);
 return el?el.checked:false;
}

/* ================== OUVRIERS ================== */

let OUVRIERS=[];

function remplirSelectOuvriers(list){

 selectOuvrier.innerHTML='<option value="">Choisir</option>';

 list.forEach(o=>{

  const opt=document.createElement("option");

  const mat=(o.matricule??"").toString();

  opt.value=mat;

  opt.textContent=`${(o.nom||"").toUpperCase()} ${(o.prenom||"").toUpperCase()} (Mat. ${mat})`;

  selectOuvrier.appendChild(opt);

 });

}

async function chargerOuvriers(){

 if(window.OUVRIERS){
  OUVRIERS=window.OUVRIERS;
  remplirSelectOuvriers(OUVRIERS);
  return;
 }

 try{

  const res=await fetch("/ouvriers.json");

  OUVRIERS=await res.json();

  remplirSelectOuvriers(OUVRIERS);

 }catch(e){

  console.error(e);

 }

}

/* ================== AUTO FILL ================== */

selectOuvrier?.addEventListener("change",()=>{

 const o=OUVRIERS.find(x=>x.matricule==selectOuvrier.value);

 if(!o)return;

 if(inputQualif)inputQualif.value=o.qualif||"";
 if(inputEntree)inputEntree.value=o.entree||"";
 if(inputNaissance)inputNaissance.value=o.naissance||"";

});

/* ================== QUESTIONS ================== */

selectMetier?.addEventListener("change",()=>{

 const metier=selectMetier.value;

 questionsList.innerHTML="";

 if(!METIER_QUESTIONS[metier])return;

 METIER_QUESTIONS[metier].forEach(q=>{

  const div=document.createElement("div");
  div.className="question";

  const label=document.createElement("label");
  label.textContent=q;

  const scale=document.createElement("div");
  scale.className="smiley-scale";

  smileys.forEach((s,i)=>{

   const span=document.createElement("span");
   span.textContent=s;
   span.title=labels[i];
   span.dataset.value=labels[i];

   span.onclick=()=>{

    scale.querySelectorAll("span").forEach(x=>x.classList.remove("selected"));
    span.classList.add("selected");

   };

   scale.appendChild(span);

  });

  div.appendChild(label);
  div.appendChild(scale);

  questionsList.appendChild(div);

 });

});

/* ================== SUBMIT ================== */

document.getElementById("formEval")?.addEventListener("submit",async e=>{

 e.preventDefault();

 const chantier=(champChantier?.value||"").trim();

 const ouvrierId=selectOuvrier?.value||"";

 const ouvrier=OUVRIERS.find(x=>x.matricule==ouvrierId);

 const nomComplet=ouvrier?`${ouvrier.nom} ${ouvrier.prenom}`:"";

 const metier=selectMetier?.value||"";

 const dateEval=inputDateEval?.value||"";

 const initialEval=inputInitial?.value||"";

 if(!chantier||!ouvrierId||!metier){
  alert("Champs obligatoires manquants");
  return;
 }

 const evaluations=[];

 document.querySelectorAll(".question").forEach(div=>{

  const selected=div.querySelector(".selected");

  evaluations.push({

   critere:div.querySelector("label").innerText,
   note:selected?selected.dataset.value:"Non noté"

  });

 });

 const result={

  chantier,
  ouvrier:nomComplet,
  metier,
  date_eval:dateEval,
  initial_evaluateur:initialEval,
  evaluation:evaluations

 };

 try{

  const headers={"Content-Type":"application/json"};

  const resp=await fetch(FLOW_URL,{

   method:"POST",
   headers,
   body:JSON.stringify(result)

  });

  if(!resp.ok){

   alert("Erreur envoi mail");

   return;

  }

  alert("✅ Évaluation envoyée");

 }catch(err){

  console.error(err);
  alert("Erreur envoi");

 }

});

/* ================== INIT ================== */

document.addEventListener("DOMContentLoaded",()=>{

 chargerOuvriers();

 const today=new Date().toISOString().slice(0,10);

 if(inputDateEval&&!inputDateEval.value){
  inputDateEval.value=today;
 }

});
