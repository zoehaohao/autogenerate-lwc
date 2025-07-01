import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppFormV2 extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track errorMessages = [];
    @track showSuccessMessage = false;
    @track isSubmitting = false;

    // Page 1: Key Personnel Declaration
    @track selectedDeclarations = [];
    @track officer1Name = '';
    @track officer1Position = '';
    @track officer1Date = '';
    @track officer2Name = '';
    @track officer2Position = '';
    @track officer2Date = '';

    // Page 2: Applicant Details
    @track companyLegalName = '';
    @track companyACN = '';
    @track companyABN = '';
    @track businessName = '';
    @track registeredStreetAddress = '';
    @track registeredSuburb = '';
    @track registeredState = '';
    @track registeredPostcode = '';
    @track postalSameAsRegistered = false;
    @track postalStreetAddress = '';
    @track postalSuburb = '';
    @track postalState = '';
    @track postalPostcode = '';
    @track selectedCareTypes = [];

    // Page 3: Key Personnel Details
    @track keyPersonnelList = [
        {
            id: '1',
            number: 1,
            title: '',
            fullName: '',
            formerName: '',
            preferredName: '',
            dateOfBirth: '',
            positionTitle: '',
            email: '',
            mobile: '',
            principalDuties: ''
        }
    ];

    // Page 4: Suitability Assessment
    @track experienceDescription = '';
    @track servicesProvided = [
        {
            id: '1',
            serviceType: '',
            period: '',
            recipientCount: ''
        }
    ];
    @track financialManagementDescription = '';
    @track financialStrategy = '';
    @track informationManagementSystems = '';
    @track continuousImprovementSystem = '';
    @track riskManagementSystem = '';

    // Page 5: Care Type Specific
    @track residentialPrudentialStandards = '';
    @track residentialFinancing = '';
    @track residentialRestrictivePractices = '';
    @track homeCareDeliverySystem = '';
    @track homeCareHealthTracking = '';
    @track homeCareMedicationManagement = '';
    @track homeCareChoiceFlexibility = '';
    @track flexibleCareDescription = '';
    @track flexibleCareRestorativePolicies = '';
    @track flexibleCareMultidisciplinaryTeams = '';
    @track finalDeclarationAccuracy = false;
    @track finalDeclarationResponsibilities = false;
    @track finalDeclarationConsent = false;

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

    get declarationOptions() {
        return [
            {
                label: 'I am aware that, under section 63J(1)(c) of the Commission Act, if the Commissioner is satisfied that the application contained information that was false or misleading in a material particular, any approval as an approved provider must be revoked.',
                value: 'revocation_awareness'
            },
            {
                label: 'I understand that Chapter 2 and section 137.1 of the Criminal Code applies to offences against the Commission Act. Providing false or misleading information in this application is a serious offence.',
                value: 'criminal_code_understanding'
            },
            {
                label: 'I have provided true and accurate information in this application form.',
                value: 'accurate_information'
            },
            {
                label: 'I understand that the application form must be signed by persons lawfully authorised to act on behalf of/represent the organisation.',
                value: 'authorised_signatory'
            },
            {
                label: 'I consent to the Commissioner obtaining information and documents from other persons or organisations to assist in assessing this application.',
                value: 'information_consent'
            },
            {
                label: 'I understand that information I give to the Commission may be disclosed where permitted or required by law.',
                value: 'disclosure_understanding'
            },
            {
                label: 'I declare that all of our organisation\'s key personnel are individuals suitable to be involved in the provision of aged care.',
                value: 'personnel_suitability'
            },
            {
                label: 'I have read the Aged Care Approved Provider Applicant Guide and understand the responsibilities and obligations of approved providers.',
                value: 'guide_understanding'
            },
            {
                label: 'I understand that the Commission will examine its own records in relation to this application as it may relate to the suitability and conduct of any key personnel.',
                value: 'records_examination'
            },
            {
                label: 'I understand that if a consultant or external party is engaged to assist in preparing this application, our organisation is ultimately responsible for the information provided.',
                value: 'consultant_responsibility'
            }
        ];
    }

    get stateOptions() {
        return [
            { label: 'Australian Capital Territory', value: 'ACT' },
            { label: 'New South Wales', value: 'NSW' },
            { label: 'Northern Territory', value: 'NT' },
            { label: 'Queensland', value: 'QLD' },
            { label: 'South Australia', value: 'SA' },
            { label: 'Tasmania', value: 'TAS' },
            { label: 'Victoria', value: 'VIC' },
            { label: 'Western Australia', value: 'WA' }
        ];
    }

    get careTypeOptions() {
        return [
            { label: 'Residential Care', value: 'residential' },
            { label: 'Home Care', value: 'home' },
            { label: 'Flexible Care', value: 'flexible' }
        ];
    }

    get titleOptions() {
        return [
            { label: 'Mr', value: 'Mr' },
            { label: 'Mrs', value: 'Mrs' },
            { label: 'Ms', value: 'Ms' },
            { label: 'Miss', value: 'Miss' },
            { label: 'Dr', value: 'Dr' },
            { label: 'Prof', value: 'Prof' }
        ];
    }

    // Event Handlers - Page 1
    handleDeclarationChange(event) {
        this.selectedDeclarations = event.detail.value;
    }

    handleOfficer1NameChange(event) {
        this.officer1Name = event.target.value;
    }

    handleOfficer1PositionChange(event) {
        this.officer1Position = event.target.value;
    }

    handleOfficer1DateChange(event) {
        this.officer1Date = event.target.value;
    }

    handleOfficer2NameChange(event) {
        this.officer2Name = event.target.value;
    }

    handleOfficer2PositionChange(event) {
        this.officer2Position = event.target.value;
    }

    handleOfficer2DateChange(event) {
        this.officer2Date = event.target.value;
    }

    // Event Handlers - Page 2
    handleCompanyLegalNameChange(event) {
        this.companyLegalName = event.target.value;
    }

    handleCompanyACNChange(event) {
        this.companyACN = event.target.value;
    }

    handleCompanyABNChange(event) {
        this.companyABN = event.target.value;
    }

    handleBusinessNameChange(event) {
        this.businessName = event.target.value;
    }

    handleRegisteredStreetAddressChange(event) {
        this.registeredStreetAddress = event.target.value;
    }

    handleRegisteredSuburbChange(event) {
        this.registeredSuburb = event.target.value;
    }

    handleRegisteredStateChange(event) {
        this.registeredState = event.target.value;
    }

    handleRegisteredPostcodeChange(event) {
        this.registeredPostcode = event.target.value;
    }

    handlePostalSameAsRegisteredChange(event) {
        this.postalSameAsRegistered = event.target.checked;
        if (this.postalSameAsRegistered) {
            this.postalStreetAddress = this.registeredStreetAddress;
            this.postalSuburb = this.registeredSuburb;
            this.postalState = this.registeredState;
            this.postalPostcode = this.registeredPostcode;
        }
    }

    handlePostalStreetAddressChange(event) {
        this.postalStreetAddress = event.target.value;
    }

    handlePostalSuburbChange(event) {
        this.postalSuburb = event.target.value;
    }

    handlePostalStateChange(event) {
        this.postalState = event.target.value;
    }

    handlePostalPostcodeChange(event) {
        this.postalPostcode = event.target.value;
    }

    handleCareTypeChange(event) {
        this.selectedCareTypes = event.detail.value;
    }

    // Event Handlers - Page 3
    handleKeyPersonnelChange(event) {
        const personnelId = event.target.dataset.id;
        const field = event.target.dataset.field;
        const value = event.target.value;

        this.keyPersonnelList = this.keyPersonnelList.map(personnel => {
            if (personnel.id === personnelId) {
                return { ...personnel, [field]: value };
            }
            return personnel;
        });
    }

    handleAddKeyPersonnel() {
        const newId = (this.keyPersonnelList.length + 1).toString();
        const newPersonnel = {
            id: newId,
            number: this.keyPersonnelList.length + 1,
            title: '',
            fullName: '',
            formerName: '',
            preferredName: '',
            dateOfBirth: '',
            positionTitle: '',
            email: '',
            mobile: '',
            principalDuties: ''
        };
        this.keyPersonnelList = [...this.keyPersonnelList, newPersonnel];
    }

    // Event Handlers - Page 4
    handleExperienceDescriptionChange(event) {
        this.experienceDescription = event.target.value;
    }

    handleServiceChange(event) {
        const serviceId = event.target.dataset.id;
        const field = event.target.dataset.field;
        const value = event.target.value;

        this.servicesProvided = this.servicesProvided.map(service => {
            if (service.id === serviceId) {
                return { ...service, [field]: value };
            }
            return service;
        });
    }

    handleAddService() {
        const newId = (this.servicesProvided.length + 1).toString();
        const newService = {
            id: newId,
            serviceType: '',
            period: '',
            recipientCount: ''
        };
        this.servicesProvided = [...this.servicesProvided, newService];
    }

    handleFinancialManagementDescriptionChange(event) {
        this.financialManagementDescription = event.target.value;
    }

    handleFinancialStrategyChange(event) {
        this.financialStrategy = event.target.value;
    }

    handleInformationManagementSystemsChange(event) {
        this.informationManagementSystems = event.target.value;
    }

    handleContinuousImprovementSystemChange(event) {
        this.continuousImprovementSystem = event.target.value;
    }

    handleRiskManagementSystemChange(event) {
        this.riskManagementSystem = event.target.value;
    }

    // Event Handlers - Page 5
    handleResidentialPrudentialStandardsChange(event) {
        this.residentialPrudentialStandards = event.target.value;
    }

    handleResidentialFinancingChange(event) {
        this.residentialFinancing = event.target.value;
    }

    handleResidentialRestrictivePracticesChange(event) {
        this.residentialRestrictivePractices = event.target.value;
    }

    handleHomeCareDeliverySystemChange(event) {
        this.homeCareDeliverySystem = event.target.value;
    }

    handleHomeCareHealthTrackingChange(event) {
        this.homeCareHealthTracking = event.target.value;
    }

    handleHomeCareMedicationManagementChange(event) {
        this.homeCareMedicationManagement = event.target.value;
    }

    handleHomeCareChoiceFlexibilityChange(event) {
        this.homeCareChoiceFlexibility = event.target.value;
    }

    handleFlexibleCareDescriptionChange(event) {
        this.flexibleCareDescription = event.target.value;
    }

    handleFlexibleCareRestorativePoliciesChange(event) {
        this.flexibleCareRestorativePolicies = event.target.value;
    }

    handleFlexibleCareMultidisciplinaryTeamsChange(event) {
        this.flexibleCareMultidisciplinaryTeams = event.target.value;
    }

    handleFinalDeclarationAccuracyChange(event) {
        this.finalDeclarationAccuracy = event.target.checked;
    }

    handleFinalDeclarationResponsibilitiesChange(event) {
        this.finalDeclarationResponsibilities = event.target.checked;
    }

    handleFinalDeclarationConsentChange(event) {
        this.finalDeclarationConsent = event.target.checked;
    }

    // Navigation Methods
    handleNext() {
        if (this.validateCurrentPage()) {
            this.currentPage++;
            this.clearErrors();
            this.scrollToTop();
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.clearErrors();
            this.scrollToTop();
        }
    }

    handleCancel() {
        if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
            this.resetForm();
        }
    }

    handleSubmit() {
        if (this.validateCurrentPage()) {
            this.isSubmitting = true;
            this.submitApplication();
        }
    }

    // Validation Methods
    validateCurrentPage() {
        this.clearErrors();
        let isValid = true;
        let errors = [];

        switch (this.currentPage) {
            case 1:
                isValid = this.validatePage1(errors);
                break;
            case 2:
                isValid = this.validatePage2(errors);
                break;
            case 3:
                isValid = this.validatePage3(errors);
                break;
            case 4:
                isValid = this.validatePage4(errors);
                break;
            case 5:
                isValid = this.validatePage5(errors);
                break;
        }

        if (!isValid) {
            this.errorMessages = errors;
            this.showToast('Error', 'Please correct the errors below', 'error');
        }

        return isValid;
    }

    validatePage1(errors) {
        let isValid = true;

        // Validate all declarations are selected
        if (this.selectedDeclarations.length !== this.declarationOptions.length) {
            errors.push('All declarations must be acknowledged');
            isValid = false;
        }

        // Validate Officer 1 details
        if (!this.officer1Name) {
            errors.push('Officer 1 Name is required');
            isValid = false;
        }
        if (!this.officer1Position) {
            errors.push('Officer 1 Position is required');
            isValid = false;
        }
        if (!this.officer1Date) {
            errors.push('Officer 1 Date is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage2(errors) {
        let isValid = true;

        // Validate company details
        if (!this.companyLegalName) {
            errors.push('Company Legal Name is required');
            isValid = false;
        }
        if (!this.companyACN) {
            errors.push('Company ACN/IAN/ICN is required');
            isValid = false;
        }
        if (!this.companyABN) {
            errors.push('Company ABN is required');
            isValid = false;
        }

        // Validate ABN format
        if (this.companyABN && !this.validateABN(this.companyABN)) {
            errors.push('Please enter a valid ABN (11 digits)');
            isValid = false;
        }

        // Validate registered address
        if (!this.registeredStreetAddress) {
            errors.push('Registered Street Address is required');
            isValid = false;
        }
        if (!this.registeredSuburb) {
            errors.push('Registered Suburb is required');
            isValid = false;
        }
        if (!this.registeredState) {
            errors.push('Registered State is required');
            isValid = false;
        }
        if (!this.registeredPostcode) {
            errors.push('Registered Postcode is required');
            isValid = false;
        }

        // Validate postcode format
        if (this.registeredPostcode && !this.validatePostcode(this.registeredPostcode)) {
            errors.push('Please enter a valid postcode (4 digits)');
            isValid = false;
        }

        // Validate care types
        if (this.selectedCareTypes.length === 0) {
            errors.push('At least one care type must be selected');
            isValid = false;
        }

        return isValid;
    }

    validatePage3(errors) {
        let isValid = true;

        // Validate each key personnel
        this.keyPersonnelList.forEach((personnel, index) => {
            if (!personnel.fullName) {
                errors.push(`Key Personnel ${index + 1}: Full Name is required`);
                isValid = false;
            }
            if (!personnel.dateOfBirth) {
                errors.push(`Key Personnel ${index + 1}: Date of Birth is required`);
                isValid = false;
            }
            if (!personnel.positionTitle) {
                errors.push(`Key Personnel ${index + 1}: Position Title is required`);
                isValid = false;
            }
            if (!personnel.email) {
                errors.push(`Key Personnel ${index + 1}: Email is required`);
                isValid = false;
            } else if (!this.validateEmail(personnel.email)) {
                errors.push(`Key Personnel ${index + 1}: Please enter a valid email address`);
                isValid = false;
            }
            if (!personnel.mobile) {
                errors.push(`Key Personnel ${index + 1}: Mobile number is required`);
                isValid = false;
            } else if (!this.validatePhone(personnel.mobile)) {
                errors.push(`Key Personnel ${index + 1}: Please enter a valid mobile number`);
                isValid = false;
            }
            if (!personnel.principalDuties) {
                errors.push(`Key Personnel ${index + 1}: Principal Duties is required`);
                isValid = false;
            }
        });

        return isValid;
    }

    validatePage4(errors) {
        let isValid = true;

        if (!this.experienceDescription) {
            errors.push('Experience description is required');
            isValid = false;
        }
        if (!this.financialManagementDescription) {
            errors.push('Financial management description is required');
            isValid = false;
        }
        if (!this.financialStrategy) {
            errors.push('Financial strategy is required');
            isValid = false;
        }
        if (!this.informationManagementSystems) {
            errors.push('Information management systems description is required');
            isValid = false;
        }
        if (!this.continuousImprovementSystem) {
            errors.push('Continuous improvement system description is required');
            isValid = false;
        }
        if (!this.riskManagementSystem) {
            errors.push('Risk management system description is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage5(errors) {
        let isValid = true;

        // Validate based on selected care types
        if (this.showResidentialCare) {
            if (!this.residentialPrudentialStandards) {
                errors.push('Residential Care: Prudential Standards description is required');
                isValid = false;
            }
            if (!this.residentialFinancing) {
                errors.push('Residential Care: Financing description is required');
                isValid = false;
            }
            if (!this.residentialRestrictivePractices) {
                errors.push('Residential Care: Restrictive Practices description is required');
                isValid = false;
            }
        }

        if (this.showHomeCare) {
            if (!this.homeCareDeliverySystem) {
                errors.push('Home Care: Delivery system description is required');
                isValid = false;
            }
            if (!this.homeCareHealthTracking) {
                errors.push('Home Care: Health tracking description is required');
                isValid = false;
            }
            if (!this.homeCareMedicationManagement) {
                errors.push('Home Care: Medication management description is required');
                isValid = false;
            }
            if (!this.homeCareChoiceFlexibility) {
                errors.push('Home Care: Choice and flexibility description is required');
                isValid = false;
            }
        }

        if (this.showFlexibleCare) {
            if (!this.flexibleCareDescription) {
                errors.push('Flexible Care: Description is required');
                isValid = false;
            }
            if (!this.flexibleCareRestorativePolicies) {
                errors.push('Flexible Care: Restorative policies description is required');
                isValid = false;
            }
            if (!this.flexibleCareMultidisciplinaryTeams) {
                errors.push('Flexible Care: Multidisciplinary teams description is required');
                isValid = false;
            }
        }

        // Validate final declarations
        if (!this.finalDeclarationAccuracy) {
            errors.push('You must declare that all information is true and accurate');
            isValid = false;
        }
        if (!this.finalDeclarationResponsibilities) {
            errors.push('You must acknowledge understanding of responsibilities and obligations');
            isValid = false;
        }
        if (!this.finalDeclarationConsent) {
            errors.push('You must consent to information gathering for assessment');
            isValid = false;
        }

        return isValid;
    }

    // Validation Helper Methods
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

    // Utility Methods
    clearErrors() {
        this.errorMessages = [];
    }

    scrollToTop() {
        const element = this.template.querySelector('.slds-card');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    resetForm() {
        // Reset all form data
        this.currentPage = 1;
        this.selectedDeclarations = [];
        this.officer1Name = '';
        this.officer1Position = '';
        this.officer1Date = '';
        this.officer2Name = '';
        this.officer2Position = '';
        this.officer2Date = '';
        this.companyLegalName = '';
        this.companyACN = '';
        this.companyABN = '';
        this.businessName = '';
        this.registeredStreetAddress = '';
        this.registeredSuburb = '';
        this.registeredState = '';
        this.registeredPostcode = '';
        this.postalSameAsRegistered = false;
        this.postalStreetAddress = '';
        this.postalSuburb = '';
        this.postalState = '';
        this.postalPostcode = '';
        this.selectedCareTypes = [];
        this.keyPersonnelList = [{
            id: '1',
            number: 1,
            title: '',
            fullName: '',
            formerName: '',
            preferredName: '',
            dateOfBirth: '',
            positionTitle: '',
            email: '',
            mobile: '',
            principalDuties: ''
        }];
        this.experienceDescription = '';
        this.servicesProvided = [{
            id: '1',
            serviceType: '',
            period: '',
            recipientCount: ''
        }];
        this.financialManagementDescription = '';
        this.financialStrategy = '';
        this.informationManagementSystems = '';
        this.continuousImprovementSystem = '';
        this.riskManagementSystem = '';
        this.residentialPrudentialStandards = '';
        this.residentialFinancing = '';
        this.residentialRestrictivePractices = '';
        this.homeCareDeliverySystem = '';
        this.homeCareHealthTracking = '';
        this.homeCareMedicationManagement = '';
        this.homeCareChoiceFlexibility = '';
        this.flexibleCareDescription = '';
        this.flexibleCareRestorativePolicies = '';
        this.flexibleCareMultidisciplinaryTeams = '';
        this.finalDeclarationAccuracy = false;
        this.finalDeclarationResponsibilities = false;
        this.finalDeclarationConsent = false;
        this.clearErrors();
    }

    async submitApplication() {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showSuccessMessage = true;
            this.showToast('Success', 'Application submitted successfully', 'success');
        } catch (error) {
            this.showToast('Error', 'Failed to submit application. Please try again.', 'error');
        } finally {
            this.isSubmitting = false;
        }
    }
}
