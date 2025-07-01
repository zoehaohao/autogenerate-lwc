import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppForm extends LightningElement {
    @track currentPage = 1;
    @track isLoading = false;
    @track errorMessages = [];
    
    // Form data properties
    @track applicantLegalName = '';
    @track applicantACN = '';
    @track applicantABN = '';
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
    
    // Contact details
    @track primaryContactName = '';
    @track primaryContactPosition = '';
    @track primaryContactPhone = '';
    @track primaryContactMobile = '';
    @track primaryContactBestTime = '';
    @track primaryContactEmail = '';
    @track alternativeContactName = '';
    @track alternativeContactPosition = '';
    @track alternativeContactPhone = '';
    @track alternativeContactMobile = '';
    @track alternativeContactBestTime = '';
    @track alternativeContactEmail = '';
    @track consultantContactName = '';
    @track consultantContactPosition = '';
    @track consultantContactPhone = '';
    @track consultantContactMobile = '';
    @track consultantContactEmail = '';
    @track consultantServices = [];
    @track consultantServicesOther = '';
    
    // Care type and organization
    @track selectedCareTypes = [];
    @track selectedFlexibleCareOptions = [];
    @track selectedOrganisationType = '';
    @track selectedNotForProfitTypes = [];
    @track isOnStockExchange = '';
    
    // Sub-contracting
    @track hasServiceDeliveryAgreement = '';
    @track hasMultipleEntities = '';
    @track numberOfOtherEntities = '';
    @track org1RegisteredName = '';
    @track org1BusinessName = '';
    @track org1ABN = '';
    @track org1ACN = '';
    @track org1ContractStartDate = '';
    @track org1ContractEndDate = '';
    @track org1ContactName = '';
    @track org1ContactPhone = '';
    @track org1ContactEmail = '';
    @track org1PhysicalAddress = '';
    @track org1PostalAddress = '';
    @track org2RegisteredName = '';
    @track org2BusinessName = '';
    @track org2ABN = '';
    @track org2ACN = '';
    @track org2ContractStartDate = '';
    @track org2ContractEndDate = '';
    @track org2ContactName = '';
    @track org2ContactPhone = '';
    @track org2ContactEmail = '';
    @track org2PhysicalAddress = '';
    @track org2PostalAddress = '';
    @track org1NAPSId = '';
    @track org2NAPSId = '';
    @track org1Role = '';
    @track org2Role = '';
    @track org1ManagementDecisions = '';
    @track org2ManagementDecisions = '';
    @track org1OutsourcedServices = '';
    @track org2OutsourcedServices = '';
    @track org1Experience = '';
    @track org2Experience = '';
    @track org1OversightProcesses = '';
    @track org2OversightProcesses = '';
    @track oversightResponsibility = '';
    @track complianceSteps = '';
    
    // Corporate structure and governance
    @track organisationStartDetails = '';
    @track corporateStructureDetails = '';
    @track businessModelDetails = '';
    @track hasGoverningBody = '';
    @track governingBodySteps = '';
    @track governanceMethodology = '';
    @track hasManagementCommittees = '';
    @track committeeDetails = '';
    @track isPartOfFranchise = '';
    @track franchiseRelationship = '';
    @track franchiseLegalImplications = '';
    @track franchisePoliciesArrangements = '';
    
    // Key personnel declaration
    @track officer1Name = '';
    @track officer1Signature = '';
    @track officer1Position = '';
    @track officer1Date = '';
    @track officer2Name = '';
    @track officer2Signature = '';
    @track officer2Position = '';
    @track officer2Date = '';
    
    // Checklist items
    @track checklistKeyPersonnelDeclaration = false;
    @track section1ChecklistValues = [];
    @track section2ChecklistValues = [];
    @track section3ChecklistValues = [];
    @track homeCareChecklistValues = [];
    @track flexibleCareChecklistValues = [];
    @track otherSupportingDocuments = '';

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

    get isPage6() {
        return this.currentPage === 6;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === 6;
    }

    get hasErrors() {
        return this.errorMessages.length > 0;
    }

    get showFlexibleCareOptions() {
        return this.selectedCareTypes.includes('flexible-care');
    }

    get showNotForProfitOptions() {
        return this.selectedOrganisationType === 'not-for-profit';
    }

    get showSubcontractingDetails() {
        return this.hasServiceDeliveryAgreement === 'yes';
    }

    get showMultipleEntitiesInput() {
        return this.hasMultipleEntities === 'yes';
    }

    get showCommitteeDetails() {
        return this.hasManagementCommittees === 'yes';
    }

    get showFranchiseDetails() {
        return this.isPartOfFranchise === 'yes';
    }

    // Options for various fields
    get consultantServicesOptions() {
        return [
            { label: 'Completed this form', value: 'completed-form' },
            { label: 'Developed our policies and procedures', value: 'developed-policies' },
            { label: 'Provided advice', value: 'provided-advice' },
            { label: 'Other', value: 'other' }
        ];
    }

    get careTypeOptions() {
        return [
            { label: 'Residential Care - complete Section 4.1', value: 'residential-care' },
            { label: 'Home Care - complete Section 4.2', value: 'home-care' },
            { label: 'Flexible Care - complete Section 4.3', value: 'flexible-care' }
        ];
    }

    get flexibleCareOptions() {
        return [
            { label: 'in a residential care setting', value: 'residential-setting' },
            { label: 'in a home care setting', value: 'home-care-setting' }
        ];
    }

    get organisationTypeOptions() {
        return [
            { label: 'For Profit', value: 'for-profit' },
            { label: 'Not-For-Profit', value: 'not-for-profit' }
        ];
    }

    get notForProfitOptions() {
        return [
            { label: 'Religious', value: 'religious' },
            { label: 'Community Based', value: 'community-based' },
            { label: 'Charitable', value: 'charitable' }
        ];
    }

    get stockExchangeOptions() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
        ];
    }

    get serviceDeliveryAgreementOptions() {
        return [
            { label: 'Yes – enter details below', value: 'yes' },
            { label: 'No – go to Section 2', value: 'no' }
        ];
    }

    get multipleEntitiesOptions() {
        return [
            { label: 'No', value: 'no' },
            { label: 'Yes – in the box below, tell us how many other entities you have agreements with', value: 'yes' }
        ];
    }

    get governingBodyOptions() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
        ];
    }

    get managementCommitteesOptions() {
        return [
            { label: 'Yes – complete question i below', value: 'yes' },
            { label: 'No - go to d)', value: 'no' }
        ];
    }

    get franchiseOptions() {
        return [
            { label: 'Yes – complete questions i, ii and iii below', value: 'yes' },
            { label: 'No - go to 1.7', value: 'no' }
        ];
    }

    get section1ChecklistOptions() {
        return [
            { label: 'Certificate of Registration (1.1)', value: 'certificate-registration' },
            { label: 'Trust Deed, if applicable (1.1)', value: 'trust-deed' },
            { label: 'Organisation Chart and/or corporate structure (1.6)', value: 'org-chart' },
            { label: 'Business Plan (1.6)', value: 'business-plan' },
            { label: 'Australian Charities and Not-for-profits Commission (ACNC) documents (1.7)', value: 'acnc-documents' },
            { label: 'Service or Management Agreement with another organisation, if applicable (1.7)', value: 'service-agreement' }
        ];
    }

    get section2ChecklistOptions() {
        return [
            { label: 'National Police Certificate and/or National Criminal History Check or NDIS worker screening clearance for each key personnel listed, that is dated no more than 90 days before the date this application is submitted (2.1)', value: 'police-certificate' },
            { label: 'Statutory declaration form for each individual key personnel, if applicable (2.2)', value: 'statutory-declaration' },
            { label: 'Insolvency check for each key personnel (2.3)', value: 'insolvency-check' },
            { label: 'Australian Health Practitioner Regulation Agency (AHPRA) certificates, if applicable (2.4)', value: 'ahpra-certificates' },
            { label: 'Chartered accountant certificate or registration details, if applicable (2.4)', value: 'accountant-certificate' },
            { label: 'Additional 'Key Personnel Individual Details' attached to the application form, if more than four key personnel (2.4)', value: 'additional-personnel-details' }
        ];
    }

    get section3ChecklistOptions() {
        return [
            { label: 'Copy of quality audit assessment if undertaken (3.1.2)', value: 'quality-audit' },
            { label: 'Audited financial statements for the last two years, if applicable (3.3.2)', value: 'financial-statements' },
            { label: 'Evidence of financial capacity (3.3.2)', value: 'financial-capacity' }
        ];
    }

    get homeCareChecklistOptions() {
        return [
            { label: 'Individualised budget template', value: 'budget-template' },
            { label: 'Care agreement template', value: 'care-agreement' },
            { label: 'Care recipient handbook (if this forms part of your approach to the provision of information to care recipients)', value: 'care-handbook' },
            { label: 'Monthly statement template', value: 'monthly-statement' },
            { label: 'Care plan template – that you intend to use for care planning and care delivery', value: 'care-plan' },
            { label: 'Pricing schedule', value: 'pricing-schedule' }
        ];
    }

    get flexibleCareChecklistOptions() {
        return [
            { label: 'Individualised budget template', value: 'budget-template' },
            { label: 'Care agreement template', value: 'care-agreement' },
            { label: 'Care plan template - that you intend to use for care planning and care delivery', value: 'care-plan' }
        ];
    }

    // Event handlers
    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        this[field] = value;
        this.clearFieldError(field);
    }

    handlePostalSameAsRegistered(event) {
        this.postalSameAsRegistered = event.target.checked;
        if (this.postalSameAsRegistered) {
            this.postalStreetAddress = this.registeredStreetAddress;
            this.postalSuburb = this.registeredSuburb;
            this.postalState = this.registeredState;
            this.postalPostcode = this.registeredPostcode;
        }
    }

    handleConsultantServicesChange(event) {
        this.consultantServices = event.detail.value;
    }

    handleCareTypeChange(event) {
        this.selectedCareTypes = event.detail.value;
    }

    handleFlexibleCareChange(event) {
        this.selectedFlexibleCareOptions = event.detail.value;
    }

    handleOrganisationTypeChange(event) {
        this.selectedOrganisationType = event.detail.value;
    }

    handleNotForProfitChange(event) {
        this.selectedNotForProfitTypes = event.detail.value;
    }

    handleStockExchangeChange(event) {
        this.isOnStockExchange = event.detail.value;
    }

    handleServiceDeliveryAgreementChange(event) {
        this.hasServiceDeliveryAgreement = event.detail.value;
    }

    handleMultipleEntitiesChange(event) {
        this.hasMultipleEntities = event.detail.value;
    }

    handleGoverningBodyChange(event) {
        this.hasGoverningBody = event.detail.value;
    }

    handleManagementCommitteesChange(event) {
        this.hasManagementCommittees = event.detail.value;
    }

    handleFranchiseChange(event) {
        this.isPartOfFranchise = event.detail.value;
    }

    handleChecklistChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.checked;
    }

    handleSection1ChecklistChange(event) {
        this.section1ChecklistValues = event.detail.value;
    }

    handleSection2ChecklistChange(event) {
        this.section2ChecklistValues = event.detail.value;
    }

    handleSection3ChecklistChange(event) {
        this.section3ChecklistValues = event.detail.value;
    }

    handleHomeCareChecklistChange(event) {
        this.homeCareChecklistValues = event.detail.value;
    }

    handleFlexibleCareChecklistChange(event) {
        this.flexibleCareChecklistValues = event.detail.value;
    }

    // Navigation handlers
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

    handleSaveDraft() {
        this.isLoading = true;
        // Simulate save operation
        setTimeout(() => {
            this.isLoading = false;
            this.showToast('Success', 'Draft saved successfully', 'success');
        }, 1000);
    }

    handleSubmit() {
        if (this.validateAllPages()) {
            this.isLoading = true;
            // Simulate submission
            setTimeout(() => {
                this.isLoading = false;
                this.showToast('Success', 'Application submitted successfully', 'success');
            }, 2000);
        }
    }

    handleCancel() {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            // Reset form or navigate away
            this.resetForm();
        }
    }

    // Validation methods
    validateCurrentPage() {
        this.errorMessages = [];
        let isValid = true;

        switch (this.currentPage) {
            case 1:
                // No validation needed for introduction page
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
            case 6:
                isValid = this.validatePage6();
                break;
        }

        return isValid;
    }

    validatePage2() {
        let isValid = true;
        
        if (!this.applicantLegalName) {
            this.errorMessages.push('Applicant Legal Name is required');
            isValid = false;
        }
        
        if (!this.registeredStreetAddress) {
            this.errorMessages.push('Registered Street Address is required');
            isValid = false;
        }
        
        if (!this.registeredSuburb) {
            this.errorMessages.push('Registered Suburb is required');
            isValid = false;
        }
        
        if (!this.registeredState) {
            this.errorMessages.push('Registered State is required');
            isValid = false;
        }
        
        if (!this.registeredPostcode) {
            this.errorMessages.push('Registered Postcode is required');
            isValid = false;
        }
        
        if (!this.primaryContactName) {
            this.errorMessages.push('Primary Contact Name is required');
            isValid = false;
        }
        
        if (!this.primaryContactPosition) {
            this.errorMessages.push('Primary Contact Position is required');
            isValid = false;
        }
        
        if (!this.primaryContactPhone) {
            this.errorMessages.push('Primary Contact Phone is required');
            isValid = false;
        }
        
        if (!this.primaryContactEmail) {
            this.errorMessages.push('Primary ContactEmail is required');
            isValid = false;
        }
        
        if (this.primaryContactEmail && !this.validateEmail(this.primaryContactEmail)) {
            this.errorMessages.push('Primary Contact Email must be valid');
            isValid = false;
        }
        
        return isValid;
    }

    validatePage3() {
        let isValid = true;
        
        if (this.selectedCareTypes.length === 0) {
            this.errorMessages.push('At least one care type must be selected');
            isValid = false;
        }
        
        if (!this.selectedOrganisationType) {
            this.errorMessages.push('Organisation type must be selected');
            isValid = false;
        }
        
        if (!this.isOnStockExchange) {
            this.errorMessages.push('Stock exchange listing status must be specified');
            isValid = false;
        }
        
        if (!this.hasServiceDeliveryAgreement) {
            this.errorMessages.push('Service delivery agreement status must be specified');
            isValid = false;
        }
        
        return isValid;
    }

    validatePage4() {
        let isValid = true;
        
        if (!this.organisationStartDetails) {
            this.errorMessages.push('Organisation start details are required');
            isValid = false;
        }
        
        if (!this.corporateStructureDetails) {
            this.errorMessages.push('Corporate structure details are required');
            isValid = false;
        }
        
        if (!this.businessModelDetails) {
            this.errorMessages.push('Business model details are required');
            isValid = false;
        }
        
        if (!this.hasGoverningBody) {
            this.errorMessages.push('Governing body status must be specified');
            isValid = false;
        }
        
        if (!this.governanceMethodology) {
            this.errorMessages.push('Governance methodology is required');
            isValid = false;
        }
        
        return isValid;
    }

    validatePage5() {
        let isValid = true;
        
        if (!this.officer1Name) {
            this.errorMessages.push('Declaring Officer 1 Name is required');
            isValid = false;
        }
        
        if (!this.officer1Signature) {
            this.errorMessages.push('Declaring Officer 1 Signature is required');
            isValid = false;
        }
        
        if (!this.officer1Position) {
            this.errorMessages.push('Declaring Officer 1 Position is required');
            isValid = false;
        }
        
        if (!this.officer1Date) {
            this.errorMessages.push('Declaring Officer 1 Date is required');
            isValid = false;
        }
        
        return isValid;
    }

    validatePage6() {
        let isValid = true;
        
        if (!this.checklistKeyPersonnelDeclaration) {
            this.errorMessages.push('Key Personnel Declaration must be checked');
            isValid = false;
        }
        
        if (this.section1ChecklistValues.length === 0) {
            this.errorMessages.push('At least one Section 1 checklist item must be selected');
            isValid = false;
        }
        
        return isValid;
    }

    validateAllPages() {
        let isValid = true;
        this.errorMessages = [];
        
        for (let page = 2; page <= 6; page++) {
            this.currentPage = page;
            if (!this.validateCurrentPage()) {
                isValid = false;
            }
        }
        
        this.currentPage = 6; // Stay on last page for submission
        return isValid;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    validateRequiredField(fieldName, fieldValue, fieldLabel) {
        if (!fieldValue || fieldValue.trim() === '') {
            return {
                isValid: false,
                errorMessage: `${fieldLabel} is required`
            };
        }
        return { isValid: true };
    }

    // Utility methods
    clearFieldError(fieldName) {
        this.errorMessages = this.errorMessages.filter(error => 
            !error.includes(fieldName)
        );
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
        // Reset all form fields to initial state
        this.currentPage = 1;
        this.applicantLegalName = '';
        this.applicantACN = '';
        this.applicantABN = '';
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
        this.primaryContactName = '';
        this.primaryContactPosition = '';
        this.primaryContactPhone = '';
        this.primaryContactMobile = '';
        this.primaryContactBestTime = '';
        this.primaryContactEmail = '';
        this.alternativeContactName = '';
        this.alternativeContactPosition = '';
        this.alternativeContactPhone = '';
        this.alternativeContactMobile = '';
        this.alternativeContactBestTime = '';
        this.alternativeContactEmail = '';
        this.consultantContactName = '';
        this.consultantContactPosition = '';
        this.consultantContactPhone = '';
        this.consultantContactMobile = '';
        this.consultantContactEmail = '';
        this.consultantServices = [];
        this.consultantServicesOther = '';
        this.selectedCareTypes = [];
        this.selectedFlexibleCareOptions = [];
        this.selectedOrganisationType = '';
        this.selectedNotForProfitTypes = [];
        this.isOnStockExchange = '';
        this.hasServiceDeliveryAgreement = '';
        this.hasMultipleEntities = '';
        this.numberOfOtherEntities = '';
        this.errorMessages = [];
    }

    // Lifecycle methods
    connectedCallback() {
        // Initialize component
        this.currentPage = 1;
    }

    disconnectedCallback() {
        // Cleanup if needed
    }
}
