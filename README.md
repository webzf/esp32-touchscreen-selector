# ESP32 Hardware & Display Selector

The **ESP32 Hardware & Display Selector** is a free interactive tool for choosing compatible ESP32 boards, touchscreen displays and display modules based on MCU family, display size, resolution, interface, touch technology, PSRAM, GPIO, LVGL and other hardware requirements.

🚀 **Try the live ESP32 Touchscreen Selector:**  
https://embeddednerd.com/tools/esp32-touchscreen-selector/

![ESP32 Touchscreen Selector](assets/esp32-touchscreen-selector-promo.svg)

## Why use an ESP32 touchscreen selector?

Choosing an ESP32 touchscreen is not only about screen size. Compatibility can depend on the **ESP32 variant, display resolution, interface, touch controller, touch interface, PSRAM and graphics framework requirements**.

This selector helps narrow down the hardware choices before you buy a display or start wiring a project.

## What can you select?

- ESP32 board or chip family
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

## Example: choosing an ESP32 touchscreen for an LVGL GUI

A typical demanding configuration might look like this:

| Requirement | Example choice |
|---|---|
| ESP32 | ESP32-S3 |
| Display size | 4.3" |
| Resolution | 800×480 |
| Display interface | RGB |
| Touch | Capacitive |
| Touch interface | I²C |
| Graphics | LVGL |
| Memory | PSRAM recommended |

For this type of configuration, the selector evaluates the requirements together rather than matching only the display size. It can point toward an **ESP32-S3**, indicate when **PSRAM** is useful, and highlight hardware compatibility details that should be verified before choosing a final module.

The same approach can be used when comparing smaller SPI displays, parallel/8080 displays, different touch interfaces, or less demanding ESP32 projects.

## How it works

The selector evaluates the user's requirements and scores possible configurations rather than simply matching one field.

“Not sure” selections are handled by producing a likely configuration together with verification warnings. The result is intended to narrow the hardware search, not replace a manufacturer's documentation.

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

The recommendation engine uses practical rules including:

- ESP32-S3 for demanding RGB, high-resolution, large-display and LVGL configurations.
- PSRAM guidance based on resolution, interface, display size, LVGL and project requirements.
- Warnings when ESP32-C3 is selected for demanding RGB/high-resolution configurations.
- Respect for existing user-selected hardware, with conflicts reported rather than silently replacing the selection.
- Useful recommendations for unknown selections, with explicit verification warnings.
- Verification of the exact display controller, touch controller, GPIO/pinout, voltage, memory, interface and software-driver support.

## Example use cases

- ESP32 IoT dashboards
- Home automation panels
- HMI and control interfaces
- Portable touchscreen devices
- LVGL GUI projects
- Data displays
- ESP32-S3 touchscreen projects
- Embedded interfaces and control panels

## Screenshots and project artwork

The repository includes the promotional artwork used for the project in `assets/esp32-touchscreen-selector-promo.svg`.

## Run locally

The selector is a standalone web application and does not require a build system.

Clone the repository and open `index.html` in a browser, or serve the folder with any local static web server.

The main project files are:

- `index.html` — selector interface
- `css/selector.css` — styling
- `js/selector.js` — recommendation and compatibility logic
- `assets/` — project artwork

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

The guide explains how to choose ESP32 touchscreen displays, including display interfaces, touch technologies, ESP32-S3 options, PSRAM and LVGL considerations.

### ESP32 Touchscreen Selector

https://embeddednerd.com/tools/esp32-touchscreen-selector/

Use the interactive selector to turn those requirements into a practical hardware recommendation.

## License

This project is released under the **MIT License**. See [LICENSE](LICENSE).

## GitHub topics

`esp32` `esp32-s3` `esp32-display` `esp32-touchscreen` `touchscreen` `lvgl` `iot` `embedded-systems` `electronics` `arduino` `maker` `embedded` `tft-display`

## ESP32 display and touchscreen use cases

The selector is useful for common hardware searches such as:

- ESP32-S3 + LVGL + PSRAM displays
- ESP32 AMOLED touchscreen projects
- ESP32-C6 display and touchscreen hardware
- 800×480 ESP32 displays
- SPI touchscreen displays
- ESP32 boards with native USB, microSD or battery charging

The live tool also provides focused presets and conservative compatibility checks so unknown specifications are not treated as confirmed matches.
