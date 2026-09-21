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
assert.equal(E.evaluate([s3,uart,c3],{free_gpio_min:20},{}).passed,0);\nassert.equal(E.matchesRequirement(s3,{lvgl_support:true}),false);\nassert.equal(E.matchesRequirement(s3,{imu:true}),false);\nassert.equal(E.scorePreferences(s3,{lvgl_support:true}).score,0);

// Real catalog validation and representative V2 scenarios.
const catalog=JSON.parse(fs.readFileSync(__dirname+"/../data/products.json","utf8"));
assert.equal(catalog.schema_version,"2.1");
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
assert.equal(E.matchesRequirement(ws7,{family:"ESP32-S3",psram_min:8,flash_min:8,resolution:"800x480"}),true);\nassert.equal(E.matchesRequirement(ws43,{lvgl_support:true}),false);\nassert.equal(E.matchesRequirement(ws43,{battery:true}),false);\nassert.equal(E.matchesRequirement(ws43,{imu:true}),false);
assert.equal(E.matchesRequirement(ili,{product_type:"display_module",display_interface:"SPI",touch_type:"resistive",touch_interface:"SPI",display_shape:"rectangular"}),true);

// Preference ranking remains soft and transparent when data is unknown.
const unknownUsb=E.scorePreferences(ws43,{native_usb:true});
assert.equal(unknownUsb.score,0);
assert.ok(unknownUsb.misses.includes("Native USB (unknown data)"));\nconst unknownLvgl=E.scorePreferences(ws43,{lvgl_support:true});\nassert.equal(unknownLvgl.score,0);\nassert.ok(unknownLvgl.misses.includes("LVGL support (unknown data)"));

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


// Selector integration contract checks (static, DOM-free).
const selectorSource=fs.readFileSync(__dirname+"/../js/selector.js","utf8");
assert.ok(selectorSource.includes('Engine.evaluate(products,b.r,b.p)'));
assert.ok(selectorSource.includes('required(k)'));
assert.ok(selectorSource.includes('var requiredTouched={}'));
assert.ok(selectorSource.includes('function autoRequire(n)'));
assert.ok(selectorSource.includes('!requiredTouched[n]&&hasValue(n)'));
assert.ok(selectorSource.includes('setMode("browse")'));
assert.ok(selectorSource.includes('searchMatch(p,q)'));
assert.ok(selectorSource.includes('View technical details'));
assert.ok(selectorSource.includes('Where to buy'));
assert.ok(selectorSource.includes('rel="nofollow sponsored noopener"'));
assert.ok(selectorSource.includes('encodeURIComponent(p.id)'));
assert.ok(selectorSource.includes('data/products.json'));
assert.ok(selectorSource.includes('catalog could not be loaded'));
assert.ok(selectorSource.includes('psram_min-required'));
assert.ok(selectorSource.includes('family==="ESP32-C3"'));
assert.ok(selectorSource.includes('setupAdvancedFilters'));
assert.ok(selectorSource.includes('setupPresets'));
assert.ok(selectorSource.includes('relaxSuggestions'));
assert.ok(selectorSource.includes('syncFilterDependencies'));
assert.ok(selectorSource.includes('updateLiveCount'));
assert.ok(selectorSource.includes('syncUrl'));
assert.ok(selectorSource.includes('URLSearchParams'));
assert.ok(selectorSource.includes('window.requestAnimationFrame'));
assert.ok(selectorSource.includes('advanced-filters'));
assert.ok(selectorSource.includes('Share setup'));


// HTML ↔ selector.js integration contract checks.
const html=fs.readFileSync(__dirname+"/../index.html","utf8");
const selectorIds=[...selectorSource.matchAll(/(?:getElementById|\\$)\\(["']([^"']+)["']\\)/g)].map(m=>m[1]);
const missingIds=[...new Set(selectorIds)].filter(id=>!html.includes('id="'+id+'"'));
assert.deepEqual(missingIds,[]);
assert.ok(html.includes('id="selector-form"'));
assert.ok(html.includes('id="product-grid"'));
assert.ok(html.includes('id="results"'));
assert.ok(html.includes('id="empty-state"'));
assert.ok(html.includes('id="exclusion-list"'));
assert.ok(html.includes('id="catalog-error"'));
assert.ok(html.includes('id="browse-btn"'));
assert.ok(html.includes('compatibility-engine.js'));
assert.ok(html.includes('selector.js'));
assert.ok(html.includes('aria-live="polite"'));
assert.ok(html.includes('id="quick-start"'));
assert.ok(html.includes('data-preset="s3-psram"'));
assert.ok(html.includes('data-preset="touch-spi"'));
assert.ok(html.includes('id="share-btn"'));
assert.ok(html.includes('id="live-count"'));

console.log("V2 engine + selector + HTML integration tests: PASS");