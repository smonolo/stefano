const {app, BrowserWindow, globalShortcut} = require('electron');

let win;

async function window(production) {
    win = new BrowserWindow({
        width: 1500,
        height: 1000,
        icon: `${__dirname}/_assets/images/icon.png`
    });

    win.setTitle('Starting' + (production ? '...' : ' in development mode...'));
    win.setMenu(null);

    if (!production) win.webContents.openDevTools();

    try {
        await win.loadFile(`${__dirname}/_templates/index.html`);
    } catch (err) {
        return win = null;
    }

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', () => {
    globalShortcut.register('CommandOrControl+R', () => {
        win.reload();
    });
    globalShortcut.register('CommandOrControl+W', () => {
        win.toggleDevTools();
    });

    let isProduction = true;

    process.argv.forEach((val) => {
        if (val === '--dev') isProduction = false;
    });

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