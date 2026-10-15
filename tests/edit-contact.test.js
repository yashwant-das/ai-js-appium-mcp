const ContactDetailScreen = require('../screens/ContactDetailScreen');
const EditContactScreen = require('../screens/EditContactScreen');
const { createContact, deleteContactByName } = require('../screens/flows');
const { uniqueContact } = require('../support/testData');
const { registerCleanup } = require('../support/cleanup');

describe('Contacts: edit', function () {
  it('updates a contact phone number', async function () {
    const contact = uniqueContact();
    const newPhone = uniqueContact().phone;
    registerCleanup(`delete ${contact.fullName}`, () => deleteContactByName(contact.fullName));

    await createContact(contact);
    expect(await ContactDetailScreen.phoneDigits()).toBe(contact.phone);

    await ContactDetailScreen.tapEdit();
    await EditContactScreen.setPhone(newPhone);
    await EditContactScreen.save();

    expect(await ContactDetailScreen.phoneDigits()).toBe(newPhone);
  });
});
