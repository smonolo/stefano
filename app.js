const {app, BrowserWindow, globalShortcut} = require('electron');

let win;

function window(production) {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: `${__dirname}/_assets/images/icon.png`
    });

    win.setTitle('Launching' + (production ? '...' : ' in development mode...'));
    win.setMenu(null);

    win.loadFile(`${__dirname}/_templates/index.html`);

    win.on('closed', () => {
        win = null;
    });
}

app.on('ready', () => {
    globalShortcut.register('CommandOrControl+R', () => {
        win.reload();
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