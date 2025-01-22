import * as crypto from 'crypto';
const secretKey = 'qUDjZ5HZ5XHiGLpM8S7jcRo0oa6GIds_';
const iv = crypto.randomBytes(16);

export function toSmsNo(phone: string): string {
  const startsArr = ['081', '080', '070', '071', '090', '091'];
  const formattedPhone = phone;

  if (phone.startsWith('234')) {
    return phone;
  }

  if (phone.startsWith('+234')) {
    return phone.slice(1); // Remove the '+' and return
  }

  // if (phone.startsWith('0')) {
  //   formattedPhone = phone.slice(1);
  // }

  for (const start of startsArr) {
    if (formattedPhone.startsWith(start)) {
      return '234' + phone.slice(1); // Prepend '234'
    }
  }

  return phone;
}

export const obfuscatePhoneNumber = (phone: string): string => {
  if (phone.length >= 11) {
    return `*******${phone.slice(-3)}`;
  }
  return phone;
};

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(secretKey),
    iv,
  );
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

export function decrypt(encryptedText: string): string {
  const [ivBase64, encrypted] = encryptedText.split(':');
  const ivBuffer = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(secretKey),
    ivBuffer,
  );
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function formatBvnDate(bvnDate: string): string | null {
  const monthNames = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  };

  // Match the BVN date format "28-Jun-2000"
  const match = bvnDate.match(/^(\d{2})-(\w{3})-(\d{4})$/);

  if (!match) {
    return null; // Invalid date format
  }

  const [_, day, month, year] = match;

  // Convert the date into dd-mm-yyyy format
  const formattedDate = `${year}-${monthNames[month]}-${day}`;

  return formattedDate;
}

export function convertBankOneDateToStandardFormat(date: string) {
  const [datePart] = date.split(' ');
  const [month, day, year] = datePart.split('/');
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
}

export const convertDobToStandardFormat = (dob: string): string => {
  const [day, month, year] = dob.split('-');
  return `${year}-${month}-${day}`;
};

export function areDatesSame(ninDate: string, dob: string): boolean {
  const formattedDob = convertDobToStandardFormat(dob);
  return ninDate === formattedDob;
}

export function ninIsValid(entity: any, user: any): boolean {
  const firstNameStatus = compareStrings(entity.first_name, user.firstName);
  const lastNameStatus = compareStrings(entity.last_name, user.lastName);
  const middleNameStatus = compareStrings(entity.middle_name, user.otherName);
  const dobStatus = areDatesSame(entity.date_of_birth, user.dob);
  console.log({ firstNameStatus, lastNameStatus, middleNameStatus, dobStatus });
  return true;
  return (
    (firstNameStatus && lastNameStatus) ||
    (firstNameStatus && dobStatus) ||
    (lastNameStatus && dobStatus) ||
    (middleNameStatus && firstNameStatus) ||
    (middleNameStatus && lastNameStatus) ||
    (middleNameStatus && dobStatus)
  );
}

export function compareStrings(str1: string, str2: string): boolean {
  return str1.toLowerCase() === str2.toLowerCase();
}

export function toLowerCase(str: string) {
  if (!str) {
    return str;
  }
  return str.toLowerCase();
}
