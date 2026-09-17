(function(){

"use strict";

function initTouchscreenSelector(){

var form=document.getElementById("selector-form");
var results=document.getElementById("results");
var hardware=document.getElementById("hardware");
var productGrid=document.getElementById("product-grid");

var groups=[
  "board",
  "size",
  "resolution",
  "interface",
  "touchType",
  "touchInterface",
  "project",
  "lvgl",
  "psram"
];

var lastRecommendation=null;

/*
=========================================================
SELECTION PROGRESS
=========================================================
*/

function updateSelectionProgress(){

var count=0;

groups.forEach(function(group){

if(getValue(group)){
count++;
}

});

var percent=Math.round((count/groups.length)*100);

var countEl=document.getElementById("selection-count");
var percentEl=document.getElementById("selection-percent");
var progressEl=document.getElementById("selection-progress");

if(countEl){
countEl.textContent=count;
}

if(percentEl){
percentEl.textContent=percent+"%";
}

if(progressEl){
progressEl.style.width=percent+"%";
}

}

form.addEventListener("change", updateSelectionProgress);
updateSelectionProgress();


/*
=========================================================
PRODUCT DATABASE

Map your real Embedded Nerd products here.

For external affiliate links use:
target="_blank"
rel="nofollow sponsored noopener"

=========================================================
*/

var products=[

{
name:'ILI9341 2.8" SPI TFT + XPT2046 Touch',
image:'/assets/images/products/ili9341-xpt2046-2-8-touchscreen.webp',
href:'/products/ili9341-xpt2046-2-8-touchscreen/',
reason:'Compact SPI touchscreen for smaller ESP32 projects. The ILI9341 display and XPT2046 resistive touch controller make this a straightforward low-pin-count option.',
esp32:['ESP32','ESP32-S2','ESP32-S3'],
sizes:['2.4–2.8"'],
resolutions:['240x320','320x240'],
interfaces:['SPI'],
touch:['Resistive'],
touchInterfaces:['SPI'],
psram:false
},

{
name:'Waveshare ESP32-S3-Touch-LCD-4.3',
image:'/assets/images/products/waveshare-esp32-s3-touch-lcd-4-3.webp',
href:'/products/waveshare-esp32-s3-touch-lcd-4-3/',
reason:'Integrated ESP32-S3 touchscreen platform for 4.3-inch 800×480 graphical interfaces and more demanding GUI projects.',
esp32:['ESP32-S3'],
sizes:['4.3"'],
resolutions:['800x480'],
interfaces:['RGB'],
touch:['Capacitive'],
touchInterfaces:['I²C'],
psram:true
},

{
name:'Waveshare ESP32-S3-Touch-LCD-7',
image:'/assets/images/products/waveshare-esp32-s3-touch-lcd-7.webp',
href:'/products/waveshare-esp32-s3-touch-lcd-7/',
reason:'Large ESP32-S3 touchscreen platform aimed at dashboards, HMI and Raspberry Pi-style interfaces.',
esp32:['ESP32-S3'],
sizes:['7"'],
resolutions:['1024x600'],
interfaces:['RGB'],
touch:['Capacitive'],
touchInterfaces:['I²C'],
psram:true
}

];


/*
=========================================================
VALUE HELPERS
=========================================================
*/

function getValue(name){

var el=form.querySelector(
'input[name="'+name+'"]:checked'
);

return el ? el.value : null;

}


function isHighResolution(res){

return res==="800x480" ||
       res==="1024x600";

}


function isLargeSize(size){

return size==='5"' ||
       size==='7"';

}


function escapeHtml(value){

return String(value)
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");

}


/*
=========================================================
VALIDATION
=========================================================
*/

function clearErrors(){

groups.forEach(function(group){

var fs=form.querySelector(
'fieldset[data-group="'+group+'"]'
);

if(fs){
fs.classList.remove("has-error");
}

});

}


function validate(){

clearErrors();

var answers={};
var firstInvalid=null;

groups.forEach(function(group){

var value=getValue(group);

answers[group]=value;

if(!value){

var fs=form.querySelector(
'fieldset[data-group="'+group+'"]'
);

if(fs){

fs.classList.add("has-error");

if(!firstInvalid){
firstInvalid=fs;
}

}

}

});


if(firstInvalid){

firstInvalid.scrollIntoView({
behavior:"smooth",
block:"center"
});

var input=firstInvalid.querySelector("input");

if(input){
input.focus();
}

return null;

}

return answers;

}


/*
=========================================================
RECOMMENDATION ENGINE
=========================================================
*/

function computeRecommendation(a){

var warnings=[];
var reasons=[];

var score=100;

var boardRec;
var boardStatus="recommended";

var interfaceRec;
var interfaceStatus="recommended";

var sizeRec=
a.size==="Other / Not sure"
?"Choose according to enclosure and viewing distance"
:a.size;

var resolutionRec=
a.resolution==="Not sure"
?"Choose according to UI requirements"
:a.resolution;

var touchRec;
var touchInterfaceRec;
var touchStatus="recommended";

var psramRec;
var lvglRec;


/*
DISPLAY DEMAND
*/

var demand=0;

if(isHighResolution(a.resolution)){
demand+=3;
}

if(a.interface==="RGB"){
demand+=3;
}

if(a.interface==="8080 / Parallel"){
demand+=2;
}

if(isLargeSize(a.size)){
demand+=1;
}

if(a.lvgl==="Yes"){
demand+=2;
}

if(a.psram==="Required"){
demand+=2;
}


/*
BOARD
*/

if(
a.interface==="RGB" ||
isHighResolution(a.resolution) ||
(a.lvgl==="Yes" && isLargeSize(a.size)) ||
a.psram==="Required"
){

boardRec="ESP32-S3";

}else if(
a.board==="ESP32" ||
a.board==="ESP32-S2" ||
a.board==="ESP32-S3" ||
a.board==="ESP32-C3"
){

boardRec=a.board;

}else{

boardRec="ESP32 or ESP32-S3";

}


/*
BOARD STATUS
*/

if(a.board==="Not sure"){

boardStatus="recommended";

}else if(
boardRec==="ESP32 or ESP32-S3" &&
(a.board==="ESP32" || a.board==="ESP32-S3")
){

boardStatus="likely";

}else if(a.board===boardRec){

boardStatus="recommended";

}else{

boardStatus="verify";

score-=20;

warnings.push(
"Your selected "+a.board+
" is not the preferred board for this configuration. "+
"The tool recommends "+boardRec+
", but the exact board and display combination must still be verified."
);

}


/*
C3 / HIGH DEMAND
*/

if(
a.board==="ESP32-C3" &&
(
a.interface==="RGB" ||
isHighResolution(a.resolution)
)
){

score-=15;

warnings.push(
"The ESP32-C3 is not the preferred platform for this high-demand display configuration. Consider an ESP32-S3 and verify the exact hardware requirements."
);

}


/*
INTERFACE
*/

if(a.interface==="SPI"){

interfaceRec="SPI";

reasons.push(
"SPI keeps GPIO usage relatively low and is practical for many small and medium displays."
);

}else if(a.interface==="RGB"){

interfaceRec="RGB";

reasons.push(
"RGB provides high pixel-data throughput, but requires more GPIOs and careful display timing configuration."
);

}else if(a.interface==="8080 / Parallel"){

interfaceRec="8080 / Parallel";

reasons.push(
"8080/parallel can provide higher throughput than SPI, but uses more GPIOs and requires controller-specific verification."
);

}else{

if(isHighResolution(a.resolution)){

interfaceRec="RGB or 8080 / Parallel";

interfaceStatus="likely";

reasons.push(
"Because the interface is unknown but the resolution is high, RGB or 8080/parallel should be investigated before selecting a specific module."
);

}else{

interfaceRec="SPI";

reasons.push(
"Because the interface is unknown and the display demand is relatively modest, SPI is the simplest starting point."
);

}

}


/*
RGB
*/

if(interfaceRec==="RGB"){

warnings.push(
"RGB displays use substantially more GPIOs than SPI. Check the exact display pinout and available ESP32 GPIOs."
);

if(isHighResolution(a.resolution)){

warnings.push(
"High-resolution RGB displays can require significant memory for frame buffers. An ESP32-S3 with suitable PSRAM is the safer choice."
);

}

}


/*
SPI
*/

if(
interfaceRec==="SPI" &&
isHighResolution(a.resolution)
){

score-=10;

warnings.push(
"SPI can be used with some higher-resolution displays, but practical refresh performance may be lower than RGB or parallel interfaces."
);

}


/*
TOUCH
*/

if(a.touchType==="No touch"){

touchRec="No touch";
touchInterfaceRec="N/A";

}else if(a.touchType==="Capacitive"){

touchRec="Capacitive";

if(a.touchInterface==="I²C"){

touchInterfaceRec="I²C";

}else if(a.touchInterface==="SPI"){

touchInterfaceRec="SPI";
touchStatus="verify";

score-=5;

warnings.push(
"SPI capacitive touch is possible, but I²C is more common. Verify the exact touch controller."
);

}else{

touchInterfaceRec="I²C";
touchStatus="likely";

warnings.push(
"Many capacitive touch controllers use I²C. Verify the exact controller, address and interrupt requirements."
);

}

}else if(a.touchType==="Resistive"){

touchRec="Resistive";

if(a.touchInterface==="SPI"){

touchInterfaceRec="SPI";

}else if(a.touchInterface==="I²C"){

touchInterfaceRec="I²C";
touchStatus="verify";

score-=5;

warnings.push(
"I²C resistive touch exists, but SPI is more commonly found with controllers such as the XPT2046. Verify the controller."
);

}else{

touchInterfaceRec="SPI";
touchStatus="likely";

warnings.push(
"Many resistive touch controllers use SPI. Verify the exact controller and required chip-select/interrupt pins."
);

}

}else{

touchRec="Capacitive or resistive — verify";

if(a.touchInterface==="I²C"){

touchInterfaceRec="I²C";
touchStatus="likely";

}else if(a.touchInterface==="SPI"){

touchInterfaceRec="SPI";
touchStatus="likely";

}else{

touchInterfaceRec="I²C or SPI — verify";
touchStatus="verify";

}

warnings.push(
"Touch technology is unknown. Check the touchscreen controller before assuming capacitive or resistive operation."
);

}


/*
PSRAM
*/

if(a.psram==="Required"){

psramRec="Required by project";

}else if(
isHighResolution(a.resolution) ||
interfaceRec==="RGB" ||
(a.lvgl==="Yes" && demand>=4) ||
isLargeSize(a.size)
){

psramRec="Strongly recommended; may be required";

reasons.push(
"PSRAM is strongly recommended because this configuration can require larger graphics buffers or more memory."
);

}else{

psramRec="Not normally required";

}


/*
LVGL
*/

if(a.lvgl==="Yes"){

if(
boardRec==="ESP32-S3" &&
(
isHighResolution(a.resolution) ||
interfaceRec==="RGB"
)
){

lvglRec="Excellent fit";

}else if(interfaceRec==="SPI"){

lvglRec="Good fit; keep buffers appropriate to available RAM";

}else{

lvglRec="Suitable with memory and driver verification";

}

reasons.push(
"LVGL is suitable for graphical touchscreen interfaces, but available RAM, frame buffers and display-driver support should be checked for the exact hardware."
);

}else if(a.lvgl==="No"){

lvglRec="Not required";

}else{

lvglRec="Optional; depends on UI complexity";

}


/*
SIZE / RESOLUTION UNKNOWN
*/

if(a.size==="Other / Not sure"){

warnings.push(
"Display size is unknown. Choose according to viewing distance, enclosure space and intended UI."
);

}

if(a.resolution==="Not sure"){

warnings.push(
"Display resolution is unknown. Verify it before choosing the final ESP32 memory and interface configuration."
);

}


/*
PROJECT
*/

if(
a.project==="IoT dashboard" ||
a.project==="Home automation" ||
a.project==="HMI / control panel" ||
a.project==="Raspberry Pi-style interface"
){

reasons.push(
"Your project type benefits from a graphical interface, making suitable display bandwidth, touch input and GUI support important."
);

}


/*
DIFFICULTY
*/

var difficultyPoints=0;

if(interfaceRec==="RGB") difficultyPoints+=2;
if(interfaceRec==="8080 / Parallel") difficultyPoints+=2;
if(isHighResolution(a.resolution)) difficultyPoints+=2;
if(isLargeSize(a.size)) difficultyPoints+=1;
if(a.lvgl==="Yes") difficultyPoints+=1;
if(a.psram==="Required") difficultyPoints+=1;
if(a.touchType!=="No touch") difficultyPoints+=1;
if(boardStatus==="verify") difficultyPoints+=2;
if(touchStatus==="verify") difficultyPoints+=1;

var difficulty=
difficultyPoints<=2
?"Beginner"
:difficultyPoints<=5
?"Intermediate"
:"Advanced";


/*
GENERAL WARNING
*/

warnings.push(
"Not every ESP32 board is compatible with every display module. Verify the exact display controller, touch controller, pinout, voltage, memory, interface and driver support before ordering."
);


/*
WHY
*/

reasons.unshift(
"The recommendation is based primarily on resolution, display interface, memory demand and your project requirements."
);

reasons.push(
"The recommended board is "+boardRec+
" because it provides the most appropriate balance of peripheral support and memory headroom for this configuration."
);

return{

score:Math.max(0,Math.min(100,score)),

board:boardRec,
boardStatus:boardStatus,

size:sizeRec,

resolution:resolutionRec,

iface:interfaceRec,
ifaceStatus:interfaceStatus,

touchType:touchRec,
touchInterface:touchInterfaceRec,
touchStatus:touchStatus,

psram:psramRec,

lvgl:lvglRec,

difficulty:difficulty,

why:reasons.join(" "),

warnings:warnings

};

}


/*
=========================================================
RENDER
=========================================================
*/

function badge(status){

if(status==="recommended")
return '<span class="badge recommended">Recommended</span>';

if(status==="likely")
return '<span class="badge likely">Likely compatible</span>';

return '<span class="badge verify">Requires verification</span>';

}


function renderResults(rec,a){

document.getElementById("selection-text")
.textContent=[
a.board,
a.size,
a.resolution,
a.interface,
a.touchType,
a.touchInterface
].join(" · ");


var title=
document.getElementById("confidence-title");

var detail=
document.getElementById("confidence-detail");


if(rec.score>=90 && rec.boardStatus!=="verify"){

title.textContent="Strong configuration match";

detail.textContent=
"The selected requirements align well with the recommended hardware approach.";

}else if(rec.score>=75 && rec.boardStatus!=="verify"){

title.textContent="Good configuration match";

detail.textContent=
"The configuration is practical, but exact module specifications should still be checked.";

}else{

title.textContent="Requires verification";

detail.textContent=
"One or more hardware constraints need closer verification.";

}


var rows=[

["Recommended ESP32",rec.board,rec.boardStatus],

["Recommended display size",rec.size,"likely"],

["Recommended resolution",rec.resolution,"likely"],

["Recommended display interface",rec.iface,rec.ifaceStatus],

["Recommended touch technology",rec.touchType,rec.touchStatus],

["Recommended touch interface",rec.touchInterface,rec.touchStatus],

["PSRAM",rec.psram,
rec.psram.indexOf("Required")!==-1
?"recommended"
:"likely"],

["LVGL suitability",rec.lvgl,"likely"],

["Estimated project difficulty",rec.difficulty,"likely"]

];


var tbody=
document.getElementById("spec-table-body");

tbody.innerHTML="";


rows.forEach(function(row){

var tr=document.createElement("tr");

var th=document.createElement("th");

th.scope="row";

th.textContent=row[0];

var td=document.createElement("td");

td.innerHTML=
'<span class="spec-value">'+
escapeHtml(row[1])+
"</span>"+
badge(row[2]);

tr.appendChild(th);
tr.appendChild(td);

tbody.appendChild(tr);

});


document.getElementById("why-text")
.textContent=rec.why;


var warningList=
document.getElementById("warning-list-items");

warningList.innerHTML="";


rec.warnings.forEach(function(w){

var li=document.createElement("li");

li.textContent=w;

warningList.appendChild(li);

});


results.classList.remove("is-hidden");

}


/*
=========================================================
PRODUCT MATCHING

The score is based on the recommendation, not the user's
raw selection. This means the product section supports
the recommended solution instead of simply echoing inputs.

=========================================================
*/

function productMatch(product,rec){

var score=0;

if(product.esp32.indexOf(rec.board)!==-1)
score+=5;

if(product.sizes.indexOf(rec.size)!==-1)
score+=4;

if(product.resolutions.indexOf(rec.resolution)!==-1)
score+=5;

if(product.interfaces.indexOf(rec.iface)!==-1)
score+=5;

if(product.touch.indexOf(rec.touchType)!==-1)
score+=3;

if(product.touchInterfaces.indexOf(rec.touchInterface)!==-1)
score+=3;

if(
rec.psram.indexOf("Required")!==-1 &&
product.psram
)
score+=3;

return score;

}


function renderProducts(rec){

productGrid.innerHTML="";


var ranked=products
.map(function(product){

return{
product:product,
score:productMatch(product,rec)
};

})
.filter(function(item){

return item.score>=5;

})
.sort(function(a,b){

return b.score-a.score;

})
.slice(0,3);


if(!ranked.length){

productGrid.innerHTML=
"<p>No mapped hardware currently matches this configuration. "+
'See the <a href="/esp32-touchscreen-displays-guide/">ESP32 Touchscreen Displays guide</a> for more options.</p>';

hardware.classList.remove("is-hidden");

return;

}


ranked.forEach(function(item){

var p=item.product;

var card=document.createElement("article");

card.className="product-card";


var thumb=document.createElement("div");

thumb.className="product-thumb";


if(p.image){

var img=document.createElement("img");

img.src=p.image;

img.alt=p.name;

img.loading="lazy";

thumb.appendChild(img);

}


var h3=document.createElement("h3");

h3.textContent=p.name;


var match=document.createElement("div");

match.className="product-match";

var matchPercent=Math.min(99,Math.round((item.score/23)*100));

match.innerHTML="<strong>"+matchPercent+"% match</strong> <span>based on mapped specifications</span>";


var reason=document.createElement("p");

reason.textContent=p.reason;


var link=document.createElement("a");

link.className="btn-primary";

link.href=p.href;

link.textContent="View product";


card.appendChild(thumb);
card.appendChild(h3);
card.appendChild(match);
card.appendChild(reason);
card.appendChild(link);

productGrid.appendChild(card);

});


hardware.classList.remove("is-hidden");

}


/*
=========================================================
SUBMIT
=========================================================
*/

function handleSelectorSubmit(e){

if(e){
e.preventDefault();
e.stopPropagation();
}

var answers=validate();

if(!answers){
return false;
}

lastRecommendation=
computeRecommendation(answers);

renderResults(
lastRecommendation,
answers
);

renderProducts(
lastRecommendation
);

results.scrollIntoView({
behavior:"smooth",
block:"start"
});

return false;
}

window.embeddedNerdTouchscreenSubmit=handleSelectorSubmit;

form.addEventListener("submit",handleSelectorSubmit);


/*
=========================================================
RESET
=========================================================
*/

document
.getElementById("reset-btn")
.addEventListener("click",function(){

form.reset();
clearErrors();

results.classList.add("is-hidden");
hardware.classList.add("is-hidden");

lastRecommendation=null;

var feedback=document.getElementById("copy-feedback");
if(feedback){
feedback.textContent="";
}

var shareButton=document.getElementById("share-btn");
if(shareButton){
shareButton.hidden=true;
}

updateSelectionProgress();

});


/*
=========================================================
COPY
=========================================================
*/

document
.getElementById("copy-btn")
.addEventListener("click",function(){

if(!lastRecommendation){
return;
}

var rec=lastRecommendation;

var text=[

"Embedded Nerd — ESP32 Touchscreen Selector",

"",

"Recommended configuration:",

"ESP32: "+rec.board,

"Display size: "+rec.size,

"Resolution: "+rec.resolution,

"Display interface: "+rec.iface,

"Touch: "+rec.touchType,

"Touch interface: "+rec.touchInterface,

"PSRAM: "+rec.psram,

"LVGL: "+rec.lvgl,

"Difficulty: "+rec.difficulty,

"",

"Why: "+rec.why,

"",

"Warnings:"

].concat(

rec.warnings.map(function(w){

return"- "+w;

})

).join("\n");


var feedback=
document.getElementById("copy-feedback");


function done(ok){

feedback.textContent=
ok
?"Copied to clipboard."
:"Could not copy — select and copy manually.";

}


if(
navigator.clipboard &&
navigator.clipboard.writeText
){

navigator.clipboard
.writeText(text)
.then(
function(){done(true);},
function(){done(false);}
);

}else{

try{

var textarea=document.createElement("textarea");

textarea.value=text;

textarea.style.position="fixed";
textarea.style.opacity="0";

document.body.appendChild(textarea);

textarea.focus();
textarea.select();

var ok=document.execCommand("copy");

document.body.removeChild(textarea);

done(ok);

}catch(error){

done(false);

}

}

});


/*
=========================================================
SHARE
=========================================================
*/

var shareButton=
document.getElementById("share-btn");


if(navigator.share){

shareButton.hidden=false;

shareButton.addEventListener(
"click",
function(){

if(!lastRecommendation){
return;
}

navigator.share({

title:"ESP32 Touchscreen Recommendation",

text:
"Embedded Nerd — ESP32 Touchscreen Selector\n\n"+
"Recommended ESP32: "+
lastRecommendation.board+
"\nDisplay: "+
lastRecommendation.size+
" · "+
lastRecommendation.resolution+
"\nInterface: "+
lastRecommendation.iface+
"\nTouch: "+
lastRecommendation.touchType+
" · "+
lastRecommendation.touchInterface+
"\nPSRAM: "+
lastRecommendation.psram

}).catch(function(){});

}
);

}

}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initTouchscreenSelector, {once:true});
}else{
  initTouchscreenSelector();
}

})();
