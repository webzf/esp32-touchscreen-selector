const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");

const engineCode=fs.readFileSync(__dirname+"/../js/compatibility-engine.js","utf8");
const projectCode=fs.readFileSync(__dirname+"/../js/project-recommendations.js","utf8");
const ctx={window:{}};
vm.runInNewContext(engineCode,ctx);
vm.runInNewContext(projectCode,ctx);
const E=ctx.window.EmbeddedNerdCompatibility;
const P=ctx.window.EmbeddedNerdProjectRecommendations;

function product(id,o){
  return Object.assign({
    id,name:id,product_type:"board_with_display",category:"board_with_display",
    esp32:{family:["ESP32-S3"],flash_mb:16,psram_mb:8},
    display:{display_present:true,technology:"TFT",shape:"round",size_inches:3.5,resolution:{width:800,height:480},interface:"RGB"},
    touch:{touch:true,touch_type:"capacitive",touch_interface:"I2C"},
    usb:{usb_available:true,native_usb:true,uart_bridge:false},
    hardware:{microsd:true,battery:null,battery_charging:true,buttons:null,led:null,camera:null,audio:null,free_gpio:10},
    capabilities:{rs485:null,mipi_csi:null},
    certification:{ce:true,fcc:true},
    software:{lvgl:{support:null,level:null,framework:null}},
    features:{battery:null,imu:null,rtc:null,audio:null},
    physical:{form_factor:null}
  },o||{});
}

const s3=product("s3");
const p4=product("p4",{esp32:{family:["ESP32-P4"],flash_mb:16,psram_mb:16},display:{display_present:true,technology:"TFT",shape:"rectangular",size_inches:7,resolution:{width:1024,height:600},interface:"MIPI-DSI"},hardware:{microsd:true,battery:null,battery_charging:true,buttons:null,led:null,camera:true,audio:null,free_gpio:10},capabilities:{rs485:true,mipi_csi:true}});
const uart=product("uart",{usb:{usb_available:true,native_usb:false,uart_bridge:true}});
const c3=product("c3",{esp32:{family:["ESP32-C3"],flash_mb:4,psram_mb:null}});

assert.equal(E.matchesRequirement(c3,{psram_min:1}),false);
assert.equal(E.matchesRequirement(uart,{native_usb:true}),false);
assert.equal(E.matchesRequirement(s3,{native_usb:true,microsd:true,touch:true}),true);
assert.equal(E.matchesRequirement(s3,{native_usb:false}),false);
assert.equal(E.scorePreferences(s3,{family:"ESP32-S3",display_shape:"round",native_usb:true}).score,100);
assert.equal(E.evaluate([s3,uart,c3],{native_usb:true},{}).passed,2);
assert.equal(E.evaluate([s3,uart,c3],{native_usb:true,psram_min:1},{}).passed,1);
assert.equal(E.evaluate([s3,uart,c3],{free_gpio_min:20},{}).passed,0);
assert.equal(E.matchesRequirement(s3,{lvgl_support:true}),false);
assert.equal(E.matchesRequirement(s3,{imu:true}),false);
assert.equal(E.scorePreferences(s3,{lvgl_support:true}).score,0);

assert.ok(E.FAMILY_ORDER.includes("ESP32-P4"));
assert.equal(E.matchesRequirement(p4,{family:"ESP32-P4",display_interface:"MIPI-DSI"}),true);

const catalog=JSON.parse(fs.readFileSync(__dirname+"/../data/products.json","utf8"));
assert.equal(catalog.schema_version,"2.1");
assert.ok(Array.isArray(catalog.products));
const catalogErrors=catalog.products.map(p=>E.validateProduct(p));
assert.equal(catalogErrors.filter(e=>e.length>0).length,0);
assert.equal(catalog.products.length,12);

const ids=catalog.products.map(p=>p.id);
["ili9341-xpt2046-2-8-touchscreen","waveshare-esp32-s3-touch-lcd-4-3","waveshare-esp32-s3-touch-lcd-7","waveshare-esp32-s3-touch-lcd-1-85b","waveshare-esp32-c6-touch-amoled-1-8","waveshare-esp32-s3-touch-amoled-1-75","waveshare-esp32-s3-touch-amoled-2-16","waveshare-esp32-s3-touch-amoled-2-41","sunton-esp32-8048s043c","esp32-2432s028-2-8-cyd","ssd1306-oled-display"].forEach(id=>assert.ok(ids.includes(id)));

const ws43=catalog.products.find(p=>p.id==="waveshare-esp32-s3-touch-lcd-4-3");
const ws7=catalog.products.find(p=>p.id==="waveshare-esp32-s3-touch-lcd-7");
const ws185=catalog.products.find(p=>p.id==="waveshare-esp32-s3-touch-lcd-1-85b");
const s3amoled175=catalog.products.find(p=>p.id==="waveshare-esp32-s3-touch-amoled-1-75");
assert.equal(E.matchesRequirement(ws43,{family:"ESP32-S3",psram_min:8,flash_min:16,touch:true,touch_type:"capacitive",touch_interface:"I2C",microsd:true,battery_charging:true}),true);
assert.equal(E.matchesRequirement(ws7,{family:"ESP32-S3",psram_min:8,flash_min:8,resolution:"800x480"}),true);
assert.equal(E.matchesRequirement(ws43,{lvgl_support:true}),true);
assert.equal(E.matchesRequirement(ws43,{battery:true}),true);
assert.equal(E.matchesRequirement(ws185,{family:"ESP32-S3",psram_min:8,flash_min:16,native_usb:true,touch:true,touch_type:"capacitive",touch_interface:"I2C",display_interface:"QSPI",display_shape:"round",microsd:true,battery:true,imu:true,rtc:true,audio:true,lvgl_support:true,lvgl_level:"ready"}),true);
assert.equal(E.matchesRequirement(ws43,{imu:true}),false);
assert.equal(E.matchesRequirement(s3amoled175,{family:"ESP32-S3",display_technology:"AMOLED",display_shape:"round",resolution:"466x466",touch:true,touch_type:"capacitive",touch_interface:"I2C",display_interface:"QSPI",psram_min:8,flash_min:16,battery:true,battery_charging:true,imu:true,rtc:true,audio:true,lvgl_support:true}),true);
assert.equal(E.matchesRequirement(s3amoled175,{family:"ESP32-S3",display_technology:"AMOLED",resolution:"600x450"}),false);

const unknownUsb=E.scorePreferences(ws43,{native_usb:true});
assert.equal(unknownUsb.score,0);
assert.ok(unknownUsb.misses.includes("Native USB (unknown data)"));
assert.equal(E.scorePreferences(ws43,{lvgl_support:true}).score,100);

const catalogEval=E.evaluate(catalog.products,{family:"ESP32-S3",psram_min:8},{});
assert.equal(catalogEval.valid,12);
assert.equal(catalogEval.passed,7);
assert.equal(catalogEval.ranked.length,7);
assert.equal(catalogEval.excluded.length,5);

const flashEval=E.evaluate(catalog.products,{family:"ESP32-S3",flash_min:16},{});
assert.equal(flashEval.passed,6);
assert.equal(flashEval.ranked[0].product.id,"sunton-esp32-8048s043c");

const browse=E.evaluate(catalog.products,{}, {});
assert.equal(browse.total,12);
assert.equal(browse.valid,12);
assert.equal(browse.passed,12);
assert.equal(browse.displayed,12);

// Project model and tier checks.
assert.equal(P.USE_CASE_ORDER.length,9);
P.USE_CASE_ORDER.forEach(function(id){
  const profile=P.USE_CASES[id];
  assert.ok(profile);
  assert.ok(profile.tiers||profile.preferences);
  assert.ok(profile.platform&&profile.platform.s3&&profile.platform.p4);
});
assert.equal(P.getUseCaseRequirements("general-esp32-project")&&Object.keys(P.getUseCaseRequirements("general-esp32-project")).length,0);

const wearableScore=P.scoreUseCase(s3,"wearable-compact-device");
assert.ok(wearableScore.score>0);
assert.ok(Array.isArray(wearableScore.preferred));
assert.ok(Array.isArray(wearableScore.useful));
assert.ok(Array.isArray(wearableScore.optional));
assert.equal(wearableScore.required.length,0);

const p4Vision=P.scoreUseCase(p4,"camera-ai-vision");
assert.equal(p4Vision.score,100);

const visionEval=E.evaluate([s3,p4],{}, {},{useCaseId:"camera-ai-vision"});
assert.equal(visionEval.passed,2);
assert.equal(visionEval.ranked[0].product.id,"p4");
assert.ok(visionEval.ranked[0].useCaseScore>visionEval.ranked[1].useCaseScore);
assert.ok(visionEval.ranked[0].useCaseMatches.includes("ESP32-P4"));
assert.ok(visionEval.ranked[0].useCaseMatches.includes("Camera support"));

const batteryEval=E.evaluate([s3,p4],{}, {},{useCaseId:"battery-powered-device"});
assert.equal(batteryEval.passed,2);
assert.equal(batteryEval.ranked.length,2);

const hmiWithTechnical=E.evaluate([s3,p4],{display_interface:"MIPI-DSI"}, {},{useCaseId:"hmi-control-panel"});
assert.equal(hmiWithTechnical.passed,1);
assert.equal(hmiWithTechnical.ranked[0].product.id,"p4");

// Unknown project capabilities remain neutral rather than becoming positive evidence.
const neutral=product("neutral",{capabilities:{rs485:null,mipi_csi:null}});
const neutralScore=P.scoreUseCase(neutral,"hmi-control-panel");
assert.ok(neutralScore.unknown.includes("RS485"));
assert.equal(neutralScore.matches.includes("RS485"),false);

// Selector integration contract checks.
const selectorSource=fs.readFileSync(__dirname+"/../js/selector.js","utf8");
const html=fs.readFileSync(__dirname+"/../index.html","utf8");
assert.ok(selectorSource.includes("Engine.evaluate(products,b.r,b.p,currentIntent())"));
assert.ok(selectorSource.includes("selectUseCase"));
assert.ok(selectorSource.includes("clear-use-case"));
assert.ok(selectorSource.includes("updatePlatformGuidance"));
assert.ok(selectorSource.includes("p.set(\"project\""));
assert.ok(selectorSource.includes("useCaseExplanation"));
assert.ok(selectorSource.includes("Engine.evaluate(products,b.r,b.p,currentIntent())"));
assert.ok(html.includes('id="project-intent"'));
assert.ok(html.includes('id="use-case-grid"'));
assert.ok(html.includes('id="platform-guidance"'));
assert.ok(html.includes('id="clear-use-case"'));
assert.ok(html.includes('<option>ESP32-P4</option>'));
assert.ok(html.includes('<option>MIPI-DSI</option>'));
assert.ok(html.includes("ESP32-S3 vs ESP32-P4"));
assert.ok(html.includes("Recommended ESP32 Touchscreen Displays"));
assert.ok(html.includes('id="reset-btn"'));
assert.ok(html.includes('id="live-result-bar"'));
assert.ok(html.includes('id="live-count"'));
assert.ok(html.includes("Clear All Filters"));
assert.ok(html.includes("selector-live-bar"));
assert.ok(selectorSource.includes("Advanced filters"));
assert.ok(selectorSource.includes("starter hardware shown"));
assert.ok(selectorSource.includes("TERM_HELP"));
assert.ok(html.includes('aria-label="Project use cases"'));
assert.ok(selectorSource.includes('mainKeys=["family","size_min","touch","psram_min","lvgl_support"]'));
assert.ok(selectorSource.includes("TERM_HELP"));
assert.ok(selectorSource.includes("Showing "+visible.length+" starter options from the catalog."));
assert.ok(html.includes("js/project-recommendations.js"));
assert.ok(fs.readFileSync(__dirname+"/../.github/workflows/v2-tests.yml","utf8").includes("node tests/engine-tests.js"));

console.log("Project recommendation + compatibility integration tests: PASS");