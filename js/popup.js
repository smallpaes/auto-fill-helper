const form = document.querySelector('.form')
const nameInput = document.querySelector('.form__input')
const displayedList = document.querySelector('.list')
const emptyMessage = document.querySelector('.list__empty-message')
const failedMessage = document.querySelector('.list__error-message')
const inputErrorMessage = document.querySelector('.form__error-message')

const STORAGE_KEY = 'nameDataList'

let nameDataList = []
let isValidName = null

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
    if (nameDataList.length > 0) {
      toggleEmptyMessage()
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

function toggleEmptyMessage () {
  emptyMessage.classList.toggle('hidden')
}

function validateInput (event) {
  const inputName = event.target.value
  // update validation status
  if (inputName.trim() === '') {
    isValidName = null
  } else {
    isValidName = !nameDataList.some(nameData => nameData.name === inputName)
  }

  const isShowInputErrorMessage = !inputErrorMessage.classList.contains('hidden')
  if (
    ((isValidName || isValidName === null) && isShowInputErrorMessage)
    || (isValidName === false && !isShowInputErrorMessage)
  ) inputErrorMessage.classList.toggle('hidden')
}

function resetInput () {
  nameInput.value = ''
  isValidName = null
}

async function handleFormSubmit (event) {
  // prevent browser default behavior
  event.preventDefault()
  // validate name entered
  const name = nameInput.value
  if (!isValidName) return

  try {
    const nameData = new Name(name)
    !nameDataList.length && toggleEmptyMessage()
    await storeNewName(nameData)
    displayList(nameData)
    resetInput()
  } catch (e) {
    // TODO
  }
}

displayedList.addEventListener('click', async event => {
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
      // TODO
      if (nameDataList.length === 0) toggleEmptyMessage()
    }
  } catch (e) {
    // TODO
  }
})

form.addEventListener('submit', handleFormSubmit)

nameInput.addEventListener('input', validateInput)

document.addEventListener('DOMContentLoaded', initDisplayList)