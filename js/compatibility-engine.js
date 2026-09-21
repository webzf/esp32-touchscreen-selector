(function(global){
"use strict";

var FAMILY_ORDER=["ESP32","ESP32-S2","ESP32-S3","ESP32-C3","ESP32-C5","ESP32-C6"];
var DISPLAY_TECH=["OLED","LCD","TFT","e-paper","other"];
var DISPLAY_SHAPES=["rectangular","square","round","other"];
var PRODUCT_TYPES=["development_board","board_with_display","display_module"];\nvar LVGL_LEVELS=["ready","compatible"];

function normalize(value){
  if(value === undefined || value === null || value === "") return null;
  if(Array.isArray(value)) return value.map(normalize);
  if(typeof value === "string") return value.trim();
  return value;
}

function validBoolOrNull(v){ return v === null || typeof v === "boolean"; }

function validateProduct(p){
  var errors=[];
  if(!p || typeof p!=="object") return ["Product is not an object"];
  ["id","name","product_type","category"].forEach(function(k){ if(!p[k]) errors.push("Missing "+k); });
  if(PRODUCT_TYPES.indexOf(p.product_type)===-1) errors.push("Invalid product_type: "+p.product_type);
  if(!p.esp32 || !Array.isArray(p.esp32.family)) errors.push("Missing esp32.family");
  if(p.esp32 && p.esp32.family) p.esp32.family.forEach(function(f){ if(FAMILY_ORDER.indexOf(f)===-1) errors.push("Unknown ESP32 family: "+f); });
  if(p.display){
    if(!validBoolOrNull(p.display.display_present)) errors.push("display.display_present must be boolean/null");
    if(p.display.technology!==null && p.display.technology!==undefined && DISPLAY_TECH.indexOf(p.display.technology)===-1) errors.push("Invalid display technology");
    if(p.display.shape!==null && p.display.shape!==undefined && DISPLAY_SHAPES.indexOf(p.display.shape)===-1) errors.push("Invalid display shape");
    if(p.display.size_inches!==null && p.display.size_inches!==undefined && typeof p.display.size_inches!=="number") errors.push("display.size_inches must be numeric/null");
  }
  if(p.touch){
    if(!validBoolOrNull(p.touch.touch)) errors.push("touch.touch must be boolean/null");
  }
  if(p.software){\n    if(!p.software.lvgl || typeof p.software.lvgl!=="object") errors.push("software.lvgl is required");\n    else {\n      if(!validBoolOrNull(p.software.lvgl.support)) errors.push("software.lvgl.support must be boolean/null");\n      if(p.software.lvgl.level!==null && p.software.lvgl.level!==undefined && LVGL_LEVELS.indexOf(p.software.lvgl.level)===-1) errors.push("Invalid LVGL level");\n    }\n  }\n  if(p.features){\n    ["battery","imu","rtc","audio"].forEach(function(k){\n      if(!validBoolOrNull(p.features[k])) errors.push("features."+k+" must be boolean/null");\n    });\n  }\n  if(p.hardware){
    ["microsd","battery","battery_charging","buttons","led","camera","audio"].forEach(function(k){
      if(!validBoolOrNull(p.hardware[k])) errors.push("hardware."+k+" must be boolean/null");
    });
  }
  if(p.certification){
    ["ce","fcc"].forEach(function(k){ if(!validBoolOrNull(p.certification[k])) errors.push("certification."+k+" must be boolean/null"); });
  }
  return errors;
}

function normalizeProduct(p){
  var out=JSON.parse(JSON.stringify(p));
  out.esp32=out.esp32||{};
  out.display=out.display||{};
  out.touch=out.touch||{};
  out.usb=out.usb||{};
  out.hardware=out.hardware||{};\n  out.software=out.software||{};\n  out.software.lvgl=out.software.lvgl||{support:null,level:null,framework:null};\n  out.features=out.features||{};
  out.certification=out.certification||{};
  out.interfaces=out.interfaces||{};
  out.display_touch_bus=out.display_touch_bus||{};
  out.esp32.family=normalize(out.esp32.family)||[];\n  ["battery","imu","rtc","audio"].forEach(function(k){if(!(k in out.features))out.features[k]=null;});
  return out;
}

function valueKnown(v){ return v !== null && v !== undefined; }

function meetsBoolean(actual, wanted){
  return wanted==="any" ? true : actual===wanted;
}

function fieldMatches(actual, wanted){
  if(wanted===null || wanted===undefined || wanted==="any") return true;
  if(Array.isArray(actual)) return actual.indexOf(wanted)!==-1;
  return actual===wanted;
}

function numericAtLeast(actual, min){
  return valueKnown(actual) && Number(actual)>=Number(min);
}

function matchesRequirement(p, req){
  if(req.family && !fieldMatches(p.esp32.family, req.family)) return false;
  if(req.product_type && !fieldMatches(p.product_type, req.product_type)) return false;
  if(req.display_present!==null && req.display_present!==undefined && !meetsBoolean(p.display.display_present, req.display_present)) return false;
  if(req.display_technology && !fieldMatches(p.display.technology, req.display_technology)) return false;
  if(req.display_shape && !fieldMatches(p.display.shape, req.display_shape)) return false;
  if(req.size_min!==null && req.size_min!==undefined && (!valueKnown(p.display.size_inches) || Number(p.display.size_inches)<Number(req.size_min))) return false;
  if(req.size_exact!==null && req.size_exact!==undefined && (!valueKnown(p.display.size_inches) || Number(p.display.size_inches)!==Number(req.size_exact))) return false;
  if(req.resolution && (!p.display.resolution || p.display.resolution.width+"x"+p.display.resolution.height!==req.resolution)) return false;
  if(req.touch!==null && req.touch!==undefined && !meetsBoolean(p.touch.touch, req.touch)) return false;
  if(req.touch_type && !fieldMatches(p.touch.touch_type, req.touch_type)) return false;
  if(req.touch_interface && !fieldMatches(p.touch.touch_interface, req.touch_interface)) return false;
  if(req.display_interface && !fieldMatches(p.display.interface, req.display_interface)) return false;
  if(req.native_usb!==null && req.native_usb!==undefined && !meetsBoolean(p.usb.native_usb, req.native_usb)) return false;
  if(req.usb_available!==null && req.usb_available!==undefined && !meetsBoolean(p.usb.usb_available, req.usb_available)) return false;
  if(req.microsd!==null && req.microsd!==undefined && !meetsBoolean(p.hardware.microsd, req.microsd)) return false;
  if(req.battery_charging!==null && req.battery_charging!==undefined && !meetsBoolean(p.hardware.battery_charging, req.battery_charging)) return false;
  if(req.ce!==null && req.ce!==undefined && !meetsBoolean(p.certification.ce, req.ce)) return false;
  if(req.fcc!==null && req.fcc!==undefined && !meetsBoolean(p.certification.fcc, req.fcc)) return false;
  if(req.psram_min!==null && req.psram_min!==undefined && !numericAtLeast(p.esp32.psram_mb, req.psram_min)) return false;
  if(req.flash_min!==null && req.flash_min!==undefined && !numericAtLeast(p.esp32.flash_mb, req.flash_min)) return false;
  if(req.free_gpio_min!==null && req.free_gpio_min!==undefined && !numericAtLeast(p.hardware.free_gpio, req.free_gpio_min)) return false;\n  if(req.lvgl_support!==null && req.lvgl_support!==undefined && !meetsBoolean(p.software.lvgl.support, req.lvgl_support)) return false;\n  if(req.lvgl_level && !fieldMatches(p.software.lvgl.level, req.lvgl_level)) return false;\n  ["battery","imu","rtc","audio"].forEach(function(k){if(req[k]!==null && req[k]!==undefined && !meetsBoolean(p.features[k],req[k])) return false;});
  return true;
}

function reasonForFailure(p, req){
  var reasons=[];
  function add(ok,label){ if(!ok) reasons.push(label); }
  if(req.family) add(fieldMatches(p.esp32.family,req.family),"Wrong MCU family");
  if(req.product_type) add(fieldMatches(p.product_type,req.product_type),"Wrong hardware type");
  if(req.display_present!==null && req.display_present!==undefined) add(meetsBoolean(p.display.display_present,req.display_present),"Display requirement not met");
  if(req.display_technology) add(fieldMatches(p.display.technology,req.display_technology),"Wrong display technology");
  if(req.display_shape) add(fieldMatches(p.display.shape,req.display_shape),"Wrong display shape");
  if(req.size_min!==null && req.size_min!==undefined) add(numericAtLeast(p.display.size_inches,req.size_min),"Display smaller than minimum");
  if(req.size_exact!==null && req.size_exact!==undefined) add(valueKnown(p.display.size_inches)&&Number(p.display.size_inches)===Number(req.size_exact),"Preferred display size unavailable");
  if(req.resolution) add(!!(p.display.resolution && p.display.resolution.width+"x"+p.display.resolution.height===req.resolution),"Wrong resolution");
  if(req.touch!==null && req.touch!==undefined) add(meetsBoolean(p.touch.touch,req.touch),"Touch requirement not met");
  if(req.touch_type) add(fieldMatches(p.touch.touch_type,req.touch_type),"Wrong touch type");
  if(req.touch_interface) add(fieldMatches(p.touch.touch_interface,req.touch_interface),"Wrong touch interface");
  if(req.display_interface) add(fieldMatches(p.display.interface,req.display_interface),"Wrong display interface");
  if(req.native_usb!==null && req.native_usb!==undefined) add(meetsBoolean(p.usb.native_usb,req.native_usb),"Native USB requirement not met");
  if(req.usb_available!==null && req.usb_available!==undefined) add(meetsBoolean(p.usb.usb_available,req.usb_available),"USB requirement not met");
  if(req.microsd!==null && req.microsd!==undefined) add(meetsBoolean(p.hardware.microsd,req.microsd),"microSD requirement not met");
  if(req.battery_charging!==null && req.battery_charging!==undefined) add(meetsBoolean(p.hardware.battery_charging,req.battery_charging),"Battery charging requirement not met");
  if(req.ce!==null && req.ce!==undefined) add(meetsBoolean(p.certification.ce,req.ce),"CE requirement not met");
  if(req.fcc!==null && req.fcc!==undefined) add(meetsBoolean(p.certification.fcc,req.fcc),"FCC requirement not met");
  if(req.psram_min!==null && req.psram_min!==undefined) add(numericAtLeast(p.esp32.psram_mb,req.psram_min),"Insufficient/unknown PSRAM");
  if(req.flash_min!==null && req.flash_min!==undefined) add(numericAtLeast(p.esp32.flash_mb,req.flash_min),"Insufficient/unknown Flash");
  if(req.free_gpio_min!==null && req.free_gpio_min!==undefined) add(numericAtLeast(p.hardware.free_gpio,req.free_gpio_min),"Insufficient/unknown free GPIO");\n  if(req.lvgl_support!==null && req.lvgl_support!==undefined) add(meetsBoolean(p.software.lvgl.support,req.lvgl_support),"LVGL support requirement not met");\n  if(req.lvgl_level) add(fieldMatches(p.software.lvgl.level,req.lvgl_level),"LVGL support level not met");\n  ["battery","imu","rtc","audio"].forEach(function(k){if(req[k]!==null && req[k]!==undefined) add(meetsBoolean(p.features[k],req[k]),k+" requirement not met");});
  return reasons.length?reasons:["Mandatory compatibility rule not met"];
}

function scorePreferences(p, prefs){
  var score=0, possible=0, matches=[], misses=[];
  function soft(label, ok, known){
    possible++;
    if(ok){score++;matches.push(label);}
    else if(known){misses.push(label);}
    else{misses.push(label+" (unknown data)");}
  }
  if(prefs.family){soft("ESP32 family: "+prefs.family,fieldMatches(p.esp32.family,prefs.family),true);}
  if(prefs.product_type){soft("Hardware type: "+prefs.product_type,fieldMatches(p.product_type,prefs.product_type),valueKnown(p.product_type));}
  if(prefs.display_present!==null && prefs.display_present!==undefined){soft("Display: "+(prefs.display_present?"present":"none"),p.display.display_present===prefs.display_present,valueKnown(p.display.display_present));}
  if(prefs.display_technology){soft("Display: "+prefs.display_technology,fieldMatches(p.display.technology,prefs.display_technology),valueKnown(p.display.technology));}
  if(prefs.display_shape){soft("Shape: "+prefs.display_shape,fieldMatches(p.display.shape,prefs.display_shape),valueKnown(p.display.shape));}
  if(prefs.size_min!==null && prefs.size_min!==undefined){soft("Display size ≥ "+prefs.size_min+"\"",valueKnown(p.display.size_inches)&&Number(p.display.size_inches)>=Number(prefs.size_min),valueKnown(p.display.size_inches));}
  if(prefs.size_exact!==null && prefs.size_exact!==undefined){soft("Display size: "+prefs.size_exact+"\"",valueKnown(p.display.size_inches)&&Number(p.display.size_inches)===Number(prefs.size_exact),valueKnown(p.display.size_inches));}
  if(prefs.resolution){soft("Resolution: "+prefs.resolution,!!(p.display.resolution&&p.display.resolution.width+"x"+p.display.resolution.height===prefs.resolution),!!p.display.resolution);}
  if(prefs.touch!==null && prefs.touch!==undefined){soft("Touch: "+(prefs.touch?"yes":"no"),p.touch.touch===prefs.touch,valueKnown(p.touch.touch));}
  if(prefs.touch_type){soft("Touch type: "+prefs.touch_type,fieldMatches(p.touch.touch_type,prefs.touch_type),valueKnown(p.touch.touch_type));}
  if(prefs.touch_interface){soft("Touch bus: "+prefs.touch_interface,fieldMatches(p.touch.touch_interface,prefs.touch_interface),valueKnown(p.touch.touch_interface));}
  if(prefs.display_interface){soft("Display bus: "+prefs.display_interface,fieldMatches(p.display.interface,prefs.display_interface),valueKnown(p.display.interface));}
  if(prefs.native_usb!==null && prefs.native_usb!==undefined){soft("Native USB",p.usb.native_usb===prefs.native_usb,valueKnown(p.usb.native_usb));}
  if(prefs.microsd!==null && prefs.microsd!==undefined){soft("microSD",p.hardware.microsd===prefs.microsd,valueKnown(p.hardware.microsd));}
  if(prefs.battery_charging!==null && prefs.battery_charging!==undefined){soft("Battery charging",p.hardware.battery_charging===prefs.battery_charging,valueKnown(p.hardware.battery_charging));}
  if(prefs.flash_min!==null && prefs.flash_min!==undefined){soft("Flash ≥ "+prefs.flash_min+" MB",numericAtLeast(p.esp32.flash_mb,prefs.flash_min),valueKnown(p.esp32.flash_mb));}
  if(prefs.psram_min!==null && prefs.psram_min!==undefined){soft("PSRAM ≥ "+prefs.psram_min+" MB",numericAtLeast(p.esp32.psram_mb,prefs.psram_min),valueKnown(p.esp32.psram_mb));}
  if(prefs.free_gpio_min!==null && prefs.free_gpio_min!==undefined){soft("Free GPIO ≥ "+prefs.free_gpio_min,numericAtLeast(p.hardware.free_gpio,prefs.free_gpio_min),valueKnown(p.hardware.free_gpio));}\n  if(prefs.lvgl_support!==null && prefs.lvgl_support!==undefined){soft("LVGL support",p.software.lvgl.support===prefs.lvgl_support,valueKnown(p.software.lvgl.support));}\n  if(prefs.lvgl_level){soft("LVGL: "+prefs.lvgl_level,p.software.lvgl.level===prefs.lvgl_level,valueKnown(p.software.lvgl.level));}\n  ["battery","imu","rtc","audio"].forEach(function(k){if(prefs[k]!==null && prefs[k]!==undefined)soft(k.charAt(0).toUpperCase()+k.slice(1),p.features[k]===prefs[k],valueKnown(p.features[k]));});
  return {score:possible?Math.round(score/possible*100):0,matches:matches,misses:misses};
}

function evaluate(products, requirements, preferences){
  var normalized=products.map(normalizeProduct);
  var valid=normalized.filter(function(p){return validateProduct(p).length===0;});
  var exclusions={};
  var passed=[];
  valid.forEach(function(p){
    if(matchesRequirement(p,requirements)) passed.push(p);
    else reasonForFailure(p,requirements).forEach(function(r){exclusions[r]=(exclusions[r]||0)+1;});
  });
  var ranked=passed.map(function(p){
    var s=scorePreferences(p,preferences);
    return {product:p,score:s.score,matches:s.matches,misses:s.misses};
  }).sort(function(a,b){return b.score-a.score || a.product.name.localeCompare(b.product.name);});
  return {
    total:normalized.length,
    valid:valid.length,
    invalid:normalized.length-valid.length,
    passed:passed.length,
    displayed:ranked.length,
    ranked:ranked,
    exclusions:exclusions
  };
}

global.EmbeddedNerdCompatibility={
  FAMILY_ORDER:FAMILY_ORDER,
  validateProduct:validateProduct,
  normalizeProduct:normalizeProduct,
  matchesRequirement:matchesRequirement,
  scorePreferences:scorePreferences,
  evaluate:evaluate
};
})(window);