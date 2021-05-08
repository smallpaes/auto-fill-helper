const STORAGE_KEY = 'nameDataList'

const contextMenuItems = {
  "id": "autoFill",
  "title": "Auto Fill",
  "contexts": ["editable"],
}

// initialize the extension on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create(contextMenuItems)
})

function getDisplayedList (key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([key], storedData => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError)
      const storedNameDataList = storedData[key] || []
      const selectedNameDataList = storedNameDataList.filter(nameData => nameData.isSelected)
      resolve(selectedNameDataList)
    })
  })
}

function sendMessageWithListData(nameDataList) {
  // send a message from the extension to content script of current tab
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { nameDataList })
    chrome.tabs.insertCSS({
      file: 'css/content.css'
    })
  })
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "autoFill" || !info.editable) return
  const nameDataList = await getDisplayedList(STORAGE_KEY)
  sendMessageWithListData(nameDataList)
})

chrome.commands.onCommand.addListener(async command => {
  if (command !== 'auto-fill') return 
  const nameDataList = await getDisplayedList(STORAGE_KEY)
  sendMessageWithListData(nameDataList)
})