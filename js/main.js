const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

let win

function createWindow () {

    win = new BrowserWindow({
        show:false,
    })

    win.maximize();

    win.loadURL(url.format({
        pathname: path.join(__dirname, '../index.htm'),
        protocol: 'file:',
        slashes: true
    }))

    win.once('ready-to-show', () => { win.show(); })

    win.on('closed', () => { win = null; });

}

function main() {

    app.on('ready', createWindow);

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') { app.quit(); }
    })

    app.on('activate', () => { if (win === null) createWindow(); });

}

main()
