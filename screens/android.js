// Selector builders for Google Contacts on Android, which is mostly Jetpack
// Compose: few resource IDs, so many locators match on text.
const APP = 'com.google.android.contacts';

const id = (name) => `id=${APP}:id/${name}`;
const text = (value) => `android=new UiSelector().text("${value}")`;
const editText = (value) =>
  `android=new UiSelector().className("android.widget.EditText").text("${value}")`;
const focusedEditText = () =>
  'android=new UiSelector().className("android.widget.EditText").focused(true)';
const scrollToText = (value) =>
  `android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("${value}")`;

module.exports = { id, text, editText, focusedEditText, scrollToText };
