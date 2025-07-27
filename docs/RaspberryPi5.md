# Raspberry Pi 5
Notes for running this project locally on a raspberry pi 5

## Deps
- `sudo apt-get install fonts-noto-color-emoji` for emoji support

## Configure autostart
```sh
mkdir -p ~/.config/autostart
vim ~/.config/autostart/chromium.desktop
```

```
[Desktop Entry]
Type=Application
Exec=chromium-browser --start-fullscreen --touch-events=enabled http://localhost:5173
Hidden=false
X-GNOME-Autostart-enabled=true
Name=Chromium
```

```sh
sudo chmod +x /home/morganpi/dev/home-management/scripts/run_dev.sh
crontab -e
@reboot /home/morganpi/dev/home-management/scripts/run_dev.sh /home/morganpi/dev/home-management
```