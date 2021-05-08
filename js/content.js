window.onload = function () {
  let clickedInput = null

  function showErrorMessage() {
    const errorMessage = `
      <div class="alert-message">
        <span class="closebtn">&times;</span> 
        Something went wrong. Please try again later!
      </div>
    `
    // insert alert message to the top of the page
    document.querySelector('body').insertAdjacentHTML('afterbegin', errorMessage)
    // close the message when clicking the close button
    document.querySelector('.closebtn').addEventListener('click', event => event.target.parentElement.remove())
  }

  function insertToTextArea (textToInsert) {
    // get current text of the input
    const value = clickedInput.value

    // save selection start and end position
    const start = clickedInput.selectionStart
    const end = clickedInput.selectionEnd

    // update the value with our text inserted
    clickedInput.value = value.slice(0, start) + textToInsert + value.slice(end)

    // update cursor to be at the end of insertion
    clickedInput.selectionStart = clickedInput.selectionEnd = start + textToInsert.length
  }

  function insertToInput (textToInsert) {
    clickedInput.setAttribute('value', textToInsert)
  }

  function insertToOtherEditableElement (textToInsert) {
    clickedInput.textContent = textToInsert
  }

  function insertNameList (request, sender, sendResponse) {
    // show error message if input is null
    if (!clickedInput) { return showErrorMessage() }

    // add name list to input
    const textToInsert = request.nameDataList.map(nameData => `@${nameData.name}`).join(' ')

    // invoke insert method based on focused element
    switch (clickedInput.tagName) {
      case 'TEXTAREA':
        insertToTextArea(textToInsert)
      case 'INPUT':
        insertToInput(textToInsert)
      default:
        insertToOtherEditableElement(textToInsert)
    }
  }

  // listen to contextmenu being opened and save the target input
  document.addEventListener('contextmenu', event => clickedInput = event.target)

  // memorize clicked element
  document.addEventListener('click', event => clickedInput = event.target)

  // listen to message request from the extension: background.js
  chrome.runtime.onMessage.addListener(insertNameList)
}