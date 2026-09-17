# ESP32 Touchscreen Selector

The ESP32 Touchscreen Selector helps makers choose a suitable ESP32 touchscreen configuration based on their board, display requirements, touch technology, PSRAM and LVGL needs.

🚀 **Try the live ESP32 Touchscreen Selector:**  
https://embeddednerd.com/tools/esp32-touchscreen-selector/

![ESP32 Touchscreen Selector](assets/esp32-touchscreen-selector-promo.svg)

## What is the ESP32 Touchscreen Selector?

Choosing an ESP32 touchscreen is not only about screen size. Compatibility can depend on the ESP32 variant, resolution, display interface, touch controller, touch interface, PSRAM and graphics framework requirements.

The tool helps users narrow down a practical configuration before selecting hardware.

## What can you select?

- ESP32 board
- Display size
- Resolution
- Display interface
- Touch technology
- Touch interface
- Project type
- LVGL requirement
- PSRAM requirement

## What does the tool provide?

- Recommended ESP32 configuration
- Recommended display characteristics
- Touch technology recommendation
- Touch interface recommendation
- PSRAM guidance
- LVGL suitability
- Estimated project difficulty
- Compatibility warnings
- Matching product suggestions

Recommendations are practical guidance. Exact hardware specifications must still be verified before purchase.

## How it works

The selector evaluates the user's requirements and scores possible configurations rather than simply matching one field.

"Not sure" selections are handled by producing a likely configuration together with verification warnings. The result is intended to narrow the hardware search, not replace a manufacturer's documentation.

## ESP32 touchscreen compatibility considerations

- **SPI displays** — relatively few pins and straightforward wiring for many small and medium displays.
- **RGB displays** — higher pixel-data throughput, but more GPIOs and stricter hardware requirements.
- **8080 / parallel displays** — a different throughput/GPIO trade-off from SPI; exact controller support must be verified.
- **Capacitive touch** — common in modern interfaces, often paired with dedicated touch controllers.
- **Resistive touch** — useful for stylus or pressure-based input; controller implementations vary.
- **I²C touch** — common for capacitive controllers.
- **SPI touch** — common for some resistive touch controllers.
- **PSRAM** — increasingly valuable for larger frame buffers and demanding graphical interfaces.
- **LVGL** — useful for sophisticated embedded GUIs, with memory and driver requirements that depend on the project.
- **ESP32-S3** — a strong starting point for demanding RGB, higher-resolution, larger-display and LVGL configurations.
- **ESP32-C3** — suitable for many projects, but demanding RGB/high-resolution configurations need additional verification.

These are general considerations, not universal compatibility guarantees.

## Recommendation logic

The selector's recommendation engine uses practical rules including:

- ESP32-S3 for demanding RGB, high-resolution, large-display and LVGL configurations.
- PSRAM guidance based on resolution, interface, display size, LVGL and project requirements.
- Warnings when ESP32-C3 is selected for demanding RGB/high-resolution configurations.
- Respect for existing user-selected hardware, with conflicts reported rather than silently replacing the selection.
- Useful recommendations for unknown selections, with explicit verification warnings.
- Verification of the exact display controller, touch controller, GPIO/pinout, voltage, memory, interface and software-driver support.

## Example use cases

- ESP32 IoT dashboards
- Home automation panels
- HMI/control interfaces
- Portable touchscreen devices
- LVGL GUI projects
- Data displays
- ESP32-S3 touchscreen projects
- Raspberry Pi-style embedded interfaces

## Screenshots

The repository includes the promotional image in `assets/esp32-touchscreen-selector-promo.svg`.

## Open source

This repository contains the standalone project implementation and technical reference. The canonical user-facing version remains the hosted Embedded Nerd tool:

https://embeddednerd.com/tools/esp32-touchscreen-selector/

The GitHub repository is intended for source inspection, issues, feature requests and contributions.

## Feedback and contributions

Please use GitHub Issues to:

- Report bugs
- Suggest compatibility rules
- Request additional ESP32 boards
- Request additional displays
- Suggest touchscreen controllers
- Suggest improvements to the recommendation engine

## Related Embedded Nerd resources

### ESP32 Touchscreen Displays Guide

https://embeddednerd.com/esp32-touchscreen-displays-guide/

### ESP32 Touchscreen Selector

https://embeddednerd.com/tools/esp32-touchscreen-selector/

## License

This project is released under the **MIT License**. See [LICENSE](LICENSE).

## GitHub topics

`esp32` `esp32-s3` `esp32-display` `esp32-touchscreen` `touchscreen` `lvgl` `iot` `embedded-systems` `electronics` `arduino` `maker` `embedded` `tft-display`
