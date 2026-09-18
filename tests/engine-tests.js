const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const code=fs.readFileSync(__dirname+"/../js/compatibility-engine.js","utf8"),ctx={window:{}};
vm.runInNewContext(code,ctx); const E=ctx.window.EmbeddedNerdCompatibility;
function product(id,o){return Object.assign({id,name:id,product_type:"board_with_display",category:"board_with_display",esp32:{family:["ESP32-S3"],flash_mb:16,psram_mb:8},display:{display_present:true,technology:"TFT",shape:"round",size_inches:3.5,resolution:{width:800,height:480},interface:"RGB"},touch:{touch:true,touch_type:"capacitive",touch_interface:"I2C"},usb:{usb_available:true,native_usb:true,uart_bridge:false},hardware:{microsd:true,battery_charging:true,free_gpio:10},certification:{ce:true,fcc:true}},o||{})}
const s3=product("s3"),uart=product("uart",{usb:{usb_available:true,native_usb:false,uart_bridge:true}}),c3=product("c3",{esp32:{family:["ESP32-C3"],flash_mb:4,psram_mb:null}});
assert.equal(E.matchesRequirement(c3,{psram_min:1}),false);
assert.equal(E.matchesRequirement(uart,{native_usb:true}),false);
assert.equal(E.matchesRequirement(s3,{native_usb:true,microsd:true,touch:true}),true);
assert.equal(E.matchesRequirement(s3,{native_usb:false}),false);
assert.equal(E.scorePreferences(s3,{family:"ESP32-S3",display_shape:"round",native_usb:true}).score,100);
assert.equal(E.evaluate([s3,uart,c3],{native_usb:true},{}).passed,2);
assert.equal(E.evaluate([s3,uart,c3],{native_usb:true,psram_min:1},{}).passed,1);
assert.equal(E.evaluate([s3,uart,c3],{free_gpio_min:20},{}).passed,0);
console.log("V2 compatibility engine tests: PASS");