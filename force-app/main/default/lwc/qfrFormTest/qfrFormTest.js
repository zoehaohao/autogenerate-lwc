import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class QfrFormTest extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track isSubmitting = false;

    // Page 1: Key Personnel Declaration
    @track selectedDeclarations = [];
    @track officer1Name = '';
    @track officer1Position = '';
    @track officer1Date = '';
    @track officer2Name = '';
    @track officer2Position = '';
    @track officer2Date = '';
    @track declarationError = '';

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
    @track careTypeError = '';

    // Page 3: Key Personnel Details
    @track kp1Title = '';
    @track kp1Name = '';
    @track kp1FormerName = '';
    @track kp1PreferredName = '';
    @track kp1DateOfBirth = '';
    @track kp1PositionTitle = '';
    @track kp1Email = '';
    @track kp1Mobile = '';
    @track kp1Landline = '';
    @track kp1PreferredContact = '';
    @track kp1PrincipalDuties = '';
    @track kp1Qualification1 = '';
    @track kp1Qualification1Date = '';
    @track kp1Experience1Employer = '';
    @track kp1Experience1From = '';
    @track kp1Experience1To = '';
    @track kp1Experience1Description = '';

    // Page 4: Suitability Assessment
    @track experienceDescription = '';
    @track informationManagement = '';
    @track continuousImprovement = '';
    @track financialGovernance = '';
    @track workforceGovernance = '';
    @track riskManagement = '';
    @track clinicalGovernance = '';

    // Page 5: Care Type Specific
    @track residentialPrudentialStandards = '';
    @track residentialFinancing = '';
    @track residentialRestrictivePractices = '';
    @track homeCareDeliverySystem = '';
    @track homeCareHealthTracking = '';
    @track homeCareChoiceFlexibility = '';
    @track homeCareMedicationManagement = '';
    @track flexibleCareDescription = '';
    @track flexibleCareRestorativeCare = '';
    @track flexibleCareMultiDisciplinary = '';

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
            { label: 'I am aware that, under section 63J(1)(c) of the Commission Act, if the Commissioner is satisfied that the application contained information that was false or misleading in a material particular, any approval as an approved provider must be revoked.', value: 'revocation' },
            { label: 'I understand that Chapter 2 and section 137.1 of the Criminal Code applies to offences against the Commission Act. Providing false or misleading information in this application is a serious offence.', value: 'criminal_code' },
            { label: 'I have provided true and accurate information in this application form.', value: 'accurate_info' },
            { label: 'I understand that the application form must be signed by persons lawfully authorised to act on behalf of/represent the organisation.', value: 'authorised_signatory' },
            { label: 'I consent to the Commissioner obtaining information and documents from other persons or organisations to assist in assessing this application.', value: 'consent_info' },
            { label: 'I understand that information I give to the Commission may be disclosed where permitted or required by law.', value: 'disclosure' },
            { label: 'I understand that the corporation name shown on the Certificate of Registration provided with this application will be used in any communications.', value: 'corporation_name' },
            { label: 'I declare that all of our organisation\'s key personnel are individuals suitable to be involved in the provision of aged care.', value: 'suitable_personnel' },
            { label: 'I have read the Aged Care Approved Provider Applicant Guide and understand the responsibilities and obligations of approved providers.', value: 'guide_read' },
            { label: 'I understand that the Commission will examine its own records in relation to this application.', value: 'record_examination' },
            { label: 'I understand that if a consultant or external party is engaged to assist in preparing this application, our organisation is ultimately responsible for the information provided.', value: 'consultant_responsibility' }
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
            { label: 'Flexible Care - in a residential care setting', value: 'flexible_residential' },
            { label: 'Flexible Care - in a home care setting', value: 'flexible_home' }
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

    get contactMethodOptions() {
        return [
            { label: 'Email', value: 'email' },
            { label: 'Mobile', value: 'mobile' },
            { label: 'Landline', value: 'landline' }
        ];
    }

    // Event Handlers - Page 1
    handleDeclarationChange(event) {
        this.selectedDeclarations = event.detail.value;
        this.declarationError = '';
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
        this.careTypeError = '';
    }

    // Event Handlers - Page 3
    handleKP1TitleChange(event) {
        this.kp1Title = event.target.value;
    }

    handleKP1NameChange(event) {
        this.kp1Name = event.target.value;
    }

    handleKP1FormerNameChange(event) {
        this.kp1FormerName = event.target.value;
    }

    handleKP1PreferredNameChange(event) {
        this.kp1PreferredName = event.target.value;
    }

    handleKP1DateOfBirthChange(event) {
        this.kp1DateOfBirth = event.target.value;
    }

    handleKP1PositionTitleChange(event) {
        this.kp1PositionTitle = event.target.value;
    }

    handleKP1EmailChange(event) {
        this.kp1Email = event.target.value;
    }

    handleKP1MobileChange(event) {
        this.kp1Mobile = event.target.value;
    }

    handleKP1LandlineChange(event) {
        this.kp1Landline = event.target.value;
    }

    handleKP1PreferredContactChange(event) {
        this.kp1PreferredContact = event.target.value;
    }

    handleKP1PrincipalDutiesChange(event) {
        this.kp1PrincipalDuties = event.target.value;
    }

    handleKP1Qualification1Change(event) {
        this.kp1Qualification1 = event.target.value;
    }

    handleKP1Qualification1DateChange(event) {
        this.kp1Qualification1Date = event.target.value;
    }

    handleKP1Experience1EmployerChange(event) {
        this.kp1Experience1Employer = event.target.value;
    }

    handleKP1Experience1FromChange(event) {
        this.kp1Experience1From = event.target.value;
    }

    handleKP1Experience1ToChange(event) {
        this.kp1Experience1To = event.target.value;
    }

    handleKP1Experience1DescriptionChange(event) {
        this.kp1Experience1Description = event.target.value;
    }

    // Event Handlers - Page 4
    handleExperienceDescriptionChange(event) {
        this.experienceDescription = event.target.value;
    }

    handleInformationManagementChange(event) {
        this.informationManagement = event.target.value;
    }

    handleContinuousImprovementChange(event) {
        this.continuousImprovement = event.target.value;
    }

    handleFinancialGovernanceChange(event) {
        this.financialGovernance = event.target.value;
    }

    handleWorkforceGovernanceChange(event) {
        this.workforceGovernance = event.target.value;
    }

    handleRiskManagementChange(event) {
        this.riskManagement = event.target.value;
    }

    handleClinicalGovernanceChange(event) {
        this.clinicalGovernance = event.target.value;
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

    handleHomeCareChoiceFlexibilityChange(event) {
        this.homeCareChoiceFlexibility = event.target.value;
    }

    handleHomeCareMedicationManagementChange(event) {
        this.homeCareMedicationManagement = event.target.value;
    }

    handleFlexibleCareDescriptionChange(event) {
        this.flexibleCareDescription = event.target.value;
    }

    handleFlexibleCareRestorativeCareChange(event) {
        this.flexibleCareRestorativeCare = event.target.value;
    }

    handleFlexibleCareMultiDisciplinaryChange(event) {
        this.flexibleCareMultiDisciplinary = event.target.value;
    }

    // Navigation Methods
    handleCancel() {
        this.showToast('Cancelled', 'Application cancelled', 'info');
        this.resetForm();
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            if (this.currentPage < 5) {
                this.currentPage++;
            }
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
        let isValid = true;
        let errors = [];

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

        // Validate declarations
        if (this.selectedDeclarations.length < 11) {
            this.declarationError = 'All declarations must be acknowledged';
            isValid = false;
        } else {
            this.declarationError = '';
        }

        // Validate Officer 1 (required)
        if (!this.officer1Name || !this.officer1Position || !this.officer1Date) {
            this.showToast('Validation Error', 'Declaring Officer 1 details are required', 'error');
            isValid = false;
        }

        return isValid;
    }

    validatePage2() {
        let isValid = true;
        let errors = [];

        // Required fields validation
        const requiredFields = [
            { field: this.companyLegalName, name: 'Company Legal Name' },
            { field: this.companyACN, name: 'Company ACN/IAN/ICN' },
            { field: this.companyABN, name: 'Company ABN' },
            { field: this.registeredStreetAddress, name: 'Registered Street Address' },
            { field: this.registeredSuburb, name: 'Registered Suburb' },
            { field: this.registeredState, name: 'Registered State' },
            { field: this.registeredPostcode, name: 'Registered Postcode' }
        ];

        requiredFields.forEach(item => {
            if (!item.field || item.field.trim() === '') {
                errors.push(`${item.name} is required`);
                isValid = false;
            }
        });

        // Validate care types
        if (this.selectedCareTypes.length === 0) {
            this.careTypeError = 'At least one care type must be selected';
            isValid = false;
        } else {
            this.careTypeError = '';
        }

        // Validate ABN format (11 digits)
        if (this.companyABN && !this.validateABN(this.companyABN)) {
            errors.push('ABN must be 11 digits');
            isValid = false;
        }

        // Validate postcode format
        if (this.registeredPostcode && !this.validatePostcode(this.registeredPostcode)) {
            errors.push('Postcode must be 4 digits');
            isValid = false;
        }

        if (errors.length > 0) {
            this.showToast('Validation Error', errors.join(', '), 'error');
        }

        return isValid;
    }

    validatePage3() {
        let isValid = true;
        let errors = [];

        // Required fields for Key Personnel 1
        const requiredFields = [
            { field: this.kp1Name, name: 'Key Personnel Name' },
            { field: this.kp1DateOfBirth, name: 'Date of Birth' },
            { field: this.kp1PositionTitle, name: 'Position Title' },
            { field: this.kp1Email, name: 'Email Address' },
            { field: this.kp1Mobile, name: 'Mobile Number' },
            { field: this.kp1PrincipalDuties, name: 'Principal Duties' }
        ];

        requiredFields.forEach(item => {
            if (!item.field || item.field.trim() === '') {
                errors.push(`${item.name} is required`);
                isValid = false;
            }
        });

        // Validate email format
        if (this.kp1Email && !this.validateEmail(this.kp1Email)) {
            errors.push('Valid email address is required');
            isValid = false;
        }

        // Validate phone number format
        if (this.kp1Mobile && !this.validatePhone(this.kp1Mobile)) {
            errors.push('Valid mobile number is required');
            isValid = false;
        }

        // Validate date of birth (must be at least 18 years old)
        if (this.kp1DateOfBirth && !this.validateAge(this.kp1DateOfBirth)) {
            errors.push('Key personnel must be at least 18 years old');
            isValid = false;
        }

        if (errors.length > 0) {
            this.showToast('Validation Error', errors.join(', '), 'error');
        }

        return isValid;
    }

    validatePage4() {
        let isValid = true;
        let errors = [];

        // Required fields for suitability assessment
        const requiredFields = [
            { field: this.experienceDescription, name: 'Experience Description' },
            { field: this.informationManagement, name: 'Information Management' },
            { field: this.continuousImprovement, name: 'Continuous Improvement' },
            { field: this.financialGovernance, name: 'Financial Governance' },
            { field: this.workforceGovernance, name: 'Workforce Governance' },
            { field: this.riskManagement, name: 'Risk Management' },
            { field: this.clinicalGovernance, name: 'Clinical Governance' }
        ];

        requiredFields.forEach(item => {
            if (!item.field || item.field.trim() === '') {
                errors.push(`${item.name} is required`);
                isValid = false;
            }
        });

        if (errors.length > 0) {
            this.showToast('Validation Error', errors.join(', '), 'error');
        }

        return isValid;
    }

    validatePage5() {
        let isValid = true;
        let errors = [];

        // Validate based on selected care types
        if (this.showResidentialCare) {
            if (!this.residentialPrudentialStandards || !this.residentialFinancing || !this.residentialRestrictivePractices) {
                errors.push('All residential care fields are required');
                isValid = false;
            }
        }

        if (this.showHomeCare) {
            if (!this.homeCareDeliverySystem || !this.homeCareHealthTracking || !this.homeCareChoiceFlexibility || !this.homeCareMedicationManagement) {
                errors.push('All home care fields are required');
                isValid = false;
            }
        }

        if (this.showFlexibleCare) {
            if (!this.flexibleCareDescription || !this.flexibleCareRestorativeCare || !this.flexibleCareMultiDisciplinary) {
                errors.push('All flexible care fields are required');
                isValid = false;
            }
        }

        if (errors.length > 0) {
            this.showToast('Validation Error', errors.join(', '), 'error');
        }

        return isValid;
    }

    // Utility Validation Methods
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

    validateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 18;
    }

    // Form Submission
    async submitApplication() {
        try {
            this.isLoading = true;
            
            const applicationData = {
                // Page 1 data
                declarations: this.selectedDeclarations,
                officer1: {
                    name: this.officer1Name,
                    position: this.officer1Position,
                    date: this.officer1Date
                },
                officer2: {
                    name: this.officer2Name,
                    position: this.officer2Position,
                    date: this.officer2Date
                },
                
                // Page 2 data
                organisation: {
                    legalName: this.companyLegalName,
                    acn: this.companyACN,
                    abn: this.companyABN,
                    businessName: this.businessName,
                    registeredAddress: {
                        street: this.registeredStreetAddress,
                        suburb: this.registeredSuburb,
                        state: this.registeredState,
                        postcode: this.registeredPostcode
                    },
                    postalAddress: {
                        street: this.postalStreetAddress,
                        suburb: this.postalSuburb,
                        state: this.postalState,
                        postcode: this.postalPostcode,
                        sameAsRegistered: this.postalSameAsRegistered
                    },
                    careTypes: this.selectedCareTypes
                },
                
                // Page 3 data
                keyPersonnel: {
                    title: this.kp1Title,
                    name: this.kp1Name,
                    formerName: this.kp1FormerName,
                    preferredName: this.kp1PreferredName,
                    dateOfBirth: this.kp1DateOfBirth,
                    positionTitle: this.kp1PositionTitle,
                    email: this.kp1Email,
                    mobile: this.kp1Mobile,
                    landline: this.kp1Landline,
                    preferredContact: this.kp1PreferredContact,
                    principalDuties: this.kp1PrincipalDuties,
                    qualifications: [{
                        title: this.kp1Qualification1,
                        date: this.kp1Qualification1Date
                    }],
                    experience: [{
                        employer: this.kp1Experience1Employer,
                        from: this.kp1Experience1From,
                        to: this.kp1Experience1To,
                        description: this.kp1Experience1Description
                    }]
                },
                
                // Page 4 data
                suitability: {
                    experienceDescription: this.experienceDescription,
                    governance: {
                        informationManagement: this.informationManagement,
                        continuousImprovement: this.continuousImprovement,
                        financialGovernance: this.financialGovernance,
                        workforceGovernance: this.workforceGovernance,
                        riskManagement: this.riskManagement,
                        clinicalGovernance: this.clinicalGovernance
                    }
                },
                
                // Page 5 data
                careTypeSpecific: {
                    residential: {
                        prudentialStandards: this.residentialPrudentialStandards,
                        financing: this.residentialFinancing,
                        restrictivePractices: this.residentialRestrictivePractices
                    },
                    homeCare: {
                        deliverySystem: this.homeCareDeliverySystem,
                        healthTracking: this.homeCareHealthTracking,
                        choiceFlexibility: this.homeCareChoiceFlexibility,
                        medicationManagement: this.homeCareMedicationManagement
                    },
                    flexibleCare: {
                        description: this.flexibleCareDescription,
                        restorativeCare: this.flexibleCareRestorativeCare,
                        multiDisciplinary: this.flexibleCareMultiDisciplinary
                    }
                }
            };

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showToast('Success', 'Application submitted successfully', 'success');
            this.resetForm();
            
        } catch (error) {
            this.showToast('Error', 'Failed to submit application: ' + error.message, 'error');
        } finally {
            this.isLoading = false;
            this.isSubmitting = false;
        }
    }

    // Utility Methods
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
        this.kp1Title = '';
        this.kp1Name = '';
        this.kp1FormerName = '';
        this.kp1PreferredName = '';
        this.kp1DateOfBirth = '';
        this.kp1PositionTitle = '';
        this.kp1Email = '';
        this.kp1Mobile = '';
        this.kp1Landline = '';
        this.kp1PreferredContact = '';
        this.kp1PrincipalDuties = '';
        this.kp1Qualification1 = '';
        this.kp1Qualification1Date = '';
        this.kp1Experience1Employer = '';
        this.kp1Experience1From = '';
        this.kp1Experience1To = '';
        this.kp1Experience1Description= '';
        this.experienceDescription = '';
        this.informationManagement = '';
        this.continuousImprovement = '';
        this.financialGovernance = '';
        this.workforceGovernance = '';
        this.riskManagement = '';
        this.clinicalGovernance = '';
        this.residentialPrudentialStandards = '';
        this.residentialFinancing = '';
        this.residentialRestrictivePractices = '';
        this.homeCareDeliverySystem = '';
        this.homeCareHealthTracking = '';
        this.homeCareChoiceFlexibility = '';
        this.homeCareMedicationManagement = '';
        this.flexibleCareDescription = '';
        this.flexibleCareRestorativeCare = '';
        this.flexibleCareMultiDisciplinary = '';
        
        // Reset error messages
        this.declarationError = '';
        this.careTypeError = '';
    }
}
