function generateGuestURL(mode, guestID, time) {
  const baseURL = 'https://thchinh.github.io/wedding-website';
  const url = new URL(baseURL);
  url.searchParams.append('m', mode);
  url.searchParams.append('g', guestID);

  if (time) {
    url.searchParams.append('t', time);
  }
  return url.toString();
}

const copyButton = document.getElementById('copyButton');
const generateButton = document.getElementById('generateButton');
const inputMode = document.getElementById('inputMode');
const inputGuestID = document.getElementById('inputGuestID');
const inputTime = document.getElementById('inputTime');
const result = document.getElementById('result');

inputGuestID.addEventListener('keydown', function () {
  copyButton.innerText = 'Copy link';
  result.innerText = '';
});

copyButton.addEventListener('click', function () {
  const resultText = result.innerText;

  if (!resultText) {
    alert('No URL to copy. Please generate a URL first.');
    return;
  }

  navigator.clipboard.writeText(resultText);
  this.innerText = 'Copied!';
});

generateButton.addEventListener('click', function () {
  const valueInputMode = inputMode.value;
  const valueInputGuestID = inputGuestID.value;
  const valueTime = inputTime.value;

  if (!valueInputMode || !valueInputGuestID) {
    alert('Please enter both Mode and Guest ID.');
    return;
  }

  const generatedURL = generateGuestURL(
    valueInputMode,
    valueInputGuestID,
    valueTime
  );
  result.innerText = generatedURL;
});
