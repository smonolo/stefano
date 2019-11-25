const {app, BrowserWindow, globalShortcut} = require('electron');

let win;

function window(production) {
    win = new BrowserWindow({
        width: 1500,
        height: 1000,
        minWidth: 800,
        minHeight: 500,
        icon: `${__dirname}/images/icon.png`,
        show: false,
        title: 'Stefano'
    });

    win.setMenu(null);

    if (!production) win.webContents.openDevTools();

    win.loadURL('https://stevyb0t.it').then();

    win.once('ready-to-show', () => {
        win.show();
    });

    win.on('page-title-updated', (event) => {
        event.preventDefault();
    });

    win.webContents.on('new-window', (event) => {
        event.preventDefault();
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