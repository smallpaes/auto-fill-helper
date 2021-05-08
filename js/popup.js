const form = document.querySelector('.form')
const nameInput = document.querySelector('.form__input')
const displayedList = document.querySelector('.list')
const emptyMessage = document.querySelector('.list__empty-message')
const failedMessage = document.querySelector('.list__error-message')

const STORAGE_KEY = 'nameDataList'

let nameDataList = []

class Name {
  constructor (name) {
    this.name = name
    this.isSelected = true
  }
}

function displayList (...list) {
  displayedList.innerHTML += list.map((nameData, index) => {
    return `
      <li 
        class="list__item"
        data-index=${index}
      >
        <input
          type="checkbox" 
          name="select" 
          id=${nameData.name} 
          class="list__item-checkbox"
          ${nameData.isSelected ? 'checked' : ''}
        >
        <label
          class="list__item-label"
          for=${nameData.name}
        >
          ${nameData.name}
        </label>
        <i class="far fa-trash-alt list__item-delete-icon"></i>
      </li>
    `
  }).join('')
}

function initDisplayList () {
  // retrieve the list from the store
  chrome.storage.sync.get([STORAGE_KEY], storedNameDataList => {
    // handle failed fetching data
    if (chrome.runtime.lastError) return failedMessage.classList.remove('hidden')
    // pass the data retrieved
    nameDataList = storedNameDataList[STORAGE_KEY] || []
    // empty name data
    console.log(nameDataList, nameDataList.length > 0, failedMessage.classList)
    if (nameDataList.length > 0) {
      emptyMessage.classList.add('hidden')
      // display the list
      displayList(...nameDataList)
    }
  })
}

function updateDataToStore (key, data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: data }, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError)
      resolve()
    })
  })
}

function storeNewName (nameData) {
  nameDataList.push(nameData)
  return updateDataToStore(STORAGE_KEY, nameDataList)
}


function updateSelectState (nameDataIndex) {
  nameDataIndex = parseInt(nameDataIndex, 10)
  nameDataList = nameDataList.map((nameData, index) => {
    console.log(nameDataIndex, index)
    if (index !== nameDataIndex) return nameData
    return { ...nameData, isSelected: !nameData.isSelected }
  })
  return updateDataToStore(STORAGE_KEY, nameDataList)
}

function removeName (nameDataIndex) {
  nameDataIndex = parseInt(nameDataIndex, 10)
  nameDataList = nameDataList.filter((nameData, index) => index !== nameDataIndex)
  return updateDataToStore(STORAGE_KEY, nameDataList)
}

form.addEventListener('submit', async event => {
  event.preventDefault()
  const name = nameInput.value
  if (name.trim().length === 0) return
  
  try {
    const nameData = new Name(name)
    if (nameDataList.length === 0) emptyMessage.classList.add('hidden')
    await storeNewName(nameData)
    displayList(nameData)
    nameInput.value = ''
  } catch (e) {
    // TODO
  }
})

displayedList.addEventListener('click', async event => {
  console.log(event.target.tagName)
  if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'I') return

  // find the index of the name in the list
  const nameDataIndex = event.target.closest('.list__item').dataset.index

  try {
    const isDeleteIcon = event.target.classList.contains('list__item-delete-icon')
    const isCheckBox = event.target.classList.contains('list__item-checkbox')
    // update nameData selected state
    isCheckBox && await updateSelectState(nameDataIndex)
    // remove selected nameData
    if (isDeleteIcon) {
      await removeName(nameDataIndex)
      event.target.closest('.list__item').remove()
      console.log(nameDataList.length === 0, emptyMessage.classList)
      // TODO
      if (nameDataList.length === 0) emptyMessage.classList.remove('hidden')
    }
  } catch (e) {
    // TODO
  }
})

document.addEventListener('DOMContentLoaded', initDisplayList)