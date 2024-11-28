import MailDev from 'maildev';

let cbks = [];
export async function setupMailDev(options) {
  if(!options) throw new Error('options is required');
  if (!options.smtp) throw new Error('smtp is required');
  if (!options.web) throw new Error('web is required');
  const { smtp, web } = options;
  return new Promise((resolve) => {
    const maildev = new MailDev({
      smtp,
      web,
    });

    maildev.listen(function () {
      resolve(maildev);
    });

    maildev.on('new', function (email) {
      cbks.forEach(cbk => cbk(email));
    });
  })
}

export async function getNextEmail() {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, 1000);
    cbks.push((email) => {
      resolve(email)
      clearTimeout(timeout);
    });
  });
}
