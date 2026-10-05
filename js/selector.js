(function(){
"use strict";

var Engine=window.EmbeddedNerdCompatibility;
var ProjectEngine=window.EmbeddedNerdProjectRecommendations;
var form=document.getElementById("selector-form");
var productGrid=document.getElementById("product-grid");
var results=document.getElementById("results");
var products=[];
var lastEvaluation=null;
var requiredTouched={};
var selectedUseCase=null;

var EMBEDDED_NERD_ORIGIN="https://embeddednerd.com";
var COMMERCE_PATH="/go/hardware/";

function $(id){return document.getElementById(id);}
function esc(v){return String(v==null?"Unknown":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function val(n){var e=$(n);return e?e.value:"";}
function selected(n){return val(n)||null;}
function boolVal(n){var v=val(n);return v===""?null:v==="yes";}
function num(n){var e=$(n);return e&&e.value!==""?Number(e.value):null;}
function required(n){var e=$(n+"-required");return !!(e&&e.checked);}
function hasValue(n){var e=$(n);return !!(e&&e.value!==""&&e.value!==null&&e.value!==undefined);}
function autoRequire(n){var e=$(n+"-required");if(e&&!requiredTouched[n]&&hasValue(n))e.checked=true;}

function build(){
  var r={},p={};
  function add(o,k,v){if(v!==null&&v!==undefined&&v!=="")o[k]=v;}
  function both(k,v,t){if(v!==null&&v!==undefined&&v!==""){if(required(k))add(r,t||k,v);else add(p,k,v);}}
  both("family",selected("family"));both("category",selected("category"),"product_type");both("display_present",boolVal("display_present"));
  both("display_technology",selected("display_technology"));both("display_shape",selected("display_shape"));both("size_min",num("size_min"));
  both("resolution",selected("resolution"));both("touch",boolVal("touch"));both("touch_type",selected("touch_type"));both("touch_interface",selected("touch_interface"));
  both("display_interface",selected("display_interface"));both("native_usb",boolVal("native_usb"));both("microsd",boolVal("microsd"));both("battery_charging",boolVal("battery_charging"));
  both("ce",boolVal("ce"));both("fcc",boolVal("fcc"));both("flash_min",num("flash_min"));both("psram_min",num("psram_min"));both("free_gpio_min",num("free_gpio_min"));
  both("lvgl_support",boolVal("lvgl_support"));both("lvgl_level",selected("lvgl_level"));both("battery",boolVal("battery"));both("imu",boolVal("imu"));both("rtc",boolVal("rtc"));both("audio",boolVal("audio"));
  return {r:r,p:p};
}

function currentIntent(){return selectedUseCase?{useCaseId:selectedUseCase}:null;}
function projectProfile(){return selectedUseCase&&ProjectEngine?ProjectEngine.USE_CASES[selectedUseCase]:null;}
function initUseCases(){
  var grid=$("use-case-grid");if(!grid||!ProjectEngine)return;
  grid.innerHTML=ProjectEngine.USE_CASE_ORDER.map(function(id){
    var p=ProjectEngine.USE_CASES[id];
    return '<button type="button" class="use-case-button" data-use-case="'+esc(id)+'"><strong>'+esc(p.label)+'</strong><span>'+esc(p.description)+'</span></button>';
  }).join("");
  grid.addEventListener("click",function(e){
    var b=e.target.closest("[data-use-case]");if(!b)return;
    selectUseCase(b.getAttribute("data-use-case"));
  });
}
function selectUseCase(id){
  if(!ProjectEngine||!ProjectEngine.USE_CASES[id])return;
  selectedUseCase=id;
  document.querySelectorAll("[data-use-case]").forEach(function(b){
    var on=b.getAttribute("data-use-case")===id;
    b.classList.toggle("active",on);b.setAttribute("aria-pressed",on?"true":"false");
  });
  var clear=$("clear-use-case");if(clear)clear.hidden=false;
  updatePlatformGuidance();updateLiveCount();run();syncUrl();
}
function clearUseCase(){
  selectedUseCase=null;
  document.querySelectorAll("[data-use-case]").forEach(function(b){b.classList.remove("active");b.setAttribute("aria-pressed","false");});
  var clear=$("clear-use-case");if(clear)clear.hidden=true;
  updatePlatformGuidance();updateLiveCount();run();syncUrl();
}
function updatePlatformGuidance(){
  var box=$("platform-guidance"),p=projectProfile();
  if(!box)return;
  if(!p){box.hidden=true;box.innerHTML="";return;}
  box.hidden=false;
  box.innerHTML='<div class="platform-guidance-head"><strong>ESP32-S3 or ESP32-P4?</strong><span>Project-specific guidance</span></div>'+
    '<div class="platform-guidance-grid"><div><strong>Choose ESP32-S3 if</strong><p>'+esc(p.platform.s3)+'</p></div><div><strong>Choose ESP32-P4 if</strong><p>'+esc(p.platform.p4)+'</p></div></div>'+
    '<p class="platform-note">The selector still ranks actual board capabilities first; P4 is not boosted simply for being newer.</p>';
}
function updateActiveFilterSummary(){
  var box=$("active-filter-summary");if(!box)return;
  var b=build(),items=[];
  if(selectedUseCase&&projectProfile())items.push("Project: "+projectProfile().label);
  Object.keys(b.r).forEach(function(k){items.push(formatActiveFilter(k,b.r[k]));});
  Object.keys(b.p).forEach(function(k){items.push(formatActiveFilter(k,b.p[k])+" (preference)");});
  box.hidden=items.length===0;
  box.innerHTML=items.length?'<strong>Active setup</strong><div class="active-filter-chips">'+items.map(function(x){return "<span>"+esc(x)+"</span>";}).join("")+"</div>":"";
  var d=$("advanced-filters"),summary=d&&d.querySelector("summary");
  if(summary){var count=ADVANCED_FILTER_KEYS.reduce(function(n,k){return n+(hasValue(k)?1:0);},0);summary.querySelector(".advanced-filter-count").textContent=count?count+" active":"optional";}
}
function conditional(){
  var family=selected("family"),ps=$("psram_min"),rq=$("psram_min-required"),note=$("psram-note"),off=family==="ESP32-C3";
  [ps,rq].forEach(function(e){if(e)e.disabled=off;});
  if(off){if(ps)ps.value="";if(rq)rq.checked=false;if(note){note.hidden=false;note.textContent="PSRAM requirement is unavailable for ESP32-C3 in this selector.";}}
  else if(note)note.hidden=true;
  syncFilterDependencies();
}
var ADVANCED_FILTER_KEYS=["display_technology","display_shape","size_min","resolution","display_interface","touch_type","touch_interface","native_usb","microsd","battery_charging","flash_min","psram_min","free_gpio_min","lvgl_support","lvgl_level","battery","imu","rtc","audio","ce","fcc"];
function formatActiveFilter(k,v){
  var labels={display_technology:"Display",display_shape:"Shape",size_min:"Size",resolution:"Resolution",display_interface:"Display bus",touch_type:"Touch type",touch_interface:"Touch bus",native_usb:"Native USB",microsd:"microSD",battery_charging:"Battery charging",flash_min:"Flash",psram_min:"PSRAM",free_gpio_min:"GPIO",lvgl_support:"LVGL",lvgl_level:"LVGL level",battery:"Battery",imu:"IMU",rtc:"RTC",audio:"Audio",ce:"CE",fcc:"FCC"};
  var text=labels[k]||formatRelaxLabel(k);
  if(k==="size_min")return text+" ≥ "+v+"″";if(k==="flash_min"||k==="psram_min")return text+" ≥ "+v+" MB";if(k==="free_gpio_min")return text+" ≥ "+v;
  if(["native_usb","microsd","battery_charging","battery","imu","rtc","audio","ce","fcc","lvgl_support"].indexOf(k)>=0)return text+": "+(v===true?"yes":v===false?"no":String(v));
  return text+": "+String(v);
}
function setupAdvancedFilters(){
  var f=$("selector-form"),s=f.querySelectorAll(".filter-section");if(s.length<5)return;
  var d=document.createElement("details");d.id="advanced-filters";d.className="advanced-filters";
  var m=document.createElement("summary");m.innerHTML='<strong>Advanced filters</strong><span class="advanced-filter-count">optional</span><span>Display details, memory, GPIO, storage and certification</span>';
  d.appendChild(m);for(var i=1;i<s.length;i++)d.appendChild(s[i]);s[0].parentNode.insertBefore(d,s[0].nextSibling);
}
var PRESETS={"s3-lvgl":{family:"ESP32-S3",psram_min:"8",lvgl_support:"yes"},"s3-touchscreen":{family:"ESP32-S3",display_present:"yes",touch:"yes",psram_min:"8"},"amoled-touch-battery":{display_present:"yes",display_technology:"AMOLED",touch:"yes",touch_type:"capacitive",battery:"yes",battery_charging:"yes"},"round-amoled":{display_present:"yes",display_technology:"AMOLED",display_shape:"round",touch:"yes"},"c6-display":{family:"ESP32-C6",display_present:"yes"},"large-800x480":{display_present:"yes",resolution:"800x480"},"800x480-touch":{display_present:"yes",resolution:"800x480",touch:"yes"},"4-3-touch":{display_present:"yes",size_min:"4",touch:"yes"},"touch-spi":{display_present:"yes",touch:"yes",touch_interface:"SPI"},"lvgl-ready":{display_present:"yes",lvgl_support:"yes",lvgl_level:"ready"},"native-usb":{native_usb:"yes"}};
function applyPreset(id,shouldReset){
  var m=PRESETS[id];if(!m)return false;if(shouldReset)reset(false);
  Object.keys(m).forEach(function(k){var e=$(k);if(e){e.value=m[k];var r=$(k+"-required");if(r)r.checked=true;}});
  conditional();syncFilterDependencies();updateLiveCount();updateActiveFilterSummary();return true;
}
function setupPresets(){document.querySelectorAll("[data-preset]").forEach(function(btn){btn.addEventListener("click",function(){var id=btn.getAttribute("data-preset");if(!applyPreset(id,true))return;document.querySelectorAll("[data-preset]").forEach(function(b){b.classList.toggle("active",b===btn);});syncUrl(id);run();});});}
function disableFilter(ids,off){ids.forEach(function(id){var e=$(id),r=$(id+"-required");if(e)e.disabled=off;if(r)r.disabled=off;if(off){if(e)e.value="";if(r)r.checked=false;requiredTouched[id]=false;}});}
function syncFilterDependencies(){var display=selected("display_present"),touch=selected("touch");disableFilter(["display_technology","display_shape","size_min","resolution","display_interface"],display==="no");disableFilter(["touch_type","touch_interface"],display==="no"||touch==="no");}
function formatRelaxLabel(k){var labels={family:"ESP32 family",product_type:"Hardware type",display_present:"Display requirement",display_technology:"Display technology",display_shape:"Display shape",size_min:"Minimum display size",resolution:"Resolution",touch:"Touch requirement",touch_type:"Touch type",touch_interface:"Touch interface",display_interface:"Display interface",native_usb:"Native USB",microsd:"microSD",battery_charging:"Battery charging",flash_min:"Minimum Flash",psram_min:"Minimum PSRAM",free_gpio_min:"Minimum free GPIO",ce:"CE certification",fcc:"FCC certification",lvgl_support:"LVGL support",lvgl_level:"LVGL support level",battery:"Battery",imu:"IMU",rtc:"RTC",audio:"Audio"};return labels[k]||k.replace(/_/g," ");}
function relaxSuggestions(){var b=build(),keys=Object.keys(b.r),base=Engine.evaluate(products,b.r,b.p,currentIntent()).passed;return keys.map(function(k){var r=Object.assign({},b.r);delete r[k];var count=Engine.evaluate(products,r,b.p,currentIntent()).passed;return {key:k,label:formatRelaxLabel(k),count:count,gain:Math.max(0,count-base)};}).filter(function(x){return x.count>0;}).sort(function(a,b){return b.gain-a.gain||b.count-a.count;}).slice(0,3);}
function applyRelax(key){var r=$(key+"-required");if(r){r.checked=false;requiredTouched[key]=true;}conditional();syncUrl();updateLiveCount();updateActiveFilterSummary();run();}
function updateLiveCount(){
  if(!products.length){$("live-count").textContent="Catalog loading…";return;}
  var b=build(),e=Engine.evaluate(products,b.r,b.p,currentIntent());
  $("live-count").textContent=(selectedUseCase?e.passed+" compatible options ranked for "+projectProfile().label:e.passed+" compatible now")+" · "+e.valid+" valid catalog entries";
}
function syncUrl(presetId){
  var u=new URL(window.location.href),p=u.searchParams,ids=["category","family","display_present","display_technology","display_shape","size_min","resolution","touch","touch_type","touch_interface","display_interface","native_usb","microsd","battery_charging","ce","fcc","flash_min","psram_min","free_gpio_min","lvgl_support","lvgl_level","battery","imu","rtc","audio"];
  Array.from(p.keys()).forEach(function(k){if(k==="preset"||k==="project"||k.endsWith("_req")||ids.indexOf(k)>=0)p.delete(k);});
  ids.forEach(function(k){var v=val(k);if(v!==""){p.set(k,v);if(required(k))p.set(k+"_req","1");}});
  if(selectedUseCase)p.set("project",selectedUseCase);if(presetId&&PRESETS[presetId])p.set("preset",presetId);
  history.replaceState(null,"",u.pathname+(p.toString()?"?"+p.toString():"")+u.hash);
}
function loadUrl(){
  var p=new URLSearchParams(location.search),found=false,preset=p.get("preset"),project=p.get("project");
  if(project&&ProjectEngine&&ProjectEngine.USE_CASES[project]){selectedUseCase=project;found=true;}
  if(preset&&applyPreset(preset,false)){document.querySelectorAll("[data-preset]").forEach(function(b){b.classList.toggle("active",b.getAttribute("data-preset")===preset);});found=true;}
  p.forEach(function(v,k){if(k==="preset"||k==="project"||k.endsWith("_req"))return;var e=$(k);if(e){e.value=v;found=true;var r=$(k+"-required");if(r)r.checked=p.get(k+"_req")==="1";}});
  if(found){if(selectedUseCase)selectUseCase(selectedUseCase);conditional();syncFilterDependencies();updateLiveCount();updateActiveFilterSummary();}
}
function setMode(mode){
  document.querySelectorAll("[data-mode]").forEach(function(b){b.classList.toggle("active",b.dataset.mode===mode);});
  $("browse-note").hidden=mode!=="browse";$("quick-start").hidden=mode==="browse";$("project-intent").hidden=mode==="browse";$("platform-guidance").hidden=mode==="browse";
  var adv=$("advanced-filters");if(adv)adv.hidden=mode==="browse";
  document.querySelectorAll("#selector-form .filter-section").forEach(function(s){s.hidden=mode==="browse";});
}
function searchMatch(p,q){
  if(!q)return true;q=q.toLowerCase();
  return [p.name,p.manufacturer,p.product_type,(p.esp32.family||[]).join(" "),p.esp32.exact_mcu,p.display.technology,p.display.controller,p.touch.touch_controller,(p.tags||[]).join(" ")].filter(Boolean).join(" ").toLowerCase().includes(q);
}
function commerceUrl(p){return EMBEDDED_NERD_ORIGIN+COMMERCE_PATH+encodeURIComponent(p.id)+"/";}

function recommendationReason(item){
  if(item.useCaseExplanation)return item.useCaseExplanation;
  if(selectedUseCase&&ProjectEngine)return ProjectEngine.explainRecommendation(item.product,selectedUseCase,{matches:item.useCaseMatches||[]});
  return "";
}
function card(item,requirements){
  requirements=requirements||{};var p=item.product,d=p.display||{},t=p.touch||{},u=p.usb||{},h=p.hardware||{};
  var display=d.display_present?((d.size_inches?d.size_inches+"″ ":"")+(d.resolution?d.resolution.width+"×"+d.resolution.height:"")+(d.interface?" · "+d.interface:"")):"No display";
  var specs=[
    ["MCU",(p.esp32.family||[]).join(", ")||"Unknown"],["Display",display],
    ["Touch",t.touch===true?(t.touch_type||"Yes"):t.touch===false?"No":"Unknown"],
    ["Memory",[p.esp32.flash_mb!=null?p.esp32.flash_mb+" MB Flash":null,p.esp32.psram_mb!=null?p.esp32.psram_mb+" MB PSRAM":null].filter(Boolean).join(" · ")||"Unknown"],
    ["USB",u.native_usb===true?"Native USB":u.uart_bridge===true?"UART bridge":u.usb_available===true?"USB":"Unknown"],
    ["Features",[h.microsd===true?"microSD":null,h.battery_charging===true?"Battery charging":null].filter(Boolean).join(" · ")||"—"]
  ];
  var mandatory=[];
  if(requirements.family)mandatory.push("ESP32 family: "+requirements.family);
  if(requirements.product_type)mandatory.push("Hardware type: "+requirements.product_type.replace(/_/g," "));
  if(requirements.display_present!==null&&requirements.display_present!==undefined)mandatory.push("Display: "+(requirements.display_present?"present":"none"));
  if(requirements.display_technology)mandatory.push("Display: "+requirements.display_technology);
  if(requirements.display_shape)mandatory.push("Shape: "+requirements.display_shape);
  if(requirements.size_min!==null&&requirements.size_min!==undefined)mandatory.push("Display size ≥ "+requirements.size_min+"″");
  if(requirements.resolution)mandatory.push("Resolution: "+requirements.resolution);
  if(requirements.touch!==null&&requirements.touch!==undefined)mandatory.push("Touch: "+(requirements.touch?"yes":"no"));
  if(requirements.touch_type)mandatory.push("Touch type: "+requirements.touch_type);
  if(requirements.touch_interface)mandatory.push("Touch bus: "+requirements.touch_interface);
  if(requirements.display_interface)mandatory.push("Display bus: "+requirements.display_interface);
  if(requirements.native_usb!==null&&requirements.native_usb!==undefined)mandatory.push("Native USB: "+(requirements.native_usb?"yes":"no"));
  if(requirements.microsd!==null&&requirements.microsd!==undefined)mandatory.push("microSD: "+(requirements.microsd?"present":"not present"));
  if(requirements.battery_charging!==null&&requirements.battery_charging!==undefined)mandatory.push("Battery charging: "+(requirements.battery_charging?"present":"not present"));
  if(requirements.flash_min!==null&&requirements.flash_min!==undefined)mandatory.push("Flash ≥ "+requirements.flash_min+" MB");
  if(requirements.psram_min!==null&&requirements.psram_min!==undefined)mandatory.push("PSRAM ≥ "+requirements.psram_min+" MB");
  if(requirements.free_gpio_min!==null&&requirements.free_gpio_min!==undefined)mandatory.push("Free GPIO ≥ "+requirements.free_gpio_min);
  if(requirements.ce!==null&&requirements.ce!==undefined)mandatory.push("CE: "+(requirements.ce?"yes":"no"));
  if(requirements.fcc!==null&&requirements.fcc!==undefined)mandatory.push("FCC: "+(requirements.fcc?"yes":"no"));
  var image=p.image||"",imageAlt=p.image_alt||p.name||"Hardware product";
  var technicalUrl=p.product_url?(p.product_url.indexOf("http")===0?p.product_url:EMBEDDED_NERD_ORIGIN+p.product_url):"#";
  var imageHtml=image?'<div class="product-image-wrap"><img class="product-image" src="'+esc(image)+'" alt="'+esc(imageAlt)+'" loading="lazy" width="640" height="400"></div>':"";
  var contextual=[];
  mandatory.forEach(function(x){contextual.push('<span class="compat-badge compat-required">'+esc(x)+" ✓</span>");});
  (item.matches||[]).slice(0,4).forEach(function(x){contextual.push('<span class="compat-badge compat-preference">'+esc(x)+" ✓</span>");});
  (item.useCaseMatches||[]).slice(0,4).forEach(function(x){contextual.push('<span class="compat-badge compat-intent">'+esc(x)+" ✓</span>");});
  var intentReason=recommendationReason(item);
  var scoreLabel=selectedUseCase?((item.useCaseScore||0)+"% project fit"):(item.score?(item.score+"% preference match"):"");
  var unknownIntent=(item.useCaseUnknown||[]).slice(0,3);
  return '<article class="product-card">'+imageHtml+
    '<div class="product-head"><div><span class="eyebrow">'+esc(p.manufacturer||"Manufacturer unknown")+'</span><h3><a class="product-title-link" href="'+esc(technicalUrl)+'">'+esc(p.name)+'</a></h3><span class="type-badge">'+esc((p.product_type||"hardware").replace(/_/g," "))+'</span></div>'+
    (scoreLabel?'<strong class="match-badge">'+esc(scoreLabel)+"</strong>":"")+'</div>'+
    '<div class="match-badges">'+contextual.join("")+"</div>"+
    '<div class="quick-specs">'+specs.map(function(x){return '<div><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+"</strong></div>";}).join("")+"</div>"+
    (intentReason?'<div class="project-recommendation"><strong>Why this fits</strong><p>'+esc(intentReason)+'</p></div>':"")+
    (unknownIntent.length?'<p class="data-note"><strong>Catalog note:</strong> '+esc(unknownIntent.join(", "))+". Not scored until verified.</p>":"")+
    (mandatory.length?'<div class="match-explanation mandatory-match"><strong>✓ Required technical filters</strong><ul>'+mandatory.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul></div>":"")+
    '<div class="match-explanation preference-match"><strong>✓ Technical preferences matched</strong>'+
      ((item.matches||[]).length?'<ul>'+item.matches.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul>":"<p>No optional technical preferences selected.</p>")+
      ((item.misses||[]).length?'<strong class="not-matched-heading">~ Not matched</strong><ul class="not-matched-list">'+item.misses.slice(0,4).map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul>":"")+
    '</div><div class="product-actions"><a class="btn-small btn-link" href="'+esc(technicalUrl)+'">View technical details</a><a class="btn-small btn-commerce" href="'+esc(commerceUrl(p))+'" rel="nofollow sponsored noopener">Where to buy</a></div>'+
  "</article>";
}
function exclusions(ev){
  var keys=Object.keys(ev.exclusions).sort(function(a,b){return ev.exclusions[b]-ev.exclusions[a];});
  $("exclusion-list").innerHTML=keys.slice(0,10).map(function(k){return "<li><strong>"+ev.exclusions[k]+"</strong> "+esc(k)+"</li>";}).join("")||"<li>No mandatory exclusions.</li>";
}
function show(ev){
  $("result-count").textContent=ev.passed;$("result-total").textContent=ev.valid;$("result-excluded").textContent=Math.max(0,ev.valid-ev.passed);
  var active=Object.keys(build().r).length+Object.keys(build().p).length+(selectedUseCase?1:0);
  $("result-summary").textContent=selectedUseCase
    ? ev.passed+" compatible hardware options ranked for "+projectProfile().label+" using project fit plus technical requirements."
    : active?ev.passed+" compatible hardware found for your current technical setup. "+Math.max(0,ev.valid-ev.passed)+" excluded by mandatory requirements."
    : ev.passed+" hardware entries available in the catalog.";
  exclusions(ev);$("exclusion-panel").hidden=Object.keys(ev.exclusions).length===0;
  if(!ev.ranked.length){
    $("empty-state").hidden=false;
    var ss=relaxSuggestions();$("empty-state-text").innerHTML="No hardware meets all mandatory technical requirements."+(ss.length?' The quickest ways to broaden the search are:<ul class="relax-list">'+ss.map(function(x){return '<li><button type="button" class="relax-action" data-relax-key="'+esc(x.key)+'">Remove <strong>'+esc(x.label)+'</strong> from Required → <strong>+'+x.gain+'</strong> compatible result'+(x.gain===1?"":"s")+"</button></li>";}).join("")+"</ul>":" Try relaxing one or more required filters.");
    productGrid.innerHTML="";
  }else{$("empty-state").hidden=true;productGrid.innerHTML=ev.ranked.slice(0,50).map(card).join("");}
  results.hidden=false;results.scrollIntoView({behavior:"smooth",block:"start"});
}
function browse(){
  var q=$("hardware-search").value.trim();
  var list=products.filter(function(p){return searchMatch(p,q);}).map(function(p){return {product:p,score:0,matches:[],misses:[]};});
  $("result-count").textContent=list.length;$("result-total").textContent=products.length;$("result-excluded").textContent=Math.max(0,products.length-list.length);
  $("result-summary").textContent="Browsing "+list.length+" of "+products.length+" catalog entries.";$("exclusion-panel").hidden=true;$("empty-state").hidden=true;
  productGrid.innerHTML=list.slice(0,50).map(card).join("")||"<p>No catalog entries match your search.</p>";results.hidden=false;
}
function run(){
  var b=build();
  lastEvaluation=Engine.evaluate(products,b.r,b.p,currentIntent());
  show(lastEvaluation);
}
function reset(shouldScroll){
  form.reset();selectedUseCase=null;
  document.querySelectorAll("[data-preset]").forEach(function(b){b.classList.remove("active");});
  document.querySelectorAll("[data-use-case]").forEach(function(b){b.classList.remove("active");b.setAttribute("aria-pressed","false");});
  requiredTouched={};$("hardware-search").value="";
  document.querySelectorAll("#selector-form input[type=checkbox]").forEach(function(e){e.checked=false;});
  document.querySelectorAll("#selector-form select").forEach(function(e){e.selectedIndex=0;});
  document.querySelectorAll("#selector-form input[type=number]").forEach(function(e){e.value="";});
  results.hidden=true;$("catalog-error").hidden=true;$("catalog-warning").hidden=true;setMode("requirements");
  conditional();updatePlatformGuidance();updateLiveCount();updateActiveFilterSummary();syncUrl();
  var adv=$("advanced-filters");if(adv)adv.open=false;if(shouldScroll!==false)window.scrollTo({top:0,behavior:"smooth"});
}
$("empty-state").addEventListener("click",function(e){var btn=e.target.closest(".relax-action");if(btn)applyRelax(btn.getAttribute("data-relax-key"));});
form.addEventListener("change",function(e){
  if(e.target&&e.target.id){if(/-required$/.test(e.target.id))requiredTouched[e.target.id.replace(/-required$/,"")]=true;else autoRequire(e.target.id);}
  conditional();updateLiveCount();updateActiveFilterSummary();syncUrl();
});
form.addEventListener("submit",function(e){e.preventDefault();run();syncUrl();});
$("browse-btn").addEventListener("click",function(){setMode("browse");browse();window.requestAnimationFrame(function(){var p=$("browse-note");if(p){p.scrollIntoView({behavior:"smooth",block:"nearest");$("hardware-search").focus();}}});});
$("hardware-search").addEventListener("input",browse);$("reset-btn").addEventListener("click",function(){reset(true);});
$("share-btn").addEventListener("click",function(){syncUrl();var b=$("share-btn");if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(location.href).then(function(){b.textContent="Link copied";setTimeout(function(){b.textContent="Share setup";},1800);});}else{window.prompt("Copy this selector URL:",location.href);}});
$("mode-requirements").addEventListener("click",function(){setMode("requirements");});
$("clear-use-case").addEventListener("click",clearUseCase);
setupAdvancedFilters();initUseCases();setupPresets();updatePlatformGuidance();loadUrl();if(selectedUseCase){selectUseCase(selectedUseCase);}updateActiveFilterSummary();

fetch("data/products.json?v=20261005-1").then(function(r){if(!r.ok)throw Error("Catalog load failed");return r.json();}).then(function(data){
  products=(data.products||[]).map(Engine.normalizeProduct);$("catalog-count").textContent=products.length;conditional();updateLiveCount();
  if(new URLSearchParams(location.search).size||selectedUseCase)run();
}).catch(function(e){$("catalog-error").hidden=false;$("catalog-error").textContent="The hardware catalog could not be loaded. "+e.message;});
})();