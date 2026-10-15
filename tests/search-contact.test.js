const ContactsListScreen = require('../screens/ContactsListScreen');
const ContactDetailScreen = require('../screens/ContactDetailScreen');
const { createContact, deleteContactByName } = require('../screens/flows');
const { uniqueContact } = require('../support/testData');
const { registerCleanup } = require('../support/cleanup');

describe('Contacts: search', function () {
  it('finds a contact by full name and by last name', async function () {
    const contact = uniqueContact();
    registerCleanup(`delete ${contact.fullName}`, () => deleteContactByName(contact.fullName));

    await createContact(contact);
    await ContactDetailScreen.goBack();

    await ContactsListScreen.search(contact.fullName);
    expect(await ContactsListScreen.waitForContactCount(contact.fullName, 1)).toBe(1);

    await ContactsListScreen.clearSearch();
    await ContactsListScreen.search(contact.last);
    expect(await ContactsListScreen.waitForContactCount(contact.fullName, 1)).toBe(1);
  });
});
