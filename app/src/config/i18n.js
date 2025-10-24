import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: {
      // Common
      app_name: 'Annam Mithra',
      tagline: 'Share Food, Share Love',
      continue: 'Continue',
      skip: 'Skip',
      next: 'Next',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Something went wrong',
      success: 'Success!',
      
      // Authentication
      welcome: 'Welcome to Annam Mithra',
      welcome_desc: 'Join us in eliminating food waste and feeding those in need',
      login: 'Login',
      signup: 'Sign Up',
      phone_number: 'Phone Number',
      enter_phone: 'Enter your phone number',
      send_otp: 'Send OTP',
      verify_otp: 'Verify OTP',
      enter_otp: 'Enter 6-digit OTP',
      google_signin: 'Continue with Google',
      or: 'OR',
      
      // Role Selection
      select_role: 'Select Your Role',
      role_desc: 'Choose how you want to contribute',
      donor: 'Donor',
      donor_desc: 'I want to donate surplus food',
      receiver: 'Receiver',
      receiver_desc: 'I need food assistance',
      volunteer: 'Volunteer',
      volunteer_desc: 'I want to help with deliveries',
      
      // Receiver Type
      select_type: 'Select Type',
      individual: 'Individual',
      ngo: 'NGO / Organization',
      food_preference: 'Food Preference',
      veg: 'Vegetarian',
      non_veg: 'Non-Vegetarian',
      both: 'Both',
    }
  },
  ta: {
    translation: {
      // Common
      app_name: 'அன்ன மித்ரா',
      tagline: 'உணவைப் பகிருங்கள், அன்பைப் பகிருங்கள்',
      continue: 'தொடரவும்',
      skip: 'தவிர்க்கவும்',
      next: 'அடுத்தது',
      submit: 'சமர்ப்பிக்கவும்',
      cancel: 'ரத்துசெய்',
      save: 'சேமி',
      delete: 'நீக்கு',
      edit: 'திருத்து',
      loading: 'ஏற்றுகிறது...',
      error: 'ஏதோ தவறு ஏற்பட்டது',
      success: 'வெற்றி!',
      
      // Authentication
      welcome: 'அன்ன மித்ராவுக்கு வரவேற்கிறோம்',
      welcome_desc: 'உணவு வீணாவதை நீக்கி தேவைப்படுவோருக்கு உணவளிக்க எங்களுடன் சேருங்கள்',
      login: 'உள்நுழைவு',
      signup: 'பதிவு செய்க',
      phone_number: 'தொலைபேசி எண்',
      enter_phone: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
      send_otp: 'OTP அனுப்பு',
      verify_otp: 'OTP சரிபார்க்கவும்',
      enter_otp: '6 இலக்க OTP உள்ளிடவும்',
      google_signin: 'Google மூலம் தொடரவும்',
      or: 'அல்லது',
      
      // Role Selection
      select_role: 'உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்',
      role_desc: 'நீங்கள் எவ்வாறு பங்களிக்க விரும்புகிறீர்கள் என்பதைத் தேர்வுசெய்க',
      donor: 'நன்கொடையாளர்',
      donor_desc: 'நான் உபரி உணவை தானம் செய்ய விரும்புகிறேன்',
      receiver: 'பெறுநர்',
      receiver_desc: 'எனக்கு உணவு உதவி தேவை',
      volunteer: 'தொண்டர்',
      volunteer_desc: 'டெலிவரியில் உதவ விரும்புகிறேன்',
      
      // Receiver Type
      select_type: 'வகையைத் தேர்ந்தெடுக்கவும்',
      individual: 'தனிநபர்',
      ngo: 'என்ஜிஓ / அமைப்பு',
      food_preference: 'உணவு விருப்பம்',
      veg: 'சைவம்',
      non_veg: 'அசைவம்',
      both: 'இரண்டும்',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Load saved language preference
AsyncStorage.getItem('userLanguage').then((lang) => {
  if (lang) {
    i18n.changeLanguage(lang);
  }
});

export default i18n;
