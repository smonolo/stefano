const {app, BrowserWindow, globalShortcut} = require('electron');
const Store = require('electron-store');
const log = require('electron-log');

const store = new Store();

let win;

function window(production) {
    log.info(`Starting electron in ${production ? 'production' : 'development'} mode.`);
    log.debug(`Debug info:\nUsing electron ${process.versions.electron}.` +
        `\nApp is running on version ${app.getVersion()}.`);

    // Get latest size from config.json
    let configWidth = store.get('width');
    let configHeight = store.get('height');

    // Window default settings
    win = new BrowserWindow({
        width: configWidth ? configWidth : 1500,
        height: configHeight ? configHeight : 1000,
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

    let currentSize = win.getSize();

    win.on('resize', () => {
        // Get window size on resize event
        currentSize = win.getSize();
    });

    win.on('closed', () => {
        // Store current width and height for next boot
        store.set('width', currentSize[0]);
        store.set('height', currentSize[1]);

        log.info(`Changed config size to ${currentSize[0]}, ${currentSize[1]}.`);
        log.info('Shutting down.');

        // Set window to null, so close it completely
        win = null;
    });
}

app.on('ready', () => {
    // Check if app is running in development mode
    let isProduction = (process.argv || []).indexOf('--dev') === -1;

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
    if (process.platform !== 'darwin') app.quit();
});

// Call window function on activation if there is no active window
app.on('activate', () => {
    if (win === null) window();
});