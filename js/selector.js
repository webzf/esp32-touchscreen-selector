(function(){
"use strict";

var Engine=window.EmbeddedNerdCompatibility;
var form=document.getElementById("selector-form");
var productGrid=document.getElementById("product-grid");
var results=document.getElementById("results");
var products=[];
var lastEvaluation=null;
var requiredTouched={};

var EMBEDDED_NERD_ORIGIN="https://embeddednerd.com";
var COMMERCE_PATH="/go/hardware/";

function $(id){return document.getElementById(id);}
function esc(v){
  return String(v==null?"Unknown":v)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function val(n){
  var e=document.getElementById(n);
  return e ? e.value : "";
}
function selected(n){return val(n)||null;}
function boolVal(n){
  var v=val(n);
  return v===""?null:v==="yes";
}
function num(n){
  var e=$(n);
  return e&&e.value!==""?Number(e.value):null;
}
function required(n){
  var e=$(n+"-required");
  return !!(e&&e.checked);
}
function hasValue(n){
  var e=$(n);
  return !!(e&&e.value!==""&&e.value!==null&&e.value!==undefined);
}
function autoRequire(n){
  var e=$(n+"-required");
  if(e&&!requiredTouched[n]&&hasValue(n)) e.checked=true;
}

function build(){
  var r={},p={};
  function add(o,k,v){
    if(v!==null&&v!==undefined&&v!=="") o[k]=v;
  }
  function both(k,v,t){
    if(v!==null&&v!==undefined&&v!==""){
      if(required(k)) add(r,t||k,v);
      else add(p,k,v);
    }
  }

  both("family",selected("family"));
  both("category",selected("category"),"product_type");
  both("display_present",boolVal("display_present"));
  both("display_technology",selected("display_technology"));
  both("display_shape",selected("display_shape"));
  both("size_min",num("size_min"));
  both("resolution",selected("resolution"));
  both("touch",boolVal("touch"));
  both("touch_type",selected("touch_type"));
  both("touch_interface",selected("touch_interface"));
  both("display_interface",selected("display_interface"));
  both("native_usb",boolVal("native_usb"));
  both("microsd",boolVal("microsd"));
  both("battery_charging",boolVal("battery_charging"));
  both("ce",boolVal("ce"));
  both("fcc",boolVal("fcc"));
  both("flash_min",num("flash_min"));
  both("psram_min",num("psram_min"));
  both("free_gpio_min",num("free_gpio_min"));
  both("lvgl_support",boolVal("lvgl_support"));
  both("lvgl_level",selected("lvgl_level"));
  both("battery",boolVal("battery"));
  both("imu",boolVal("imu"));
  both("rtc",boolVal("rtc"));
  both("audio",boolVal("audio"));

  return {r:r,p:p};
}

function conditional(){
  var family=selected("family");
  var ps=$( "psram_min");
  var rq=$( "psram_min-required");
  var note=$( "psram-note");
  var off=family==="ESP32-C3";

  [ps,rq].forEach(function(e){if(e)e.disabled=off;});
  if(off){
    if(ps)ps.value="";
    if(rq)rq.checked=false;
    if(note){
      note.hidden=false;
      note.textContent="PSRAM requirement is unavailable for ESP32-C3 in this selector.";
    }
  }else if(note){note.hidden=true;}syncFilterDependencies();}

function setupAdvancedFilters(){var f=$("selector-form"),s=f.querySelectorAll(".filter-section");if(s.length<5)return;var d=document.createElement("details");d.id="advanced-filters";d.className="advanced-filters";var m=document.createElement("summary");m.innerHTML="<strong>Advanced filters</strong><span>Display details, memory, GPIO, storage and certification</span>";d.appendChild(m);for(var i=1;i<s.length;i++)d.appendChild(s[i]);s[0].parentNode.insertBefore(d,s[0].nextSibling);}
function setupPresets(){document.querySelectorAll(".preset-button").forEach(function(b){b.addEventListener("click",function(){reset(false);var m={"s3-psram":{family:"ESP32-S3",psram_min:"8"},"touch-spi":{display_present:"yes",touch:"yes",touch_interface:"SPI"},"native-usb":{native_usb:"yes"},"large-display":{display_present:"yes",size_min:"4"},"c6-amoled-touch-battery":{family:"ESP32-C6",display_present:"yes",display_technology:"AMOLED",touch:"yes",touch_type:"capacitive",touch_interface:"I2C",display_interface:"QSPI",battery:"yes",battery_charging:"yes"},"s3-amoled-touch":{family:"ESP32-S3",display_present:"yes",display_technology:"AMOLED",touch:"yes",touch_type:"capacitive",touch_interface:"I2C",display_interface:"QSPI",battery:"yes",battery_charging:"yes"}}[b.dataset.preset]||{};Object.keys(m).forEach(function(k){var e=$(k);if(e){e.value=m[k];var r=$(k+"-required");if(r)r.checked=true;}});conditional();updateLiveCount();var d=$("advanced-filters");if(d&&(b.dataset.preset==="touch-spi"||b.dataset.preset==="large-display"))d.open=true;run();});});}
function disableFilter(ids,off){ids.forEach(function(id){var e=$(id),r=$(id+"-required");if(e)e.disabled=off;if(r)r.disabled=off;if(off){if(e)e.value="";if(r)r.checked=false;requiredTouched[id]=false;}});}
function syncFilterDependencies(){var display=selected("display_present"),touch=selected("touch");disableFilter(["display_technology","display_shape","size_min","resolution","display_interface"],display==="no");disableFilter(["touch_type","touch_interface"],display==="no"||touch==="no");}
function formatRelaxLabel(k){var labels={family:"ESP32 family",product_type:"Hardware type",display_present:"Display requirement",display_technology:"Display technology",display_shape:"Display shape",size_min:"Minimum display size",resolution:"Resolution",touch:"Touch requirement",touch_type:"Touch type",touch_interface:"Touch interface",display_interface:"Display interface",native_usb:"Native USB",microsd:"microSD",battery_charging:"Battery charging",flash_min:"Minimum Flash",psram_min:"Minimum PSRAM",free_gpio_min:"Minimum free GPIO",ce:"CE certification",fcc:"FCC certification",lvgl_support:"LVGL support",lvgl_level:"LVGL support level",battery:"Battery",imu:"IMU",rtc:"RTC",audio:"Audio"};return labels[k]||k.replace(/_/g," ");}
function relaxSuggestions(){var b=build(),keys=Object.keys(b.r),base=Engine.evaluate(products,b.r,b.p).passed;return keys.map(function(k){var r=Object.assign({},b.r);delete r[k];var count=Engine.evaluate(products,r,b.p).passed;return {key:k,label:formatRelaxLabel(k),count:count,gain:Math.max(0,count-base)};}).filter(function(x){return x.count>0;}).sort(function(a,b){return b.gain-a.gain||b.count-a.count;}).slice(0,3);}
function applyRelax(key){var r=$(key+"-required");if(r){r.checked=false;requiredTouched[key]=true;}conditional();syncFilterDependencies();syncUrl();updateLiveCount();run();}
function updateLiveCount(){if(!products.length){$("live-count").textContent="Catalog loading…";return;}var b=build(),e=Engine.evaluate(products,b.r,b.p);$("live-count").textContent=e.passed+" compatible now · "+e.valid+" valid catalog entries";}
function syncUrl(){var u=new URL(window.location.href),p=u.searchParams,ids=["category","family","display_present","display_technology","display_shape","size_min","resolution","touch","touch_type","touch_interface","display_interface","native_usb","microsd","battery_charging","ce","fcc","flash_min","psram_min","free_gpio_min"];Array.from(p.keys()).forEach(function(k){if(k.endsWith("_req")||ids.indexOf(k)>=0)p.delete(k);});ids.forEach(function(k){var v=val(k);if(v!==""){p.set(k,v);if(required(k))p.set(k+"_req","1");}});history.replaceState(null,"",u.pathname+(p.toString()?"?"+p.toString():"")+u.hash);}
function loadUrl(){var p=new URLSearchParams(location.search),found=false;p.forEach(function(v,k){if(k.endsWith("_req"))return;var e=$(k);if(e){e.value=v;found=true;var r=$(k+"-required");if(r)r.checked=p.get(k+"_req")==="1";}});if(found){conditional();syncFilterDependencies();updateLiveCount();}}
function setMode(mode){
  document.querySelectorAll("[data-mode]").forEach(function(b){
    b.classList.toggle("active",b.dataset.mode===mode);
  });
  $("browse-note").hidden=mode!=="browse";$("quick-start").hidden=mode==="browse";var adv=$("advanced-filters");if(adv)adv.hidden=mode==="browse";
  document.querySelectorAll("#selector-form .filter-section").forEach(function(s){
    s.hidden=mode==="browse";
  });
}

function searchMatch(p,q){
  if(!q)return true;
  q=q.toLowerCase();
  return [
    p.name,p.manufacturer,p.product_type,
    (p.esp32.family||[]).join(" "),
    p.esp32.exact_mcu,
    p.display.technology,p.display.controller,
    p.touch.touch_controller,(p.tags||[]).join(" ")
  ].filter(Boolean).join(" ").toLowerCase().includes(q);
}

function commerceUrl(p){
  return EMBEDDED_NERD_ORIGIN+COMMERCE_PATH+encodeURIComponent(p.id)+"/";
}

function card(item,requirements){
  requirements=requirements||{};
  var p=item.product,d=p.display||{},t=p.touch||{},u=p.usb||{},h=p.hardware||{};
  var display=d.display_present
    ? ((d.size_inches?d.size_inches+'″ ':'')+
       (d.resolution?d.resolution.width+"×"+d.resolution.height:"")+
       (d.interface?" · "+d.interface:""))
    : "No display";

  var specs=[
    ["MCU",(p.esp32.family||[]).join(", ")||"Unknown"],
    ["Display",display],
    ["Touch",t.touch===true?(t.touch_type||"Yes"):t.touch===false?"No":"Unknown"],
    ["Memory",[
      p.esp32.flash_mb!=null?p.esp32.flash_mb+" MB Flash":null,
      p.esp32.psram_mb!=null?p.esp32.psram_mb+" MB PSRAM":null
    ].filter(Boolean).join(" · ")||"Unknown"],
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

  var image=p.image||"";
  var imageAlt=p.image_alt||p.name||"Hardware product";
  var technicalUrl=p.product_url ? (p.product_url.indexOf("http")===0 ? p.product_url : EMBEDDED_NERD_ORIGIN + p.product_url) : "#";
  var imageHtml=image
    ? '<div class="product-image-wrap"><img class="product-image" src="'+esc(image)+'" alt="'+esc(imageAlt)+'" loading="lazy" width="640" height="400"></div>'
    : '';

  var contextual=[];
  if(Object.keys(requirements).length){
    mandatory.forEach(function(x){contextual.push('<span class="compat-badge compat-required">'+esc(x)+' ✓</span>');});
    item.matches.slice(0,5).forEach(function(x){contextual.push('<span class="compat-badge compat-preference">'+esc(x)+' ✓</span>');});
  }else{
    [p.esp32.family&&p.esp32.family[0],d.display_present===true?(d.interface||d.technology||"Display"):null,t.touch===true?"Touch":null,p.esp32.psram_mb!=null?"PSRAM "+p.esp32.psram_mb+"MB":null,u.native_usb===true?"Native USB":null].filter(Boolean).forEach(function(x){
      contextual.push('<span class="compat-badge">'+esc(x)+' ✓</span>');
    });
  }

  return '<article class="product-card">'+
    imageHtml+
    '<div class="product-head"><div>'+
      '<span class="eyebrow">'+esc(p.manufacturer||"Manufacturer unknown")+'</span>'+
      '<h3><a class="product-title-link" href="'+esc(technicalUrl)+'">'+esc(p.name)+'</a></h3>'+
      '<span class="type-badge">'+esc((p.product_type||"hardware").replace(/_/g," "))+'</span>'+
    '</div>'+
    (item.score?'<strong class="match-badge">'+item.score+'% preference match</strong>':"")+
    '</div>'+
    '<div class="match-badges">'+contextual.join('')+'</div>'+
    '<div class="quick-specs">'+specs.map(function(x){
      return '<div><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong></div>';
    }).join("")+'</div>'+
    (mandatory.length?'<div class="match-explanation mandatory-match"><strong>✓ Required</strong><ul>'+mandatory.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+'</ul></div>':"")+
    '<div class="match-explanation preference-match"><strong>✓ Preferences matched</strong>'+
      (item.matches.length?'<ul>'+item.matches.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+'</ul>':"<p>No optional preferences selected.</p>")+
      (item.misses.length?'<strong class="not-matched-heading">~ Not matched</strong><ul class="not-matched-list">'+item.misses.slice(0,4).map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+'</ul>':"")+
    '</div>'+
    '<div class="product-actions">'+
      '<a class="btn-small btn-link" href="'+esc(p.product_url ? (p.product_url.indexOf("http")===0 ? p.product_url : EMBEDDED_NERD_ORIGIN + p.product_url) : "#")+'">View technical details</a>'+
      '<a class="btn-small btn-commerce" href="'+esc(commerceUrl(p))+'" rel="nofollow sponsored noopener">Where to buy</a>'+
    '</div>'+
  '</article>';
}
function exclusions(ev){
  var keys=Object.keys(ev.exclusions).sort(function(a,b){
    return ev.exclusions[b]-ev.exclusions[a];
  });
  $("exclusion-list").innerHTML=keys.slice(0,10).map(function(k){
    return "<li><strong>"+ev.exclusions[k]+"</strong> "+esc(k)+"</li>";
  }).join("")||"<li>No mandatory exclusions.</li>";
}

function show(ev){
  $("result-count").textContent=ev.passed;
  $("result-total").textContent=ev.valid;
  $("result-excluded").textContent=Math.max(0,ev.valid-ev.passed);
  var active=Object.keys(build().r).length+Object.keys(build().p).length;
  $("result-summary").textContent=active
    ? ev.passed+" compatible hardware found for your current setup. "+Math.max(0,ev.valid-ev.passed)+" excluded by mandatory requirements."+
      (ev.invalid ? " "+ev.invalid+" catalog entr"+(ev.invalid===1?"y":"ies")+" failed validation." : "")
    : ev.passed+" hardware entries available in the catalog.";

  exclusions(ev);
  $("exclusion-panel").hidden=Object.keys(ev.exclusions).length===0;

  if(!ev.ranked.length){
    $("empty-state").hidden=false;
    var ss=relaxSuggestions();$("empty-state-text").innerHTML="No hardware meets all mandatory requirements."+(ss.length?" The quickest ways to broaden the search are:<ul class=\"relax-list\">"+ss.map(function(x){return "<li><button type=\"button\" class=\"relax-action\" data-relax-key=\""+esc(x.key)+"\">Remove <strong>"+esc(x.label)+"</strong> from Required → <strong>+"+x.gain+"</strong> compatible result"+(x.gain===1?"":"s")+"</button></li>";}).join("")+"</ul>":" Try relaxing one or more required filters.");
    productGrid.innerHTML="";
  }else{
    $("empty-state").hidden=true;
    productGrid.innerHTML=ev.ranked.slice(0,50).map(card).join("");
  }

  results.hidden=false;
  results.scrollIntoView({behavior:"smooth",block:"start"});
}

function browse(){
  var q=$("hardware-search").value.trim();
  var list=products.filter(function(p){return searchMatch(p,q);}).map(function(p){
    return {product:p,score:0,matches:[],misses:[]};
  });

  $("result-count").textContent=list.length;
  $("result-total").textContent=products.length;
  $("result-excluded").textContent=Math.max(0,products.length-list.length);
  $("result-summary").textContent="Browsing "+list.length+" of "+products.length+" catalog entries.";
  $("exclusion-panel").hidden=true;
  $("empty-state").hidden=true;
  productGrid.innerHTML=list.slice(0,50).map(card).join("")||
    "<p>No catalog entries match your search.</p>";
  results.hidden=false;
}

function run(){
  var b=build();
  lastEvaluation=Engine.evaluate(products,b.r,b.p);
  show(lastEvaluation);
}

function reset(shouldScroll){
  form.reset();
  requiredTouched={};
  $("hardware-search").value="";
  document.querySelectorAll("#selector-form input[type=checkbox]").forEach(function(e){e.checked=false;});
  document.querySelectorAll("#selector-form select").forEach(function(e){e.selectedIndex=0;});
  document.querySelectorAll("#selector-form input[type=number]").forEach(function(e){e.value="";});
  results.hidden=true;
  $("catalog-error").hidden=true;
  $("catalog-warning").hidden=true;
  setMode("requirements");
  conditional();updateLiveCount();syncUrl();var adv=$("advanced-filters");if(adv)adv.open=false;if(shouldScroll!==false)window.scrollTo({top:0,behavior:"smooth"});}

$("empty-state").addEventListener("click",function(e){var btn=e.target.closest(".relax-action");if(btn)applyRelax(btn.getAttribute("data-relax-key"));});
form.addEventListener("change",function(e){
  if(e.target&&e.target.id){
    if(/-required$/.test(e.target.id)){
      requiredTouched[e.target.id.replace(/-required$/,"")]=true;
    }else{
      autoRequire(e.target.id);
    }
  }
  conditional();syncFilterDependencies();updateLiveCount();syncUrl();
});
form.addEventListener("submit",function(e){e.preventDefault();run();syncUrl();});
$("browse-btn").addEventListener("click",function(){setMode("browse");browse();window.requestAnimationFrame(function(){var p=$("browse-note");if(p){p.scrollIntoView({behavior:"smooth",block:"nearest"});$("hardware-search").focus();}});});
$("hardware-search").addEventListener("input",browse);
$("reset-btn").addEventListener("click",function(){reset(true);});
$("share-btn").addEventListener("click",function(){syncUrl();var b=$("share-btn");if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(location.href).then(function(){b.textContent="Link copied";setTimeout(function(){b.textContent="Share setup";},1800);});}else{window.prompt("Copy this selector URL:",location.href);}});
$("mode-requirements").addEventListener("click",function(){setMode("requirements");});setupAdvancedFilters();setupPresets();loadUrl();

fetch("data/products.json?v=20260922-1")
  .then(function(r){
    if(!r.ok)throw Error("Catalog load failed");
    return r.json();
  })
  .then(function(data){
    products=(data.products||[]).map(Engine.normalizeProduct);
    $("catalog-count").textContent=products.length;
    conditional();syncFilterDependencies();updateLiveCount();if(new URLSearchParams(location.search).size)run();
  })
  .catch(function(e){
    $("catalog-error").hidden=false;
    $("catalog-error").textContent="The hardware catalog could not be loaded. "+e.message;
  });
})();