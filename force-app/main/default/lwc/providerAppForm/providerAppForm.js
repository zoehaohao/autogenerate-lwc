import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppForm extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track isSubmitting = false;
    @track errors = {};

    // Page 1 - Personal Information
    @track firstName = '';
    @track lastName = '';
    @track middleName = '';
    @track dateOfBirth = '';
    @track ssn = '';
    @track gender = '';
    @track address = '';
    @track city = '';
    @track state = '';
    @track zipCode = '';

    // Page 2 - Contact Details
    @track primaryPhone = '';
    @track secondaryPhone = '';
    @track email = '';
    @track confirmEmail = '';
    @track preferredContactMethod = '';
    @track bestTimeToContact = '';
    @track emergencyContactName = '';
    @track emergencyContactPhone = '';
    @track emergencyContactRelationship = '';

    // Page 3 - Additional Information
    @track providerType = '';
    @track licenseNumber = '';
    @track licenseExpirationDate = '';
    @track yearsOfExperience = '';
    @track educationLevel = '';
    @track specializations = [];
    @track professionalSummary = '';
    @track previousEmployer = '';
    @track employmentStartDate = '';
    @track employmentEndDate = '';
    @track certificationAgreement = false;

    // Options for dropdowns and radio groups
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
        { label: 'Georgia', value: 'GA' }
    ];

    contactMethodOptions = [
        { label: 'Phone', value: 'Phone' },
        { label: 'Email', value: 'Email' },
        { label: 'Text Message', value: 'Text' }
    ];

    timeOptions = [
        { label: 'Morning (8 AM - 12 PM)', value: 'Morning' },
        { label: 'Afternoon (12 PM - 5 PM)', value: 'Afternoon' },
        { label: 'Evening (5 PM - 8 PM)', value: 'Evening' }
    ];

    providerTypeOptions = [
        { label: 'Healthcare Provider', value: 'Healthcare' },
        { label: 'Mental Health Provider', value: 'Mental Health' },
        { label: 'Specialist', value: 'Specialist' },
        { label: 'General Practitioner', value: 'General' }
    ];

    educationLevelOptions = [
        { label: 'High School', value: 'High School' },
        { label: 'Associate Degree', value: 'Associate' },
        { label: 'Bachelor Degree', value: 'Bachelor' },
        { label: 'Master Degree', value: 'Master' },
        { label: 'Doctorate', value: 'Doctorate' }
    ];

    specializationOptions = [
        { label: 'Cardiology', value: 'Cardiology' },
        { label: 'Dermatology', value: 'Dermatology' },
        { label: 'Neurology', value: 'Neurology' },
        { label: 'Orthopedics', value: 'Orthopedics' },
        { label: 'Pediatrics', value: 'Pediatrics' },
        { label: 'Psychiatry', value: 'Psychiatry' }
    ];

    // Computed properties for page visibility
    get isPage1() {
        return this.currentPage === 1;
    }

    get isPage2() {
        return this.currentPage === 2;
    }

    get isPage3() {
        return this.currentPage === 3;
    }

    get currentPageString() {
        return this.currentPage.toString();
    }

    // CSS classes for error states
    get firstNameClass() {
        return this.errors.firstName ? 'slds-has-error' : '';
    }

    get lastNameClass() {
        return this.errors.lastName ? 'slds-has-error' : '';
    }

    get dateOfBirthClass() {
        return this.errors.dateOfBirth ? 'slds-has-error' : '';
    }

    get ssnClass() {
        return this.errors.ssn ? 'slds-has-error' : '';
    }

    get genderClass() {
        return this.errors.gender ? 'slds-has-error' : '';
    }

    get addressClass() {
        return this.errors.address ? 'slds-has-error' : '';
    }

    get cityClass() {
        return this.errors.city ? 'slds-has-error' : '';
    }

    get stateClass() {
        return this.errors.state ? 'slds-has-error' : '';
    }

    get zipCodeClass() {
        return this.errors.zipCode ? 'slds-has-error' : '';
    }

    get primaryPhoneClass() {
        return this.errors.primaryPhone ? 'slds-has-error' : '';
    }

    get emailClass() {
        return this.errors.email ? 'slds-has-error' : '';
    }

    get confirmEmailClass() {
        return this.errors.confirmEmail ? 'slds-has-error' : '';
    }

    get preferredContactMethodClass() {
        return this.errors.preferredContactMethod ? 'slds-has-error' : '';
    }

    get bestTimeToContactClass() {
        return this.errors.bestTimeToContact ? 'slds-has-error' : '';
    }

    get emergencyContactNameClass() {
        return this.errors.emergencyContactName ? 'slds-has-error' : '';
    }

    get emergencyContactPhoneClass() {
        return this.errors.emergencyContactPhone ? 'slds-has-error' : '';
    }

    get emergencyContactRelationshipClass() {
        return this.errors.emergencyContactRelationship ? 'slds-has-error' : '';
    }

    get providerTypeClass() {
        return this.errors.providerType ? 'slds-has-error' : '';
    }

    get licenseNumberClass() {
        return this.errors.licenseNumber ? 'slds-has-error' : '';
    }

    get licenseExpirationDateClass() {
        return this.errors.licenseExpirationDate ? 'slds-has-error' : '';
    }

    get yearsOfExperienceClass() {
        return this.errors.yearsOfExperience ? 'slds-has-error' : '';
    }

    get educationLevelClass() {
        return this.errors.educationLevel ? 'slds-has-error' : '';
    }

    get specializationsClass() {
        return this.errors.specializations ? 'slds-has-error' : '';
    }

    get professionalSummaryClass() {
        return this.errors.professionalSummary ? 'slds-has-error' : '';
    }

    get certificationAgreementClass() {
        return this.errors.certificationAgreement ? 'slds-has-error' : '';
    }

    // Event handlers
    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        this[field] = value;
        
        // Clear error when user starts typing
        if (this.errors[field]) {
            this.errors = { ...this.errors };
            delete this.errors[field];
        }
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            this.currentPage++;
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleCancel() {
        // Reset form
        this.resetForm();
        this.showToast('Cancelled', 'Form has been cancelled', 'info');
    }

    handleSubmit() {
        if (this.validateCurrentPage()) {
            this.isSubmitting = true;
            this.submitForm();
        }
    }

    // Validation methods
    validateCurrentPage() {
        let isValid = true;
        this.errors = {};

        if (this.currentPage === 1) {
            isValid = this.validatePage1();
        } else if (this.currentPage === 2) {
            isValid = this.validatePage2();
        } else if (this.currentPage === 3) {
            isValid = this.validatePage3();
        }

        return isValid;
    }

    validatePage1() {
        let isValid = true;
        const errors = {};

        // Required field validation
        if (!this.firstName || this.firstName.trim() === '') {
            errors.firstName = 'First Name is required';
            isValid = false;
        }

        if (!this.lastName || this.lastName.trim() === '') {
            errors.lastName = 'Last Name is required';
            isValid = false;
        }

        if (!this.dateOfBirth) {
            errors.dateOfBirth = 'Date of Birth is required';
            isValid = false;
        } else {
            // Validate age (must be 18 or older)
            const today = new Date();
            const birthDate = new Date(this.dateOfBirth);
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 18) {
                errors.dateOfBirth = 'Must be 18 years or older';
                isValid = false;
            }
        }

        if (!this.ssn || this.ssn.trim() === '') {
            errors.ssn = 'Social Security Number is required';
            isValid = false;
        } else if (!this.validateSSN(this.ssn)) {
            errors.ssn = 'Invalid SSN format. Must be 9 digits';
            isValid = false;
        }

        if (!this.gender) {
            errors.gender = 'Gender is required';
            isValid = false;
        }

        if (!this.address || this.address.trim() === '') {
            errors.address = 'Address is required';
            isValid = false;
        }

        if (!this.city || this.city.trim() === '') {
            errors.city = 'City is required';
            isValid = false;
        }

        if (!this.state) {
            errors.state = 'State is required';
            isValid = false;
        }

        if (!this.zipCode || this.zipCode.trim() === '') {
            errors.zipCode = 'ZIP Code is required';
            isValid = false;
        } else if (!this.validateZipCode(this.zipCode)) {
            errors.zipCode = 'Invalid ZIP code format';
            isValid = false;
        }

        this.errors = errors;
        return isValid;
    }

    validatePage2() {
        let isValid = true;
        const errors = {};

        if (!this.primaryPhone || this.primaryPhone.trim() === '') {
            errors.primaryPhone = 'Primary Phone is required';
            isValid = false;
        } else if (!this.validatePhone(this.primaryPhone)) {
            errors.primaryPhone = 'Invalid phone number format';
            isValid = false;
        }

        if (!this.email || this.email.trim() === '') {
            errors.email = 'Email Address is required';
            isValid = false;
        } else if (!this.validateEmail(this.email)) {
            errors.email = 'Invalid email format';
            isValid = false;
        }

        if (!this.confirmEmail || this.confirmEmail.trim() === '') {
            errors.confirmEmail = 'Confirm Email Address is required';
            isValid = false;
        } else if (this.email !== this.confirmEmail) {
            errors.confirmEmail = 'Email addresses do not match';
            isValid = false;
        }

        if (!this.preferredContactMethod) {
            errors.preferredContactMethod = 'Preferred Contact Method is required';
            isValid = false;
        }

        if (!this.bestTimeToContact) {
            errors.bestTimeToContact = 'Best Time to Contact is required';
            isValid = false;
        }

        if (!this.emergencyContactName || this.emergencyContactName.trim() === '') {
            errors.emergencyContactName = 'Emergency Contact Name is required';
            isValid = false;
        }

        if (!this.emergencyContactPhone || this.emergencyContactPhone.trim() === '') {
            errors.emergencyContactPhone = 'Emergency Contact Phone is required';
            isValid = false;
        } else if (!this.validatePhone(this.emergencyContactPhone)) {
            errors.emergencyContactPhone = 'Invalid phone number format';
            isValid = false;
        }

        if (!this.emergencyContactRelationship || this.emergencyContactRelationship.trim() === '') {
            errors.emergencyContactRelationship = 'Relationship to Emergency Contact is required';
            isValid = false;
        }

        this.errors = errors;
        return isValid;
    }

    validatePage3() {
        let isValid = true;
        const errors = {};

        if (!this.providerType) {
            errors.providerType = 'Provider Type is required';
            isValid = false;
        }

        if (!this.licenseNumber || this.licenseNumber.trim() === '') {
            errors.licenseNumber = 'License Number is required';
            isValid = false;
        }

        if (!this.licenseExpirationDate) {
            errors.licenseExpirationDate = 'License Expiration Date is required';
            isValid = false;
        } else {
            // Validate license is not expired
            const today = new Date();
            const expirationDate = new Date(this.licenseExpirationDate);
            if (expirationDate <= today) {
                errors.licenseExpirationDate = 'License must not be expired';
                isValid = false;
            }
        }

        if (!this.yearsOfExperience || this.yearsOfExperience === '') {
            errors.yearsOfExperience = 'Years of Experience is required';
            isValid = false;
        } else if (this.yearsOfExperience < 0 || this.yearsOfExperience > 50) {
            errors.yearsOfExperience = 'Years of Experience must be between 0 and 50';
            isValid = false;
        }

        if (!this.educationLevel) {
            errors.educationLevel = 'Education Level is required';
            isValid = false;
        }

        if (!this.specializations || this.specializations.length === 0) {
            errors.specializations = 'At least one specialization is required';
            isValid = false;
        }

        if (!this.professionalSummary || this.professionalSummary.trim() === '') {
            errors.professionalSummary = 'Professional Summary is required';
            isValid = false;
        } else if (this.professionalSummary.length < 50) {
            errors.professionalSummary = 'Professional Summary must be at least 50 characters';
            isValid = false;
        }

        if (!this.certificationAgreement) {
            errors.certificationAgreement = 'You must certify that all information is accurate';
            isValid = false;
        }

        // Cross-field validation for employment dates
        if (this.employmentStartDate && this.employmentEndDate) {
            if (new Date(this.employmentEndDate) <= new Date(this.employmentStartDate)) {
                errors.employmentEndDate = 'Employment End Date must be after Start Date';
                isValid = false;
            }
        }

        this.errors = errors;
        return isValid;
    }

    // Utility validation methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    validateSSN(ssn) {
        const ssnRegex = /^\d{9}$/;
        return ssnRegex.test(ssn.replace(/\D/g, ''));
    }

    validateZipCode(zipCode) {
        const zipRegex = /^\d{5}$/;
        return zipRegex.test(zipCode);
    }

    // Form submission
    async submitForm() {
        try {
            // Simulate API call
            await this.delay(2000);
            
            this.showToast('Success', 'Provider application submitted successfully!', 'success');
            this.resetForm();
        } catch (error) {
            this.showToast('Error', 'Failed to submit application. Please try again.', 'error');
        } finally {
            this.isSubmitting = false;
        }
    }

    resetForm() {
        // Reset all form fields
        this.currentPage = 1;
        this.firstName = '';
        this.lastName = '';
        this.middleName = '';
        this.dateOfBirth = '';
        this.ssn = '';
        this.gender = '';
        this.address = '';
        this.city = '';
        this.state = '';
        this.zipCode = '';
        this.primaryPhone = '';
        this.secondaryPhone = '';
        this.email = '';
        this.confirmEmail = '';
        this.preferredContactMethod = '';
        this.bestTimeToContact = '';
        this.emergencyContactName = '';
        this.emergencyContactPhone = '';
        this.emergencyContactRelationship = '';
        this.providerType = '';
        this.licenseNumber = '';
        this.licenseExpirationDate = '';
        this.yearsOfExperience = '';
        this.educationLevel = '';
        this.specializations = [];
        this.professionalSummary = '';
        this.previousEmployer = '';
        this.employmentStartDate = '';
        this.employmentEndDate = '';
        this.certificationAgreement = false;
        this.errors = {};
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
