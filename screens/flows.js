// Multi-screen actions shared by tests and cleanup.
const ContactsListScreen = require('./ContactsListScreen');
const NewContactScreen = require('./NewContactScreen');
const ContactDetailScreen = require('./ContactDetailScreen');
const EditContactScreen = require('./EditContactScreen');

async function createContact(contact) {
  await ContactsListScreen.tapAdd();
  await NewContactScreen.fill(contact);
  await NewContactScreen.save();
  await ContactDetailScreen.waitForDisplayed();
}

// Returns false when no contact has this name (already deleted, or never saved).
async function deleteContactByName(fullName) {
  const { resetToHome } = require('../support/appState');
  await resetToHome();
  await ContactsListScreen.search(fullName);
  if ((await ContactsListScreen.waitForContactCount(fullName, 1, 5000)) < 1) {
    await ContactsListScreen.clearSearch();
    return false;
  }
  await ContactsListScreen.openContact(fullName);
  await ContactDetailScreen.tapEdit();
  await EditContactScreen.deleteContact();
  await ContactsListScreen.clearSearch();
  return true;
}

module.exports = { createContact, deleteContactByName };
