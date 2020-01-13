const {app, BrowserWindow, globalShortcut, Tray, Menu} = require('electron');
const Store = require('electron-store');
const log = require('electron-log');
const richPresence = require('discord-rich-presence')('648198569903390724');

const store = new Store();

let window, win, loadWin;
let tray = null;

app.on('ready', () => {
    loadWin = new BrowserWindow({
        width: 300,
        height: 300,
        frame: false,
        icon: `${__dirname}/images/icon.png`,
        resizable: false,
        movable: true,
        show: false
    });

    let timeUsedStart = new Date().getTime();
    let isProduction = (process.argv || []).indexOf('--dev') === -1;

    log.info(`Starting electron in ${isProduction ? 'production' : 'development'} mode.`);
    log.debug(`Debug info:\nUsing electron ${process.versions.electron}.` +
        `\nApp is running on version ${app.getVersion()}.`);

    if (!store.get('timeUsed')) store.set('timeUsed', 0);
    if (!store.get('logins')) store.set('logins', 0);

    loadWin.setMenu(null);
    loadWin.loadFile(`${__dirname}/loadWin/index.html`).then();

    // Load once html is loaded
    loadWin.webContents.on('did-finish-load', () => loadWin.show());

    globalShortcut.register('CommandOrControl+R', () => win.reload());
    globalShortcut.register('CommandOrControl+Shift+F', () => win.setFullScreen(!win.isFullScreen()));

    if (!isProduction) globalShortcut.register('CommandOrControl+Shift+I', () => win.toggleDevTools());

    // Create new tray
    tray = new Tray(`${__dirname}/images/icon.png`);

    let trayMenu = Menu.buildFromTemplate([
        {label: 'Toggle Developer Tools', type: 'normal', click() {win.toggleDevTools()}},
        {type: 'separator'},
        {label: 'Reload', type: 'normal', click() {win.reload()}},
        {label: 'Quit', type: 'normal', click() {app.quit()}}
    ]);

    tray.setToolTip('Stefano');
    tray.setContextMenu(trayMenu);

    window = async function window(production) {
        let configWidth = store.get('width');
        let configHeight = store.get('height');

        win = new BrowserWindow({
            width: configWidth ? configWidth : 1500,
            height: configHeight ? configHeight : 1000,
            minWidth: 600,
            minHeight: 300,
            icon: `${__dirname}/images/icon.png`,
            show: false,
            title: 'Stefano' + (production ? '' : ' (DEV)')
        });

        win.setMenu(null);

        // Open dev tools if running in dev mode
        if (!production) win.webContents.openDevTools();

        log.info('Reloading and clearing session cache.');

        let loadUrl = production ? 'https://stevyb0t.it' : 'http://localhost:3000';

        // Clear session cache and load url
        await win.webContents.session.clearCache(() => win.loadURL(loadUrl).then());

        // Discord rich presence
        richPresence.updatePresence({
            state: 'Visiting stevyb0t.it',
            startTimestamp: Date.now(),
            largeImageKey: 'logo',
            instance: true
        });

        win.once('ready-to-show', () => {
            loadWin.hide();
            loadWin.close();
            win.show();
        });

        // Don't update page title
        win.on('page-title-updated', (event) => event.preventDefault());

        // Don't open new windows
        win.webContents.on('new-window', (event) => event.preventDefault());

        let currentSize = win.getSize();

        // Get window size on resize event
        win.on('resize', () => currentSize = win.getSize());

        win.on('closed', () => {
            let timeUsedFinal = new Date().getTime() - timeUsedStart;

            // Set configs before closing
            store.set('width', currentSize[0]);
            store.set('height', currentSize[1]);
            store.set('timeUsed', store.get('timeUsed') + timeUsedFinal);
            store.set('logins', store.get('logins') + 1);
            store.set('lastLogin', new Date().getTime());
            if (!store.get('firstLogin')) store.set('firstLogin', new Date().getTime());

            log.debug(`App was used for ${timeUsedFinal} milliseconds.`);
            log.info(`Changed config size to ${currentSize[0]}, ${currentSize[1]}.`);
            log.info('Shutting down.');

            // Set window to null, so close it completely
            win = null;
        });
    };

    window(isProduction);
});

// Quit app process once all windows are closed
app.on('window-all-closed', () => {if (process.platform !== 'darwin') app.quit()});

// Call window function on activation if there is no active window
app.on('activate', () => {if (win === null) window()});