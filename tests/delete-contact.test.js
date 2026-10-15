const ContactsListScreen = require('../screens/ContactsListScreen');
const ContactDetailScreen = require('../screens/ContactDetailScreen');
const EditContactScreen = require('../screens/EditContactScreen');
const { createContact, deleteContactByName } = require('../screens/flows');
const { uniqueContact } = require('../support/testData');
const { registerCleanup } = require('../support/cleanup');

describe('Contacts: delete', function () {
  it('deletes a contact so search no longer finds it', async function () {
    const contact = uniqueContact();
    // Removes the contact only if the test fails before deleting it.
    registerCleanup(`delete ${contact.fullName}`, () => deleteContactByName(contact.fullName));

    await createContact(contact);
    await ContactDetailScreen.tapEdit();
    await EditContactScreen.deleteContact();

    await ContactsListScreen.waitForDisplayed();
    await ContactsListScreen.search(contact.fullName);
    expect(await ContactsListScreen.waitForContactCount(contact.fullName, 0)).toBe(0);
  });
});
