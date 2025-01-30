export enum ErrorMessages {
  PASSWORDS_DO_NOT_MATCH = 'Passwords do not match',
  PASSWORD_TOO_WEAK = 'Password too weak, must contain at least one uppercase letter, one lowercase letter, one number or special character, and at least 8 characters.',
  INVALID_EMAIL_FORMAT = 'Invalid Email Format',
  USER_ALREADY_EXISTS = 'User with email already exists',
  INVALID_EMAIL_OR_PASSWORD = 'Invalid email or password provided.',
  UNAUTHORIZED = 'Unauthorized Access; Please Login.',
  USER_NOT_FOUND = 'User not found',
  ROLE_NOT_FOUND = 'Role not found',
  PHONE_EXIST = 'Phone number already exist',
  INVALID_OTP = 'Invalid OTP',
  PASSCODE_MISMATCH = 'Passcode mismatch',
  PIN_MISMATCH = 'Pin mismatch',
  USER_EXIST = 'User already exist',
  PHONE_NOT_VERIFIED = 'Phone number not verified',
  PASSCODE_NOT_SET = 'Passcode not set',
  EMAIL_OTP_NOT_SENT = 'Could not send OTP to email. Try again',
  COULD_NOT_VERIFY_TIN = 'Could not verify TIN. Try again',
  COULD_NOT_VERIFY_BVN = 'Could not verify BVN. Try again',
  COULD_NOT_VERIFY_NIN = 'Could not verify NIN. Try again',
  COULD_NOT_VERIFY_FACE = 'Could not verify face. Try again',
  COULD_NOT_ADDRESS = 'Could not verify address. Try again',
  ATTEST_ERROR = 'You must attest to the information provided',
  USERNAME_EXIST = 'Username already exist',
  USERNAME_AVAILABLE = 'Username available',
  ACCOUNT_NOT_FOUND = 'Account not found',
  PHONE_EXIST_WITH_ANOTHER_ACCOUNT = 'Phone number already exist with another account',
  COULD_NOT_RETRIEVE_BVN = 'Could not retrieve BVN. Try again',
  EMAIL_NOT_VERIFIED = 'Email not verified',
  COULD_NOT_SEND_OTP = 'Could not send OTP. Try again',
  CANNOT_VERIFY_EMAIL_AGAIN = 'Cannot verify email again',
  EMAIL_MISMATCH = 'Email mismatch',
  PHONE_IN_USE = 'Email Address / Phone number in use',
  BVN_MISMATCH = 'BVN mismatch',
  PHONE_NUMBER_NOT_FOUND = 'Phone number not found',
  PIN_NOT_SET = 'Failed to set pin',
  KYC_NOT_INITIATED = 'You have not started your KYC process',
  ACCOUNT_ALREADY_EXISTS = 'Account already exists',
  BVN_IS_A_MUST_BEFORE_FACE = 'You must verify BVN before verifying your face',
  FACE_DOES_NOT_MATCH = 'We could not verify your face: Face does not match. Try again',
  EMAIL_MUST_BE_VERIFIED = 'Email must be verified',
  EMAIL_NOT_SENT = 'Could not send email',
  USER_DETAILS_INCOMPLETE = 'User details incomplete',
  USER_NOT_DONE_KYC = 'User has not done KYC',
  USER_BVN_NOT_FOUND = 'User BVN not found',
  USER_ADDRESS_NOT_AVAILABLE = 'User residential address not set',
  CARD_REQUEST_NOT_FOUND = 'Card request not found',
  BVN_ALREADY_EXISTS = 'BVN has already been used by another user',
  NO_CONTACT_INFO_ON_ACCOUNT = 'No contact information on account',
  INSUFFICIENT_BALANCE = 'Insufficient account balance',
  BENEFICIARY_NOT_FOUND = 'Beneficiary not found',
  TRANSACTION_FAILED = 'Transaction failed',
  BUNDLE_NOT_FOUND = 'Bundle not found',
}
