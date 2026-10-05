(function(global){
"use strict";

var USE_CASES={
  home-assistant-dashboard:{
    label:"Home Assistant Dashboard",
    description:"Wall or desk dashboard with a readable touchscreen UI.",
    requirements:{display_present:true,touch:true},
    preferences:[
      {key:"size_range",min:4,max:7,label:"4–7 inch display",field:"display.size_inches",weight:3},
      {key:"family",values:["ESP32-S3"],label:"ESP32-S3",field:"esp32.family",weight:3},
      {key:"psram",value:true,label:"PSRAM",field:"esp32.psram_mb",weight:2},
      {key:"lvgl",value:true,label:"LVGL support",field:"software.lvgl.support",weight:2},
      {key:"touch_type",value:"capacitive",label:"Capacitive touch",field:"touch.touch_type",weight:2}
    ],
    platform:{s3:"A sensible default for conventional touchscreen dashboards.",p4:"Useful when the dashboard grows into a larger or more demanding HMI."}
  },
  "hmi-control-panel":{
    label:"HMI / Control Panel",
    description:"A fixed graphical interface for machines, automation or controls.",
    requirements:{display_present:true,touch:true},
    preferences:[
      {key:"size_range",min:4.3,max:10.1,label:"4.3–10.1 inch display",field:"display.size_inches",weight:3},
      {key:"family",values:["ESP32-S3","ESP32-P4"],label:"ESP32-S3 or ESP32-P4",field:"esp32.family",weight:3},
      {key:"psram",value:true,label:"PSRAM",field:"esp32.psram_mb",weight:3},
      {key:"lvgl",value:true,label:"LVGL support",field:"software.lvgl.support",weight:2},
      {key:"advanced_display",values:["RGB","MIPI-DSI"],label:"RGB or MIPI-DSI display path",field:"display.interface",weight:2},
      {key:"rs485",value:true,label:"RS485",field:"interfaces.other",weight:1}
    ],
    platform:{s3:"Best fit for many conventional touchscreen HMIs with RGB or SPI-class interfaces.",p4:"Stronger fit for large, high-resolution or advanced HMI designs, especially with MIPI-DSI."}
  },
  "sensor-data-dashboard":{
    label:"Sensor / Data Dashboard",
    description:"A dashboard focused on readable measurements, status and trends.",
    requirements:{display_present:true},
    preferences:[
      {key:"size_range",min:3.5,max:7,label:"3.5–7 inch display",field:"display.size_inches",weight:3},
      {key:"family",values:["ESP32-S3"],label:"ESP32-S3",field:"esp32.family",weight:3},
      {key:"psram",value:true,label:"PSRAM",field:"esp32.psram_mb",weight:2},
      {key:"touch_optional",value:true,label:"Touch available",field:"touch.touch",weight:1}
    ],
    platform:{s3:"Usually the most practical choice for a sensor dashboard.",p4:"Consider P4 when the visualization becomes graphics-heavy or needs multimedia."}
  },
  "battery-powered-device":{
    label:"Battery-Powered Device",
    description:"A portable interface where size and power-aware hardware selection matter.",
    requirements:{display_present:true},
    preferences:[
      {key:"small_display",min:1.5,max:3,label:"1.5–3 inch display",field:"display.size_inches",weight:4},
      {key:"family",values:["ESP32-S3"],label:"ESP32-S3",field:"esp32.family",weight:3},
      {key:"battery",value:true,label:"Battery support",field:"features.battery",weight:4},
      {key:"charging",value:true,label:"Battery charging",field:"hardware.battery_charging",weight:2},
      {key:"capacitive",value:"capacitive",label:"Capacitive touch",field:"touch.touch_type",weight:1}
    ],
    platform:{s3:"Usually the better balance for compact battery-powered touchscreen devices.",p4:"Generally unnecessary unless the application has unusually demanding graphics or multimedia needs."}
  },
  "wearable-compact-device":{
    label:"Wearable / Compact Device",
    description:"A small interface where footprint and integrated peripherals matter.",
    requirements:{display_present:true},
    preferences:[
      {key:"size_range",min:1.5,max:2.5,label:"1.5–2.5 inch display",field:"display.size_inches",weight:4},
      {key:"family",values:["ESP32-S3"],label:"ESP32-S3",field:"esp32.family",weight:3},
      {key:"capacitive",value:"capacitive",label:"Capacitive touch",field:"touch.touch_type",weight:2},
      {key:"psram",value:true,label:"PSRAM",field:"esp32.psram_mb",weight:1},
      {key:"compact_form",value:true,label:"Compact form factor",field:"physical.form_factor",weight:2}
    ],
    platform:{s3:"The natural starting point for compact touchscreen and wearable-style boards.",p4:"Usually overkill for a compact wearable unless advanced processing is central to the design."}
  },
  "lvgl-gui":{
    label:"LVGL GUI",
    description:"A graphical interface built around LVGL with memory and rendering needs in mind.",
    requirements:{display_present:true},
    preferences:[
      {key:"family",values:["ESP32-S3","ESP32-P4"],label:"ESP32-S3 or ESP32-P4",field:"esp32.family",weight:4},
      {key:"psram",value:true,label:"PSRAM",field:"esp32.psram_mb",weight:4},
      {key:"lvgl",value:true,label:"LVGL support",field:"software.lvgl.support",weight:5},
      {key:"resolution",value:true,label:"Higher-resolution display",field:"display.resolution",weight:2}
    ],
    platform:{s3:"Excellent fit for mainstream LVGL touch GUIs.",p4:"Preferable when the GUI is unusually demanding, large or high-resolution."}
  },
  "camera-ai-vision":{
    label:"Camera / AI Vision",
    description:"A vision-oriented interface combining camera input with an embedded graphical front end.",
    requirements:{display_present:true},
    preferences:[
      {key:"family",values:["ESP32-P4"],label:"ESP32-P4",field:"esp32.family",weight:6},
      {key:"camera",value:true,label:"Camera support",field:"hardware.camera",weight:5},
      {key:"mipi_csi",value:true,label:"MIPI-CSI",field:"interfaces.other",weight:5},
      {key:"psram",value:true,label:"PSRAM",field:"esp32.psram_mb",weight:4},
      {key:"large_display",min:4,label:"Larger display",field:"display.size_inches",weight:2}
    ],
    platform:{s3:"Can work for simpler camera interfaces where the board data confirms the needed peripherals.",p4:"The stronger direction for camera, MIPI-CSI and more demanding vision interfaces."}
  },
  "audio-voice-interface":{
    label:"Audio / Voice Interface",
    description:"A UI where microphone, audio and graphical feedback are part of the project.",
    requirements:{display_present:true},
    preferences:[
      {key:"family",values:["ESP32-P4","ESP32-S3"],label:"ESP32-P4 or ESP32-S3",field:"esp32.family",weight:3},
      {key:"audio",value:true,label:"Audio support",field:"features.audio",weight:4},
      {key:"psram",value:true,label:"PSRAM",field:"esp32.psram_mb",weight:2},
      {key:"medium_display",min:3,max:7,label:"3–7 inch display",field:"display.size_inches",weight:2}
    ],
    platform:{s3:"A good fit for many conventional audio-aware touchscreen devices.",p4:"More attractive when multimedia processing or a more advanced interface is needed."}
  },
  "general-esp32-project":{
    label:"General ESP32 Project",
    description:"No strong project-specific bias. Use the technical selector as the primary signal.",
    requirements:{},
    preferences:[],
    platform:{s3:"Use S3 when the technical requirements call for it.",p4:"Use P4 only when its advanced capabilities solve a real requirement."}
  }
};

var USE_CASE_ORDER=[
  "home-assistant-dashboard","hmi-control-panel","sensor-data-dashboard",
  "battery-powered-device","wearable-compact-device","lvgl-gui",
  "camera-ai-vision","audio-voice-interface","general-esp32-project"
];

function known(v){return v!==null&&v!==undefined;}
function get(obj,path){
  return path.split(".").reduce(function(value,key){return value==null?null:value[key];},obj);
}
function hasFamily(product,values){
  var f=product.esp32&&product.esp32.family||[];
  return values.some(function(v){return f.indexOf(v)!==-1;});
}
function matchesPref(product,pref){
  var actual=get(product,pref.field);
  if(pref.key==="size_range") return known(actual)&&Number(actual)>=pref.min&&Number(actual)<=pref.max;
  if(pref.key==="small_display") return known(actual)&&Number(actual)>=pref.min&&Number(actual)<=pref.max;
  if(pref.key==="large_display") return known(actual)&&Number(actual)>=pref.min;
  if(pref.key==="medium_display") return known(actual)&&Number(actual)>=pref.min&&Number(actual)<=pref.max;
  if(pref.key==="family") return hasFamily(product,pref.values);
  if(pref.key==="psram"||pref.key==="battery"||pref.key==="charging"||pref.key==="camera"||pref.key==="audio") return pref.value===true?actual===true:actual===pref.value;
  if(pref.key==="lvgl") return actual===pref.value;
  if(pref.key==="capacitive") return actual===pref.value;
  if(pref.key==="touch_optional") return actual===true;
  if(pref.key==="advanced_display") return pref.values.indexOf(actual)!==-1;
  if(pref.key==="rs485"||pref.key==="mipi_csi") return actual===true||(Array.isArray(actual)&&actual.indexOf("RS485")!==-1)||(Array.isArray(actual)&&actual.indexOf("MIPI-CSI")!==-1);
  if(pref.key==="compact_form") return known(actual)&&/compact|badge|wearable|watch/i.test(String(actual));
  if(pref.key==="resolution") return !!(product.display&&product.display.resolution&&product.display.resolution.width&&product.display.resolution.height);
  return known(actual)&&actual===pref.value;
}
function scoreUseCase(product,useCaseId){
  var profile=USE_CASES[useCaseId]; if(!profile) return {score:0,maxScore:0,matches:[],misses:[],unknown:[]};
  var total=0,possible=0,matches=[],misses=[],unknown=[];
  profile.preferences.forEach(function(pref){
    var actual=get(product,pref.field),ok=matchesPref(product,pref);
    possible+=pref.weight; total+=ok?pref.weight:0;
    if(ok) matches.push(pref.label);
    else if(!known(actual)) unknown.push(pref.label);
    else misses.push(pref.label);
  });
  return {score:possible?Math.round(total/possible*100):0,maxScore:possible,matches:matches,misses:misses,unknown:unknown};
}
function getUseCaseRequirements(useCaseId){
  var p=USE_CASES[useCaseId]; return p?JSON.parse(JSON.stringify(p.requirements||{})):{};
}
function explainRecommendation(product,useCaseId,scoreInfo){
  var p=USE_CASES[useCaseId]; if(!p) return "";
  var parts=[];
  var d=product.display||{}, family=(product.esp32&&product.esp32.family||[]).join(" / ");
  if(d.display_present&&known(d.size_inches)) parts.push(d.size_inches+"″ display");
  else if(d.display_present) parts.push("integrated display");
  if(product.touch&&product.touch.touch===true&&product.touch.touch_type) parts.push(product.touch.touch_type+" touch");
  if(family) parts.push(family);
  if(product.esp32&&known(product.esp32.psram_mb)) parts.push(product.esp32.psram_mb+" MB PSRAM");
  if(product.software&&product.software.lvgl&&product.software.lvgl.support===true) parts.push("LVGL support");
  if(product.features&&product.features.battery===true) parts.push("battery support");
  if(product.features&&product.features.audio===true) parts.push("audio support");
  if(product.hardware&&product.hardware.camera===true) parts.push("camera support");
  if(product.display&&product.display.interface) parts.push(product.display.interface);
  var core=parts.slice(0,5).join(", ");
  var matched=scoreInfo.matches.slice(0,2).join(" and ");
  return "Recommended for "+p.label+" because it combines "+core+(matched?(core?". It also matches ":" because it matches ")+matched.toLowerCase()):".");
}
function evaluateUseCase(products,useCaseId){
  var profile=USE_CASES[useCaseId];
  if(!profile)return products.map(function(product){return {product:product,useCaseScore:0,useCaseMatches:[],useCaseMisses:[],useCaseUnknown:[],useCaseExplanation:""};});
  return products.map(function(product){
    var s=scoreUseCase(product,useCaseId);
    return {product:product,useCaseScore:s.score,useCaseMatches:s.matches,useCaseMisses:s.misses,useCaseUnknown:s.unknown,useCaseExplanation:explainRecommendation(product,useCaseId,s)};
  });
}
global.EmbeddedNerdProjectRecommendations={
  USE_CASES:USE_CASES,
  USE_CASE_ORDER:USE_CASE_ORDER,
  getUseCaseRequirements:getUseCaseRequirements,
  scoreUseCase:scoreUseCase,
  evaluateUseCase:evaluateUseCase,
  explainRecommendation:explainRecommendation
};
})(window);
