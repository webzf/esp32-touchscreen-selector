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
  }else if(note){
    note.hidden=true;
  }
}

function setMode(mode){
  document.querySelectorAll("[data-mode]").forEach(function(b){
    b.classList.toggle("active",b.dataset.mode===mode);
  });
  $("browse-note").hidden=mode!=="browse";
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

function card(item){
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
    ["Flash",p.esp32.flash_mb!=null?p.esp32.flash_mb+" MB":"Unknown"],
    ["PSRAM",p.esp32.psram_mb!=null?p.esp32.psram_mb+" MB":"Unknown"],
    ["USB",u.native_usb===true?"Native USB":u.uart_bridge===true?"UART bridge":u.usb_available===true?"USB":"Unknown"],
    ["Peripherals",[h.microsd===true?"microSD":null,h.battery_charging===true?"Battery charging":null].filter(Boolean).join(" · ")||"—"]
  ];

  return '<article class="product-card">'+
    '<div class="product-head"><div>'+
      '<span class="eyebrow">'+esc(p.manufacturer||"Manufacturer unknown")+'</span>'+
      '<h3>'+esc(p.name)+'</h3>'+
      '<span class="type-badge">'+esc((p.product_type||"hardware").replace(/_/g," "))+'</span>'+
    '</div>'+
    (item.score?'<strong class="match-badge">'+item.score+'% preference match</strong>':"")+
    '</div>'+
    '<div class="quick-specs">'+specs.map(function(x){
      return '<div><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong></div>';
    }).join("")+'</div>'+
    '<div class="match-explanation">'+
      '<strong>Matches</strong>'+
      '<ul>'+((item.matches.length?item.matches:["No selected preference confirmed"]).map(function(x){
        return "<li>✓ "+esc(x)+"</li>";
      }).join(""))+'</ul>'+
      (item.misses.length?
        '<strong>Preferences not met</strong><ul>'+item.misses.slice(0,4).map(function(x){
          return "<li>~ "+esc(x)+"</li>";
        }).join("")+'</ul>':"")+
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
  $("result-summary").textContent=
    ev.passed+" matching hardware. "+Math.max(0,ev.valid-ev.passed)+" excluded by mandatory requirements."+
    (ev.invalid ? " "+ev.invalid+" catalog entr"+(ev.invalid===1?"y":"ies")+" failed validation." : "");

  exclusions(ev);
  $("exclusion-panel").hidden=Object.keys(ev.exclusions).length===0;

  if(!ev.ranked.length){
    $("empty-state").hidden=false;
    $("empty-state-text").textContent=
      "No hardware meets all mandatory requirements. Try relaxing one or more required filters.";
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

function reset(){
  form.reset();
  requiredTouched={};
  $("hardware-search").value="";
  results.hidden=true;
  setMode("requirements");
  conditional();
}

form.addEventListener("change",function(e){
  if(e.target&&e.target.id){
    if(/-required$/.test(e.target.id)){
      requiredTouched[e.target.id.replace(/-required$/,"")]=true;
    }else{
      autoRequire(e.target.id);
    }
  }
  conditional();
});
form.addEventListener("submit",function(e){e.preventDefault();run();});
$("browse-btn").addEventListener("click",function(){setMode("browse");browse();});
$("hardware-search").addEventListener("input",browse);
$("reset-btn").addEventListener("click",reset);
$("mode-requirements").addEventListener("click",function(){setMode("requirements");});

fetch("data/products.json")
  .then(function(r){
    if(!r.ok)throw Error("Catalog load failed");
    return r.json();
  })
  .then(function(data){
    products=(data.products||[]).map(Engine.normalizeProduct);
    $("catalog-count").textContent=products.length;
    conditional();
  })
  .catch(function(e){
    $("catalog-error").hidden=false;
    $("catalog-error").textContent="The hardware catalog could not be loaded. "+e.message;
  });
})();