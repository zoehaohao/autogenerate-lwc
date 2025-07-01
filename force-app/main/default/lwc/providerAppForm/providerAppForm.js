import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ProviderAppForm extends LightningElement {
    @track currentPage = 1;
    @track totalPages = 5;
    @track isLoading = false;
    @track validationErrors = [];

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
    @track sameAsRegistered = false;
    @track postalStreetAddress = '';
    @track postalSuburb = '';
    @track postalState = '';
    @track postalPostcode = '';
    @track selectedCareTypes = [];
    @track organisationType = '';
    @track notForProfitType = '';
    @track listedOnStockExchange = '';

    // Page 3: Key Personnel Details
    @track kp1Title = '';
    @track kp1Name = '';
    @track kp1FormerName = '';
    @track kp1PreferredName = '';
    @track kp1DateOfBirth = '';
    @track kp1PositionTitle = '';
    @track kp1Email = '';
    @track kp1Mobile = '';
    @track kp1PrincipalDuties = '';
    @track kp1Qualification1 = '';
    @track kp1Qual1DateObtained = '';
    @track kp1Qual1DateStarted = '';
    @track kp1Employer1 = '';
    @track kp1Emp1From = '';
    @track kp1Emp1To = '';
    @track kp1Emp1Role = '';
    @track kp1Attachments = [];
    @track kp2Title = '';
    @track kp2Name = '';
    @track kp2Email = '';
    @track kp2PositionTitle = '';

    // Page 4: Suitability Assessment
    @track organisationExperience = '';
    @track informationManagement = '';
    @track continuousImprovement = '';
    @track financialGovernance = '';
    @track workforceGovernance = '';
    @track riskManagement = '';
    @track clinicalGovernance = '';
    @track financialManagementPolicies = '';
    @track financialStrategy = '';
    @track providerResponsibilities = '';
    @track qualityOfCarePrinciples = '';
    @track staffingRequirements = '';
    @track incidentManagement = '';

    // Page 5: Care Type Specific
    @track prudentialStandards = '';
    @track facilityFinancing = '';
    @track restrictivePractices = '';
    @track homeCareDelivery = '';
    @track healthStatusCapture = '';
    @track homeCareSystems = '';
    @track medicationManagement = '';
    @track careChoiceFlexibility = '';
    @track packagePortability = '';
    @track flexibleCareExperience = '';
    @track restorativeCare = '';
    @track multiDisciplinaryTeams = '';

    get currentPageString() {
        return this.currentPage.toString();
    }

    get showPage1() {
        return this.currentPage === 1;
    }

    get showPage2() {
        return this.currentPage === 2;
    }

    get showPage3() {
        return this.currentPage === 3;
    }

    get showPage4() {
        return this.currentPage === 4;
    }

    get showPage5() {
        return this.currentPage === 5;
    }

    get isPreviousDisabled() {
        return this.currentPage === 1;
    }

    get isNextDisabled() {
        return this.currentPage === this.totalPages;
    }

    get isSubmitDisabled() {
        return this.currentPage !== this.totalPages || !this.isAllPagesValid();
    }

    get hasValidationErrors() {
        return this.validationErrors.length > 0;
    }

    get showNotForProfitOptions() {
        return this.organisationType === 'Not-For-Profit';
    }

    get showResidentialCare() {
        return this.selectedCareTypes.includes('Residential Care');}

    get showHomeCare() {
        return this.selectedCareTypes.includes('Home Care');
    }

    get showFlexibleCare() {
        return this.selectedCareTypes.includes('Flexible Care');
    }

    get declarationOptions() {
        return [
            { label: 'I am aware that approval may be revoked if application contains false or misleading information', value: 'revocation' },
            { label: 'I understand that providing false or misleading information is a serious offence', value: 'offence' },
            { label: 'I have provided true and accurate information in this application form', value: 'accurate' },
            { label: 'I understand that the application must be signed by persons lawfully authorised', value: 'authorised' },
            { label: 'I consent to the Commissioner obtaining information from other organisations', value: 'consent' },
            { label: 'I understand that information may be disclosed where permitted by law', value: 'disclosure' },
            { label: 'I understand the corporation name will be used in communications', value: 'corporation' },
            { label: 'I declare that all key personnel are suitable to be involved in aged care provision', value: 'personnel' },
            { label: 'I have read the Aged Care Approved Provider Applicant Guide', value: 'guide' },
            { label: 'I understand the Commission will examine its records', value: 'records' },
            { label: 'I understand responsibility for application contents if using consultants', value: 'consultant' }
        ];
    }

    get stateOptions() {
        return [
            { label: 'NSW', value: 'NSW' },
            { label: 'VIC', value: 'VIC' },
            { label: 'QLD', value: 'QLD' },
            { label: 'WA', value: 'WA' },
            { label: 'SA', value: 'SA' },
            { label: 'TAS', value: 'TAS' },
            { label: 'ACT', value: 'ACT' },
            { label: 'NT', value: 'NT' }
        ];
    }

    get careTypeOptions() {
        return [
            { label: 'Residential Care', value: 'Residential Care' },
            { label: 'Home Care', value: 'Home Care' },
            { label: 'Flexible Care', value: 'Flexible Care' }
        ];
    }

    get organisationTypeOptions() {
        return [
            { label: 'For Profit', value: 'For Profit' },
            { label: 'Not-For-Profit', value: 'Not-For-Profit' }
        ];
    }

    get notForProfitOptions() {
        return [
            { label: 'Religious', value: 'Religious' },
            { label: 'Community Based', value: 'Community Based' },
            { label: 'Charitable', value: 'Charitable' }
        ];
    }

    get yesNoOptions() {
        return [
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
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

    get requiredAttachmentsOptions() {
        return [
            { label: 'National Police Certificate or NCHC or NDIS worker screening check', value: 'police' },
            { label: 'Insolvency check', value: 'insolvency' },
            { label: 'Statutory declaration', value: 'statutory' }
        ];
    }

    handleFieldChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        this[field] = value;
        this.clearFieldError(field);
    }

    handleDeclarationChange(event) {
        this.selectedDeclarations = event.detail.value;
    }

    handleCareTypeChange(event) {
        this.selectedCareTypes = event.detail.value;
    }

    handleKP1AttachmentsChange(event) {
        this.kp1Attachments = event.detail.value;
    }

    handleSameAsRegisteredChange(event) {
        this.sameAsRegistered = event.target.checked;
        if (this.sameAsRegistered) {
            this.postalStreetAddress = this.registeredStreetAddress;
            this.postalSuburb = this.registeredSuburb;
            this.postalState = this.registeredState;
            this.postalPostcode = this.registeredPostcode;
        } else {
            this.postalStreetAddress = '';
            this.postalSuburb = '';
            this.postalState = '';
            this.postalPostcode = '';
        }
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.clearValidationErrors();
        }
    }

    handleNext() {
        if (this.validateCurrentPage()) {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.clearValidationErrors();
            }
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

    validateCurrentPage() {
        this.clearValidationErrors();
        let isValid = true;
        const errors = [];

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
            this.validationErrors = errors;
        }

        return isValid;
    }

    validatePage1(errors) {
        let isValid = true;

        if (this.selectedDeclarations.length < 11) {
            errors.push('All declarations must be acknowledged');
            isValid = false;
        }

        if (!this.officer1Name) {
            errors.push('Declaring Officer 1 Name is required');
            isValid = false;
        }

        if (!this.officer1Position) {
            errors.push('Declaring Officer 1 Position is required');
            isValid = false;
        }

        if (!this.officer1Date) {
            errors.push('Declaring Officer 1 Date is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage2(errors) {
        let isValid = true;

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

        if (!this.registeredStreetAddress) {
            errors.push('Registered street address is required');
            isValid = false;
        }

        if (!this.registeredSuburb) {
            errors.push('Registered suburb is required');
            isValid = false;
        }

        if (!this.registeredState) {
            errors.push('Registered state is required');
            isValid = false;
        }

        if (!this.registeredPostcode) {
            errors.push('Registered postcode is required');
            isValid = false;
        }

        if (this.selectedCareTypes.length === 0) {
            errors.push('At least one care type must be selected');
            isValid = false;
        }

        if (!this.organisationType) {
            errors.push('Organisation type is required');
            isValid = false;
        }

        if (!this.listedOnStockExchange) {
            errors.push('Stock exchange listing status is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage3(errors) {
        let isValid = true;

        if (!this.kp1Name) {
            errors.push('Key Personnel 1 Name is required');
            isValid = false;
        }

        if (!this.kp1DateOfBirth) {
            errors.push('Key Personnel 1 Date of Birth is required');
            isValid = false;
        }

        if (!this.kp1PositionTitle) {
            errors.push('Key Personnel 1 Position Title is required');
            isValid = false;
        }

        if (!this.kp1Email) {
            errors.push('Key Personnel 1 Email is required');
            isValid = false;
        } else if (!this.validateEmail(this.kp1Email)) {
            errors.push('Key Personnel 1 Email format is invalid');
            isValid = false;
        }

        if (!this.kp1Mobile) {
            errors.push('Key Personnel 1 Mobile is required');
            isValid = false;
        }

        if (!this.kp1PrincipalDuties) {
            errors.push('Key Personnel 1 Principal Duties are required');
            isValid = false;
        }

        return isValid;
    }

    validatePage4(errors) {
        let isValid = true;

        if (!this.organisationExperience) {
            errors.push('Organisation experience description is required');
            isValid = false;
        }

        if (!this.informationManagement) {
            errors.push('Information management description is required');
            isValid = false;
        }

        if (!this.continuousImprovement) {
            errors.push('Continuous improvement description is required');
            isValid = false;
        }

        if (!this.financialGovernance) {
            errors.push('Financial governance description is required');
            isValid = false;
        }

        if (!this.workforceGovernance) {
            errors.push('Workforce governance description is required');
            isValid = false;
        }

        if (!this.riskManagement) {
            errors.push('Risk management description is required');
            isValid = false;
        }

        if (!this.clinicalGovernance) {
            errors.push('Clinical governance description is required');
            isValid = false;
        }

        if (!this.financialManagementPolicies) {
            errors.push('Financial management policies description is required');
            isValid = false;
        }

        if (!this.financialStrategy) {
            errors.push('Financial strategy description is required');
            isValid = false;
        }

        if (!this.providerResponsibilities) {
            errors.push('Provider responsibilities description is required');
            isValid = false;
        }

        if (!this.qualityOfCarePrinciples) {
            errors.push('Quality of Care Principles description is required');
            isValid = false;
        }

        if (!this.staffingRequirements) {
            errors.push('Staffing requirements description is required');
            isValid = false;
        }

        if (!this.incidentManagement) {
            errors.push('Incident management description is required');
            isValid = false;
        }

        return isValid;
    }

    validatePage5(errors) {
        let isValid = true;

        if (this.showResidentialCare) {
            if (!this.prudentialStandards) {
                errors.push('Prudential Standards description is required for Residential Care');
                isValid = false;
            }
            if (!this.facilityFinancing) {
                errors.push('Facility financing description is required for Residential Care');
                isValid = false;
            }
            if (!this.restrictivePractices) {
                errors.push('Restrictive practices description is required for Residential Care');
                isValid = false;
            }
        }

        if (this.showHomeCare) {
            if (!this.homeCareDelivery) {
                errors.push('Home care delivery description is required for Home Care');
                isValid = false;
            }
            if (!this.healthStatusCapture) {
                errors.push('Health status capture description is required for Home Care');
                isValid = false;
            }
            if (!this.homeCareSystems) {
                errors.push('Home care systems description is required for Home Care');
                isValid = false;
            }
            if (!this.medicationManagement) {
                errors.push('Medication management description is required for Home Care');
                isValid = false;
            }
            if (!this.careChoiceFlexibility) {
                errors.push('Care choice and flexibility description is required for Home Care');
                isValid = false;
            }
            if (!this.packagePortability) {
                errors.push('Package portability description is required for Home Care');
                isValid = false;
            }
        }

        if (this.showFlexibleCare) {
            if (!this.flexibleCareExperience) {
                errors.push('Flexible care experience description is required for Flexible Care');
                isValid = false;
            }
            if (!this.restorativeCare) {
                errors.push('Restorative care description is required for Flexible Care');
                isValid = false;
            }
            if (!this.multiDisciplinaryTeams) {
                errors.push('Multi-disciplinary teams description is required for Flexible Care');
                isValid = false;
            }
        }

        return isValid;
    }

    validateAllPages() {
        for (let page = 1; page <= this.totalPages; page++) {
            this.currentPage = page;
            if (!this.validateCurrentPage()) {
                return false;
            }
        }
        return true;
    }

    isAllPagesValid() {
        // This would typically check if all required fields across all pages are filled
        // For now, return true if we're on the last page
        return this.currentPage === this.totalPages;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    clearValidationErrors() {
        this.validationErrors = [];
    }

    clearFieldError(fieldName) {
        this.validationErrors = this.validationErrors.filter(error => 
            !error.toLowerCase().includes(fieldName.toLowerCase())
        );
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
