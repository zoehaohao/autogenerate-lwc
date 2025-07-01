import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppFormV2 extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track errorMessages = [];

    // Declaration data
    @track declaration = {
        point1: false,
        point2: false,
        point3: false,
        point4: false,
        point5: false
    };

    @track declaringOfficer1 = {
        name: '',
        position: '',
        date: ''
    };

    @track declaringOfficer2 = {
        name: '',
        position: '',
        date: ''
    };

    // Applicant data
    @track applicant = {
        legalName: '',
        acn: '',
        abn: '',
        businessName: ''
    };

    @track registeredAddress = {
        street: '',
        suburb: '',
        state: '',
        postcode: ''
    };

    @track selectedCareTypes = [];

    // Key Personnel data
    @track keyPersonnel1 = {
        title: '',
        name: '',
        formerName: '',
        preferredName: '',
        dateOfBirth: '',
        position: '',
        email: '',
        mobile: '',
        duties: ''
    };

    // Suitability data
    @track suitability = {
        experience: '',
        financialPolicies: '',
        financialStrategy: ''
    };

    @track serviceDetails = {
        service: '',
        period: '',
        recipients: ''
    };

    // Care specific data
    @track careSpecific = {
        residentialPrudential: '',
        residentialReporting: '',
        homeCareSystems: '',
        homeCareTools: '',
        flexibleCareExperience: '',
        flexibleCarePolicies: ''
    };

    // Options
    get stateOptions() {
        return [
            { label: 'Australian Capital Territory', value: 'ACT' },{ label: 'New South Wales', value: 'NSW' },
            { label: 'Northern Territory', value: 'NT' },
            { label: 'Queensland', value: 'QLD' },
            { label: 'South Australia', value: 'SA' },
            { label: 'Tasmania', value: 'TAS' },
            { label: 'Victoria', value: 'VIC' },
            { label: 'Western Australia', value: 'WA' }
        ];
    }

    get titleOptions() {
        return [
            { label: 'Mr', value: 'Mr' },
            { label: 'Mrs', value: 'Mrs' },
            { label: 'Ms', value: 'Ms' },
            { label: 'Dr', value: 'Dr' },
            { label: 'Prof', value: 'Prof' }
        ];
    }

    get careTypeOptions() {
        return [
            { label: 'Residential Care', value: 'residential' },
            { label: 'Home Care', value: 'home' },
            { label: 'Flexible Care', value: 'flexible' }
        ];
    }

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

    get isPage4() {
        return this.currentPage === 4;
    }

    get isPage5() {
        return this.currentPage === 5;
    }

    get currentPageString() {
        return this.currentPage.toString();
    }

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    get showResidentialCare() {
        return this.selectedCareTypes.includes('residential');
    }

    get showHomeCare() {
        return this.selectedCareTypes.includes('home');
    }

    get showFlexibleCare() {
        return this.selectedCareTypes.includes('flexible');
    }

    // Event handlers
    handleDeclarationChange(event) {
        const field = event.target.dataset.field;
        this.declaration[field] = event.target.checked;
    }

    handleDeclaringOfficer1Change(event) {
        const field = event.target.dataset.field;
        this.declaringOfficer1[field] = event.target.value;
    }

    handleDeclaringOfficer2Change(event) {
        const field = event.target.dataset.field;
        this.declaringOfficer2[field] = event.target.value;
    }

    handleApplicantChange(event) {
        const field = event.target.dataset.field;
        this.applicant[field] = event.target.value;
    }

    handleRegisteredAddressChange(event) {
        const field = event.target.dataset.field;
        this.registeredAddress[field] = event.target.value;
    }

    handleCareTypeChange(event) {
        this.selectedCareTypes = event.detail.value;
    }

    handleKeyPersonnel1Change(event) {
        const field = event.target.dataset.field;
        this.keyPersonnel1[field] = event.target.value;
    }

    handleSuitabilityChange(event) {
        const field = event.target.dataset.field;
        this.suitability[field] = event.target.value;
    }

    handleServiceDetailsChange(event) {
        const field = event.target.dataset.field;
        this.serviceDetails[field] = event.target.value;
    }

    handleCareSpecificChange(event) {
        const field = event.target.dataset.field;
        this.careSpecific[field] = event.target.value;
    }

    // Navigation handlers
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
        this.showToast('Cancelled', 'Application cancelled', 'info');
    }

    handleSubmit() {
        if (this.validateCurrentPage()) {
            this.isLoading = true;
            this.submitApplication();
        }
    }

    // Validation methods
    validateCurrentPage() {
        this.errorMessages = [];
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

        // Validate declaration checkboxes
        const requiredDeclarations = ['point1', 'point2', 'point3', 'point4', 'point5'];
        requiredDeclarations.forEach(point => {
            if (!this.declaration[point]) {
                this.errorMessages.push(`Declaration point ${point.slice(-1)} must be acknowledged`);
                isValid = false;
            }
        });

        // Validate declaring officer 1
        if (!this.declaringOfficer1.name) {
            this.errorMessages.push('Declaring Officer 1 name is required');
            isValid = false;
        }
        if (!this.declaringOfficer1.position) {
            this.errorMessages.push('Declaring Officer 1 position is required');
            isValid = false;
        }
        if (!this.declaringOfficer1.date) {
            this.errorMessages.push('Declaring Officer 1 date is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage2() {
        let isValid = true;

        // Validate applicant details
        if (!this.applicant.legalName) {
            this.errorMessages.push('Legal name is required');
            isValid = false;
        }
        if (!this.applicant.acn) {
            this.errorMessages.push('ACN/IAN/ICN is required');
            isValid = false;
        }
        if (!this.applicant.abn) {
            this.errorMessages.push('ABN is required');
            isValid = false;
        }

        // Validate ABN format
        if (this.applicant.abn && !this.validateABN(this.applicant.abn)) {
            this.errorMessages.push('ABN must be 11 digits');
            isValid = false;
        }

        // Validate registered address
        if (!this.registeredAddress.street) {
            this.errorMessages.push('Street address is required');
            isValid = false;
        }
        if (!this.registeredAddress.suburb) {
            this.errorMessages.push('Suburb/Town is required');
            isValid = false;
        }
        if (!this.registeredAddress.state) {
            this.errorMessages.push('State/Territory is required');
            isValid = false;
        }
        if (!this.registeredAddress.postcode) {
            this.errorMessages.push('Postcode is required');
            isValid = false;
        }

        // Validate postcode format
        if (this.registeredAddress.postcode && !this.validatePostcode(this.registeredAddress.postcode)) {
            this.errorMessages.push('Postcode must be 4 digits');
            isValid = false;
        }

        // Validate care types
        if (this.selectedCareTypes.length === 0) {
            this.errorMessages.push('At least one care type must be selected');
            isValid = false;
        }

        return isValid;
    }

    validatePage3() {
        let isValid = true;

        // Validate key personnel 1
        if (!this.keyPersonnel1.name) {
            this.errorMessages.push('Key Personnel name is required');
            isValid = false;
        }
        if (!this.keyPersonnel1.dateOfBirth) {
            this.errorMessages.push('Key Personnel date of birth is required');
            isValid = false;
        }
        if (!this.keyPersonnel1.position) {
            this.errorMessages.push('Key Personnel position is required');
            isValid = false;
        }
        if (!this.keyPersonnel1.email) {
            this.errorMessages.push('Key Personnel email is required');
            isValid = false;
        }
        if (!this.keyPersonnel1.mobile) {
            this.errorMessages.push('Key Personnel mobile is required');
            isValid = false;
        }
        if (!this.keyPersonnel1.duties) {
            this.errorMessages.push('Key Personnel duties description is required');
            isValid = false;
        }

        // Validate email format
        if (this.keyPersonnel1.email && !this.validateEmail(this.keyPersonnel1.email)) {
            this.errorMessages.push('Please enter a valid email address');
            isValid = false;
        }

        // Validate phone format
        if (this.keyPersonnel1.mobile && !this.validatePhone(this.keyPersonnel1.mobile)) {
            this.errorMessages.push('Please enter a valid mobile number');
            isValid = false;
        }

        return isValid;
    }

    validatePage4() {
        let isValid = true;

        if (!this.suitability.experience) {
            this.errorMessages.push('Experience description is required');
            isValid = false;
        }
        if (!this.suitability.financialPolicies) {
            this.errorMessages.push('Financial policies description is required');
            isValid = false;
        }
        if (!this.suitability.financialStrategy) {
            this.errorMessages.push('Financial strategy description is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage5() {
        let isValid = true;

        if (this.showResidentialCare) {
            if (!this.careSpecific.residentialPrudential) {
                this.errorMessages.push('Residential care prudential standards description is required');
                isValid = false;
            }
            if (!this.careSpecific.residentialReporting) {
                this.errorMessages.push('Residential care reporting procedures description is required');
                isValid = false;
            }
        }

        if (this.showHomeCare) {
            if (!this.careSpecific.homeCareSystems) {
                this.errorMessages.push('Home care systems description is required');
                isValid = false;
            }
            if (!this.careSpecific.homeCareTools) {
                this.errorMessages.push('Home care tools description is required');
                isValid = false;
            }
        }

        if (this.showFlexibleCare) {
            if (!this.careSpecific.flexibleCareExperience) {
                this.errorMessages.push('Flexible care experience description is required');
                isValid = false;
            }
            if (!this.careSpecific.flexibleCarePolicies) {
                this.errorMessages.push('Flexible care policies description is required');
                isValid = false;
            }
        }

        return isValid;
    }

    // Utility validation methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    validateABN(abn) {
        const abnRegex = /^\d{11}$/;
        return abnRegex.test(abn.replace(/\s/g, ''));
    }

    validatePostcode(postcode) {
        const postcodeRegex = /^\d{4}$/;
        return postcodeRegex.test(postcode);
    }

    // Submit application
    async submitApplication() {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showToast('Success', 'Application submitted successfully', 'success');
            this.resetForm();
        } catch (error) {
            this.showToast('Error', 'Failed to submit application', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    resetForm() {
        this.currentPage = 1;
        this.declaration = {
            point1: false,
            point2: false,
            point3: false,
            point4: false,
            point5: false
        };
        this.declaringOfficer1 = { name: '', position: '', date: '' };
        this.declaringOfficer2 = { name: '', position: '', date: '' };
        this.applicant = { legalName: '', acn: '', abn: '', businessName: '' };
        this.registeredAddress = { street: '', suburb: '', state: '', postcode: '' };
        this.selectedCareTypes = [];
        this.keyPersonnel1 = {
            title: '', name: '', formerName: '', preferredName: '',
            dateOfBirth: '', position: '', email: '', mobile: '', duties: ''
        };
        this.suitability = { experience: '', financialPolicies: '', financialStrategy: '' };
        this.serviceDetails = { service: '', period: '', recipients: '' };
        this.careSpecific = {
            residentialPrudential: '', residentialReporting: '',
            homeCareSystems: '', homeCareTools: '',
            flexibleCareExperience: '', flexibleCarePolicies: ''
        };
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}
