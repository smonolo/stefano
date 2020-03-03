const {app, BrowserWindow, globalShortcut, Tray, Menu} = require('electron');
const Store = require('electron-store');
const log = require('electron-log');
const richPresence = require('discord-rich-presence')('648198569903390724');
const open = require('open');
const {autoUpdater} = require('electron-updater');

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
        show: false,
        autoHideMenuBar: true
    });

    let timeUsedStart = new Date().getTime();
    let isProduction = (process.argv || []).indexOf('--dev') === -1;

    log.info(`Starting app in ${isProduction ? 'production' : 'development'} mode.`);
    log.debug(`\n---------------\nDebug info:\n- Electron version: ${process.versions.electron}` +
        `\n- App version: ${app.getVersion()}\n---------------`);

    if (!store.get('timeUsed')) store.set('timeUsed', 0);
    if (!store.get('logins')) store.set('logins', 0);

    loadWin.loadFile(`${__dirname}/loadWin/index.html`).then();

    loadWin.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify().then();
    });

    // Load once html is loaded
    loadWin.webContents.on('did-finish-load', () => loadWin.show());

    // Register shortcuts
    globalShortcut.register('CommandOrControl+R', () => win.reload());
    globalShortcut.register('CommandOrControl+Shift+F', () => win.setFullScreen(!win.isFullScreen()));
    if (!isProduction) globalShortcut.register('CommandOrControl+Shift+I', () => win.toggleDevTools());

    // Create new tray icon
    tray = new Tray(`${__dirname}/images/icon.png`);

    let trayMenu = Menu.buildFromTemplate([
        {label: 'Developer Tools', type: 'normal', click() {win.toggleDevTools()}},
        {type: 'separator'},
        {label: 'Reload', type: 'normal', click() {win.reload()}},
        {label: 'Quit', type: 'normal', click() {app.quit()}}
    ]);

    tray.setToolTip('Stefano');
    tray.setContextMenu(trayMenu);

    window = function window(production) {
        win = new BrowserWindow({
            minWidth: 600,
            minHeight: 300,
            icon: `${__dirname}/images/icon.png`,
            show: false,
            title: 'Stefano' + (production ? '' : ` (${app.getVersion()}-DEV)`),
            autoHideMenuBar: true
        });

        let configWidth = store.get('width');
        let configHeight = store.get('height');
        let configPosX = store.get('posX');
        let configPosY = store.get('posY');
        let currentPosFirst = win.getPosition();

        win.setBounds({
            width: configWidth ? configWidth : 1500,
            height: configHeight ? configHeight : 1000,
            x: configPosX ? configPosX : (currentPosFirst[0] - (configWidth ? 0 : 350)),
            y: configPosY ? configPosY : (currentPosFirst[1] - (configHeight ? 0 : 200))
        });

        // Open dev tools if running in dev mode
        if (!production) win.webContents.openDevTools();

        // Clear session cache and storage data
        win.webContents.session.clearCache().then();
        win.webContents.session.clearStorageData().then();

        let loadUrl = production ? 'https://stevyb0t.it' : 'http://localhost:3000';

        win.loadURL(loadUrl).then();

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
        win.webContents.on('new-window', async (event, url) => {
            event.preventDefault();

            if (url.includes('https://')) await open(url);
        });

        let currentSize = win.getSize();
        let currentPos = win.getPosition();

        win.on('resize', () => currentSize = win.getSize());
        win.on('move', () => currentPos = win.getPosition());

        win.on('closed', () => {
            let timeUsedFinal = new Date().getTime() - timeUsedStart;

            // Set configs before closing
            store.set('width', currentSize[0]);
            store.set('height', currentSize[1]);
            store.set('posX', currentPos[0]);
            store.set('posY', currentPos[1]);
            store.set('timeUsed', store.get('timeUsed') + timeUsedFinal);
            store.set('logins', store.get('logins') + 1);
            store.set('lastLogin', new Date().getTime());
            if (!store.get('firstLogin')) store.set('firstLogin', new Date().getTime());

            log.debug(`\n---------------\nDebug info:\n- Session duration: ${timeUsedFinal} ms.` +
                `\n- Saved latest size. (width: ${currentSize[0]}, height: ${currentSize[1]})` +
                `\n- Saved latest position. (x: ${currentPos[0]}, y: ${currentPos[1]})\n---------------`);
            log.info('Closing all windows and shutting down.');

            win = null;
        });
    };

    window(isProduction);
});

// Quit app process once all windows are closed
app.on('window-all-closed', () => {if (process.platform !== 'darwin') app.quit()});

// Call window function on activation if there is no active window
app.on('activate', () => {if (win === null) window()});

autoUpdater.on('update-available', () => {
    window.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
    window.webContents.send('update_downloaded');
});