const copyButton = document.getElementById('copyButton');
const generateButton = document.getElementById('generateButton');
const inputMode = document.getElementById('inputMode');
const inputGuestID = document.getElementById('inputGuestID');
const inputTime = document.getElementById('inputTime');
const result = document.getElementById('result');

function clearData() {
  copyButton.innerText = 'Copy link';
  result.innerText = '';
}

async function getData() {
  const res = await fetch('./assets/guests/data.json');
  const guests = await res.json();
  return guests;
}

async function generateGuestURL(mode, guestID, time) {
  const originUrl = window.location.origin;
  const baseURL =
    originUrl.includes('localhost') || originUrl.includes('127.0.0.1')
      ? 'http://localhost:8080'
      : 'https://thchinh.github.io/wedding-website';
  const guests = await getData();
  const guest = guests.find((g) => g.id === guestID);
  const url = new URL(baseURL);

  url.searchParams.append('m', mode);

  if (guest) {
    url.searchParams.append('g', guest.code);
  }

  if (time) {
    url.searchParams.append('t', time);
  }
  return url.toString();
}

inputGuestID.addEventListener('keydown', clearData);
inputMode.addEventListener('keydown', clearData);
inputTime.addEventListener('keydown', clearData);

copyButton.addEventListener('click', function () {
  const resultText = result.innerText;

  if (!resultText) {
    alert('No URL to copy. Please generate a URL first.');
    return;
  }

  navigator.clipboard.writeText(resultText);
  this.innerText = 'Copied!';
});

generateButton.addEventListener('click', async function () {
  const valueInputMode = inputMode.value;
  const valueInputGuestID = inputGuestID.value;
  const valueTime = inputTime.value;

  if (!valueInputMode || !valueInputGuestID) {
    alert('Please enter both Mode and Guest ID.');
    return;
  }

  const generatedURL = await generateGuestURL(
    valueInputMode,
    valueInputGuestID,
    valueTime
  );
  result.innerText = generatedURL;
});
