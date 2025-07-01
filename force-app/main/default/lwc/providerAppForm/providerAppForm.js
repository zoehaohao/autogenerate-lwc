import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppForm extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track errorMessages = [];
    
    // Personal Information
    @track firstName = '';
    @track middleName = '';
    @track lastName = '';
    @track suffix = '';
    @track dateOfBirth = '';
    @track gender = '';
    @track ssn = '';
    
    // Contact Details
    @track streetAddress = '';
    @track city = '';
    @track state = '';
    @track zipCode = '';
    @track primaryPhone = '';
    @track secondaryPhone = '';
    @track email = '';
    @track confirmEmail = '';
    
    // Professional Information
    @track providerType = '';
    @track specialty = '';
    @track licenseNumber = '';
    @track licenseState = '';
    @track licenseExpiration = '';
    @track deaNumber = '';
    @track npiNumber = '';
    @track yearsExperience = '';
    @track medicalSchool = '';
    @track graduationYear = '';
    @track residencyProgram = '';
    
    // Additional Information
    @track practiceName = '';
    @track practiceAddress = '';
    @track practicePhone = '';
    @track practiceFax = '';
    @track licenseDiscipline = '';
    @track disciplineDetails = '';
    @track felonyConviction = '';
    @track felonyDetails = '';
    @track malpracticeInsurance = '';
    @track insuranceCarrier = '';
    @track policyNumber = '';
    @track coverageAmount = '';
    @track policyExpiration = '';
    @track additionalComments = '';
    @track agreementAccepted = false;
    
    // Validation tracking
    @track fieldErrors = {};

    // Options for dropdowns
    genderOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other' },
        { label: 'Prefer not to say', value: 'Prefer not to say' }
    ];

    stateOptions = [
        { label: 'Alabama', value: 'AL' },
        { label: 'Alaska', value: 'AK' },
        { label: 'Arizona', value: 'AZ' },
        { label: 'Arkansas', value: 'AR' },
        { label: 'California', value: 'CA' },
        { label: 'Colorado', value: 'CO' },
        { label: 'Connecticut', value: 'CT' },
        { label: 'Delaware', value: 'DE' },
        { label: 'Florida', value: 'FL' },
        { label: 'Georgia', value: 'GA' },
        { label: 'Hawaii', value: 'HI' },
        { label: 'Idaho', value: 'ID' },
        { label: 'Illinois', value: 'IL' },
        { label: 'Indiana', value: 'IN' },
        { label: 'Iowa', value: 'IA' },
        { label: 'Kansas', value: 'KS' },
        { label: 'Kentucky', value: 'KY' },
        { label: 'Louisiana', value: 'LA' },
        { label: 'Maine', value: 'ME' },
        { label: 'Maryland', value: 'MD' },
        { label: 'Massachusetts', value: 'MA' },
        { label: 'Michigan', value: 'MI' },
        { label: 'Minnesota', value: 'MN' },
        { label: 'Mississippi', value: 'MS' },
        { label: 'Missouri', value: 'MO' },
        { label: 'Montana', value: 'MT' },
        { label: 'Nebraska', value: 'NE' },
        { label: 'Nevada', value: 'NV' },
        { label: 'New Hampshire', value: 'NH' },
        { label: 'New Jersey', value: 'NJ' },
        { label: 'New Mexico', value: 'NM' },
        { label: 'New York', value: 'NY' },
        { label: 'North Carolina', value: 'NC' },
        { label: 'North Dakota', value: 'ND' },
        { label: 'Ohio', value: 'OH' },
        { label: 'Oklahoma', value: 'OK' },
        { label: 'Oregon', value: 'OR' },
        { label: 'Pennsylvania', value: 'PA' },
        { label: 'Rhode Island', value: 'RI' },
        { label: 'South Carolina', value: 'SC' },
        { label: 'South Dakota', value: 'SD' },
        { label: 'Tennessee', value: 'TN' },
        { label: 'Texas', value: 'TX' },
        { label: 'Utah', value: 'UT' },
        { label: 'Vermont', value: 'VT' },
        { label: 'Virginia', value: 'VA' },
        { label: 'Washington', value: 'WA' },
        { label: 'West Virginia', value: 'WV' },
        { label: 'Wisconsin', value: 'WI' },
        { label: 'Wyoming', value: 'WY' }
    ];

    providerTypeOptions = [
        { label: 'Physician (MD)', value: 'MD' },
        { label: 'Physician (DO)', value: 'DO' },
        { label: 'Nurse Practitioner', value: 'NP' },
        { label: 'Physician Assistant', value: 'PA' },
        { label: 'Dentist', value: 'DDS' },
        { label: 'Psychologist', value: 'PhD' },
        { label: 'Physical Therapist', value: 'PT' },
        { label: 'Occupational Therapist', value: 'OT' },
        { label: 'Other', value: 'Other' }
    ];

    specialtyOptions = [
        { label: 'Family Medicine', value: 'Family Medicine' },
        { label: 'Internal Medicine', value: 'Internal Medicine' },
        { label: 'Pediatrics', value: 'Pediatrics' },
        { label: 'Cardiology', value: 'Cardiology' },
        { label: 'Dermatology', value: 'Dermatology' },
        { label: 'Emergency Medicine', value: 'Emergency Medicine' },
        { label: 'Gastroenterology', value: 'Gastroenterology' },
        { label: 'Neurology', value: 'Neurology' },
        { label: 'Obstetrics & Gynecology', value: 'OB/GYN' },
        { label: 'Oncology', value: 'Oncology' },
        { label: 'Orthopedics', value: 'Orthopedics' },
        { label: 'Psychiatry', value: 'Psychiatry' },
        { label: 'Radiology', value: 'Radiology' },
        { label: 'Surgery', value: 'Surgery' },
        { label: 'Urology', value: 'Urology' },
        { label: 'Other', value: 'Other' }
    ];

    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    // Computed properties
    get currentPageString() {
        return this.currentPage.toString();
    }

    get isPage1() {
        return this.currentPage === 1;
    }

    get isPage2() {
        return this.currentPage === 2;
    }

    get isPage3() {
        return this.currentPage === 3;
    }

    get isPage4() {
        return this.currentPage === 4;
    }

    get isPage5() {
        return this.currentPage === 5;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === 5;
    }

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    get maxBirthDate() {
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return maxDate.toISOString().split('T')[0];
    }

    get todayDate() {
        return new Date().toISOString().split('T')[0];
    }

    get currentYear() {
        return new Date().getFullYear();
    }

    get showDisciplineDetails() {
        return this.licenseDiscipline === 'Yes';
    }

    get showFelonyDetails() {
        return this.felonyConviction === 'Yes';
    }

    get showInsuranceDetails() {
        return this.malpracticeInsurance === 'Yes';
    }

    get submitDisabled() {
        return !this.agreementAccepted;
    }

    get fullName() {
        let name = this.firstName;
        if (this.middleName) name += ' ' + this.middleName;
        name += ' ' + this.lastName;
        if (this.suffix) name += ' ' + this.suffix;
        return name;
    }

    get formattedDateOfBirth() {
        if (!this.dateOfBirth) return '';
        return new Date(this.dateOfBirth).toLocaleDateString();
    }

    get ssnLast4() {
        if (!this.ssn || this.ssn.length < 4) return '';
        return this.ssn.slice(-4);
    }

    get fullAddress() {
        return `${this.streetAddress}, ${this.city}, ${this.state} ${this.zipCode}`;
    }

    get formattedPrimaryPhone() {
        if (!this.primaryPhone) return '';
        const cleaned = this.primaryPhone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
        }
        return this.primaryPhone;
    }

    // CSS Classes for validation
    get firstNameClass() {
        return this.fieldErrors.firstName ? 'slds-has-error' : '';
    }

    get lastNameClass() {
        return this.fieldErrors.lastName ? 'slds-has-error' : '';
    }

    get dateOfBirthClass() {
        return this.fieldErrors.dateOfBirth ? 'slds-has-error' : '';
    }

    get genderClass() {
        return this.fieldErrors.gender ? 'slds-has-error' : '';
    }

    get ssnClass() {
        return this.fieldErrors.ssn ? 'slds-has-error' : '';
    }

    get streetAddressClass() {
        return this.fieldErrors.streetAddress ? 'slds-has-error' : '';
    }

    get cityClass() {
        return this.fieldErrors.city ? 'slds-has-error' : '';
    }

    get stateClass() {
        return this.fieldErrors.state ? 'slds-has-error' : '';
    }

    get zipCodeClass() {
        return this.fieldErrors.zipCode ? 'slds-has-error' : '';
    }

    get primaryPhoneClass() {
        return this.fieldErrors.primaryPhone ? 'slds-has-error' : '';
    }

    get emailClass() {
        return this.fieldErrors.email ? 'slds-has-error' : '';
    }

    get confirmEmailClass() {
        return this.fieldErrors.confirmEmail ? 'slds-has-error' : '';
    }

    get providerTypeClass() {
        return this.fieldErrors.providerType ? 'slds-has-error' : '';
    }

    get specialtyClass() {
        return this.fieldErrors.specialty ? 'slds-has-error' : '';
    }

    get licenseNumberClass() {
        return this.fieldErrors.licenseNumber ? 'slds-has-error' : '';
    }

    get licenseStateClass() {
        return this.fieldErrors.licenseState ? 'slds-has-error' : '';
    }

    get licenseExpirationClass() {
        return this.fieldErrors.licenseExpiration ? 'slds-has-error' : '';
    }

    get npiNumberClass() {
        return this.fieldErrors.npiNumber ? 'slds-has-error' : '';
    }

    get yearsExperienceClass() {
        return this.fieldErrors.yearsExperience ? 'slds-has-error' : '';
    }

    get medicalSchoolClass() {
        return this.fieldErrors.medicalSchool ? 'slds-has-error' : '';
    }

    get graduationYearClass() {
        return this.fieldErrors.graduationYear ? 'slds-has-error' : '';
    }

    get residencyProgramClass() {
        return this.fieldErrors.residencyProgram ? 'slds-has-error' : '';
    }

    get practiceNameClass() {
        return this.fieldErrors.practiceName ? 'slds-has-error' : '';
    }

    get practiceAddressClass() {
        return this.fieldErrors.practiceAddress ? 'slds-has-error' : '';
    }

    get practicePhoneClass() {
        return this.fieldErrors.practicePhone ? 'slds-has-error' : '';
    }

    get licenseDisciplineClass() {
        return this.fieldErrors.licenseDiscipline ? 'slds-has-error' : '';
    }

    get disciplineDetailsClass() {
        return this.fieldErrors.disciplineDetails ? 'slds-has-error' : '';
    }

    get felonyConvictionClass() {
        return this.fieldErrors.felonyConviction ? 'slds-has-error' : '';
    }

    get felonyDetailsClass() {
        return this.fieldErrors.felonyDetails ? 'slds-has-error' : '';
    }

    get malpracticeInsuranceClass() {
        return this.fieldErrors.malpracticeInsurance ? 'slds-has-error' : '';
    }

    get insuranceCarrierClass() {
        return this.fieldErrors.insuranceCarrier ? 'slds-has-error' : '';
    }

    get policyNumberClass() {
        return this.fieldErrors.policyNumber ? 'slds-has-error' : '';
    }

    get coverageAmountClass() {
        return this.fieldErrors.coverageAmount ? 'slds-has-error' : '';
    }

    get policyExpirationClass() {
        return this.fieldErrors.policyExpiration ? 'slds-has-error' : '';
    }

    get agreementAcceptedClass() {
        return this.fieldErrors.agreementAccepted ? 'slds-has-error' : '';
    }

    // Event Handlers
    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        this[field] = value;
        
        // Clear field error when user starts typing
        if (this.fieldErrors[field]) {
            this.fieldErrors = { ...this.fieldErrors };
            delete this.fieldErrors[field];
        }
        
        // Format SSN
        if (field === 'ssn') {
            this.formatSSN(event);
        }
        
        // Format phone numbers
        if (field === 'primaryPhone' || field === 'secondaryPhone' || field === 'practicePhone' || field === 'practiceFax') {
            this.formatPhone(event);
        }
    }

    formatSSN(event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = value.substring(0,3) + '-' + value.substring(3,5) + '-' + value.substring(5,9);
        } else if (value.length >= 3) {
            value = value.substring(0,3) + '-' + value.substring(3,5);
        }
        this.ssn = value;
    }

    formatPhone(event) {
        const field = event.target.dataset.field;
        let value = event.target.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = '(' + value.substring(0,3) + ') ' + value.substring(3,6) + '-' + value.substring(6,10);
        } else if (value.length >= 3) {
            value = '(' + value.substring(0,3) + ') ' + value.substring(3,6);
        }
        this[field] = value;
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            this.currentPage++;
            this.scrollToTop();
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.scrollToTop();
        }
    }

    handleCancel() {
        if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
            this.resetForm();
        }
    }

    handleSubmit() {
        if (this.validateAllPages()) {
            this.submitApplication();
        }
    }

    scrollToTop() {
        const element = this.template.querySelector('.slds-card');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Validation Methods
    validateCurrentPage() {
        this.errorMessages = [];
        this.fieldErrors = {};
        let isValid = true;

        switch (this.currentPage) {
            case 1:
                isValid = this.validatePage1();
                break;
            case 2:
                isValid = this.validatePage2();
                break;
            case 3:
                isValid = this.validatePage3();
                break;
            case 4:
                isValid = this.validatePage4();
                break;
            case 5:
                isValid = this.validatePage5();
                break;
        }

        return isValid;
    }

    validatePage1() {
        let isValid = true;

        // Required field validation
        if (!this.firstName || this.firstName.trim() === '') {
            this.addFieldError('firstName', 'First Name is required');
            isValid = false;
        }

        if (!this.lastName || this.lastName.trim() === '') {
            this.addFieldError('lastName', 'Last Name is required');
            isValid = false;
        }

        if (!this.dateOfBirth) {
            this.addFieldError('dateOfBirth', 'Date of Birth is required');
            isValid = false;
        } else {
            // Validate age (must be at least 18)
            const birthDate = new Date(this.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 18 || (age === 18 && today < new Date(birthDate.setFullYear(today.getFullYear())))) {
                this.addFieldError('dateOfBirth', 'Must be at least 18 years old');
                isValid = false;
            }
        }

        if (!this.gender) {
            this.addFieldError('gender', 'Gender is required');
            isValid = false;
        }

        if (!this.ssn || this.ssn.trim() === '') {
            this.addFieldError('ssn', 'Social Security Number is required');
            isValid = false;
        } else if (!this.validateSSN(this.ssn)) {
            this.addFieldError('ssn', 'Please enter a valid 9-digit SSN');
            isValid = false;
        }

        return isValid;
    }

    validatePage2() {
        let isValid = true;

        // Address validation
        if (!this.streetAddress || this.streetAddress.trim() === '') {
            this.addFieldError('streetAddress', 'Street Address is required');
            isValid = false;
        }

        if (!this.city || this.city.trim() === '') {
            this.addFieldError('city', 'City is required');
            isValid = false;
        }

        if (!this.state) {
            this.addFieldError('state', 'State is required');
            isValid = false;
        }

        if (!this.zipCode || this.zipCode.trim() === '') {
            this.addFieldError('zipCode', 'ZIP Code is required');
            isValid = false;
        } else if (!this.validateZipCode(this.zipCode)) {
            this.addFieldError('zipCode', 'Please enter a valid ZIP code');
            isValid = false;
        }

        // Contact validation
        if (!this.primaryPhone || this.primaryPhone.trim() === '') {
            this.addFieldError('primaryPhone', 'Primary Phone is required');
            isValid = false;
        } else if (!this.validatePhone(this.primaryPhone)) {
            this.addFieldError('primaryPhone', 'Please enter a valid 10-digit phone number');
            isValid = false;
        }

        if (!this.email || this.email.trim() === '') {
            this.addFieldError('email', 'Email Address is required');
            isValid = false;
        } else if (!this.validateEmail(this.email)) {
            this.addFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!this.confirmEmail || this.confirmEmail.trim() === '') {
            this.addFieldError('confirmEmail', 'Confirm Email Address is required');
            isValid = false;
        } else if (this.email !== this.confirmEmail) {
            this.addFieldError('confirmEmail', 'Email addresses do not match');
            isValid = false;
        }

        return isValid;
    }

    validatePage3() {
        let isValid = true;

        if (!this.providerType) {
            this.addFieldError('providerType', 'Provider Type is required');
            isValid = false;
        }

        if (!this.specialty) {
            this.addFieldError('specialty', 'Specialty is required');
            isValid = false;
        }

        if (!this.licenseNumber || this.licenseNumber.trim() === '') {
            this.addFieldError('licenseNumber', 'Medical License Number is required');
            isValid = false;
        }

        if (!this.licenseState) {
            this.addFieldError('licenseState', 'License State is required');
            isValid = false;
        }

        if (!this.licenseExpiration) {
            this.addFieldError('licenseExpiration', 'License Expiration Date is required');
            isValid = false;
        } else if (new Date(this.licenseExpiration) <= new Date()) {
            this.addFieldError('licenseExpiration', 'License must not be expired');
            isValid = false;
        }

        if (!this.npiNumber || this.npiNumber.trim() === '') {
            this.addFieldError('npiNumber', 'NPI Number is required');
            isValid = false;
        } else if (!this.validateNPI(this.npiNumber)) {
            this.addFieldError('npiNumber', 'Please enter a valid 10-digit NPI number');
            isValid = false;
        }

        if (!this.yearsExperience || this.yearsExperience === '') {
            this.addFieldError('yearsExperience', 'Years of Experience is required');
            isValid = false;
        } else if (parseInt(this.yearsExperience) < 0 || parseInt(this.yearsExperience) > 60) {
            this.addFieldError('yearsExperience', 'Years of Experience must be between 0 and 60');
            isValid = false;
        }

        if (!this.medicalSchool || this.medicalSchool.trim() === '') {
            this.addFieldError('medicalSchool', 'Medical School is required');
            isValid = false;
        }

        if (!this.graduationYear || this.graduationYear === '') {
            this.addFieldError('graduationYear', 'Graduation Year is required');
            isValid = false;
        } else {
            const year = parseInt(this.graduationYear);
            if (year < 1950 || year > this.currentYear) {
                this.addFieldError('graduationYear', `Graduation Year must be between 1950 and ${this.currentYear}`);
                isValid = false;
            }
        }

        if (!this.residencyProgram || this.residencyProgram.trim() === '') {
            this.addFieldError('residencyProgram', 'Residency Program is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage4() {
        let isValid = true;

        if (!this.practiceName || this.practiceName.trim() === '') {
            this.addFieldError('practiceName', 'Practice/Hospital Name is required');
            isValid = false;
        }

        if (!this.practiceAddress || this.practiceAddress.trim() === '') {
            this.addFieldError('practiceAddress', 'Practice Address is required');
            isValid = false;
        }

        if (!this.practicePhone || this.practicePhone.trim() === '') {
            this.addFieldError('practicePhone', 'Practice Phone is required');
            isValid = false;
        } else if (!this.validatePhone(this.practicePhone)) {
            this.addFieldError('practicePhone', 'Please enter a valid phone number');
            isValid = false;
        }

        if (!this.licenseDiscipline) {
            this.addFieldError('licenseDiscipline', 'Please answer the license discipline question');
            isValid = false;
        } else if (this.licenseDiscipline === 'Yes' && (!this.disciplineDetails || this.disciplineDetails.trim() === '')) {
            this.addFieldError('disciplineDetails', 'Please provide details about license discipline');
            isValid = false;
        }

        if (!this.felonyConviction) {
            this.addFieldError('felonyConviction', 'Please answer the felony conviction question');
            isValid = false;
        } else if (this.felonyConviction === 'Yes' && (!this.felonyDetails || this.felonyDetails.trim() === '')) {
            this.addFieldError('felonyDetails', 'Please provide details about felony conviction');
            isValid = false;
        }

        if (!this.malpracticeInsurance) {
            this.addFieldError('malpracticeInsurance', 'Please answer the malpractice insurance question');
            isValid = false;
        } else if (this.malpracticeInsurance === 'Yes') {
            if (!this.insuranceCarrier || this.insuranceCarrier.trim() === '') {
                this.addFieldError('insuranceCarrier', 'Insurance Carrier is required');
                isValid = false;
            }
            if (!this.policyNumber || this.policyNumber.trim() === '') {
                this.addFieldError('policyNumber', 'Policy Number is required');
                isValid = false;
            }
            if (!this.coverageAmount || this.coverageAmount.trim() === '') {
                this.addFieldError('coverageAmount', 'Coverage Amount is required');
                isValid = false;
            }
            if (!this.policyExpiration) {
                this.addFieldError('policyExpiration', 'Policy Expiration Date is required');
                isValid = false;
            } else if (new Date(this.policyExpiration) <= new Date()) {
                this.addFieldError('policyExpiration', 'Policy must not be expired');
                isValid = false;
            }
        }

        return isValid;
    }

    validatePage5() {
        let isValid = true;

        if (!this.agreementAccepted) {
            this.addFieldError('agreementAccepted', 'You must agree to the terms and conditions');
            isValid = false;
        }

        return isValid;
    }

    validateAllPages() {
        return this.validatePage1() && this.validatePage2() && this.validatePage3() && this.validatePage4() && this.validatePage5();
    }

    // Utility validation methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        return phoneRegex.test(phone);
    }

    validateSSN(ssn) {
        const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
        return ssnRegex.test(ssn);
    }

    validateZipCode(zip) {
        const zipRegex = /^\d{5}(-\d{4})?$/;
        return zipRegex.test(zip);
    }

    validateNPI(npi) {
        const npiRegex = /^\d{10}$/;
        return npiRegex.test(npi);
    }

    addFieldError(fieldName, message) {
        this.fieldErrors[fieldName] = true;
        this.errorMessages.push(message);
    }

    // Form submission
    async submitApplication() {
        this.isLoading = true;
        
        try {
            // Simulate API call
            await this.delay(2000);
            
            this.showToast('Success', 'Your provider application has been submitted successfully!', 'success');
            this.resetForm();
            
        } catch (error) {
            this.showToast('Error', 'There was an error submitting your application. Please try again.', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    resetForm() {
        // Reset all form fields
        this.currentPage = 1;
        this.firstName = '';
        this.middleName = '';
        this.lastName = '';
        this.suffix = '';
        this.dateOfBirth = '';
        this.gender = '';
        this.ssn = '';
        this.streetAddress = '';
        this.city = '';
        this.state = '';
        this.zipCode = '';
        this.primaryPhone = '';
        this.secondaryPhone = '';
        this.email = '';
        this.confirmEmail = '';
        this.providerType = '';
        this.specialty = '';
        this.licenseNumber = '';
        this.licenseState = '';
        this.licenseExpiration = '';
        this.deaNumber = '';
        this.npiNumber = '';
        this.yearsExperience = '';
        this.medicalSchool = '';
        this.graduationYear = '';
        this.residencyProgram = '';
        this.practiceName = '';
        this.practiceAddress = '';
        this.practicePhone = '';
        this.practiceFax = '';
        this.licenseDiscipline = '';
        this.disciplineDetails = '';
        this.felonyConviction = '';
        this.felonyDetails = '';
        this.malpracticeInsurance = '';
        this.insuranceCarrier = '';
        this.policyNumber = '';
        this.coverageAmount = '';
        this.policyExpiration = '';
        this.additionalComments = '';
        this.agreementAccepted = false;
        this.fieldErrors = {};
        this.errorMessages = [];
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
