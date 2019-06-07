const {app, BrowserWindow, globalShortcut} = require('electron');
const url = require('url');
const path = require('path');

let win;

async function window(production) {
    win = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1100,
        minHeight: 800,
        icon: `${__dirname}/_assets/images/icon.png`,
        show: false
    });

    win.setMenu(null);

    if (!production) win.webContents.openDevTools();

    try {
        await win.loadURL(url.format({
            pathname: path.join(__dirname, '_templates', 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
    } catch (err) {
        return win = null;
    }

    win.once('ready-to-show', () => {
        win.show();
    });

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', () => {
    let isProduction = true;

    process.argv.forEach((val) => {
        if (val === '--dev') isProduction = false;
    });

    globalShortcut.register('CommandOrControl+R', () => {
        win.reload();
    });
    globalShortcut.register('CommandOrControl+Shift+F', () => {
        win.setFullScreen(!win.isFullScreen());
    });

    if (!isProduction) {
        globalShortcut.register('CommandOrControl+Shift+I', () => {
            win.toggleDevTools();
        });
    }

    window(isProduction);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        window();
    }
});