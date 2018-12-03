import { app, BrowserWindow } from 'electron'
// const { appUpdater } = require('./autoupdater')
const { autoUpdater } = require('electron-updater')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/build/index.html`

function createWindow () {
  console.log('create window run')
  console.log(process.env.NODE)
  // appUpdater()
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1280
  })
  mainWindow.webContents.openDevTools()

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function sendStatusToWindow (text) {
  mainWindow.webContents.send('message', text)
}

var handleStartupEvent = function () {
  if (process.platform !== 'win32') {
    return false
  }

  var squirrelCommand = process.argv[1]
  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':
      app.quit()
      return true
    case '--squirrel-uninstall':
      app.quit()
      return true
    case '--squirrel-obsolete':
      return true
  }
}

if (handleStartupEvent()) {
  console.log('Do not do anything')
}

app.on('ready', createWindow)

app.on('ready', function () {
  autoUpdater.checkForUpdatesAndNotify()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...')
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.')
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.')
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err)
})
autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = 'Download speed: ' + progressObj.bytesPerSecond
  logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%'
  logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  sendStatusToWindow(logMessage)
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded')
})
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
