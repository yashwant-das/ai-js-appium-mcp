const ContactsListScreen = require('../screens/ContactsListScreen');
const ContactDetailScreen = require('../screens/ContactDetailScreen');
const { createContact, deleteContactByName } = require('../screens/flows');
const { uniqueContact } = require('../support/testData');
const { registerCleanup } = require('../support/cleanup');

describe('Contacts: create', function () {
  it('creates a contact with a phone number and email', async function () {
    const contact = uniqueContact();
    registerCleanup(`delete ${contact.fullName}`, () => deleteContactByName(contact.fullName));

    await createContact(contact);
    expect(await ContactDetailScreen.headerName()).toBe(contact.fullName);

    await ContactDetailScreen.goBack();
    await ContactsListScreen.search(contact.fullName);
    expect(await ContactsListScreen.waitForContactCount(contact.fullName, 1)).toBe(1);
  });
});
