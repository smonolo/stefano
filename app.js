const {app, BrowserWindow, globalShortcut} = require('electron');

let win;

function window(production) {
    // Window default settings
    win = new BrowserWindow({
        width: 1500,
        height: 1000,
        minWidth: 800,
        minHeight: 500,
        icon: `${__dirname}/images/icon.png`,
        show: false,
        title: 'Stefano'
    });

    // Remove default menu
    win.setMenu(null);

    // Automatically open dev tools if app
    // is in running in development mode
    if (!production) win.webContents.openDevTools();

    let loadUrl = production ? 'https://stevyb0t.it' : 'http://localhost:3000';

    win.loadURL(loadUrl).then();

    win.once('ready-to-show', () => {
        win.show();
    });

    // Don't update page title
    win.on('page-title-updated', (event) => {
        event.preventDefault();
    });

    // Don't open new windows
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

    // Register shortcut to reload the main window
    globalShortcut.register('CommandOrControl+R', () => {
        win.reload();
    });

    // Register shortcut to set fullscreen
    globalShortcut.register('CommandOrControl+Shift+F', () => {
        win.setFullScreen(!win.isFullScreen());
    });

    // Register shortcut to toggle dev tools if
    // the app is running in development mode
    if (!isProduction) {
        globalShortcut.register('CommandOrControl+Shift+I', () => {
            win.toggleDevTools();
        });
    }

    // Open window with dev mode boolean
    window(isProduction);
});

// Quit app process once all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Call window function on activation if there
// is no active window
app.on('activate', () => {
    if (win === null) {
        window();
    }
});