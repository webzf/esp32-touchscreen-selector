# ESP32 Touchscreen Selector

The ESP32 Touchscreen Selector helps makers choose a suitable ESP32 touchscreen configuration based on board, display requirements, touch technology, PSRAM and LVGL needs.

🚀 **Try the live tool:** https://embeddednerd.com/tools/esp32-touchscreen-selector/

## Repository contents

This repository contains a standalone, dependency-free HTML/CSS/JavaScript implementation of the selector, suitable for inspection, local testing and adaptation.

The canonical user-facing version remains hosted on Embedded Nerd.

## What it considers

- ESP32 / ESP32-S2 / ESP32-S3 / ESP32-C3
- Display size and resolution
- SPI, RGB and 8080 / Parallel interfaces
- Capacitive and resistive touch
- I²C and SPI touch interfaces
- PSRAM requirements
- LVGL requirements
- Project type and graphical complexity

## Important

The selector provides practical guidance, not a guarantee of hardware compatibility. Before purchasing hardware, verify the exact display controller, touch controller, GPIO/pinout, voltage, memory, interface and software-driver support in the manufacturer's documentation.

## Related resources

- Live selector: https://embeddednerd.com/tools/esp32-touchscreen-selector/
- ESP32 Touchscreen Displays Guide: https://embeddednerd.com/esp32-touchscreen-displays-guide/

## Contributing

Use GitHub Issues to report bugs, request boards/displays, suggest compatibility rules or propose improvements to the recommendation engine.

## License

MIT — see [LICENSE](LICENSE).
