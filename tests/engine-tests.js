const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const code=fs.readFileSync(__dirname+"/../js/compatibility-engine.js","utf8"),ctx={window:{}};
vm.runInNewContext(code,ctx); const E=ctx.window.EmbeddedNerdCompatibility;
function product(id,o){return Object.assign({id,name:id,product_type:"board_with_display",category:"board_with_display",esp32:{family:["ESP32-S3"],flash_mb:16,psram_mb:8},display:{display_present:true,technology:"TFT",shape:"round",size_inches:3.5,resolution:{width:800,height:480},interface:"RGB"},touch:{touch:true,touch_type:"capacitive",touch_interface:"I2C"},usb:{usb_available:true,native_usb:true,uart_bridge:false},hardware:{microsd:true,battery:null,battery_charging:true,buttons:null,led:null,camera:null,audio:null,free_gpio:10},certification:{ce:true,fcc:true}},o||{})}
const s3=product("s3"),uart=product("uart",{usb:{usb_available:true,native_usb:false,uart_bridge:true}}),c3=product("c3",{esp32:{family:["ESP32-C3"],flash_mb:4,psram_mb:null}});
assert.equal(E.matchesRequirement(c3,{psram_min:1}),false);
assert.equal(E.matchesRequirement(uart,{native_usb:true}),false);
assert.equal(E.matchesRequirement(s3,{native_usb:true,microsd:true,touch:true}),true);
assert.equal(E.matchesRequirement(s3,{native_usb:false}),false);
assert.equal(E.scorePreferences(s3,{family:"ESP32-S3",display_shape:"round",native_usb:true}).score,100);
assert.equal(E.evaluate([s3,uart,c3],{native_usb:true},{}).passed,2);
assert.equal(E.evaluate([s3,uart,c3],{native_usb:true,psram_min:1},{}).passed,1);
assert.equal(E.evaluate([s3,uart,c3],{free_gpio_min:20},{}).passed,0);

// Real catalog validation and representative V2 scenarios.
const catalog=JSON.parse(fs.readFileSync(__dirname+"/../data/products.json","utf8"));
assert.equal(catalog.schema_version,"2.0");
assert.ok(Array.isArray(catalog.products));
const catalogErrors=catalog.products.map(p=>E.validateProduct(p));
assert.equal(catalogErrors.filter(e=>e.length>0).length,0);
assert.equal(catalog.products.length,3);

const ili=catalog.products.find(p=>p.id==="ili9341-xpt2046-2-8-touchscreen");
const ws43=catalog.products.find(p=>p.id==="waveshare-esp32-s3-touch-lcd-4-3");
const ws7=catalog.products.find(p=>p.id==="waveshare-esp32-s3-touch-lcd-7");
assert.ok(ili && ws43 && ws7);

// Unknown data must never satisfy a mandatory requirement.
assert.equal(E.matchesRequirement(ws43,{native_usb:true}),false);
assert.equal(E.matchesRequirement(ili,{psram_min:1}),false);
assert.equal(E.matchesRequirement(ili,{flash_min:1}),false);
assert.equal(E.matchesRequirement(ili,{free_gpio_min:1}),false);
assert.equal(E.matchesRequirement(ws43,{ce:true}),false);

// Verified hardware requirements.
assert.equal(E.matchesRequirement(ws43,{family:"ESP32-S3",psram_min:8,flash_min:16,touch:true,touch_type:"capacitive",touch_interface:"I2C",microsd:true,battery_charging:true}),true);
assert.equal(E.matchesRequirement(ws7,{family:"ESP32-S3",psram_min:8,flash_min:8,resolution:"800x480"}),true);
assert.equal(E.matchesRequirement(ili,{product_type:"display_module",display_interface:"SPI",touch_type:"resistive",touch_interface:"SPI",display_shape:"rectangular"}),true);

// Preference ranking remains soft and transparent when data is unknown.
const unknownUsb=E.scorePreferences(ws43,{native_usb:true});
assert.equal(unknownUsb.score,0);
assert.ok(unknownUsb.misses.includes("Native USB (unknown data)"));

const catalogEval=E.evaluate(catalog.products,{family:"ESP32-S3",psram_min:8},{});
assert.equal(catalogEval.valid,3);
assert.equal(catalogEval.passed,2);
assert.equal(catalogEval.ranked.length,2);

const flashEval=E.evaluate(catalog.products,{family:"ESP32-S3",flash_min:16},{});
assert.equal(flashEval.passed,1);
assert.equal(flashEval.ranked[0].product.id,"waveshare-esp32-s3-touch-lcd-4-3");

const noMatch=E.evaluate(catalog.products,{family:"ESP32-C3",psram_min:1},{});
assert.equal(noMatch.passed,0);
assert.ok(noMatch.exclusions["Insufficient/unknown PSRAM"]>=1);

const browse=E.evaluate(catalog.products,{}, {});
assert.equal(browse.total,3);
assert.equal(browse.valid,3);
assert.equal(browse.passed,3);
assert.equal(browse.displayed,3);

console.log("V2 compatibility engine tests: PASS");